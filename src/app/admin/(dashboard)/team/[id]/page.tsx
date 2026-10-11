import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { execs } from "@/db/schema";
import { DeleteButton } from "../../../_components/delete-button";
import { AdminPageHeader, Badge } from "../../../_components/ui";
import { deleteExec, updateExec } from "../actions";
import { getExecFormData } from "../data";
import { ExecForm } from "../exec-form";

export default async function EditExecPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [[exec], data] = await Promise.all([
    db.select().from(execs).where(eq(execs.id, id)),
    getExecFormData(),
  ]);
  if (!exec) notFound();

  return (
    <>
      <AdminPageHeader
        title={exec.name}
        description={!exec.active && <Badge>Past executive</Badge>}
        back={{ href: "/admin/team", label: "Team" }}
        actions={
          <form action={deleteExec}>
            <input type="hidden" name="id" value={exec.id} />
            <DeleteButton
              confirmText={`Delete ${exec.name}'s profile? To keep them in the "Past executives" list instead, turn off "Current exec".`}
            />
          </form>
        }
      />
      <ExecForm action={updateExec} exec={exec} {...data} />
    </>
  );
}
