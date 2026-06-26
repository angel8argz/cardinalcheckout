import { prisma } from "@/lib/prisma";
import { ResourcesTable, type ResourceRow } from "@/components/ResourcesTable";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    include: { resourceType: true, department: true, bundle: true },
    orderBy: [{ resourceType: { name: "asc" } }, { name: "asc" }],
  });

  const rows: ResourceRow[] = resources.map((r) => ({
    id: r.id,
    name: r.name,
    barcode: r.barcode,
    type: r.resourceType.name,
    department: r.department?.name ?? "—",
    bundle: r.bundle?.name ?? null,
    status: r.status,
  }));

  return (
    <div className="max-w-[1180px]">
      <div className="mb-5">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">
          Resources
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          The full equipment catalog — {rows.length} resources across the desk.
        </p>
      </div>
      <ResourcesTable rows={rows} />
    </div>
  );
}
