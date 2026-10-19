# VoxKit — ChatGPT Writing Workflow

VoxKit is now positioned as a portable ChatGPT workflow product, not a hosted AI editor. The website explains the product and serves a download of its skills-only plugin package.

## Product package

The source package lives in `voxkit-chatgpt-plugin/`:

- `plugin.json`: portable plugin manifest.
- `skills/voxkit-writing/SKILL.md`: reusable writing workflow instructions.
- `README.md`: package notes.

The website's `/api/download` route builds a ZIP archive at request time. It contains the plugin manifest and skill instructions under one top-level `voxkit-chatgpt-plugin/` directory.

## What the skill does

- Clarifies rough writing and cleans up speech transcripts.
- Summarises material and makes study notes.
- Drafts polished messages, replies, and posts.
- Structures debate preparation: claims, reasons, evidence to verify, counterarguments, rebuttals, and questions.
- Preserves the user's meaning and does not invent facts, citations, Bible verses, statistics, or quotations.

## ChatGPT distribution status

This is a **draft package, not an approved or published directory listing**. OpenAI's current Plugin directory supports skills-only packages. Public distribution requires developer identity verification and automated checks/review. Follow the current official steps at https://developers.openai.com/plugins/deploy/submission. Approval and availability are not guaranteed.

Personal ChatGPT Free accounts cannot create new custom GPTs. This package is designed as a skills-only plugin instead, but uploading it for directory distribution still requires the applicable developer-portal permissions and verification.

## AI and cost behavior

The website does not send prompts to OpenAI or Gemini APIs. It does not contain an API key, and there is no seller-paid inference configured. When the skill is used in a supported ChatGPT environment, it relies on the host's available AI and plan limits. The package does not grant a user extra ChatGPT usage or bypass account limits.

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The homepage describes the ChatGPT product. The package download is served from `/api/download`.

Check the code compiles:

```bash
npm run build
npm run lint
```

## Safety and release notes

- No API credentials are required for the website or package.
- Do not advertise VoxKit as officially published until an approved public listing exists.
- Do not claim that installation is supported in every personal ChatGPT account; plugin and skills availability depends on the host and account.
- Review OpenAI's current package requirements before each submission.
- The standalone Studio route was retired in favor of the ChatGPT-native product package.
- This product branch remains separate from Axion's `main` branch.
