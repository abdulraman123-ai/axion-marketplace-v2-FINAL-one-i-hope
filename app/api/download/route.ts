import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const docs = {
  "clientlaunch-starter-pack/README.md": "# ClientLaunch — Free Starter Pack\n\nClientLaunch helps new freelancers turn one skill into a clear offer and a thoughtful outreach routine. This pack is a small starter sample; use it alongside the free browser workspace.\n\n## Start in 20 minutes\n1. Fill in the offer worksheet.\n2. Choose one specific type of buyer you can realistically reach.\n3. Find a prospect using public, legitimate sources.\n4. Write down one accurate observation about their work.\n5. Personalize the sample message and decide your next step.\n\n## Important\n- Never invent results, testimonials, client names, or research.\n- Label sample work honestly if it was not commissioned by a client.\n- Send messages individually; do not use this template for bulk spam.\n- Respect opt-outs and applicable email/privacy rules.\n- Outreach is a learning process, not a guarantee of clients or income.\n\nThe optional AI prompt can be pasted into your own ChatGPT or Gemini conversation. This pack does not include an AI API and does not send data anywhere.",
  "clientlaunch-starter-pack/offer-worksheet.md": "# Offer Clarity Worksheet\n\n## 1. The service\nWhat can I reliably deliver in the next two weeks?\n\nMy service:\n____________________________________\n\n## 2. A focused buyer\nWhich type of person or business is most likely to need this?\n\nIdeal buyer:\n____________________________________\n\nWhere can I reach them legitimately?\n____________________________________\n\n## 3. The problem\nWhat recurring problem do they already experience? Use their language where possible.\n\nProblem:\n____________________________________\n\n## 4. The result\nWhat useful outcome can I deliver without guaranteeing sales, virality, or other results outside my control?\n\nOutcome:\n____________________________________\n\n## 5. The offer sentence\nI help [specific buyer] with [problem] by providing [service], so they can [useful outcome].\n\n## 6. Reality check\n- Can I deliver this reliably?\n- Can I show an example of the work?\n- Is the deliverable specific enough to price?\n- What is excluded from the service?\n- What should I validate by talking to real potential buyers?",
  "clientlaunch-starter-pack/outreach-template.md": "# First Outreach Template\n\nSubject: A quick idea for [Company]\n\nHi [Name],\n\nI noticed [one accurate, specific observation from their public website or work].\n\nI help [type of client] with [specific service], so they can [useful outcome].\n\n[Link to a relevant, honestly described sample—or offer to share one.]\n\nWould it be useful if I sent over a short outline tailored to [Company]?\n\nBest,\n[Your name]\n\n## Before sending\n- Replace every bracketed field.\n- Verify the observation and spelling.\n- Do not claim you have worked with clients or achieved results unless true.\n- Make one clear, low-pressure ask.\n- Send personally; do not bulk-blast the same message.\n\n## Optional AI prompt\nRewrite this email to sound natural and specific, under 130 words. Use only the facts I provide. Do not invent research, client results, testimonials, or compliments. If the observation is too vague, tell me what detail to verify.\n\n[Paste your service offer, verified observation, and draft here.]",
  "clientlaunch-starter-pack/prospect-tracker.csv": "Company,Contact,Email,Website,Channel,Verified observation,Status,Date contacted,Next follow-up date,Next action,Notes\n",
  "clientlaunch-starter-pack/first-week-plan.md": "# First Week: Build a Small, Real Pipeline\n\n## Day 1 — Choose one service\nWrite down one service you already know how to deliver. Avoid trying to sell every skill at once.\n\n## Day 2 — Choose one buyer\nDescribe a specific kind of person or business that could benefit from your service.\n\n## Day 3 — Create one proof sample\nMake one representative sample. If it is not paid client work, label it as a demo or spec project.\n\n## Day 4 — Find five good-fit prospects\nUse public websites and professional profiles. Do not scrape private data or purchase leads you cannot afford.\n\n## Day 5 — Record one observation per prospect\nFind a genuine, specific detail that explains why your service might be relevant. If you cannot find one, skip that prospect.\n\n## Day 6 — Send one to three tailored messages\nUse one short opening, a specific offer, a relevant sample, and a small next step. Send manually.\n\n## Day 7 — Review, do not spam\nLog replies and questions. Put an appropriate follow-up date on unanswered messages. Respect no-contact requests and stop after a polite final follow-up.\n\nThe goal of the first week is to build a repeatable learning process, not to guarantee a client."
} as const;

function crc32(data: Buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipFiles(files: { name: string; content: Buffer }[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const date = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = file.content;
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + data.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

export async function GET() {
  const files = Object.entries(docs).map(([name, body]) => ({
    name,
    content: Buffer.from(body, "utf8"),
  }));
  const archive = zipFiles(files);
  return new NextResponse(archive, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="clientlaunch-starter-pack.zip"',
      "Content-Length": String(archive.length),
      "Cache-Control": "no-store",
    },
  });
}
