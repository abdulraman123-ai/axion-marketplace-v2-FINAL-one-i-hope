import Link from "next/link";
import { ArrowRight, AudioLines, Check, Mic2, Sparkles, Volume2, WandSparkles } from "lucide-react";

const steps = [
  { number: "01", icon: Mic2, title: "Say what’s on your mind", copy: "Talk naturally or paste a rough note. No need to get the words perfect." },
  { number: "02", icon: Sparkles, title: "Choose what you need", copy: "Make it clearer, summarise it, shape it into notes, or draft a reply." },
  { number: "03", icon: Volume2, title: "Use it straight away", copy: "Copy your result or have your browser read it aloud." },
];

const uses = [
  { icon: AudioLines, title: "Quick thoughts", copy: "Catch ideas before they disappear." },
  { icon: WandSparkles, title: "Writing help", copy: "Turn messy first drafts into clear writing." },
  { icon: Check, title: "Study & debate notes", copy: "Organise points, questions, and next steps." },
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
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-[#17111f]"><AudioLines size={19} /></span>
          <span className="text-lg">VoxKit<span className="text-violet-300">.</span></span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#how-it-works" className="hidden text-white/65 transition hover:text-white sm:block">How it works</a>
          <Link href="/studio" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-semibold text-[#17111f] transition hover:bg-violet-100">
            Try the studio <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.08fr_.92fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-3 py-1.5 text-xs font-medium text-violet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Your voice, made useful
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.07] tracking-[-0.05em] sm:text-6xl">
            Talk it out.<br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-100 bg-clip-text text-transparent">Get it written right.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
            Turn spoken thoughts and rough notes into clear writing, useful summaries, study notes, or replies — all from one simple workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/studio" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-300 px-5 py-3.5 font-semibold text-[#17111f] transition hover:bg-violet-200">
              Open the free studio <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3.5 font-medium text-white/85 transition hover:bg-white/[0.06]">
              See how it works
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> No account needed for basic tools</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> Your text is not saved by this prototype</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-2xl" />
          <div className="relative rounded-[1.75rem] border border-white/10 bg-[#151620]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div><div className="text-sm font-semibold">A thought, made clear</div><div className="mt-1 text-xs text-white/45">A quick example of VoxKit</div></div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] text-emerald-200">Example</span>
            </div>
            <div className="mt-5 rounded-2xl bg-white/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/45"><Mic2 size={14} /> YOUR ROUGH THOUGHT</div>
              <p className="text-sm leading-6 text-white/75">“I have a lot to do tomorrow and I keep forgetting what comes first so I need to make some sort of plan.”</p>
            </div>
            <div className="my-3 flex justify-center text-violet-300"><ArrowRight className="rotate-90" size={18} /></div>
            <div className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.07] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-200"><Sparkles size={14} /> CLEAR RESULT</div>
              <p className="text-sm leading-6 text-white/90">“Help me prioritise tomorrow’s tasks by urgency and importance, then turn them into a simple plan I can follow.”</p>
              <div className="mt-3 text-[11px] text-white/40">Illustrative example — AI results require a configured provider.</div>
            </div>
            <Link href="/studio" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.12]">Try it with your own words <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 border-y border-white/[0.08] bg-white/[0.018]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Simple on purpose</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Three steps. No confusing dashboard.</h2>
            <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">You bring the thought. VoxKit helps you turn it into something you can use.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {steps.map(({number, icon: Icon, title, copy}) => (
              <div key={number} className="rounded-2xl border border-white/[0.09] bg-[#151620]/75 p-5 sm:p-6">
                <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.18em] text-white/30">{number}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><Icon size={19} /></span></div>
                <h3 className="mt-6 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Made for real life</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Less wrestling with words. More getting things done.</h2></div>
          <p className="max-w-md text-sm leading-6 text-white/55">Use it for quick thoughts, class notes, work messages, planning, or preparing arguments. Start with the simplest version and add AI when you choose to configure it.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {uses.map(({icon: Icon, title, copy}) => <div key={title} className="flex gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.025] p-5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-violet-200"><Icon size={19} /></div><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1.5 text-sm leading-6 text-white/50">{copy}</p></div></div>)}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-5 rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-400/[0.11] to-fuchsia-400/[0.04] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div><h2 className="text-2xl font-semibold tracking-tight">Ready to get the words out of your head?</h2><p className="mt-2 text-sm leading-6 text-white/55">Open the studio. Start by speaking or typing one thought.</p></div>
          <Link href="/studio" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-[#17111f] transition hover:bg-violet-100">Try VoxKit <ArrowRight size={17} /></Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} VoxKit. An independent product prototype.</p><p>AI processing is optional and requires a separately configured provider. Not affiliated with OpenAI.</p></div>
      </footer>
    </main>
  );
}
