import Link from "next/link";
import { Search, Barcode, Plus, Bell } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-canvas/85 px-8 py-4 backdrop-blur">
      <div className="relative flex max-w-[520px] flex-1 items-center">
        <Search
          className="absolute left-3.5 h-[17px] w-[17px] text-faint"
          strokeWidth={1.7}
        />
        <input
          placeholder="Search patrons, resources, or scan a barcode"
          className="h-[42px] w-full rounded-[10px] border border-line bg-white pl-10 pr-[92px] text-sm text-ink outline-none placeholder:text-faint focus:border-cardinal"
        />
        <div className="absolute right-3 flex items-center gap-2">
          <span className="rounded-md border border-line bg-canvas px-1.5 py-[3px] text-[11px] font-medium text-faint">
            ⌘K
          </span>
          <Barcode className="h-[18px] w-[18px] text-cardinal" strokeWidth={1.7} />
        </div>
      </div>

      <div className="flex-1" />

      <Link
        href="/checkout"
        className="flex h-10 items-center gap-2 rounded-[10px] bg-cardinal px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        New checkout
      </Link>

      <button
        type="button"
        className="relative flex h-10 w-10 flex-none items-center justify-center rounded-[10px] border border-line bg-white"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px] text-muted" strokeWidth={1.7} />
        <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
          5
        </span>
      </button>
    </header>
  );
}
