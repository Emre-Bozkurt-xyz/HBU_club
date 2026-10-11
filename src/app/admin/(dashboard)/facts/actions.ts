"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { facts } from "@/db/schema";
import { deleteImageIfUnused, refreshSite } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import {
  checkbox,
  optionalId,
  optionalInt,
  optionalText,
  optionalUrl,
  parseForm,
  requiredText,
  type FormState,
} from "@/lib/forms";

const factSchema = z
  .object({
    title: optionalText,
    fact: requiredText("The fact"),
    year: optionalInt(1, 10000, "Year"),
    era: z.enum(["CE", "BCE"]).catch("CE"),
    month: optionalInt(1, 12, "Month"),
    day: optionalInt(1, 31, "Day"),
    region: optionalText,
    source: optionalText,
    sourceUrl: optionalUrl,
    imageId: optionalId,
    published: checkbox,
  })
  .superRefine((data, ctx) => {
    if (data.day && !data.month) {
      ctx.addIssue({
        code: "custom",
        path: ["month"],
        message: "Pick a month to go with the day.",
      });
    }
    if (data.day && data.month) {
      // 2024 is a leap year, so Feb 29 is allowed.
      const daysInMonth = new Date(2024, data.month, 0).getDate();
      if (data.day > daysInMonth) {
        ctx.addIssue({
          code: "custom",
          path: ["day"],
          message: `That month only has ${daysInMonth} days.`,
        });
      }
    }
    if (
      data.year &&
      data.era === "CE" &&
      data.year > new Date().getFullYear()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["year"],
        message: "That year is in the future.",
      });
    }
  })
  .transform(({ era, year, ...rest }) => ({
    ...rest,
    year: year == null ? null : era === "BCE" ? -year : year,
  }));

export async function createFact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(factSchema, formData);
  if (!parsed.ok) return parsed.state;
  const [row] = await db
    .insert(facts)
    .values(parsed.data)
    .returning({ id: facts.id });
  refreshSite();
  redirect(`/admin/facts/${row.id}?flash=created`);
}

export async function updateFact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = parseForm(factSchema, formData);
  if (!parsed.ok) return parsed.state;
  const [before] = await db
    .select({ imageId: facts.imageId })
    .from(facts)
    .where(eq(facts.id, id));
  if (!before)
    return { status: "error", message: "This fact no longer exists." };
  await db.update(facts).set(parsed.data).where(eq(facts.id, id));
  if (before.imageId !== parsed.data.imageId) {
    await deleteImageIfUnused(before.imageId);
  }
  refreshSite();
  return { status: "success", message: "Fact saved" };
}

export async function deleteFact(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const [row] = await db
    .delete(facts)
    .where(eq(facts.id, id))
    .returning({ imageId: facts.imageId });
  await deleteImageIfUnused(row?.imageId);
  refreshSite();
  redirect("/admin/facts?flash=deleted");
}
