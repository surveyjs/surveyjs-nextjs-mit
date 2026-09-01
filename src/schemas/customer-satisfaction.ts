import type { SchemaDefinition, SurveyJSON } from "./types";

/**
 * Customer-satisfaction survey used by the embedded demo, where it is hosted by
 * a mock marketing site rather than by this template's admin shell.
 *
 * Demonstrates: smiley and NPS rating scales, a rating matrix, choices reused
 * from another question, conditional follow-up fields, and `{question}` piping
 * on the last page.
 *
 * It is also the simplest of the three demos to read for **personalisation**.
 * Nothing below knows who Alex is; it reads the account the host app passed in as
 * survey variables (see `demo-accounts.ts`) and arranges itself accordingly:
 *
 *  - `{user.firstName}`, `{user.company}`, `{user.planLabel}` are piped into text;
 *  - `usagePeriod` arrives answered, worked out from `{user.monthsActive}`;
 *  - the whole `onboarding` page exists only while `{user.monthsActive} < 3`, so the
 *    progress bar itself is shorter for a three-week-old account;
 *  - `planFit` is for paying customers, `upgradeBlocker` for free ones;
 *  - `csmRating` names the customer's own CSM, and only appears if they have one;
 *  - `supportFollowUp` appears only while a ticket is open, and quotes it;
 *  - the email field is skipped entirely when the account already has one.
 */
export const customerSatisfactionJson: SurveyJSON = {
  title: "Hi {user.firstName}, how are we doing?",
  description:
    "Three short steps, about two minutes. Your answers go straight to the team building Cadence.",
  showQuestionNumbers: "off",
  widthMode: "responsive",
  questionErrorLocation: "bottom",
  showProgressBar: true,
  progressBarLocation: "belowheader",
  progressBarType: "pages",
  progressBarShowPageTitles: true,
  progressBarShowPageNumbers: true,
  progressBarNavigationTextLocation: "bottom",
  completeText: "Send feedback",
  pages: [
    {
      name: "experience",
      title: "Experience",
      elements: [
        {
          type: "html",
          name: "accountNote",
          visibleIf: "{user.company} notempty",
          html: "<p>Answering as <strong>{user.firstName} {user.lastName}</strong> — {user.role} at {user.company} · {user.planLabel} plan · {user.seats} seats.</p>",
        },
        {
          type: "rating",
          name: "overallSatisfaction",
          title: "Overall, how satisfied are you with Cadence?",
          rateType: "smileys",
          scaleColorMode: "colored",
          rateCount: 5,
          rateMax: 5,
          displayMode: "buttons",
          minRateDescription: "Not satisfied",
          maxRateDescription: "Very satisfied",
          isRequired: true,
          requiredErrorText: "Pick the face that fits.",
        },
        {
          type: "matrix",
          name: "aspectRatings",
          title: "How would you rate each part of the product?",
          columns: [
            { value: 1, text: "Poor" },
            { value: 2, text: "Fair" },
            { value: 3, text: "Good" },
            { value: 4, text: "Excellent" },
          ],
          rows: [
            { value: "speed", text: "Speed" },
            { value: "reliability", text: "Reliability" },
            { value: "support", text: "Support" },
            { value: "value", text: "Value for money" },
          ],
        },
        {
          type: "dropdown",
          name: "usagePeriod",
          title: "How long have you been using Cadence?",
          description: "Taken from your account — change it if we have it wrong.",
          defaultValueExpression:
            "iif({user.monthsActive} < 1, 'Less than a month', iif({user.monthsActive} < 6, 'One to six months', iif({user.monthsActive} < 12, 'Six months to a year', 'More than a year')))",
          choices: [
            "Less than a month",
            "One to six months",
            "Six months to a year",
            "More than a year",
          ],
        },
      ],
    },
    {
      name: "onboarding",
      title: "Getting started",
      visibleIf: "{user.monthsActive} < 3",
      description:
        "{user.company} is new here, so these questions are about the start rather than the long run.",
      elements: [
        {
          type: "radiogroup",
          name: "firstTask",
          title: "What were you trying to get done first?",
          choices: [
            "Plan a project",
            "Track my team's work",
            "Replace a spreadsheet",
            "Try it before the team does",
          ],
          showOtherItem: true,
          otherText: "Something else",
        },
        {
          type: "boolean",
          name: "setupBlocked",
          title: "Did anything block you while setting up?",
          labelTrue: "Yes, something did",
          labelFalse: "No, it went fine",
        },
        {
          type: "comment",
          name: "setupBlocker",
          title: "What was it?",
          visibleIf: "{setupBlocked} = true",
          rows: 2,
        },
      ],
    },
    {
      name: "details",
      title: "What matters",
      elements: [
        {
          type: "checkbox",
          name: "likedFeatures",
          title: "Which parts do you like the most?",
          choices: [
            "Ease of use",
            "Speed",
            "Design",
            "Integrations",
            "Customer support",
            "Price",
          ],
          separateSpecialChoices: true,
          showOtherItem: true,
          otherText: "Something else",
          colCount: 2,
        },
        {
          type: "checkbox",
          name: "improvementAreas",
          title: "And which need the most work?",
          choicesFromQuestion: "likedFeatures",
          separateSpecialChoices: true,
          showOtherItem: true,
          otherText: "Something else",
          colCount: 2,
        },
        {
          type: "radiogroup",
          name: "planFit",
          visibleIf: "{user.plan} <> 'free'",
          title: "Is the {user.planLabel} plan the right size for {user.seats} seats?",
          choices: [
            { value: "small", text: "We have outgrown it" },
            { value: "right", text: "About right" },
            { value: "large", text: "More than we need" },
          ],
        },
        {
          type: "comment",
          name: "upgradeBlocker",
          visibleIf: "{user.plan} = 'free'",
          title: "What would a paid plan have to do for you to be worth it?",
          rows: 2,
        },
        {
          type: "comment",
          name: "additionalFeedback",
          title: "Anything you would like to add?",
          placeholder: "The one thing we should fix first…",
          rows: 3,
        },
      ],
    },
    {
      name: "relationship",
      title: "Support",
      visibleIf: "{user.openTicket} = true or {user.csmName} notempty",
      elements: [
        {
          type: "rating",
          name: "supportFollowUp",
          visibleIf: "{user.openTicket} = true",
          title: "Your ticket about “{user.lastTicketSubject}” is still open. How is it going?",
          rateCount: 5,
          rateMin: 1,
          rateMax: 5,
          displayMode: "buttons",
          minRateDescription: "Going badly",
          maxRateDescription: "Handled well",
        },
        {
          type: "comment",
          name: "supportDetail",
          visibleIf: "{supportFollowUp} notempty and {supportFollowUp} <= 3",
          title: "What should have happened instead?",
          rows: 2,
        },
        {
          type: "rating",
          name: "csmRating",
          visibleIf: "{user.csmName} notempty",
          title: "How is working with {user.csmName}?",
          rateCount: 5,
          rateMin: 1,
          rateMax: 5,
          displayMode: "buttons",
          minRateDescription: "Not helpful",
          maxRateDescription: "Excellent",
        },
        {
          type: "radiogroup",
          name: "renewalIntent",
          visibleIf: "{user.csmName} notempty",
          title: "{user.company} renews next quarter. Where does that stand?",
          choices: [
            { value: "certain", text: "We will renew" },
            { value: "likely", text: "Likely, with a few things to sort out" },
            { value: "unsure", text: "Not decided" },
          ],
        },
      ],
    },
    {
      name: "recommend",
      title: "Recommend",
      elements: [
        {
          type: "rating",
          name: "recommendationScore",
          title: "How likely are you to recommend Cadence to a colleague?",
          rateCount: 5,
          rateMin: 1,
          rateMax: 5,
          displayMode: "buttons",
          minRateDescription: "Not at all likely",
          maxRateDescription: "Extremely likely",
        },
        {
          type: "html",
          name: "satisfactionEcho",
          visibleIf: "{overallSatisfaction} notempty",
          html: "<p>You rated your overall experience <strong>{overallSatisfaction} out of 5</strong>. Thanks for taking the time.</p>",
        },
        {
          type: "boolean",
          name: "allowFollowUp",
          title: "May the product team follow up with you?",
          labelTrue: "Yes, please",
          labelFalse: "No, thanks",
        },
        {
          type: "html",
          name: "emailOnFile",
          visibleIf: "{allowFollowUp} = true and {user.email} notempty",
          html: "<p>We will write to <strong>{user.email}</strong> — the address on your account. No need to type it again.</p>",
        },
        {
          type: "text",
          name: "contactEmail",
          title: "Where should we reach you?",
          inputType: "email",
          placeholder: "you@company.com",
          autocomplete: "email",
          visibleIf: "{allowFollowUp} = true and {user.email} empty",
          requiredIf: "{allowFollowUp} = true and {user.email} empty",
          validators: [{ type: "email" }],
        },
      ],
    },
  ],
  completedHtml:
    "<h4>Thank you, {user.firstName} — your feedback is on its way to the team.</h4><p>Every response is read; the ones with a follow-up address get an answer.</p>",
};

export const customerSatisfactionSchema: SchemaDefinition = {
  id: "customer-satisfaction",
  title: "Customer Satisfaction Survey",
  description:
    "Satisfaction and NPS survey embedded in a marketing site, rendered for the signed-in account.",
  json: customerSatisfactionJson,
};
