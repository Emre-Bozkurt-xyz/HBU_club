"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  MapPin,
  PanelsTopLeft,
  ScrollText,
  Users,
} from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/facts", label: "History facts", icon: ScrollText },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/chapters", label: "Chapters", icon: MapPin },
  { href: "/admin/content", label: "Site content", icon: PanelsTopLeft },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-white font-medium text-ink shadow-sm ring-1 ring-line"
                : "text-ink/65 hover:bg-white/60 hover:text-ink"
            }`}
          >
            <Icon className={`size-4 ${active ? "text-accent" : ""}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
