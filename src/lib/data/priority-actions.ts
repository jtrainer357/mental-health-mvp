/**
 * Seed Priority Actions — AI-surfaced substrate recommendations
 * These are the "Prepare for Next Patient" action items.
 * 12-15 actions with urgency distribution: 2 urgent, 4 high, 5 medium, 4 low
 */

import type { SeedPriorityAction } from "./types";
import { today, toISO } from "./helpers";

const PRACTICE_ID = "550e8400-e29b-41d4-a716-446655440000";

export const PRIORITY_ACTIONS: SeedPriorityAction[] = [
  // ==========================================================================
  // URGENT (2)
  // ==========================================================================
  {
    id: "pa-carmen-alvarez-1",
    patient_id: "carmen-alvarez",
    practice_id: PRACTICE_ID,
    title: "Postpartum depression worsening — safety screening recommended",
    description:
      "Carmen Alvarez's PHQ-9 has declined only 4 points over 4 weeks (19 to 15), well below expected response trajectory. Patient expressed passive ideation ('she'd be better off without me') at last session. Sertraline dose increase may be insufficient.",
    urgency: "urgent",
    timeframe: "Today",
    confidence_score: 0.92,
    clinical_context:
      "PHQ-9 trajectory shows treatment-resistant pattern: 19 -> 17 -> 16 -> 15. Most patients on Sertraline show 50% improvement by week 4. Carmen's 21% improvement signals inadequate medication response. Combined with passive ideation about infant welfare, this requires immediate safety screening and medication strategy review.",
    suggested_actions: [
      "Administer Columbia Suicide Severity Rating Scale (C-SSRS) at start of session",
      "Discuss Sertraline increase to 100mg or augmentation with Bupropion",
      "Confirm husband is aware of severity and knows to contact office if patient expresses hopelessness",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-kevin-rhodes-1",
    patient_id: "kevin-rhodes",
    practice_id: PRACTICE_ID,
    title: "Substance relapse risk — monitor closely despite positive trend",
    description:
      "Kevin Rhodes has MDD + substance use history with 15 months sobriety. While PHQ-9 is improving (20 to 12), depression remains in moderate range. Historical pattern shows relapse risk increases when treatment engagement drops. He is building new social connections which is protective, but weekend isolation remains a vulnerability.",
    urgency: "urgent",
    timeframe: "Today",
    confidence_score: 0.88,
    clinical_context:
      "Dual-diagnosis patients with MDD + SUD have a 40-60% relapse rate during active depressive episodes. Kevin's PHQ-9 at 12 is improved but still moderate. His new hiking group and SMART Recovery attendance are protective factors, but Bupropion monotherapy at 300mg may need augmentation if depression plateaus. Weekend isolation historically triggers cravings.",
    suggested_actions: [
      "Assess current craving frequency and intensity",
      "Verify continued attendance at AA/SMART Recovery and hiking group",
      "Discuss Bupropion augmentation if PHQ-9 does not continue improving",
    ],
    status: "pending",
    created_at: toISO(today()),
  },

  // ==========================================================================
  // HIGH (4)
  // ==========================================================================
  {
    id: "pa-james-okafor-1",
    patient_id: "james-okafor",
    practice_id: PRACTICE_ID,
    title: "PCL-5 improvement trend — evaluate transition to maintenance",
    description:
      "James Okafor's PCL-5 dropped below clinical threshold (25) for the first time. Consistent downward trajectory: 42 -> 38 -> 31 -> 25. Nightmare frequency reduced from 4/week to 1/week. Patient is self-initiating exposure activities.",
    urgency: "high",
    timeframe: "This week",
    confidence_score: 0.85,
    clinical_context:
      "PCL-5 score of 25 is below the standard clinical threshold of 31-33, suggesting clinically significant improvement. The self-initiated restaurant back-to-door exposure and basketball game attendance indicate internalization of treatment principles. However, moving to maintenance too quickly risks regression. Recommend 2-3 more weekly sessions at current frequency before transitioning to biweekly.",
    suggested_actions: [
      "Review and rewrite trauma impact statement with updated beliefs",
      "Discuss potential Prazosin taper timeline if nightmares continue decreasing",
      "Schedule couples session with wife for psychoeducation and communication",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-lisa-whitfield-1",
    patient_id: "lisa-whitfield",
    practice_id: PRACTICE_ID,
    title: "Agoraphobia exposure hierarchy stalled — adjust protocol",
    description:
      "Lisa Whitfield's GAD-7 improvement is plateauing: 18 -> 16 -> 14 -> 13 (only 1-point drop in last week vs 2-point in prior weeks). While the grocery store visit was a landmark achievement, overall progress is slower than expected for this stage of treatment.",
    urgency: "high",
    timeframe: "This week",
    confidence_score: 0.82,
    clinical_context:
      "GAD-7 plateau at 13 after consistent 2-point weekly drops suggests the current exposure pace may be insufficient to maintain momentum. Escitalopram is at maximum dose (20mg). Consider augmentation strategies: Buspirone add-on, or more aggressive exposure scheduling (2x/week instead of weekly). Clonazepam PRN use is decreasing (1x/week), which is positive, but the agoraphobia hierarchy needs acceleration.",
    suggested_actions: [
      "Increase exposure frequency to 2 new situations per week instead of 1",
      "Discuss Buspirone augmentation to Escitalopram if plateau persists",
      "Set specific SUDS targets for grocery store (aim for below 50 within 2 weeks)",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-maria-rodriguez-1",
    patient_id: "maria-rodriguez",
    practice_id: PRACTICE_ID,
    title: "PTSD nightmares increasing — Prazosin dosage review",
    description:
      "Maria Rodriguez continues to experience nightmares 2-3 times per week despite Prazosin 4mg. While PCL-5 is trending down (55 -> 38), nightmare cluster symptoms remain elevated. Patient's daughter is being affected by nighttime screaming episodes.",
    urgency: "high",
    timeframe: "This week",
    confidence_score: 0.87,
    clinical_context:
      "Prazosin 4mg has reduced nightmares from 5/week to 2/week, but further optimization may be needed. Literature supports Prazosin doses up to 10-15mg for PTSD nightmares. However, the nightmare content is shifting (trapped to escaping), which is a positive trauma processing indicator. The family impact (daughter witnessing screaming) adds urgency. Consider Prazosin 5mg or add imagery rehearsal therapy.",
    suggested_actions: [
      "Discuss Prazosin increase to 5mg at bedtime with blood pressure monitoring",
      "Introduce imagery rehearsal therapy for nightmare content modification",
      "Provide age-appropriate explanation resources for daughter about parent's nightmares",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-marcus-washington-1",
    patient_id: "marcus-washington",
    practice_id: PRACTICE_ID,
    title: "Bipolar maintenance stable — consider extending session interval",
    description:
      "Marcus Washington's PHQ-9 trajectory shows consistent improvement: 11 -> 9 -> 7 -> 5, now in remission range. Sleep regulation adherence is high (7/7 nights). Wife is serving as effective early warning system for hypomania. Four consecutive weeks of stability.",
    urgency: "high",
    timeframe: "This week",
    confidence_score: 0.8,
    clinical_context:
      "PHQ-9 at 5 represents remission. However, spring is historically a high-risk period for Marcus's hypomanic episodes. The wife's portal message asking about spring mood changes indicates proactive monitoring. Recommend extending to biweekly sessions but with explicit spring monitoring protocol: sleep log, hypomania checklist, and standing instruction to call if sleep drops below 6 hours for 2 consecutive nights.",
    suggested_actions: [
      "Respond to wife's portal message about spring hypomania risk",
      "Transition to biweekly sessions with explicit spring monitoring protocol",
      "Provide written hypomania early warning checklist for patient and wife",
    ],
    status: "pending",
    created_at: toISO(today()),
  },

  // ==========================================================================
  // MEDIUM (5)
  // ==========================================================================
  {
    id: "pa-tyler-harrison-1",
    patient_id: "tyler-harrison",
    practice_id: PRACTICE_ID,
    title: "New patient intake — prepare initial evaluation materials",
    description:
      "Tyler Harrison is a new 22-year-old male presenting for initial evaluation today. No prior treatment history in our system. Intake paperwork indicates possible mood concerns.",
    urgency: "medium",
    timeframe: "Today",
    confidence_score: 0.75,
    clinical_context:
      "New patient intakes require comprehensive assessment. No prior notes, medications, or outcome measures on file. Standard initial evaluation protocol: biopsychosocial assessment, PHQ-9, GAD-7, substance screening, safety assessment, and treatment planning. Young adult male demographics have elevated risk for underreported substance use and suicidal ideation.",
    suggested_actions: [
      "Prepare PHQ-9, GAD-7, and AUDIT-C screening instruments",
      "Review intake paperwork for presenting concerns and referral source",
      "Plan 60-minute initial evaluation with comprehensive biopsychosocial assessment",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-priya-sharma-1",
    patient_id: "priya-sharma",
    practice_id: PRACTICE_ID,
    title: "OCD ritual time reduced 50% — advance exposure hierarchy",
    description:
      "Priya Sharma's contamination rituals reduced from 2 hours/day to 40-45 minutes. GAD-7 improved from 16 to 8. She is spontaneously generalizing ERP skills (handshaking at work). Ready to advance to higher-difficulty hierarchy items.",
    urgency: "medium",
    timeframe: "Next visit",
    confidence_score: 0.83,
    clinical_context:
      "50% ritual time reduction is clinically significant and indicates strong ERP engagement. Spontaneous generalization (work handshakes, public restrooms) suggests internalization. Next hierarchy steps should include shared food exposure and further reduction of checking rituals to under 30 minutes/day. Fluvoxamine 200mg is at therapeutic dose and supporting the behavioral work.",
    suggested_actions: [
      "Advance exposure hierarchy to shared food situations (potluck, restaurant appetizers)",
      "Set ritual time target of under 30 minutes/day",
      "Discuss long-term OCD management and relapse prevention framework",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-emma-kowalski-1",
    patient_id: "emma-kowalski",
    practice_id: PRACTICE_ID,
    title: "Bulimia — two consecutive purge-free weeks, begin relapse prevention",
    description:
      "Emma Kowalski achieved two consecutive purge-free weeks for the first time in treatment. PHQ-9 improved from 13 to 7. Body image distortion is shifting toward acceptance. Social eating is no longer triggering.",
    urgency: "medium",
    timeframe: "Next visit",
    confidence_score: 0.79,
    clinical_context:
      "Two consecutive purge-free weeks is a standard milestone for eating disorder recovery. The shift in body image from avoidance to neutrality is prognostically positive. Social eating no longer triggers purge urges, suggesting core fear has been addressed. However, eating disorders have high relapse rates. Formal relapse prevention planning should begin while gains are fresh.",
    suggested_actions: [
      "Begin formal relapse prevention planning: triggers, warning signs, coping strategies",
      "Recommend reviewing social media diet/fitness accounts and unfollowing triggers",
      "Discuss session frequency reduction timeline if stability maintains 4+ weeks",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-rachel-torres-1",
    patient_id: "rachel-torres",
    practice_id: PRACTICE_ID,
    title: "MDD in remission — begin relapse prevention and session spacing",
    description:
      "Rachel Torres's PHQ-9 at 5 represents remission. Four-week trajectory: 15 -> 12 -> 9 -> 5 (67% reduction). Sertraline 100mg effective. CBT skills are being applied independently including boundary-setting at work.",
    urgency: "medium",
    timeframe: "Next visit",
    confidence_score: 0.81,
    clinical_context:
      "67% PHQ-9 reduction over 4 weeks exceeds typical response curves. Independent application of therapeutic skills (work boundary-setting, cognitive restructuring) suggests readiness for reduced session frequency. Sertraline should be maintained for minimum 6 months post-remission to prevent relapse. Formal relapse prevention plan should be established before spacing sessions.",
    suggested_actions: [
      "Develop written relapse prevention plan: early warning signs, coping toolkit, emergency contacts",
      "Discuss Sertraline maintenance duration (6-12 months in remission before taper consideration)",
      "Propose transition to biweekly sessions starting in 2-3 weeks",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-derek-washington-1",
    patient_id: "derek-washington",
    practice_id: PRACTICE_ID,
    title: "No-show pattern emerging — re-engagement strategy needed",
    description:
      "Derek Washington missed his last scheduled appointment. Message exchange suggests difficulty with motivation ('Couldn't get out of bed'). PHQ-9 at 14 with minimal improvement from 16. Sertraline at 50mg may need dose increase.",
    urgency: "medium",
    timeframe: "Within 3 days",
    confidence_score: 0.76,
    clinical_context:
      "No-show patterns in young adult males with MDD predict treatment dropout within 4-6 weeks if not addressed. Derek's message content ('couldn't get out of bed') is consistent with severe amotivation. Sertraline 50mg at ~4 weeks should show more improvement than 2 points. Consider increasing to 100mg. Engagement strategy: shorter sessions, phone check-ins between sessions, or telehealth option.",
    suggested_actions: [
      "Call Derek to confirm next appointment and offer telehealth alternative",
      "Discuss Sertraline increase to 100mg if he attends next session",
      "Consider offering 30-minute sessions to reduce attendance barrier",
    ],
    status: "pending",
    created_at: toISO(today()),
  },

  // ==========================================================================
  // LOW (4)
  // ==========================================================================
  {
    id: "pa-sophia-chen-1",
    patient_id: "sophia-chen",
    practice_id: PRACTICE_ID,
    title: "GAD improving — prepare anxiety management toolkit card",
    description:
      "Sophia Chen's GAD-7 improved from 14 to 7 (50% reduction). Perfectionism is softening. Worry containment and behavioral experiments are being used independently. Ready for consolidation phase.",
    urgency: "low",
    timeframe: "This week",
    confidence_score: 0.78,
    clinical_context:
      "50% GAD-7 reduction with active skill deployment suggests transition readiness. The personalized anxiety management toolkit card serves as a tangible consolidation artifact and relapse prevention tool. Buspirone 15mg is effective and well-tolerated.",
    suggested_actions: [
      "Create personalized anxiety management toolkit card for patient to carry",
      "Review Buspirone duration and discuss timeline for potential taper",
      "Discuss session spacing to biweekly within 2-3 weeks",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-robert-fitzgerald-1",
    patient_id: "robert-fitzgerald",
    practice_id: PRACTICE_ID,
    title: "Grief integration progressing — anticipatory guidance for holidays",
    description:
      "Robert Fitzgerald's PHQ-9 improved from 12 to 6. Garden, widowers' group, church volunteering all established. Approaching treatment completion. Need anticipatory guidance for upcoming holidays and anniversary.",
    urgency: "low",
    timeframe: "This month",
    confidence_score: 0.77,
    clinical_context:
      "Patient is demonstrating healthy grief integration with dual-process oscillation between loss and restoration. Community re-engagement is robust. Treatment completion in 3-4 sessions is appropriate. However, first holidays and anniversary without wife will be challenging. Pre-planning coping strategies for these dates is standard grief therapy practice.",
    suggested_actions: [
      "Create holiday and anniversary coping plan together",
      "Discuss treatment completion timeline (3-4 more sessions)",
      "Ensure widowers' group and church garden commitments are sustainable long-term",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-aaliyah-brooks-1",
    patient_id: "aaliyah-brooks",
    practice_id: PRACTICE_ID,
    title: "Social anxiety responding well — encourage campus involvement",
    description:
      "Aaliyah Brooks's GAD-7 dropped from 11 to 5 with rapid response to exposure-based CBT. She is raising her hand in class, making friends through group project, and eating in the dining hall independently.",
    urgency: "low",
    timeframe: "Next visit",
    confidence_score: 0.8,
    clinical_context:
      "Rapid treatment response in a 19-year-old with social anxiety is typical when symptoms are relatively recent and the patient is in a social environment (college) that provides natural exposure opportunities. Campus club involvement would further consolidate gains and build lasting social infrastructure beyond the therapy relationship.",
    suggested_actions: [
      "Encourage joining one campus club or organization",
      "Begin relapse prevention planning for situations that might trigger avoidance",
      "Discuss transitioning to biweekly sessions",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-benjamin-cole-1",
    patient_id: "benjamin-cole",
    practice_id: PRACTICE_ID,
    title: "MDD improving with SCORE mentoring — monitor for overcommitment",
    description:
      "Benjamin Cole's PHQ-9 improved from 16 to 9 following retirement-related MDD episode. SCORE mentoring match has restored sense of purpose. Schedule is filling up with meaningful activities. Risk: potential overcommitment as antidote to emptiness.",
    urgency: "low",
    timeframe: "Next visit",
    confidence_score: 0.74,
    clinical_context:
      "The SCORE mentoring match directly addresses the identity loss that precipitated this depressive episode. However, patients recovering from retirement-related depression sometimes overcommit as they rediscover purpose, which can lead to burnout and relapse. Setting sustainable boundaries on mentoring hours and maintaining self-care alongside service activities will be important for long-term stability.",
    suggested_actions: [
      "Discuss sustainable mentoring boundaries (hours/week, emotional investment)",
      "Begin relapse prevention planning with early warning signs specific to his pattern",
      "Propose transition to biweekly sessions given positive trajectory",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  // ==========================================================================
  // JORDAN MITCHELL — GAD exacerbation, work stress, family conflict
  // ==========================================================================
  {
    id: "pa-jordan-mitchell-1",
    patient_id: "jordan-mitchell",
    practice_id: PRACTICE_ID,
    title: "GAD-7 spike to 11 — assess work stress escalation and sleep",
    description:
      "Jordan Mitchell's GAD-7 jumped from 8 to 11 (moderate range) over the past week. Work stress with new manager and unresolved family conflict are compounding. Sleep disrupted 2 nights. Missed running group — key protective factor lost.",
    urgency: "high",
    timeframe: "Today",
    confidence_score: 0.87,
    clinical_context:
      "GAD-7 increase from 8 to 11 represents a clinically meaningful worsening. Jordan has been stable on Sertraline 50mg for 2 years. The current spike is situational (work + family) rather than medication failure. However, if GAD-7 remains elevated at this visit, consider Sertraline dose increase to 75mg. Loss of exercise routine (running group) removes a well-established protective factor.",
    suggested_actions: [
      "Assess sleep quality and frequency of anxiety symptoms this week",
      "Review whether running group attendance has resumed",
      "Discuss Sertraline dose increase if GAD-7 remains ≥10",
      "Address family conflict resolution — phone call vs text with brother",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
  {
    id: "pa-jordan-mitchell-2",
    patient_id: "jordan-mitchell",
    practice_id: PRACTICE_ID,
    title: "Outstanding balance: $150 from prior session",
    description:
      "Jordan Mitchell has a $150 outstanding balance from a prior encounter. Payment type is cash. Balance has been outstanding for over a week.",
    urgency: "medium",
    timeframe: "Today",
    confidence_score: 0.95,
    clinical_context:
      "Cash-pay patient with typically prompt payments. Outstanding balance may be related to current work stress and financial concerns. Address sensitively — billing discussion should not overshadow clinical priorities given current GAD exacerbation.",
    suggested_actions: [
      "Mention outstanding balance at end of session, not beginning",
      "Offer payment plan if financial stress is contributing to anxiety",
    ],
    status: "pending",
    created_at: toISO(today()),
  },

  // ==========================================================================
  // DAVID NAKAMURA — Adjustment disorder, treatment plateau
  // ==========================================================================
  {
    id: "pa-david-nakamura-1",
    patient_id: "david-nakamura",
    practice_id: PRACTICE_ID,
    title: "GAD-7 at 4 — approaching treatment completion criteria",
    description:
      "David Nakamura's GAD-7 improved from 10 to 4 over 4 weeks. Adjustment disorder following job loss is resolving. New role starts next month. Consider treatment completion planning.",
    urgency: "low",
    timeframe: "This week",
    confidence_score: 0.82,
    clinical_context:
      "GAD-7 of 4 is in the minimal range. Adjustment disorder typically resolves within 6 months of stressor resolution. David's new job starting next month addresses the precipitating factor. Treatment completion planning with relapse prevention is appropriate.",
    suggested_actions: [
      "Discuss treatment completion timeline (2-3 more sessions)",
      "Create relapse prevention plan for job transition stress",
      "Establish check-in plan post-termination (1-month follow-up)",
    ],
    status: "pending",
    created_at: toISO(today()),
  },

  // ==========================================================================
  // OMAR HASSAN — MDD moderate, medication monitoring
  // ==========================================================================
  {
    id: "pa-omar-hassan-1",
    patient_id: "omar-hassan",
    practice_id: PRACTICE_ID,
    title: "PHQ-9 at 11 — Citalopram may need dose adjustment",
    description:
      "Omar Hassan's PHQ-9 dropped from 14 to 11 over 2 sessions. Improvement is real but slow. At 7 weeks on Citalopram 20mg, most patients show greater improvement. Consider dose increase.",
    urgency: "medium",
    timeframe: "This week",
    confidence_score: 0.79,
    clinical_context:
      "Expected PHQ-9 response at 7 weeks on Citalopram 20mg is typically 40-50% reduction. Omar's 21% reduction (14 to 11) suggests partial response. Dose increase to 30mg or augmentation should be discussed if improvement plateaus at next visit.",
    suggested_actions: [
      "Discuss Citalopram dose increase to 30mg if no further improvement",
      "Assess medication side effects and adherence",
      "Review sleep hygiene and activity levels",
    ],
    status: "pending",
    created_at: toISO(today()),
  },
];

export default PRIORITY_ACTIONS;
