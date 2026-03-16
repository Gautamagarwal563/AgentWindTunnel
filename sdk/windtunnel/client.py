import os
import uuid
import json
from datetime import datetime, timezone
import requests
import anthropic


class WindTunnel:
    def __init__(self, api_key: str, supabase_url: str, supabase_key: str, anthropic_api_key: str = None):
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

        if anthropic_api_key is None:
            anthropic_api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not anthropic_api_key:
            raise ValueError("Anthropic API key is required. Set ANTHROPIC_API_KEY env var.")
        self.anthropic_client = anthropic.Anthropic(api_key=anthropic_api_key)

        self._ensure_project()

    def _ensure_project(self):
        resp = requests.get(
            f'{self.supabase_url}/rest/v1/projects',
            headers={**self._headers, 'Prefer': ''},
            params={'api_key': f'eq.{self.api_key}'}
        )
        data = resp.json()
        if resp.status_code == 200 and data:
            self.project_id = data[0]['id']
        else:
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
            else:
                raise RuntimeError(
                    f"Failed to create project: {create_resp.status_code} {create_resp.text}"
                )

    def record(
        self,
        user_input: str,
        agent_output: str,
        prompt_version: str = 'v1',
        model: str = 'claude-haiku-4-5-20251001',
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
        baseline_model: str = 'claude-haiku-4-5-20251001',
        challenger_model: str = 'claude-haiku-4-5-20251001',
        run_name: str = None,
        baseline_version: str = 'v1',
        challenger_version: str = 'v2',
        on_progress=None,
    ) -> dict:
        """Fetch last N interactions, replay through both prompts, score with LLM-as-judge."""

        if on_progress:
            on_progress('fetch', n_interactions)

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

        total = len(interactions)

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
                'total_interactions': total
            }
        )

        if run_resp.status_code not in (200, 201):
            raise RuntimeError(f"Failed to create run: {run_resp.status_code} {run_resp.text}")

        run_data = run_resp.json()
        if isinstance(run_data, list):
            run_data = run_data[0]
        run_id = run_data['id']

        results = []
        better_count = 0
        worse_count = 0
        neutral_count = 0

        for i, interaction in enumerate(interactions):
            user_input = interaction['user_input']
            if on_progress:
                on_progress('test', i + 1, total)

            baseline_output = self._get_llm_response(baseline_prompt, user_input, baseline_model)
            challenger_output = self._get_llm_response(challenger_prompt, user_input, challenger_model)
            score, reasoning = self._judge_responses(user_input, baseline_output, challenger_output)

            if score == 'better':
                better_count += 1
            elif score == 'worse':
                worse_count += 1
            else:
                neutral_count += 1

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
            if result_resp.status_code in (200, 201):
                results.append({
                    'user_input': user_input,
                    'baseline_output': baseline_output,
                    'challenger_output': challenger_output,
                    'score': score,
                    'reasoning': reasoning
                })

        regression_rate = worse_count / total if total > 0 else 0
        improvement_rate = better_count / total if total > 0 else 0

        if regression_rate >= 0.3:
            verdict = 'BLOCKED'
        elif improvement_rate > regression_rate:
            verdict = 'APPROVED'
        else:
            verdict = 'NEUTRAL'

        requests.patch(
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
            'total': total,
            'better': better_count,
            'worse': worse_count,
            'neutral': neutral_count,
            'regression_rate': round(regression_rate * 100),
            'results': results
        }

    def _get_llm_response(self, system_prompt: str, user_input: str, model: str = 'claude-haiku-4-5-20251001') -> str:
        try:
            message = self.anthropic_client.messages.create(
                model=model,
                max_tokens=500,
                system=system_prompt,
                messages=[{"role": "user", "content": user_input}]
            )
            return message.content[0].text.strip()
        except Exception as e:
            return f"[Error getting response: {e}]"

    def _judge_responses(self, user_input: str, baseline_output: str, challenger_output: str) -> tuple:
        judge_prompt = """Compare two AI responses and determine which is better.

User Message: {user_input}

Response A (Baseline): {baseline_output}

Response B (Challenger): {challenger_output}

Evaluate: helpfulness, accuracy, completeness, clarity.

Return ONLY a JSON object:
{{"score": "better" | "worse" | "neutral", "reasoning": "1-2 sentence explanation"}}

- "better" = Response B is better than A
- "worse" = Response B is worse than A
- "neutral" = roughly equal""".format(
            user_input=user_input,
            baseline_output=baseline_output,
            challenger_output=challenger_output
        )

        try:
            message = self.anthropic_client.messages.create(
                model='claude-haiku-4-5-20251001',
                max_tokens=200,
                messages=[{'role': 'user', 'content': judge_prompt}]
            )
            content = message.content[0].text.strip()
            start = content.find('{')
            end = content.rfind('}') + 1
            if start >= 0 and end > start:
                content = content[start:end]
            result = json.loads(content)
            score = result.get('score', 'neutral')
            reasoning = result.get('reasoning', 'No reasoning provided')
            if score not in ('better', 'worse', 'neutral'):
                score = 'neutral'
            return score, reasoning
        except Exception as e:
            return 'neutral', f'Judge error: {str(e)}'
