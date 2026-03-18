# windtunnel-ai

Catch prompt regressions before they reach production.

## Installation

```bash
pip install windtunnel-ai
```

## Quick Start

```python
from windtunnel import WindTunnel

wt = WindTunnel(api_key="wt_...", base_url="https://windtunnel-ai.vercel.app")

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

## Automated Regression Check with `run_windtunnel()`

`run_windtunnel()` fetches your recorded production interactions, replays them
through both prompts using an LLM, and calls `check()` — all in one step.

```python
import os
from windtunnel import WindTunnel

wt = WindTunnel(api_key="wt_...", base_url="https://windtunnel-ai.vercel.app")

result = wt.run_windtunnel(
    baseline_prompt="You are a helpful support assistant.",
    challenger_prompt="You are a concise support assistant. Be brief.",
    n_interactions=10,
)

print(result["verdict"])          # "APPROVED", "NEUTRAL", or "BLOCKED"
print(result["verdict_text"])     # Human-readable summary
print(result["regression_rate"])  # Percentage, e.g. 20
```

### LLM provider for `run_windtunnel()`

By default, `run_windtunnel()` uses **Anthropic Claude Haiku** to replay
interactions and score them. Set `ANTHROPIC_API_KEY` in your environment (or
pass `anthropic_api_key=` directly) and it will be picked up automatically.

> **Recommended:** Use Anthropic over OpenAI. Claude Haiku is fast, cheap, and
> on a paid tier has no per-minute rate limits — making large test suites
> significantly faster and more reliable.

If `ANTHROPIC_API_KEY` is not set, the SDK falls back to **OpenAI**
(`OPENAI_API_KEY`). Set at least one of these environment variables before
calling `run_windtunnel()`.

```bash
# Recommended
export ANTHROPIC_API_KEY="sk-ant-..."

# Or fall back to OpenAI
export OPENAI_API_KEY="sk-..."
```

## CLI Usage

```bash
# Check connection
windtunnel status --api-key wt_...

# Run a regression check (reads ANTHROPIC_API_KEY / OPENAI_API_KEY from env)
windtunnel check \
  --api-key wt_... \
  --baseline @prompts/v1.txt \
  --challenger @prompts/v2.txt \
  --n 20
```

The `check` command exits with code `1` if the verdict is `BLOCKED`, making it
suitable for CI/CD pipelines. Pass `--no-fail-on-regression` to disable this
behaviour.

## API Reference

### `WindTunnel(api_key, base_url)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api_key` | `str` | required | Your Windtunnel API key |
| `base_url` | `str` | `"https://windtunnel-ai.vercel.app"` | API base URL |

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

### `run_windtunnel(baseline_prompt, challenger_prompt, ...)`

Fetches production interactions, replays them through both prompts with an LLM,
and returns a verdict dict.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `baseline_prompt` | `str` | required | Current production system prompt |
| `challenger_prompt` | `str` | required | New system prompt to evaluate |
| `n_interactions` | `int` | `10` | Number of production interactions to replay |
| `baseline_version` | `str` | `"v1"` | Label for the baseline |
| `challenger_version` | `str` | `"v2"` | Label for the challenger |
| `baseline_model` | `str` | `"gpt-4o-mini"` | OpenAI model (used only when falling back to OpenAI) |
| `challenger_model` | `str` | `"gpt-4o-mini"` | OpenAI model (used only when falling back to OpenAI) |
| `anthropic_api_key` | `str` | `None` | Anthropic key (falls back to `ANTHROPIC_API_KEY` env var) |
| `openai_api_key` | `str` | `None` | OpenAI key (falls back to `OPENAI_API_KEY` env var) |
| `run_name` | `str` | `None` | Human-readable label for this run |
| `on_progress` | `Callable` | `None` | Progress callback `(event, *args)` |

Returns a `dict`:

| Key | Type | Description |
|-----|------|-------------|
| `verdict` | `str` | `"APPROVED"`, `"NEUTRAL"`, or `"BLOCKED"` |
| `verdict_text` | `str` | Human-readable summary |
| `regression_rate` | `int` | Regression rate as a percentage (0–100) |
| `better` | `int` | Interactions where challenger was better |
| `worse` | `int` | Interactions where challenger was worse |
| `neutral` | `int` | Interactions with no meaningful difference |
| `total` | `int` | Total interactions evaluated |
| `run_id` | `str` | Run ID |
| `results` | `list` | Per-interaction scores and reasoning |

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
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          windtunnel check \
            --baseline @prompts/v1.txt \
            --challenger @prompts/v2.txt \
            --n 20
```

Add `WINDTUNNEL_API_KEY` and `ANTHROPIC_API_KEY` to your repository secrets at **Settings → Secrets and variables → Actions**.
