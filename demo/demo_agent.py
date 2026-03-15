"""
WindTunnel Demo: Customer Support Agent

This demo shows the full WindTunnel workflow:
1. Record 5 production interactions using a GOOD prompt
2. Run windtunnel comparing GOOD prompt vs BAD prompt
3. See the verdict: "DEPLOY BLOCKED - 4/5 interactions regressed"
"""

import os
import sys
import time

# Add the SDK to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'sdk'))

from dotenv import load_dotenv
from openai import OpenAI
from windtunnel import WindTunnel

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# ============================================================
# CONFIGURATION
# ============================================================

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PROJECT_API_KEY = os.getenv('PROJECT_API_KEY', 'demo-project-key-123')

# ============================================================
# PROMPTS
# ============================================================

GOOD_PROMPT = """You are a helpful and empathetic customer support agent for ShopEasy, an e-commerce store.

Your responsibilities:
- Help customers with order issues, returns, refunds, and delivery questions
- Provide specific, actionable steps for each issue
- Always acknowledge the customer's frustration and apologize when appropriate
- Give realistic timeframes for resolution
- Be proactive about offering additional help

Key policies:
- Returns accepted within 30 days of delivery
- Refunds processed in 3-5 business days to original payment method
- For double charges, escalate to billing team for immediate review (same-day resolution)
- Delivery address changes possible if order hasn't shipped yet
- Standard shipping takes 5-7 business days; express 2-3 business days

Always end with: "Is there anything else I can help you with today?"
"""

BAD_PROMPT = """You are a customer support agent.

Help customers with their questions. Be brief.
If they have problems, tell them to check our website or wait.
Don't make specific promises about timeframes.
"""

# ============================================================
# CUSTOMER QUERIES
# ============================================================

CUSTOMER_QUERIES = [
    "My order #12345 hasn't arrived, it's been 2 weeks. I ordered it for my daughter's birthday and now I'm really stressed.",
    "I want to return my shoes, they don't fit. I ordered a size 10 but they're definitely running small. What do I need to do?",
    "What's your refund policy? I need to know exactly how long it takes to get my money back.",
    "I was charged twice for the same order #67890! I can see two identical charges on my credit card statement. This is unacceptable!",
    "Can I change my delivery address? I placed an order 30 minutes ago and I accidentally used my old address."
]


def print_banner(text: str):
    """Print a formatted banner."""
    width = 70
    print("\n" + "=" * width)
    print(f"  {text}")
    print("=" * width)


def print_section(text: str):
    """Print a section header."""
    print(f"\n{'─' * 60}")
    print(f"  {text}")
    print('─' * 60)


def get_agent_response(openai_client: OpenAI, system_prompt: str, user_input: str) -> str:
    """Get a response from the agent using the given prompt."""
    response = openai_client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_input}
        ],
        max_tokens=400,
        temperature=0.1
    )
    return response.choices[0].message.content.strip()


def main():
    print_banner("AGENT WINDTUNNEL - Customer Support Demo")
    print("\nThis demo shows how WindTunnel catches prompt regressions.")
    print("We'll record 5 real customer interactions, then test a BAD")
    print("prompt change to see how WindTunnel blocks the deployment.")

    # Initialize clients
    print("\n[INFO] Initializing WindTunnel client...")
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

    wt = WindTunnel(
        api_key=PROJECT_API_KEY,
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_KEY
    )
    print("[INFO] Connected to Supabase successfully!")

    # ========================================================
    # PHASE 1: Record Production Interactions
    # ========================================================

    print_banner("PHASE 1: Recording Production Interactions")
    print("\nSimulating 5 real customer support interactions...")
    print("(Using GOOD prompt - our current production agent)\n")

    recorded_interactions = []

    for i, query in enumerate(CUSTOMER_QUERIES):
        print(f"\n[Interaction {i+1}/5]")
        print(f"Customer: {query[:80]}...")

        # Get response from our production agent (good prompt)
        response = get_agent_response(openai_client, GOOD_PROMPT, query)
        print(f"Agent: {response[:100]}...")

        # Record the interaction to WindTunnel
        interaction = wt.record(
            user_input=query,
            agent_output=response,
            prompt_version='v1',
            model='gpt-4o-mini',
            metadata={'source': 'demo', 'interaction_num': i + 1}
        )
        recorded_interactions.append(interaction)
        print(f"✓ Recorded to WindTunnel (ID: {interaction['id'][:8]}...)")
        time.sleep(0.5)  # Small delay for readability

    print(f"\n✓ Successfully recorded {len(recorded_interactions)} production interactions!")
    print("  These represent real customer conversations from your production agent.")

    # ========================================================
    # PHASE 2: The "Bad" Prompt Change
    # ========================================================

    print_banner("PHASE 2: Simulating a Prompt Change")
    print("\nScenario: A new engineer wants to 'simplify' the system prompt.")
    print("\n[CURRENT PROMPT - Production]")
    print("─" * 50)
    print(GOOD_PROMPT[:300] + "...")

    print("\n[NEW PROMPT - Challenger (SIMPLIFIED)]")
    print("─" * 50)
    print(BAD_PROMPT)

    print("\n⚠️  This 'simplified' prompt is about to go to production...")
    print("   WindTunnel will test it BEFORE it deploys.\n")

    time.sleep(1)

    # ========================================================
    # PHASE 3: Run WindTunnel
    # ========================================================

    print_banner("PHASE 3: Running WindTunnel Test")
    print("\nReplaying 5 production interactions through BOTH prompts...")
    print("LLM-as-judge will score each response: better / worse / neutral\n")

    result = wt.run_windtunnel(
        baseline_prompt=GOOD_PROMPT,
        challenger_prompt=BAD_PROMPT,
        n_interactions=5,
        baseline_model='gpt-4o-mini',
        challenger_model='gpt-4o-mini',
        run_name='Demo: Good vs Bad Prompt',
        baseline_version='v1',
        challenger_version='v2',
        openai_api_key=OPENAI_API_KEY
    )

    # ========================================================
    # PHASE 4: Show Results
    # ========================================================

    print_banner("PHASE 4: WindTunnel Results")

    print(f"\n{'=' * 60}")
    if result['verdict'] == 'BLOCKED':
        print(f"  🚫 {result['verdict_text']}")
    elif result['verdict'] == 'APPROVED':
        print(f"  ✅ {result['verdict_text']}")
    else:
        print(f"  ⚠️  {result['verdict_text']}")
    print(f"{'=' * 60}")

    print(f"\n📊 Summary:")
    print(f"   Total interactions tested: {result['total']}")
    print(f"   ✅ Better (improvements):  {result['better']}")
    print(f"   ❌ Worse (regressions):    {result['worse']}")
    print(f"   ➖ Neutral:                {result['neutral']}")
    print(f"   📉 Regression rate:        {result['regression_rate']:.0%}")

    print(f"\n📋 Interaction Details:")
    print("─" * 60)

    for i, r in enumerate(result['results']):
        icon = "✅" if r['score'] == 'better' else "❌" if r['score'] == 'worse' else "➖"
        print(f"\n{icon} Interaction {i+1}: [{r['score'].upper()}]")
        print(f"   User: {r['user_input'][:70]}...")
        print(f"   Baseline: {r['baseline_output'][:80]}...")
        print(f"   Challenger: {r['challenger_output'][:80]}...")
        print(f"   Judge: {r['reasoning']}")

    print("\n" + "=" * 60)
    if result['verdict'] == 'BLOCKED':
        print("  🚫 DEPLOYMENT BLOCKED by WindTunnel")
        print("  The challenger prompt would have degraded user experience.")
        print("  The 'simplified' prompt is too vague and unhelpful.")
    else:
        print(f"  {result['verdict_text']}")
    print("=" * 60)

    print(f"\n🔗 View detailed results in the dashboard:")
    print(f"   http://localhost:3000/run/{result['run_id']}")
    print(f"\n[INFO] Run ID: {result['run_id']}")

    return result


if __name__ == '__main__':
    main()
