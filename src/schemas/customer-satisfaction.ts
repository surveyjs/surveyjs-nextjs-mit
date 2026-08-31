import type { SchemaDefinition, SurveyJSON } from "./types";

/**
 * Customer-satisfaction survey used by the embedded demo, where it is hosted by
 * a mock marketing site rather than by this template's admin shell.
 *
 * Demonstrates: smiley and NPS rating scales, a rating matrix, choices reused
 * from another question, conditional follow-up fields, and `{question}` piping
 * on the last page.
 */
export const customerSatisfactionJson: SurveyJSON = {
  title: "How are we doing?",
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
          type: "comment",
          name: "additionalFeedback",
          title: "Anything you would like to add?",
          placeholder: "The one thing we should fix first…",
          rows: 3,
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
          type: "text",
          name: "contactEmail",
          title: "Where should we reach you?",
          inputType: "email",
          placeholder: "you@company.com",
          visibleIf: "{allowFollowUp} = true",
          isRequired: true,
          requiredIf: "{allowFollowUp} = true",
          validators: [{ type: "email" }],
        },
      ],
    },
  ],
  completedHtml:
    "<h4>Thank you — your feedback is on its way to the team.</h4><p>Every response is read; the ones with a follow-up address get an answer.</p>",
};

export const customerSatisfactionSchema: SchemaDefinition = {
  id: "customer-satisfaction",
  title: "Customer Satisfaction Survey",
  description:
    "Satisfaction and NPS survey embedded into a marketing site, inline or as a modal, drawer or floating widget.",
  json: customerSatisfactionJson,
};
