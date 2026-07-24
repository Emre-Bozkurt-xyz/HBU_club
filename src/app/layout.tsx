import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const title = "History Before Us";
const description =
  "A history club exploring the land we live on and the wider world's past.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-black/10">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              History Before Us
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/events" className="hover:text-accent">
                Events
              </Link>
              <Link href="/execs" className="hover:text-accent">
                Team
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
          {children}
        </main>

        <footer className="border-t border-black/10">
          <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-black/50">
            © {new Date().getFullYear()} History Before Us
          </div>
        </footer>
      </body>
    </html>
  );
}
