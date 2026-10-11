import { asc } from "drizzle-orm";
import { db } from "@/db";
import { chapters, execs } from "@/db/schema";

/** Chapter options + autocomplete suggestions drawn from existing profiles. */
export async function getExecFormData() {
  const [chapterList, rows] = await Promise.all([
    db
      .select({
        id: chapters.id,
        name: chapters.name,
        institution: chapters.institution,
      })
      .from(chapters)
      .orderBy(asc(chapters.sortOrder)),
    db
      .select({
        school: execs.school,
        program: execs.program,
        role: execs.role,
      })
      .from(execs),
  ]);
  const unique = (values: (string | null)[]) =>
    [...new Set(values.filter(Boolean) as string[])].sort();
  return {
    chapters: chapterList,
    suggestions: {
      schools: unique(rows.map((r) => r.school)),
      programs: unique(rows.map((r) => r.program)),
      roles: unique(rows.map((r) => r.role)),
    },
  };
}
