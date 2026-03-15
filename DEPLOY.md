# Deploying Agent Windtunnel Dashboard

## Option 1: Vercel (Recommended)

1. Install Vercel CLI: `npm install -g vercel`
2. From the dashboard directory: `cd dashboard && vercel`
3. Follow the prompts — link to your Vercel account
4. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Done! Your dashboard is live.

## Option 2: Manual deploy

The dashboard is a standard Next.js app.
Build: `npm run build`
Start: `npm start`
Port: 3000

## Environment Variables

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Your Supabase anon key |
