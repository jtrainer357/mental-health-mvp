/**
 * Seed Outcome Measures — PHQ-9, GAD-7, PCL-5 data points
 * Scores match the session note Objective sections exactly.
 * Dates match appointment cadence via weeklyHistoryDates.
 */

import type { SeedOutcomeMeasure } from "./types";
import { weeklyHistoryDates } from "./helpers";

// ---------------------------------------------------------------------------
// Date scaffolds — same preferred weekdays as session-notes.ts
// ---------------------------------------------------------------------------
const rachelDates = weeklyHistoryDates(2);
const jamesDates = weeklyHistoryDates(3);
const sophiaDates = weeklyHistoryDates(1);
const marcusDates = weeklyHistoryDates(4);
const lisaDates = weeklyHistoryDates(5);
const emmaDates = weeklyHistoryDates(2);
const davidDates = weeklyHistoryDates(3);
const carmenDates = weeklyHistoryDates(1);
const kevinDates = weeklyHistoryDates(4);
const priyaDates = weeklyHistoryDates(5);
const jordanDates = weeklyHistoryDates(4);
const robertDates = weeklyHistoryDates(2);
const aaliyahDates = weeklyHistoryDates(3);
const danielDates = weeklyHistoryDates(1);
const mariaDates = weeklyHistoryDates(4);
const benjaminDates = weeklyHistoryDates(5);
// Light history — 2 data points
const sarahDates = weeklyHistoryDates(2).slice(2);
const michaelDates = weeklyHistoryDates(3).slice(2);
const jasmineDates = weeklyHistoryDates(1).slice(2);
const omarDates = weeklyHistoryDates(4).slice(2);
const natalieDates = weeklyHistoryDates(5).slice(2);
// Inactive — 1 data point
const margaretDates = weeklyHistoryDates(2).slice(0, 1);
const thomasDates = weeklyHistoryDates(3).slice(0, 1);
// No-show — 2 data points
const derekDates = weeklyHistoryDates(4).slice(0, 2);
// Non-binary
const riverDates = weeklyHistoryDates(1);

const ADMIN = "Dr. Sarah Chen";

export const OUTCOME_MEASURES: SeedOutcomeMeasure[] = [
  // ==========================================================================
  // RACHEL TORRES — PHQ-9: 15 -> 12 -> 9 -> 5
  // ==========================================================================
  {
    id: "om-rachel-torres-1",
    patient_id: "rachel-torres",
    measure_type: "PHQ-9",
    score: 15,
    max_score: 27,
    measurement_date: rachelDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-rachel-torres-2",
    patient_id: "rachel-torres",
    measure_type: "PHQ-9",
    score: 12,
    max_score: 27,
    measurement_date: rachelDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-rachel-torres-3",
    patient_id: "rachel-torres",
    measure_type: "PHQ-9",
    score: 9,
    max_score: 27,
    measurement_date: rachelDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-rachel-torres-4",
    patient_id: "rachel-torres",
    measure_type: "PHQ-9",
    score: 5,
    max_score: 27,
    measurement_date: rachelDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // JAMES OKAFOR — PCL-5: 42 -> 38 -> 31 -> 25
  // ==========================================================================
  {
    id: "om-james-okafor-1",
    patient_id: "james-okafor",
    measure_type: "PCL-5",
    score: 42,
    max_score: 80,
    measurement_date: jamesDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-james-okafor-2",
    patient_id: "james-okafor",
    measure_type: "PCL-5",
    score: 38,
    max_score: 80,
    measurement_date: jamesDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-james-okafor-3",
    patient_id: "james-okafor",
    measure_type: "PCL-5",
    score: 31,
    max_score: 80,
    measurement_date: jamesDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-james-okafor-4",
    patient_id: "james-okafor",
    measure_type: "PCL-5",
    score: 25,
    max_score: 80,
    measurement_date: jamesDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // SOPHIA CHEN — GAD-7: 14 -> 12 -> 9 -> 7
  // ==========================================================================
  {
    id: "om-sophia-chen-1",
    patient_id: "sophia-chen",
    measure_type: "GAD-7",
    score: 14,
    max_score: 21,
    measurement_date: sophiaDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-sophia-chen-2",
    patient_id: "sophia-chen",
    measure_type: "GAD-7",
    score: 12,
    max_score: 21,
    measurement_date: sophiaDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-sophia-chen-3",
    patient_id: "sophia-chen",
    measure_type: "GAD-7",
    score: 9,
    max_score: 21,
    measurement_date: sophiaDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-sophia-chen-4",
    patient_id: "sophia-chen",
    measure_type: "GAD-7",
    score: 7,
    max_score: 21,
    measurement_date: sophiaDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // MARCUS WASHINGTON — PHQ-9: 11 -> 9 -> 7 -> 5
  // ==========================================================================
  {
    id: "om-marcus-washington-1",
    patient_id: "marcus-washington",
    measure_type: "PHQ-9",
    score: 11,
    max_score: 27,
    measurement_date: marcusDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-marcus-washington-2",
    patient_id: "marcus-washington",
    measure_type: "PHQ-9",
    score: 9,
    max_score: 27,
    measurement_date: marcusDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-marcus-washington-3",
    patient_id: "marcus-washington",
    measure_type: "PHQ-9",
    score: 7,
    max_score: 27,
    measurement_date: marcusDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-marcus-washington-4",
    patient_id: "marcus-washington",
    measure_type: "PHQ-9",
    score: 5,
    max_score: 27,
    measurement_date: marcusDates[3]!,
    administered_by: ADMIN,
  },

  // tyler-harrison: NO data points (new patient)

  // ==========================================================================
  // LISA WHITFIELD — GAD-7: 18 -> 16 -> 14 -> 13
  // ==========================================================================
  {
    id: "om-lisa-whitfield-1",
    patient_id: "lisa-whitfield",
    measure_type: "GAD-7",
    score: 18,
    max_score: 21,
    measurement_date: lisaDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-lisa-whitfield-2",
    patient_id: "lisa-whitfield",
    measure_type: "GAD-7",
    score: 16,
    max_score: 21,
    measurement_date: lisaDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-lisa-whitfield-3",
    patient_id: "lisa-whitfield",
    measure_type: "GAD-7",
    score: 14,
    max_score: 21,
    measurement_date: lisaDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-lisa-whitfield-4",
    patient_id: "lisa-whitfield",
    measure_type: "GAD-7",
    score: 13,
    max_score: 21,
    measurement_date: lisaDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // EMMA KOWALSKI — PHQ-9: 13 -> 11 -> 9 -> 7
  // ==========================================================================
  {
    id: "om-emma-kowalski-1",
    patient_id: "emma-kowalski",
    measure_type: "PHQ-9",
    score: 13,
    max_score: 27,
    measurement_date: emmaDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-emma-kowalski-2",
    patient_id: "emma-kowalski",
    measure_type: "PHQ-9",
    score: 11,
    max_score: 27,
    measurement_date: emmaDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-emma-kowalski-3",
    patient_id: "emma-kowalski",
    measure_type: "PHQ-9",
    score: 9,
    max_score: 27,
    measurement_date: emmaDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-emma-kowalski-4",
    patient_id: "emma-kowalski",
    measure_type: "PHQ-9",
    score: 7,
    max_score: 27,
    measurement_date: emmaDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // DAVID NAKAMURA — GAD-7: 10 -> 8 -> 6 -> 4
  // ==========================================================================
  {
    id: "om-david-nakamura-1",
    patient_id: "david-nakamura",
    measure_type: "GAD-7",
    score: 10,
    max_score: 21,
    measurement_date: davidDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-david-nakamura-2",
    patient_id: "david-nakamura",
    measure_type: "GAD-7",
    score: 8,
    max_score: 21,
    measurement_date: davidDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-david-nakamura-3",
    patient_id: "david-nakamura",
    measure_type: "GAD-7",
    score: 6,
    max_score: 21,
    measurement_date: davidDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-david-nakamura-4",
    patient_id: "david-nakamura",
    measure_type: "GAD-7",
    score: 4,
    max_score: 21,
    measurement_date: davidDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // CARMEN ALVAREZ — PHQ-9: 19 -> 17 -> 16 -> 15
  // ==========================================================================
  {
    id: "om-carmen-alvarez-1",
    patient_id: "carmen-alvarez",
    measure_type: "PHQ-9",
    score: 19,
    max_score: 27,
    measurement_date: carmenDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-carmen-alvarez-2",
    patient_id: "carmen-alvarez",
    measure_type: "PHQ-9",
    score: 17,
    max_score: 27,
    measurement_date: carmenDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-carmen-alvarez-3",
    patient_id: "carmen-alvarez",
    measure_type: "PHQ-9",
    score: 16,
    max_score: 27,
    measurement_date: carmenDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-carmen-alvarez-4",
    patient_id: "carmen-alvarez",
    measure_type: "PHQ-9",
    score: 15,
    max_score: 27,
    measurement_date: carmenDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // KEVIN RHODES — PHQ-9: 20 -> 17 -> 14 -> 12
  // ==========================================================================
  {
    id: "om-kevin-rhodes-1",
    patient_id: "kevin-rhodes",
    measure_type: "PHQ-9",
    score: 20,
    max_score: 27,
    measurement_date: kevinDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-kevin-rhodes-2",
    patient_id: "kevin-rhodes",
    measure_type: "PHQ-9",
    score: 17,
    max_score: 27,
    measurement_date: kevinDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-kevin-rhodes-3",
    patient_id: "kevin-rhodes",
    measure_type: "PHQ-9",
    score: 14,
    max_score: 27,
    measurement_date: kevinDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-kevin-rhodes-4",
    patient_id: "kevin-rhodes",
    measure_type: "PHQ-9",
    score: 12,
    max_score: 27,
    measurement_date: kevinDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // PRIYA SHARMA — GAD-7: 16 -> 13 -> 10 -> 8
  // ==========================================================================
  {
    id: "om-priya-sharma-1",
    patient_id: "priya-sharma",
    measure_type: "GAD-7",
    score: 16,
    max_score: 21,
    measurement_date: priyaDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-priya-sharma-2",
    patient_id: "priya-sharma",
    measure_type: "GAD-7",
    score: 13,
    max_score: 21,
    measurement_date: priyaDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-priya-sharma-3",
    patient_id: "priya-sharma",
    measure_type: "GAD-7",
    score: 10,
    max_score: 21,
    measurement_date: priyaDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-priya-sharma-4",
    patient_id: "priya-sharma",
    measure_type: "GAD-7",
    score: 8,
    max_score: 21,
    measurement_date: priyaDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // ROBERT FITZGERALD — PHQ-9: 12 -> 10 -> 8 -> 6
  // ==========================================================================
  {
    id: "om-robert-fitzgerald-1",
    patient_id: "robert-fitzgerald",
    measure_type: "PHQ-9",
    score: 12,
    max_score: 27,
    measurement_date: robertDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-robert-fitzgerald-2",
    patient_id: "robert-fitzgerald",
    measure_type: "PHQ-9",
    score: 10,
    max_score: 27,
    measurement_date: robertDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-robert-fitzgerald-3",
    patient_id: "robert-fitzgerald",
    measure_type: "PHQ-9",
    score: 8,
    max_score: 27,
    measurement_date: robertDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-robert-fitzgerald-4",
    patient_id: "robert-fitzgerald",
    measure_type: "PHQ-9",
    score: 6,
    max_score: 27,
    measurement_date: robertDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // JORDAN MITCHELL — PHQ-9: 10 -> 8 -> 7 -> 8 (stable/slight uptick)
  // ==========================================================================
  {
    id: "om-jordan-mitchell-phq-1",
    patient_id: "jordan-mitchell",
    measure_type: "PHQ-9",
    score: 10,
    max_score: 27,
    measurement_date: jordanDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-jordan-mitchell-phq-2",
    patient_id: "jordan-mitchell",
    measure_type: "PHQ-9",
    score: 8,
    max_score: 27,
    measurement_date: jordanDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-jordan-mitchell-phq-3",
    patient_id: "jordan-mitchell",
    measure_type: "PHQ-9",
    score: 7,
    max_score: 27,
    measurement_date: jordanDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-jordan-mitchell-phq-4",
    patient_id: "jordan-mitchell",
    measure_type: "PHQ-9",
    score: 8,
    max_score: 27,
    measurement_date: jordanDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // JORDAN MITCHELL — GAD-7: 8 -> 7 -> 8 -> 11 (worsening — work stress)
  // ==========================================================================
  {
    id: "om-jordan-mitchell-gad-1",
    patient_id: "jordan-mitchell",
    measure_type: "GAD-7",
    score: 8,
    max_score: 21,
    measurement_date: jordanDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-jordan-mitchell-gad-2",
    patient_id: "jordan-mitchell",
    measure_type: "GAD-7",
    score: 7,
    max_score: 21,
    measurement_date: jordanDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-jordan-mitchell-gad-3",
    patient_id: "jordan-mitchell",
    measure_type: "GAD-7",
    score: 8,
    max_score: 21,
    measurement_date: jordanDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-jordan-mitchell-gad-4",
    patient_id: "jordan-mitchell",
    measure_type: "GAD-7",
    score: 11,
    max_score: 21,
    measurement_date: jordanDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // AALIYAH BROOKS — GAD-7: 11 -> 9 -> 7 -> 5
  // ==========================================================================
  {
    id: "om-aaliyah-brooks-1",
    patient_id: "aaliyah-brooks",
    measure_type: "GAD-7",
    score: 11,
    max_score: 21,
    measurement_date: aaliyahDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-aaliyah-brooks-2",
    patient_id: "aaliyah-brooks",
    measure_type: "GAD-7",
    score: 9,
    max_score: 21,
    measurement_date: aaliyahDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-aaliyah-brooks-3",
    patient_id: "aaliyah-brooks",
    measure_type: "GAD-7",
    score: 7,
    max_score: 21,
    measurement_date: aaliyahDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-aaliyah-brooks-4",
    patient_id: "aaliyah-brooks",
    measure_type: "GAD-7",
    score: 5,
    max_score: 21,
    measurement_date: aaliyahDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // DANIEL PARK — GAD-7: 15 -> 12 -> 9 -> 7
  // ==========================================================================
  {
    id: "om-daniel-park-1",
    patient_id: "daniel-park",
    measure_type: "GAD-7",
    score: 15,
    max_score: 21,
    measurement_date: danielDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-daniel-park-2",
    patient_id: "daniel-park",
    measure_type: "GAD-7",
    score: 12,
    max_score: 21,
    measurement_date: danielDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-daniel-park-3",
    patient_id: "daniel-park",
    measure_type: "GAD-7",
    score: 9,
    max_score: 21,
    measurement_date: danielDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-daniel-park-4",
    patient_id: "daniel-park",
    measure_type: "GAD-7",
    score: 7,
    max_score: 21,
    measurement_date: danielDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // MARIA RODRIGUEZ — PCL-5: 55 -> 48 -> 42 -> 38
  // ==========================================================================
  {
    id: "om-maria-rodriguez-1",
    patient_id: "maria-rodriguez",
    measure_type: "PCL-5",
    score: 55,
    max_score: 80,
    measurement_date: mariaDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-maria-rodriguez-2",
    patient_id: "maria-rodriguez",
    measure_type: "PCL-5",
    score: 48,
    max_score: 80,
    measurement_date: mariaDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-maria-rodriguez-3",
    patient_id: "maria-rodriguez",
    measure_type: "PCL-5",
    score: 42,
    max_score: 80,
    measurement_date: mariaDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-maria-rodriguez-4",
    patient_id: "maria-rodriguez",
    measure_type: "PCL-5",
    score: 38,
    max_score: 80,
    measurement_date: mariaDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // BENJAMIN COLE — PHQ-9: 16 -> 14 -> 11 -> 9
  // ==========================================================================
  {
    id: "om-benjamin-cole-1",
    patient_id: "benjamin-cole",
    measure_type: "PHQ-9",
    score: 16,
    max_score: 27,
    measurement_date: benjaminDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-benjamin-cole-2",
    patient_id: "benjamin-cole",
    measure_type: "PHQ-9",
    score: 14,
    max_score: 27,
    measurement_date: benjaminDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-benjamin-cole-3",
    patient_id: "benjamin-cole",
    measure_type: "PHQ-9",
    score: 11,
    max_score: 27,
    measurement_date: benjaminDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-benjamin-cole-4",
    patient_id: "benjamin-cole",
    measure_type: "PHQ-9",
    score: 9,
    max_score: 27,
    measurement_date: benjaminDates[3]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // LIGHT HISTORY (2 data points each)
  // ==========================================================================

  // SARAH JOHNSON — GAD-7: 8 -> 6
  {
    id: "om-sarah-johnson-1",
    patient_id: "sarah-johnson",
    measure_type: "GAD-7",
    score: 8,
    max_score: 21,
    measurement_date: sarahDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-sarah-johnson-2",
    patient_id: "sarah-johnson",
    measure_type: "GAD-7",
    score: 6,
    max_score: 21,
    measurement_date: sarahDates[1]!,
    administered_by: ADMIN,
  },

  // MICHAEL CHEN — PHQ-9: 9 -> 7
  {
    id: "om-michael-chen-1",
    patient_id: "michael-chen",
    measure_type: "PHQ-9",
    score: 9,
    max_score: 27,
    measurement_date: michaelDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-michael-chen-2",
    patient_id: "michael-chen",
    measure_type: "PHQ-9",
    score: 7,
    max_score: 27,
    measurement_date: michaelDates[1]!,
    administered_by: ADMIN,
  },

  // JASMINE WILLIAMS — PHQ-9: 10 -> 7
  {
    id: "om-jasmine-williams-1",
    patient_id: "jasmine-williams",
    measure_type: "PHQ-9",
    score: 10,
    max_score: 27,
    measurement_date: jasmineDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-jasmine-williams-2",
    patient_id: "jasmine-williams",
    measure_type: "PHQ-9",
    score: 7,
    max_score: 27,
    measurement_date: jasmineDates[1]!,
    administered_by: ADMIN,
  },

  // OMAR HASSAN — PHQ-9: 14 -> 11
  {
    id: "om-omar-hassan-1",
    patient_id: "omar-hassan",
    measure_type: "PHQ-9",
    score: 14,
    max_score: 27,
    measurement_date: omarDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-omar-hassan-2",
    patient_id: "omar-hassan",
    measure_type: "PHQ-9",
    score: 11,
    max_score: 27,
    measurement_date: omarDates[1]!,
    administered_by: ADMIN,
  },

  // NATALIE KIM — GAD-7: 9 -> 6
  {
    id: "om-natalie-kim-1",
    patient_id: "natalie-kim",
    measure_type: "GAD-7",
    score: 9,
    max_score: 21,
    measurement_date: natalieDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-natalie-kim-2",
    patient_id: "natalie-kim",
    measure_type: "GAD-7",
    score: 6,
    max_score: 21,
    measurement_date: natalieDates[1]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // INACTIVE (1 final data point)
  // ==========================================================================

  // MARGARET WILLIAMS — PHQ-9: 3 (final)
  {
    id: "om-margaret-williams-1",
    patient_id: "margaret-williams",
    measure_type: "PHQ-9",
    score: 3,
    max_score: 27,
    measurement_date: margaretDates[0]!,
    administered_by: ADMIN,
  },

  // THOMAS REED — GAD-7: 2 (final)
  {
    id: "om-thomas-reed-1",
    patient_id: "thomas-reed",
    measure_type: "GAD-7",
    score: 2,
    max_score: 21,
    measurement_date: thomasDates[0]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // NO-SHOW: DEREK WASHINGTON — PHQ-9: 16 -> 14
  // ==========================================================================
  {
    id: "om-derek-washington-1",
    patient_id: "derek-washington",
    measure_type: "PHQ-9",
    score: 16,
    max_score: 27,
    measurement_date: derekDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-derek-washington-2",
    patient_id: "derek-washington",
    measure_type: "PHQ-9",
    score: 14,
    max_score: 27,
    measurement_date: derekDates[1]!,
    administered_by: ADMIN,
  },

  // ==========================================================================
  // RIVER CHEN — GAD-7: 10 -> 8 -> 6 -> 4
  // ==========================================================================
  {
    id: "om-river-chen-1",
    patient_id: "river-chen",
    measure_type: "GAD-7",
    score: 10,
    max_score: 21,
    measurement_date: riverDates[0]!,
    administered_by: ADMIN,
  },
  {
    id: "om-river-chen-2",
    patient_id: "river-chen",
    measure_type: "GAD-7",
    score: 8,
    max_score: 21,
    measurement_date: riverDates[1]!,
    administered_by: ADMIN,
  },
  {
    id: "om-river-chen-3",
    patient_id: "river-chen",
    measure_type: "GAD-7",
    score: 6,
    max_score: 21,
    measurement_date: riverDates[2]!,
    administered_by: ADMIN,
  },
  {
    id: "om-river-chen-4",
    patient_id: "river-chen",
    measure_type: "GAD-7",
    score: 4,
    max_score: 21,
    measurement_date: riverDates[3]!,
    administered_by: ADMIN,
  },
];

export default OUTCOME_MEASURES;
