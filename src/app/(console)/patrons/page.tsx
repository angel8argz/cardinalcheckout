import { prisma } from "@/lib/prisma";
import { PatronsTable, type PatronRow } from "@/components/PatronsTable";
import { AllocationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function PatronsPage() {
  const patrons = await prisma.patron.findMany({
    include: {
      patronGroup: true,
      department: true,
      _count: {
        select: {
          allocations: { where: { status: AllocationStatus.CHECKED_OUT } },
        },
      },
    },
    orderBy: { lastName: "asc" },
  });

  const rows: PatronRow[] = patrons.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    sunetId: p.sunetId,
    group: p.patronGroup?.name ?? "—",
    department: p.department?.name ?? "—",
    activeCheckouts: p._count.allocations,
  }));

  return (
    <div className="max-w-[1180px]">
      <div className="mb-5">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">
          Patrons
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Look up patrons by name or SUNet ID — {rows.length} on file.
        </p>
      </div>
      <PatronsTable rows={rows} />
    </div>
  );
}
