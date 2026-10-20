# ClientLaunch — First-Client Toolkit for Freelancers

ClientLaunch addresses a common early freelance problem: people may be able to do the work but struggle to package one service clearly, demonstrate their skills honestly, contact relevant prospects, and remember follow-ups.

## Product
A lightweight, local-first workspace plus a reusable digital toolkit for new freelancers and solo service providers.

- Offer builder: clarify the service, target buyer, problem, and outcome.
- Prospect tracker: record public contact details, a verified observation, status, and next follow-up.
- Message builder: create an individually tailored first message and a respectful follow-up sequence.
- Optional AI handoff: copy a prompt to your own ChatGPT or Gemini conversation. The website itself does not send AI requests.
- Proposal builder: define deliverables, timeline, revision limits, fee, payment terms, and exclusions.
- 30-day plan: check off practical actions.
- Data portability: export leads to CSV and export/import a browser backup as JSON.

## Privacy and cost
- The workspace stores user-entered data in the local browser storage.
- No AI API key, hosted AI endpoint, automatic email sending, or paid lead database is required.
- The app does not promise clients, jobs, or earnings.
- Users should only record information they have a legitimate reason to use, verify claims before outreach, obey relevant laws, and respect opt-outs.
- Export a JSON backup before clearing browser data or changing browsers/devices.

## Website routes
- `/` — product page and value proposition.
- `/studio` — interactive workspace.
- `/api/download` — free starter pack sample, not the complete paid toolkit.
- `/api/ai/process` — retired AI endpoint, returns a disabled response and does not process requests.

## Axion Store packaging
The complete one-time digital-product bundle is delivered separately as `ClientLaunch_Full_Kit.zip`. Add that ZIP to Axion Store as the paid digital download. A suggested initial price to test is US$9; validate the offer with real buyers before investing more time. The website branch does not create a store listing or enable checkout automatically.

Suggested listing copy is in `docs/AXION_PRODUCT_LISTING.md`.

## Local development
Requires Node.js 20 or newer.

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Branch safety
All ClientLaunch changes are on the `voice-toolkit-product` branch. The Axion Marketplace `main` branch has not been changed.
