import "dotenv/config";
import { db } from "./index";
import { chapters, events, execs, facts, faqs, links, pillars } from "./schema";
import { fromDateTimeLocal, zonedParts } from "../lib/format";

// Sample data for local development. Refuses to run against a database that
// already has content, so it can't clobber the real site.

/** A club-local date `days` from today at the given time, e.g. (7, "18:00"). */
function daysFromNow(days: number, time: string) {
  const { year, month, day } = zonedParts(new Date());
  const d = new Date(Date.UTC(year, month - 1, day + days));
  const pad = (n: number) => String(n).padStart(2, "0");
  return fromDateTimeLocal(
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${time}`,
  )!;
}

async function main() {
  const existing = await db.select({ id: execs.id }).from(execs).limit(1);
  const existingEvents = await db
    .select({ id: events.id })
    .from(events)
    .limit(1);
  if (existing.length || existingEvents.length) {
    console.log("Database already has content; not seeding.");
    process.exit(0);
  }
  console.log("Seeding database...");

  const [mcmaster, brampton] = await db
    .insert(chapters)
    .values([
      {
        slug: "mcmaster",
        name: "McMaster",
        institution: "McMaster University",
        city: "Hamilton, ON",
        description:
          "Our founding chapter. We meet on campus for talks, walking tours of Hamilton, and the occasional very competitive trivia night.",
        email: "mcmaster@example.com",
        instagram: "@hbu.mcmaster",
        meetingInfo: "Every other Thursday, 6 pm, MUSC 203.",
        sortOrder: 0,
      },
      {
        slug: "brampton",
        name: "Brampton",
        city: "Brampton, ON",
        description:
          "A community chapter for high school and university students in Brampton, focused on the histories of the many communities that call Peel home.",
        instagram: "@hbu.brampton",
        sortOrder: 1,
      },
    ])
    .returning();

  await db.insert(execs).values([
    {
      name: "Avery Morgan",
      pronouns: "she/her",
      role: "Founder & President",
      program: "Honours Life Sciences",
      year: "3rd year",
      school: "McMaster University",
      bio: "I started History Before Us to show that history is more than dates in a textbook — it's the story of the ground under our feet.\n\nOutside the club you'll find me café-hopping or cooking for friends.",
      instagram: "@avery.example",
      term: "2026–27",
      sortOrder: 0,
    },
    {
      name: "Jordan Lee",
      pronouns: "they/them",
      role: "VP Outreach",
      program: "Social Psychology",
      year: "3rd year",
      school: "McMaster University",
      bio: "I run our socials and partnerships. Ask me about **Indigenous land history** in the Hamilton area.",
      term: "2026–27",
      sortOrder: 1,
    },
    {
      name: "Sam Patel",
      pronouns: "he/him",
      role: "Chapter Lead",
      program: "Political Science",
      year: "2nd year",
      school: "McMaster University",
      bio: "Interested in Canadian history, international relations, and multiculturalism.",
      chapterId: mcmaster.id,
      term: "2026–27",
      sortOrder: 0,
    },
    {
      name: "Riya Kapoor",
      role: "Chapter Lead",
      program: "Computer Science",
      year: "3rd year",
      school: "Toronto Metropolitan University",
      bio: "Geopolitics, ancient civilizations, and building this website.",
      chapterId: brampton.id,
      term: "2026–27",
      sortOrder: 0,
    },
    {
      name: "Chris Alvarez",
      role: "VP Events",
      program: "History",
      year: "Alumni",
      school: "McMaster University",
      active: false,
      term: "2025–26",
      sortOrder: 0,
    },
  ]);

  await db.insert(events).values([
    {
      title: "Treaty Walk: The Dish With One Spoon",
      theme: "Local history",
      location: "Meet at the Arts Quad",
      eventDate: daysFromNow(6, "17:30"),
      endsAt: daysFromNow(6, "19:00"),
      chapterId: mcmaster.id,
      description:
        "A guided walk across campus exploring the treaties and agreements that shaped the land McMaster sits on.\n\nWear comfortable shoes — we'll finish with snacks and discussion.",
      rsvpUrl: "https://example.com/rsvp",
    },
    {
      title: "World History Trivia Night",
      theme: "World history",
      location: "Brampton Library, Four Corners branch",
      eventDate: daysFromNow(13, "19:00"),
      chapterId: brampton.id,
      description:
        "Teams of up to five. Ancient empires to the Cold War — prizes for the top three teams.",
    },
    {
      title: "Partition Stories: An Evening of Oral History",
      theme: "South Asian history",
      location: "Online",
      eventDate: daysFromNow(24, "18:30"),
      endsAt: daysFromNow(24, "20:00"),
      description:
        "Members share stories passed down in their families about the 1947 Partition of India, followed by an open conversation.",
    },
    {
      title: "Welcome Night",
      theme: "Social",
      location: "MUSC 203",
      eventDate: daysFromNow(-30, "18:00"),
      chapterId: mcmaster.id,
      description: "Kick off the year and meet the team.",
      recap:
        "Over 40 people came out! We heard a short talk on the history beneath campus and planned the year's walking tours.",
    },
    {
      title: "Gore Park Walking Tour",
      theme: "Local history",
      location: "Gore Park, Hamilton",
      eventDate: daysFromNow(-52, "14:00"),
      chapterId: mcmaster.id,
      description: "A tour of downtown Hamilton's oldest public square.",
    },
  ]);

  await db.insert(facts).values([
    {
      title: "The Royal Proclamation",
      fact: "King George III issued the Royal Proclamation of 1763, recognizing Indigenous rights to lands west of the Appalachians and requiring that such land only be acquired by the Crown through treaty. Section 25 of the Canadian Charter of Rights and Freedoms still refers to it.",
      year: 1763,
      month: 10,
      day: 7,
      region: "Canada",
      source: "The Canadian Encyclopedia",
    },
    {
      title: "The Persons Case",
      fact: "Britain's Judicial Committee of the Privy Council ruled that women are “persons” under the British North America Act, opening the door for women to be appointed to the Canadian Senate.",
      year: 1929,
      month: 10,
      day: 18,
      region: "Canada",
    },
    {
      title: "The Battle of Hastings",
      fact: "William, Duke of Normandy, defeated King Harold II, beginning the Norman conquest of England.",
      year: 1066,
      month: 10,
      day: 14,
      region: "England",
    },
    {
      title: "The United Nations is founded",
      fact: "The UN Charter came into force after ratification by a majority of its signatories — now celebrated each year as United Nations Day.",
      year: 1945,
      month: 10,
      day: 24,
      region: "World",
    },
    {
      title: "The Battle of Stoney Creek",
      fact: "A pre-dawn attack by British troops near present-day Hamilton halted an American advance during the War of 1812.",
      year: 1813,
      month: 6,
      day: 6,
      region: "Canada",
    },
    {
      title: "The Ides of March",
      fact: "Julius Caesar was assassinated in Rome by a group of senators.",
      year: -44,
      month: 3,
      day: 15,
      region: "Ancient Rome",
    },
    {
      title: "Magna Carta",
      fact: "King John sealed Magna Carta at Runnymede, establishing that the king was subject to the law.",
      year: 1215,
      month: 6,
      day: 15,
      region: "England",
    },
    {
      title: "Confederation",
      fact: "The British North America Act came into force, uniting Ontario, Quebec, Nova Scotia, and New Brunswick as the Dominion of Canada.",
      year: 1867,
      month: 7,
      day: 1,
      region: "Canada",
    },
    {
      title: "Language Movement Day",
      fact: "Students in Dhaka were killed while protesting for recognition of Bengali as a state language. The day is now marked worldwide as International Mother Language Day.",
      year: 1952,
      month: 2,
      day: 21,
      region: "South Asia",
    },
    {
      title: "Independence and Partition",
      fact: "India became independent from British rule as the subcontinent was partitioned, displacing millions of people.",
      year: 1947,
      month: 8,
      day: 15,
      region: "South Asia",
    },
    {
      title: "The Dish With One Spoon",
      fact: "The Dish With One Spoon is an agreement between the Haudenosaunee, Anishinaabe, and allied nations to share and care for the land and resources around the Great Lakes.",
      region: "Great Lakes",
    },
  ]);

  await db.insert(links).values([
    { platform: "email", url: "hello@example.com", sortOrder: 0 },
    { platform: "instagram", url: "@hbu.example", sortOrder: 1 },
  ]);

  await db.insert(faqs).values([
    {
      question: "Do I need to know a lot about history?",
      answer:
        "Not at all. Most of our members just enjoy a good story — come as you are.",
      sortOrder: 0,
    },
    {
      question: "Does it cost anything?",
      answer: "No. Membership and almost all events are free.",
      sortOrder: 1,
    },
    {
      question: "How do I start a chapter at my school?",
      answer: "Send us an email — we'll help you get set up.",
      sortOrder: 2,
    },
  ]);

  const existingPillars = await db
    .select({ id: pillars.id })
    .from(pillars)
    .limit(1);
  if (!existingPillars.length) {
    await db.insert(pillars).values([
      {
        title: "The land we live on",
        body: "Local and Indigenous history of the places our chapters call home.",
        sortOrder: 0,
      },
      {
        title: "World history",
        body: "From ancient empires to the modern era, told through events and discussion.",
        sortOrder: 1,
      },
      {
        title: "Open to all",
        body: "Come as you are. Membership is free and everyone is welcome.",
        sortOrder: 2,
      },
    ]);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
