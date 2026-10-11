"use client";

import {
  createContext,
  startTransition,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Bold, Italic, Link2, List, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { initialFormState, type FormState } from "@/lib/forms";
import { buttonClass, inputClass } from "./ui";

export type FormValues = Record<string, string>;
type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const FormContext = createContext<{
  errors?: Record<string, string>;
  refresh: () => void;
}>({ refresh: () => {} });

function readValues(form: HTMLFormElement): FormValues {
  const values: FormValues = {};
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

/**
 * Admin form shell: submits to a server action without React's automatic form
 * reset (so typed input survives validation errors), shows inline errors and a
 * toast, tracks unsaved changes, and optionally renders a live preview.
 */
export function AdminForm({
  action,
  children,
  preview,
  submitLabel = "Save changes",
  compact = false,
}: {
  action: Action;
  children: React.ReactNode;
  preview?: (values: FormValues) => React.ReactNode;
  submitLabel?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>({});
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (formRef.current) setValues(readValues(formRef.current));
  }, []);

  useEffect(() => {
    if (!formRef.current) return;
    const initial = readValues(formRef.current);
    setValues(initial);
    setSavedSnapshot(JSON.stringify(initial));
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved");
      if (formRef.current) {
        setSavedSnapshot(JSON.stringify(readValues(formRef.current)));
      }
    } else if (state.status === "error") {
      toast.error(state.message ?? "Something went wrong.");
    }
  }, [state]);

  const dirty =
    savedSnapshot !== null && JSON.stringify(values) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const form = (
    <form
      ref={formRef}
      onChange={refresh}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className={compact ? "space-y-3" : "space-y-6"}
    >
      {children}
      {compact ? (
        <div className="flex items-center gap-3">
          <SubmitButton pending={pending} label={submitLabel} />
          {dirty && <span className="text-xs text-amber-700">Unsaved</span>}
        </div>
      ) : (
        <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-between gap-4 border-t border-line bg-paper/95 px-1 py-3 backdrop-blur">
          <p className="text-sm text-muted">
            {dirty ? (
              <span className="font-medium text-amber-700">
                Unsaved changes
              </span>
            ) : (
              "No unsaved changes"
            )}
          </p>
          <SubmitButton pending={pending} label={submitLabel} />
        </div>
      )}
    </form>
  );

  return (
    <FormContext.Provider value={{ errors: state.fieldErrors, refresh }}>
      {preview ? (
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          {form}
          <aside className="xl:sticky xl:top-6">
            <p className="eyebrow mb-3 text-muted">Live preview</p>
            <div className="rounded-xl border border-dashed border-ink/15 bg-paper p-4">
              {savedSnapshot !== null && preview(values)}
            </div>
            <p className="mt-2 text-xs text-muted">
              This is how it will look on the website.
            </p>
          </aside>
        </div>
      ) : (
        form
      )}
    </FormContext.Provider>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className={buttonClass.primary}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Saving…" : label}
    </button>
  );
}

export function useFormRefresh() {
  return useContext(FormContext).refresh;
}

function useFieldError(name: string) {
  return useContext(FormContext).errors?.[name];
}

export function Field({
  label,
  name,
  help,
  required,
  children,
  className = "",
}: {
  label: string;
  name: string;
  help?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const error = useFieldError(name);
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={`f-${name}`} className="block text-sm font-medium">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : (
        help && <p className="text-xs leading-relaxed text-muted">{help}</p>
      )}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  help?: React.ReactNode;
  suggestions?: string[];
  className?: string;
};

export function TextField({
  label,
  name,
  help,
  suggestions,
  className,
  required,
  ...props
}: InputProps) {
  const error = useFieldError(name);
  const listId = suggestions?.length ? `l-${name}` : undefined;
  return (
    <Field
      label={label}
      name={name}
      help={help}
      required={required}
      className={className}
    >
      <input
        id={`f-${name}`}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        list={listId}
        autoComplete="off"
        className={inputClass}
        {...props}
      />
      {listId && (
        <datalist id={listId}>
          {suggestions!.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </Field>
  );
}

export function SelectField({
  label,
  name,
  help,
  options,
  defaultValue,
  className,
}: {
  label: string;
  name: string;
  help?: React.ReactNode;
  options: { value: string; label: string }[];
  defaultValue?: string;
  className?: string;
}) {
  const error = useFieldError(name);
  return (
    <Field label={label} name={name} help={help} className={className}>
      <select
        id={`f-${name}`}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        className={inputClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function ToggleField({
  label,
  name,
  help,
  defaultChecked,
}: {
  label: string;
  name: string;
  help?: React.ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-ink/20 transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {help && (
          <span className="mt-0.5 block text-xs text-muted">{help}</span>
        )}
      </span>
    </label>
  );
}

/**
 * Textarea with a small formatting toolbar. Content is stored as Markdown, but
 * execs never need to know that: the buttons insert the syntax for them.
 */
export function RichTextField({
  label,
  name,
  help,
  required,
  defaultValue,
  rows = 5,
  placeholder,
}: {
  label: string;
  name: string;
  help?: React.ReactNode;
  required?: boolean;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  const error = useFieldError(name);
  const refresh = useFormRefresh();
  const ref = useRef<HTMLTextAreaElement>(null);

  function apply(kind: "bold" | "italic" | "link" | "list") {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end);
    let insert: string;
    let cursor: [number, number];
    if (kind === "bold" || kind === "italic") {
      const mark = kind === "bold" ? "**" : "*";
      const text = selected || (kind === "bold" ? "bold text" : "italic text");
      insert = `${mark}${text}${mark}`;
      cursor = [start + mark.length, start + mark.length + text.length];
    } else if (kind === "link") {
      const url = window.prompt("Link address (URL):", "https://");
      if (!url) return;
      const text = selected || "link text";
      insert = `[${text}](${url})`;
      cursor = [start + 1, start + 1 + text.length];
    } else {
      const lines = (selected || "List item").split("\n");
      insert = lines.map((l) => (l.startsWith("- ") ? l : `- ${l}`)).join("\n");
      const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
      insert = prefix + insert;
      cursor = [start + insert.length, start + insert.length];
    }
    el.setRangeText(insert, start, end, "end");
    el.focus();
    el.setSelectionRange(...cursor);
    refresh();
  }

  const tool =
    "rounded p-1.5 text-ink/60 transition hover:bg-ink/5 hover:text-ink";

  return (
    <Field
      label={label}
      name={name}
      required={required}
      help={
        help === undefined
          ? "Leave a blank line between paragraphs. Use the buttons to add bold, italics, or links."
          : help
      }
    >
      <div className="overflow-hidden rounded-lg border border-line bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
        <div className="flex gap-0.5 border-b border-line bg-paper/60 px-1.5 py-1">
          <button
            type="button"
            className={tool}
            onClick={() => apply("bold")}
            title="Bold"
          >
            <Bold className="size-4" />
          </button>
          <button
            type="button"
            className={tool}
            onClick={() => apply("italic")}
            title="Italic"
          >
            <Italic className="size-4" />
          </button>
          <button
            type="button"
            className={tool}
            onClick={() => apply("link")}
            title="Link"
          >
            <Link2 className="size-4" />
          </button>
          <button
            type="button"
            className={tool}
            onClick={() => apply("list")}
            title="Bulleted list"
          >
            <List className="size-4" />
          </button>
        </div>
        <textarea
          ref={ref}
          id={`f-${name}`}
          name={name}
          rows={rows}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue ?? ""}
          aria-invalid={error ? true : undefined}
          className="block w-full resize-y bg-transparent px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-ink/35"
        />
      </div>
    </Field>
  );
}
