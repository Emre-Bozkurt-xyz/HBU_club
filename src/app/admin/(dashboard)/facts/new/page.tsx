import { db } from "@/db";
import { facts } from "@/db/schema";
import { AdminPageHeader } from "../../../_components/ui";
import { createFact } from "../actions";
import { FactForm } from "../fact-form";

export default async function NewFactPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const regions = await db.selectDistinct({ region: facts.region }).from(facts);
  const m = Number(month);
  return (
    <>
      <AdminPageHeader
        title="Add a fact"
        back={{ href: "/admin/facts", label: "History facts" }}
      />
      <FactForm
        action={createFact}
        regions={regions.map((r) => r.region).filter(Boolean) as string[]}
        defaultMonth={m >= 1 && m <= 12 ? m : undefined}
      />
    </>
  );
}
