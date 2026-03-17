from __future__ import annotations

import os
import uuid
from dataclasses import dataclass
from typing import Callable, Optional

import requests


class WindTunnelError(Exception):
    def __init__(self, message: str, status_code: Optional[int] = None, response_body: Optional[str] = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


@dataclass
class RunResult:
    id: str
    verdict: str
    passed: int
    failed: int
    neutral: int
    total_interactions: int
    regression_rate: float
    results: list
    name: Optional[str]
    created_at: str

    @property
    def is_blocked(self) -> bool:
        return self.verdict == "BLOCKED"


class WindTunnel:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://windtunnel-six.vercel.app",
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
        anthropic_api_key: Optional[str] = None,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self._anthropic_api_key = anthropic_api_key
        self._session = requests.Session()
        self._session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        })

    def _request(self, method: str, path: str, **kwargs):
        url = f"{self.base_url}{path}"
        response = self._session.request(method, url, **kwargs)
        if not response.ok:
            raise WindTunnelError(
                f"Windtunnel API error {response.status_code}: {response.text}",
                status_code=response.status_code,
                response_body=response.text,
            )
        return response.json()

    def record(
        self,
        user_input: str,
        agent_output: str,
        prompt_version: str,
        session_id: Optional[str] = None,
        model: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        payload: dict = {
            "user_input": user_input,
            "agent_output": agent_output,
            "prompt_version": prompt_version,
            "session_id": session_id or str(uuid.uuid4()),
        }
        if model is not None:
            payload["model"] = model
        if metadata is not None:
            payload["metadata"] = metadata

        return self._request("POST", "/api/interactions", json=payload)

    def check(
        self,
        baseline_version: str,
        challenger_version: str,
        baseline_prompt: str,
        challenger_prompt: str,
        interactions: list[dict],
        name: Optional[str] = None,
        baseline_model: Optional[str] = None,
        challenger_model: Optional[str] = None,
        threshold: float = 0.3,
    ) -> RunResult:
        payload: dict = {
            "baseline_version": baseline_version,
            "challenger_version": challenger_version,
            "baseline_prompt": baseline_prompt,
            "challenger_prompt": challenger_prompt,
            "interactions": interactions,
            "threshold": threshold,
        }
        if name is not None:
            payload["name"] = name
        if baseline_model is not None:
            payload["baseline_model"] = baseline_model
        if challenger_model is not None:
            payload["challenger_model"] = challenger_model

        data = self._request("POST", "/api/runs", json=payload)

        return RunResult(
            id=data["id"],
            verdict=data["verdict"],
            passed=data["passed"],
            failed=data["failed"],
            neutral=data["neutral"],
            total_interactions=data["total_interactions"],
            regression_rate=data["regression_rate"],
            results=data.get("results", []),
            name=data.get("name"),
            created_at=data["created_at"],
        )

    def get_interactions(self, limit: int = 10) -> list[dict]:
        return self._request("GET", f"/api/interactions?limit={limit}")

    def _call_openai(self, model: str, system_prompt: str, user_input: str, api_key: str) -> str:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input},
                ],
            },
            timeout=60,
        )
        if not response.ok:
            raise WindTunnelError(
                f"OpenAI API error {response.status_code}: {response.text}",
                status_code=response.status_code,
                response_body=response.text,
            )
        return response.json()["choices"][0]["message"]["content"]

    def run_windtunnel(
        self,
        baseline_prompt: str,
        challenger_prompt: str,
        n_interactions: int = 10,
        baseline_version: str = "v1",
        challenger_version: str = "v2",
        baseline_model: str = "gpt-4o-mini",
        challenger_model: str = "gpt-4o-mini",
        openai_api_key: Optional[str] = None,
        run_name: Optional[str] = None,
        on_progress: Optional[Callable] = None,
    ) -> dict:
        resolved_openai_key = openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not resolved_openai_key:
            raise WindTunnelError("OpenAI API key is required. Pass openai_api_key= or set OPENAI_API_KEY.")

        if on_progress:
            on_progress("fetch", n_interactions)

        response = self.get_interactions(limit=n_interactions)
        raw_interactions = response.get("interactions", response) if isinstance(response, dict) else response

        interactions = []
        total = len(raw_interactions)
        for i, interaction in enumerate(raw_interactions):
            if on_progress:
                on_progress("test", i + 1, total)

            user_input = interaction.get("user_input", "")
            baseline_output = self._call_openai(baseline_model, baseline_prompt, user_input, resolved_openai_key)
            challenger_output = self._call_openai(challenger_model, challenger_prompt, user_input, resolved_openai_key)

            interactions.append({
                "user_input": user_input,
                "baseline_output": baseline_output,
                "challenger_output": challenger_output,
            })

        result = self.check(
            baseline_version=baseline_version,
            challenger_version=challenger_version,
            baseline_prompt=baseline_prompt,
            challenger_prompt=challenger_prompt,
            interactions=interactions,
            name=run_name,
        )

        regression_rate_pct = round(result.regression_rate * 100)
        if result.verdict == "BLOCKED":
            verdict_text = f"DEPLOY BLOCKED — {regression_rate_pct}% regression rate ({result.failed}/{result.total_interactions} worse)"
        elif result.verdict == "APPROVED":
            verdict_text = f"DEPLOY APPROVED — {regression_rate_pct}% regression rate ({result.failed}/{result.total_interactions} worse)"
        else:
            verdict_text = f"NEUTRAL — {regression_rate_pct}% regression rate"

        return {
            "verdict": result.verdict,
            "verdict_text": verdict_text,
            "regression_rate": regression_rate_pct,
            "better": result.passed,
            "worse": result.failed,
            "neutral": result.neutral,
            "total": result.total_interactions,
            "run_id": result.id,
            "results": result.results,
        }
