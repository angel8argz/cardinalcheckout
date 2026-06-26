export function Placeholder({
  title,
  blurb,
}: {
  title: string;
  blurb: string;
}) {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-center px-0 py-[120px] text-center">
      <span className="rounded-full bg-warn-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-warn">
        Coming soon
      </span>
      <h1 className="mt-4 text-[26px] font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">{blurb}</p>
    </div>
  );
}
