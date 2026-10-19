"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  Clipboard,
  Download,
  LoaderCircle,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  WandSparkles,
} from "lucide-react";

type Task = "improve" | "summary" | "bullets" | "professional" | "debate" | "reply";
type AIStatus = "checking" | "ready" | "chatgpt" | "disabled";

const tasks: { id: Task; label: string; short: string }[] = [
  { id: "improve", label: "Make it clearer", short: "Clear, natural writing" },
  { id: "summary", label: "Summarise", short: "Keep the main ideas" },
  { id: "bullets", label: "Make bullet points", short: "Easy-to-scan notes" },
  { id: "professional", label: "Make it professional", short: "Polished but human" },
  { id: "debate", label: "Organise my argument", short: "Claims, reasons, questions" },
  { id: "reply", label: "Draft a reply", short: "A response based on your notes" },
];

type RecognitionResult = { transcript: string };
type RecognitionItem = { isFinal: boolean; 0: RecognitionResult };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionItem> };
type RecognitionError = { error: string };
type RecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionError) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => RecognitionInstance;
  webkitSpeechRecognition?: new () => RecognitionInstance;
};

function createPrompt(text: string, task: Task) {
  const instructions: Record<Task, string> = {
    improve: "Rewrite this in clear, natural language. Preserve the original meaning and all important details. Do not invent facts.",
    summary: "Summarise this in a compact, easy-to-understand way. Keep the central points and any important names, dates, or figures. Do not add facts.",
    bullets: "Turn this into useful, logically grouped bullet points. Keep key details and remove repetition without changing the meaning.",
    professional: "Rewrite this in polished, professional but natural language. Do not make it stiff or overly formal. Preserve the user's intent.",
    debate: "Organise these notes for a debate: (1) main claim, (2) supporting reasons, (3) evidence that still needs checking, (4) strongest likely objection, and (5) useful follow-up questions. Do not invent quotations or sources.",
    reply: "Draft a clear, respectful reply based only on these notes. If the intended recipient or tone is unclear, make a reasonable neutral choice and do not invent personal details.",
  };
  return `Please help me with this text.\nTask: ${instructions[task]}\n\nText:\n${text}\n\nKeep the result useful and direct. If the input contains factual claims, do not present unsupported claims as verified facts.`;
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();
}

function bulletText(value: string) {
  const sentences = (value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).map((item) => item.trim()).filter(Boolean);
  return sentences.map((sentence) => `• ${sentence}`).join("\n");
}

export function StudioClient() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [task, setTask] = useState<Task>("improve");
  const [language, setLanguage] = useState("en-US");
  const [status, setStatus] = useState("Type a thought or tap the microphone to begin.");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus>("checking");
  const [prompt, setPrompt] = useState("");
  const recognitionRef = useRef<RecognitionInstance | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/ai/process", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { available?: boolean }) => {
        if (alive) setAiStatus(data.available ? "ready" : "chatgpt");
      })
      .catch(() => { if (alive) setAiStatus("chatgpt"); });
    return () => { alive = false; };
  }, []);

  useEffect(() => () => {
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function startListening() {
    setError("");
    const speechWindow = window as SpeechWindow;
    const SpeechRecognitionAPI = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setStatus("Speech input is not available in this browser. You can type below or try the latest Chrome or Edge.");
      return;
    }
    try { recognitionRef.current?.stop(); } catch { /* ignore an old session */ }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let added = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        added += ` ${event.results[i][0].transcript}`;
      }
      if (added.trim()) setText((current) => `${current} ${added.trim()}`.trim());
    };
    recognition.onerror = (event) => {
      setError(event.error === "not-allowed" ? "Microphone permission was blocked. Allow microphone access in your browser and try again." : `Speech input stopped: ${event.error}. You can keep typing.`);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setStatus("Voice capture stopped. You can edit your words before processing them.");
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setStatus("Listening… speak naturally, then tap Stop.");
    } catch {
      setListening(false);
      setStatus("Could not start the microphone. Try again or type your words.");
    }
  }

  function stopListening() {
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  }

  async function copyToClipboard(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(successMessage);
      setError("");
    } catch {
      setError("Clipboard access was blocked. Select the text and copy it manually.");
    }
  }

  async function processText() {
    if (!text.trim()) {
      setError("Add a few words first — either speak or type in the box above.");
      return;
    }
    setError("");
    setResult("");
    setBusy(true);
    const promptText = createPrompt(text.trim(), task);
    try {
      if (aiStatus === "ready") {
        const response = await fetch("/api/ai/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim(), task }),
        });
        const data = await response.json() as { result?: string; error?: string };
        if (!response.ok || !data.result) throw new Error(data.error || "AI processing did not finish. Try again.");
        setResult(data.result);
        setStatus("Done. Review the result, then copy it or hear it aloud.");
      } else {
        setPrompt(promptText);
        await copyToClipboard(promptText, "Prompt copied. Paste it into the ChatGPT tab, then bring ChatGPT’s answer back into the result box.");
        window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
        setStatus("Free handoff ready: paste the copied prompt into ChatGPT. Then paste its answer into Your result.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function applyQuickTool(mode: "clean" | "bullets") {
    if (!text.trim()) {
      setError("Type or dictate something first.");
      return;
    }
    setError("");
    setResult(mode === "clean" ? cleanText(text) : bulletText(cleanText(text)));
    setStatus(mode === "clean" ? "Spacing cleaned locally. No AI request was sent." : "Bullet points prepared locally. No AI request was sent.");
  }

  function speakResult() {
    const value = result.trim();
    if (!value) { setError("Create or paste a result first."); return; }
    if (!("speechSynthesis" in window)) { setError("Text-to-speech is not available in this browser."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = language;
    utterance.onstart = () => setStatus("Reading your result aloud…");
    utterance.onend = () => setStatus("Finished reading your result.");
    utterance.onerror = () => setError("Speech playback could not complete in this browser.");
    window.speechSynthesis.speak(utterance);
  }

  function downloadResult() {
    if (!result.trim()) { setError("There is no result to download yet."); return; }
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "voxkit-result.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Result downloaded as a text file.");
  }

  return (
    <main id="content" className="min-h-screen bg-[#0d0e14] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[34rem] w-[46rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[130px]" />
      </div>
      <header className="relative mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-fuchsia-300 text-[#17111f]"><AudioLines size={19} /></span>
          <span className="text-lg">VoxKit<span className="text-violet-300">.</span></span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"><ArrowLeft size={16} /> Back to home</Link>
      </header>

      <section className="relative mx-auto max-w-3xl px-5 pb-16 pt-5 sm:pt-10">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.07] px-3 py-1.5 text-xs font-medium text-violet-200"><Sparkles size={13} /> Your personal writing space</div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">What would you like to say?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">Speak or type a rough thought. Pick what you want to do with it. VoxKit helps you get to a result you can use.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#151620]/95 p-4 shadow-2xl shadow-black/20 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="source-text" className="text-sm font-semibold">1. Your words</label>
            <select aria-label="Speech language" value={language} onChange={(event) => setLanguage(event.target.value)} className="max-w-[155px] rounded-lg border border-white/10 bg-[#0d0e14] px-2.5 py-2 text-xs text-white/70 outline-none focus:border-violet-300/50">
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="tr-TR">Turkish</option>
              <option value="ar-SA">Arabic</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="es-ES">Spanish</option>
            </select>
          </div>
          <textarea
            id="source-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={12000}
            placeholder="For example: I need to explain my idea clearly, but I don't know where to start…"
            className="mt-3 min-h-[180px] w-full resize-y rounded-2xl border border-white/10 bg-[#0c0d13] p-4 text-sm leading-7 text-white outline-none placeholder:text-white/25 focus:border-violet-300/45"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {listening ? (
                <button type="button" onClick={stopListening} className="inline-flex items-center gap-2 rounded-xl border border-rose-300/25 bg-rose-300/10 px-3.5 py-2.5 text-sm font-semibold text-rose-100"><MicOff size={16} /> Stop listening</button>
              ) : (
                <button type="button" onClick={startListening} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/10 px-3.5 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-300/[0.16]"><Mic size={16} /> Speak instead</button>
              )}
              <button type="button" onClick={() => { setText(""); setResult(""); setPrompt(""); setError(""); setStatus("Start by speaking or typing below."); }} className="rounded-xl px-3 py-2.5 text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white/80">Clear</button>
            </div>
            <span className="text-xs text-white/35">{text.length.toLocaleString()} / 12,000</span>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-[#151620]/80 p-4 sm:p-6">
          <div className="text-sm font-semibold">2. What should VoxKit do?</div>
          <p className="mt-1 text-sm text-white/45">Choose one. You can always try another.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {tasks.map((item) => {
              const selected = task === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setTask(item.id)} aria-pressed={selected} className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${selected ? "border-violet-300/40 bg-violet-300/[0.09]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"}`}>
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? "border-violet-200 bg-violet-200 text-[#17111f]" : "border-white/20 text-transparent"}`}>{selected ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-transparent" />}</span>
                  <span><span className="block text-sm font-medium">{item.label}</span><span className="mt-1 block text-xs text-white/40">{item.short}</span></span>
                </button>
              );
            })}
          </div>

          <button type="button" disabled={busy || !text.trim()} onClick={processText} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-300 to-fuchsia-300 px-5 py-3.5 text-sm font-bold text-[#191321] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <><LoaderCircle size={17} className="animate-spin" /> Working…</> : <><WandSparkles size={17} /> {aiStatus === "ready" ? "Generate with AI" : "Continue with ChatGPT (free)"} <ArrowRight size={17} /></>}
          </button>
          {aiStatus === "checking" && <p className="mt-3 text-center text-xs text-white/35">Checking whether direct AI is configured…</p>}
          {aiStatus === "ready" ? (
            <p className="mt-3 text-center text-xs leading-5 text-white/40">Direct AI is configured for this site. Clicking Generate sends this text to the configured AI provider; usage may cost the site owner.</p>
          ) : (
            <p className="mt-3 text-center text-xs leading-5 text-white/40">Free mode copies a ready-made prompt and opens ChatGPT. Paste the prompt there, then paste ChatGPT’s answer into the result box below. No API charge is triggered by VoxKit.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.07] pt-4">
            <span className="text-xs text-white/35">Or try a quick tool with no AI:</span>
            <button type="button" onClick={() => applyQuickTool("clean")} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65 transition hover:bg-white/[0.06]">Clean up text</button>
            <button type="button" onClick={() => applyQuickTool("bullets")} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65 transition hover:bg-white/[0.06]">Bullet points</button>
          </div>
        </div>

        {prompt && aiStatus !== "ready" && (
          <div className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-300/[0.045] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-100"><Clipboard size={16} /> Your ChatGPT prompt is ready</div>
            <p className="mt-1 text-xs leading-5 text-white/50">It should already be copied. If not, copy it here. In ChatGPT, paste the prompt and send it.</p>
            <textarea readOnly value={prompt} className="mt-3 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/65 outline-none" />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => void copyToClipboard(prompt, "Prompt copied. Paste it into ChatGPT.")} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/80"><Clipboard size={14} /> Copy prompt</button>
              <a href="https://chatgpt.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#17111f]">Open ChatGPT <ArrowRight size={13} /></a>
            </div>
          </div>
        )}

        {error && <div role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/[0.08] px-4 py-3 text-sm leading-6 text-rose-100">{error}</div>}
        <div aria-live="polite" className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs leading-5 text-white/50">{status}</div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-[#151620]/95 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="text-sm font-semibold">3. Your result</div><p className="mt-1 text-xs text-white/40">Review it, edit it, copy it, or listen to it.</p></div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/40">Editable</span>
          </div>
          <textarea value={result} onChange={(event) => setResult(event.target.value)} placeholder="Your improved text will appear here. If you used ChatGPT, paste its answer here." className="mt-4 min-h-[180px] w-full resize-y rounded-2xl border border-white/10 bg-[#0c0d13] p-4 text-sm leading-7 text-white outline-none placeholder:text-white/25 focus:border-violet-300/45" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={!result.trim()} onClick={() => void copyToClipboard(result, "Result copied to clipboard.")} className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-[#17111f] disabled:opacity-35"><Clipboard size={15} /> Copy result</button>
            <button type="button" disabled={!result.trim()} onClick={speakResult} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-medium text-white/80 disabled:opacity-35"><Volume2 size={15} /> Listen</button>
            <button type="button" disabled={!result.trim()} onClick={downloadResult} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-medium text-white/80 disabled:opacity-35"><Download size={15} /> Download</button>
            <button type="button" onClick={() => { setText(result); setResult(""); setStatus("Result moved back into the input. Choose another action to continue."); }} disabled={!result.trim()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-medium text-white/80 disabled:opacity-35">Use as input <ArrowRight size={15} /></button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs leading-5 text-white/30">VoxKit does not save your text to a database. In free handoff mode, you choose what to send to ChatGPT. Speech recognition is browser-dependent.</div>
        <div className="mt-6 text-center"><Link href="/" className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"><ArrowLeft size={15} /> Back to VoxKit home</Link></div>
      </section>
    </main>
  );
}
