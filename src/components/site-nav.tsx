"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";

export function SiteNav({ joinHref }: { joinHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3.5 py-2 text-sm transition ${
              isActive(item.href)
                ? "bg-ink/[0.06] font-medium text-ink"
                : "text-ink/70 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={joinHref}
          className="ml-3 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-ink"
        >
          Join us
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-2 rounded-md p-2 md:hidden"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-paper px-4 pb-6 pt-2 shadow-lg md:hidden">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b border-line py-3.5 font-serif text-2xl ${
                  isActive(item.href) ? "text-accent" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <a
            href={joinHref}
            onClick={() => setOpen(false)}
            className="mt-5 block rounded-full bg-accent px-4 py-3 text-center font-medium text-white"
          >
            Join us
          </a>
        </div>
      )}
    </>
  );
}
