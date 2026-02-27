# The Grace Network - Project Context

## Branch
All work happens on: `claude/political-party-website-cfxto`

## What This Is
This is a **political party website** for "The Grace Network" — a new political movement built on the branch `claude/political-party-website-cfxto` of the `sethgoldstein.com` Next.js repo. The `main` branch contains Seth Goldstein's personal site; the party branch replaces it entirely with The Grace Network site.

## Tech Stack
- Next.js 15 (App Router) with TypeScript
- Tailwind CSS v4
- Deployed on Vercel as project `grace-network` → `grace-network.vercel.app`

## Key Pages & Structure
- `/` — Homepage with hero, pillars, CTA sections
- `/about` — About the movement
- `/platform` — Policy platform with expandable sections
- `/toolkit` — Activist toolkit (copy templates, image generator, presets)
- `/join` — Join/signup page
- `/privacy` — Privacy policy

## Design System
- Primary purple: `#6B21A8` / Tailwind `purple-700`
- Accent gold: `#F59E0B` / Tailwind `amber-500`
- Dark backgrounds with gradient accents
- Logo: infinity symbol (∞) representing interconnectedness

## Current Status
- Site is fully built and functional on the branch
- Vercel project `grace-network` is connected to `brightseth/sethgoldstein.com`
- Production environment is set to track `claude/political-party-website-cfxto`
- **Issue**: Vercel may still be deploying from `main` — may need `vercel --prod` from CLI to force correct branch deployment

## Deployment
```bash
# To deploy from CLI:
vercel login
vercel link  # link to existing 'grace-network' project under 'sethvibes' team
vercel --prod
```
