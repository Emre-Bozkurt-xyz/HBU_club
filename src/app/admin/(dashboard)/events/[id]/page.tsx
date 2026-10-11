import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Copy, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { chapters, events } from "@/db/schema";
import { DeleteButton } from "../../../_components/delete-button";
import { AdminPageHeader, Badge, buttonClass } from "../../../_components/ui";
import { deleteEvent, duplicateEvent, updateEvent } from "../actions";
import { EventForm } from "../event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [[event], chapterList, themeRows] = await Promise.all([
    db.select().from(events).where(eq(events.id, id)),
    db
      .select({ id: chapters.id, name: chapters.name })
      .from(chapters)
      .orderBy(chapters.sortOrder),
    db.selectDistinct({ theme: events.theme }).from(events),
  ]);
  if (!event) notFound();

  return (
    <>
      <AdminPageHeader
        title={event.title}
        description={
          !event.published && (
            <Badge tone="warning">Draft — not on the website</Badge>
          )
        }
        back={{ href: "/admin/events", label: "Events" }}
        actions={
          <>
            {event.published && (
              <Link
                href={`/events/${event.id}`}
                target="_blank"
                className={buttonClass.secondary}
              >
                <ExternalLink className="size-4" /> View
              </Link>
            )}
            <form action={duplicateEvent}>
              <input type="hidden" name="id" value={event.id} />
              <button
                className={buttonClass.secondary}
                title="Make a copy, e.g. for a recurring event"
              >
                <Copy className="size-4" /> Duplicate
              </button>
            </form>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={event.id} />
              <DeleteButton
                confirmText={`Delete "${event.title}"? This can't be undone.`}
              />
            </form>
          </>
        }
      />
      <EventForm
        action={updateEvent}
        event={event}
        chapters={chapterList}
        themes={themeRows.map((r) => r.theme).filter(Boolean) as string[]}
      />
    </>
  );
}
