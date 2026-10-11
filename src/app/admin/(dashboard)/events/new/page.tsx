import { db } from "@/db";
import { chapters, events } from "@/db/schema";
import { AdminPageHeader } from "../../../_components/ui";
import { createEvent } from "../actions";
import { EventForm } from "../event-form";

export default async function NewEventPage() {
  const [chapterList, themeRows] = await Promise.all([
    db
      .select({ id: chapters.id, name: chapters.name })
      .from(chapters)
      .orderBy(chapters.sortOrder),
    db.selectDistinct({ theme: events.theme }).from(events),
  ]);
  return (
    <>
      <AdminPageHeader
        title="New event"
        back={{ href: "/admin/events", label: "Events" }}
      />
      <EventForm
        action={createEvent}
        chapters={chapterList}
        themes={themeRows.map((r) => r.theme).filter(Boolean) as string[]}
      />
    </>
  );
}
