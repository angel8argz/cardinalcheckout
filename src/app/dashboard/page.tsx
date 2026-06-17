import { prisma } from "@/lib/prisma";
import { ItemStatus } from "@prisma/client";

// Always read fresh data from the database.
export const dynamic = "force-dynamic";

type LoanState = "overdue" | "dueToday" | "onTime";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Active loans only. State is derived from the due date's calendar day.
function getLoanState(dueAt: Date): LoanState {
  const start = startOfToday();
  const startOfTomorrow = new Date(start);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  if (dueAt < start) return "overdue";
  if (dueAt < startOfTomorrow) return "dueToday";
  return "onTime";
}

const STATE_LABEL: Record<LoanState, string> = {
  overdue: "Overdue",
  dueToday: "Due today",
  onTime: "On time",
};

const STATE_BADGE: Record<LoanState, string> = {
  overdue: "bg-red-100 text-red-800 ring-red-600/20",
  dueToday: "bg-amber-100 text-amber-800 ring-amber-600/20",
  onTime: "bg-green-100 text-green-800 ring-green-600/20",
};

function formatDue(dueAt: Date): string {
  return dueAt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const [activeLoans, availableCount] = await Promise.all([
    prisma.loan.findMany({
      where: { returnedAt: null },
      include: { item: true, patron: true },
      orderBy: { dueAt: "asc" },
    }),
    prisma.item.count({ where: { status: ItemStatus.AVAILABLE } }),
  ]);

  const rows = activeLoans.map((loan) => ({
    loan,
    state: getLoanState(loan.dueAt),
  }));

  const checkedOut = activeLoans.length;
  const overdue = rows.filter((r) => r.state === "overdue").length;
  const dueToday = rows.filter((r) => r.state === "dueToday").length;

  const stats = [
    { label: "Checked out", value: checkedOut, accent: "text-slate-900" },
    { label: "Overdue", value: overdue, accent: "text-red-600" },
    { label: "Due today", value: dueToday, accent: "text-amber-600" },
    { label: "Available", value: availableCount, accent: "text-green-600" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Staff Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            CardinalCheckout — live equipment status
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${stat.accent}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            Active loans
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Patron</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No active loans.
                    </td>
                  </tr>
                ) : (
                  rows.map(({ loan, state }) => (
                    <tr key={loan.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{loan.item.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {loan.item.barcode}
                      </td>
                      <td className="px-4 py-3">
                        {loan.patron.firstName} {loan.patron.lastName}{" "}
                        <span className="text-slate-400">
                          ({loan.patron.sunetId})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDue(loan.dueAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATE_BADGE[state]}`}
                        >
                          {STATE_LABEL[state]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
