import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  MessageCircle,
  Mic2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const outcomes = [
  {
    icon: Mic2,
    title: "Clean up spoken thoughts",
    copy: "Turn voice transcripts, unfinished sentences, and rough notes into clear, natural writing without losing your meaning.",
  },
  {
    icon: BookOpen,
    title: "Make study notes",
    copy: "Summarise key ideas, structure information into bullets, and create useful review questions.",
  },
  {
    icon: MessageCircle,
    title: "Prepare debate arguments",
    copy: "Organise claims, reasons, counterarguments, rebuttals, and questions without inventing evidence or quotations.",
  },
  {
    icon: WandSparkles,
    title: "Write messages that sound human",
    copy: "Polish professional messages, drafts, replies, and posts while keeping your voice.",
  },
];

const steps = [
  {
    number: "01",
    title: "Download VoxKit",
    copy: "Get the small skills-only plugin package. It includes a manifest and the reusable writing workflow.",
  },
  {
    number: "02",
    title: "Use or submit the package",
    copy: "Use its instructions while building your workflow, or submit the package through OpenAI’s official plugin directory for validation and review.",
  },
  {
    number: "03",
    title: "Run the workflow in ChatGPT",
    copy: "Once the plugin is approved and available to your account, use VoxKit with the ChatGPT capabilities your account already provides.",
  },
];

export default function HomePage() {
  return (
    <main id="content" className="min-h-screen overflow-hidden bg-[#0d0e14] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute right-[-12rem] top-[28rem] h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-[#17111f]">
            <Sparkles size={19} />
          </span>
          <span className="text-lg">VoxKit<span className="text-violet-300">.</span></span>
        </Link>
        <a
          href="/api/download"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#17111f] transition hover:bg-violet-100"
        >
          <Download size={16} /> Get the package
        </a>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.08fr_.92fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-3 py-1.5 text-xs font-medium text-violet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> A ChatGPT workflow product
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.07] tracking-[-0.05em] sm:text-6xl">
            Your ideas.<br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-100 bg-clip-text text-transparent">
              Clearer words in ChatGPT.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
            VoxKit is a reusable writing workflow package for turning rough thoughts, speech transcripts, and notes into clear writing, study notes, debate preparation, and thoughtful replies — using the AI available in ChatGPT rather than a separate AI API on this website.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/api/download"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-300 px-5 py-3.5 font-semibold text-[#17111f] transition hover:bg-violet-200"
            >
              Download the skill package <Download size={18} />
            </a>
            <a
              href="https://developers.openai.com/plugins/deploy/submission"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 font-medium text-white/85 transition hover:bg-white/[0.06]"
            >
              Publishing guide <ArrowRight size={16} />
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> No API key in the package</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> No Gemini integration</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> No seller-paid AI requests configured</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-2xl" />
          <div className="relative rounded-[1.75rem] border border-white/10 bg-[#151620]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-sm font-semibold">Inside the VoxKit workflow</div>
                <div className="mt-1 text-xs text-white/45">Example prompt transformation</div>
              </div>
              <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-[11px] text-violet-200">Example</span>
            </div>
            <div className="mt-5 rounded-2xl bg-white/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/45"><Mic2 size={14} /> YOUR ROUGH THOUGHT</div>
              <p className="text-sm leading-6 text-white/75">“I need to prepare for the debate and understand my point, the reason behind it, and what the other side might say.”</p>
            </div>
            <div className="my-3 flex justify-center text-violet-300"><ArrowRight className="rotate-90" size={18} /></div>
            <div className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.07] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-200"><Sparkles size={14} /> STRUCTURED RESULT</div>
              <p className="text-sm leading-6 text-white/90">Main claim · Supporting reasons · Evidence to verify · Strongest counterargument · Fair rebuttal · Cross-examination questions</p>
              <div className="mt-3 text-[11px] text-white/40">VoxKit guides the workflow; ChatGPT generates the response when the plugin is available.</div>
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-300" />
              <p className="text-xs leading-5 text-white/55">No direct AI API is called from this product website. The package is a draft and is not yet an approved public listing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/[0.08] bg-white/[0.018]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">One small workflow, many uses</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">From messy thoughts to something you can use.</h2>
            <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">VoxKit tells ChatGPT how to shape the work. You stay in control of what you provide and what you keep.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {outcomes.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-white/[0.09] bg-[#151620]/75 p-5 sm:p-6">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><Icon size={19} /></div>
                <div><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{copy}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Three steps</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">A portable ChatGPT product, not another AI bill.</h2>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {steps.map(({ number, title, copy }) => (
            <div key={number} className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-5 sm:p-6">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.18em] text-white/30">{number}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><Check size={19} /></span></div>
              <h3 className="mt-6 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-5 rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-400/[0.11] to-fuchsia-400/[0.04] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div><h2 className="text-2xl font-semibold tracking-tight">Get the VoxKit package</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Download the manifest and skill instructions. Public ChatGPT availability requires OpenAI's validation and review process.</p></div>
          <a href="/api/download" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-[#17111f] transition hover:bg-violet-100">Download ZIP <Download size={17} /></a>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VoxKit. An independent digital product prototype.</p>
          <p>Not affiliated with or endorsed by OpenAI. The public listing is not yet approved.</p>
        </div>
      </footer>
    </main>
  );
}
