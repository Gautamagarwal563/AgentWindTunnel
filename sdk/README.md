# windtunnel-ai

**CI/CD for AI Agents** — Catch prompt regressions before they reach production.

## Install

```
pip install windtunnel-ai
```

## Quick Start

```python
from windtunnel import WindTunnel

wt = WindTunnel(
    api_key="your-windtunnel-api-key",
    supabase_url="your-supabase-url",
    supabase_key="your-supabase-key"
)

# Step 1: Record production interactions
wt.record(user_input=query, agent_output=response)

# Step 2: Before deploying new prompt, run WindTunnel
result = wt.run_windtunnel(
    baseline_prompt=current_prompt,
    challenger_prompt=new_prompt,
    openai_api_key="sk-..."
)
# → BLOCKED if >30% of interactions regressed
```

## CLI Usage

```
windtunnel check \
  --baseline @prompts/v1.txt \
  --challenger @prompts/v2.txt \
  --n 20
```

## GitHub Actions

See the GitHub Actions integration guide below.
