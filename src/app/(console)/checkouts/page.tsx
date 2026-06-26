import { prisma } from "@/lib/prisma";
import {
  getCheckoutState,
  timingLabel,
  formatDate,
  type CheckoutState,
} from "@/lib/checkouts";
import { CheckoutsTable, type CheckoutRow } from "@/components/CheckoutsTable";
import { AllocationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CheckoutsPage() {
  const allocations = await prisma.allocation.findMany({
    where: { status: AllocationStatus.CHECKED_OUT },
    include: {
      patron: true,
      operator: true,
      lineItems: { include: { resource: true } },
    },
    orderBy: { scheduledEnd: "asc" },
  });

  const rows: CheckoutRow[] = allocations.map((a) => {
    const state: CheckoutState = getCheckoutState(a.scheduledEnd);
    const first = a.lineItems[0]?.resource;
    return {
      id: a.id,
      resource: first?.name ?? "—",
      extra: Math.max(0, a.lineItems.length - 1),
      barcode: first?.barcode ?? "",
      patron: `${a.patron.firstName} ${a.patron.lastName}`,
      operator: a.operator?.name ?? "—",
      window: `${formatDate(a.scheduledStart)} → ${formatDate(a.scheduledEnd)}`,
      state,
      timing: timingLabel(a.scheduledEnd),
    };
  });

  return (
    <div className="max-w-[1180px]">
      <div className="mb-5">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">
          Checkouts
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Every open checkout on the floor — outgoing and coming back.
        </p>
      </div>
      <CheckoutsTable rows={rows} />
    </div>
  );
}
