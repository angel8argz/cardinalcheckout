export type CheckoutState = "overdue" | "dueToday" | "onTime";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// State is derived from the scheduled return date's calendar day. Only
// meaningful for active (checked-out, not yet returned) allocations.
export function getCheckoutState(scheduledEnd: Date): CheckoutState {
  const start = startOfToday();
  const startOfTomorrow = new Date(start);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  if (scheduledEnd < start) return "overdue";
  if (scheduledEnd < startOfTomorrow) return "dueToday";
  return "onTime";
}

export const STATE_PILL: Record<
  CheckoutState,
  { label: string; className: string; dotClassName: string }
> = {
  overdue: {
    label: "Overdue",
    className: "bg-danger-bg text-danger",
    dotClassName: "bg-danger",
  },
  dueToday: {
    label: "Due today",
    className: "bg-warn-bg text-warn",
    dotClassName: "bg-warn",
  },
  onTime: {
    label: "Checked out",
    className: "bg-neutral2-bg text-neutral2",
    dotClassName: "bg-neutral2",
  },
};

const MS_PER_DAY = 86_400_000;

// Human-readable timing relative to today, e.g. "2d late", "Due today", "In 3d".
export function timingLabel(scheduledEnd: Date): string {
  const start = startOfToday();
  const dueDay = new Date(scheduledEnd);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDay.getTime() - start.getTime()) / MS_PER_DAY);

  if (diffDays < 0) {
    const n = Math.abs(diffDays);
    return `${n}d late`;
  }
  if (diffDays === 0) return "Due today";
  return `In ${diffDays}d`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
