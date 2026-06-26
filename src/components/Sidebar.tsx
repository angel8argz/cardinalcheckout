"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ArrowRight,
  ArrowLeft,
  List,
  Box,
  Users,
  Settings,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/checkout", label: "Checkout", icon: ArrowRight },
      { href: "/return", label: "Return", icon: ArrowLeft },
      { href: "/checkouts", label: "Checkouts", icon: List },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/resources", label: "Resources", icon: Box },
      { href: "/patrons", label: "Patrons", icon: Users },
    ],
  },
  {
    label: "Admin",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col bg-sidebar text-sidebar-text">
      <div className="flex items-center gap-3 px-5 pb-6 pt-[22px]">
        <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg bg-cardinal">
          <Box className="h-[17px] w-[17px] text-white" strokeWidth={1.8} />
        </div>
        <span className="text-base font-bold tracking-tight text-white">
          CardinalCheckout
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1">
        {NAV.map((group) => (
          <div key={group.label} className="mb-[18px]">
            <div className="px-3 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#5d6357]">
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-0.5 flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-active font-semibold text-white"
                      : "font-medium text-sidebar-text hover:bg-[#181d15]"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      active ? "text-[#e66]" : "text-[#8a8f81]"
                    }`}
                    strokeWidth={1.7}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-[#20261c] px-4 py-3.5">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-cardinal text-[13px] font-semibold text-white">
          AR
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-tight text-white">
            Angel Ramirez
          </div>
          <div className="text-[11px] text-[#777c70]">The Tech Desk</div>
        </div>
        <ChevronUp className="h-[15px] w-[15px] text-[#777c70]" strokeWidth={1.7} />
      </div>
    </aside>
  );
}
