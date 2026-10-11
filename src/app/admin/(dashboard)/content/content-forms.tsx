"use client";

import type { Faq, Link as LinkRow, Pillar } from "@/db/schema";
import type { FormState } from "@/lib/forms";
import { PLATFORMS } from "@/lib/links";
import {
  SITE_CONTENT_FIELDS,
  SITE_CONTENT_KEYS,
  type SiteContentValues,
} from "@/lib/site-content-fields";
import {
  AdminForm,
  RichTextField,
  SelectField,
  TextField,
} from "../../_components/form";
import { DeleteButton } from "../../_components/delete-button";
import { Panel, ReorderButtons } from "../../_components/ui";
import {
  deleteListItem,
  moveListItem,
  saveFaq,
  saveLink,
  savePillar,
  updateSiteContent,
} from "./actions";

const GROUPS = [
  { key: "hero", title: "Top of the home page" },
  { key: "join", title: "Get involved section" },
  { key: "announcement", title: "Announcement banner" },
] as const;

export function SiteContentForm({ values }: { values: SiteContentValues }) {
  return (
    <AdminForm action={updateSiteContent}>
      {GROUPS.map((group) => (
        <Panel key={group.key} title={group.title}>
          <div className="space-y-4">
            {SITE_CONTENT_KEYS.filter(
              (k) => SITE_CONTENT_FIELDS[k].group === group.key,
            ).map((key) => {
              const field = SITE_CONTENT_FIELDS[key];
              const help = [
                "help" in field ? field.help : null,
                field.default ? "Leave blank to use the default text." : null,
              ]
                .filter(Boolean)
                .join(" ");
              return field.type === "textarea" ? (
                <RichTextField
                  key={key}
                  label={field.label}
                  name={key}
                  defaultValue={values[key]}
                  rows={3}
                  help={help || undefined}
                />
              ) : (
                <TextField
                  key={key}
                  label={field.label}
                  name={key}
                  defaultValue={values[key]}
                  placeholder={field.type === "url" ? "https://…" : undefined}
                  help={help || undefined}
                />
              );
            })}
          </div>
        </Panel>
      ))}
    </AdminForm>
  );
}

type ListName = "pillars" | "faqs" | "links";

function ListRow({
  list,
  id,
  index,
  count,
  confirmText,
  children,
}: {
  list: ListName;
  id: string;
  index: number;
  count: number;
  confirmText: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2 rounded-xl border border-line bg-card p-3 pl-1.5">
      <ReorderButtons
        action={moveListItem}
        id={id}
        first={index === 0}
        last={index === count - 1}
        fields={{ list }}
      />
      <div className="min-w-0 flex-1">{children}</div>
      <form action={deleteListItem}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="list" value={list} />
        <DeleteButton compact confirmText={confirmText} />
      </form>
    </li>
  );
}

type SaveAction = (prev: FormState, formData: FormData) => Promise<FormState>;

function PillarFields({ item, action }: { item?: Pillar; action: SaveAction }) {
  return (
    <AdminForm action={action} compact submitLabel={item ? "Save" : "Add card"}>
      {item && <input type="hidden" name="id" value={item.id} />}
      <TextField
        label="Title"
        name="title"
        required
        defaultValue={item?.title}
      />
      <RichTextField
        label="Text"
        name="body"
        required
        defaultValue={item?.body}
        rows={2}
        help={null}
      />
    </AdminForm>
  );
}

export function PillarList({ items }: { items: Pillar[] }) {
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {items.map((item, i) => (
          <ListRow
            key={item.id}
            list="pillars"
            id={item.id}
            index={i}
            count={items.length}
            confirmText={`Delete “${item.title}”?`}
          >
            <PillarFields item={item} action={savePillar} />
          </ListRow>
        ))}
      </ul>
      <details className="rounded-xl border border-dashed border-ink/20 p-4">
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add a card
        </summary>
        <div className="mt-4">
          <PillarFields key={items.length} action={savePillar} />
        </div>
      </details>
    </div>
  );
}

function FaqFields({ item, action }: { item?: Faq; action: SaveAction }) {
  return (
    <AdminForm
      action={action}
      compact
      submitLabel={item ? "Save" : "Add question"}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <TextField
        label="Question"
        name="question"
        required
        defaultValue={item?.question}
      />
      <RichTextField
        label="Answer"
        name="answer"
        required
        defaultValue={item?.answer}
        rows={2}
        help={null}
      />
    </AdminForm>
  );
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <ListRow
              key={item.id}
              list="faqs"
              id={item.id}
              index={i}
              count={items.length}
              confirmText="Delete this question?"
            >
              <FaqFields item={item} action={saveFaq} />
            </ListRow>
          ))}
        </ul>
      )}
      <details
        className="rounded-xl border border-dashed border-ink/20 p-4"
        open={items.length === 0}
      >
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add a question
        </summary>
        <div className="mt-4">
          <FaqFields key={items.length} action={saveFaq} />
        </div>
      </details>
    </div>
  );
}

const PLATFORM_OPTIONS = Object.entries(PLATFORMS).map(([value, p]) => ({
  value,
  label: p.label,
}));

function LinkFields({ item, action }: { item?: LinkRow; action: SaveAction }) {
  return (
    <AdminForm action={action} compact submitLabel={item ? "Save" : "Add link"}>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-3 sm:grid-cols-[9rem_1fr_1fr]">
        <SelectField
          label="Type"
          name="platform"
          defaultValue={item?.platform ?? "instagram"}
          options={PLATFORM_OPTIONS}
        />
        <TextField
          label="Address, handle, or link"
          name="url"
          required
          defaultValue={item?.url}
          placeholder="@historybeforeus"
        />
        <TextField
          label="Label (optional)"
          name="label"
          defaultValue={item?.label ?? ""}
          placeholder="e.g. Brampton Instagram"
        />
      </div>
    </AdminForm>
  );
}

export function LinkList({ items }: { items: LinkRow[] }) {
  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <ListRow
              key={item.id}
              list="links"
              id={item.id}
              index={i}
              count={items.length}
              confirmText="Delete this link?"
            >
              <LinkFields item={item} action={saveLink} />
            </ListRow>
          ))}
        </ul>
      )}
      <details
        className="rounded-xl border border-dashed border-ink/20 p-4"
        open={items.length === 0}
      >
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add a link
        </summary>
        <div className="mt-4">
          <LinkFields key={items.length} action={saveLink} />
        </div>
      </details>
    </div>
  );
}
