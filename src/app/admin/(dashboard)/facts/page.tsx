import { asc } from "drizzle-orm";
import { db } from "@/db";
import { facts, type Fact } from "@/db/schema";
import { DeleteButton } from "../../delete-button";
import { createFact, deleteFact, updateFact } from "./actions";

export const dynamic = "force-dynamic";

const inputClass = "w-full rounded-md border border-black/15 px-3 py-2 text-sm";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default async function AdminFactsPage() {
  const all = await db.select().from(facts).orderBy(asc(facts.month));

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold tracking-tight">Manage facts</h1>

      <section className="rounded-lg border border-black/10 bg-white/50 p-5">
        <h2 className="mb-4 font-semibold">Add a fact</h2>
        <FactFields action={createFact} submitLabel="Add fact" />
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">
          All facts{" "}
          <span className="font-normal text-black/50">({all.length})</span>
        </h2>
        {all.length === 0 ? (
          <p className="text-sm text-black/60">No facts yet.</p>
        ) : (
          <ul className="space-y-3">
            {all.map((fact) => (
              <li
                key={fact.id}
                className="rounded-lg border border-black/10 bg-white/50 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {MONTH_NAMES[fact.month - 1]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-black/70">{fact.fact}</p>

                <div className="mt-3 flex gap-4 text-sm">
                  <details className="flex-1">
                    <summary className="cursor-pointer text-accent">
                      Edit
                    </summary>
                    <div className="mt-3">
                      <FactFields
                        action={updateFact}
                        fact={fact}
                        submitLabel="Save changes"
                      />
                    </div>
                  </details>

                  <form action={deleteFact}>
                    <input type="hidden" name="id" value={fact.id} />
                    <DeleteButton confirmText="Delete this fact? This can't be undone." />
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

function FactFields({
  action,
  fact,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  fact?: Fact;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-3">
      {fact && <input type="hidden" name="id" value={fact.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Month</span>
          <select
            name="month"
            required
            defaultValue={fact?.month ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select a month
            </option>
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Source</span>
          <input
            name="source"
            defaultValue={fact?.source ?? ""}
            className={inputClass}
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Fact</span>
        <textarea
          name="fact"
          rows={3}
          required
          defaultValue={fact?.fact}
          className={inputClass}
        />
      </label>
      <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
        {submitLabel}
      </button>
    </form>
  );
}
