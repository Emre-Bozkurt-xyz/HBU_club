import { asc } from "drizzle-orm";
import { db } from "@/db";
import { execs } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ExecsPage() {
  const team = await db.select().from(execs).orderBy(asc(execs.createdAt));

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">The team</h1>
        <p className="text-black/70">The execs who keep the club running.</p>
      </header>

      {team.length === 0 ? (
        <p className="text-black/60">Team profiles coming soon.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {team.map((exec) => (
            <li
              key={exec.id}
              className="rounded-lg border border-black/10 bg-white/50 p-5"
            >
              <h2 className="font-semibold">{exec.name}</h2>
              <p className="text-sm font-medium text-accent">{exec.role}</p>
              {exec.bio && (
                <p className="mt-2 text-sm text-black/70">{exec.bio}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
