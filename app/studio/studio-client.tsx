"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Clipboard,
  Download,
  FileText,
  Flag,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

type LeadStatus =
  | "Researching"
  | "Ready to contact"
  | "Contacted"
  | "Replied"
  | "Call booked"
  | "Proposal sent"
  | "Won"
  | "Closed";

type Lead = {
  id: string;
  company: string;
  contact: string;
  email: string;
  website: string;
  channel: string;
  observation: string;
  notes: string;
  status: LeadStatus;
  createdAt: string;
  contactedAt: string;
  followUpOn: string;
};

type OfferProfile = {
  name: string;
  service: string;
  audience: string;
  problem: string;
  outcome: string;
  proof: string;
  startingPrice: string;
};

type Tab = "overview" | "offer" | "leads" | "outreach" | "proposal" | "plan";

const STORAGE_KEY = "clientlaunch-workspace-v1";
const statuses: LeadStatus[] = [
  "Researching",
  "Ready to contact",
  "Contacted",
  "Replied",
  "Call booked",
  "Proposal sent",
  "Won",
  "Closed",
];

const starterProfile: OfferProfile = {
  name: "",
  service: "",
  audience: "",
  problem: "",
  outcome: "",
  proof: "",
  startingPrice: "",
};

const initialLeadDraft = {
  company: "",
  contact: "",
  email: "",
  website: "",
  channel: "Email",
  observation: "",
  notes: "",
};

const planTasks = [
  { id: "d1", week: "Week 1 · Focus", title: "Choose one service you can deliver reliably", detail: "Start with a skill you can demonstrate. Do not offer ten unrelated services at once." },
  { id: "d2", week: "Week 1 · Focus", title: "Describe one ideal type of client", detail: "Pick a reachable group and learn what they already spend time or money trying to fix." },
  { id: "d3", week: "Week 1 · Focus", title: "Write your one-sentence offer", detail: "Say who you help, what problem you solve, and what outcome the client receives." },
  { id: "d4", week: "Week 1 · Proof", title: "Create one honest sample project", detail: "Label it as a demo/spec sample if it was not paid client work. Never invent testimonials." },
  { id: "d5", week: "Week 2 · Build a list", title: "Find 10 relevant prospects manually", detail: "Use public websites and professional profiles. Record one specific observation for each." },
  { id: "d6", week: "Week 2 · Outreach", title: "Send 3–5 individually tailored messages", detail: "One real observation, one useful idea, one easy next step. Do not blast the same message." },
  { id: "d7", week: "Week 2 · Outreach", title: "Set a respectful follow-up date", detail: "Try one helpful follow-up after 3–5 business days and a final close-out later. Stop if asked." },
  { id: "d8", week: "Week 3 · Improve", title: "Review replies and objections", detail: "Look for patterns in the actual responses instead of guessing what went wrong." },
  { id: "d9", week: "Week 3 · Offer", title: "Write a one-page scope and proposal", detail: "Define deliverables, timeline, price, revisions, exclusions, and payment terms." },
  { id: "d10", week: "Week 4 · Repeat", title: "Repeat the best-performing approach", detail: "Keep the channel and offer focused long enough to learn. Update your samples with real results." },
];

function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addBusinessDays(days: number) {
  const date = new Date();
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) remaining -= 1;
  }
  return localDateISO(date);
}

function displayDate(value: string) {
  if (!value) return "Not set";
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function makeOffer(profile: OfferProfile) {
  if (!profile.service.trim() || !profile.audience.trim() || !profile.outcome.trim()) {
    return "Fill in your service, target client, and outcome to build your one-sentence offer.";
  }
  const problem = profile.problem.trim() ? ` with ${profile.problem.trim()}` : "";
  return `I help ${profile.audience.trim()}${problem} by providing ${profile.service.trim()}, so they can ${profile.outcome.trim()}.`;
}

function makeOutreachDraft(profile: OfferProfile, lead?: Lead | null) {
  const company = lead?.company.trim() || "[Company name]";
  const contact = lead?.contact.trim() || "there";
  const observation = lead?.observation.trim() || "[Add one accurate, specific observation from their public website or work]";
  const offerLine = profile.service.trim() && profile.outcome.trim()
    ? `I help ${profile.audience.trim() || "teams like yours"} with ${profile.service.trim()}, so they can ${profile.outcome.trim()}.`
    : "[Add one clear sentence about the service you provide and the outcome it creates]";
  const proofLine = profile.proof.trim()
    ? `A relevant sample: ${profile.proof.trim()}.`
    : "I can share a short sample of how I would approach this, if that would be useful.";
  return `Subject: A quick idea for ${company}

Hi ${contact},

I noticed ${observation}.

${offerLine}

${proofLine}

Would it be useful if I sent over a short outline tailored to ${company}?

Best,
${profile.name.trim() || "[Your name]"}`;
}

function makeFollowUps(profile: OfferProfile, lead?: Lead | null) {
  const name = lead?.contact.trim() || "there";
  const company = lead?.company.trim() || "[Company]";
  return `FOLLOW-UP 1 · After 3–5 business days

Hi ${name},

I put a little more thought into ${company}. One useful idea could be: [add a specific, genuinely useful suggestion]. If it helps, I can send a short outline.

Best,
${profile.name.trim() || "[Your name]"}

---

FINAL FOLLOW-UP · About a week later

Hi ${name},

I know timing may not be right, so I’ll close the loop here. If ${company} needs help with [specific service/outcome] later, you’re welcome to reach out.

Best,
${profile.name.trim() || "[Your name]"}

After this final message, stop following up unless they reply or there is a genuinely new reason to reconnect. Respect any request not to contact them.`;
}

function makePersonalizationPrompt(profile: OfferProfile, lead?: Lead | null) {
  return `Help me personalize a short, respectful client outreach email. Do not invent facts or pretend to have researched anything.

MY SERVICE / OFFER:
${makeOffer(profile)}

PROSPECT:
Company: ${lead?.company || "[Company]"}
Contact: ${lead?.contact || "[Contact, if known]"}
Website: ${lead?.website || "[Website, if available]"}
Channel: ${lead?.channel || "Email"}
My verified observation: ${lead?.observation || "[Paste one fact you personally verified]"}

RULES:
- Use only facts in these notes. If the observation is vague, tell me what I should verify rather than inventing a detail.
- Keep the email under 130 words, specific, human, and easy to answer.
- Do not use fake compliments, fake results, urgency tricks, or a generic mass-email style.
- Do not claim I have worked with clients or produced results unless I supplied that proof.
- End with one small, low-pressure next step.
- Give me the draft and a short checklist of details I must verify before sending.`;
}

function makeProposal(profile: OfferProfile, details: {
  client: string;
  project: string;
  deliverables: string;
  timeline: string;
  revisions: string;
  price: string;
  payment: string;
  exclusions: string;
}) {
  const price = details.price.trim() ? details.price.trim() : "[Agreed project fee]";
  return `PROJECT PROPOSAL

Prepared by: ${profile.name.trim() || "[Your name]"}
Prepared for: ${details.client.trim() || "[Client name]"}
Project: ${details.project.trim() || profile.service.trim() || "[Project name]"}

THE GOAL
${profile.problem.trim() ? `Address: ${profile.problem.trim()}` : "[Summarize the client's problem in their own words]"}
Expected outcome: ${profile.outcome.trim() || "[Describe the agreed outcome without guaranteeing business results]"}

SCOPE & DELIVERABLES
${details.deliverables.trim() || "[List exactly what the client receives]"}

TIMELINE
${details.timeline.trim() || "[Start date, milestones, and delivery date]"}

REVISIONS
${details.revisions.trim() || "Include the agreed number of revision rounds and define what counts as a new request."}

PROJECT FEE
${price}

PAYMENT TERMS
${details.payment.trim() || "[Deposit, milestone, or final payment terms]"}

NOT INCLUDED
${details.exclusions.trim() || "[List out-of-scope work, recurring costs, and any assumptions]"}

NEXT STEP
Confirm this scope, timeline, and fee in writing before work begins.

Note: This is a practical drafting template, not legal or tax advice. Confirm local requirements and use a suitable contract when needed.`;
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/70">{label}{required ? " *" : ""}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#0c0d13] px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-300/45"
      />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, rows = 3 }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/70">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-white/10 bg-[#0c0d13] px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-violet-300/45"
      />
    </label>
  );
}

export function StudioClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<OfferProfile>(starterProfile);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Follow-up due" | LeadStatus>("All");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [leadDraft, setLeadDraft] = useState(initialLeadDraft);
  const [proposal, setProposal] = useState({
    client: "",
    project: "",
    deliverables: "",
    timeline: "First draft within 5 business days after kickoff",
    revisions: "Includes 2 revision rounds",
    price: "",
    hours: "",
    costs: "",
    payment: "50% to begin, 50% after final delivery",
    exclusions: "Work beyond the agreed deliverables; third-party subscriptions or paid assets",
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          profile?: OfferProfile;
          leads?: Lead[];
          completedTasks?: string[];
        };
        if (saved.profile) setProfile({ ...starterProfile, ...saved.profile });
        if (Array.isArray(saved.leads)) setLeads(saved.leads);
        if (Array.isArray(saved.completedTasks)) setCompletedTasks(saved.completedTasks);
      }
    } catch {
      setStatusMessage("Your previous local workspace data could not be read. You can import a JSON backup if you have one.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, leads, completedTasks }));
    } catch {
      setStatusMessage("This browser could not save more local data. Export a backup and clear old data if needed.");
    }
  }, [loaded, profile, leads, completedTasks]);

  useEffect(() => {
    if (!selectedLeadId && leads.length) setSelectedLeadId(leads[0].id);
    if (selectedLeadId && !leads.some((lead) => lead.id === selectedLeadId)) {
      setSelectedLeadId(leads[0]?.id ?? "");
    }
  }, [leads, selectedLeadId]);

  const today = localDateISO();
  const dueLeads = useMemo(
    () => leads.filter((lead) => lead.status === "Contacted" && lead.followUpOn && lead.followUpOn <= today),
    [leads, today],
  );
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;
  const offerText = makeOffer(profile);
  const outreachDraft = makeOutreachDraft(profile, selectedLead);
  const followUpText = makeFollowUps(profile, selectedLead);
  const personalizationPrompt = makePersonalizationPrompt(profile, selectedLead);
  const proposalText = makeProposal(profile, proposal);
  const wonCount = leads.filter((lead) => lead.status === "Won").length;
  const openCount = leads.filter((lead) => !["Won", "Closed"].includes(lead.status)).length;
  const offerComplete = Boolean(profile.service.trim() && profile.audience.trim() && profile.outcome.trim());
  const planProgress = Math.round((completedTasks.length / planTasks.length) * 100);

  const tabItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "offer", label: "Your offer", icon: Target },
    { id: "leads", label: "Lead tracker", icon: Users },
    { id: "outreach", label: "Messages", icon: MessageSquareText },
    { id: "proposal", label: "Proposal builder", icon: FileText },
    { id: "plan", label: "30-day plan", icon: ListChecks },
  ];

  function patchProfile(field: keyof OfferProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function patchLeadDraft(field: keyof typeof initialLeadDraft, value: string) {
    setLeadDraft((current) => ({ ...current, [field]: value }));
  }

  function addLead(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!leadDraft.company.trim()) {
      setStatusMessage("Add a company or prospect name before saving.");
      return;
    }
    const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next: Lead = {
      id,
      company: leadDraft.company.trim(),
      contact: leadDraft.contact.trim(),
      email: leadDraft.email.trim(),
      website: leadDraft.website.trim(),
      channel: leadDraft.channel,
      observation: leadDraft.observation.trim(),
      notes: leadDraft.notes.trim(),
      status: "Researching",
      createdAt: localDateISO(),
      contactedAt: "",
      followUpOn: "",
    };
    setLeads((current) => [next, ...current]);
    setSelectedLeadId(id);
    setLeadDraft(initialLeadDraft);
    setStatusMessage("Prospect saved on this device.");
    setTab("leads");
  }

  function updateLead(id: string, updates: Partial<Lead>) {
    setLeads((current) => current.map((lead) => {
      if (lead.id !== id) return lead;
      const updated = { ...lead, ...updates };
      if (updates.status === "Contacted" && !lead.contactedAt) {
        updated.contactedAt = localDateISO();
        updated.followUpOn = lead.followUpOn || addBusinessDays(3);
      }
      if (updates.status === "Proposal sent" && !lead.followUpOn) {
        updated.followUpOn = addBusinessDays(4);
      }
      if (updates.status === "Won" || updates.status === "Closed") {
        updated.followUpOn = "";
      }
      return updated;
    }));
    setStatusMessage("Lead updated.");
  }

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatusMessage(`${label} copied to clipboard.`);
    } catch {
      setStatusMessage("Clipboard access was blocked. Select the text and copy it manually.");
    }
  }

  function exportBackup() {
    downloadText(
      "clientlaunch-workspace-backup.json",
      JSON.stringify({ exportedAt: new Date().toISOString(), profile, leads, completedTasks }, null, 2),
      "application/json;charset=utf-8",
    );
    setStatusMessage("JSON backup downloaded. Keep it somewhere safe.");
  }

  function exportCSV() {
    const headers = ["company", "contact", "email", "website", "channel", "observation", "notes", "status", "createdAt", "contactedAt", "followUpOn"];
    const rows = leads.map((lead) => headers.map((header) => csvEscape(lead[header as keyof Lead])));
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    downloadText("clientlaunch-leads.csv", csv, "text/csv;charset=utf-8");
    setStatusMessage("CSV lead tracker downloaded.");
  }

  async function importBackup(file?: File) {
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text()) as {
        profile?: OfferProfile;
        leads?: Lead[];
        completedTasks?: string[];
      };
      if (!backup || typeof backup !== "object") throw new Error("The file is not a valid ClientLaunch backup.");
      if (backup.profile) setProfile({ ...starterProfile, ...backup.profile });
      if (Array.isArray(backup.leads)) setLeads(backup.leads.filter((lead) => lead && lead.id && lead.company));
      if (Array.isArray(backup.completedTasks)) setCompletedTasks(backup.completedTasks);
      setStatusMessage("Backup imported into this browser.");
    } catch {
      setStatusMessage("Could not import that file. Choose a JSON backup exported by ClientLaunch.");
    }
  }

  function addExampleLead() {
    const id = `example-${Date.now()}`;
    const example: Lead = {
      id,
      company: "Example Podcast Studio",
      contact: "Alex",
      email: "",
      website: "https://example.com",
      channel: "Email",
      observation: "Their public channel publishes long interviews, but the home page does not explain how listeners can find short clips",
      notes: "Example only. Replace with a real, verified observation before contacting anyone.",
      status: "Researching",
      createdAt: localDateISO(),
      contactedAt: "",
      followUpOn: "",
    };
    setLeads((current) => [example, ...current]);
    setSelectedLeadId(id);
    setStatusMessage("Example added. It is clearly labeled as fictional—replace it before using this workflow.");
    setTab("leads");
  }

  const visibleLeads = leads.filter((lead) => {
    const haystack = [lead.company, lead.contact, lead.email, lead.website, lead.observation].join(" ").toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesFilter = filter === "All"
      || (filter === "Follow-up due" && lead.status === "Contacted" && Boolean(lead.followUpOn) && lead.followUpOn <= today)
      || lead.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main id="content" className="min-h-screen bg-[#0d0e14] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-44 left-1/2 h-[34rem] w-[46rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[130px]" />
        <div className="absolute right-[-10rem] top-[26rem] h-72 w-72 rounded-full bg-violet-500/[0.07] blur-[110px]" />
      </div>

      <header className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 to-lime-200 text-[#102019]"><Target size={19} /></span>
          <span className="text-lg">ClientLaunch<span className="text-emerald-300">.</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <button type="button" onClick={exportBackup} className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-white/65 transition hover:bg-white/[0.05] sm:inline-flex"><Download size={15} /> Backup data</button>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"><ArrowLeft size={16} /> Home</Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <section className="grid gap-6 pb-7 pt-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-100"><Sparkles size={13} /> The first-client workspace</div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Turn your skill into a <span className="text-emerald-200">repeatable client pipeline.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">Clarify the service you sell, track prospects, write specific outreach, and follow up on time. No API key, paid lead database, or automatic mass-emailing.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCSV} disabled={!leads.length} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-35"><Download size={15} /> Export leads</button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.05]"><Clipboard size={15} /> Import backup<input type="file" accept=".json,application/json" className="sr-only" onChange={(event) => { void importBackup(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
          </div>
        </section>

        <nav aria-label="Workspace sections" className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
          {tabItems.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${tab === id ? "bg-emerald-300 text-[#102019]" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {statusMessage && (
          <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] px-4 py-3 text-sm text-emerald-50/85">
            <span>{statusMessage}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setStatusMessage("")} className="rounded-lg p-0.5 text-white/50 hover:text-white">×</button>
          </div>
        )}

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Open prospects", value: String(openCount), detail: "Not yet won or closed", icon: Users },
                { label: "Follow-ups due", value: String(dueLeads.length), detail: "Check these today", icon: CalendarClock },
                { label: "Proposals / calls", value: String(leads.filter((lead) => ["Call booked", "Proposal sent"].includes(lead.status)).length), detail: "Active buying conversations", icon: FileText },
                { label: "Won projects", value: String(wonCount), detail: "Record real outcomes only", icon: TrendingUp },
              ].map(({ label, value, detail, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-[#151620]/80 p-5">
                  <div className="flex items-center justify-between"><span className="text-sm text-white/55">{label}</span><Icon size={17} className="text-emerald-200" /></div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
                  <div className="mt-1 text-xs text-white/35">{detail}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
              <div className="rounded-2xl border border-white/10 bg-[#151620]/80 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Start here</p><h2 className="mt-2 text-xl font-semibold">Your offer, in one sentence</h2><p className="mt-2 text-sm leading-6 text-white/50">People need to understand who you help and what changes for them.</p></div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><Target size={19} /></span>
                </div>
                <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/20 p-4 text-sm leading-6 text-white/75">{offerText}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setTab("offer")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-[#102019] transition hover:bg-emerald-200">Build my offer <ArrowRight size={16} /></button>
                  <button type="button" onClick={() => copyValue(offerText, "Offer")} disabled={!offerComplete} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.05] disabled:opacity-35"><Clipboard size={15} /> Copy</button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#151620]/80 p-5 sm:p-6">
                <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><CalendarClock size={19} /></div><div><h2 className="text-lg font-semibold">Next action</h2><p className="mt-1 text-sm leading-6 text-white/50">Small, consistent steps beat rewriting your website for weeks.</p></div></div>
                {dueLeads.length ? (
                  <div className="mt-4 space-y-2">
                    {dueLeads.slice(0, 3).map((lead) => <button key={lead.id} type="button" onClick={() => { setSelectedLeadId(lead.id); setTab("outreach"); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-left transition hover:bg-amber-300/[0.1]"><span><span className="block text-sm font-semibold">{lead.company}</span><span className="mt-1 block text-xs text-white/45">Follow-up due · {displayDate(lead.followUpOn)}</span></span><ArrowRight size={15} className="shrink-0 text-amber-200" /></button>)}
                    <button type="button" onClick={() => { setFilter("Follow-up due"); setTab("leads"); }} className="text-xs font-semibold text-emerald-200 hover:text-emerald-100">View all due follow-ups →</button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-4"><p className="text-sm font-medium text-white/80">Add one good-fit prospect.</p><p className="mt-1 text-xs leading-5 text-white/45">Record their name and one real observation before you write to them.</p><button type="button" onClick={() => setTab("leads")} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100">Add a prospect <ArrowRight size={15} /></button></div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "1 · Get specific", copy: "Choose one service, one audience, and a clear outcome. Avoid a vague 'I do everything' pitch.", icon: Target, tab: "offer" as Tab, cta: "Define your offer" },
                { title: "2 · Build honest proof", copy: "Create a sample that demonstrates your skill. Label spec work honestly and never fake a testimonial.", icon: BadgeCheck, tab: "plan" as Tab, cta: "Open the 30-day plan" },
                { title: "3 · Follow through", copy: "Track each conversation, send a useful follow-up, and stop when the prospect says no.", icon: CalendarClock, tab: "leads" as Tab, cta: "Track prospects" },
              ].map(({ title, copy, icon: Icon, tab: nextTab, cta }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <Icon size={19} className="text-emerald-200" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-white/50">{copy}</p><button type="button" onClick={() => setTab(nextTab)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">{cta}<ArrowRight size={15} /></button>
                </div>
              ))}
            </div>
            <p className="text-xs leading-5 text-white/35">Your workspace is stored in this browser on this device. It does not connect to a prospect database, send email, or call an AI API. Export a backup before clearing browser data.</p>
          </div>
        )}

        {tab === "offer" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_.92fr]">
            <section className="rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6">
              <div className="mb-5"><h2 className="text-xl font-semibold">Make your offer easy to understand</h2><p className="mt-2 text-sm leading-6 text-white/50">A focused offer is easier to show, price, and explain. Fill only what you know; keep claims honest.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name / brand" value={profile.name} onChange={(v) => patchProfile("name", v)} placeholder="Your name" />
                <Field label="Service you deliver" value={profile.service} onChange={(v) => patchProfile("service", v)} placeholder="e.g. edit short-form video clips" required />
                <Field label="Ideal client type" value={profile.audience} onChange={(v) => patchProfile("audience", v)} placeholder="e.g. podcasts publishing weekly" required />
                <Field label="Outcome for the client" value={profile.outcome} onChange={(v) => patchProfile("outcome", v)} placeholder="e.g. publish clips consistently" required />
                <div className="sm:col-span-2"><TextField label="Problem you solve (in the client's words)" value={profile.problem} onChange={(v) => patchProfile("problem", v)} placeholder="e.g. they have long recordings but little time to repurpose them" rows={2} /></div>
                <div className="sm:col-span-2"><Field label="Honest proof / sample link (optional)" value={profile.proof} onChange={(v) => patchProfile("proof", v)} placeholder="A demo portfolio link; label spec work honestly" /></div>
                <Field label="Starting price (optional)" value={profile.startingPrice} onChange={(v) => patchProfile("startingPrice", v)} placeholder="e.g. $150 per project" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => copyValue(offerText, "Offer")} disabled={!offerComplete} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-[#102019] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-35"><Clipboard size={15} /> Copy one-sentence offer</button>
                <button type="button" onClick={() => { setTab("outreach"); setStatusMessage("Your offer is ready to use in your outreach draft."); }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/[0.05]">Use in outreach <ArrowRight size={15} /></button>
              </div>
            </section>
            <aside className="space-y-4">
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5 sm:p-6"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200"><Sparkles size={14} /> Your offer statement</div><p className="mt-4 text-base leading-7 text-white/90">{offerText}</p><p className="mt-4 text-xs leading-5 text-white/40">This is a writing frame, not proof of market demand. Talk to potential buyers and improve the wording based on their actual questions.</p></div>
              <div className="rounded-2xl border border-white/10 bg-[#151620]/80 p-5"><h3 className="font-semibold">Before you sell it</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-white/55"><li>• Can you deliver the service reliably?</li><li>• Can a buyer understand exactly what they receive?</li><li>• Is each portfolio item labeled accurately?</li><li>• Do price, timeline, and revision limits make sense?</li></ul></div>
              <div className="rounded-2xl border border-white/10 bg-[#151620]/80 p-5"><h3 className="font-semibold">Need a second opinion?</h3><p className="mt-2 text-sm leading-6 text-white/50">Copy this offer into ChatGPT or Gemini and ask it to critique the clarity. You control what you share; this tool does not send your data anywhere.</p><button type="button" onClick={() => copyValue(`Critique this freelance service offer. Do not invent market data. Tell me whether it clearly names a buyer, an expensive or urgent problem, a deliverable, and a believable outcome. Suggest three clearer versions and list what I should validate with real potential customers.\n\nOffer: ${offerText}`, "Offer review prompt")} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"><Clipboard size={15} /> Copy review prompt</button></div>
            </aside>
          </div>
        )}

        {tab === "leads" && (
          <div className="grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
            <section className="rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">Add a prospect</h2><p className="mt-1 text-sm leading-6 text-white/45">Save only relevant prospects you have actually researched.</p></div><Plus size={19} className="text-emerald-200" /></div>
              <form onSubmit={addLead} className="space-y-4">
                <Field label="Company / prospect name" value={leadDraft.company} onChange={(v) => patchLeadDraft("company", v)} placeholder="Business name" required />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><Field label="Contact person" value={leadDraft.contact} onChange={(v) => patchLeadDraft("contact", v)} placeholder="If publicly known" /><Field label="Public work email" value={leadDraft.email} onChange={(v) => patchLeadDraft("email", v)} placeholder="name@company.com" type="email" /></div>
                <Field label="Website / source URL" value={leadDraft.website} onChange={(v) => patchLeadDraft("website", v)} placeholder="https://…" />
                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-white/70">Contact method</span><select value={leadDraft.channel} onChange={(e) => patchLeadDraft("channel", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0c0d13] px-3.5 py-3 text-sm text-white outline-none focus:border-emerald-300/45"><option>Email</option><option>LinkedIn</option><option>Contact form</option><option>Referral</option><option>Community</option><option>Other</option></select></label>
                <TextField label="One real observation (required before outreach)" value={leadDraft.observation} onChange={(v) => patchLeadDraft("observation", v)} placeholder="Something specific you verified on their site or public work" rows={3} />
                <TextField label="Private notes (optional)" value={leadDraft.notes} onChange={(v) => patchLeadDraft("notes", v)} placeholder="Why they are a fit, context, next step…" rows={2} />
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-[#102019] transition hover:bg-emerald-200"><Plus size={16} /> Save prospect</button>
              </form>
              <button type="button" onClick={addExampleLead} className="mt-3 text-xs font-medium text-white/45 transition hover:text-white/80">Add a clearly labeled example</button>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-semibold">Your pipeline</h2><p className="mt-1 text-sm text-white/45">{leads.length} saved prospect{leads.length === 1 ? "" : "s"}. The list stays in this browser.</p></div><button type="button" onClick={exportCSV} disabled={!leads.length} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/[0.05] disabled:opacity-35"><Download size={14} /> Export CSV</button></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px]"><label className="relative block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company or contact…" className="w-full rounded-xl border border-white/10 bg-[#0c0d13] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-300/40" /></label><select aria-label="Filter prospects" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded-xl border border-white/10 bg-[#0c0d13] px-3 py-2.5 text-sm text-white/70 outline-none focus:border-emerald-300/40"><option value="All">All statuses</option><option value="Follow-up due">Follow-up due</option>{statuses.map((value) => <option value={value} key={value}>{value}</option>)}</select></div>
              <div className="mt-4 space-y-3">
                {visibleLeads.length ? visibleLeads.map((lead) => (
                  <article key={lead.id} className={`rounded-xl border p-4 transition ${lead.id === selectedLeadId ? "border-emerald-300/25 bg-emerald-300/[0.035]" : "border-white/[0.08] bg-black/15"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{lead.company}</h3>{lead.id.startsWith("example-") && <span className="rounded-full bg-amber-200/10 px-2 py-0.5 text-[10px] text-amber-100">Example only</span>}</div><p className="mt-1 truncate text-xs text-white/40">{lead.contact || "No contact name"}{lead.email ? ` · ${lead.email}` : ""}{lead.channel ? ` · ${lead.channel}` : ""}</p></div><button type="button" onClick={() => { setSelectedLeadId(lead.id); setTab("outreach"); }} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/10">Draft message <ArrowRight size={13} /></button></div>
                    {lead.observation && <p className="mt-3 text-sm leading-5 text-white/65">{lead.observation}</p>}
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3"><label className="block"><span className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-white/35">Status</span><select aria-label={`Status for ${lead.company}`} value={lead.status} onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })} className="rounded-lg border border-white/10 bg-[#0c0d13] px-2.5 py-2 text-xs text-white/75 outline-none focus:border-emerald-300/45">{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
                      <div className="flex items-end gap-3">
                        {lead.status === "Contacted" && <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-white/35">Follow-up date</span><input aria-label={`Follow-up date for ${lead.company}`} type="date" value={lead.followUpOn} onChange={(e) => updateLead(lead.id, { followUpOn: e.target.value })} className="max-w-[150px] rounded-lg border border-white/10 bg-[#0c0d13] px-2 py-2 text-xs text-white/75 outline-none focus:border-emerald-300/45" /></label>}
                        <button type="button" aria-label={`Delete ${lead.company}`} onClick={() => { setLeads((current) => current.filter((item) => item.id !== lead.id)); setStatusMessage(`Removed ${lead.company} from the tracker.`); }} className="mb-0.5 rounded-lg p-2 text-white/30 transition hover:bg-rose-300/10 hover:text-rose-200"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    {lead.status === "Contacted" && <p className={`mt-3 text-xs ${lead.followUpOn && lead.followUpOn <= today ? "text-amber-200" : "text-white/40"}`}>{lead.followUpOn && lead.followUpOn <= today ? "Follow-up due" : "Next follow-up"}: {displayDate(lead.followUpOn)}</p>}
                  </article>
                )) : <div className="rounded-xl border border-dashed border-white/10 px-4 py-12 text-center"><Users size={25} className="mx-auto text-white/25" /><p className="mt-3 text-sm font-medium text-white/75">{leads.length ? "No prospects match this filter." : "Your pipeline is empty."}</p><p className="mt-1 text-xs leading-5 text-white/40">Add one carefully chosen prospect to get started. No bulk imports of scraped lists are needed.</p></div>}
              </div>
            </section>
          </div>
        )}

        {tab === "outreach" && (
          <div className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6"><h2 className="text-xl font-semibold">Choose a prospect</h2><p className="mt-1 text-sm leading-6 text-white/45">The draft uses your offer and the specific observation you recorded. Review every detail before sending.</p>
                <label className="mt-5 block"><span className="mb-1.5 block text-xs font-semibold text-white/70">Prospect</span><select value={selectedLeadId} onChange={(e) => setSelectedLeadId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0c0d13] px-3 py-3 text-sm text-white outline-none focus:border-emerald-300/45"><option value="">No lead selected</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.company}{lead.id.startsWith("example-") ? " (example)" : ""}</option>)}</select></label>
                {selectedLead && <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-3 text-xs leading-5 text-white/55"><div>Contact: {selectedLead.contact || "Not specified"}</div><div>Channel: {selectedLead.channel}</div><div>Website: {selectedLead.website || "Not specified"}</div><div className="mt-2 text-white/75">Observation: {selectedLead.observation || "Not added yet"}</div><button type="button" onClick={() => setTab("leads")} className="mt-2 font-semibold text-emerald-200">Edit prospect details →</button></div>}
                {!selectedLead && <button type="button" onClick={() => setTab("leads")} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-[#102019]">Add a prospect <ArrowRight size={15} /></button>}
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-200" /><h3 className="font-semibold">Personalize, don’t spam</h3></div><p className="mt-3 text-sm leading-6 text-white/50">Use a real observation, a specific offer, and one easy next step. Send manually from your own mailbox, respect local rules, and stop if they decline or ask not to be contacted.</p></div>
            </section>
            <section className="space-y-4">
              <div className="rounded-2xl border border-emerald-300/15 bg-[#151620]/85 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200"><MessageSquareText size={14} /> First message</div><h2 className="mt-2 text-xl font-semibold">A useful, human opening</h2></div><button type="button" onClick={() => copyValue(outreachDraft, "Outreach draft")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-3.5 py-2.5 text-sm font-semibold text-[#102019] hover:bg-emerald-200"><Clipboard size={15} /> Copy draft</button></div><pre className="mt-5 whitespace-pre-wrap break-words rounded-xl border border-white/[0.08] bg-black/20 p-4 font-sans text-sm leading-6 text-white/80">{outreachDraft}</pre><p className="mt-3 text-xs leading-5 text-white/40">If you see bracketed text, fill it with a verified detail before sending. A template is only a starting point.</p></div>
              <div className="rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-violet-200"><Sparkles size={14} /> Optional free AI assist</div><h2 className="mt-2 text-lg font-semibold">Personalize with ChatGPT or Gemini</h2></div><button type="button" onClick={() => copyValue(personalizationPrompt, "Personalization prompt")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.05]"><Clipboard size={15} /> Copy prompt</button></div><p className="mt-3 text-sm leading-6 text-white/50">Copy the context to your own AI chat. ClientLaunch itself does not send your data to any AI service. Ask the model to improve clarity—but verify every company detail yourself.</p></div>
              <div className="rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6"><div className="flex items-center gap-2"><CalendarClock size={17} className="text-amber-200" /><h3 className="font-semibold">Follow-up sequence</h3></div><pre className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-white/[0.08] bg-black/20 p-4 font-sans text-sm leading-6 text-white/75">{followUpText}</pre><button type="button" onClick={() => copyValue(followUpText, "Follow-up sequence")} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.05]"><Clipboard size={15} /> Copy follow-ups</button></div>
            </section>
          </div>
        )}

        {tab === "proposal" && (
          <div className="grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
            <section className="rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6"><div className="mb-5"><h2 className="text-xl font-semibold">Scope it clearly</h2><p className="mt-2 text-sm leading-6 text-white/50">A small, clear proposal protects both sides from confusion. Agree on scope and payment in writing before starting.</p></div><div className="space-y-4">
              <Field label="Client name" value={proposal.client} onChange={(v) => setProposal((p) => ({ ...p, client: v }))} placeholder="Client / company" />
              <Field label="Project title" value={proposal.project} onChange={(v) => setProposal((p) => ({ ...p, project: v }))} placeholder="e.g. Four short-form clips" />
              <TextField label="Deliverables (be specific)" value={proposal.deliverables} onChange={(v) => setProposal((p) => ({ ...p, deliverables: v }))} placeholder="Number of items, format, length, platform, files included…" />
              <Field label="Timeline / milestones" value={proposal.timeline} onChange={(v) => setProposal((p) => ({ ...p, timeline: v }))} placeholder="Delivery dates" />
              <Field label="Revisions" value={proposal.revisions} onChange={(v) => setProposal((p) => ({ ...p, revisions: v }))} placeholder="e.g. 2 revision rounds" />
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Project fee / currency" value={proposal.price} onChange={(v) => setProposal((p) => ({ ...p, price: v }))} placeholder="e.g. $250" /><Field label="Estimated hours" value={proposal.hours} onChange={(v) => setProposal((p) => ({ ...p, hours: v }))} placeholder="e.g. 8" type="number" /></div>
              <Field label="Direct costs" value={proposal.costs} onChange={(v) => setProposal((p) => ({ ...p, costs: v }))} placeholder="e.g. 20 (same currency as fee)" type="number" />
              {Number(proposal.hours) > 0 && proposal.price.trim() && Number.isFinite(Number(proposal.price.replace(/[^0-9.-]/g, ""))) && <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3 text-sm text-white/70">Estimated net hourly rate: <strong className="text-emerald-200">{((Number(proposal.price.replace(/[^0-9.-]/g, "")) - (Number(proposal.costs) || 0)) / Number(proposal.hours)).toFixed(2)}</strong> in the entered currency, before tax and overhead.</div>}
              <TextField label="Payment terms" value={proposal.payment} onChange={(v) => setProposal((p) => ({ ...p, payment: v }))} placeholder="Deposit, milestones, due dates…" rows={2} />
              <TextField label="Not included / boundaries" value={proposal.exclusions} onChange={(v) => setProposal((p) => ({ ...p, exclusions: v }))} placeholder="Out-of-scope requests, extra revisions, third-party costs…" rows={2} />
            </div></section>
            <section className="rounded-2xl border border-emerald-300/15 bg-[#151620]/85 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200"><FileText size={14} /> Proposal preview</div><h2 className="mt-2 text-xl font-semibold">Ready to review and send</h2></div><button type="button" onClick={() => copyValue(proposalText, "Proposal")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-3.5 py-2.5 text-sm font-semibold text-[#102019] hover:bg-emerald-200"><Clipboard size={15} /> Copy proposal</button></div><pre className="mt-5 whitespace-pre-wrap break-words rounded-xl border border-white/[0.08] bg-black/20 p-4 font-sans text-sm leading-6 text-white/80">{proposalText}</pre><p className="mt-3 text-xs leading-5 text-white/40">Check names, currency, scope, and local requirements. This generated draft is not a legal contract.</p></section>
          </div>
        )}

        {tab === "plan" && (
          <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
            <section className="h-fit rounded-2xl border border-white/10 bg-[#151620]/85 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><Flag size={20} /></span><div><h2 className="text-xl font-semibold">Your 30-day launch plan</h2><p className="mt-1 text-sm text-white/45">A plan you can actually follow</p></div></div><div className="mt-6 flex items-end justify-between"><span className="text-sm text-white/55">Tasks completed</span><strong className="text-2xl">{completedTasks.length}<span className="text-sm font-normal text-white/35"> / {planTasks.length}</span></strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${planProgress}%` }} /></div><p className="mt-4 text-sm leading-6 text-white/50">Your aim is to learn from real prospects, improve your offer, and build a small body of proof. It is not a promise of earnings or a fixed schedule for getting hired.</p><button type="button" onClick={() => { setCompletedTasks([]); setStatusMessage("Plan checklist reset."); }} className="mt-5 text-xs font-semibold text-white/40 hover:text-white/70">Reset checklist</button></section>
            <section className="space-y-3">{planTasks.map((task) => {
              const checked = completedTasks.includes(task.id);
              return <label key={task.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${checked ? "border-emerald-300/20 bg-emerald-300/[0.045]" : "border-white/10 bg-[#151620]/75 hover:border-white/20"}`}><input type="checkbox" checked={checked} onChange={(event) => setCompletedTasks((current) => event.target.checked ? [...current, task.id] : current.filter((id) => id !== task.id))} className="mt-1 h-4 w-4 shrink-0 accent-emerald-300" /><span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80">{task.week}</span><span className={`mt-1 block text-sm font-semibold ${checked ? "text-white/50 line-through" : "text-white/90"}`}>{task.title}</span><span className="mt-1 block text-sm leading-5 text-white/45">{task.detail}</span></span><Check size={16} className={`ml-auto mt-0.5 shrink-0 ${checked ? "text-emerald-200" : "text-transparent"}`} /></label>;
            })}</section>
          </div>
        )}

        <footer className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>ClientLaunch is an independent toolkit prototype. No income or client results are guaranteed.</p>
          <p>Local-first by design · No AI API · No automated sending</p>
        </footer>
      </div>
    </main>
  );
}
