import os
import uuid
import json
from datetime import datetime, timezone
from typing import Optional
import requests
from openai import OpenAI


class WindTunnel:
    def __init__(self, api_key: str, supabase_url: str, supabase_key: str):
        self.api_key = api_key
        self.supabase_url = supabase_url.rstrip('/')
        self.supabase_key = supabase_key
        self.project_id = None
        self._headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        self._ensure_project()

    def _ensure_project(self):
        """Find or create the project associated with this API key."""
        # Try to find existing project
        resp = requests.get(
            f'{self.supabase_url}/rest/v1/projects',
            headers={**self._headers, 'Prefer': ''},
            params={'api_key': f'eq.{self.api_key}'}
        )
        data = resp.json()
        if resp.status_code == 200 and data:
            self.project_id = data[0]['id']
            print(f"[WindTunnel] Using existing project: {self.project_id}")
        else:
            # Create a new project
            create_resp = requests.post(
                f'{self.supabase_url}/rest/v1/projects',
                headers=self._headers,
                json={
                    'name': 'Demo Agent',
                    'description': 'WindTunnel demo project',
                    'api_key': self.api_key
                }
            )
            if create_resp.status_code in (200, 201):
                project_data = create_resp.json()
                if isinstance(project_data, list):
                    self.project_id = project_data[0]['id']
                else:
                    self.project_id = project_data['id']
                print(f"[WindTunnel] Created new project: {self.project_id}")
            else:
                raise RuntimeError(
                    f"Failed to create project: {create_resp.status_code} {create_resp.text}"
                )

    def record(
        self,
        user_input: str,
        agent_output: str,
        prompt_version: str = 'v1',
        model: str = 'gpt-4o-mini',
        metadata: dict = None,
        session_id: str = None
    ) -> dict:
        """Record a production interaction to Supabase."""
        if metadata is None:
            metadata = {}

        payload = {
            'project_id': self.project_id,
            'session_id': session_id or str(uuid.uuid4()),
            'user_input': user_input,
            'agent_output': agent_output,
            'prompt_version': prompt_version,
            'model': model,
            'metadata': metadata
        }

        resp = requests.post(
            f'{self.supabase_url}/rest/v1/interactions',
            headers=self._headers,
            json=payload
        )

        if resp.status_code in (200, 201):
            result = resp.json()
            if isinstance(result, list):
                return result[0]
            return result
        else:
            raise RuntimeError(
                f"Failed to record interaction: {resp.status_code} {resp.text}"
            )

    def run_windtunnel(
        self,
        baseline_prompt: str,
        challenger_prompt: str,
        n_interactions: int = 10,
        baseline_model: str = 'gpt-4o-mini',
        challenger_model: str = 'gpt-4o-mini',
        run_name: str = None,
        baseline_version: str = 'v1',
        challenger_version: str = 'v2',
        openai_api_key: str = None
    ) -> dict:
        """
        Fetch last N interactions, replay through both prompts, score with LLM-as-judge.
        Returns a verdict dict with results.
        """
        if openai_api_key is None:
            openai_api_key = os.environ.get('OPENAI_API_KEY')
        if not openai_api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY env var.")

        openai_client = OpenAI(api_key=openai_api_key)

        # 1. Fetch last N interactions for this project
        print(f"\n[WindTunnel] Fetching last {n_interactions} interactions...")
        resp = requests.get(
            f'{self.supabase_url}/rest/v1/interactions',
            headers={**self._headers, 'Prefer': ''},
            params={
                'project_id': f'eq.{self.project_id}',
                'order': 'created_at.desc',
                'limit': n_interactions
            }
        )

        if resp.status_code != 200:
            raise RuntimeError(f"Failed to fetch interactions: {resp.status_code} {resp.text}")

        interactions = resp.json()
        if not interactions:
            raise ValueError("No interactions found. Record some interactions first.")

        print(f"[WindTunnel] Found {len(interactions)} interactions to test")

        # 2. Create a run record
        run_resp = requests.post(
            f'{self.supabase_url}/rest/v1/runs',
            headers=self._headers,
            json={
                'project_id': self.project_id,
                'name': run_name or f'Windtunnel Run {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")}',
                'baseline_version': baseline_version,
                'challenger_version': challenger_version,
                'baseline_prompt': baseline_prompt,
                'challenger_prompt': challenger_prompt,
                'baseline_model': baseline_model,
                'challenger_model': challenger_model,
                'status': 'running',
                'total_interactions': len(interactions)
            }
        )

        if run_resp.status_code not in (200, 201):
            raise RuntimeError(f"Failed to create run: {run_resp.status_code} {run_resp.text}")

        run_data = run_resp.json()
        if isinstance(run_data, list):
            run_data = run_data[0]
        run_id = run_data['id']
        print(f"[WindTunnel] Created run: {run_id}")

        # 3. Replay each interaction through both prompts
        results = []
        better_count = 0
        worse_count = 0
        neutral_count = 0

        for i, interaction in enumerate(interactions):
            user_input = interaction['user_input']
            print(f"\n[WindTunnel] Testing interaction {i+1}/{len(interactions)}")
            print(f"  User: {user_input[:60]}...")

            # Get baseline response
            baseline_output = self._get_llm_response(
                openai_client, baseline_prompt, user_input, baseline_model
            )
            print(f"  Baseline: {baseline_output[:60]}...")

            # Get challenger response
            challenger_output = self._get_llm_response(
                openai_client, challenger_prompt, user_input, challenger_model
            )
            print(f"  Challenger: {challenger_output[:60]}...")

            # Score with LLM-as-judge
            score, reasoning = self._judge_responses(
                openai_client, user_input, baseline_output, challenger_output
            )
            print(f"  Score: {score} | {reasoning[:80]}...")

            if score == 'better':
                better_count += 1
            elif score == 'worse':
                worse_count += 1
            else:
                neutral_count += 1

            # Save result
            result_resp = requests.post(
                f'{self.supabase_url}/rest/v1/run_results',
                headers=self._headers,
                json={
                    'run_id': run_id,
                    'interaction_id': interaction['id'],
                    'user_input': user_input,
                    'baseline_output': baseline_output,
                    'challenger_output': challenger_output,
                    'score': score,
                    'reasoning': reasoning
                }
            )
            if result_resp.status_code not in (200, 201):
                print(f"  Warning: Failed to save result: {result_resp.text}")
            else:
                results.append({
                    'user_input': user_input,
                    'baseline_output': baseline_output,
                    'challenger_output': challenger_output,
                    'score': score,
                    'reasoning': reasoning
                })

        # 4. Calculate verdict
        total = len(interactions)
        regression_rate = worse_count / total if total > 0 else 0
        improvement_rate = better_count / total if total > 0 else 0

        if regression_rate >= 0.3:
            verdict = 'BLOCKED'
            verdict_text = f'DEPLOY BLOCKED - {worse_count}/{total} interactions regressed'
        elif improvement_rate > regression_rate:
            verdict = 'APPROVED'
            verdict_text = f'DEPLOY APPROVED - {better_count}/{total} interactions improved'
        else:
            verdict = 'NEUTRAL'
            verdict_text = f'DEPLOY NEUTRAL - No significant change ({neutral_count}/{total} neutral)'

        # 5. Update run with final results
        update_resp = requests.patch(
            f'{self.supabase_url}/rest/v1/runs',
            headers={**self._headers, 'Prefer': 'return=representation'},
            params={'id': f'eq.{run_id}'},
            json={
                'status': 'completed',
                'passed': better_count,
                'failed': worse_count,
                'neutral': neutral_count,
                'verdict': verdict,
                'completed_at': datetime.now(timezone.utc).isoformat()
            }
        )

        return {
            'run_id': run_id,
            'verdict': verdict,
            'verdict_text': verdict_text,
            'total': total,
            'better': better_count,
            'worse': worse_count,
            'neutral': neutral_count,
            'regression_rate': regression_rate,
            'results': results
        }

    def _get_llm_response(
        self, client: OpenAI, system_prompt: str, user_input: str, model: str
    ) -> str:
        """Get a response from an LLM with the given system prompt."""
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_input}
                ],
                max_tokens=500,
                temperature=0.1
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"[Error getting response: {e}]"

    def _judge_responses(
        self,
        client: OpenAI,
        user_input: str,
        baseline_output: str,
        challenger_output: str
    ) -> tuple[str, str]:
        """Use LLM-as-judge to compare baseline vs challenger responses."""
        judge_prompt = """You are an expert evaluator for customer support AI responses.

Compare two AI responses to the same user message and determine which is better.

User Message:
{user_input}

Response A (Baseline):
{baseline_output}

Response B (Challenger):
{challenger_output}

Evaluate based on:
1. Helpfulness - Does it actually solve the user's problem?
2. Accuracy - Is the information correct and specific?
3. Empathy - Is the tone appropriate and empathetic?
4. Completeness - Does it address all aspects of the query?
5. Clarity - Is it easy to understand?

Respond with a JSON object in this exact format:
{{
  "score": "better" | "worse" | "neutral",
  "reasoning": "Brief explanation of why (1-2 sentences)"
}}

Where:
- "better" = Response B (Challenger) is better than Response A (Baseline)
- "worse" = Response B (Challenger) is worse than Response A (Baseline)
- "neutral" = Both responses are roughly equal in quality

Return ONLY the JSON, no other text."""

        try:
            response = client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[
                    {
                        'role': 'user',
                        'content': judge_prompt.format(
                            user_input=user_input,
                            baseline_output=baseline_output,
                            challenger_output=challenger_output
                        )
                    }
                ],
                max_tokens=200,
                temperature=0.0,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content.strip()
            result = json.loads(content)
            score = result.get('score', 'neutral')
            reasoning = result.get('reasoning', 'No reasoning provided')

            if score not in ('better', 'worse', 'neutral'):
                score = 'neutral'

            return score, reasoning

        except Exception as e:
            return 'neutral', f'Judge error: {str(e)}'
