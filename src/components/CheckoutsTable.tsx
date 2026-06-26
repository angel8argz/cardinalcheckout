"use client";

import { useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { STATE_PILL, type CheckoutState } from "@/lib/checkouts";

export type CheckoutRow = {
  id: number;
  resource: string;
  extra: number;
  barcode: string;
  patron: string;
  operator: string;
  window: string;
  state: CheckoutState;
  timing: string;
};

type Filter = "all" | CheckoutState;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All checkouts" },
  { id: "overdue", label: "Overdue" },
  { id: "dueToday", label: "Due today" },
  { id: "onTime", label: "Checked out" },
];

export function CheckoutsTable({ rows }: { rows: CheckoutRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts: Record<Filter, number> = {
    all: rows.length,
    overdue: rows.filter((r) => r.state === "overdue").length,
    dueToday: rows.filter((r) => r.state === "dueToday").length,
    onTime: rows.filter((r) => r.state === "onTime").length,
  };

  const visible =
    filter === "all" ? rows : rows.filter((r) => r.state === filter);

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
            <span className="min-w-[200px] flex-[1_0_200px]">Resource</span>
            <span className="w-[140px]">Patron</span>
            <span className="w-[120px]">Operator</span>
            <span className="w-[130px]">Window</span>
            <span className="w-[120px]">Status</span>
            <span className="w-[84px] text-right">Timing</span>
          </div>

          {visible.length === 0 ? (
            <div className="p-10 text-center text-sm text-faint">
              No checkouts in this view.
            </div>
          ) : (
            visible.map((r) => {
              const pill = STATE_PILL[r.state];
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 border-t border-[#F6F3EE] px-[22px] py-[15px] hover:bg-[#FBFAF7]"
                >
                  <div className="min-w-[200px] flex-[1_0_200px]">
                    <div className="truncate text-sm font-medium text-ink">
                      {r.resource}
                      {r.extra > 0 && (
                        <span className="ml-1.5 text-xs font-normal text-faint">
                          +{r.extra} more
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-cardinal">
                      {r.barcode}
                    </div>
                  </div>
                  <span className="w-[140px] text-[13px] font-medium text-ink">
                    {r.patron}
                  </span>
                  <span className="w-[120px] text-[13px] text-muted">
                    {r.operator}
                  </span>
                  <span className="w-[130px] text-[13px] text-muted">
                    {r.window}
                  </span>
                  <span className="w-[120px]">
                    <StatusPill {...pill} />
                  </span>
                  <span
                    className={`w-[84px] text-right text-[13px] ${
                      r.state === "overdue"
                        ? "font-semibold text-danger"
                        : "font-medium text-muted"
                    }`}
                  >
                    {r.timing}
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
