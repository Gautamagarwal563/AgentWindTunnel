import sys

import click

from .client import WindTunnel


@click.group()
def cli():
    """Agent Windtunnel — CI/CD for AI Agents"""
    pass


@cli.command()
@click.option('--api-key', envvar='WINDTUNNEL_API_KEY', required=True, help='WindTunnel API key')
@click.option('--baseline', required=True, help='Baseline prompt text or @file.txt')
@click.option('--challenger', required=True, help='Challenger prompt text or @file.txt')
@click.option('--n', default=10, show_default=True, help='Number of interactions to test')
@click.option('--openai-key', envvar='OPENAI_API_KEY', default=None, help='OpenAI API key')
@click.option('--anthropic-key', envvar='ANTHROPIC_API_KEY', default=None, help='Anthropic API key (recommended; avoids OpenAI rate limits)')
@click.option('--no-fail-on-regression', 'fail_on_regression', is_flag=True, default=True, flag_value=False, help='Do not exit 1 even if verdict is BLOCKED')
def check(api_key, baseline, challenger, n, openai_key, anthropic_key, fail_on_regression):
    """Run a windtunnel regression check. Use in CI/CD pipelines."""

    if baseline.startswith('@'):
        with open(baseline[1:]) as f:
            baseline = f.read()
    if challenger.startswith('@'):
        with open(challenger[1:]) as f:
            challenger = f.read()

    click.echo("🌪️  Windtunnel check starting...")

    def on_progress(event, *args):
        if event == 'fetch':
            click.echo(f"   Fetching {args[0]} production interactions...")
        elif event == 'test':
            click.echo(f"   Testing interaction {args[0]}/{args[1]}...")

    try:
        wt = WindTunnel(api_key=api_key)
        result = wt.run_windtunnel(
            baseline_prompt=baseline,
            challenger_prompt=challenger,
            n_interactions=n,
            openai_api_key=openai_key,
            anthropic_api_key=anthropic_key,
            on_progress=on_progress,
        )
    except Exception as e:
        raise click.ClickException(str(e))

    verdict = result.get('verdict', 'UNKNOWN')
    regression_rate = result.get('regression_rate', 0)
    worse = result.get('worse', 0)
    total = result.get('total', 0)
    run_id = result.get('run_id', 'N/A')

    click.echo('')
    if verdict == 'BLOCKED':
        click.echo(f"🚫 DEPLOY BLOCKED — {regression_rate}% regression rate ({worse}/{total} worse)")
        click.echo(f"   Run ID: {run_id}")
        if fail_on_regression:
            sys.exit(1)
    elif verdict == 'APPROVED':
        click.echo(f"✅ DEPLOY APPROVED — {regression_rate}% regression rate ({worse}/{total} worse)")
        click.echo(f"   Run ID: {run_id}")
        click.echo(f"   View: https://windtunnel-ai.vercel.app/run/{run_id}")
    else:
        click.echo(f"➖ NEUTRAL — {regression_rate}% regression rate ({worse}/{total} worse)")
        click.echo(f"   Run ID: {run_id}")
        click.echo(f"   View: https://windtunnel-ai.vercel.app/run/{run_id}")


@cli.command()
@click.option('--api-key', envvar='WINDTUNNEL_API_KEY', required=True, help='WindTunnel API key')
def status(api_key):
    """Check connection and authentication status."""
    try:
        wt = WindTunnel(api_key=api_key)
        interactions = wt.get_interactions(limit=1)
        click.echo(f"✅ Connected — API key valid")
    except Exception as e:
        raise click.ClickException(str(e))


if __name__ == '__main__':
    cli()
