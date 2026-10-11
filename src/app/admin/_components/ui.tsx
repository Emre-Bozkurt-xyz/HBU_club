import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink shadow-[inset_0_1px_1px_rgba(0,0,0,0.03)] outline-none transition placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/15 aria-[invalid=true]:border-red-500";

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

export const buttonClass = {
  primary: `${buttonBase} bg-accent px-4 py-2 text-white hover:bg-accent-ink`,
  secondary: `${buttonBase} border border-line bg-white px-4 py-2 text-ink hover:border-ink/30`,
  ghost: `${buttonBase} px-3 py-2 text-ink/70 hover:bg-ink/5 hover:text-ink`,
  danger: `${buttonBase} border border-red-200 bg-white px-4 py-2 text-red-700 hover:bg-red-50`,
};

export function AdminPageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl leading-tight">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-card ${className}`}>
      {title && (
        <header className="border-b border-line px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          )}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "warning" | "success";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-ink/[0.06] text-ink/70",
    accent: "bg-accent/10 text-accent",
    warning: "bg-amber-100 text-amber-800",
    success: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink/20 px-6 py-12 text-center">
      <p className="font-serif text-xl">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

/** Up/down buttons that submit to a move action. */
export function ReorderButtons({
  action,
  id,
  first,
  last,
  fields = {},
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  first: boolean;
  last: boolean;
  fields?: Record<string, string>;
}) {
  const btn =
    "rounded p-1 text-ink/50 hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-25";
  return (
    <form action={action} className="flex flex-col">
      <input type="hidden" name="id" value={id} />
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        name="direction"
        value="up"
        disabled={first}
        className={btn}
        aria-label="Move up"
        title="Move up"
      >
        <ChevronUp className="size-4" />
      </button>
      <button
        name="direction"
        value="down"
        disabled={last}
        className={btn}
        aria-label="Move down"
        title="Move down"
      >
        <ChevronDown className="size-4" />
      </button>
    </form>
  );
}
