import click
import os
import sys
from .client import WindTunnel

@click.group()
def cli():
    """Agent Windtunnel - CI/CD for AI Agents"""
    pass

@cli.command()
@click.option('--api-key', envvar='WINDTUNNEL_API_KEY', required=True, help='WindTunnel API key')
@click.option('--supabase-url', envvar='SUPABASE_URL', required=True)
@click.option('--supabase-key', envvar='SUPABASE_SERVICE_KEY', required=True)
@click.option('--baseline', required=True, help='Baseline prompt text or @file.txt')
@click.option('--challenger', required=True, help='Challenger prompt text or @file.txt')
@click.option('--n', default=10, help='Number of interactions to test')
@click.option('--openai-key', envvar='OPENAI_API_KEY', required=True)
@click.option('--fail-on-block', is_flag=True, default=True, help='Exit code 1 if BLOCKED')
def check(api_key, supabase_url, supabase_key, baseline, challenger, n, openai_key, fail_on_block):
    """Run a windtunnel check. Use in CI/CD pipelines."""

    # Handle @file.txt syntax
    if baseline.startswith('@'):
        with open(baseline[1:]) as f:
            baseline = f.read()
    if challenger.startswith('@'):
        with open(challenger[1:]) as f:
            challenger = f.read()

    click.echo("🌪️  Running WindTunnel check...")

    wt = WindTunnel(api_key=api_key, supabase_url=supabase_url, supabase_key=supabase_key)
    result = wt.run_windtunnel(
        baseline_prompt=baseline,
        challenger_prompt=challenger,
        n_interactions=n,
        openai_api_key=openai_key
    )

    verdict = result.get('verdict', 'UNKNOWN')
    regression_rate = result.get('regression_rate', 0)

    if verdict == 'BLOCKED':
        click.echo(f"🚫 DEPLOY BLOCKED — {regression_rate}% regression rate")
        click.echo(f"   Run ID: {result.get('run_id', 'N/A')}")
        if fail_on_block:
            sys.exit(1)
    elif verdict == 'APPROVED':
        click.echo(f"✅ DEPLOY APPROVED — {regression_rate}% regression rate")
        click.echo(f"   Run ID: {result.get('run_id', 'N/A')}")
    else:
        click.echo(f"➖ NEUTRAL — {regression_rate}% regression rate")

@cli.command()
@click.option('--api-key', envvar='WINDTUNNEL_API_KEY', required=True)
@click.option('--supabase-url', envvar='SUPABASE_URL', required=True)
@click.option('--supabase-key', envvar='SUPABASE_SERVICE_KEY', required=True)
def status(api_key, supabase_url, supabase_key):
    """Check connection status."""
    wt = WindTunnel(api_key=api_key, supabase_url=supabase_url, supabase_key=supabase_key)
    click.echo(f"✅ Connected — Project ID: {wt.project_id}")

if __name__ == '__main__':
    cli()
