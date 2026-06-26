import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Check,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ResourceStatus, AllocationStatus } from "@prisma/client";
import { StatusPill } from "@/components/StatusPill";
import { getCheckoutState, STATE_PILL, timingLabel } from "@/lib/checkouts";

export const dynamic = "force-dynamic";

type CheckoutWithRels = Awaited<ReturnType<typeof loadCheckouts>>[number];

function loadCheckouts() {
  return prisma.allocation.findMany({
    where: { status: AllocationStatus.CHECKED_OUT },
    include: {
      patron: true,
      lineItems: { include: { resource: true } },
    },
    orderBy: { scheduledEnd: "asc" },
  });
}

function CheckoutRow({ checkout }: { checkout: CheckoutWithRels }) {
  const state = getCheckoutState(checkout.scheduledEnd);
  const pill = STATE_PILL[state];
  const first = checkout.lineItems[0]?.resource;
  const extra = Math.max(0, checkout.lineItems.length - 1);
  return (
    <div className="flex items-center gap-3.5 rounded-[10px] px-2.5 py-3 hover:bg-canvas">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">
          {first?.name ?? "—"}
          {extra > 0 && (
            <span className="ml-1.5 text-xs font-normal text-faint">
              +{extra} more
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {checkout.patron.firstName} {checkout.patron.lastName} ·{" "}
          <span className="font-mono text-xs text-cardinal">
            {first?.barcode ?? ""}
          </span>
        </div>
      </div>
      <StatusPill {...pill} />
      <div className="w-[84px] text-right text-xs font-medium text-muted">
        {timingLabel(checkout.scheduledEnd)}
      </div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  blurb,
  checkouts,
  empty,
}: {
  icon: LucideIcon;
  title: string;
  blurb: string;
  checkouts: CheckoutWithRels[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className="h-[17px] w-[17px] text-muted" strokeWidth={1.8} />
          <h2 className="text-[17px] font-semibold">{title}</h2>
        </div>
        <Link href="/checkouts" className="text-[13px] font-medium text-cardinal">
          View all
        </Link>
      </div>
      <p className="mb-2.5 text-xs text-faint">{blurb}</p>
      {checkouts.length === 0 ? (
        <div className="px-2.5 py-8 text-center text-[13px] text-faint">
          {empty}
        </div>
      ) : (
        checkouts.map((checkout) => (
          <CheckoutRow key={checkout.id} checkout={checkout} />
        ))
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const [activeCheckouts, availableCount] = await Promise.all([
    loadCheckouts(),
    prisma.resource.count({ where: { status: ResourceStatus.AVAILABLE } }),
  ]);

  const withState = activeCheckouts.map((checkout) => ({
    checkout,
    state: getCheckoutState(checkout.scheduledEnd),
  }));

  const overdue = withState.filter((r) => r.state === "overdue");
  const dueToday = withState.filter((r) => r.state === "dueToday");
  const onTime = withState.filter((r) => r.state === "onTime");

  const kpis = [
    {
      label: "Checked out",
      value: activeCheckouts.length,
      sub: "checkouts on the floor",
      icon: ArrowRight,
      accent: "text-neutral2",
      card: "bg-neutral2-bg border-l-4 border-neutral2",
    },
    {
      label: "Due today",
      value: dueToday.length,
      sub: "expected back today",
      icon: Clock,
      accent: "text-warn",
      card: "bg-warn-bg border-l-4 border-warn",
    },
    {
      label: "Overdue",
      value: overdue.length,
      sub: "checkouts past due",
      icon: AlertTriangle,
      accent: "text-danger",
      card: "bg-danger-bg border-l-4 border-danger",
    },
    {
      label: "Available",
      value: availableCount,
      sub: "ready to check out",
      icon: Check,
      accent: "text-ok",
      card: "bg-ok-bg border-l-4 border-ok",
    },
  ];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Incoming = coming back (overdue first, then due today); outgoing = on time.
  const incoming = [...overdue, ...dueToday].map((r) => r.checkout);
  const outgoing = onTime.map((r) => r.checkout);

  return (
    <div className="max-w-[1180px]">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {today} · {activeCheckouts.length} active checkouts on the floor
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] bg-ok-bg px-3.5 py-1.5 text-[13px] font-medium text-ok">
          <span className="h-[7px] w-[7px] rounded-full bg-ok" />
          System healthy
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={`rounded-2xl p-5 shadow-card ${k.card}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  {k.label}
                </span>
                <Icon className={`h-[18px] w-[18px] ${k.accent}`} strokeWidth={1.9} />
              </div>
              <div className="mt-3.5 text-[34px] font-bold leading-none tracking-tight">
                {k.value}
              </div>
              <div className="mt-1.5 text-[13px] text-muted">{k.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          icon={ArrowRight}
          title="Outgoing"
          blurb="Active checkouts on time and out on the floor"
          checkouts={outgoing}
          empty="Nothing out on time right now."
        />
        <Panel
          icon={ArrowLeft}
          title="Incoming"
          blurb="Due back or overdue to the desk"
          checkouts={incoming}
          empty="Nothing due back right now."
        />
      </div>
    </div>
  );
}
