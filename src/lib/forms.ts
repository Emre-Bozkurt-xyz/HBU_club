import { z } from "zod";

/** Result returned by admin form actions, consumed by useActionState. */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

const trimmed = z.string().trim();

/** Required single-line text. */
export const requiredText = (label: string) =>
  trimmed.min(1, `${label} is required.`);

/** Optional text: blank becomes null. */
export const optionalText = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : null));

/** Optional URL. Accepts "example.com" and adds https://. */
export const optionalUrl = optionalText.pipe(
  z
    .string()
    .nullable()
    .transform((v) => (v && !/^[a-z]+:/i.test(v) ? `https://${v}` : v))
    .refine((v) => v === null || URL.canParse(v), "Enter a valid link."),
);

export const optionalEmail = optionalText.pipe(
  z.email("Enter a valid email address.").nullable(),
);

/** Optional whole number in a range: blank becomes null. */
export const optionalInt = (min: number, max: number, label: string) =>
  optionalText.pipe(
    z.coerce
      .number<string>({ error: `${label} must be a number.` })
      .int(`${label} must be a whole number.`)
      .min(min, `${label} must be at least ${min}.`)
      .max(max, `${label} must be at most ${max}.`)
      .nullable(),
  );

export const optionalId = optionalText.pipe(z.uuid().nullable());

/** Checkbox inputs submit "on" when checked and nothing when not. */
export const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

export function parseForm<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): { ok: true; data: z.output<T> } | { ok: false; state: FormState } {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION"))
      raw[key] = value;
  }
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return {
    ok: false,
    state: {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    },
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
