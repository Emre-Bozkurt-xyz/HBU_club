"use client";

import { EventCard } from "@/components/event-card";
import type { Event } from "@/db/schema";
import { fromDateTimeLocal, toDateTimeLocal } from "@/lib/format";
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

export function EventForm({
  action,
  event,
  chapters,
  themes,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  event?: Event;
  chapters: { id: string; name: string }[];
  themes: string[];
}) {
  return (
    <AdminForm
      action={action}
      submitLabel={event ? "Save changes" : "Create event"}
      preview={(v) => (
        <EventCard
          event={{
            title: v.title,
            theme: v.theme || null,
            location: v.location || null,
            eventDate: fromDateTimeLocal(v.eventDate ?? "") ?? new Date(),
            endsAt: fromDateTimeLocal(v.endsAt ?? ""),
            description: v.description || null,
            rsvpUrl: v.rsvpUrl || null,
            imageUrl: imageUrl(v.imageId),
            chapterName: chapters.find((c) => c.id === v.chapterId)?.name,
          }}
        />
      )}
    >
      {event && <input type="hidden" name="id" value={event.id} />}

      <TextField
        label="Title"
        name="title"
        required
        defaultValue={event?.title}
        placeholder="e.g. Treaty Walk: The Dish With One Spoon"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Starts"
          name="eventDate"
          type="datetime-local"
          required
          defaultValue={event ? toDateTimeLocal(event.eventDate) : undefined}
        />
        <TextField
          label="Ends"
          name="endsAt"
          type="datetime-local"
          defaultValue={
            event?.endsAt ? toDateTimeLocal(event.endsAt) : undefined
          }
          help="Optional."
        />
        <TextField
          label="Location"
          name="location"
          defaultValue={event?.location ?? ""}
          placeholder="e.g. MUSC 203, or Online"
        />
        <SelectField
          label="Chapter"
          name="chapterId"
          defaultValue={event?.chapterId ?? ""}
          options={[
            { value: "", label: "All chapters / organization-wide" },
            ...chapters.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <TextField
          label="Theme"
          name="theme"
          defaultValue={event?.theme ?? ""}
          suggestions={themes}
          placeholder="e.g. Local history"
          help="A short tag shown on the event card."
        />
        <TextField
          label="RSVP / sign-up link"
          name="rsvpUrl"
          defaultValue={event?.rsvpUrl ?? ""}
          placeholder="https://…"
          help="Optional. Adds an RSVP button."
        />
      </div>

      <RichTextField
        label="Description"
        name="description"
        defaultValue={event?.description}
        rows={6}
        placeholder="What's happening, who it's for, anything to bring…"
      />

      <ImageField
        label="Cover image"
        name="imageId"
        defaultValue={event?.imageId ?? null}
        help="Optional. A poster or photo — landscape works best."
      />

      <RichTextField
        label="Recap"
        name="recap"
        defaultValue={event?.recap}
        rows={4}
        help="Fill this in after the event — it appears in the past-events archive."
      />

      <ToggleField
        label="Show on website"
        name="published"
        defaultChecked={event?.published ?? true}
        help="Turn off to save this as a draft that only execs can see."
      />
    </AdminForm>
  );
}
