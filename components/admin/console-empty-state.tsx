export function ConsoleEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/50 px-6 py-10 text-center">
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-text-secondary">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
