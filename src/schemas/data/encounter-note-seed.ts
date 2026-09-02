import type { SurveyData } from "../types";

/**
 * A worked-up visit, for the toolbar's Prefill button.
 *
 * Chosen so the calculated half of the note is switched on the moment it lands:
 * two blood-pressure readings average into stage 2 hypertension, the BMI falls
 * in the obese band, and the medication list carries an opioid whose daily MME
 * clears the 50 threshold — which is what makes the naloxone question appear and
 * the follow-up interval drop to two weeks.
 *
 * The signature is deliberately absent: the note cannot be filed unsigned, and a
 * reviewer should see that.
 */
export const encounterNoteSample: SurveyData = {
  encounterType: "office",
  renderingProvider: "navarro",
  encounterSite: "cedarpark",
  interpreterPresent: true,
  chiefComplaint: "followUp",
  hpi: "Three weeks of exertional shortness of breath with a dry cough, worse climbing the stairs at home. No fever. Uses the rescue inhaler most days this week.",
  painNow: 3,
  redFlags: ["dyspnea"],
  escalateToday: true,

  heightIn: 64,
  weightLb: 182,
  bpReadings: [
    { bpPosition: "sitting", sysBp: 148, diaBp: 92, pulseBpm: 84, cuffSize: "standard" },
    { bpPosition: "standing", sysBp: 152, diaBp: 94, pulseBpm: 88 },
  ],
  temperatureF: 98.4,
  respRate: 18,
  spo2: 96,
  tobaccoCounseling: true,

  reconcileChart: true,
  problems: [
    {
      problemName: "asthma",
      onsetDate: "2016-05-02",
      problemStatus: "active",
      problemSeverity: 3,
      icdCode: "J45.4",
      problemAssessment: "Moderate persistent, poorly controlled on the current step.",
    },
    {
      problemName: "hypertension",
      onsetDate: "2021-09-14",
      problemStatus: "chronic",
      problemSeverity: 2,
      icdCode: "I10.0",
    },
  ],

  refillsRequested: true,
  medications: [
    {
      drugName: "albuterol",
      doseAmount: 90,
      doseUnit: "mcg",
      dosesPerDay: 4,
      medRoute: "inhaled",
      continueMed: true,
    },
    {
      drugName: "lisinopril",
      doseAmount: 10,
      doseUnit: "mg",
      dosesPerDay: 1,
      medRoute: "po",
      continueMed: true,
    },
    {
      drugName: "hydrocodone",
      doseAmount: 10,
      doseUnit: "mg",
      dosesPerDay: 6,
      medRoute: "po",
      isOpioid: true,
      mmeFactor: 1,
      continueMed: false,
    },
  ],
  naloxoneOffered: true,
  pharmacyNote: "Send the inhaler refill to the Cedar Park pharmacy on file.",

  surgicalHistory: [
    {
      procedureName: "Appendectomy",
      procedureYear: 2009,
      anesthesiaType: "general",
      hadComplication: false,
    },
  ],
  familyHistory: {
    heart: { mother: false, father: true, sibling: false },
    diabetesFamily: { mother: true, father: false, sibling: true },
  },
  tobaccoStatus: "former",
  drinksPerWeek: 3,
  screeningsDue: ["a1c", "lipids"],

  rosAbnormal: ["respiratory", "cardiovascular"],
  examFindings: {
    respiratory: {
      examImpression: "significant",
      examDetail: "Expiratory wheeze in both lower fields, prolonged expiratory phase.",
    },
    cardiovascular: { examImpression: "normal" },
  },
  examNarrative:
    "Alert and in no distress at rest, mildly tachypnoeic after walking to the room.",

  assessmentText:
    "Poorly controlled moderate persistent asthma with a stage 2 blood pressure reading today. Step up the controller, recheck the pressure in two weeks, taper off the opioid started elsewhere.",
  orders: [
    { orderCategory: "lab", orderItem: "cmp", orderPriority: "routine" },
    { orderCategory: "imaging", orderItem: "chestXray", orderPriority: "soon" },
    { orderCategory: "referral", orderItem: "cardiology", orderPriority: "routine" },
  ],
  followUpWeeks: 2,
  sendToPortal: true,
};
