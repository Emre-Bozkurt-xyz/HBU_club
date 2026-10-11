import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Toaster } from "sonner";
import { LogoMark } from "@/components/logo";
import { logout } from "../actions";
import { AdminNav } from "../_components/admin-nav";
import { FlashToast } from "../_components/flash-toast";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-paper-deep/60 px-3 py-3 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
        <div className="mb-3 flex items-center justify-between gap-2 px-1 lg:mb-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="leading-tight">
              <span className="block font-serif text-[15px]">
                History Before Us
              </span>
              <span className="block text-[11px] text-muted">
                Exec dashboard
              </span>
            </span>
          </Link>
          <div className="flex gap-1 lg:hidden">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg p-2 text-ink/60 hover:bg-white"
              title="View site"
            >
              <ExternalLink className="size-4" />
            </Link>
            <form action={logout}>
              <button
                className="rounded-lg p-2 text-ink/60 hover:bg-white"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto hidden space-y-1 border-t border-line pt-4 lg:block">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/65 hover:bg-white/60 hover:text-ink"
          >
            <ExternalLink className="size-4" /> View website
          </Link>
          <form action={logout}>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/65 hover:bg-white/60 hover:text-ink">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <Toaster position="bottom-right" richColors closeButton />
      <Suspense>
        <FlashToast />
      </Suspense>
    </div>
  );
}
