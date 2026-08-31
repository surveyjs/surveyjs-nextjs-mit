import { BREW_METHODS } from "./shop-catalog";
import type { SchemaDefinition, SurveyJSON } from "./types";

/**
 * The "find your coffee" quiz on the Northmill product page.
 *
 * Deliberately the smallest survey in this template: five questions, one per
 * page. That shape is not a stylistic choice — it is what the pattern looks like
 * wherever it actually earns money (fit finders, skin-routine quizzes, gift
 * finders). One question at a time keeps the card short enough to sit beside the
 * product above the fold, and every answer is a single click, so a visitor
 * finishes it in the time they would have spent reading one product description.
 *
 * The interesting part is downstream: the page listens to these five answers and
 * changes which product it is selling. See `matchCoffee` in `shop-catalog.ts`.
 */

const brewChoices = BREW_METHODS.map((method) => ({
  value: method.id,
  text: method.label,
}));

export const coffeeFinderJson: SurveyJSON = {
  title: "Find your coffee",
  description: "Five questions. We will pick the bag, the grind and how often it arrives.",
  showQuestionNumbers: "off",
  widthMode: "responsive",
  questionErrorLocation: "bottom",
  showProgressBar: true,
  progressBarLocation: "belowheader",
  progressBarType: "pages",
  completeText: "Show my match",
  // Five one-question pages: the visitor is never looking at a form, only at a
  // question, which is why this converts where a filter sidebar does not.
  pages: [
    {
      name: "brew",
      elements: [
        {
          type: "radiogroup",
          name: "brewMethod",
          title: "How do you make it?",
          description: "This decides the grind we ship.",
          isRequired: true,
          requiredErrorText: "Pick the one you use most.",
          choices: brewChoices,
        },
      ],
    },
    {
      name: "taste",
      elements: [
        {
          type: "radiogroup",
          name: "taste",
          title: "Which of these sounds like a good cup?",
          isRequired: true,
          choices: [
            { value: "bright", text: "Bright and fruity — peach, citrus, florals" },
            { value: "chocolate", text: "Chocolate and nutty — cocoa, hazelnut" },
            { value: "sweet", text: "Sweet and round — caramel, brown sugar" },
          ],
        },
      ],
    },
    {
      name: "roast",
      elements: [
        {
          type: "radiogroup",
          name: "roast",
          title: "And the roast?",
          choices: [
            { value: "light", text: "Light" },
            { value: "medium", text: "Medium" },
            { value: "dark", text: "Dark" },
            { value: "unsure", text: "No idea — choose for me" },
          ],
          defaultValue: "unsure",
        },
        {
          type: "boolean",
          name: "withMilk",
          title: "Do you drink it with milk?",
          labelTrue: "Usually with milk",
          labelFalse: "Black",
        },
      ],
    },
    {
      name: "volume",
      elements: [
        {
          type: "radiogroup",
          name: "cupsPerDay",
          title: "How many cups a day, across the household?",
          description: "This sets the bag size and how often it turns up.",
          isRequired: true,
          choices: [
            { value: "1", text: "About one" },
            { value: "2", text: "Two" },
            { value: "3-4", text: "Three or four" },
            { value: "5+", text: "Five or more" },
          ],
        },
      ],
    },
    {
      name: "caffeine",
      elements: [
        {
          type: "boolean",
          name: "decaf",
          title: "Should it be decaf?",
          labelTrue: "Yes, decaf",
          labelFalse: "No, regular",
          defaultValue: false,
        },
        {
          type: "html",
          name: "finderOutro",
          html: "<p>That is everything. Your match, the grind and a delivery schedule are on the next screen — and nothing is bought until you say so.</p>",
        },
      ],
    },
  ],
  completedHtml:
    "<h4>Matched.</h4><p>Your bag is selected on the page — grind, size and delivery included. This is a demo of a fictional roaster; no order is placed.</p>",
};

export const coffeeFinderSchema: SchemaDefinition = {
  id: "coffee-finder",
  title: "Coffee Finder Quiz",
  description:
    "Five one-click questions that pick a specific bag, grind, size and delivery cadence — and re-point the product page at it.",
  json: coffeeFinderJson,
};
