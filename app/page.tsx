import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ClipboardList,
  Download,
  FileText,
  LockKeyhole,
  MessageSquareText,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const outcomes = [
  {
    icon: Target,
    title: "Turn a skill into a clear offer",
    copy: "Choose one service, one buyer, and a concrete outcome instead of presenting yourself as someone who does everything.",
  },
  {
    icon: BadgeCheck,
    title: "Build proof without faking experience",
    copy: "Plan honest sample projects, label speculative work correctly, and make it easier for buyers to judge your skill.",
  },
  {
    icon: MessageSquareText,
    title: "Write specific outreach",
    copy: "Start from one verified observation and a small, relevant offer—not a generic mass email.",
  },
  {
    icon: CalendarClock,
    title: "Stop losing track of follow-ups",
    copy: "Keep prospects, next actions, replies, proposals, and due dates in one lightweight pipeline.",
  },
];

const included = [
  "Offer clarity worksheet and one-sentence offer builder",
  "Portfolio proof plan for beginners without client testimonials",
  "Prospect tracker with status and follow-up dates",
  "Personalized first-message and respectful follow-up templates",
  "Proposal scope builder and simple project-price sanity check",
  "30-day action plan and optional ChatGPT/Gemini prompts",
];

export default function HomePage() {
  return (
    <main id="content" className="min-h-screen overflow-hidden bg-[#0d0f12] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-44 left-1/2 h-[34rem] w-[44rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.09] blur-[130px]" />
        <div className="absolute right-[-12rem] top-[28rem] h-80 w-80 rounded-full bg-lime-400/[0.06] blur-[110px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 to-lime-200 text-[#102019]">
            <Target size={19} />
          </span>
          <span className="text-lg">ClientLaunch<span className="text-emerald-300">.</span></span>
        </Link>
        <Link href="/studio" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#101a15] transition hover:bg-emerald-100">
          Open workspace <ArrowRight size={16} />
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> A practical first-client toolkit
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.05em] sm:text-6xl">
            You have a skill.<br />
            <span className="bg-gradient-to-r from-emerald-200 via-lime-100 to-white bg-clip-text text-transparent">
              Now turn it into clients.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
            ClientLaunch helps new freelancers move from “I can do the work” to a clear service offer, honest portfolio proof, targeted outreach, and follow-ups they do not forget.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/studio" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3.5 font-semibold text-[#102019] transition hover:bg-emerald-200">
              Try the workspace <ArrowRight size={18} />
            </Link>
            <a href="/api/download" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 font-medium text-white/85 transition hover:bg-white/[0.06]">
              Get the free starter pack <Download size={17} />
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> No monthly lead-tool subscription</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> No AI API key required</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> Your workspace stays in your browser</span>
          </div>
          <p className="mt-4 max-w-xl text-xs leading-5 text-white/35">It is a system for doing the work, not a promise that anyone will get hired or make a certain amount of money.</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-emerald-500/15 to-lime-400/[0.06] blur-2xl" />
          <div className="relative rounded-[1.75rem] border border-white/10 bg-[#15191a]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div><div className="text-sm font-semibold">The client pipeline</div><div className="mt-1 text-xs text-white/45">Example flow · not a real client result</div></div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] text-emerald-100">Simple system</span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-white/45"><Target size={14} /> YOUR OFFER</div>
                <p className="mt-2 text-sm leading-6 text-white/85">“I help weekly podcasts turn long episodes into short clips they can publish consistently.”</p>
              </div>
              <div className="flex justify-center text-emerald-200"><ArrowRight className="rotate-90" size={18} /></div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-white/45"><Users size={14} /> A RELEVANT PROSPECT</div>
                <p className="mt-2 text-sm leading-6 text-white/80">Find one business that fits, record one accurate public observation, and choose a useful next step.</p>
              </div>
              <div className="flex justify-center text-emerald-200"><ArrowRight className="rotate-90" size={18} /></div>
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-100"><TrendingUp size={14} /> NEXT ACTION</div>
                <p className="mt-2 text-sm leading-6 text-white/85">Draft a tailored message, track the reply, and follow up respectfully if appropriate.</p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
              <LockKeyhole size={18} className="mt-0.5 shrink-0 text-emerald-200" />
              <p className="text-xs leading-5 text-white/50">No prospect scraping, no automated email blasts, and no hidden AI costs. You choose the prospects and send any messages yourself.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/[0.08] bg-white/[0.018]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">The real problem</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Doing good work is not the same as winning work.</h2>
            <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">Early freelancers often need structure more than another complicated CRM: what to sell, how to prove it, who to approach, what to say, and what to do next.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {outcomes.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-white/[0.09] bg-[#15191a]/75 p-5 sm:p-6">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><Icon size={19} /></div>
                <div><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{copy}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kit" className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Inside the toolkit</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">A small system you can reuse every week.</h2>
            <p className="mt-4 text-sm leading-6 text-white/55">ClientLaunch is designed as a one-time digital toolkit for solo freelancers and service providers. Start with the browser workspace, then use the worksheets and templates alongside the tools you already have.</p>
            <Link href="/studio" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3.5 text-sm font-semibold text-[#102019] transition hover:bg-emerald-200">Build my first pipeline <ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-white/[0.09] bg-white/[0.025] p-4"><ClipboardList size={17} className="mt-0.5 shrink-0 text-emerald-200" /><p className="text-sm leading-6 text-white/75">{item}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-5 rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-emerald-400/[0.09] to-lime-300/[0.025] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div><h2 className="text-2xl font-semibold tracking-tight">Start with one real prospect.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Set your offer, save a carefully chosen lead, draft a specific message, and keep track of the next step.</p></div>
          <Link href="/studio" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-[#102019] transition hover:bg-emerald-100">Open ClientLaunch <ArrowRight size={17} /></Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>ClientLaunch · An independent digital-product prototype</p>
          <p>Keep outreach relevant, respect opt-outs, and check local rules before contacting prospects.</p>
        </div>
      </footer>
    </main>
  );
}
