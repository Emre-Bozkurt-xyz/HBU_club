"use client";

import { FactFeature } from "@/components/fact-card";
import type { Fact } from "@/db/schema";
import { MONTH_NAMES } from "@/lib/format";
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

function int(value: string | undefined) {
  const n = Number(value);
  return value && Number.isInteger(n) ? n : null;
}

export function FactForm({
  action,
  fact,
  regions,
  defaultMonth,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fact?: Fact;
  regions: string[];
  defaultMonth?: number;
}) {
  return (
    <AdminForm
      action={action}
      submitLabel={fact ? "Save changes" : "Add fact"}
      preview={(v) => {
        const year = int(v.year);
        return (
          <FactFeature
            mode="today"
            fact={{
              title: v.title || null,
              fact: v.fact,
              year: year == null ? null : v.era === "BCE" ? -year : year,
              month: int(v.month),
              day: int(v.day),
              region: v.region || null,
              source: v.source || null,
              sourceUrl: v.sourceUrl || null,
              imageUrl: imageUrl(v.imageId),
            }}
          />
        );
      }}
    >
      {fact && <input type="hidden" name="id" value={fact.id} />}

      <fieldset className="space-y-3 rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-semibold">
          When did it happen?
        </legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_7rem_1fr_6rem]">
          <TextField
            label="Year"
            name="year"
            type="number"
            min={1}
            defaultValue={fact?.year != null ? Math.abs(fact.year) : ""}
            placeholder="1867"
          />
          <SelectField
            label="Era"
            name="era"
            defaultValue={fact?.year != null && fact.year < 0 ? "BCE" : "CE"}
            options={[
              { value: "CE", label: "CE / AD" },
              { value: "BCE", label: "BCE / BC" },
            ]}
          />
          <SelectField
            label="Month"
            name="month"
            defaultValue={String(
              fact ? (fact.month ?? "") : (defaultMonth ?? ""),
            )}
            options={[
              { value: "", label: "—" },
              ...MONTH_NAMES.map((m, i) => ({
                value: String(i + 1),
                label: m,
              })),
            ]}
          />
          <TextField
            label="Day"
            name="day"
            type="number"
            min={1}
            max={31}
            defaultValue={fact?.day ?? ""}
          />
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Fill in as much as you know. Facts with a month appear on the home
          page during that month; with a day, they&apos;re featured as “On this
          day”.
        </p>
      </fieldset>

      <TextField
        label="Headline"
        name="title"
        defaultValue={fact?.title ?? ""}
        placeholder="e.g. Canada becomes a country"
        help="Optional, but makes the fact stand out."
      />

      <RichTextField
        label="The fact"
        name="fact"
        required
        defaultValue={fact?.fact}
        rows={5}
        help="A few sentences. Why does this moment matter?"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Region"
          name="region"
          defaultValue={fact?.region ?? ""}
          suggestions={regions}
          placeholder="e.g. Canada, South Asia, Ancient Rome"
          help="Visitors can filter the timeline by region."
        />
        <div />
        <TextField
          label="Source"
          name="source"
          defaultValue={fact?.source ?? ""}
          placeholder="e.g. The Canadian Encyclopedia"
        />
        <TextField
          label="Source link"
          name="sourceUrl"
          defaultValue={fact?.sourceUrl ?? ""}
          placeholder="https://…"
        />
      </div>

      <ImageField
        label="Image"
        name="imageId"
        defaultValue={fact?.imageId ?? null}
        help="Optional. A historical photo, map, or artwork."
      />

      <ToggleField
        label="Show on website"
        name="published"
        defaultChecked={fact?.published ?? true}
      />
    </AdminForm>
  );
}
