import {
  CLINIC_LOCATIONS,
  HEALTH_PLANS,
  PREFERRED_DAYS,
  PREFERRED_TIMES,
  PROVIDERS,
  VISIT_REASONS,
} from "./clinic-info";
import type { SchemaDefinition, SurveyJSON } from "./types";

/**
 * "Request an appointment" — the form on Ridgeline Family Health's home page.
 *
 * This is the survey that belongs on a clinic site, and it is the one SurveyJS
 * is bought for: masked phone numbers, a date of birth, conditional insurance
 * panels, required consents, and a review step before anything is submitted.
 * Nothing exotic — the value is that it is the real shape of a real form, and it
 * needs no bespoke CSS to sit on a public-facing page.
 *
 * Every choice is generated from `clinic-info.ts`, so the form can never offer a
 * clinician the directory below it does not list, or a plan the coverage section
 * does not accept.
 */

const providerChoices = [
  { value: "any", text: "First available — whoever can see me soonest" },
  ...PROVIDERS.map((provider) => ({
    value: provider.id,
    text: `${provider.name}, ${provider.credential} — ${provider.specialty}${
      provider.acceptingNew ? "" : " (established patients only)"
    }`,
    // Filters the list down to whoever actually works at the chosen site. If a
    // build of survey-core ignores item-level visibility the list simply stays
    // complete, which is why this is safe to lean on in a demo.
    visibleIf: `{location} empty or {location} anyof [${provider.locationIds
      .map((id) => `'${id}'`)
      .join(", ")}]`,
  })),
];

export const clinicVisitJson: SurveyJSON = {
  title: "Request an appointment",
  description:
    "Tell us what you need and when. A scheduler calls you back the same business day to confirm the time.",
  showQuestionNumbers: "off",
  widthMode: "responsive",
  questionErrorLocation: "bottom",
  showProgressBar: true,
  progressBarLocation: "belowheader",
  progressBarType: "pages",
  progressBarShowPageTitles: true,
  // Nobody should submit their date of birth and insurance ID without seeing it
  // back first — and it is what lets a patient fix one field without retyping.
  showPreviewBeforeComplete: true,
  previewMode: "answeredQuestions",
  completeText: "Request appointment",
  pages: [
    {
      name: "visit",
      title: "Visit",
      elements: [
        {
          type: "html",
          name: "emergencyNotice",
          html: "<p><strong>If this is a medical emergency, call 911.</strong> This form is not monitored after hours and is not a way to reach a clinician urgently. For advice outside opening hours, call our nurse line at (503) 555-0150.</p>",
        },
        {
          type: "radiogroup",
          name: "visitReason",
          title: "What do you need to be seen for?",
          isRequired: true,
          requiredErrorText: "Choose the closest one — the scheduler will sort out the details.",
          choices: VISIT_REASONS.map((reason) => ({
            value: reason.id,
            text: reason.label,
          })),
        },
        {
          type: "comment",
          name: "symptoms",
          title: "Briefly, what is going on?",
          description:
            "A sentence is enough. Please do not include anything you would not want read back to you over the phone.",
          rows: 3,
          maxLength: 400,
          visibleIf: "{visitReason} anyof ['illness', 'urgentCare']",
        },
        {
          type: "radiogroup",
          name: "timeframe",
          title: "How soon?",
          isRequired: true,
          choices: [
            { value: "asap", text: "As soon as possible" },
            { value: "thisWeek", text: "This week" },
            { value: "twoWeeks", text: "In the next two weeks" },
            { value: "flexible", text: "No rush — I am planning ahead" },
          ],
        },
        {
          type: "html",
          name: "urgentNotice",
          visibleIf: "{timeframe} = 'asap' or {visitReason} = 'urgentCare'",
          html: "<p>Walk-in urgent care at our Cedar Park campus is open until 8:00 pm, seven days a week — you do not need this form for it. Submit it anyway if you would rather be called back.</p>",
        },
      ],
    },
    {
      name: "whereWho",
      title: "Where and who",
      elements: [
        {
          type: "radiogroup",
          name: "location",
          title: "Which of our offices?",
          isRequired: true,
          choices: CLINIC_LOCATIONS.map((location) => ({
            value: location.id,
            text: `${location.name} — ${location.address1}, ${location.city}`,
          })),
        },
        {
          type: "dropdown",
          name: "provider",
          title: "Anyone in particular?",
          description: "The list narrows to the clinicians who work at the office you picked.",
          defaultValue: "any",
          choices: providerChoices,
        },
        {
          type: "checkbox",
          name: "preferredDays",
          title: "Which days work?",
          colCount: 3,
          choices: [...PREFERRED_DAYS],
          showNoneItem: true,
          noneText: "Any day",
          separateSpecialChoices: true,
        },
        {
          type: "radiogroup",
          name: "preferredTime",
          title: "And what time of day?",
          defaultValue: "any",
          choices: PREFERRED_TIMES.map((entry) => ({ value: entry.value, text: entry.text })),
        },
        {
          type: "boolean",
          name: "telehealth",
          title: "Would a video visit work instead?",
          labelTrue: "Yes, if it is clinically appropriate",
          labelFalse: "I would rather come in",
        },
      ],
    },
    {
      name: "patient",
      title: "About you",
      elements: [
        {
          type: "text",
          name: "firstName",
          title: "Legal first name",
          isRequired: true,
          autocomplete: "given-name",
        },
        {
          type: "text",
          name: "lastName",
          title: "Legal last name",
          isRequired: true,
          startWithNewLine: false,
          autocomplete: "family-name",
        },
        {
          type: "text",
          name: "preferredName",
          title: "Preferred name",
          description: "What we should call you, if it differs.",
        },
        {
          type: "text",
          name: "dateOfBirth",
          title: "Date of birth",
          inputType: "date",
          isRequired: true,
          startWithNewLine: false,
          autocomplete: "bday",
        },
        {
          type: "text",
          name: "phone",
          title: "Mobile phone",
          inputType: "tel",
          isRequired: true,
          maskType: "pattern",
          maskSettings: { pattern: "(999) 999-9999" },
          placeholder: "(___) ___-____",
          autocomplete: "tel",
        },
        {
          type: "text",
          name: "email",
          title: "Email",
          inputType: "email",
          startWithNewLine: false,
          validators: [{ type: "email" }],
          autocomplete: "email",
        },
        {
          type: "boolean",
          name: "newPatient",
          title: "Is this your first visit to Ridgeline?",
          labelTrue: "Yes, I am a new patient",
          labelFalse: "No, I have been seen here before",
        },
        {
          type: "boolean",
          name: "needsInterpreter",
          title: "Do you need an interpreter?",
          labelTrue: "Yes",
          labelFalse: "No",
        },
        {
          type: "dropdown",
          name: "interpreterLanguage",
          title: "Which language?",
          visibleIf: "{needsInterpreter} = true",
          isRequired: true,
          requiredIf: "{needsInterpreter} = true",
          choices: [
            "Spanish",
            "Vietnamese",
            "Russian",
            "Mandarin",
            "Somali",
            "American Sign Language",
          ],
          showOtherItem: true,
          otherText: "Another language",
        },
      ],
    },
    {
      name: "coverage",
      title: "Coverage",
      elements: [
        {
          type: "radiogroup",
          name: "coverage",
          title: "How will this visit be paid for?",
          isRequired: true,
          choices: [
            { value: "insurance", text: "Through my health plan" },
            { value: "selfPay", text: "Self-pay — I will pay at check-in" },
          ],
        },
        {
          type: "panel",
          name: "insurancePanel",
          title: "Your health plan",
          visibleIf: "{coverage} = 'insurance'",
          elements: [
            {
              type: "dropdown",
              name: "healthPlan",
              title: "Plan",
              description: "We are in network with all of these.",
              isRequired: true,
              requiredIf: "{coverage} = 'insurance'",
              choices: HEALTH_PLANS.map((plan) => ({ value: plan.id, text: plan.name })),
              showOtherItem: true,
              otherText: "Something else — please check for me",
            },
            {
              type: "text",
              name: "memberId",
              title: "Member ID",
              description: "As printed on the front of the card.",
            },
            {
              type: "text",
              name: "groupNumber",
              title: "Group number",
              startWithNewLine: false,
            },
            {
              type: "boolean",
              name: "cardOnFile",
              title: "Have we scanned your card before?",
              labelTrue: "Yes, it should be on file",
              labelFalse: "No, I will bring it",
            },
          ],
        },
        {
          type: "html",
          name: "selfPayNotice",
          visibleIf: "{coverage} = 'selfPay'",
          html: "<p>Our self-pay prices are posted on this page and are the same for everyone. Payment is due at check-in and no claim is filed on your behalf.</p>",
        },
        {
          type: "boolean",
          name: "consentToContact",
          title: "May we leave a voicemail or send a text about this request?",
          isRequired: true,
          labelTrue: "Yes, either is fine",
          labelFalse: "No — call and speak to me only",
        },
        {
          type: "boolean",
          name: "privacyAcknowledged",
          title: "I have read the Notice of Privacy Practices",
          description:
            "Required before we can accept a request. A copy is linked in the footer of this page.",
          isRequired: true,
          requiredErrorText: "We cannot take the request without this acknowledgement.",
        },
      ],
    },
  ],
  completedHtml:
    "<h4>Request received.</h4><p>A scheduler will call you the same business day to confirm a time. Nothing has actually been sent anywhere — Ridgeline Family Health is a fictional clinic built to demonstrate SurveyJS.</p>",
};

export const clinicVisitSchema: SchemaDefinition = {
  id: "clinic-visit",
  title: "Appointment Request",
  description:
    "A US clinic's appointment request: masked phone, conditional insurance panel, consents and a review step — and it drives the page's cost estimate.",
  json: clinicVisitJson,
};
