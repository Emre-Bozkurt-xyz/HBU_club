"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { login } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="paper-grain flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-12" />
          <h1 className="mt-5 font-serif text-2xl">Exec dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in with the shared exec password.
          </p>
        </div>
        <form action={formAction} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          {state?.error && (
            <p className="text-sm font-medium text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-ink disabled:opacity-60"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <Link href="/" className="mt-6 text-sm text-muted hover:text-ink">
        ← Back to the website
      </Link>
    </div>
  );
}
