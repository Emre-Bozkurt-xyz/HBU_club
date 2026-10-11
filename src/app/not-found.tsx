import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="paper-grain flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-14" />
      <p className="eyebrow mt-8 text-accent">404</p>
      <h1 className="mt-3 font-serif text-5xl">Lost to history.</h1>
      <p className="mt-4 max-w-md text-muted">
        This page doesn&apos;t exist — or it did once, and the records have been
        misplaced.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-6 py-3 font-medium text-white hover:bg-accent-ink"
      >
        Back to the present
      </Link>
    </div>
  );
}
