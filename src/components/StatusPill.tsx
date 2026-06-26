export function StatusPill({
  label,
  className,
  dotClassName,
}: {
  label: string;
  className: string;
  dotClassName: string;
}) {
  return (
    <span
      className={`inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-[10px] px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <span className={`h-1.5 w-1.5 flex-none rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}
