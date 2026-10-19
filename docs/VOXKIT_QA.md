# VoxKit manual quality checklist

## Landing page
- [ ] Visit / and confirm it explains the product in one sentence.
- [ ] Click both primary calls to action; each should open /studio.
- [ ] Check the page at 375px mobile and a desktop viewport.
- [ ] Confirm no Axion Marketplace video background or marketplace navigation appears.

## Studio
- [ ] Type a sentence, choose each task, and click the main action.
- [ ] Confirm default free mode copies a task-specific prompt and opens https://chatgpt.com/.
- [ ] If the clipboard is blocked, confirm the prompt appears visibly and can be copied manually.
- [ ] Paste an example ChatGPT result into the result editor.
- [ ] Copy, download, and play back the result.
- [ ] Use Clean up text and Bullet points; they should not make an API request.
- [ ] Test mic permission allowed, denied, and unsupported browser.
- [ ] Test Turkish, English, and a longer transcript.
- [ ] Confirm clearing input and results works.

## API safeguards
- [ ] With no env settings, GET /api/ai/process returns available=false.
- [ ] With VOXKIT_AI_ENABLED=false, POST /api/ai/process must not call OpenAI even if a key exists.
- [ ] With AI explicitly enabled only in a non-public test environment, send one small test request.
- [ ] Check that the API key never appears in client code, page source, responses, or Git history.
- [ ] Verify invalid tasks, empty input, oversized text, provider failure, and rate limit responses.

## Before commercial release
- [ ] Run npm run lint and npm run build.
- [ ] Add a durable request quota/rate limiter and user-level cost limits before enabling paid API calls publicly.
- [ ] Add user-facing privacy/terms appropriate to the deployed service.
- [ ] Review licenses for inherited code and assets.
- [ ] Configure a real site URL and metadata.
- [ ] Run automated browser tests and accessibility checks.
