import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { facts } from "@/db/schema";
import { formatHistoricalDate } from "@/lib/format";
import { DeleteButton } from "../../../_components/delete-button";
import { AdminPageHeader } from "../../../_components/ui";
import { deleteFact, updateFact } from "../actions";
import { FactForm } from "../fact-form";

export default async function EditFactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [[fact], regions] = await Promise.all([
    db.select().from(facts).where(eq(facts.id, id)),
    db.selectDistinct({ region: facts.region }).from(facts),
  ]);
  if (!fact) notFound();

  return (
    <>
      <AdminPageHeader
        title={fact.title || formatHistoricalDate(fact) || "Edit fact"}
        back={{ href: "/admin/facts", label: "History facts" }}
        actions={
          <form action={deleteFact}>
            <input type="hidden" name="id" value={fact.id} />
            <DeleteButton confirmText="Delete this fact? This can't be undone." />
          </form>
        }
      />
      <FactForm
        action={updateFact}
        fact={fact}
        regions={regions.map((r) => r.region).filter(Boolean) as string[]}
      />
    </>
  );
}
