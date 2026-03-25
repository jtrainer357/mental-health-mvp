/**
 * Synthetic Priority Actions (Substrate Intelligence)
 * AI-generated clinical decision support for demo patients
 */

import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

export interface SyntheticPriorityAction {
  id: string;
  patient_id: string;
  practice_id: string;
  title: string;
  urgency: "urgent" | "high" | "medium" | "low";
  timeframe: "Immediate" | "Today" | "Within 3 days" | "This week" | "This month" | "Next visit";
  confidence_score: number;
  clinical_context: string;
  suggested_actions: string[];
  status: "pending" | "completed" | "dismissed";
  created_at: string;
}

export const SYNTHETIC_PRIORITY_ACTIONS: SyntheticPriorityAction[] = [
  // ============================================================================
  // URGENT ACTIONS (Red)
  // ============================================================================

  // Carmen Alvarez - HIGH RISK - Intrusive thought monitoring
  {
    id: "pa-demo-carmen-001",
    patient_id: "carmen-alvarez-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Intrusive Thought Pattern Detected",
    urgency: "urgent",
    timeframe: "Immediate",
    confidence_score: 91,
    clinical_context:
      "Patient reported increased frequency of intrusive thoughts about infant safety at last visit (Feb 7). Edinburgh Postnatal Depression Scale score 10 warrants continued close monitoring. Message received Feb 8 indicates patient experiencing another hard day with intrusive thoughts. Patient used coping card appropriately but warrants safety check-in.",
    suggested_actions: [
      "Schedule safety check-in call",
      "Review safety plan",
      "Consult with psychiatrist re: medication adjustment",
      "Confirm Feb 14 appointment",
    ],
    status: "pending",
    created_at: "2026-02-08T14:30:00Z",
  },

  // Tyler Harrison - NEW PATIENT - Intake today
  {
    id: "pa-demo-tyler-001",
    patient_id: "tyler-harrison-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "New Patient Intake — Prepare Assessment",
    urgency: "urgent",
    timeframe: "Today",
    confidence_score: 95,
    clinical_context:
      "First appointment scheduled today at 4:30 PM. Self-referred for stress and relationship issues. Intake form mentions anger management concerns — screen for IPV risk factors and safety considerations. No prior mental health treatment history on file.",
    suggested_actions: [
      "Review intake paperwork",
      "Prepare PHQ-9 + GAD-7 + PCL-5 battery",
      "Screen for IPV risk factors",
      "Complete comprehensive diagnostic assessment",
      "Prepare safety planning materials",
    ],
    status: "pending",
    created_at: "2026-02-09T07:00:00Z",
  },

  // ============================================================================
  // HIGH PRIORITY ACTIONS (Orange)
  // ============================================================================

  // James Okafor - PTSD Treatment Success
  {
    id: "pa-demo-james-001",
    patient_id: "james-okafor-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Significant PTSD Symptom Improvement",
    urgency: "high",
    timeframe: "Today",
    confidence_score: 94,
    clinical_context:
      "PCL-5 decreased from 58 to 32 over 5 sessions (45% reduction). Patient has crossed below clinical threshold (31-33). Consider transitioning from weekly trauma processing to biweekly maintenance. Administer PCL-5 today to verify sustained improvement.",
    suggested_actions: [
      "Discuss treatment phase transition",
      "Administer PCL-5 today",
      "Update treatment plan goals",
      "Plan relapse prevention session",
    ],
    status: "pending",
    created_at: "2026-02-09T06:30:00Z",
  },

  // Marcus Washington - Bipolar Stability Review
  {
    id: "pa-demo-marcus-001",
    patient_id: "marcus-washington-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Bipolar Stability Check — 8 Month Review",
    urgency: "high",
    timeframe: "Today",
    confidence_score: 88,
    clinical_context:
      "No hypomanic episodes in 8 months. Mood stable. AA attendance consistent (2+ years sober). Lamotrigine therapeutic. Due for comprehensive stability review and discussion of long-term maintenance plan at today's 3:30 PM session.",
    suggested_actions: [
      "Complete mood stability assessment",
      "Review medication side effects",
      "Discuss relapse prevention plan update",
      "Celebrate 8-month stability milestone",
    ],
    status: "pending",
    created_at: "2026-02-09T06:30:00Z",
  },

  // Rachel Torres - Depression Remission
  {
    id: "pa-demo-rachel-001",
    patient_id: "rachel-torres-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Depression in Remission — Consider Step-Down",
    urgency: "high",
    timeframe: "Today",
    confidence_score: 92,
    clinical_context:
      "PHQ-9 score of 5 for two consecutive visits (Dec 7 and Jan 26). Patient reports sustained improvement in mood, energy, and social functioning. Career transition completed successfully. Ready to discuss reducing session frequency and medication taper readiness.",
    suggested_actions: [
      "Discuss reducing session frequency to monthly",
      "Evaluate medication taper readiness",
      "Create maintenance wellness plan",
      "Review early warning signs",
    ],
    status: "pending",
    created_at: "2026-02-09T06:30:00Z",
  },

  // Emma Kowalski - Medication Review Due
  {
    id: "pa-demo-emma-001",
    patient_id: "emma-kowalski-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Medication Review Due — Fluoxetine 60mg",
    urgency: "high",
    timeframe: "Within 3 days",
    confidence_score: 96,
    clinical_context:
      "Patient has been on Fluoxetine 60mg for 10 months. Per guidelines, 6-month medication review was due in September. Purging episodes reduced 80% (from 5x/week to 1x/month). Schedule psychiatry coordination for comprehensive med review.",
    suggested_actions: [
      "Coordinate with prescribing psychiatrist",
      "Review current symptom levels",
      "Discuss long-term medication plan",
      "Document medication reconciliation",
    ],
    status: "pending",
    created_at: "2026-02-08T10:00:00Z",
  },

  // ============================================================================
  // MEDIUM PRIORITY ACTIONS (Teal/Blue)
  // ============================================================================

  // Sophia Chen-Martinez - Academic Stress Peak
  {
    id: "pa-demo-sophia-001",
    patient_id: "sophia-chen-martinez-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Academic Stress Peak — Qualifying Exams Approaching",
    urgency: "medium",
    timeframe: "Today",
    confidence_score: 82,
    clinical_context:
      "Patient's qualifying exams are in March 2026 (approximately 4-6 weeks away). Historical pattern shows anxiety escalation 4-6 weeks before academic milestones. Proactive coping plan recommended at today's session.",
    suggested_actions: [
      "Develop exam-specific coping plan",
      "Increase session frequency temporarily",
      "Review Buspirone effectiveness",
      "Stress inoculation techniques",
    ],
    status: "pending",
    created_at: "2026-02-09T06:30:00Z",
  },

  // Robert Fitzgerald - Cognitive Screening Follow-Up
  {
    id: "pa-demo-robert-001",
    patient_id: "robert-fitzgerald-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Cognitive Screening Follow-Up Recommended",
    urgency: "medium",
    timeframe: "Next visit",
    confidence_score: 79,
    clinical_context:
      "Patient reported mild word-finding difficulties at last 2 sessions. Age 77, history of grief-related cognitive fog. Previous Mini-Cog improved from 4/5 to 5/5 as depression treated. MoCA or MMSE screening recommended to establish baseline and rule out neurocognitive disorder.",
    suggested_actions: [
      "Administer MoCA screening",
      "Discuss PCP referral for neurocognitive eval",
      "Document cognitive observations",
      "Continue monitoring with depression treatment",
    ],
    status: "pending",
    created_at: "2026-02-08T12:00:00Z",
  },

  // Aaliyah Brooks - Family Session Recommended
  {
    id: "pa-demo-aaliyah-001",
    patient_id: "aaliyah-brooks-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Family Session Recommended",
    urgency: "medium",
    timeframe: "This month",
    confidence_score: 76,
    clinical_context:
      "Patient has been exploring gender identity for 5 months. Reports wanting to come out to parents but anxious about their conservative/religious background. Therapeutic disclosure session could provide safe container when patient is ready.",
    suggested_actions: [
      "Explore readiness for family disclosure",
      "Prepare psychoeducation materials for parents",
      "Identify support resources (PFLAG)",
      "Safety plan for negative family reaction",
    ],
    status: "pending",
    created_at: "2026-02-08T11:00:00Z",
  },

  // David Nakamura - Couples Session Transition
  {
    id: "pa-demo-david-001",
    patient_id: "david-nakamura-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Couples Session Transition",
    urgency: "medium",
    timeframe: "Next visit",
    confidence_score: 85,
    clinical_context:
      "Patient reports wife interested in joining therapy. Relationship strain is primary presenting concern. Wife scheduled to join Feb 10 session. Consider transitioning to couples format or adding conjoint sessions to address marital dynamics directly.",
    suggested_actions: [
      "Schedule couples intake",
      "Review couples therapy modalities",
      "Send pre-session questionnaire to spouse",
      "Prepare for joint session facilitation",
    ],
    status: "pending",
    created_at: "2026-02-08T09:00:00Z",
  },

  // Carmen Alvarez - Additional medium priority for bonding
  {
    id: "pa-demo-carmen-002",
    patient_id: "carmen-alvarez-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Bonding Assessment — Track Progress",
    urgency: "medium",
    timeframe: "Next visit",
    confidence_score: 84,
    clinical_context:
      "Patient reported improved bonding with infant at last session ('She smiled at me yesterday and I cried happy tears'). Positive trajectory but postpartum depression still active. Continue monitoring bonding progress and reinforce attachment-promoting behaviors.",
    suggested_actions: [
      "Assess bonding quality at next visit",
      "Reinforce skin-to-skin time",
      "Continue CBT for intrusive thoughts",
      "Support partner involvement",
    ],
    status: "pending",
    created_at: "2026-02-08T14:00:00Z",
  },

  // Rachel Torres - Sleep Quality Check
  {
    id: "pa-demo-rachel-002",
    patient_id: "rachel-torres-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Assess Sleep Quality — Remission Maintenance",
    urgency: "medium",
    timeframe: "Today",
    confidence_score: 78,
    clinical_context:
      "Sleep disruption was early symptom in patient's depressive episode. Now in remission with good sleep (7-8 hours). Continued monitoring of sleep as early warning sign for relapse. Hydroxyzine use minimal (not used in 3 weeks per last note).",
    suggested_actions: [
      "Verify sleep quality maintained",
      "Review early warning signs",
      "Confirm Hydroxyzine PRN use pattern",
      "Relapse prevention plan review",
    ],
    status: "pending",
    created_at: "2026-02-09T06:30:00Z",
  },
  // ============================================================================
  // WEEK 1 TESTING ADDITIONS — Priority actions for 3 new patients
  // ============================================================================

  // Kevin Rhodes — Same-Day Cancellation Follow-Up
  {
    id: "pa-demo-kevin-001",
    patient_id: "kevin-rhodes-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Same-Day Cancellation — Reschedule Needed",
    urgency: "high",
    timeframe: "Today",
    confidence_score: 90,
    clinical_context:
      "Kevin Rhodes cancelled today's 2:30 PM appointment at 7:45 AM citing work emergency. This is his second cancellation pattern (previous no-show March 2025). Current stressors include workplace layoffs. Given MDD + AUD history, cancellation during high-stress period warrants prompt follow-up to maintain treatment continuity.",
    suggested_actions: [
      "Send rescheduling options via SMS",
      "Check in on current stress level",
      "Review safety plan for craving episodes",
      "Confirm AA attendance this week",
    ],
    status: "pending",
    created_at: "2026-02-09T08:00:00Z",
  },

  // Priya Sharma — Outstanding Balance
  {
    id: "pa-demo-priya-001",
    patient_id: "priya-sharma-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Outstanding Balance — $175 (Self-Pay)",
    urgency: "medium",
    timeframe: "Today",
    confidence_score: 95,
    clinical_context:
      "Priya Sharma has $175 outstanding across 2 invoices (Dec 10: $75, Jan 30: $100). Self-pay patient — no insurance to collect from. Patient has been making partial payments consistently. Today's 4:30 PM session is a good time to discuss payment plan options without disrupting therapeutic rapport.",
    suggested_actions: [
      "Discuss payment plan at end of session",
      "Offer sliding scale consideration",
      "Document financial hardship if applicable",
      "Send payment link after session",
    ],
    status: "pending",
    created_at: "2026-02-09T07:00:00Z",
  },

  // Lisa Whitfield — Exposure Therapy Progress
  {
    id: "pa-demo-lisa-001",
    patient_id: "lisa-whitfield-demo",
    practice_id: DEMO_PRACTICE_ID,
    title: "Exposure Hierarchy Advancement Ready",
    urgency: "low",
    timeframe: "Today",
    confidence_score: 80,
    clinical_context:
      "Lisa Whitfield has shown consistent progress on exposure hierarchy over 9 months. GAD-7 improved from 14 to 8. Last session discussed concert attendance success. Today may be appropriate to discuss high-level exposures (travel, airports) and transition planning.",
    suggested_actions: [
      "Review exposure homework completion",
      "Assess readiness for high-level hierarchy items",
      "Discuss maintenance session frequency",
      "Update treatment plan goals",
    ],
    status: "pending",
    created_at: "2026-02-09T07:00:00Z",
  },
];

export default SYNTHETIC_PRIORITY_ACTIONS;
