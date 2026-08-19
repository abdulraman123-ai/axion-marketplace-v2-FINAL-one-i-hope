# Axion Marketplace

**What's actually working right now:** the full dark "Midnight Premium" design, Supabase-backed sign-up/sign-in, product listing and detail pages reading real data, a founder-gated admin page for adding products, checkout wired end-to-end through auth and the database, and — new — **actual download delivery**: a "My Purchases" dashboard and a download route that only serves a file to someone who genuinely bought it, enforced by the database itself (RLS), not just application code.

**What's NOT built yet:** categories (there's a column for it, no UI yet), and the later-stage polish items — SEO, performance, accessibility, error handling, automated testing, production deployment hardening.

**On Lemon Squeezy specifically:** the checkout and webhook code is complete and will build/deploy fine as-is. It just can't actually process a real payment until a Lemon Squeezy account is fully registered and its keys are added to `.env.local` / Vercel. Trying to buy something before then fails with a clear, expected error — that's correct behavior, not a bug.

---

## 1. Before you do anything: local setup

You'll need **Node.js 20 or newer** (24 recommended, matching the original project).

```bash
npm install
```

## 2. Test the build locally FIRST — do this before pushing anywhere

This is the single most important step for avoiding errors on Vercel. A failed build on your machine takes seconds to see; a failed build on Vercel costs a deploy cycle.

```bash
npm run build
```

If this completes with no red output, you're safe to deploy. If it fails, the error will point to the exact file/line — fix that before pushing.

Then confirm it actually runs:

```bash
npm run dev
```

Open `http://localhost:3000` — you should see the placeholder homepage.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Foundation: Next.js scaffold + design system (Milestones 1-2)"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

(If you already have a GitHub repo for this project, skip `git init`/`remote add` and just commit + push to it instead.)

## 4. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you just pushed.
2. **Framework Preset:** Vercel reads `next` from `package.json` and auto-detects **Next.js** — you don't need to pick anything manually. If you ever see a dropdown, confirm it says "Next.js," not "Other."
3. **Root Directory:** set to wherever this project's `package.json` actually lives in your repo (check what you already have configured — this may already be correct).
4. **Environment Variables:** add the three Supabase values from `.env.example` (real values, from your Supabase project's Settings > API page). Leave the three Lemon Squeezy ones blank until that account is ready.
5. **Build Command / Output Directory:** leave the Vercel defaults (`next build` / `.next`) — don't override these.
6. **Framework Preset:** should already auto-detect as Next.js. If it doesn't, set it explicitly in Settings > Build and Deployment.
7. Click **Deploy**.

That's it — you'll get a live `*.vercel.app` URL. Every future push to `main` will auto-deploy.

## 5. A security note worth knowing right now

Next.js shipped a security patch today (July 21, 2026) — the first release under their new monthly security program, fixing 4 high- and 5 medium-severity issues, following a larger 12-vulnerability patch in May 2026 that covered middleware/route-bypass bugs. `package.json` here specifies `next: ^16.2.10`, so a fresh `npm install` today will pull the patched release automatically. If you ever `npm install` again weeks from now, it's worth a quick `npm outdated` check before deploying, since this cadence is now monthly.

This particularly matters once **Milestone 6 (Protected Routes & Middleware)** is built, since some of the patched vulnerabilities were specifically about middleware-based route protection being bypassable — exactly the mechanism that milestone relies on. Keep Next.js current when we get there.

## What to test after deploying this

1. `/sign-up` → create an account → confirm via email.
2. `/products` → should show at least one product (add one via Supabase's SQL Editor if the list is empty).
3. Click into a product → **Buy Now** → expect a clear "not configured yet" error until Lemon Squeezy is registered. That error is the correct, expected outcome right now.

## What's next

Customer dashboard, real file downloads, and the remaining quality/launch milestones (SEO, performance, accessibility, error handling, testing, production hardening). Nothing further gets implemented until you confirm the above works and say go on the next specific milestone.
