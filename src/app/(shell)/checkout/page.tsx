import { checkoutSample, getNavItem, getSchemaDefinition } from "@/schemas";
import { PageHeader } from "@/components/PageHeader";
import { SurveyForm } from "@/components/SurveyForm";

const nav = getNavItem("checkout");

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title={nav.label}
        description={nav.description}
        configureHref={`/configure?form=${nav.schemaId}`}
      />
      <SurveyForm
        schema={getSchemaDefinition(nav.schemaId).json}
        schemaId={nav.schemaId}
        prefillData={checkoutSample}
      />
    </div>
  );
}
