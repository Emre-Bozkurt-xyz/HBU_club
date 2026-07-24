import Link from "next/link";
import { logout } from "../actions";

const NAV_LINKS = [
  { href: "/admin/events", label: "Events" },
  { href: "/admin/execs", label: "Execs" },
  { href: "/admin/facts", label: "Facts" },
  { href: "/admin/content", label: "Content" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
        <nav className="flex flex-wrap gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button className="text-sm text-black/60 hover:text-accent">
            Sign out
          </button>
        </form>
      </div>

      {children}
    </div>
  );
}
