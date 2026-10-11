"use client";

import { ExecCard } from "@/components/exec-card";
import type { Exec } from "@/db/schema";
import type { FormState } from "@/lib/forms";
import { imageUrl } from "@/lib/view";
import {
  AdminForm,
  RichTextField,
  SelectField,
  TextField,
  ToggleField,
} from "../../_components/form";
import { ImageField } from "../../_components/image-field";

const PRONOUNS = ["she/her", "he/him", "they/them", "she/they", "he/they"];
const ROLES = [
  "Founder & President",
  "President",
  "Vice President",
  "VP Events",
  "VP Outreach",
  "VP Finance",
  "VP Marketing",
  "VP Internal",
  "Secretary",
  "Chapter Lead",
  "Exec",
];
const YEARS = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "5th year",
  "Graduate student",
  "Alumni",
];

function currentTerm() {
  const now = new Date();
  const start = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}–${String(start + 1).slice(2)}`;
}

export function ExecForm({
  action,
  exec,
  chapters,
  suggestions,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  exec?: Exec;
  chapters: { id: string; name: string; institution: string | null }[];
  suggestions: { schools: string[]; programs: string[]; roles: string[] };
}) {
  return (
    <AdminForm
      action={action}
      submitLabel={exec ? "Save changes" : "Add to team"}
      preview={(v) => (
        <div className="mx-auto max-w-xs">
          <ExecCard
            exec={{
              name: v.name,
              pronouns: v.pronouns || null,
              role: v.role,
              program: v.program || null,
              year: v.year || null,
              school: v.school || null,
              bio: v.bio || null,
              email: v.email || null,
              instagram: v.instagram || null,
              linkedin: v.linkedin || null,
              photoUrl: imageUrl(v.photoId),
              chapterName: chapters.find((c) => c.id === v.chapterId)?.name,
            }}
          />
        </div>
      )}
    >
      {exec && <input type="hidden" name="id" value={exec.id} />}

      <div className="grid gap-6 sm:grid-cols-[13rem_1fr]">
        <ImageField
          label="Headshot"
          name="photoId"
          defaultValue={exec?.photoId ?? null}
          maxSize={900}
          aspect="aspect-[4/5]"
          help="Portrait photos work best."
        />
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <TextField
              label="Full name"
              name="name"
              required
              defaultValue={exec?.name}
            />
            <TextField
              label="Pronouns"
              name="pronouns"
              defaultValue={exec?.pronouns ?? ""}
              suggestions={PRONOUNS}
              placeholder="she/her"
            />
          </div>
          <TextField
            label="Role"
            name="role"
            required
            defaultValue={exec?.role}
            suggestions={[...new Set([...ROLES, ...suggestions.roles])]}
            placeholder="e.g. VP Outreach"
          />
          <SelectField
            label="Chapter"
            name="chapterId"
            defaultValue={exec?.chapterId ?? ""}
            options={[
              { value: "", label: "Organization-wide (leadership)" },
              ...chapters.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>
      </div>

      <fieldset className="space-y-4 rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-semibold">Studies</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Program"
            name="program"
            defaultValue={exec?.program ?? ""}
            suggestions={suggestions.programs}
            placeholder="e.g. Honours Life Sciences"
          />
          <TextField
            label="Year"
            name="year"
            defaultValue={exec?.year ?? ""}
            suggestions={YEARS}
            placeholder="e.g. 3rd year"
          />
        </div>
        <TextField
          label="School"
          name="school"
          defaultValue={exec?.school ?? ""}
          suggestions={[
            ...new Set([
              ...(chapters
                .map((c) => c.institution)
                .filter(Boolean) as string[]),
              ...suggestions.schools,
            ]),
          ]}
          placeholder="e.g. McMaster University"
        />
      </fieldset>

      <RichTextField
        label="Bio"
        name="bio"
        defaultValue={exec?.bio}
        rows={6}
        help="A few sentences in their own words: interests, why they joined, a favourite period of history…"
      />

      <fieldset className="space-y-4 rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-semibold">Links (optional)</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Email"
            name="email"
            type="email"
            defaultValue={exec?.email ?? ""}
          />
          <TextField
            label="Instagram"
            name="instagram"
            defaultValue={exec?.instagram ?? ""}
            placeholder="@handle"
          />
          <TextField
            label="LinkedIn"
            name="linkedin"
            defaultValue={exec?.linkedin ?? ""}
            placeholder="linkedin.com/in/…"
          />
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <ToggleField
          label="Current exec"
          name="active"
          defaultChecked={exec?.active ?? true}
          help="Turn off when someone steps down — they'll move to the “Past executives” list instead of being deleted."
        />
        <TextField
          label="Term"
          name="term"
          defaultValue={exec?.term ?? (exec ? "" : currentTerm())}
          placeholder={currentTerm()}
        />
      </div>
    </AdminForm>
  );
}
