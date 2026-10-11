"use client";

import type { Chapter } from "@/db/schema";
import { slugify, type FormState } from "@/lib/forms";
import {
  AdminForm,
  RichTextField,
  TextField,
  ToggleField,
} from "../../_components/form";

export function ChapterForm({
  action,
  chapter,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  chapter?: Chapter;
}) {
  return (
    <AdminForm
      action={action}
      submitLabel={chapter ? "Save changes" : "Create chapter"}
      preview={(v) => (
        <div className="rounded-2xl border border-line bg-card p-6">
          <p className="eyebrow text-accent">Chapter</p>
          <p className="mt-2 font-serif text-3xl">{v.name || "Chapter name"}</p>
          <p className="mt-1 text-sm text-muted">
            {[v.institution, v.city].filter(Boolean).join(" · ") ||
              "Institution · City"}
          </p>
          <p className="mt-4 break-all text-xs text-muted">
            Web address: /chapters/
            <span className="font-medium text-ink">
              {slugify(v.slug || v.name || "") || "…"}
            </span>
          </p>
        </div>
      )}
    >
      {chapter && <input type="hidden" name="id" value={chapter.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Chapter name"
          name="name"
          required
          defaultValue={chapter?.name}
          placeholder="e.g. McMaster"
        />
        <TextField
          label="Web address"
          name="slug"
          defaultValue={chapter?.slug ?? ""}
          placeholder="Made from the name if left blank"
          help="The end of the chapter's page link, e.g. “mcmaster”."
        />
        <TextField
          label="School / institution"
          name="institution"
          defaultValue={chapter?.institution ?? ""}
          placeholder="e.g. McMaster University"
        />
        <TextField
          label="City"
          name="city"
          defaultValue={chapter?.city ?? ""}
          placeholder="e.g. Hamilton, ON"
        />
      </div>

      <RichTextField
        label="About this chapter"
        name="description"
        defaultValue={chapter?.description}
        rows={5}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Chapter email"
          name="email"
          type="email"
          defaultValue={chapter?.email ?? ""}
        />
        <TextField
          label="Chapter Instagram"
          name="instagram"
          defaultValue={chapter?.instagram ?? ""}
          placeholder="@handle"
        />
      </div>

      <RichTextField
        label="Where & when the chapter meets"
        name="meetingInfo"
        defaultValue={chapter?.meetingInfo}
        rows={3}
        help="e.g. “Every other Thursday, 6 pm, MUSC 203.”"
      />

      <ToggleField
        label="Show on website"
        name="published"
        defaultChecked={chapter?.published ?? true}
        help="Turn off while a new chapter is still getting set up."
      />
    </AdminForm>
  );
}
