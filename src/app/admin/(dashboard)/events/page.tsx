import { desc } from "drizzle-orm";
import { db } from "@/db";
import { events, type Event } from "@/db/schema";
import { formatEventDate, toDateTimeLocal } from "@/lib/format";
import { DeleteButton } from "../../delete-button";
import { createEvent, deleteEvent, updateEvent } from "./actions";

export const dynamic = "force-dynamic";

const inputClass = "w-full rounded-md border border-black/15 px-3 py-2 text-sm";

export default async function AdminEventsPage() {
  const all = await db.select().from(events).orderBy(desc(events.eventDate));

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold tracking-tight">Manage events</h1>

      <section className="rounded-lg border border-black/10 bg-white/50 p-5">
        <h2 className="mb-4 font-semibold">Add an event</h2>
        <EventFields action={createEvent} submitLabel="Add event" />
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">
          All events{" "}
          <span className="font-normal text-black/50">({all.length})</span>
        </h2>
        {all.length === 0 ? (
          <p className="text-sm text-black/60">No events yet.</p>
        ) : (
          <ul className="space-y-3">
            {all.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-black/10 bg-white/50 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-black/50">
                    {formatEventDate(event.eventDate)}
                  </span>
                </div>

                <div className="mt-3 flex gap-4 text-sm">
                  <details className="flex-1">
                    <summary className="cursor-pointer text-accent">
                      Edit
                    </summary>
                    <div className="mt-3">
                      <EventFields
                        action={updateEvent}
                        event={event}
                        submitLabel="Save changes"
                      />
                    </div>
                  </details>

                  <form action={deleteEvent}>
                    <input type="hidden" name="id" value={event.id} />
                    <DeleteButton confirmText={`Delete "${event.title}"? This can't be undone.`} />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EventFields({
  action,
  event,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  event?: Event;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-3">
      {event && <input type="hidden" name="id" value={event.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Title</span>
          <input
            name="title"
            required
            defaultValue={event?.title}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Date &amp; time</span>
          <input
            name="eventDate"
            type="datetime-local"
            required
            defaultValue={event ? toDateTimeLocal(event.eventDate) : undefined}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Theme</span>
          <input
            name="theme"
            defaultValue={event?.theme ?? ""}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Location</span>
          <input
            name="location"
            defaultValue={event?.location ?? ""}
            className={inputClass}
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={event?.description ?? ""}
          className={inputClass}
        />
      </label>
      <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
        {submitLabel}
      </button>
    </form>
  );
}
