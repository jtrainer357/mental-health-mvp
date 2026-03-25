/**
 * Synthetic Session Notes (SOAP Format) for Demo Patients
 * Rich clinical narratives demonstrating Patient 360 Medical Records tab
 */

export interface SyntheticSessionNote {
  id: string;
  patient_id: string;
  appointment_id: string;
  date_of_service: string;
  note_type: "progress_note" | "initial_evaluation";
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  cpt_code: string;
  duration_minutes: number;
  signed_at: string;
  signed_by: string;
  status: "signed" | "draft";
}

export const SYNTHETIC_SESSION_NOTES: SyntheticSessionNote[] = [
  // ============================================================================
  // RACHEL TORRES - 6 NOTES (Depression -> Recovery)
  // PHQ-9: 18 -> 14 -> 10 -> 7 -> 5 -> 5
  // ============================================================================
  {
    id: "note-rachel-torres-1",
    patient_id: "rachel-torres-demo",
    appointment_id: "apt-demo-rachel-001",
    date_of_service: "2025-06-22",
    note_type: "initial_evaluation",
    subjective: `Patient presents for initial evaluation. "I can't keep doing this job. I wake up dreading every day and I've been calling in sick just to avoid my boss." Reports 3+ months of depressed mood, poor sleep (4-5 hours/night), decreased appetite with 8 lb weight loss, difficulty concentrating, and feelings of worthlessness. Denies suicidal ideation. Patient works in marketing at a toxic workplace with verbally abusive supervisor. Reports that anxiety about work is spilling over into her relationship with her partner. "I just feel stuck and hopeless."`,
    objective: `Appearance: Casually dressed, grooming adequate but somewhat unkempt. Affect: Constricted, tearful at times. Mood: "Exhausted and hopeless." Speech: Soft, slow rate. Thought process: Goal-directed but ruminative on work stressors. Thought content: Negative self-appraisal, no SI/HI. Insight: Good - recognizes need for help. Judgment: Intact. PHQ-9 administered: Score 18 (moderately severe depression). GAD-7: Score 12 (moderate anxiety).`,
    assessment: `F33.1 Major Depressive Disorder, recurrent, moderate - New diagnosis. Patient presents with classic neurovegetative symptoms in context of occupational burnout and toxic work environment. Depression appears reactive to environmental stressors but has persisted beyond adjustment period. Comorbid generalized anxiety. No safety concerns currently. Good candidate for combination pharmacotherapy and CBT with focus on behavioral activation and occupational decision-making.`,
    plan: `- Start Sertraline 50mg daily, increase to 100mg after 2 weeks if tolerated
- Psychoeducation on depression and medication expectations
- CBT: Begin behavioral activation - track activities and mood
- Sleep hygiene review
- Discuss occupational options (not to make decisions now, just explore)
- Return in 2 weeks for medication follow-up
- Safety plan discussed - patient to call if SI emerges
- Administer PHQ-9 at each visit`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-06-22T18:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-rachel-torres-2",
    patient_id: "rachel-torres-demo",
    appointment_id: "apt-demo-rachel-002",
    date_of_service: "2025-07-20",
    note_type: "progress_note",
    subjective: `"The medication made me feel a bit jittery the first week but that's better now. I'm sleeping a little better - maybe 5-6 hours." Patient reports Sertraline increased to 100mg as planned. Mood slightly improved but still struggling with motivation. Still at same job, had one good day when boss was out. Completed activity log homework - noticed she feels best when exercising or seeing friends, worst when alone ruminating after work.`,
    objective: `Appearance: Improved grooming from last visit. Affect: Less constricted, occasional smiles when discussing exercise. Mood: "A little less heavy." Speech: Normal rate and rhythm. Thought process: Goal-directed, less ruminative. No SI/HI. PHQ-9: Score 14 (moderate depression, improved from 18). GAD-7: Score 10.`,
    assessment: `Major Depressive Disorder, recurrent, moderate - Partial response to Sertraline 100mg at 4 weeks. PHQ-9 decreased 4 points indicating early treatment response. Behavioral activation showing utility - patient identifying mood-enhancing activities. Occupational stress remains significant but patient developing some psychological distance.`,
    plan: `- Continue Sertraline 100mg daily
- CBT: Expand behavioral activation schedule - aim for one mood-boosting activity daily
- Introduce cognitive restructuring - identify automatic negative thoughts
- Begin values clarification exercise re: career and life goals
- Discuss Hydroxyzine 25mg PRN for acute anxiety episodes
- Follow-up in 4 weeks
- PHQ-9 at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-07-20T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-rachel-torres-3",
    patient_id: "rachel-torres-demo",
    appointment_id: "apt-demo-rachel-003",
    date_of_service: "2025-09-14",
    note_type: "progress_note",
    subjective: `"I actually had a good week for once. I went to that networking event I was dreading and talked to three people. Didn't even need to leave early." Patient reports improved energy, sleeping 6-7 hours (up from 4-5). Mood is "cautiously optimistic." Reports thinking about updating resume but feeling guilty about leaving current team. Used Hydroxyzine twice for panic symptoms - found it helpful.`,
    objective: `Appearance: Neat and appropriate. Affect: Brighter with genuine smiles noted, marked change from flat affect at intake. Speech: Normal rate and rhythm. Thought process: Goal-directed. No SI/HI. PHQ-9: Score 10 (moderate, improved from 14). GAD-7: Score 8.`,
    assessment: `Major Depressive Disorder, recurrent, moderate - Continued improvement with combination Sertraline 100mg and CBT. PHQ-9 decreased 4 points since last visit. Behavioral activation producing real-world engagement (networking event is significant progress). Occupational dissatisfaction remains but patient developing agency around career decisions. Guilt about leaving colleagues is cognitive distortion to address.`,
    plan: `- Continue Sertraline 100mg daily
- Continue Hydroxyzine 25mg PRN (using appropriately)
- CBT homework: Values clarification exercise re: career goals
- Practice assertive communication with supervisor re: workload
- Explore 2-3 job listings as exposure exercise (not commitment)
- Follow-up in 6 weeks
- Administer PHQ-9 at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-09-14T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-rachel-torres-4",
    patient_id: "rachel-torres-demo",
    appointment_id: "apt-demo-rachel-004",
    date_of_service: "2025-10-26",
    note_type: "progress_note",
    subjective: `"I got a job offer! I'm terrified but excited. It's a 20% raise and the people I interviewed with seemed so... normal." Patient received offer from company she networked into. Currently deliberating. Reports mood is good most days, energy improved. Sleep stable at 6-7 hours. Describes anxiety about change as "healthy fear, not depression talking."`,
    objective: `Appearance: Well-groomed, dressed professionally (had interview earlier this week). Affect: Animated, bright. Mood: "Nervous but hopeful." Speech: Pressured at times with excitement. Thought process: Goal-directed, future-oriented. No SI/HI. PHQ-9: Score 7 (mild depression, approaching remission). GAD-7: Score 6.`,
    assessment: `Major Depressive Disorder, recurrent - In partial remission. Significant clinical improvement. PHQ-9 now in mild range (7). Patient demonstrating excellent progress - job offer represents culmination of behavioral activation work. Anxiety about change is adaptive. Good insight distinguishing healthy fear from depressive catastrophizing.`,
    plan: `- Continue Sertraline 100mg daily
- Discussed job decision-making framework (pros/cons, values alignment)
- Supportive therapy re: imposter syndrome (common with career change)
- Plan for transition stress management if accepts new role
- Continue PRN Hydroxyzine
- Follow-up in 6 weeks
- PHQ-9 at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-10-26T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-rachel-torres-5",
    patient_id: "rachel-torres-demo",
    appointment_id: "apt-demo-rachel-005",
    date_of_service: "2025-12-07",
    note_type: "progress_note",
    subjective: `"I'm three weeks into the new job and I actually look forward to going to work. My partner said I'm a different person." Patient accepted job offer, gave notice, and started new position. Reports new workplace is collaborative, manager is supportive. Mood consistently good. Sleep 7 hours. Energy "normal for the first time in years." Using Hydroxyzine only 1-2x/month now.`,
    objective: `Appearance: Well-dressed, excellent grooming. Affect: Full range, reactive, genuinely happy. Mood: "Really good." Speech: Normal. Thought process: Goal-directed, optimistic but realistic. No SI/HI. PHQ-9: Score 5 (minimal depression - remission range). GAD-7: Score 4.`,
    assessment: `Major Depressive Disorder, recurrent - In full remission. PHQ-9 score of 5 represents remission. Patient has achieved significant life change (new job) and maintained gains. Environmental change (leaving toxic workplace) combined with pharmacotherapy and CBT has been highly effective. This was clearly a reactive depression with strong environmental component.`,
    plan: `- Continue Sertraline 100mg daily (discuss maintenance duration at next visit)
- Reduced session frequency - transition to monthly maintenance
- Relapse prevention planning: identify early warning signs
- Continue Hydroxyzine PRN
- Follow-up in 6-8 weeks
- PHQ-9 at next visit
- Discuss long-term medication plan`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-12-07T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-rachel-torres-6",
    patient_id: "rachel-torres-demo",
    appointment_id: "apt-demo-rachel-006",
    date_of_service: "2026-01-26",
    note_type: "progress_note",
    subjective: `"Everything is still going well. I'm starting to believe this is my new normal, not just a good streak." Patient reports sustained improvement. New job going well - received positive performance feedback. Sleep 7-8 hours. Has not used Hydroxyzine in 3 weeks. Relationship with partner "better than ever." Asking about how long to stay on medication.`,
    objective: `Appearance: Excellent grooming. Affect: Bright, full range. Mood: "Genuinely happy." Speech: Normal. Thought process: Goal-directed, insightful. No SI/HI. PHQ-9: Score 5 (sustained remission). GAD-7: Score 4.`,
    assessment: `Major Depressive Disorder, recurrent - In sustained remission. PHQ-9 stable at 5 for two consecutive visits. Patient has maintained gains over 2+ months in new environment. This represents durable remission. Discussion of medication duration warranted - given recurrent MDD history, recommend minimum 6-12 months continuation phase before considering taper.`,
    plan: `- Continue Sertraline 100mg for at least 6 more months (continuation phase)
- Discussed medication taper considerations: timing, gradual approach, monitoring
- Wellness maintenance plan created: exercise, social connection, work-life boundaries
- Early warning signs review: sleep changes, withdrawal, negative thinking
- Session frequency: Reduce to every 6-8 weeks or as needed
- Consider step-down to monthly check-ins by spring
- Return in 6 weeks, PHQ-9 at each visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2026-01-26T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // JAMES OKAFOR - 5 NOTES (PTSD - Veteran, CPT Treatment)
  // PCL-5: 58 -> 52 -> 44 -> 38 -> 32
  // ============================================================================
  {
    id: "note-james-okafor-1",
    patient_id: "james-okafor-demo",
    appointment_id: "apt-demo-james-001",
    date_of_service: "2025-04-17",
    note_type: "initial_evaluation",
    subjective: `Veteran presents for evaluation of PTSD symptoms. "I've been having nightmares almost every night for the past 6 months. My wife said I've been different since I got back, but it's gotten worse lately." Two combat deployments to Afghanistan (2010-2011, 2013). Reports intrusive memories, hypervigilance ("I can't sit with my back to the door"), avoidance of crowds and loud noises, emotional numbing, sleep disturbance (2-3 hours/night due to nightmares), irritability. Denies active SI but acknowledges "sometimes I wonder if my family would be better off." Drinking 2-3 beers nightly "to fall asleep."`,
    objective: `Appearance: Dressed in casual clothing, well-groomed. Hypervigilant throughout session - scanning room, sitting facing door. Affect: Restricted, guardedness noted. Mood: "On edge." Speech: Brief responses initially, opened up as rapport built. Thought process: Coherent, occasionally tangential when triggered by memory. Thought content: Combat-related intrusions, passive death wish (no plan/intent). PCL-5: Score 58 (probable PTSD, severe). PHQ-9: Score 14.`,
    assessment: `F43.10 Post-Traumatic Stress Disorder - Combat-related, severe. Patient meets full criteria with re-experiencing, avoidance, negative cognitions/mood, and hyperarousal symptoms. Significant sleep disruption. Comorbid depressive symptoms. Alcohol use is self-medication for sleep. Passive death wish warrants monitoring but no imminent risk. Good candidate for evidence-based trauma treatment (CPT). Need to address sleep and alcohol concurrently.`,
    plan: `- Start Prazosin 1mg at bedtime for nightmares, titrate to 2mg
- Start Sertraline 50mg for PTSD/depression, will titrate
- Psychoeducation on PTSD and treatment options
- Introduce Cognitive Processing Therapy (CPT) - explain rationale
- Alcohol reduction discussion - not currently at dependence level
- Safety planning completed
- Return in 2 weeks
- Administer PCL-5 and PHQ-9 at each visit`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-04-17T18:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-james-okafor-2",
    patient_id: "james-okafor-demo",
    appointment_id: "apt-demo-james-002",
    date_of_service: "2025-06-12",
    note_type: "progress_note",
    subjective: `"The nightmares are a little better - maybe 3-4 nights a week instead of every night. That pill helps." Prazosin titrated to 2mg with good effect. Sertraline at 100mg. Reports sleeping 4-5 hours now. Cut back on alcohol to 1-2 beers, 3-4 nights/week. Started CPT homework - completed A-B-C worksheet on a triggering event. "Writing it down was harder than I expected."`,
    objective: `Appearance: Appropriate, eye contact improved. Affect: Less restricted than intake. Mood: "Getting by." Speech: More spontaneous. No SI/HI. PCL-5: Score 52 (improved 6 points). PHQ-9: Score 12.`,
    assessment: `PTSD - Showing initial response to pharmacotherapy. Nightmare frequency reduced with Prazosin. CPT initiated with good engagement despite emotional difficulty of trauma-focused work. Alcohol use improving with psychoeducation and sleep improvement. Depression stable.`,
    plan: `- Continue Prazosin 2mg at bedtime
- Increase Sertraline to 150mg
- CPT Session 2: Continue trauma psychoeducation
- Assign stuck point log
- Alcohol: Continue monitoring, reinforce harm reduction
- Follow-up in 6 weeks
- PCL-5 at each session`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-06-12T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-james-okafor-3",
    patient_id: "james-okafor-demo",
    appointment_id: "apt-demo-james-003",
    date_of_service: "2025-08-07",
    note_type: "progress_note",
    subjective: `"I wrote the impact statement. It took me three tries but I did it." Patient completed written trauma narrative for index trauma (IED attack that killed two squad members). Emotional processing evident. Reports nightmares now 1-2 nights/week. Sleeping 5-6 hours. Wife noted he seems "more present." Alcohol down to 1-2 drinks on weekends only.`,
    objective: `Appearance: Appropriate, more relaxed posture. Affect: Broader range, appropriate tearfulness when discussing trauma narrative. Mood: "Heavy but better." Speech: Normal. Good therapeutic alliance. No SI. PCL-5: Score 44 (continued improvement, 8-point decrease). PHQ-9: Score 10.`,
    assessment: `PTSD - Significant symptom reduction with CPT. PCL-5 decreased 14 points from baseline (58 to 44). Patient successfully completed trauma narrative - this is often the most difficult CPT session. Emotional processing of survivor guilt occurring. Alcohol use normalized. Sleep continuing to improve.`,
    plan: `- Continue Prazosin 2mg and Sertraline 150mg
- CPT Session 5: Process impact statement
- Challenge stuck points: "I should have done more" / "It's my fault they died"
- Cognitive restructuring worksheets
- Follow-up in 6 weeks
- PCL-5 at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-08-07T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-james-okafor-4",
    patient_id: "james-okafor-demo",
    appointment_id: "apt-demo-james-005",
    date_of_service: "2025-11-20",
    note_type: "progress_note",
    subjective: `"I went to my buddy's memorial service last week. First time I've been to one since I got back. It was hard but I didn't avoid it." Patient attended service for fallen comrade - significant exposure. Reports using coping skills learned in CPT. Nightmares rare now (1-2/month). Sleep 6-7 hours. "I can actually think about what happened without spiraling." Went to a crowded mall with wife - tolerated it for 45 minutes.`,
    objective: `Appearance: Well-groomed, relaxed posture. Affect: Full range, appropriate. Mood: "More like myself." Speech: Normal, conversational. Eye contact good. No SI/HI. PCL-5: Score 38 (continued improvement). PHQ-9: Score 8.`,
    assessment: `PTSD - Major treatment response to CPT. PCL-5 at 38 represents 20-point decrease from baseline and approaches non-clinical range (threshold is 31-33). Patient demonstrating real-world behavioral changes: attending memorial, tolerating crowds. Cognitive shifts evident in ability to process trauma memories without overwhelming distress. Depression in mild range.`,
    plan: `- Continue Prazosin 2mg and Sertraline 150mg
- CPT: Final sessions - consolidation and future planning
- Relapse prevention planning
- Discuss transition to maintenance phase
- Consider support group for veterans
- Follow-up in 8 weeks
- PCL-5 at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-11-20T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-james-okafor-5",
    patient_id: "james-okafor-demo",
    appointment_id: "apt-demo-james-006",
    date_of_service: "2026-01-26",
    note_type: "progress_note",
    subjective: `"I'm sleeping through most nights now. My wife said I haven't had a nightmare in two weeks." Patient reports sustained improvement. Attended veteran support group twice - found it helpful. Relationship with wife improved, intimacy returning. Back to exercise routine. "I still think about them, but it's different now. It's sad but not overwhelming."`,
    objective: `Appearance: Excellent grooming, confident posture. Affect: Full range, warm. Mood: "Good - really good." Speech: Normal. No hypervigilance behaviors noted in session. No SI/HI. PCL-5: Score 32 (below clinical threshold for PTSD). PHQ-9: Score 7.`,
    assessment: `PTSD - Below clinical threshold following completed course of CPT. PCL-5 at 32 represents 45% reduction from baseline and crosses below diagnostic cutoff. Patient has achieved treatment goals: nightmare reduction, decreased avoidance, improved relationships, cognitive processing of trauma. Depression also in remission range. This represents successful trauma-focused treatment outcome.`,
    plan: `- Continue Prazosin 2mg (may consider taper in 3-6 months)
- Continue Sertraline 150mg
- CPT complete - transition to maintenance
- Session frequency: Monthly or as needed
- Continue veteran support group
- Safety plan remains in place
- Return in 4 weeks for PCL-5 verification
- Discuss transition plan at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2026-01-26T18:15:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // SOPHIA CHEN-MARTINEZ - 5 NOTES (GAD - Graduate Student)
  // GAD-7: 16 -> 14 -> 12 -> 10 -> 8
  // ============================================================================
  {
    id: "note-sophia-chen-1",
    patient_id: "sophia-chen-martinez-demo",
    appointment_id: "apt-demo-sophia-001",
    date_of_service: "2025-09-08",
    note_type: "initial_evaluation",
    subjective: `"I can't stop worrying. About everything. My advisor probably hates my work, I'm going to fail my qualifying exams, I don't belong in this program." Third-year PhD student in biomedical engineering presenting with anxiety. Reports constant worry for past year, worsening since starting dissertation phase. Perfectionism since childhood - "B+ felt like failure." Physical symptoms: muscle tension, racing heart, difficulty sleeping due to racing thoughts. Reports imposter syndrome despite objective success (published papers, funded fellowship).`,
    objective: `Appearance: Neat, professional dress. Affect: Anxious, fidgeting with hands. Mood: "Stressed and exhausted." Speech: Rapid, pressured at times. Thought process: Goal-directed but tangential with worry. Thought content: Catastrophic thinking about academic performance, imposter syndrome. No SI/HI. GAD-7: Score 16 (severe anxiety). PHQ-9: Score 8 (mild depression, secondary to anxiety).`,
    assessment: `F41.1 Generalized Anxiety Disorder - Moderate to severe. Patient presents with classic GAD symptom picture: excessive worry, multiple domains, physical symptoms, difficulty controlling worry. Perfectionism and imposter syndrome are cognitive drivers. Anxiety is ego-dystonic (patient recognizes it's excessive). Good candidate for CBT with focus on cognitive restructuring and perfectionism. May benefit from pharmacotherapy for quicker symptom relief given academic demands.`,
    plan: `- Start Buspirone 5mg BID, titrate to 15mg BID
- CBT introduction: Psychoeducation on anxiety cycle
- Identify worry domains and create hierarchy
- Introduce concept of "good enough" vs. perfect
- Behavioral experiment: Submit work at 90% rather than 100%
- Follow-up in 2 weeks
- GAD-7 at each session`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-09-08T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-sophia-chen-2",
    patient_id: "sophia-chen-martinez-demo",
    appointment_id: "apt-demo-sophia-002",
    date_of_service: "2025-10-06",
    note_type: "progress_note",
    subjective: `"I submitted my literature review at 92% and the world didn't end. My advisor actually said it was good." Patient reports trying behavioral experiment. Advisor feedback was positive. Surprised by outcome. Buspirone at 15mg BID - tolerating well. Still has anticipatory anxiety but able to challenge it sometimes. "I know logically I'm doing fine but the feeling is still there."`,
    objective: `Appearance: Appropriate. Affect: Less anxious than intake. Mood: "Better but still worried." Speech: Normal rate. Thought process: Goal-directed, some insight into cognitive patterns. No SI/HI. GAD-7: Score 14 (improved 2 points).`,
    assessment: `GAD - Early response to treatment. Successful behavioral experiment challenging perfectionism. Cognitive-affective dissociation noted ("know logically but feel anxious") - common in early treatment, addressed through continued cognitive work.`,
    plan: `- Continue Buspirone 15mg BID
- CBT: Review behavioral experiment outcomes
- Cognitive restructuring: Evidence for/against perfectionist beliefs
- Worry postponement technique
- Follow-up in 4 weeks
- GAD-7 at next visit`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: "2025-10-06T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-sophia-chen-3",
    patient_id: "sophia-chen-martinez-demo",
    appointment_id: "apt-demo-sophia-003",
    date_of_service: "2025-11-03",
    note_type: "progress_note",
    subjective: `"I tried the worry postponement thing. I give myself 30 minutes after dinner to worry, and then I have to stop. It actually helps." Patient implementing techniques. Reports less rumination before bed. Received positive feedback on conference presentation. Still struggles with comparing self to peers. "Everyone else seems to have it together."`,
    objective: `Appearance: More relaxed than previous visits. Affect: Euthymic with anxious moments. Mood: "Managing." Speech: Normal. Good insight. No SI/HI. GAD-7: Score 12 (moderate range, continued improvement).`,
    assessment: `GAD - Continued improvement with CBT. Worry postponement effective. Patient developing self-efficacy in managing symptoms. Social comparison remains a cognitive distortion to address.`,
    plan: `- Continue Buspirone 15mg BID
- CBT: Challenge social comparison thinking
- Values clarification: Define personal success (not relative to others)
- Continue worry postponement
- Progressive muscle relaxation for physical symptoms
- Follow-up in 4 weeks`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: "2025-11-03T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-sophia-chen-4",
    patient_id: "sophia-chen-martinez-demo",
    appointment_id: "apt-demo-sophia-004",
    date_of_service: "2025-12-01",
    note_type: "progress_note",
    subjective: `"I talked to two other students in my cohort - they're struggling too. One is seeing a therapist. I felt less alone." Patient challenged assumption that "everyone else has it together." Normalized experience in graduate school. Semester ending - managing end-of-term stress. Planning to take a week off for holiday. "I've never given myself permission to actually rest."`,
    objective: `Appearance: Relaxed, smiling. Affect: Bright. Mood: "Better." Speech: Normal. Thought process: Goal-directed, less catastrophic. No SI/HI. GAD-7: Score 10 (moderate, at threshold for mild).`,
    assessment: `GAD - Nearing treatment response threshold. Significant cognitive shift with social comparison and imposter syndrome. Patient developing healthier relationship with achievement. GAD-7 now at moderate-mild boundary.`,
    plan: `- Continue Buspirone 15mg BID
- Holiday plan: Permission to rest without "productive" activities
- CBT: Relapse prevention planning for next semester
- Prepare for qualifying exams stress (March 2026)
- Follow-up in 6 weeks (January)
- GAD-7 at next visit`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: "2025-12-01T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-sophia-chen-5",
    patient_id: "sophia-chen-martinez-demo",
    appointment_id: "apt-demo-sophia-005",
    date_of_service: "2026-01-12",
    note_type: "progress_note",
    subjective: `"I actually took the week off. Read for fun, went home to see my parents, didn't check email. It was hard at first but I felt so much better after." Patient reports holiday break was restorative. Returned to school feeling recharged. Qualifying exams scheduled for March - preparing but managing anxiety. "I'm nervous but I'm not catastrophizing like before."`,
    objective: `Appearance: Well-rested, bright. Affect: Full range. Mood: "Good, a little nervous about quals but okay." Speech: Normal. No SI/HI. GAD-7: Score 8 (mild anxiety).`,
    assessment: `GAD - Treatment response achieved. GAD-7 now in mild range representing 50% reduction from baseline. Patient demonstrating sustained use of coping skills. Qualifying exams are upcoming stressor - proactive planning indicated.`,
    plan: `- Continue Buspirone 15mg BID
- Develop quals-specific coping plan
- Consider temporary increase in session frequency around March
- Maintain sleep, exercise, social connection
- Follow-up in 4 weeks
- GAD-7 at next visit`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: "2026-01-12T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // MARCUS WASHINGTON - 6 NOTES (Bipolar II Maintenance)
  // PHQ-9: 8 -> 6 -> 5 -> 4 -> 5 -> 4
  // ============================================================================
  {
    id: "note-marcus-washington-1",
    patient_id: "marcus-washington-demo",
    appointment_id: "apt-demo-marcus-001",
    date_of_service: "2024-12-02",
    note_type: "initial_evaluation",
    subjective: `"I've been stable for about 6 months now but I need someone to help me stay that way." Patient transferring care for maintenance treatment of Bipolar II. Diagnosed in 2018 after hospitalization for severe depression with mixed features. History of hypomanic episodes (increased energy, decreased sleep need, impulsive spending). Also in recovery from Alcohol Use Disorder - sober 18 months via AA. Currently on Lamotrigine 200mg and Quetiapine 50mg. Last hypomanic episode was February 2025. Stable mood for 6 months.`,
    objective: `Appearance: Neat, appropriate. Affect: Euthymic, stable. Mood: "Even-keeled." Speech: Normal rate, no pressure. Thought process: Goal-directed, organized. No SI/HI, no grandiosity or racing thoughts. PHQ-9: Score 8 (mild residual depression, at his baseline). MDQ: Positive for Bipolar II (historical, currently stable).`,
    assessment: `F31.81 Bipolar II Disorder - Currently stable on maintenance medications. F10.20 Alcohol Use Disorder, in sustained remission - 18 months sober, active in AA. Patient has good insight into illness, recognizes warning signs, engaged in recovery. Lamotrigine for mood stabilization and depression prevention, low-dose Quetiapine for sleep and mood augmentation. Treatment goal is relapse prevention.`,
    plan: `- Continue Lamotrigine 200mg daily
- Continue Quetiapine 50mg at bedtime
- Establish treatment alliance and regular monitoring
- Mood charting review
- Sleep hygiene (critical for bipolar stability)
- Sobriety support - continue AA
- Follow-up monthly initially
- PHQ-9 at each visit, watch for hypomania signs`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2024-12-02T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-marcus-washington-2",
    patient_id: "marcus-washington-demo",
    appointment_id: "apt-demo-marcus-002",
    date_of_service: "2025-01-06",
    note_type: "progress_note",
    subjective: `"Holidays were hard - lots of family drinking around me. But I made it through." Patient navigated holiday stressors without relapse. Attended extra AA meetings. Mood stable. Sleep 7 hours/night. No irritability or increased energy. "I had one day where I wanted to drink really badly but I called my sponsor instead."`,
    objective: `Appearance: Appropriate. Affect: Euthymic. Mood: "Steady." Speech: Normal. Thought process: Goal-directed. No SI/HI, no hypomania signs. PHQ-9: Score 6.`,
    assessment: `Bipolar II - Stable. AUD - In sustained remission despite high-risk period. Excellent coping with holiday stressors. Good use of support system.`,
    plan: `- Continue current medications
- Reinforce coping strategies used during holidays
- Discuss early warning signs for hypomanic relapse
- Continue AA involvement
- Follow-up in 4 weeks
- PHQ-9 at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-01-06T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-marcus-washington-3",
    patient_id: "marcus-washington-demo",
    appointment_id: "apt-demo-marcus-003",
    date_of_service: "2025-02-03",
    note_type: "progress_note",
    subjective: `"Two years sober next week. I never thought I'd make it this far." Patient reports significant milestone approaching. Mood stable. Reflects on how sobriety has improved his bipolar management. "When I was drinking, I couldn't tell if I was hypomanic or drunk. Now I can read myself better."`,
    objective: `Appearance: Bright, proud. Affect: Euthymic, appropriate pride. Mood: "Grateful." Speech: Normal. No SI/HI, no mood episode signs. PHQ-9: Score 5.`,
    assessment: `Bipolar II - Stable. AUD - Approaching 2 years sobriety, major milestone. Excellent insight into relationship between alcohol and mood stability. This is a significant achievement warranting positive reinforcement.`,
    plan: `- Continue current medications
- Congratulate on 2-year sobriety milestone
- Review long-term maintenance plan
- Discuss any needed adjustments to medication
- Continue AA
- Follow-up in 4 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-02-03T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-marcus-washington-4",
    patient_id: "marcus-washington-demo",
    appointment_id: "apt-demo-marcus-004",
    date_of_service: "2025-03-03",
    note_type: "progress_note",
    subjective: `"My son is getting married in June. I'm excited but also nervous - I want to be present for it." Patient reports positive family news. Concerned about wedding stress and temptation (open bar). Mood stable. Good relationship with son has been rebuilt in sobriety. "He asked me to give a speech. First time he's trusted me with something like that."`,
    objective: `Appearance: Appropriate, engaged. Affect: Bright with some anxiety. Mood: "Happy but nervous." Speech: Normal. No mood episode signs. PHQ-9: Score 4.`,
    assessment: `Bipolar II - Stable. AUD - In sustained remission. Proactive concern about wedding stressors is healthy. Rebuilding family relationships is common in recovery and very positive.`,
    plan: `- Continue current medications
- Wedding planning: Develop coping plan for open bar situation
- Speech preparation: Discuss healthy ways to manage performance anxiety
- Ensure sponsor contact for wedding day
- Follow-up in 8 weeks
- PHQ-9 at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-03-03T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-marcus-washington-5",
    patient_id: "marcus-washington-demo",
    appointment_id: "apt-demo-marcus-005",
    date_of_service: "2025-07-07",
    note_type: "progress_note",
    subjective: `"The wedding was amazing. I gave the speech, didn't drink, and danced with my son's new wife. Best day I've had in years." Patient reports successful navigation of wedding. Used all planned coping strategies. Had sponsor on speed dial but didn't need to call. Mood remains stable, no post-event crash. "I was worried I'd get sad after but I just feel grateful."`,
    objective: `Appearance: Excellent, relaxed. Affect: Bright, full range. Mood: "Really good - happy." Speech: Normal. No hypomania signs (appropriate happiness, not elevated mood). PHQ-9: Score 5.`,
    assessment: `Bipolar II - Stable through significant life event. AUD - Maintained sobriety during high-risk exposure. Excellent evidence of recovery. Appropriate positive mood response to positive event (important to distinguish from hypomanic elevation).`,
    plan: `- Continue current medications
- Reinforce coping successes
- Continue AA
- Transition to every 8-week visits given stability
- Follow-up in 8 weeks
- PHQ-9 at next visit`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-07-07T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-marcus-washington-6",
    patient_id: "marcus-washington-demo",
    appointment_id: "apt-demo-marcus-008",
    date_of_service: "2026-01-12",
    note_type: "progress_note",
    subjective: `"Eight months stable, over two years sober. This is the longest I've gone without a mood episode since I was diagnosed." Patient reports continued stability. Work going well, relationship with wife improved. Attending AA meetings 2x/week now (down from 4x). "I feel like I'm finally living my life instead of managing my illness."`,
    objective: `Appearance: Excellent. Affect: Euthymic, stable. Mood: "Good - steady." Speech: Normal. No mood episode signs. PHQ-9: Score 4.`,
    assessment: `Bipolar II - In sustained remission, 8+ months without episode. AUD - In sustained remission, 2+ years sober. This represents excellent treatment response and prognosis. Continue maintenance indefinitely given recurrent illness history.`,
    plan: `- Continue Lamotrigine 200mg and Quetiapine 50mg - no changes indicated
- Discuss long-term medication maintenance expectations
- Continue AA at current frequency
- 8-month stability review: No medication changes needed
- Follow-up in 8 weeks
- PHQ-9 monitoring continues`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2026-01-12T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // EMMA KOWALSKI - 4 NOTES (Bulimia Recovery)
  // PHQ-9: 12 -> 10 -> 8 -> 6
  // ============================================================================
  {
    id: "note-emma-kowalski-1",
    patient_id: "emma-kowalski-demo",
    appointment_id: "apt-demo-emma-001",
    date_of_service: "2025-04-01",
    note_type: "initial_evaluation",
    subjective: `"I've been making myself throw up after meals for about 3 years. I want to stop but I don't know how." 23-year-old college senior presenting for bulimia treatment. Reports binge-purge episodes 5x/week currently. History of restriction that evolved into bulimia at age 20. Triggers: stress, feeling "out of control," eating "bad" foods. Reports shame after purging. Denies laxative use. Currently at healthy BMI (21). Previous treatment: outpatient nutritionist 2 years ago, stopped after 3 sessions.`,
    objective: `Appearance: Thin but healthy weight. Affect: Anxious, ashamed. Mood: "Embarrassed to be here." Speech: Soft, hesitant. Thought content: Significant body image distortion, food rules, fear of weight gain. No SI. PHQ-9: Score 12 (moderate depression). EDE-Q administered: Global score 4.2 (clinical range).`,
    assessment: `F50.02 Bulimia Nervosa, moderate - Binge-purge subtype, 5x/week frequency. Secondary depressive symptoms common with eating disorders. No current medical complications but need baseline labs (electrolytes). Good candidate for CBT-E (enhanced CBT for eating disorders) plus medication. Fluoxetine is first-line for bulimia.`,
    plan: `- Start Fluoxetine 20mg, titrate to 60mg (therapeutic dose for bulimia)
- Order BMP to check electrolytes
- Psychoeducation on bulimia cycle
- Food log - non-judgmental tracking of eating and emotions
- Identify triggers and patterns
- Coordinate with nutritionist
- Weekly sessions initially
- Follow-up in 1 week
- PHQ-9 and behavior tracking at each session`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-04-01T18:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-emma-kowalski-2",
    patient_id: "emma-kowalski-demo",
    appointment_id: "apt-demo-emma-002",
    date_of_service: "2025-06-15",
    note_type: "progress_note",
    subjective: `"I've gotten down to about 2 episodes a week. It's not zero but it's better." Fluoxetine at 60mg for 6 weeks. Reports urges remain but sometimes can ride them out. Has been using distraction techniques (calling friend, going for walk). Food log showing progress. "I ate a slice of pizza last week without purging. That hasn't happened in years."`,
    objective: `Appearance: Healthy. Affect: Brighter, less shame. Mood: "Hopeful." Speech: Normal. Labs: Electrolytes normal. Purge frequency: 2x/week (down from 5x). PHQ-9: Score 10.`,
    assessment: `Bulimia Nervosa - Significant behavioral improvement (60% reduction in purging). Depression improving. Pizza episode represents meaningful exposure to "fear food" without compensatory behavior.`,
    plan: `- Continue Fluoxetine 60mg
- CBT-E: Continue regular eating pattern
- Exposure work: Continue introducing fear foods
- Address cognitive distortions about "good" vs. "bad" food
- Body image work: Introduce mirror exposure
- Follow-up in 6 weeks
- Continue behavior and PHQ-9 tracking`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-06-15T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-emma-kowalski-3",
    patient_id: "emma-kowalski-demo",
    appointment_id: "apt-demo-emma-003",
    date_of_service: "2025-09-22",
    note_type: "progress_note",
    subjective: `"I started my new job and I've been eating lunch with coworkers. I never thought I could do that." Patient graduated and started working. Social eating was major fear. Reports only 3 purge episodes in the past month (down from 2x/week). "I still have thoughts about it but they're more like background noise now."`,
    objective: `Appearance: Healthy, well-groomed. Affect: Bright, engaged. Mood: "Proud of myself." Speech: Normal. Purge frequency: 3x/month. PHQ-9: Score 8.`,
    assessment: `Bulimia Nervosa - In partial remission. Major milestone: Social eating without compensatory behaviors. Depression continuing to improve. Transition to new job handled well.`,
    plan: `- Continue Fluoxetine 60mg
- CBT-E: Relapse prevention focus
- Discuss long-term maintenance
- Coordinate with nutritionist for intuitive eating transition
- Extend session frequency to every 6-8 weeks
- Continue monitoring`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-09-22T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-emma-kowalski-4",
    patient_id: "emma-kowalski-demo",
    appointment_id: "apt-demo-emma-004",
    date_of_service: "2026-01-29",
    note_type: "progress_note",
    subjective: `"I had one slip-up over the holidays but I didn't spiral. I just got back on track the next day." Patient reports one purge episode in December (holiday stress). Recognized it as slip, not relapse, and used coping skills. Currently 6 weeks without episode. "I'm starting to trust my body more. I don't weigh myself every day anymore."`,
    objective: `Appearance: Healthy. Affect: Stable, good self-esteem visible. Mood: "Good." Speech: Normal. Purge frequency: 1 episode in past 3 months. PHQ-9: Score 6.`,
    assessment: `Bulimia Nervosa - In partial remission, approaching full remission. Slip vs. relapse distinction demonstrates good recovery skills. Depression in mild range. Fluoxetine due for medication review per guidelines (on 60mg for 10 months).`,
    plan: `- Continue Fluoxetine 60mg (schedule psychiatry coordination for med review)
- Discuss maintenance phase of treatment
- Intuitive eating: Continue developing body trust
- Body image: Progress noted, continue work
- Follow-up in 6-8 weeks
- Note: 6-month medication review due - coordinate with prescriber`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2026-01-29T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // Additional notes for remaining patients...
  // DAVID NAKAMURA - 4 notes
  // ============================================================================
  {
    id: "note-david-nakamura-1",
    patient_id: "david-nakamura-demo",
    appointment_id: "apt-demo-david-001",
    date_of_service: "2025-10-08",
    note_type: "initial_evaluation",
    subjective: `"My wife says I'm never present even when I'm home. She's right. I check Slack at dinner, I think about work when we're talking." Tech startup founder presenting with stress-related symptoms. Company at critical growth phase. Working 70+ hours/week. Reports anxiety, irritability, sleep disruption, marital strain. Denies depression. "I love my work but it's eating my marriage."`,
    objective: `Appearance: Professional but fatigued. Affect: Anxious, restless. Mood: "Stressed." Speech: Rapid. Thought process: Work-focused, difficulty staying on personal topics. No SI/HI. GAD-7: Score 14 (moderate anxiety). PHQ-9: Score 7.`,
    assessment: `F43.20 Adjustment Disorder with mixed anxiety and depressed mood. Work-life imbalance as primary stressor. Relationship strain secondary to work demands. No pharmacotherapy indicated at this time - patient prefers therapy-only approach.`,
    plan: `- No medication (patient preference, appropriate given presentation)
- Establish boundaries around work (no email after 7pm)
- Couples dynamics discussion - may invite wife to future session
- Values clarification: What matters beyond work success?
- Follow-up in 2 weeks`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-10-08T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-david-nakamura-2",
    patient_id: "david-nakamura-demo",
    appointment_id: "apt-demo-david-002",
    date_of_service: "2025-11-05",
    note_type: "progress_note",
    subjective: `"I tried the no-email-after-7pm thing. Made it 4 days. My wife noticed and she actually smiled at me." Patient reports partial success with boundary-setting. Identified that urgency is often self-created. Still working long hours but more aware of choices.`,
    objective: `Appearance: Better rested. Affect: More present. Mood: "Still stressed but trying." GAD-7: Score 12.`,
    assessment: `Adjustment Disorder - Early improvement with boundary interventions. Relationship showing response to behavioral changes.`,
    plan: `- Expand boundaries: One day/weekend truly off
- Assertive communication with co-founder about responsibilities
- Continue weekly sessions
- Follow-up in 4 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-11-05T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-david-nakamura-3",
    patient_id: "david-nakamura-demo",
    appointment_id: "apt-demo-david-003",
    date_of_service: "2025-12-03",
    note_type: "progress_note",
    subjective: `"My wife wants to come to a session. She's been more supportive since I've been making changes, but she has things she wants to say." Patient reports continued improvement. Taking Saturday mornings off consistently now. Wife expressing interest in joint session.`,
    objective: `Appearance: More relaxed. Affect: Engaged. Mood: "Better." GAD-7: Score 10.`,
    assessment: `Adjustment Disorder - Continued improvement. Relationship repair progressing. Couples session appropriate and requested.`,
    plan: `- Schedule couples session for January
- Continue individual work on stress management
- Holiday plan: Protect family time
- Follow-up in 4 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-12-03T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-david-nakamura-4",
    patient_id: "david-nakamura-demo",
    appointment_id: "apt-demo-david-004",
    date_of_service: "2026-01-28",
    note_type: "progress_note",
    subjective: `"We had a real vacation for the first time in two years. Just three days but we didn't talk about work at all." Patient reports successful holiday boundaries. Relationship improved. Still working hard but with more awareness. Wife scheduled to join next session.`,
    objective: `Appearance: Rested. Affect: Bright. Mood: "Good." GAD-7: Score 9.`,
    assessment: `Adjustment Disorder - Significant improvement. Ready for couples work to consolidate gains and address relationship dynamics directly.`,
    plan: `- Couples session next visit (Feb 10)
- Send pre-session questionnaire to wife
- Continue individual boundary work
- Follow-up in 2 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2026-01-28T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // AALIYAH BROOKS - 4 notes (one was cancelled)
  // ============================================================================
  {
    id: "note-aaliyah-brooks-1",
    patient_id: "aaliyah-brooks-demo",
    appointment_id: "apt-demo-aaliyah-001",
    date_of_service: "2025-08-20",
    note_type: "initial_evaluation",
    subjective: `"I feel like I can't be myself around anyone. Even my friends don't really know me." 21-year-old college junior presenting with social anxiety and identity exploration. Reports intense fear of judgment, avoidance of speaking in class, difficulty making eye contact. Also exploring gender identity - assigned female at birth but questioning. "I've never told anyone this but I don't feel like a girl exactly."`,
    objective: `Appearance: Androgynous presentation. Affect: Anxious, guarded initially, opened up when discussing identity. Mood: "Confused and scared." Speech: Soft, hesitant. Good rapport by end of session. No SI/HI. GAD-7: Score 18 (severe anxiety). PHQ-9: Score 9.`,
    assessment: `F40.10 Social Anxiety Disorder - Severe. F64.0 Gender Dysphoria - Exploring. Social anxiety appears primary and predates identity exploration. Identity questioning is developmentally appropriate and ego-syntonic when discussed. Safe space needed to explore both issues.`,
    plan: `- Start Escitalopram 5mg, titrate to 10mg
- Social anxiety: Exposure hierarchy development
- Identity exploration: Provide affirming space, resources
- Discuss what "being authentic" would look like
- Follow-up in 2 weeks`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-08-20T18:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-aaliyah-brooks-2",
    patient_id: "aaliyah-brooks-demo",
    appointment_id: "apt-demo-aaliyah-002",
    date_of_service: "2025-09-17",
    note_type: "progress_note",
    subjective: `"I answered a question in class last week. My heart was pounding but I did it." Escitalopram at 10mg. Reports lower baseline anxiety. First successful class participation in two years. Also came out as non-binary to two close friends. "They were really cool about it. Used they/them pronouns without making it weird."`,
    objective: `Appearance: Slight style change (shorter hair). Affect: Brighter. Mood: "More hopeful." Speech: More confident. GAD-7: Score 15.`,
    assessment: `Social Anxiety - Early response to medication and exposure. Identity exploration - Positive disclosure experience with friends. Medication helping reduce baseline anxiety enough to attempt exposures.`,
    plan: `- Continue Escitalopram 10mg
- Exposure hierarchy: Build on class participation success
- Identity: Process coming out experience
- Discuss timeline/readiness for broader disclosure
- Follow-up in 4 weeks`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: "2025-09-17T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-aaliyah-brooks-3",
    patient_id: "aaliyah-brooks-demo",
    appointment_id: "apt-demo-aaliyah-003",
    date_of_service: "2025-10-15",
    note_type: "progress_note",
    subjective: `"I'm thinking about telling my parents but I'm terrified. What if they reject me?" Patient progressing with social anxiety exposures. Identity clarity increasing - identifies as non-binary, uses they/them with friends. Parents are conservative, religious - significant anxiety about family disclosure. "They already worry about me not having a boyfriend. This will be worse."`,
    objective: `Appearance: More authentic presentation. Affect: Anxious when discussing parents. Mood: "Torn." GAD-7: Score 13.`,
    assessment: `Social Anxiety - Continued improvement. Identity - Increasing clarity and external expression. Family disclosure is significant anxiety source but patient moving toward authenticity.`,
    plan: `- Continue Escitalopram 10mg
- Family disclosure: Not urgent, work on readiness
- Safety assessment: What support systems exist if parents react poorly?
- PFLAG resources provided
- Continue social exposures
- Follow-up in 4 weeks`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: "2025-10-15T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-aaliyah-brooks-4",
    patient_id: "aaliyah-brooks-demo",
    appointment_id: "apt-demo-aaliyah-005",
    date_of_service: "2026-01-28",
    note_type: "progress_note",
    subjective: `"I'm not ready to tell my parents yet but I feel like I'm finally being me everywhere else. My friends all use they/them now. I even corrected a professor." Patient reports continued social anxiety improvement. Identity expression expanding. Parents still unaware but patient managing compartmentalization while building support network.`,
    objective: `Appearance: Confident, authentic. Affect: Stable, good self-esteem. Mood: "More myself." GAD-7: Score 9.`,
    assessment: `Social Anxiety - Major improvement, now in mild range. Identity - Living authentically in most contexts. Family disclosure remains when ready - not if.`,
    plan: `- Continue Escitalopram 10mg
- Social anxiety: Maintenance phase
- Identity: Continue building support, family disclosure when ready
- Discuss possible family session when/if patient chooses to disclose
- Follow-up in 2 weeks`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: "2026-01-28T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // ROBERT FITZGERALD - 5 notes (Grief + Cognitive Concerns)
  // ============================================================================
  {
    id: "note-robert-fitzgerald-1",
    patient_id: "robert-fitzgerald-demo",
    appointment_id: "apt-demo-robert-001",
    date_of_service: "2025-07-10",
    note_type: "initial_evaluation",
    subjective: `"My wife passed in January. We were married 52 years. I don't know how to be alone." 77-year-old retired engineer presenting with grief and depressive symptoms following wife's death from cancer. Reports isolation, decreased appetite, poor sleep, loss of interest. Also notes increased forgetfulness - "I lost my car keys three times last week." Denies SI but acknowledges "I wouldn't mind joining her."`,
    objective: `Appearance: Neat but subdued. Affect: Sad, tearful. Mood: "Empty." Speech: Slow, soft. Cognition: Mild word-finding pauses, oriented x3, remote memory intact. Mini-Cog: 4/5 (borderline). No active SI (passive wish, no plan/intent). PHQ-9: Score 20 (severe depression).`,
    assessment: `F43.21 Adjustment Disorder with depressed mood (grief-related). R41.81 Age-associated cognitive decline (mild) - Needs monitoring, may be grief-related pseudodementia vs. early neurocognitive disorder. Severe depression requiring pharmacotherapy. Passive death wish common in geriatric grief but requires monitoring.`,
    plan: `- Start Mirtazapine 7.5mg at bedtime (helps sleep, appetite, fewer drug interactions)
- Safety plan developed (daughter's number, crisis line)
- Grief therapy: Normalize mourning process
- Social engagement: Encourage one outside activity per week
- Cognition: Retest in 2 months (may improve with depression treatment)
- Follow-up in 2 weeks`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-07-10T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-robert-fitzgerald-2",
    patient_id: "robert-fitzgerald-demo",
    appointment_id: "apt-demo-robert-002",
    date_of_service: "2025-08-21",
    note_type: "progress_note",
    subjective: `"I'm sleeping better. The medication makes me groggy but I'd rather that than staring at the ceiling all night." Mirtazapine increased to 15mg with good effect on sleep. Eating more regularly. Joined senior center for one lunch per week. "I met another widower there. Nice fellow."`,
    objective: `Appearance: Slightly better grooming. Affect: Sad but less flat. Mood: "Getting by." Mini-Cog: 4/5 (unchanged). PHQ-9: Score 16.`,
    assessment: `Adjustment Disorder - Early response to Mirtazapine. Sleep and appetite improving. Social engagement positive sign. Cognition stable - continue monitoring.`,
    plan: `- Continue Mirtazapine 15mg
- Grief work: Process memories of wife
- Expand social engagement
- Daughter visiting next week - discuss family involvement
- Follow-up in 6 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-08-21T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-robert-fitzgerald-3",
    patient_id: "robert-fitzgerald-demo",
    appointment_id: "apt-demo-robert-003",
    date_of_service: "2025-10-02",
    note_type: "progress_note",
    subjective: `"My daughter came for a week. We went through some of Ellen's things together. It was hard but good." Patient processing grief with family support. Joined widowers' support group at church (meets weekly). "Hearing other men talk about losing their wives helps. I'm not alone in this."`,
    objective: `Appearance: Better grooming. Affect: Broader range, appropriate sadness. Mood: "Sad but okay." PHQ-9: Score 14.`,
    assessment: `Adjustment Disorder - Continued improvement. Grief work progressing appropriately. Social support expanding. Depression improving.`,
    plan: `- Continue Mirtazapine 15mg
- Continue grief therapy
- Support group: Encourage continued attendance
- Daughter planning monthly visits
- Follow-up in 6 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-10-02T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-robert-fitzgerald-4",
    patient_id: "robert-fitzgerald-demo",
    appointment_id: "apt-demo-robert-004",
    date_of_service: "2025-11-13",
    note_type: "progress_note",
    subjective: `"Thanksgiving will be the first without her. My daughter invited me to come early and stay through the weekend." Patient anticipating difficult holiday. Has plan and support. Reports occasional forgetfulness but "about the same as before." Feels clearer than summer.`,
    objective: `Appearance: Good grooming. Affect: Stable. Mood: "Managing." Mini-Cog: 5/5 (improved). PHQ-9: Score 11.`,
    assessment: `Adjustment Disorder - Significant improvement. Cognition improved to normal range - suggests pseudodementia related to depression rather than neurocognitive disorder. Continue monitoring.`,
    plan: `- Continue Mirtazapine 15mg
- Holiday plan in place
- Cognition: Improved, may have been depression-related
- If cognitive concerns persist, consider neuropsych referral
- Follow-up in 6 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-11-13T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-robert-fitzgerald-5",
    patient_id: "robert-fitzgerald-demo",
    appointment_id: "apt-demo-robert-005",
    date_of_service: "2026-01-30",
    note_type: "progress_note",
    subjective: `"It's been a year since Ellen passed. I'm sad but I'm not disappearing anymore. I volunteer at the library now on Wednesdays." Patient marking one-year anniversary with mixed emotions. Grief remains but function restored. New activities and social connections. Reports "occasional senior moments" but nothing concerning.`,
    objective: `Appearance: Well-groomed, present. Affect: Appropriate range. Mood: "Okay - really okay." PHQ-9: Score 9.`,
    assessment: `Adjustment Disorder - Near remission. Healthy grief progression. Social engagement robust. Cognition stable and appropriate for age.`,
    plan: `- Continue Mirtazapine 15mg
- Discuss transition to maintenance phase
- Consider extended session frequency (every 8-12 weeks)
- Follow-up in 2 weeks for 1-year grief check-in`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2026-01-30T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // CARMEN ALVAREZ - 4 notes (Postpartum Depression)
  // ============================================================================
  {
    id: "note-carmen-alvarez-1",
    patient_id: "carmen-alvarez-demo",
    appointment_id: "apt-demo-carmen-001",
    date_of_service: "2025-11-10",
    note_type: "initial_evaluation",
    subjective: `"I love my baby but sometimes I have these scary thoughts about hurting her. I would never do it but I can't make them stop." 32-year-old new mother presenting 3 months postpartum with depression and intrusive thoughts. Baby is first child, vaginal delivery without complications. Reports depressed mood, excessive crying, guilt, difficulty bonding, sleep disruption beyond normal newborn demands, intrusive thoughts of harm to infant. "I'm terrified I'm a bad mother."`,
    objective: `Appearance: Fatigued, tearful. Affect: Anxious, distressed, guilt-ridden. Mood: "Scared and exhausted." Speech: Rapid, pressured when discussing intrusive thoughts. Thought content: Ego-dystonic intrusive thoughts of infant harm (characteristic of postpartum OCD/depression, NOT psychosis). Denies any intent or plan. No SI/HI to self. Edinburgh Postnatal Depression Scale: 18 (clinical). PHQ-9: Score 21 (severe).`,
    assessment: `F53.0 Postpartum Depression - Severe with intrusive thoughts. Intrusive thoughts are ego-dystonic (patient horrified by them, no intent) consistent with postpartum OCD spectrum rather than psychosis. This is treatable and prognosis is good. Patient needs education that these thoughts don't make her dangerous. Sertraline is first-line and breastfeeding-compatible.`,
    plan: `- Start Sertraline 25mg, increase to 50mg then 75mg (breastfeeding-safe)
- Safety: Intrusive thoughts are NOT risk factor for harm when ego-dystonic
- Psychoeducation: "Harm thoughts" are common in postpartum period
- CBT: Thought suppression paradox, acceptance approach
- Social support assessment: Partner involvement crucial
- Weekly sessions during acute phase
- Edinburgh and PHQ-9 at each visit`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-11-10T18:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-carmen-alvarez-2",
    patient_id: "carmen-alvarez-demo",
    appointment_id: "apt-demo-carmen-002",
    date_of_service: "2025-11-24",
    note_type: "progress_note",
    subjective: `"Knowing the thoughts don't mean I'm dangerous helped so much. They're still there but I'm not spiraling as much." Sertraline at 50mg. Patient reports significant relief from psychoeducation about intrusive thoughts. Understanding they're "brain glitches, not predictions" has reduced secondary anxiety. Sleep slightly improved with partner taking more night feeds. Intrusive thoughts down from "constant" to "several times a day."`,
    objective: `Appearance: Less distressed. Affect: Anxious but less panicked. Mood: "Scared but trying." Edinburgh: 14 (improved). PHQ-9: Score 18.`,
    assessment: `Postpartum Depression - Early response to treatment and psychoeducation. Intrusive thought frequency reducing with acceptance approach. Partner involvement helpful.`,
    plan: `- Increase Sertraline to 75mg
- Continue acceptance-based approach to intrusive thoughts
- Coping card for acute episodes: "This is a brain glitch, not a prediction"
- Mom's group suggestion (when ready)
- Follow-up in 2 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-11-24T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-carmen-alvarez-3",
    patient_id: "carmen-alvarez-demo",
    appointment_id: "apt-demo-carmen-003",
    date_of_service: "2025-12-15",
    note_type: "progress_note",
    subjective: `"I held her this morning and just felt love. No scary thoughts for like an hour. That hasn't happened since she was born." Sertraline at 75mg for 3 weeks. Reports bonding improving. Intrusive thoughts now "occasional" rather than constant. Getting 4-hour sleep stretches with partner's help. "My mom came to help. I actually took a shower alone for the first time in a month."`,
    objective: `Appearance: Better grooming, more rested. Affect: Brighter, appropriate maternal affect noted when discussing baby. Mood: "Better." Edinburgh: 10. PHQ-9: Score 14.`,
    assessment: `Postpartum Depression - Significant improvement. Bonding developing appropriately. Intrusive thoughts markedly reduced. Support system engaged.`,
    plan: `- Continue Sertraline 75mg
- Continue acceptance work
- Bonding: Skin-to-skin time daily
- Self-care: Maintain support system involvement
- Extend to biweekly sessions
- Follow-up in 4 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-12-15T17:45:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-carmen-alvarez-4",
    patient_id: "carmen-alvarez-demo",
    appointment_id: "apt-demo-carmen-004",
    date_of_service: "2026-02-07",
    note_type: "progress_note",
    subjective: `"She smiled at me yesterday and I cried happy tears. I think I'm actually feeling like her mom now." Patient reports continued improvement but had "hard day" yesterday with resurgence of intrusive thoughts during sleep deprivation (baby sick). Used coping card. "I didn't spiral. I knew it was just the tired brain."`,
    objective: `Appearance: Rested, warm affect. Affect: Appropriate maternal joy. Mood: "Better, but still some hard days." Edinburgh: 10. PHQ-9: Score 11.`,
    assessment: `Postpartum Depression - Continued improvement with residual symptoms during stress. Good use of coping skills during setback. Bonding solidifying. Safety remains stable - intrusive thoughts ego-dystonic.`,
    plan: `- Continue Sertraline 75mg
- Normalize occasional symptom fluctuation with stress
- Safety check: Intrusive thoughts pattern unchanged, no concern
- Continue support systems
- Follow-up in 1 week (scheduling closer due to recent hard day)`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2026-02-07T17:30:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  // ============================================================================
  // LISA WHITFIELD — 3 NOTES (GAD + Agoraphobia, Exposure Therapy)
  // GAD-7: 14 -> 11 -> 8
  // ============================================================================
  {
    id: "note-lisa-whitfield-1",
    patient_id: "lisa-whitfield-demo",
    appointment_id: "apt-demo-lisa-002",
    date_of_service: "2025-06-01",
    note_type: "initial_evaluation",
    subjective: `Patient presents for initial evaluation. "I can't go to the grocery store anymore without feeling like I'm going to pass out. I haven't been to a restaurant in months." Reports 8+ months of escalating avoidance behaviors following a panic attack at a crowded mall. Avoids crowded spaces, driving on highways, and social gatherings. Reports persistent worry about having another panic attack. Sleep disrupted by anticipatory anxiety. Currently working remotely which enables avoidance. Reports feeling "trapped in my apartment."`,
    objective: `Appearance: Well-groomed, casually dressed. Affect: Anxious, fidgeting with phone. Mood: "Anxious and frustrated with myself." Speech: Rapid rate, normal volume. Thought process: Goal-directed but preoccupied with safety concerns. No SI/HI. GAD-7: Score 14 (moderate anxiety). PHQ-9: Score 7 (mild depression).`,
    assessment: `F41.1 Generalized Anxiety Disorder with F40.00 Agoraphobia. Patient presents with classic avoidance pattern following index panic episode. Anxiety has generalized beyond initial trigger. Agoraphobic avoidance is significantly impacting daily functioning and quality of life. Good insight — patient recognizes avoidance is maintaining the problem. Excellent candidate for exposure-based CBT.`,
    plan: `- Start Buspirone 5mg BID, titrate to 10mg BID over 2 weeks
- Begin psychoeducation on anxiety cycle and role of avoidance
- Construct fear hierarchy for graded exposure
- Assign daily anxiety log homework
- Discuss interoceptive exposure for panic sensitivity
- Return in 2 weeks
- GAD-7 at each visit`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-06-01T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-lisa-whitfield-2",
    patient_id: "lisa-whitfield-demo",
    appointment_id: "apt-demo-lisa-003",
    date_of_service: "2025-08-15",
    note_type: "progress_note",
    subjective: `"I went to the coffee shop down the street last week. I was only there for 10 minutes but I did it." Patient reports completing 3 of 5 assigned exposure tasks from fear hierarchy. Drove on a local highway for one exit. Reports Buspirone helpful for background anxiety. Still avoiding large crowds but recognizes progress.`,
    objective: `Appearance: Improved — more relaxed posture than intake. Affect: Anxious but brighter. Mood: "Better, cautiously." GAD-7: Score 11 (moderate, improved from 14). PHQ-9: Score 5.`,
    assessment: `GAD with Agoraphobia — Good treatment response. Patient engaging with exposure hierarchy. Avoidance pattern beginning to break. Buspirone at therapeutic dose with benefit.`,
    plan: `- Continue Buspirone 10mg BID
- Advance to mid-level exposure tasks: grocery store during off-peak, restaurant with friend
- Introduce response prevention for safety behaviors (checking exits, sitting near door)
- Continue anxiety log
- Follow-up in 10 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-08-15T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-lisa-whitfield-3",
    patient_id: "lisa-whitfield-demo",
    appointment_id: "apt-demo-lisa-004",
    date_of_service: "2025-11-01",
    note_type: "progress_note",
    subjective: `"I went to a friend's birthday dinner last weekend — 12 people at a restaurant. I was nervous but I stayed the whole time." Patient reports significant progress on exposure hierarchy. Completed grocery shopping independently 3x/week. Driving on highway regularly. Reports residual anxiety in novel crowded situations but able to manage with coping skills.`,
    objective: `Appearance: Confident, good eye contact. Affect: Full range, appropriate. Mood: "Actually pretty good." GAD-7: Score 8 (mild, improved from 11). PHQ-9: Score 3.`,
    assessment: `GAD with Agoraphobia — Excellent response to combined CBT/exposure and Buspirone. Avoidance behaviors significantly reduced. Patient approaching higher-level hierarchy items independently. Consider transitioning to maintenance phase.`,
    plan: `- Continue Buspirone 10mg BID
- Target remaining avoidance: concerts, sporting events, travel
- Begin relapse prevention planning
- Discuss reducing session frequency to monthly
- Follow-up in 8 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-11-01T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // KEVIN RHODES — 3 NOTES (MDD + AUD History)
  // PHQ-9: 16 -> 12 -> 10
  // ============================================================================
  {
    id: "note-kevin-rhodes-1",
    patient_id: "kevin-rhodes-demo",
    appointment_id: "apt-demo-kevin-002",
    date_of_service: "2024-10-01",
    note_type: "initial_evaluation",
    subjective: `Patient presents for initial evaluation, referred by PCP after elevated PHQ-9 at annual physical. "I've been sober for 6 months but I feel worse than when I was drinking." Reports persistent low mood, anhedonia, poor concentration at work, and social isolation since achieving sobriety. History of Alcohol Use Disorder — last drink 6 months ago, attends AA 3x/week. Reports marriage strain: "My wife says I traded drinking for sleeping." Sleeps 10-11 hours/night but never feels rested.`,
    objective: `Appearance: Dressed appropriately, flat facial expression. Affect: Blunted. Mood: "Empty." Speech: Slow, low volume. Thought process: Goal-directed, impoverished content. No SI — "I wouldn't do that to my kids." PHQ-9: Score 16 (moderately severe depression). GAD-7: Score 6 (mild anxiety).`,
    assessment: `F33.1 Major Depressive Disorder, recurrent, moderate with F10.21 Alcohol Use Disorder, in early remission. Depression likely unmasked by sobriety — alcohol was self-medicating underlying mood disorder. Hypersomnia and anhedonia prominent. No active safety concern. AA engagement is protective factor. Naltrexone from addiction medicine supports sobriety.`,
    plan: `- Start Bupropion 150mg XL daily (activating, helps anhedonia, weight-neutral)
- Continue Naltrexone 50mg per addiction medicine
- Behavioral activation: schedule 2 pleasurable activities/week
- Discuss grief of "sober identity" vs. drinking identity
- Coordinate with AA sponsor
- Return in 2 weeks for medication check
- PHQ-9 at each visit`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2024-10-01T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-kevin-rhodes-2",
    patient_id: "kevin-rhodes-demo",
    appointment_id: "apt-demo-kevin-003",
    date_of_service: "2024-11-15",
    note_type: "progress_note",
    subjective: `"The Bupropion is helping some. I actually went to my son's basketball game last week and enjoyed it." Patient reports improved energy and some return of interest in activities. Sleep improved to 8-9 hours. Still struggling with concentration at work. Attended AA 2x/week (down from 3). Reports wife noticed he's "more present."`,
    objective: `Appearance: Better grooming, more engaged. Affect: Reactive, occasional smiles. Mood: "Getting there." PHQ-9: Score 12 (moderate, improved from 16). GAD-7: Score 5.`,
    assessment: `MDD, recurrent, moderate — Partial response to Bupropion at 6 weeks. Anhedonia improving. AA engagement remains protective. Relationship showing early improvement.`,
    plan: `- Increase Bupropion to 300mg XL daily
- Continue behavioral activation
- Begin cognitive work on self-criticism patterns
- Discuss marital therapy referral if wife is interested
- Return in 6 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2024-11-15T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-kevin-rhodes-3",
    patient_id: "kevin-rhodes-demo",
    appointment_id: "apt-demo-kevin-006",
    date_of_service: "2026-01-28",
    note_type: "progress_note",
    subjective: `"Work has been brutal — new boss, layoffs happening. I keep thinking about drinking but I haven't." Reports occupational stress as trigger for depressive symptoms. Sleep disrupted again (9+ hours, hard to wake). Attending AA 3x/week again (increase from 2). Reports awareness that stress is a relapse risk.`,
    objective: `Appearance: Appropriate but fatigued. Affect: Constricted. Mood: "Stressed and tired." PHQ-9: Score 10 (moderate). GAD-7: Score 8 (mild, increased from 5).`,
    assessment: `MDD with AUD history — Work stress triggering partial relapse of depressive symptoms. Patient showing good insight and protective behaviors (increased AA, no substance use). Medication may need adjustment if symptoms persist.`,
    plan: `- Continue Bupropion 300mg XL and Naltrexone 50mg
- Stress management techniques for work
- Review cognitive distortions around job security
- Discuss safety plan for craving episodes
- Next session Feb 9 — PATIENT CANCELLED SAME-DAY (work conflict)
- Reschedule within 1 week`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2026-01-28T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },

  // ============================================================================
  // PRIYA SHARMA — 3 NOTES (OCD — ERP Treatment)
  // Y-BOCS equivalent proxy through GAD-7: 15 -> 12 -> 9
  // ============================================================================
  {
    id: "note-priya-sharma-1",
    patient_id: "priya-sharma-demo",
    appointment_id: "apt-demo-priya-002",
    date_of_service: "2025-08-01",
    note_type: "initial_evaluation",
    subjective: `Patient presents for initial evaluation. "I wash my hands until they crack and bleed. I know it doesn't make sense but I can't stop." Reports 2+ years of contamination-focused OCD with escalating rituals. Hand-washing 30+ times/day, avoids touching doorknobs/handrails/public surfaces. Reports checking behavior (locks, stove, car) taking 45+ minutes before leaving home. Insight is good — knows behaviors are excessive. Previously tried Zoloft 50mg (discontinued due to GI side effects). Self-pay — insurance doesn't cover her preferred provider.`,
    objective: `Appearance: Hands visibly dry and cracked. Affect: Anxious, embarrassed when discussing symptoms. Mood: "Frustrated and exhausted." Speech: Normal. Thought process: Goal-directed, intrusive thoughts about contamination. No SI/HI. GAD-7: Score 15 (severe anxiety). PHQ-9: Score 8 (mild depression, secondary to OCD).`,
    assessment: `F42.2 Obsessive-Compulsive Disorder, moderate-severe. Contamination obsessions with washing compulsions predominate. Checking rituals secondary. Good insight (ego-dystonic). Previous SSRI trial inadequate (low dose, GI intolerance). Fluvoxamine often better tolerated for OCD. Strong candidate for ERP.`,
    plan: `- Start Fluvoxamine 50mg at bedtime, titrate to 150mg over 4 weeks (take with food for GI)
- Begin psychoeducation on OCD cycle: obsession → anxiety → compulsion → temporary relief → reinforcement
- Construct contamination hierarchy for ERP
- Assign exposure homework: touch 3 "moderately contaminated" surfaces daily, delay washing 5 minutes
- OCD symptom diary
- Return in 2 weeks
- GAD-7 and PHQ-9 at each visit`,
    cpt_code: "90791",
    duration_minutes: 60,
    signed_at: "2025-08-01T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-priya-sharma-2",
    patient_id: "priya-sharma-demo",
    appointment_id: "apt-demo-priya-003",
    date_of_service: "2025-10-15",
    note_type: "progress_note",
    subjective: `"I touched the railing at the library and sat with it for 20 minutes without washing. It was terrible but I did it." Patient reports engaging with ERP homework consistently. Hand-washing reduced to ~15x/day (from 30+). Checking behavior reduced to 15 minutes before leaving home (from 45). Fluvoxamine 150mg tolerated well. Reports hands healing — using moisturizer as planned.`,
    objective: `Appearance: Hands less irritated than intake. Affect: Proud when discussing exposures. Mood: "Hard but better." GAD-7: Score 12 (moderate, improved from 15). PHQ-9: Score 5.`,
    assessment: `OCD — Good response to combined ERP and Fluvoxamine. Compulsive behavior frequency reduced ~50%. Patient demonstrating willingness to tolerate distress during exposures. Habituation occurring as expected.`,
    plan: `- Continue Fluvoxamine 150mg
- Advance ERP hierarchy: public restroom doorknob, eating without hand-washing first
- Begin response prevention for checking (leave home with 1 check only)
- Continue symptom diary
- Follow-up in 8 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-10-15T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
  {
    id: "note-priya-sharma-3",
    patient_id: "priya-sharma-demo",
    appointment_id: "apt-demo-priya-004",
    date_of_service: "2025-12-10",
    note_type: "progress_note",
    subjective: `"I went to a concert last month — thousands of people, shared bathrooms, didn't wash my hands until I got home. Old me would have never gone." Reports hand-washing reduced to ~8x/day (near-normal range). Checking behavior reduced to quick single-pass (2-3 minutes). Reports intrusive thoughts still present but less distressing — "I notice them but they don't control me anymore."`,
    objective: `Appearance: Hands healthy, good grooming. Affect: Bright, confident. Mood: "Really good." GAD-7: Score 9 (mild, improved from 12). PHQ-9: Score 3.`,
    assessment: `OCD — Excellent treatment response. Compulsive behaviors approaching normal range. Cognitive flexibility improved. Patient internalizing ERP principles — applying independently to novel situations. Consider maintenance phase.`,
    plan: `- Continue Fluvoxamine 150mg (minimum 12 months total for OCD per guidelines)
- Target remaining avoidance: hospital visits, sick family contact
- Begin relapse prevention: identify early warning signs, create coping card
- Discuss billing: patient has accumulated $175 outstanding balance (self-pay). Discuss payment plan.
- Follow-up in 8 weeks`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: "2025-12-10T18:00:00Z",
    signed_by: "Dr. Sarah Demo",
    status: "signed",
  },
];

export default SYNTHETIC_SESSION_NOTES;
