# VoxKit manual quality checklist

## Product homepage
- [ ] Visit / and confirm it explains VoxKit as a ChatGPT workflow package.
- [ ] Confirm the primary CTA downloads a ZIP from /api/download.
- [ ] Check the page at 375px mobile and a desktop viewport.
- [ ] Confirm no Axion Marketplace navigation or checkout is exposed.

## Package download
- [ ] Request /api/download and verify HTTP 200 with Content-Type application/zip.
- [ ] Open the downloaded ZIP and confirm one top-level folder named voxkit-chatgpt-plugin.
- [ ] Confirm plugin.json is valid JSON at the package root.
- [ ] Confirm skills/voxkit-writing/SKILL.md is UTF-8 text with valid YAML front matter.
- [ ] Upload the ZIP to the official Plugin directory draft flow and resolve the automated package findings before submitting.

## AI billing and privacy
- [ ] GET /api/ai/process returns available=false and mode=chatgpt-skill-package.
- [ ] POST /api/ai/process returns HTTP 410 and does not call OpenAI or Gemini.
- [ ] Confirm no AI API key is needed by the website or included in Git history or client assets.
- [ ] Verify the old /studio route redirects to the product homepage.

## Before public distribution
- [ ] Complete developer identity verification and submit the skills-only package using the current official OpenAI process.
- [ ] Do not describe VoxKit as approved or publicly listed before approval.
- [ ] Review OpenAI's latest directory guidelines, account availability, and support requirements.
- [ ] Check npm run lint and npm run build.
