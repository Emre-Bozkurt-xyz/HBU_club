import { AdminPageHeader } from "../../../_components/ui";
import { createExec } from "../actions";
import { getExecFormData } from "../data";
import { ExecForm } from "../exec-form";

export default async function NewExecPage() {
  const data = await getExecFormData();
  return (
    <>
      <AdminPageHeader
        title="Add a person"
        back={{ href: "/admin/team", label: "Team" }}
      />
      <ExecForm action={createExec} {...data} />
    </>
  );
}
