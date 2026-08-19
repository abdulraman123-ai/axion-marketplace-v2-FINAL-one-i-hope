import { cn } from "@/lib/utils";

export function ConsoleCard({
  title,
  eyebrow,
  children,
  action,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[1.5rem] border border-border/70 bg-surface/70 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.16)] backdrop-blur sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brand-400">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-text-primary">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
