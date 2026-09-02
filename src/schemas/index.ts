export type { SurveyJSON, SurveyData, SurveyMode, SchemaDefinition } from "./types";

export { checkoutJson, checkoutSchema } from "./checkout";
export { clinicVisitJson, clinicVisitSchema } from "./clinic-visit";
export * from "./clinic-info";
export { cloudPlatformJson, cloudPlatformSchema } from "./cloud-platform";
export * from "./cloud-platform-pricing";
export {
  customerSatisfactionJson,
  customerSatisfactionSchema,
} from "./customer-satisfaction";
export { insuranceClaimJson, insuranceClaimSchema } from "./insurance-claim";
export { planFinderJson, planFinderSchema } from "./plan-finder";
export { medicalFormJson, medicalFormSchema } from "./medical-form";
export {
  patientRecordJson,
  CLINIC_PATIENTS,
  PATIENT_LANGUAGES,
} from "./patient-record";

export { medicalFormSample } from "./data/medical-form-seed";
export { checkoutSample } from "./data/checkout-seed";
export { clinicVisitSample } from "./data/clinic-visit-seed";
export { customerSatisfactionSample } from "./data/customer-satisfaction-seed";
export { planFinderSample } from "./data/plan-finder-seed";
export { cloudPlatformSample } from "./data/cloud-platform-seed";
export { insuranceClaimSeed, type ClaimRecord } from "./data/insurance-claim-seed";

export {
  createSurveyModel,
  type CreateSurveyModelOptions,
  type SchemaInput,
} from "./createSurveyModel";

export {
  navItems,
  getNavItem,
  isActiveRoute,
  type NavItem,
  type NavId,
} from "./navigation";

import { checkoutSchema } from "./checkout";
import { clinicVisitSchema } from "./clinic-visit";
import { cloudPlatformSchema } from "./cloud-platform";
import { customerSatisfactionSchema } from "./customer-satisfaction";
import { insuranceClaimSchema } from "./insurance-claim";
import { planFinderSchema } from "./plan-finder";
import { medicalFormSchema } from "./medical-form";
import type { SchemaDefinition } from "./types";

export const schemaRegistry: Record<string, SchemaDefinition> = {
  [checkoutSchema.id]: checkoutSchema,
  [clinicVisitSchema.id]: clinicVisitSchema,
  [cloudPlatformSchema.id]: cloudPlatformSchema,
  [customerSatisfactionSchema.id]: customerSatisfactionSchema,
  [insuranceClaimSchema.id]: insuranceClaimSchema,
  [planFinderSchema.id]: planFinderSchema,
  [medicalFormSchema.id]: medicalFormSchema,
};

export function getSchemaDefinition(id: string): SchemaDefinition {
  const schema = schemaRegistry[id];
  if (!schema) throw new Error(`Unknown schema id: ${id}`);
  return schema;
}
