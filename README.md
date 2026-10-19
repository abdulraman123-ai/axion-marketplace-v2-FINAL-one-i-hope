# VoxKit — voice-to-writing studio

VoxKit is the product branch built from the Axion Marketplace codebase. It makes one job easy: **speak or type a rough thought, choose the result you want, and get text you can use**.

## Try it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The product landing page links to the studio at /studio.

To verify the application compiles:

```bash
npm run build
npm run lint
```

## What it does

- **Voice input:** uses the browser Web Speech API when supported. If unavailable, type into the editor.
- **Text outcomes:** clearer writing, summaries, bullet points, professional wording, debate-note structure, and reply drafting.
- **Free ChatGPT handoff:** when direct AI has not been configured, VoxKit copies a task-specific prompt and opens ChatGPT in another tab. The user pastes the prompt into ChatGPT, then pastes the answer back into VoxKit. This uses the ChatGPT website manually; it is not a direct in-app API integration.
- **Output:** edit, copy, download, or read text aloud using browser speech synthesis.
- **Quick local tools:** whitespace cleanup and bullet formatting run without an AI request.

The app has a deliberately small workflow rather than a complicated audio control panel. It does not store user text in an application database in this prototype.

## AI provider configuration (off by default)

VoxKit includes a server-side OpenAI Responses API route at `app/api/ai/process/route.ts`. It is deliberately disabled unless both conditions are met:

```dotenv
OPENAI_API_KEY= # set only in your server environment; never commit a real key
OPENAI_MODEL=gpt-5.5
VOXKIT_AI_ENABLED=true
```

Do **not** add a key to client-side variables, source files, or GitHub. The OpenAI API has separate billing from ChatGPT subscriptions. No API request is made by VoxKit unless the deployment owner deliberately enables this integration and a user clicks the direct AI action.

Before turning on paid API usage for public users, add a durable rate limiter, authentication or verified-user quotas, per-user limits, cost alerts, abuse controls, and a clear privacy notice. The current in-memory rate limit is prototype protection only and is not sufficient against distributed abuse in serverless production.

`OPENAI_API_KEY` belongs in a local `.env.local` file or a server-side Vercel environment variable. Keep it out of all client-side variables.

## Privacy and service behavior

- VoxKit itself does not save the editor text to a database or browser storage.
- Browser speech recognition is browser-dependent; the browser vendor may process audio remotely.
- In free handoff mode, the user decides what to copy and send to ChatGPT.
- When direct AI is enabled, text is transmitted to the configured OpenAI API. Review the provider's current privacy and retention terms before using sensitive content.
- Speech playback depends on available browser/system voices.
- No purchases, API credits, or paid services are configured by default.

## Current status and next steps

This is a working product foundation, not yet a launch-ready commercial service. Check the build output and run the manual QA in `docs/VOXKIT_QA.md`. Before selling it, review license obligations for all inherited dependencies/assets, finish accessibility and browser testing, create a complete privacy/terms page for this product, and secure the direct AI API behind durable quotas. For a separate repository, copy this branch into a new GitHub repository; this current workspace keeps the product isolated on its own branch so Axion's `main` branch remains unchanged.
