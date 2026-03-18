"""
WindTunnel Demo: Vibe Coding Agent

Scenario: A vibe coding agent takes plain English and generates a full HTML website.
We test a GOOD prompt (detailed, opinionated) vs a BAD prompt (lazy, minimal).
WindTunnel judges which generates better websites.
"""

import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'sdk'))

from dotenv import load_dotenv
from windtunnel import WindTunnel

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

PROJECT_API_KEY = os.getenv('PROJECT_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
WINDTUNNEL_BASE_URL = os.getenv('WINDTUNNEL_BASE_URL', 'https://windtunnel-ai.vercel.app')

# ============================================================
# PROMPTS
# ============================================================

GOOD_PROMPT = """You are an expert front-end developer building beautiful, production-quality websites from plain English descriptions.

When given a description, generate a COMPLETE single-file HTML page that:
- Has stunning visual design with a modern color palette, gradients, and thoughtful typography
- Uses CSS Grid and Flexbox for layout — no external CSS frameworks
- Includes smooth hover effects, transitions, and subtle animations
- Is fully responsive (mobile-first)
- Has realistic placeholder content (real-looking text, not "Lorem ipsum")
- Includes relevant sections: hero, features/services, social proof, CTA, footer
- Uses semantic HTML5 elements
- Has a cohesive brand feel matching the described business

Output ONLY the complete HTML. No explanations. No markdown. Just raw HTML starting with <!DOCTYPE html>.
"""

BAD_PROMPT = """You are a web developer. Generate an HTML page based on the user's description.

Make a simple webpage with a title, some text, and basic styling.

Output the HTML.
"""

# ============================================================
# TEST INPUTS — plain english vibe coding requests
# ============================================================

USER_REQUESTS = [
    "a landing page for a luxury coffee shop called 'Noir Espresso' in NYC",
    "a SaaS dashboard for a project management tool called Taskflow — show a pricing page",
    "a portfolio site for a freelance motion designer named Alex Chen",
    "a landing page for an AI fitness coach app called PulseAI",
    "an e-commerce product page for premium noise-cancelling headphones called SoundForge Pro",
    "a landing page for a crypto wallet app called Vault — clean, dark, trustworthy",
    "a restaurant website for a Japanese omakase place called Sakura — elegant and minimal",
]


def print_banner(text: str):
    width = 70
    print("\n" + "=" * width)
    print(f"  {text}")
    print("=" * width)


def print_section(text: str):
    print(f"\n{'─' * 60}")
    print(f"  {text}")
    print('─' * 60)


def get_agent_response(anthropic_key: str, system_prompt: str, user_input: str) -> str:
    import requests
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": anthropic_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        json={
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 2048,
            "system": system_prompt,
            "messages": [{"role": "user", "content": f"Build this: {user_input}"}],
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["content"][0]["text"]


def main():
    print_banner("WINDTUNNEL — Vibe Coding Agent Demo")
    print("\nScenario: Testing two system prompts for an AI website generator.")
    print("Baseline: Detailed, opinionated prompt (like Lovable/v0)")
    print("Challenger: Lazy minimal prompt — will it regress?")

    wt = WindTunnel(api_key=PROJECT_API_KEY, base_url=WINDTUNNEL_BASE_URL)
    print(f"\n[INFO] Connected to WindTunnel at {WINDTUNNEL_BASE_URL}")

    # ── Phase 1: Record production interactions ──────────────────────
    print_banner("PHASE 1: Recording Production Interactions")
    print(f"\nGenerating {len(USER_REQUESTS)} websites with the GOOD prompt...\n")

    for i, request in enumerate(USER_REQUESTS):
        print(f"[{i+1}/{len(USER_REQUESTS)}] {request[:65]}...")
        html = get_agent_response(ANTHROPIC_API_KEY, GOOD_PROMPT, request)
        wt.record(
            user_input=request,
            agent_output=html,
            prompt_version="v1-detailed",
            model="claude-haiku-4-5-20251001",
            metadata={"type": "vibe_coding", "demo": True},
        )
        print(f"  ✓ Generated {len(html):,} chars of HTML — recorded")
        time.sleep(0.3)

    print(f"\n✓ Recorded {len(USER_REQUESTS)} production website generations!")

    # ── Phase 2: Show prompt diff ─────────────────────────────────────
    print_banner("PHASE 2: The Prompt Change")
    print("\n[BASELINE — currently in production]")
    print("─" * 50)
    print(GOOD_PROMPT[:280] + "...")
    print("\n[CHALLENGER — someone 'simplified' it]")
    print("─" * 50)
    print(BAD_PROMPT)
    print("\n⚠️  This dumbed-down prompt is about to ship to 50,000 users...")

    time.sleep(1)

    # ── Phase 3: Run WindTunnel ───────────────────────────────────────
    print_banner("PHASE 3: Running WindTunnel Regression Check")
    print("\nReplaying all website requests through BOTH prompts...")
    print("Claude judges: does the challenger generate better or worse websites?\n")

    result = wt.run_windtunnel(
        baseline_prompt=GOOD_PROMPT,
        challenger_prompt=BAD_PROMPT,
        n_interactions=len(USER_REQUESTS),
        baseline_version="v1-detailed",
        challenger_version="v2-simplified",
        run_name="Vibe Coding: Detailed vs Simplified Prompt",
        anthropic_api_key=ANTHROPIC_API_KEY,
    )

    # ── Phase 4: Results ──────────────────────────────────────────────
    print_banner("PHASE 4: WindTunnel Results")

    print(f"\n{'=' * 60}")
    icon = "🚫" if result['verdict'] == 'BLOCKED' else "✅"
    print(f"  {icon} {result['verdict_text']}")
    print(f"{'=' * 60}")

    print(f"\n📊 Summary:")
    print(f"   Total websites tested:     {result['total']}")
    print(f"   ✅ Better (improvements):  {result['better']}")
    print(f"   ❌ Worse (regressions):    {result['worse']}")
    print(f"   ➖ Neutral:                {result['neutral']}")
    print(f"   📉 Regression rate:        {result['regression_rate']}%")

    print(f"\n📋 Website-by-Website Breakdown:")
    print("─" * 60)

    for i, r in enumerate(result['results']):
        icon = "✅" if r['score'] == 'better' else "❌" if r['score'] == 'worse' else "➖"
        print(f"\n{icon} [{r['score'].upper()}] {USER_REQUESTS[i % len(USER_REQUESTS)][:60]}...")
        print(f"   Judge: {r.get('reasoning', '')[:160]}...")

    print("\n" + "=" * 60)
    if result['verdict'] == 'BLOCKED':
        print("  🚫 DEPLOYMENT BLOCKED")
        print("  The simplified prompt generates significantly worse websites.")
        print("  Your users would have noticed.")
    else:
        print(f"  ✅ APPROVED — regression within threshold")
    print("=" * 60)

    print(f"\n🔗 View full results:")
    print(f"   {WINDTUNNEL_BASE_URL}/run/{result['run_id']}")

    return result


if __name__ == '__main__':
    main()
