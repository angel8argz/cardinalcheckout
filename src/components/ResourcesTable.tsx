"use client";

import { useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import type { ResourceStatus } from "@prisma/client";

export type ResourceRow = {
  id: number;
  name: string;
  barcode: string;
  type: string;
  department: string;
  bundle: string | null;
  status: ResourceStatus;
};

const STATUS_PILL: Record<
  ResourceStatus,
  { label: string; className: string; dotClassName: string }
> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-ok-bg text-ok",
    dotClassName: "bg-ok",
  },
  CHECKED_OUT: {
    label: "Checked out",
    className: "bg-neutral2-bg text-neutral2",
    dotClassName: "bg-neutral2",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className: "bg-warn-bg text-warn",
    dotClassName: "bg-warn",
  },
  LOST: {
    label: "Lost",
    className: "bg-danger-bg text-danger",
    dotClassName: "bg-danger",
  },
  RETIRED: {
    label: "Retired",
    className: "bg-neutral2-bg text-neutral2",
    dotClassName: "bg-neutral2",
  },
};

type Filter = "all" | ResourceStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All resources" },
  { id: "AVAILABLE", label: "Available" },
  { id: "CHECKED_OUT", label: "Checked out" },
  { id: "MAINTENANCE", label: "Maintenance" },
  { id: "LOST", label: "Lost" },
];

export function ResourcesTable({ rows }: { rows: ResourceRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts: Record<Filter, number> = {
    all: rows.length,
    AVAILABLE: rows.filter((r) => r.status === "AVAILABLE").length,
    CHECKED_OUT: rows.filter((r) => r.status === "CHECKED_OUT").length,
    MAINTENANCE: rows.filter((r) => r.status === "MAINTENANCE").length,
    LOST: rows.filter((r) => r.status === "LOST").length,
    RETIRED: rows.filter((r) => r.status === "RETIRED").length,
  };

  const visible =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`inline-flex h-[34px] items-center gap-[7px] rounded-[10px] border px-3.5 text-[13px] font-medium ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink"
              }`}
            >
              {f.label}
              <span
                className={`rounded-[7px] px-[7px] py-px text-[11px] font-semibold ${
                  active ? "bg-white/20 text-white" : "bg-line2 text-muted"
                }`}
              >
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <div className="min-w-[840px]">
          <div className="flex items-center gap-4 border-b border-line2 px-[22px] py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">
            <span className="min-w-[220px] flex-[1_0_220px]">Resource</span>
            <span className="w-[130px]">Type</span>
            <span className="w-[160px]">Department</span>
            <span className="w-[160px]">Bundle</span>
            <span className="w-[130px]">Status</span>
          </div>

          {visible.length === 0 ? (
            <div className="p-10 text-center text-sm text-faint">
              No resources in this view.
            </div>
          ) : (
            visible.map((r) => {
              const pill = STATUS_PILL[r.status];
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 border-t border-[#F6F3EE] px-[22px] py-[15px] hover:bg-[#FBFAF7]"
                >
                  <div className="min-w-[220px] flex-[1_0_220px]">
                    <div className="truncate text-sm font-medium text-ink">
                      {r.name}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-cardinal">
                      {r.barcode}
                    </div>
                  </div>
                  <span className="w-[130px] text-[13px] text-muted">
                    {r.type}
                  </span>
                  <span className="w-[160px] text-[13px] text-muted">
                    {r.department}
                  </span>
                  <span className="w-[160px] text-[13px] text-muted">
                    {r.bundle ?? "—"}
                  </span>
                  <span className="w-[130px]">
                    <StatusPill {...pill} />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
