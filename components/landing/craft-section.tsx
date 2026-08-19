import { CheckCircle2 } from "lucide-react";

const principles = [
  "Research real business problems before defining the product.",
  "Design systems that are practical, structured, and easy to adopt.",
  "Build with the same care expected from premium software.",
  "Review and maintain products after release.",
];

export function CraftSection() {
  return (
    <section className="border-b border-border/80 px-6 py-24 sm:px-12 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-7">
          <div className="rounded-[1.25rem] border border-border bg-background/85 p-5">
            <p className="text-xs uppercase tracking-wider text-text-secondary">
              AXION product standard
            </p>
            <div className="mt-6 space-y-4">
              {principles.map((principle) => (
                <div key={principle} className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {principle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
            Why AXION
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-text-primary sm:text-4xl">
            A catalog built around usefulness, clarity, and long-term value.
          </h2>
          <p className="mt-4 text-base leading-7 text-text-secondary">
            Every AXION product is designed to be practical from the start and easy to keep using after purchase.
          </p>
        </div>
      </div>
    </section>
  );
}
