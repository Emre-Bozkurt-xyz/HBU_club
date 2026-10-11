import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";

function icsDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escape(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/[,;]/g, (c) => `\\${c}`);
}

/** Downloadable calendar entry for a single event. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return new Response("Not found", { status: 404 });
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.published, true)));
  if (!event) return new Response("Not found", { status: 404 });

  const end =
    event.endsAt ?? new Date(event.eventDate.getTime() + 2 * 60 * 60 * 1000);
  const url = new URL(`/events/${event.id}`, request.url).toString();
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//History Before Us//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@historybeforeus`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(event.eventDate)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escape(event.title)}`,
    event.location ? `LOCATION:${escape(event.location)}` : null,
    `DESCRIPTION:${escape(`${event.description ?? ""}\n\n${url}`.trim())}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="hbu-event.ics"`,
    },
  });
}
