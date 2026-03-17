# windtunnel-ai

Catch prompt regressions before they reach production.

## Installation

```bash
pip install windtunnel-ai
```

## Quick Start

```python
from windtunnel import WindTunnel

wt = WindTunnel(api_key="wt_your_api_key")

# 1. In production: record every agent interaction
wt.record(
    user_input="What is the return policy?",
    agent_output="You can return items within 30 days.",
    prompt_version="v1",
)

# 2. Before deploying a new prompt: run a regression check
result = wt.check(
    baseline_version="v1",
    challenger_version="v2",
    baseline_prompt="You are a helpful support assistant.",
    challenger_prompt="You are a concise support assistant. Be brief.",
    interactions=[
        {
            "user_input": "What is the return policy?",
            "baseline_output": "You can return items within 30 days of purchase.",
            "challenger_output": "30-day returns.",
        },
        {
            "user_input": "How do I track my order?",
            "baseline_output": "Visit the Orders page and click Track.",
            "challenger_output": "Check Orders > Track.",
        },
    ],
)

print(result.verdict)          # "APPROVED", "NEUTRAL", or "BLOCKED"
print(result.regression_rate)  # e.g. 0.15
print(result.is_blocked)       # False

if result.is_blocked:
    raise SystemExit("Deployment blocked: too many regressions")
```

## API Reference

### `WindTunnel(api_key, base_url)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api_key` | `str` | required | Your Windtunnel API key |
| `base_url` | `str` | `"https://windtunnel-six.vercel.app"` | API base URL |

---

### `record(user_input, agent_output, prompt_version, session_id, model, metadata)`

Records a single production interaction.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `user_input` | `str` | required | The user's message |
| `agent_output` | `str` | required | The agent's response |
| `prompt_version` | `str` | required | Prompt version label (e.g. `"v1"`) |
| `session_id` | `str` | auto-generated | UUID for grouping a conversation |
| `model` | `str` | `None` | Model name used to produce the response |
| `metadata` | `dict` | `None` | Arbitrary key-value metadata |

Returns `dict` with at minimum `{"id": "...", "created_at": "..."}`.

Raises `WindTunnelError` on API errors.

---

### `check(baseline_version, challenger_version, baseline_prompt, challenger_prompt, interactions, name, baseline_model, challenger_model, threshold)`

Runs a regression check between two prompts against a set of interactions.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `baseline_version` | `str` | required | Label for the current prompt (e.g. `"v1"`) |
| `challenger_version` | `str` | required | Label for the new prompt (e.g. `"v2"`) |
| `baseline_prompt` | `str` | required | System prompt currently in production |
| `challenger_prompt` | `str` | required | New system prompt being evaluated |
| `interactions` | `list[dict]` | required | List of `{"user_input", "baseline_output", "challenger_output"}` |
| `name` | `str` | `None` | Human-readable name for this run |
| `baseline_model` | `str` | `None` | Model used for baseline responses |
| `challenger_model` | `str` | `None` | Model used for challenger responses |
| `threshold` | `float` | `0.3` | Regression rate above which verdict is `BLOCKED` |

Returns a `RunResult`. Raises `WindTunnelError` on API errors (non-2xx). Does **not** raise on `BLOCKED` verdict — use `result.is_blocked` to gate deployments.

---

### `RunResult`

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | `str` | Run ID |
| `verdict` | `str` | `"APPROVED"`, `"NEUTRAL"`, or `"BLOCKED"` |
| `passed` | `int` | Interactions where challenger was better |
| `failed` | `int` | Interactions where challenger was worse (regressions) |
| `neutral` | `int` | Interactions with no meaningful difference |
| `total_interactions` | `int` | Total interactions evaluated |
| `regression_rate` | `float` | `failed / total_interactions` |
| `results` | `list` | Per-interaction scores and reasoning |
| `name` | `str \| None` | Run name |
| `created_at` | `str` | ISO 8601 timestamp |
| `is_blocked` | `bool` | `True` when `verdict == "BLOCKED"` |

---

### `WindTunnelError`

Raised on any non-2xx API response.

| Attribute | Type | Description |
|-----------|------|-------------|
| `status_code` | `int \| None` | HTTP status code |
| `response_body` | `str \| None` | Raw response body |

## CI/CD Integration

### GitHub Actions

```yaml
name: Prompt Regression Check

on:
  pull_request:
    paths:
      - "prompts/**"

jobs:
  windtunnel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: pip install windtunnel-ai

      - name: Run regression check
        env:
          WINDTUNNEL_API_KEY: ${{ secrets.WINDTUNNEL_API_KEY }}
        run: |
          python - <<'EOF'
          import os, json
          from windtunnel import WindTunnel, WindTunnelError

          wt = WindTunnel(api_key=os.environ["WINDTUNNEL_API_KEY"])

          with open("prompts/v1.txt") as f:
              baseline_prompt = f.read()
          with open("prompts/v2.txt") as f:
              challenger_prompt = f.read()
          with open("interactions.json") as f:
              interactions = json.load(f)

          result = wt.check(
              baseline_version="v1",
              challenger_version="v2",
              baseline_prompt=baseline_prompt,
              challenger_prompt=challenger_prompt,
              interactions=interactions,
              name=f"PR #{os.environ.get('PR_NUMBER', 'unknown')}",
          )

          print(f"Verdict: {result.verdict}")
          print(f"Regression rate: {result.regression_rate:.1%}")
          print(f"Passed: {result.passed} | Failed: {result.failed} | Neutral: {result.neutral}")

          if result.is_blocked:
              raise SystemExit(f"Deployment blocked: regression rate {result.regression_rate:.1%} exceeds threshold")
          EOF
```

Add `WINDTUNNEL_API_KEY` to your repository secrets at **Settings → Secrets and variables → Actions**.
