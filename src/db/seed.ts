import "dotenv/config";
import { db } from "./index";
import { events, execs, facts, siteContent } from "./schema";
import { SITE_CONTENT_DEFAULTS } from "../lib/site-content";

async function main() {
  console.log("Seeding database...");

  await db.insert(events).values([
    {
      title: "Welcome Night: The Land We Live On",
      theme: "Local history",
      location: "Student Union, Room 204",
      eventDate: new Date("2026-09-15T18:00:00"),
      description:
        "Kick off the year with an intro to the history beneath our campus.",
    },
    {
      title: "World History Trivia",
      theme: "World history",
      location: "Library Commons",
      eventDate: new Date("2026-10-02T19:00:00"),
      description: "Team trivia night spanning ancient empires to the modern era.",
    },
  ]);

  await db.insert(execs).values([
    { name: "Add your name", role: "President", bio: "Short bio goes here." },
    { name: "Add your name", role: "VP Events", bio: "Short bio goes here." },
  ]);

  await db.insert(facts).values([
    {
      fact: "The oldest known map of the stars dates back over 32,000 years.",
      source: "Various archaeological studies",
      month: 7,
    },
    {
      fact: "The Library of Alexandria was founded in the early 3rd century BCE.",
      source: "Various archaeological studies",
      month: 3,
    },
  ]);

  await db
    .insert(siteContent)
    .values(
      Object.entries(SITE_CONTENT_DEFAULTS).map(([key, value]) => ({
        key,
        value,
      })),
    );

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
