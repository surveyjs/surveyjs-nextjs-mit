import { getSchemaDefinition } from "@/schemas";
import { ClinicFormEditor } from "@/components/clinic-admin/ClinicFormEditor";

const FORM_ID = "clinic-visit";

/** The section the portal opens on: the form the website renders. */
export default function ClinicAdminFormPage() {
  return (
    <ClinicFormEditor
      formId={FORM_ID}
      defaultSource={JSON.stringify(getSchemaDefinition(FORM_ID).json, null, 2)}
    />
  );
}
