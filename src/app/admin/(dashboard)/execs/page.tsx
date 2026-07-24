import { asc } from "drizzle-orm";
import { db } from "@/db";
import { execs, type Exec } from "@/db/schema";
import { DeleteButton } from "../../delete-button";
import { createExec, deleteExec, updateExec } from "./actions";

export const dynamic = "force-dynamic";

const inputClass = "w-full rounded-md border border-black/15 px-3 py-2 text-sm";

export default async function AdminExecsPage() {
  const all = await db.select().from(execs).orderBy(asc(execs.createdAt));

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold tracking-tight">Manage execs</h1>

      <section className="rounded-lg border border-black/10 bg-white/50 p-5">
        <h2 className="mb-4 font-semibold">Add an exec</h2>
        <ExecFields action={createExec} submitLabel="Add exec" />
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">
          All execs{" "}
          <span className="font-normal text-black/50">({all.length})</span>
        </h2>
        {all.length === 0 ? (
          <p className="text-sm text-black/60">No execs yet.</p>
        ) : (
          <ul className="space-y-3">
            {all.map((exec) => (
              <li
                key={exec.id}
                className="rounded-lg border border-black/10 bg-white/50 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{exec.name}</span>
                  <span className="text-sm text-black/50">{exec.role}</span>
                </div>

                <div className="mt-3 flex gap-4 text-sm">
                  <details className="flex-1">
                    <summary className="cursor-pointer text-accent">
                      Edit
                    </summary>
                    <div className="mt-3">
                      <ExecFields
                        action={updateExec}
                        exec={exec}
                        submitLabel="Save changes"
                      />
                    </div>
                  </details>

                  <form action={deleteExec}>
                    <input type="hidden" name="id" value={exec.id} />
                    <DeleteButton confirmText={`Delete "${exec.name}"? This can't be undone.`} />
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

function ExecFields({
  action,
  exec,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  exec?: Exec;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-3">
      {exec && <input type="hidden" name="id" value={exec.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            required
            defaultValue={exec?.name}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Role</span>
          <input
            name="role"
            required
            defaultValue={exec?.role}
            className={inputClass}
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Bio</span>
        <textarea
          name="bio"
          rows={3}
          defaultValue={exec?.bio ?? ""}
          className={inputClass}
        />
      </label>
      <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
        {submitLabel}
      </button>
    </form>
  );
}
