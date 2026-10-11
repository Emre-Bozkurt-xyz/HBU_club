import type { Chapter, Event, Exec, Fact } from "@/db/schema";

// Maps database rows to the props the shared card components expect.

export function imageUrl(id: string | null | undefined) {
  return id ? `/images/${id}` : null;
}

export function toEventCard(event: Event, chapters?: Map<string, Chapter>) {
  return {
    ...event,
    imageUrl: imageUrl(event.imageId),
    chapterName:
      chapters && event.chapterId ? chapters.get(event.chapterId)?.name : null,
    href: `/events/${event.id}`,
  };
}

export function toExecCard(exec: Exec, chapters?: Map<string, Chapter>) {
  return {
    ...exec,
    photoUrl: imageUrl(exec.photoId),
    chapterName:
      chapters && exec.chapterId ? chapters.get(exec.chapterId)?.name : null,
  };
}

export function toFactCard(fact: Fact) {
  return { ...fact, imageUrl: imageUrl(fact.imageId) };
}
