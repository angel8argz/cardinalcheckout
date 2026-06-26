"use client";

import { useState } from "react";

export type PatronRow = {
  id: number;
  name: string;
  sunetId: string;
  group: string;
  department: string;
  activeCheckouts: number;
};

export function PatronsTable({ rows }: { rows: PatronRow[] }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = q
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.sunetId.toLowerCase().includes(q),
      )
    : rows;

  return (
    <>
      <div className="mb-[18px]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or SUNet ID"
          className="h-[38px] w-full max-w-[360px] rounded-[10px] border border-line bg-white px-3.5 text-sm text-ink outline-none placeholder:text-faint focus:border-cardinal"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <div className="min-w-[720px]">
          <div className="flex items-center gap-4 border-b border-line2 px-[22px] py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">
            <span className="min-w-[200px] flex-[1_0_200px]">Patron</span>
            <span className="w-[120px]">Group</span>
            <span className="w-[180px]">Department</span>
            <span className="w-[140px] text-right">Active checkouts</span>
          </div>

          {visible.length === 0 ? (
            <div className="p-10 text-center text-sm text-faint">
              No patrons match.
            </div>
          ) : (
            visible.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 border-t border-[#F6F3EE] px-[22px] py-[15px] hover:bg-[#FBFAF7]"
              >
                <div className="min-w-[200px] flex-[1_0_200px]">
                  <div className="truncate text-sm font-medium text-ink">
                    {r.name}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-cardinal">
                    {r.sunetId}
                  </div>
                </div>
                <span className="w-[120px] text-[13px] text-muted">
                  {r.group}
                </span>
                <span className="w-[180px] text-[13px] text-muted">
                  {r.department}
                </span>
                <span
                  className={`w-[140px] text-right text-[13px] ${
                    r.activeCheckouts > 0
                      ? "font-semibold text-ink"
                      : "font-medium text-faint"
                  }`}
                >
                  {r.activeCheckouts}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
