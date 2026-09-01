import {
  CLOUD_MODULES,
  COMPLIANCE_ADDONS,
  COMPUTE_SIZES,
  DATA_VOLUMES,
  PROJECT_COUNTS,
  SUPPORT_TIERS,
  formatUsd,
} from "./cloud-platform-pricing";
import type { SchemaDefinition, SurveyJSON } from "./types";

/**
 * The configurator on the Cloud Platform demo's pricing page.
 *
 * Every choice below is generated from the price list in
 * `cloud-platform-pricing.ts`, so a price shown in a question label is the same
 * number the quote adds up and the same number the plan cards advertise.
 *
 * What this schema is for, beyond being a form: the host page listens to it and
 * re-prices itself on every answer. So it leans on the features that make that
 * worth watching — a dynamic panel that adds priced rows, branches that only
 * appear once a module is chosen, and the built-in preview step, which is what
 * lets a visitor change an answer after seeing the result without losing the
 * rest of them.
 *
 * The other half is that it opens on what the CRM already knows about the account
 * (`{user.…}`, see `demo-accounts.ts`), which for a sales-led product is the
 * difference between a form and a proposal:
 *
 *  - `projects` and `compliance` arrive answered from the account record;
 *  - an existing customer is asked what they are changing, a prospect where they
 *    are in evaluating it;
 *  - `baaRequired` appears only for accounts with HIPAA on file;
 *  - the whole `residency` page exists only for EU accounts;
 *  - the email is never asked for twice.
 */

const moduleChoices = CLOUD_MODULES.map((entry) => ({
  value: entry.id,
  text: `${entry.name} — ${formatUsd(entry.price)}/mo`,
}));

const computeChoices = COMPUTE_SIZES.map((size) => ({
  value: size.id,
  text: `${size.name} — ${formatUsd(size.price)}/mo`,
}));

const supportChoices = SUPPORT_TIERS.map((tier) => ({
  value: tier.id,
  text: tier.price === 0 ? tier.name : `${tier.name} — ${formatUsd(tier.price)}/mo`,
}));

const complianceChoices = COMPLIANCE_ADDONS.map((addon) => ({
  value: addon.id,
  text: `${addon.name} — ${formatUsd(addon.price)}/mo`,
}));

export const cloudPlatformJson: SurveyJSON = {
  title: "{user.companyName}, let's size your platform",
  description:
    "A few short steps, some of them already filled in from your account. The price on the right updates as you answer.",
  showQuestionNumbers: "off",
  widthMode: "responsive",
  questionErrorLocation: "bottom",
  showProgressBar: true,
  progressBarLocation: "belowheader",
  progressBarType: "pages",
  progressBarShowPageTitles: true,
  progressBarShowPageNumbers: true,
  progressBarNavigationTextLocation: "bottom",
  // The point of the demo: see the quote, then go back and change one answer.
  showPreviewBeforeComplete: true,
  previewMode: "answeredQuestions",
  completeText: "See my plan",
  pages: [
    {
      name: "workload",
      title: "Workload",
      elements: [
        {
          type: "html",
          name: "accountNote",
          visibleIf: "{user.companyName} notempty",
          html: "<p>Prepared for <strong>{user.companyName}</strong> — {user.industry}, about {user.employees} people, {user.regionLabel}.</p>",
        },
        {
          type: "html",
          name: "trialNote",
          visibleIf: "{user.trialDaysLeft} > 0",
          html: "<p>Your trial has <strong>{user.trialDaysLeft} days</strong> left. Nothing here starts a subscription.</p>",
        },
        {
          type: "radiogroup",
          name: "changeType",
          visibleIf: "{user.existingCustomer} = true",
          title: "You are on {user.currentPlanLabel} today. What is this about?",
          choices: [
            { value: "upgrade", text: "Moving up a plan" },
            { value: "environments", text: "Adding environments" },
            { value: "renewal", text: "Pricing the renewal" },
            { value: "curious", text: "Just checking the numbers" },
          ],
        },
        {
          type: "radiogroup",
          name: "evaluationStage",
          visibleIf: "{user.existingCustomer} = false",
          title: "Where are you in looking at this?",
          choices: [
            { value: "early", text: "Early — comparing options" },
            { value: "shortlist", text: "On a shortlist" },
            { value: "chosen", text: "Decided, working out the size" },
          ],
        },
        {
          type: "radiogroup",
          name: "workload",
          title: "What are you building first?",
          isRequired: true,
          requiredErrorText: "Pick the closest one — you can change it later.",
          choices: [
            { value: "analytics", text: "Analytics and reporting" },
            { value: "realtime", text: "Real-time event processing" },
            { value: "ml", text: "Feature pipelines for ML" },
            { value: "platform", text: "A platform for several teams" },
          ],
        },
        {
          type: "dropdown",
          name: "projects",
          title: "How many projects will live on it?",
          description: "Sized from your headcount to start with.",
          isRequired: true,
          defaultValueExpression:
            "iif({user.employees} < 100, 1, iif({user.employees} < 500, 5, iif({user.employees} < 2000, 25, 80)))",
          choices: PROJECT_COUNTS.map((count) => ({ value: count.value, text: count.text })),
        },
        {
          type: "dropdown",
          name: "dataVolumeGb",
          title: "Roughly how much data will you keep?",
          description: "Storage past your plan's allowance is billed per GB.",
          isRequired: true,
          choices: DATA_VOLUMES.map((volume) => ({ value: volume.value, text: volume.text })),
        },
      ],
    },
    {
      name: "compute",
      title: "Environments",
      elements: [
        {
          type: "html",
          name: "computeIntro",
          html: "<p>Add the environments you need. Each one is priced on its own, and you can remove any of them.</p>",
        },
        {
          type: "paneldynamic",
          name: "environments",
          title: "Environments",
          titleLocation: "hidden",
          templateTitle: "Environment {panelIndex}",
          panelCount: 1,
          minPanelCount: 0,
          maxPanelCount: 12,
          addPanelText: "Add an environment",
          removePanelText: "Remove",
          templateElements: [
            {
              type: "text",
              name: "envName",
              title: "Name",
              placeholder: "production",
              isRequired: true,
            },
            {
              type: "dropdown",
              name: "envSize",
              title: "Size",
              isRequired: true,
              choices: computeChoices,
            },
            {
              type: "boolean",
              name: "envAlwaysOn",
              title: "Always on?",
              labelTrue: "Yes",
              labelFalse: "Business hours only",
            },
          ],
        },
      ],
    },
    {
      name: "modules",
      title: "Modules",
      elements: [
        {
          type: "checkbox",
          name: "modules",
          title: "Which modules do you want switched on?",
          description: "Each is billed monthly on top of the platform fee.",
          choices: moduleChoices,
          showNoneItem: true,
          noneText: "None for now",
          separateSpecialChoices: true,
        },
        {
          type: "dropdown",
          name: "peakEventsPerSecond",
          title: "Peak events per second?",
          description: "Streams is sized from this.",
          visibleIf: "{modules} contains 'streams'",
          choices: [
            "Under 1,000",
            "1,000 to 10,000",
            "10,000 to 100,000",
            "More than 100,000",
          ],
        },
        {
          type: "dropdown",
          name: "queryConcurrency",
          title: "How many concurrent queries at peak?",
          visibleIf: "{modules} contains 'warehouse'",
          choices: ["Under 10", "10 to 50", "50 to 200", "More than 200"],
        },
        {
          type: "comment",
          name: "guardNotes",
          title: "Which checks matter most to you?",
          placeholder: "Freshness on the revenue tables, row counts on ingest…",
          rows: 2,
          visibleIf: "{modules} contains 'guard'",
        },
      ],
    },
    {
      name: "governance",
      title: "Governance",
      elements: [
        {
          type: "boolean",
          name: "ssoRequired",
          title: "Do you need SSO and an audit log?",
          labelTrue: "Yes",
          labelFalse: "Not yet",
        },
        {
          type: "boolean",
          name: "selfHosted",
          title: "Does it have to run inside your own VPC?",
          labelTrue: "Yes",
          labelFalse: "No, hosted is fine",
        },
        {
          type: "checkbox",
          name: "compliance",
          title: "Any compliance commitments we should cover?",
          description: "The ones already on your account are ticked.",
          defaultValueExpression: "{user.complianceOnFile}",
          choices: complianceChoices,
          showNoneItem: true,
          noneText: "None",
          separateSpecialChoices: true,
        },
        {
          type: "boolean",
          name: "baaRequired",
          visibleIf: "{user.complianceOnFile} contains 'hipaa'",
          title: "Do you need the BAA signed before the first environment?",
          description: "HIPAA is on your account, so we ask.",
          labelTrue: "Yes, before anything runs",
          labelFalse: "No, alongside is fine",
        },
        {
          type: "radiogroup",
          name: "supportTier",
          title: "How much support do you want?",
          defaultValue: "standard",
          choices: supportChoices,
        },
      ],
    },
    {
      name: "residency",
      title: "Data residency",
      visibleIf: "{user.region} = 'eu'",
      description:
        "{user.companyName} is in the {user.regionLabel}, so this page exists. It is not shown to accounts outside it.",
      elements: [
        {
          type: "radiogroup",
          name: "dataRegion",
          title: "Where should the data stay?",
          isRequired: true,
          choices: [
            { value: "frankfurt", text: "Frankfurt" },
            { value: "dublin", text: "Dublin" },
            { value: "zurich", text: "Zurich" },
          ],
        },
        {
          type: "boolean",
          name: "dpaRequired",
          title: "Do you need a DPA with standard contractual clauses?",
          labelTrue: "Yes",
          labelFalse: "Already covered",
        },
        {
          type: "boolean",
          name: "subprocessorReview",
          title: "Does your team review sub-processors before go-live?",
          labelTrue: "Yes",
          labelFalse: "No",
        },
      ],
    },
    {
      name: "contact",
      title: "Send it",
      elements: [
        {
          type: "html",
          name: "contactIntro",
          html: "<p>That is everything we need. The next step shows your answers so you can change any of them before you see the plan.</p>",
        },
        {
          type: "dropdown",
          name: "startWhen",
          title: "When would you want to start?",
          defaultValueExpression:
            "iif({user.trialDaysLeft} > 0 and {user.trialDaysLeft} <= 7, 'This week', iif({user.existingCustomer} = true, 'This month', ''))",
          choices: ["This week", "This month", "This quarter", "Just pricing it up"],
        },
        {
          type: "boolean",
          name: "sendQuote",
          title: "Should we email you this quote?",
          defaultValue: true,
          labelTrue: "Yes, please",
          labelFalse: "No, thanks",
        },
        {
          type: "html",
          name: "emailOnFile",
          visibleIf: "{sendQuote} = true and {user.email} notempty",
          html: "<p>We will send it to <strong>{user.email}</strong>, the address on the account. Nothing to type.</p>",
        },
        {
          type: "text",
          name: "contactEmail",
          title: "Where should we send it?",
          inputType: "email",
          placeholder: "you@company.com",
          autocomplete: "email",
          visibleIf: "{sendQuote} = true and {user.email} empty",
          requiredIf: "{sendQuote} = true and {user.email} empty",
          validators: [{ type: "email" }],
        },
      ],
    },
  ],
  completedHtml:
    "<h4>Your plan is on the page below.</h4><p>Nothing has been sent anywhere — this is a demo of a fictional product.</p>",
};

export const cloudPlatformSchema: SchemaDefinition = {
  id: "cloud-platform",
  title: "Cloud Platform Configurator",
  description:
    "Prices a platform from the answers — tier, modules, environments, storage, support and compliance — and drives the pricing page around it.",
  json: cloudPlatformJson,
};
