/**
 * Seed Session Notes (SOAP Format) — 25 patients
 * All dates computed via helpers so the prototype always looks fresh.
 * Scores in Objective sections match OUTCOME_MEASURES trajectories exactly.
 */

import type { SeedSessionNote } from "./types";
import { weeklyHistoryDates, toISO } from "./helpers";

// ---------------------------------------------------------------------------
// Date scaffolds — one per patient, preferred weekday
// weeklyHistoryDates returns 4 dates: weeks -4, -3, -2, -1
// ---------------------------------------------------------------------------
const rachelDates = weeklyHistoryDates(2); // Tuesday
const jamesDates = weeklyHistoryDates(2); // Tuesday
const sophiaDates = weeklyHistoryDates(2); // Tuesday
const marcusDates = weeklyHistoryDates(2); // Tuesday
// tyler-harrison: NEW — no notes
const lisaDates = weeklyHistoryDates(4); // Thursday
const emmaDates = weeklyHistoryDates(3); // Wednesday
const davidDates = weeklyHistoryDates(4); // Thursday
const carmenDates = weeklyHistoryDates(1); // Monday
const kevinDates = weeklyHistoryDates(5); // Friday
const priyaDates = weeklyHistoryDates(3); // Wednesday
const robertDates = weeklyHistoryDates(4); // Thursday
const aaliyahDates = weeklyHistoryDates(1); // Monday
const danielDates = weeklyHistoryDates(5); // Friday
const mariaDates = weeklyHistoryDates(3); // Wednesday
const benjaminDates = weeklyHistoryDates(4); // Thursday
// Light history — 2 notes
const sarahDates = weeklyHistoryDates(1).slice(2); // last 2 Mondays
const michaelDates = weeklyHistoryDates(5).slice(2); // last 2 Fridays
const jasmineDates = weeklyHistoryDates(3).slice(2); // last 2 Wednesdays
const omarDates = weeklyHistoryDates(4).slice(2); // last 2 Thursdays
const natalieDates = weeklyHistoryDates(1).slice(2); // last 2 Mondays
// Inactive — 1 note only (use weeks-ago-4 as the final date)
const margaretDates = weeklyHistoryDates(2).slice(0, 1);
const thomasDates = weeklyHistoryDates(3).slice(0, 1);
// No-show — 2 notes
const derekDates = weeklyHistoryDates(1).slice(0, 2); // Monday
// Non-binary
const riverDates = weeklyHistoryDates(5); // Friday

export const SESSION_NOTES: SeedSessionNote[] = [
  // ==========================================================================
  // RACHEL TORRES — MDD recovery, Sertraline 100mg
  // PHQ-9: 15 -> 12 -> 9 -> 5
  // ==========================================================================
  {
    id: "note-rachel-torres-1",
    patient_id: "rachel-torres",
    appointment_id: "apt-rachel-torres-1",
    date_of_service: rachelDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports ongoing depressed mood with intermittent improvements. "Some days I feel almost normal, then I'll have a stretch where getting out of bed feels impossible." Sleep has improved slightly since starting Sertraline — averaging 6 hours compared to 4-5 previously. Appetite is slowly returning though she describes food as "tasteless." Reports difficulty with behavioral activation homework — completed the activity log but only managed two pleasant activities this week. Relationship with partner is strained. "He doesn't understand why I can't just snap out of it."`,
    objective: `Appearance: Casually dressed, grooming adequate. Affect: Somewhat flat but brightened when discussing her dog. Mood: "Heavy." Speech: Normal rate and volume but somewhat monotone. Thought process: Logical, mildly ruminative about work performance. No SI/HI. Insight: Good — recognizes medication is helping but frustrated with pace. PHQ-9: 15 (moderately severe). Weight stable from last visit.`,
    assessment: `F33.1 Major Depressive Disorder, recurrent, moderate. Patient is 4 weeks into Sertraline 100mg. PHQ-9 at 15 shows depressive symptoms remain in the moderate-severe range. Behavioral activation has been inconsistently implemented, likely due to amotivation secondary to depression. Sertraline may need more time at current dose. Sleep improvements are encouraging. No safety concerns. Continue CBT framework with emphasis on breaking activation tasks into smaller steps.`,
    plan: `1. Continue Sertraline 100mg daily — reassess at next visit
2. Behavioral activation: Break pleasant activities into 10-minute micro-tasks (walk to mailbox, not "go for a walk")
3. Sleep hygiene: Continue consistent wake time, no screens after 10 PM
4. Cognitive restructuring: Identify one automatic thought per day, write alternative
5. PHQ-9 at each visit to track trajectory
6. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: toISO(rachelDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-rachel-torres-2",
    patient_id: "rachel-torres",
    appointment_id: "apt-rachel-torres-2",
    date_of_service: rachelDates[1]!,
    note_type: "progress_note",
    subjective: `Patient reports noticeable improvement this week. "I actually went to dinner with a friend and enjoyed it — that hasn't happened in months." Completed four micro-activities from behavioral activation list. Sleep is now averaging 6.5 hours. Identified three automatic thoughts and was able to challenge two of them. Still struggles with work motivation but no longer calling in sick. "I'm just pushing through." Reports Sertraline side effects are manageable — mild nausea in mornings has mostly resolved.`,
    objective: `Appearance: Well-groomed, wearing makeup for first time in recent visits. Affect: Brighter, reactive, smiled several times. Mood: "Better — not great, but better." Speech: Normal rate, improved prosody. Thought process: Goal-directed, less ruminative. No SI/HI. PHQ-9: 12 (moderate depression). Engagement in session notably improved.`,
    assessment: `F33.1 MDD, recurrent, moderate. PHQ-9 decreased from 15 to 12, representing meaningful clinical improvement. Behavioral activation is gaining traction with the micro-task approach. Social engagement (dinner with friend) is a positive prognostic indicator. Cognitive restructuring skills are developing. Sertraline 100mg appears to be reaching therapeutic effect. Continue current treatment plan with gradual increase in activation complexity.`,
    plan: `1. Continue Sertraline 100mg — appears therapeutic
2. Expand behavioral activation: Add one social activity per week
3. Cognitive restructuring: Practice thought records — situation, thought, emotion, evidence, reframe
4. Introduce graded task assignments for work projects (break into steps, reward completion)
5. PHQ-9 next visit
6. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(rachelDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-rachel-torres-3",
    patient_id: "rachel-torres",
    appointment_id: "apt-rachel-torres-3",
    date_of_service: rachelDates[2]!,
    note_type: "progress_note",
    subjective: `Patient arrives with noticeably more energy. "I went to the gym three times this week. That's my old normal." Reports mood is "mostly okay with some dips." Sleep is consistent at 7 hours. Completed all homework including thought records. Identified a core belief around worthlessness tied to childhood experiences of parental criticism. "I think I've been chasing approval my whole life." Relationship with partner is improving — they had a productive conversation about her depression. Still describes work as draining but is managing deadlines.`,
    objective: `Appearance: Well-groomed, posture more erect. Affect: Full range, congruent. Mood: "Hopeful." Speech: Normal. Thought process: Reflective, insightful. No SI/HI. PHQ-9: 9 (mild depression). Good eye contact throughout session. Engaged actively in cognitive work.`,
    assessment: `F33.1 MDD, recurrent, now in partial remission. PHQ-9 has dropped from 12 to 9, crossing from moderate to mild range. This represents a 40% reduction from initial score of 15 over 3 weeks. Behavioral activation is well-established and self-sustaining. Patient is beginning to access deeper schema-level material (worthlessness/approval-seeking), suggesting readiness for deeper cognitive work. Exercise resumption is a strong protective factor. No medication adjustment needed.`,
    plan: `1. Continue Sertraline 100mg
2. Begin exploring core beliefs: Worthlessness schema — evidence for/against, origin story
3. Continue exercise routine (protective factor)
4. Introduce values clarification exercise — what matters beyond work performance?
5. Homework: Write a letter to younger self about worthiness (don't send)
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(rachelDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-rachel-torres-4",
    patient_id: "rachel-torres",
    appointment_id: "apt-rachel-torres-4",
    date_of_service: rachelDates[3]!,
    note_type: "progress_note",
    subjective: `Patient reports feeling "really good this week — like myself again." Completed the letter-to-younger-self exercise and found it "surprisingly emotional but freeing." Has maintained gym routine 3x/week and added yoga once weekly. Sleep 7-8 hours consistently. Described a conflict at work where she set a boundary with her supervisor — "I told him I couldn't take on another project this week and he actually backed off." Reports feeling proud of this. Relationship with partner continues to strengthen. "We're actually talking about moving in together."`,
    objective: `Appearance: Well-groomed, vibrant. Affect: Full range, warm, genuine laughter. Mood: "Good — really good." Speech: Normal rate with improved prosody and spontaneity. Thought process: Organized, future-oriented. No SI/HI. PHQ-9: 5 (minimal depression). Demonstrates strong insight and application of CBT skills in daily life.`,
    assessment: `F33.1 MDD, recurrent, in remission. PHQ-9 of 5 represents remission range. Patient has achieved remarkable progress: 67% symptom reduction over 4 weeks. Behavioral activation, cognitive restructuring, and Sertraline are all contributing. The boundary-setting at work is a key behavioral shift — she is applying therapeutic concepts independently. Core belief work is progressing well. Discuss transition to maintenance phase and relapse prevention.`,
    plan: `1. Continue Sertraline 100mg — discuss maintenance duration (minimum 6 months in remission)
2. Begin relapse prevention planning: Identify early warning signs, coping toolkit
3. Discuss transitioning to biweekly sessions in 2-3 weeks if stability maintains
4. Continue values work — career exploration as distinct from approval-seeking
5. Homework: Write personal relapse prevention plan
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(rachelDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // JAMES OKAFOR — PTSD veteran, Prazosin 2mg
  // PCL-5: 42 -> 38 -> 31 -> 25
  // ==========================================================================
  {
    id: "note-james-okafor-1",
    patient_id: "james-okafor",
    appointment_id: "apt-james-okafor-1",
    date_of_service: jamesDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports continued hypervigilance and nightmares, averaging 3-4 nightmares per week despite Prazosin 2mg at bedtime. "The mall is still impossible — too many people, too many exits to watch." Reports using grounding techniques from last session during a flashback at work. "The 5-4-3-2-1 thing helped me come back faster." Sleep is fragmented — falls asleep okay but wakes at 0300 most nights, often in a sweat. Reports irritability with his wife and kids. "I snapped at my daughter for slamming a door. She was just being a kid." Feels guilty about this.`,
    objective: `Appearance: Military bearing, clean-shaven, pressed clothing. Hypervigilant — scanned office, sat with back to wall. Affect: Guarded, constricted range but showed distress when discussing family impact. Mood: "On edge." Speech: Controlled, measured. Thought process: Linear, organized. No SI/HI but reports passive thoughts of "disappearing." Startle response observed when phone buzzed. PCL-5: 42 (probable PTSD).`,
    assessment: `F43.10 Post-traumatic Stress Disorder. PCL-5 at 42 indicates significant PTSD symptomatology. Re-experiencing and hyperarousal clusters remain most prominent. Prazosin 2mg providing partial but insufficient nightmare control. Avoidance behaviors (mall, crowds) are maintaining the disorder. Patient is engaged in CPT and demonstrates ability to use grounding skills. Guilt about impact on family is a motivator for treatment. "Disappearing" thoughts warrant monitoring but appear passive and ego-dystonic.`,
    plan: `1. Discuss Prazosin increase to 3mg at bedtime with prescriber — nightmares inadequately controlled
2. CPT: Begin stuck point log — identify trauma-related thoughts that maintain PTSD
3. Grounding toolkit: Add cold water immersion (hands in ice water) for acute flashbacks
4. Family psychoeducation: Provide handout for wife about PTSD and hyperarousal
5. Monitor passive "disappearing" thoughts — no imminent safety concern but track
6. PCL-5 at each visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(jamesDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-james-okafor-2",
    patient_id: "james-okafor",
    appointment_id: "apt-james-okafor-2",
    date_of_service: jamesDates[1]!,
    note_type: "progress_note",
    subjective: `Patient reports Prazosin increase to 2mg is "helping a little — maybe 2 nightmares this week instead of 4." Still waking at 0300 but able to fall back asleep using progressive muscle relaxation. Completed stuck point log and identified: "If I let my guard down, something terrible will happen." Reports one outing to a hardware store — "It was crowded but I stayed 20 minutes." Irritability improved somewhat. "I apologized to my daughter. We talked about it." Wife started reading the PTSD handout.`,
    objective: `Appearance: Same military presentation, slightly less guarded posture. Affect: More accessible, showed warmth when discussing daughter interaction. Mood: "A little better." Eye contact improved from last session. No SI/HI — denies passive disappearing thoughts this week. Startle response present but less pronounced. PCL-5: 38 (still above clinical threshold).`,
    assessment: `F43.10 PTSD. PCL-5 improved from 42 to 38, indicating modest but meaningful treatment response. Nightmare frequency decreased with optimized Prazosin dosing. Behavioral approach to hardware store represents important avoidance reduction. The stuck point "If I let my guard down, something terrible will happen" is a core maintaining cognition — central target for CPT. Family repair (daughter apology) suggests emotional flexibility is improving. Continue CPT framework.`,
    plan: `1. Continue Prazosin 2mg — monitoring
2. CPT: Challenge the stuck point "If I let my guard down, something terrible will happen" using Socratic questioning and ABC worksheets
3. Gradual exposure: Increase store/crowd exposure to 30 minutes next week
4. Continue progressive muscle relaxation for 0300 awakenings
5. Homework: Complete ABC worksheet for identified stuck point
6. PCL-5 at each visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: toISO(jamesDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-james-okafor-3",
    patient_id: "james-okafor",
    appointment_id: "apt-james-okafor-3",
    date_of_service: jamesDates[2]!,
    note_type: "progress_note",
    subjective: `Notable shift this week. Patient reports: "I went to the grocery store during peak hours and I was uncomfortable but I stayed. That's huge for me." Nightmares down to once this week. Completed ABC worksheet and reported it was "hard but eye-opening — I can see how that thought keeps me stuck." Reports practicing letting go of hypervigilance in small doses. "I sat in a restaurant with my back to the door for ten minutes. My wife almost fell over." Sleep improving — still waking early but averaging 6 hours total. Less irritable.`,
    objective: `Appearance: Same presentation, noticeably more relaxed in chair. Affect: Broader range — frustration, pride, humor all observable. Mood: "Making progress." Speech: More spontaneous, less controlled. Thought process: Reflective, shows deepening insight. No SI/HI. No passive ideation. PCL-5: 31 (above threshold but significant improvement).`,
    assessment: `F43.10 PTSD. PCL-5 dropped from 38 to 31, a 7-point decrease representing clinically significant improvement. Patient is actively challenging avoidance behaviors (grocery store, restaurant seating) and engaging meaningfully with CPT cognitive work. The restaurant back-to-door exercise was self-initiated, suggesting internalization of exposure principles. Nightmare frequency continues to decrease. Hypervigilance is softening. Treatment trajectory is positive.`,
    plan: `1. Continue Prazosin 2mg
2. CPT: Introduce trauma impact statement — patient to write about how PTSD has changed his beliefs about self, others, world
3. Expand exposure targets: One new avoided situation per week
4. Reinforce gains — patient is doing excellent work
5. Discuss with wife: Couples session for communication about PTSD may be helpful
6. PCL-5 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(jamesDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-james-okafor-4",
    patient_id: "james-okafor",
    appointment_id: "apt-james-okafor-4",
    date_of_service: jamesDates[3]!,
    note_type: "progress_note",
    subjective: `Patient brought in his trauma impact statement. Became emotional reading it. "I wrote about how I don't trust anyone to keep us safe — not even myself anymore." Reports feeling "lighter" after writing it. Nightmares occurred once this week — content was less intense. "I woke up but I wasn't panicked — just sad." Went to his son's basketball game in a crowded gym. "I was anxious the whole time but I stayed for the whole game. My kid was so happy I was there." Sleep averaging 6.5 hours. Wife is interested in a couples session.`,
    objective: `Appearance: Military bearing but body language more open — leaned forward during impact statement reading. Affect: Tearful during reading, then relieved, showed genuine pride about basketball game. Mood: "Hopeful — cautiously hopeful." Good eye contact. Thought process: Insightful, integrative. No SI/HI. PCL-5: 25 (below clinical threshold for first time).`,
    assessment: `F43.10 PTSD, improving. PCL-5 at 25 represents a 17-point decrease from baseline (42), dropping below the clinical threshold of 31-33 for the first time. This is a clinically significant response. The emotional processing during the trauma impact statement reading and the quality shift in nightmare content (terror to sadness) indicate genuine trauma processing is occurring. Behavioral avoidance is substantially reduced. Patient's attendance at son's game despite anxiety demonstrates values-driven behavior overriding avoidance.`,
    plan: `1. Continue Prazosin 2mg — may discuss taper if nightmares continue to decrease
2. CPT: Challenge and rewrite trauma impact statement with updated beliefs
3. Evaluate transition to maintenance — PCL-5 below threshold
4. Schedule couples session with wife — psychoeducation and communication
5. Continue exposure to avoided situations
6. Homework: Identify 3 beliefs that have changed since treatment began
7. PCL-5 next visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 58,
    signed_at: toISO(jamesDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // SOPHIA CHEN — GAD + perfectionism, Buspirone 15mg
  // GAD-7: 14 -> 12 -> 9 -> 7
  // ==========================================================================
  {
    id: "note-sophia-chen-1",
    patient_id: "sophia-chen",
    appointment_id: "apt-sophia-chen-1",
    date_of_service: sophiaDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports pervasive worry that is "constant, like background noise I can't turn off." Primary worries center on job performance (software engineer), fear of making mistakes, and catastrophizing about being fired despite consistently positive reviews. "I check my code five times before submitting a pull request. My teammates do it once." Sleep is disrupted — lies awake planning next-day tasks. Tension headaches 3-4 times per week. Buspirone 15mg is "taking a slight edge off but the worry is still there." Reports perfectionism extends to exercise routine — "If I can't do a full workout, I'd rather skip it."`,
    objective: `Appearance: Immaculately groomed, professionally dressed. Affect: Anxious, tense, rapid speech that slows with effort. Mood: "Stressed." Psychomotor: Fidgeting with hands, crossing/uncrossing legs. Thought process: Ruminative, circular regarding work performance. No SI/HI. Insight: Excellent — articulates the irrationality of worries but cannot stop them. GAD-7: 14 (moderate anxiety). Muscle tension palpable in shoulders.`,
    assessment: `F41.1 Generalized Anxiety Disorder, moderate. GAD-7 at 14 confirms moderate anxiety with significant functional impact. Presentation is consistent with GAD comorbid with perfectionism. Buspirone 15mg provides partial relief. Core maintaining factors include intolerance of uncertainty, catastrophizing, and all-or-nothing thinking (perfectionism). Tension headaches are likely somatic manifestation. Treatment focus should be worry exposure, cognitive defusion, and gradual exposure to imperfection.`,
    plan: `1. Continue Buspirone 15mg — allow full 4-6 week trial before adjusting
2. Introduce worry exposure: Designate 15 min "worry time" per day — contain worry to that window
3. Cognitive defusion exercise: "I'm having the thought that I'll be fired" vs "I'll be fired"
4. Behavioral experiment: Submit code with only 2 reviews (not 5) and track outcome
5. Progressive muscle relaxation for tension headaches — daily practice
6. GAD-7 at each visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 52,
    signed_at: toISO(sophiaDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-sophia-chen-2",
    patient_id: "sophia-chen",
    appointment_id: "apt-sophia-chen-2",
    date_of_service: sophiaDates[1]!,
    note_type: "progress_note",
    subjective: `Patient tried the worry time exercise. "It was hard — I kept worrying outside the window. But by day three I was better at postponing." Completed the behavioral experiment: submitted code with 3 reviews (compromise from 5). "Nothing bad happened. My team lead actually said my code was clean." Still has tension headaches but down to twice this week. Tried PMR once before bed. "I fell asleep during it, which I guess means it worked." Sleep slightly improved — 6.5 hours. Still catastrophizing about a project deadline.`,
    objective: `Appearance: Well-groomed, slightly less formal than last visit. Affect: Anxious but more willing to sit with discomfort. Mood: "Nervous but trying." Speech: Still rapid but fewer tangential worry spirals. Thought process: Shows emerging ability to catch worry patterns. No SI/HI. GAD-7: 12 (moderate, improved). Headaches less frequent.`,
    assessment: `F41.1 GAD, moderate. GAD-7 decreased from 14 to 12. Patient is engaging well with cognitive-behavioral interventions. The code review behavioral experiment was a meaningful step in testing catastrophic predictions. Worry containment is a skill that will strengthen with practice. PMR is providing somatic relief. Perfectionism remains active but patient is showing willingness to experiment with "good enough."`,
    plan: `1. Continue Buspirone 15mg
2. Expand worry time practice — add "worry outcome tracking" (write prediction, check reality)
3. Next behavioral experiment: Leave one non-critical task at "good enough" rather than perfect
4. Continue PMR daily — especially pre-sleep
5. Introduce cognitive defusion journaling: 5 min nightly
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(sophiaDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-sophia-chen-3",
    patient_id: "sophia-chen",
    appointment_id: "apt-sophia-chen-3",
    date_of_service: sophiaDates[2]!,
    note_type: "progress_note",
    subjective: `Breakthrough week. "I submitted a design doc with a typo. In the old days I would have panicked and sent a correction. Instead I just let it go. Nobody noticed or cared." Reports worry outcome tracking has been "revelatory — none of my catastrophic predictions have come true in 2 weeks." Sleep is now 7 hours. Headaches down to once this week. "My partner said I seem less tense." Still has some difficulty delegating at work but is practicing. Started doing shorter workouts on busy days instead of skipping entirely.`,
    objective: `Appearance: Casual but put-together — more relaxed presentation. Affect: Brighter, less tense, laughed about the typo story. Mood: "Calmer." Speech: Notably slower and more measured. Thought process: Less ruminative, more present-focused. No SI/HI. GAD-7: 9 (mild anxiety). Minimal fidgeting. Shoulders visibly less tense.`,
    assessment: `F41.1 GAD, improving to mild. GAD-7 at 9 represents transition from moderate to mild range. The typo tolerance is a significant behavioral marker of reduced perfectionism. Worry outcome tracking is effectively challenging catastrophic predictions through experiential learning. Somatic symptoms improving in parallel. The shift to "shorter workouts" over "no workout" shows all-or-nothing thinking is softening. Continue building distress tolerance and flexibility.`,
    plan: `1. Continue Buspirone 15mg
2. Expand imperfection exposure: Intentionally make one small "mistake" per week (send email without re-reading, etc.)
3. Continue worry outcome tracking
4. Introduce values clarification: What matters beyond performance?
5. Delegation practice at work: One task per week to a teammate
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(sophiaDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-sophia-chen-4",
    patient_id: "sophia-chen",
    appointment_id: "apt-sophia-chen-4",
    date_of_service: sophiaDates[3]!,
    note_type: "progress_note",
    subjective: `Patient reports continued progress. "I delegated a feature to a junior dev and it was fine — different from how I'd do it, but fine." Worry time is now feeling less necessary — "I run out of things to worry about before the 15 minutes are up." Sleep 7+ hours consistently. One headache this week, mild. Completed values exercise: identified relationships and creativity as more important than achievement. "That was hard to write but I know it's true." Reports feeling more present with friends and partner. "I used to be half there, half planning."`,
    objective: `Appearance: Relaxed, warm presentation. Affect: Full range, congruent, spontaneous humor. Mood: "Good — actually good, not performing good." Speech: Normal rate. Thought process: Reflective, flexible. No SI/HI. GAD-7: 7 (mild anxiety). Engaged throughout session with minimal anxiety behaviors.`,
    assessment: `F41.1 GAD, mild, stable. GAD-7 at 7 represents 50% reduction from baseline of 14. Patient demonstrates internalized CBT skills — worry containment, behavioral experiments, distress tolerance, cognitive defusion all deployed independently. Perfectionism is softening significantly as evidenced by delegation and values shift. Buspirone providing stable anxiolytic support. Begin discussing maintenance phase and relapse prevention.`,
    plan: `1. Continue Buspirone 15mg — discuss duration at next visit
2. Begin relapse prevention: Identify anxiety triggers and early warning signs
3. Continue practicing delegation and imperfection tolerance
4. Homework: Create personal anxiety management toolkit card
5. Discuss transitioning to biweekly sessions
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 48,
    signed_at: toISO(sophiaDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // MARCUS WASHINGTON — Bipolar II maintenance, Lamotrigine 200mg + Quetiapine 50mg
  // PHQ-9: 11 -> 9 -> 7 -> 5
  // ==========================================================================
  {
    id: "note-marcus-washington-1",
    patient_id: "marcus-washington",
    appointment_id: "apt-marcus-washington-1",
    date_of_service: marcusDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports mood has been "okay — not great, but stable, which I'll take." Sleep is irregular — got 5 hours two nights this week due to staying up watching TV. "I know it's a warning sign but sometimes I just don't feel tired." Mood charting shows mild depressive dips in the mornings that lift by afternoon. Lamotrigine 200mg and Quetiapine 50mg tolerated well. Denies hypomanic symptoms — "no racing thoughts, no spending sprees, no big plans." Reports some low motivation and anhedonia. "I turned down poker night with the guys. Just didn't feel like it."`,
    objective: `Appearance: Well-groomed, dressed casually. Affect: Euthymic to mildly dysthymic. Mood: "Just okay." Speech: Normal rate and volume — no pressured speech. Thought process: Linear, organized. No SI/HI. No evidence of hypomania (no grandiosity, no decreased need for sleep in euphoric context, no impulsivity). PHQ-9: 11 (moderate depressive symptoms). Mood chart reviewed — shows mild cycling with 2-3 day depressive dips.`,
    assessment: `F31.81 Bipolar II Disorder, current episode depressed, mild. PHQ-9 at 11 indicates persistent mild-to-moderate depressive symptoms despite stable medication regimen. No hypomanic features. Sleep irregularity (TV late nights) is a modifiable risk factor for mood destabilization. The social withdrawal (declining poker night) suggests behavioral shutdown that could deepen. Lamotrigine at 200mg is therapeutic dose; Quetiapine 50mg maintaining sleep architecture when taken. Focus on sleep regulation and behavioral activation.`,
    plan: `1. Continue Lamotrigine 200mg and Quetiapine 50mg at bedtime
2. Sleep regulation: Strict 10:30 PM lights-out, TV off by 10 PM — sleep is the first domino
3. Mood charting: Continue daily — add sleep hours column
4. Behavioral activation: Commit to one social outing this week (poker or equivalent)
5. Psychoeducation: Review bipolar depression management — activity scheduling, circadian rhythm
6. PHQ-9 at each visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(marcusDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-marcus-washington-2",
    patient_id: "marcus-washington",
    appointment_id: "apt-marcus-washington-2",
    date_of_service: marcusDates[1]!,
    note_type: "progress_note",
    subjective: `Patient reports improvement in sleep — "I followed the 10:30 rule 5 out of 7 nights. The two nights I didn't were Saturday and Sunday." Went to poker night. "It was actually good to be around the guys. I realized I was isolating." Mood chart shows fewer morning dips. "Mornings are still the hardest but they're shorter — I'm functional by 10 AM instead of noon." Reports slight increase in energy and interest. "I cleaned the garage this weekend. It had been nagging me for months."`,
    objective: `Appearance: Same as last visit, slightly more animated. Affect: Euthymic, mildly improved. Mood: "A bit better." Speech: Normal. Thought process: Goal-directed. No SI/HI. No hypomanic features — garage cleaning was a weekend task, not a 3 AM project. PHQ-9: 9 (mild depressive symptoms). Mood chart shows improvement with better sleep adherence.`,
    assessment: `F31.81 Bipolar II Disorder, maintenance phase, improving. PHQ-9 improved from 11 to 9 with sleep regulation and behavioral activation. The connection between sleep consistency and mood stabilization is evident in his mood chart. Social re-engagement (poker night) is positive. Garage project was appropriately paced — not concerning for hypomania. Continue current approach.`,
    plan: `1. Continue Lamotrigine 200mg and Quetiapine 50mg
2. Reinforce sleep regulation — aim for 7/7 nights this week
3. Continue mood charting with sleep column
4. Add one more pleasurable activity — walking, golf, etc.
5. Discuss seasonal patterns — is spring typically a risk for hypomania?
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 48,
    signed_at: toISO(marcusDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-marcus-washington-3",
    patient_id: "marcus-washington",
    appointment_id: "apt-marcus-washington-3",
    date_of_service: marcusDates[2]!,
    note_type: "progress_note",
    subjective: `Good week overall. "I went golfing Saturday morning and it felt great. Fresh air, exercise, buddies — the trifecta." Sleep was consistent at 7 hours 6/7 nights. Morning dips are "barely noticeable now — more like sluggishness than dread." Reports he discussed spring hypomania risk with his wife. "She's my early warning system. She noticed last spring before I did." Denies any current hypomanic signs. "I'm spending normally, sleeping normally, thinking normally."`,
    objective: `Appearance: Brighter presentation, well-groomed. Affect: Euthymic, pleasant. Mood: "Good — legitimately good." Speech: Normal. Thought process: Organized, reflective. No SI/HI. No hypomanic features. PHQ-9: 7 (mild, improving). Mood chart confirms stable euthymia over past week.`,
    assessment: `F31.81 Bipolar II Disorder, maintenance phase, stable. PHQ-9 at 7, continuing downward trend. Sleep regulation has been the primary driver of improvement. Patient is proactively engaging family as support and monitoring system for hypomania. Behavioral activation (golf, socializing) is self-sustaining. Discuss extending session interval as maintenance measure.`,
    plan: `1. Continue Lamotrigine 200mg and Quetiapine 50mg
2. Sleep: Maintain 10:30 PM routine — this is non-negotiable for stability
3. Continue mood charting — spring monitoring mode (watch for hypomania signs)
4. Hypomania early warning plan: If wife notices pressured speech or decreased sleep need, contact office
5. PHQ-9 next visit
6. Follow up in 1 week — discuss potential shift to biweekly`,
    cpt_code: "90837",
    duration_minutes: 45,
    signed_at: toISO(marcusDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-marcus-washington-4",
    patient_id: "marcus-washington",
    appointment_id: "apt-marcus-washington-4",
    date_of_service: marcusDates[3]!,
    note_type: "progress_note",
    subjective: `Patient reports stable mood all week. "This is the most consistent I've felt in months." Sleep 7/7 nights at consistent times. Played golf twice, went to poker night. "I feel like myself again." Mood chart is "boring — in a good way." Wife reports no concerns. "She said I'm back to my usual self." Reports some anxiety about reducing session frequency — "What if things get bad again?" We explored this fear together.`,
    objective: `Appearance: Relaxed, well-groomed. Affect: Full range, stable, warm. Mood: "Stable and good." Speech: Normal. Thought process: Clear, future-oriented. No SI/HI. No hypomanic features. PHQ-9: 5 (minimal depressive symptoms). Four consecutive weeks of improvement on mood chart.`,
    assessment: `F31.81 Bipolar II Disorder, maintenance phase, stable euthymia. PHQ-9 at 5 represents remission from depressive phase. Four-week trend is consistently positive. Medication regimen is effective and well-tolerated. Sleep regulation is internalized as a core self-management tool. Patient has anxiety about reducing frequency, which is understandable given bipolar disorder's episodic nature. Extended session interval is appropriate with safety plan.`,
    plan: `1. Continue Lamotrigine 200mg and Quetiapine 50mg
2. Transition to biweekly sessions starting next visit
3. Relapse prevention: Written plan — early signs, action steps, emergency contacts
4. Spring monitoring continues — wife and patient both vigilant
5. Standing rule: If sleep drops below 6 hours for 2 consecutive nights, call office
6. PHQ-9 at each visit
7. Follow up in 2 weeks`,
    cpt_code: "90837",
    duration_minutes: 45,
    signed_at: toISO(marcusDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // LISA WHITFIELD — GAD + agoraphobia, Escitalopram 20mg + Clonazepam 0.5mg PRN
  // GAD-7: 18 -> 16 -> 14 -> 13
  // ==========================================================================
  {
    id: "note-lisa-whitfield-1",
    patient_id: "lisa-whitfield",
    appointment_id: "apt-lisa-whitfield-1",
    date_of_service: lisaDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports the past week has been "very difficult." Has not left the house except for this appointment. "I tried to go to the grocery store but had a panic attack in the parking lot before I even got inside." Taking Clonazepam 0.5mg PRN about 3 times this week. "I hate relying on it but sometimes it's the only thing that gets me through." Worries are constant — health, safety of her children (grown adults), home invasion scenarios. Sleep is poor — 4-5 hours, interrupted by worry. "I lie there with my mind racing about everything that could go wrong tomorrow."`,
    objective: `Appearance: Well-dressed but appears fatigued. Affect: Anxious, tense, tearful when discussing grocery store attempt. Mood: "Overwhelmed." Speech: Rapid, pressured when describing worries. Thought process: Ruminative, tangential at times. No SI/HI. Psychomotor agitation — unable to sit still for full session. GAD-7: 18 (severe anxiety). Clonazepam use 3x/week, PRN protocol appropriate.`,
    assessment: `F41.1 GAD, severe, with F40.00 Agoraphobia. GAD-7 at 18 indicates severe anxiety. Agoraphobic avoidance is significant and reinforcing the anxiety cycle. The parking lot panic attack prevented exposure, maintaining avoidance pattern. Clonazepam use is within appropriate PRN parameters but frequency suggests inadequate control from Escitalopram alone. Sleep disruption is feeding the anxiety-worry cycle. This is a complex presentation requiring careful graduated exposure work alongside pharmacological support.`,
    plan: `1. Continue Escitalopram 20mg — at maximum dose, monitor for efficacy over next 2 weeks
2. Clonazepam 0.5mg PRN — continue but track frequency (target: reduce to 2x/week)
3. Build exposure hierarchy: Start with front porch (5 min) → driveway → mailbox → drive around block
4. Relaxation training: Diaphragmatic breathing before and during exposure
5. Sleep: Guided sleep meditation app + consistent wake time
6. Cognitive work: Challenge probability estimates of feared outcomes
7. GAD-7 at each visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(lisaDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-lisa-whitfield-2",
    patient_id: "lisa-whitfield",
    appointment_id: "apt-lisa-whitfield-2",
    date_of_service: lisaDates[1]!,
    note_type: "progress_note",
    subjective: `Small wins this week. "I sat on the front porch for 20 minutes three times. The first time I was terrified, the third time it was almost okay." Attempted mailbox walk — made it there and back once. "My heart was pounding but I did it." Clonazepam used twice this week (down from 3). Sleep improved slightly with meditation app — "It gives my brain something to focus on other than worry." Still having difficulty with the idea of going to the grocery store. "The parking lot thing really shook me."`,
    objective: `Appearance: Same as last visit but slightly less fatigued. Affect: Anxious but showed pride in exposure accomplishments. Mood: "Still anxious but I'm trying." Speech: Less pressured than last week. Thought process: Ruminative but showing emerging ability to redirect. No SI/HI. GAD-7: 16 (severe, slight improvement). Clonazepam frequency reduced.`,
    assessment: `F41.1 GAD, severe. F40.00 Agoraphobia. GAD-7 decreased from 18 to 16 — modest improvement consistent with early exposure work. Patient is completing exposure hierarchy steps despite significant anxiety, which is prognostically positive. The porch-to-mailbox progression is appropriate pacing. Clonazepam reduction (3 to 2 uses) suggests marginal improvement in baseline anxiety. Continue graduated approach.`,
    plan: `1. Continue Escitalopram 20mg and Clonazepam 0.5mg PRN
2. Exposure hierarchy next steps: Mailbox daily → short walk around block → drive to store parking lot (sit in car only)
3. Introduce SUDS tracking during exposures (0-100 scale)
4. Continue sleep meditation
5. Cognitive restructuring: What's the worst case? How likely? How would you cope?
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: toISO(lisaDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-lisa-whitfield-3",
    patient_id: "lisa-whitfield",
    appointment_id: "apt-lisa-whitfield-3",
    date_of_service: lisaDates[2]!,
    note_type: "progress_note",
    subjective: `Patient walked around the block twice this week. "The first time I almost turned back at the corner but I kept going." SUDS were 85 at peak but dropped to 60 by the end. Drove to the store parking lot and sat in the car for 15 minutes. "I watched people going in and out and thought, they're all fine. Nothing bad is happening to them." Clonazepam used twice. Sleep averaging 5.5 hours — "Better than 4 but still not great." Worries continue about children but she was able to catch one catastrophic thought and challenge it: "My son is a 30-year-old man. He doesn't need me to protect him from everything."`,
    objective: `Appearance: Better groomed, more rested. Affect: Anxious but determined. Mood: "Fighting." Speech: More controlled. Thought process: Shows growing metacognitive awareness. No SI/HI. GAD-7: 14 (moderate, continued improvement). SUDS tracking shows habituation curve within exposures.`,
    assessment: `F41.1 GAD, moderate (improved from severe). F40.00 Agoraphobia. GAD-7 at 14, steady 2-point improvements weekly. Exposure work is proceeding well — patient is experiencing within-session habituation (SUDS dropping from 85 to 60). The parking lot visit is a meaningful step toward the grocery store. Cognitive skills are developing — the son/protection insight shows core belief access. However, progress is slow relative to severity. May need to discuss augmentation if plateau occurs.`,
    plan: `1. Continue Escitalopram 20mg and Clonazepam 0.5mg PRN
2. Exposure hierarchy: Go inside store for 5 minutes (off-peak hours, early morning)
3. Continue SUDS tracking
4. Cognitive work: Explore overprotection schema — origin, maintenance, impact
5. Sleep: Add 10 PM worry journal dump — write worries to externalize before bed
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(lisaDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-lisa-whitfield-4",
    patient_id: "lisa-whitfield",
    appointment_id: "apt-lisa-whitfield-4",
    date_of_service: lisaDates[3]!,
    note_type: "progress_note",
    subjective: `Patient went inside the grocery store during early morning hours. "I was in and out in 8 minutes. I bought milk, bread, and bananas. My hands were shaking but I did it." Reports this was the first time shopping alone in over 6 months. Clonazepam used once this week — before the store trip. Worry journal is "helpful for sleep — getting it out of my head helps." Sleep averaging 6 hours. Still worries about children but catching catastrophic thoughts more consistently. "I still worry but I can talk myself down faster."`,
    objective: `Appearance: Brightened presentation, more color in clothing. Affect: Anxious but with notable pride and moments of levity. Mood: "Scared but proud." Speech: Normal rate. Thought process: More organized, less tangential. No SI/HI. GAD-7: 13 (moderate). Clonazepam reduced to 1x this week.`,
    assessment: `F41.1 GAD, moderate. F40.00 Agoraphobia, improving. GAD-7 at 13, total reduction of 5 points from baseline 18. The grocery store visit is a landmark achievement — first independent shopping in 6+ months. However, improvement is plateauing (only 1-point drop this week vs 2-point in prior weeks). Agoraphobia exposure hierarchy is progressing but slowly. Clonazepam reduction to 1x/week is positive. Continue current trajectory but prepare to discuss augmentation strategies if plateau persists.`,
    plan: `1. Continue Escitalopram 20mg and Clonazepam 0.5mg PRN
2. Exposure hierarchy: Repeat grocery store trip 2x this week, slightly longer duration
3. Add one new location exposure: Pharmacy, library, or post office
4. Continue worry journal before bed
5. Discuss potential augmentation options if GAD-7 does not continue to improve
6. Celebrate the grocery store victory — this was hard and she did it
7. GAD-7 next visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(lisaDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // EMMA KOWALSKI — Bulimia recovery, Fluoxetine 60mg
  // PHQ-9: 13 -> 11 -> 9 -> 7
  // ==========================================================================
  {
    id: "note-emma-kowalski-1",
    patient_id: "emma-kowalski",
    appointment_id: "apt-emma-kowalski-1",
    date_of_service: emmaDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports 2 purge episodes this week, both triggered by social eating situations. "We went to dinner with my boyfriend's parents and I felt so out of control eating in front of them." Meal planning adherence was "about 60% — I skipped breakfast twice and then binged at lunch." Body image distress remains high. "I avoid mirrors. I wore a baggy sweater to the dinner even though it was warm." Fluoxetine 60mg tolerated. Mood is low but connected to body shame. "If I could just look different I'd be okay."`,
    objective: `Appearance: Oversized clothing, minimal makeup. Affect: Distressed when discussing body image, constricted range. Mood: "Disgusted with myself." Speech: Normal but quiet. Thought process: Body-checking cognitions, all-or-nothing around food. No SI/HI. Dental exam reminder given. PHQ-9: 13 (moderate). Weight stable (BMI 22.3). No electrolyte concerns per recent labs.`,
    assessment: `F50.2 Bulimia Nervosa, moderate. PHQ-9 at 13 reflects comorbid depressive symptoms. Purge frequency at 2x/week is reduced from baseline but still clinically significant. Meals-as-planned adherence is inconsistent. Social eating is a major trigger. Body image distortion and avoidance (mirror, clothing) maintain the disorder. Fluoxetine at 60mg is the appropriate dose for bulimia. Focus on meal planning consistency, urge surfing, and body image cognitive work.`,
    plan: `1. Continue Fluoxetine 60mg
2. Meal planning: Pre-plan all 3 meals + 2 snacks — no skipping breakfast
3. Urge surfing: Practice delay technique — set 20 min timer after binge urge, then reassess
4. Body image: One mirror exposure exercise per day — look for 2 minutes, notice without judging
5. Social eating prep: Plan what to eat at social events in advance
6. PHQ-9 at each visit, track purge frequency
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(emmaDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-emma-kowalski-2",
    patient_id: "emma-kowalski",
    appointment_id: "apt-emma-kowalski-2",
    date_of_service: emmaDates[1]!,
    note_type: "progress_note",
    subjective: `One purge episode this week — "I binged on chips after a bad day at work and purged. But I used the urge surfing technique twice and it actually worked both times." Meal planning adherence improved to about 75%. Skipped breakfast once. "I'm starting to notice that when I skip meals, I'm more vulnerable to bingeing." Tried the mirror exercise. "It was horrible the first time. By the fourth time it was just uncomfortable." Reports feeling slightly less consumed by food thoughts.`,
    objective: `Appearance: Similar oversized clothing, slightly better grooming. Affect: Improved range, expressed pride about urge surfing. Mood: "Okay, actually." Speech: Normal. Thought process: Developing food-mood awareness. No SI/HI. PHQ-9: 11 (moderate, improving). Weight stable. Purge frequency: 1x/week (down from 2x).`,
    assessment: `F50.2 Bulimia Nervosa, improving. PHQ-9 at 11. Purge frequency decreased from 2 to 1 this week. Urge surfing is being used effectively. Patient is developing insight into meal skipping as a risk factor for bingeing. Mirror exposure is proceeding despite distress, which builds body image tolerance. Continue current treatment approach.`,
    plan: `1. Continue Fluoxetine 60mg
2. Meal planning: Target 90% adherence — no skipping meals
3. Continue urge surfing — extend timer to 30 minutes
4. Mirror exposure: Continue daily, add one positive body statement
5. Cognitive restructuring: Challenge "if I looked different I'd be okay" — what's the evidence?
6. PHQ-9 next visit, track purge frequency
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(emmaDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-emma-kowalski-3",
    patient_id: "emma-kowalski",
    appointment_id: "apt-emma-kowalski-3",
    date_of_service: emmaDates[2]!,
    note_type: "progress_note",
    subjective: `Zero purge episodes this week. "This is the first purge-free week in... I can't remember. Months." Meal planning adherence about 85%. Mirror exercise is getting easier — "I told myself my legs carry me on hikes and that felt true." Reports boyfriend noticed she seems happier. "I'm not constantly thinking about what I ate or what I look like." Still has moments of body dissatisfaction but they pass faster. "It's like a wave — it comes and goes."`,
    objective: `Appearance: Slightly more fitted clothing today — notable shift. Affect: Brighter, full range. Mood: "Proud of myself." Speech: Normal, animated when discussing purge-free week. Thought process: Balanced, less food-focused. No SI/HI. PHQ-9: 9 (mild depression). Weight stable. Zero purge episodes.`,
    assessment: `F50.2 Bulimia Nervosa, improving. PHQ-9 at 9. First purge-free week is a significant milestone. Body image work is progressing — the shift toward body appreciation (functional statements) is evidence-based and effective. Meal planning consistency is building. Clothing change suggests reduced body avoidance. Depression lifting in parallel with eating disorder improvement. Continue to build on gains.`,
    plan: `1. Continue Fluoxetine 60mg
2. Celebrate purge-free week — reinforce what worked
3. Continue meal planning — aim for full adherence
4. Body image: Add body gratitude journaling — 3 things body did for you today
5. Expand social eating: Accept one dining invitation this week
6. Begin relapse prevention: Identify high-risk situations and coping strategies
7. PHQ-9 next visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(emmaDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-emma-kowalski-4",
    patient_id: "emma-kowalski",
    appointment_id: "apt-emma-kowalski-4",
    date_of_service: emmaDates[3]!,
    note_type: "progress_note",
    subjective: `Second consecutive purge-free week. "I went to brunch with friends and ate normally. I didn't even think about it until after." Meal planning is now "just routine — I prep on Sundays." Mirror exercise has evolved — "I can look at myself and feel neutral most days, sometimes even okay." Reports improved energy and mood. "I'm signing up for a pottery class. I want to do things that aren't about my body." One moment of strong urge after seeing a diet ad on social media but used urge surfing successfully.`,
    objective: `Appearance: Fitting clothing, improved grooming and self-presentation. Affect: Warm, expressive, full range. Mood: "Hopeful." Speech: Spontaneous, lively. Thought process: Balanced, future-oriented. No SI/HI. PHQ-9: 7 (mild, improving). Weight stable. Two consecutive purge-free weeks.`,
    assessment: `F50.2 Bulimia Nervosa, in early remission. PHQ-9 at 7. Two consecutive purge-free weeks. Social eating is no longer triggering purge episodes. Body image has shifted from avoidance/distortion to neutrality with emerging acceptance. The decision to pursue pottery (non-body-focused activity) shows identity expansion beyond appearance. Fluoxetine at 60mg is supporting both eating disorder and mood. Continue building recovery infrastructure.`,
    plan: `1. Continue Fluoxetine 60mg
2. Continue meal planning routine
3. Social media: Consider unfollowing diet/fitness accounts — reduce exposure to triggers
4. Body image: Continue gratitude journaling
5. Relapse prevention plan: Write it out — triggers, warning signs, coping skills, support contacts
6. Discuss session frequency reduction in 2 weeks if stability maintains
7. PHQ-9 next visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(emmaDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // DAVID NAKAMURA — Adjustment disorder (work stress), no meds
  // GAD-7: 10 -> 8 -> 6 -> 4
  // ==========================================================================
  {
    id: "note-david-nakamura-1",
    patient_id: "david-nakamura",
    appointment_id: "apt-david-nakamura-1",
    date_of_service: davidDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports ongoing stress related to corporate restructuring at his company. "They laid off half my team and doubled my workload. I'm working 60-hour weeks and I still can't keep up." Sleep is disrupted — "I wake up at 4 AM thinking about my to-do list." Appetite decreased, lost 5 pounds over the past month. Relationship with wife is strained due to long hours. "She says she never sees me. She's right." No psychiatric medication — came seeking therapy for coping strategies.`,
    objective: `Appearance: Professional attire but looks tired, dark under-eye circles. Affect: Frustrated, stressed. Mood: "Burned out." Speech: Rapid when discussing work. Thought process: Organized but preoccupied with work logistics. No SI/HI. GAD-7: 10 (moderate anxiety). Appears physically exhausted.`,
    assessment: `F43.20 Adjustment Disorder with anxiety, related to occupational stressor. GAD-7 at 10 indicates moderate anxiety directly tied to work overload. Presentation is reactive and situational — no evidence of pre-existing anxiety disorder. Sleep disruption and weight loss suggest stress response is becoming physiologically embedded. No medication warranted at this time — situational stressor should be primary target. Focus on stress management, boundary-setting, and problem-solving.`,
    plan: `1. No medication at this time — monitor for worsening
2. Stress management: Introduce structured worry time (20 min) and box breathing for acute stress
3. Boundary setting: Identify one work boundary to implement this week (e.g., no email after 7 PM)
4. Problem-solving therapy: List top 3 work stressors, brainstorm one actionable solution for each
5. Sleep: No screens in bed, consistent wake time
6. GAD-7 at each visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(davidDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-david-nakamura-2",
    patient_id: "david-nakamura",
    appointment_id: "apt-david-nakamura-2",
    date_of_service: davidDates[1]!,
    note_type: "progress_note",
    subjective: `Patient implemented no-email-after-7 PM rule. "My manager pushed back but I held firm. The world didn't end." Box breathing helped during a stressful meeting. Sleep improved slightly — 6 hours. "I still wake up early but the worry time exercise helps me get thoughts out of my head." Completed problem-solving homework: prioritized workload, identified 2 tasks he can delegate. "It felt good to have a plan instead of just drowning."`,
    objective: `Appearance: Slightly more rested. Affect: Still stressed but more composed. Mood: "Overwhelmed but coping." Speech: Normal rate. Thought process: More structured, solution-focused. No SI/HI. GAD-7: 8 (mild-moderate, improving).`,
    assessment: `F43.20 Adjustment Disorder with anxiety. GAD-7 improved from 10 to 8. Boundary-setting is producing immediate relief. Problem-solving approach is well-suited to this patient's analytical nature. Sleep improvement parallels anxiety reduction. Continue building coping infrastructure and workplace assertiveness.`,
    plan: `1. Continue no medication
2. Add second boundary: Protected lunch break 3x/week minimum
3. Delegation: Execute on the 2 tasks identified — practice letting go of control
4. Continue box breathing and worry time
5. Introduce values conversation: Is this job aligned with what matters to you?
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(davidDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-david-nakamura-3",
    patient_id: "david-nakamura",
    appointment_id: "apt-david-nakamura-3",
    date_of_service: davidDates[2]!,
    note_type: "progress_note",
    subjective: `Significant improvement this week. "I delegated two tasks and my reports handled them fine. I realized I've been hoarding work because I don't trust people to do it right." Took lunch breaks 4 times this week. "I ate outside with a colleague. I'd forgotten what that was like." Sleep improving to 6.5 hours. Values conversation resonated. "I got into this field because I loved building products. Now I'm just managing fire drills." Reports wife is noticing the changes. "We went on a date night for the first time in months."`,
    objective: `Appearance: More relaxed, color returning to face. Affect: Reflective, less tense. Mood: "Better — seeing the light." Speech: Normal. Thought process: Insightful, value-driven. No SI/HI. GAD-7: 6 (mild anxiety). Physical appearance improved — less fatigued.`,
    assessment: `F43.20 Adjustment Disorder with anxiety, improving. GAD-7 at 6, continued steady improvement. Patient is making behavioral changes that are restructuring his relationship with work. The insight about hoarding work (control/trust issue) is important. Values work is motivating change. Marriage benefiting from boundary changes. This presentation is tracking toward resolution.`,
    plan: `1. Continue no medication
2. Explore the control/trust dynamic: Where does it come from? How does it show up outside work?
3. Continue boundaries and delegation — make them permanent habits
4. Date night: Make it weekly — non-negotiable relationship maintenance
5. Begin discussing career alignment — is this the right role?
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(davidDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-david-nakamura-4",
    patient_id: "david-nakamura",
    appointment_id: "apt-david-nakamura-4",
    date_of_service: davidDates[3]!,
    note_type: "progress_note",
    subjective: `Best week yet. "I had a conversation with my VP about workload distribution. She agreed to hire a contractor for the overflow." Sleep is 7 hours. Weight stabilizing — "I'm eating normal meals again." Went on date night and "actually enjoyed it instead of checking my phone." Control insight: "My dad was a perfectionist. I learned early that if you don't do it yourself, it won't be done right. I'm unlearning that." Reports anxiety is "manageable — normal stress, not crisis-level."`,
    objective: `Appearance: Healthy, well-rested, relaxed posture. Affect: Warm, full range. Mood: "So much better." Speech: Normal. Thought process: Clear, balanced. No SI/HI. GAD-7: 4 (minimal anxiety). Physical symptoms resolved — no weight loss, sleeping normally.`,
    assessment: `F43.20 Adjustment Disorder with anxiety, largely resolved. GAD-7 at 4 represents subclinical anxiety level. Patient has effectively advocated for workload changes, established sustainable boundaries, and developed insight into perfectionism patterns. Physical symptoms have resolved. Consider treatment completion planning.`,
    plan: `1. Continue no medication
2. Discuss treatment completion: 2-3 more sessions for consolidation
3. Relapse prevention: What would early warning signs look like?
4. Career reflection homework: Where do you want to be in 1 year?
5. Continue weekly date night and lunch breaks
6. GAD-7 next visit
7. Follow up in 1 week — discuss spacing sessions`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(davidDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // CARMEN ALVAREZ — Postpartum depression, Sertraline 50mg
  // PHQ-9: 19 -> 17 -> 16 -> 15 (struggling)
  // ==========================================================================
  {
    id: "note-carmen-alvarez-1",
    patient_id: "carmen-alvarez",
    appointment_id: "apt-carmen-alvarez-1",
    date_of_service: carmenDates[0]!,
    note_type: "progress_note",
    subjective: `Patient is tearful from the start of session. "I love my baby but sometimes I feel nothing. I go through the motions — feed, change, hold — but I feel like a robot." Reports intrusive thoughts about being a bad mother. Sleep is severely disrupted — baby wakes every 2-3 hours, and patient cannot fall back asleep after feedings due to anxiety. "I lie there wondering if I'm going to ruin her life." Reports her husband is supportive but she hides how bad it is. "He'd be scared if he knew." Sertraline 50mg started 2 weeks ago. "I don't feel any different yet."`,
    objective: `Appearance: Disheveled, dark circles, hair unwashed. Affect: Tearful, blunted, intermittent emotional connection. Mood: "Empty." Speech: Slow, effortful. Thought process: Self-deprecating, ruminative on maternal inadequacy. Denies SI but reports "I understand why some women leave." Denies HI toward infant — "Never. That terrifies me just to think about." PHQ-9: 19 (moderately severe depression). Edinburgh Postnatal Depression Scale: 18.`,
    assessment: `F53.0 Postpartum Depression, moderately severe. PHQ-9 at 19 indicates significant depressive episode in postpartum context. The "I understand why some women leave" statement warrants monitoring — currently no active SI but suggests desperation. Bonding concerns (robotic caregiving, emotional numbness) are common in PPD and typically improve with treatment. Sertraline 50mg at 2 weeks may be subtherapeutic — PPD often requires higher doses. Sleep deprivation is compounding depressive symptoms. High priority case.`,
    plan: `1. Sertraline 50mg — plan to increase to 100mg at 4-week mark if insufficient response
2. Safety assessment: No active SI/HI/infant harm thoughts. Husband should be aware of severity — encourage disclosure with support
3. Sleep: Husband to take one nighttime feeding (pumped milk or formula) — patient needs a 5-hour sleep block
4. Behavioral activation: One non-baby activity per day (walk, shower, call a friend)
5. Psychoeducation: PPD is a medical condition, not a moral failing
6. Follow up with OB for coordination
7. PHQ-9 at each visit — flagged as high priority
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 58,
    signed_at: toISO(carmenDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-carmen-alvarez-2",
    patient_id: "carmen-alvarez",
    appointment_id: "apt-carmen-alvarez-2",
    date_of_service: carmenDates[1]!,
    note_type: "progress_note",
    subjective: `Patient reports she told her husband how she was feeling. "He cried. He said he had no idea it was that bad. He's been taking the midnight feeding now." Getting one 4-5 hour sleep block which is "life-changing." Still feels detached from the baby some days. "But yesterday she smiled at me and I felt something. That was the first real feeling in weeks." Reports the "women who leave" thought has not returned. Went for two walks this week. "My mom came over and watched the baby. I just walked around the block and cried. But it was a release, not a breakdown."`,
    objective: `Appearance: Slightly improved — hair clean, clothes changed. Affect: Tearful but more emotionally present. Mood: "Struggling but not drowning." Speech: Slightly more fluent. Thought process: Less self-deprecating, beginning to distinguish PPD from personal failure. No SI/HI. PHQ-9: 17 (moderately severe, minimal improvement). Sleep improved.`,
    assessment: `F53.0 Postpartum Depression. PHQ-9 at 17 — only 2-point improvement despite improved sleep and social support. Sertraline 50mg at 3 weeks showing minimal antidepressant effect. The bonding moment (baby's smile) is encouraging — suggests capacity is there but inhibited by depression. Husband disclosure was a positive step. Walking and emotional release suggest emerging coping. However, response to medication is insufficient. Plan to increase Sertraline.`,
    plan: `1. Increase Sertraline to 75mg daily (interim step before 100mg target)
2. Continue husband taking one nighttime feeding — sleep is priority
3. Mom support: Schedule regular help (2x/week if possible)
4. Bonding: Baby massage, skin-to-skin time — focus on sensory connection, not emotional performance
5. Continue walks — increase to daily if possible
6. Monitor for worsening — safety check at each visit
7. PHQ-9 next visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(carmenDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-carmen-alvarez-3",
    patient_id: "carmen-alvarez",
    appointment_id: "apt-carmen-alvarez-3",
    date_of_service: carmenDates[2]!,
    note_type: "progress_note",
    subjective: `Patient reports "some good days and some bad days — mostly bad." Sertraline increased to 75mg is causing nausea. "I feel sick on top of depressed." Had a "breakdown" on Wednesday — "I just sobbed for an hour. The baby was fine, she was sleeping, but I couldn't stop." Mom came over 2x as planned but patient felt guilty. "She has her own life. I shouldn't need help." Bonding moments are slightly more frequent. "She grabbed my finger today and I held on." But overall mood remains very low. "Some days I wonder if she'd be better off with someone else."`,
    objective: `Appearance: Fatigued, tearful. Affect: Depressed, constricted but moments of warmth when describing baby. Mood: "Terrible most days." Speech: Slow. Thought process: Self-deprecating, guilt-laden. Passive ideation: "She'd be better off" — not suicidal but bonding impairment. No active SI/HI. PHQ-9: 16 (moderately severe). Nausea from Sertraline dose increase.`,
    assessment: `F53.0 Postpartum Depression, persistent. PHQ-9 at 16, only 3-point decrease from baseline 19 over 3 weeks. Response to Sertraline is slower than desired. The "better off without me" cognition is typical PPD but requires monitoring. Guilt about accepting help is maintaining isolation. Nausea from dose increase should resolve in 7-10 days. This case may require Sertraline increase to 100mg or augmentation if insufficient response at next visit. Consider referral to postpartum support group.`,
    plan: `1. Continue Sertraline 75mg — increase to 100mg next week if nausea resolves
2. Nausea management: Take with food, ginger tea
3. Address guilt about help: Reframe as investing in baby's wellbeing through own health
4. Safety check: "Better off without me" is not SI but must be monitored closely
5. Postpartum support group referral — connection with other PPD mothers
6. Continue bonding exercises — no pressure to feel a certain way
7. PHQ-9 next visit — if no improvement, discuss medication change or augmentation
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 58,
    signed_at: toISO(carmenDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-carmen-alvarez-4",
    patient_id: "carmen-alvarez",
    appointment_id: "apt-carmen-alvarez-4",
    date_of_service: carmenDates[3]!,
    note_type: "progress_note",
    subjective: `Patient reports mixed week. "The nausea is gone, finally." One slightly better day — "I took the baby to the park. It was hard to leave the house but once we were there, it was okay." Then two very bad days. "I didn't get out of bed except to care for her. My husband took over the rest." Reports the "better off" thought came back once. "I caught it and told myself that's the depression talking. But it still felt true." Attended one postpartum support group session. "It helped to know I'm not the only one feeling this way." Sleep still disrupted despite husband's help.`,
    objective: `Appearance: Variable — arrived in workout clothes which may indicate attempt at self-care or simply convenient dressing. Affect: Subdued, intermittently tearful, showed engagement when discussing support group. Mood: "Up and down but mostly down." Speech: Slow but more words than recent sessions. Thought process: Self-aware of depressive cognitions but unable to fully challenge them. PHQ-9: 15 (moderately severe, minimal improvement). No active SI. "Better off" thought acknowledged as PPD symptom.`,
    assessment: `F53.0 Postpartum Depression, persistent, treatment-resistant trajectory. PHQ-9 at 15 — total reduction of only 4 points from baseline 19 over 4 weeks. Sertraline response is suboptimal. While patient is engaging in treatment (support group, bonding exercises, accepting help), depressive symptoms remain significant. Recommend increasing Sertraline to 100mg. If insufficient response at 100mg after 2 weeks, will discuss adding augmentation agent or switching to an SNRI. Safety monitoring continues.`,
    plan: `1. Increase Sertraline to 100mg daily — this is the minimum target dose for PPD
2. If no meaningful improvement at 100mg after 2 weeks, discuss augmentation (Bupropion) or switch to Venlafaxine
3. Continue postpartum support group — weekly attendance
4. Safety plan: Husband knows to contact office if patient expresses hopelessness
5. Continue husband/mom support for sleep and respite
6. Bonding: Focus on what IS happening (finger grab, park trip) not what "should" be happening
7. PHQ-9 next visit — decision point for medication strategy
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 58,
    signed_at: toISO(carmenDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // KEVIN RHODES — MDD + substance history, Bupropion 300mg
  // PHQ-9: 20 -> 17 -> 14 -> 12
  // ==========================================================================
  {
    id: "note-kevin-rhodes-1",
    patient_id: "kevin-rhodes",
    appointment_id: "apt-kevin-rhodes-1",
    date_of_service: kevinDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports depression is "heavy" and sobriety feels precarious. "I'm 14 months clean but this depression makes me want to use. Not to get high — just to feel something." Attending AA 3x/week. "My sponsor says I need to work the steps harder but I think this is beyond willpower." Bupropion 300mg — reports it helps with energy somewhat but mood remains very low. Sleep is poor — 5 hours, early morning awakening. Appetite is variable. "Some days I don't eat until dinner." Reports triggers: loneliness on weekends, payday (used to spend on drugs).`,
    objective: `Appearance: Casual, clean. Affect: Flat, dysphoric. Mood: "Dark." Speech: Monotone, low volume. Thought process: Preoccupied with substance cravings, negative self-concept. Denies active SI — "I'm too stubborn to go there." No HI. PHQ-9: 20 (severe depression). Reports strong cravings but no recent use. Track marks well-healed.`,
    assessment: `F33.2 MDD, recurrent, severe, with F10.20 Alcohol Use Disorder in sustained remission (14 months). PHQ-9 at 20 indicates severe depression. Dual-diagnosis presentation. Depression is the primary relapse risk — patient explicitly connects mood to cravings. Bupropion 300mg is appropriate for MDD+SUD (low abuse potential, aids craving reduction) but may be insufficient as monotherapy. AA attendance is a protective factor. Need to address weekend isolation and develop alternative coping beyond 12-step work.`,
    plan: `1. Continue Bupropion 300mg — consider augmentation with SSRI if insufficient improvement in 2 weeks
2. Relapse prevention: Weekend plan — schedule one sober social activity each weekend
3. Triggers: Payday — have sponsor hold ATM card for 24 hours after deposit
4. AA: Continue 3x/week — add SMART Recovery meeting for CBT-based approach
5. Behavioral activation: One pleasurable activity per day (music, cooking, walking)
6. Meal structure: At least 2 meals daily — set phone alarms
7. PHQ-9 at each visit, substance use check at each visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(kevinDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-kevin-rhodes-2",
    patient_id: "kevin-rhodes",
    appointment_id: "apt-kevin-rhodes-2",
    date_of_service: kevinDates[1]!,
    note_type: "progress_note",
    subjective: `Patient reports a difficult weekend but no use. "Saturday was rough. Everyone was out having fun and I was alone in my apartment. I almost called my old dealer. Instead I called my sponsor and went to a meeting." Used the payday strategy — "It felt infantile but it worked. By the next day the urge was gone." Tried SMART Recovery once. "It's different from AA — more practical. I liked it." Eating more regularly with the phone alarms. Sleep still poor. Mood: "Maybe slightly less terrible?"`,
    objective: `Appearance: Same as last visit. Affect: Slightly more animated, particularly when discussing SMART Recovery. Mood: "Still depressed but fighting." Speech: Low volume but slightly more engaged. Thought process: Problem-solving emerging alongside depressive cognitions. No SI/HI. No substance use. PHQ-9: 17 (moderately severe, improved).`,
    assessment: `F33.2 MDD, recurrent, severe (improving). PHQ-9 at 17, 3-point reduction. Patient demonstrated effective relapse prevention by calling sponsor instead of dealer — a critical behavioral choice. Engagement with SMART Recovery adds cognitive-behavioral framework to 12-step support. Bupropion may be beginning to take fuller effect. Weekend isolation remains the primary risk period.`,
    plan: `1. Continue Bupropion 300mg — reassess augmentation next visit
2. Weekend plan: Saturday morning hike group (sober meetup) — research options this week
3. Continue SMART Recovery + AA combination
4. Relapse prevention: Write out the "almost called dealer" scenario as a coping narrative — what worked, what to replicate
5. Continue meal alarms and behavioral activation
6. PHQ-9 next visit, substance check
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: toISO(kevinDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-kevin-rhodes-3",
    patient_id: "kevin-rhodes",
    appointment_id: "apt-kevin-rhodes-3",
    date_of_service: kevinDates[2]!,
    note_type: "progress_note",
    subjective: `Positive shift. "I went on the Saturday hiking group. Met three people in recovery. We exchanged numbers." Reports weekend was "the least depressed I've been on a Saturday in months." No cravings this week. Sleep improving slightly — 5.5 hours. "The hiking knocked me out Saturday night — slept 7 hours." Writing the coping narrative was "powerful — seeing it on paper makes it real that I CAN choose differently." Eating 2 meals daily consistently. Started cooking again. "I made my grandmother's soup recipe."`,
    objective: `Appearance: Improved — more color, slight smile during hiking discussion. Affect: Broader range, some lightness. Mood: "Getting there." Speech: More spontaneous. Thought process: Positive self-reference emerging ("I CAN choose differently"). No SI/HI. No cravings. PHQ-9: 14 (moderate, continued improvement).`,
    assessment: `F33.2 MDD, recurrent, now moderate. PHQ-9 at 14, 6-point improvement from baseline. Social connection (hiking group, new contacts) appears to be a significant mood lifter. No cravings this week for first time in treatment. Cooking grandmother's recipe suggests reconnection with pre-addiction identity. Bupropion 300mg appears to be reaching adequate efficacy with behavioral interventions. Augmentation may not be necessary if trajectory continues.`,
    plan: `1. Continue Bupropion 300mg — hold on augmentation given positive trajectory
2. Continue Saturday hiking group — this is a breakthrough
3. Continue SMART Recovery + AA
4. Explore identity beyond addiction: What did you enjoy before substances?
5. Continue cooking — connection to family heritage is therapeutic
6. Sleep: Add consistent wake time to improve sleep architecture
7. PHQ-9 next visit, substance check
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(kevinDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-kevin-rhodes-4",
    patient_id: "kevin-rhodes",
    appointment_id: "apt-kevin-rhodes-4",
    date_of_service: kevinDates[3]!,
    note_type: "progress_note",
    subjective: `Patient reports continued improvement. "I had dinner with the hiking group people on Wednesday. It's the first time I've had friends who aren't from AA or my using days." No cravings. Sleep is 6 hours — "Better but not great." Explored pre-addiction interests: "I used to play guitar. I haven't touched it since I started using. It's sitting in my closet." Mood is "lighter — not happy exactly, but not drowning." Reports 15 months sober milestone this week. "That matters to me more now than it did at 14 months."`,
    objective: `Appearance: Noticeably improved — stood taller, better grooming. Affect: Wider range, occasional genuine humor. Mood: "Lighter." Speech: Normal volume, more prosody. Thought process: Forward-looking, identity exploration active. No SI/HI. No cravings. PHQ-9: 12 (moderate, continued improvement).`,
    assessment: `F33.2 MDD, recurrent, moderate, improving. PHQ-9 at 12, total 8-point reduction. Patient is building a recovery-supportive social network outside 12-step contexts. Guitar interest represents identity reconstruction — a critical component of sustained recovery. Sobriety milestone carrying increased meaning suggests deepening commitment. Bupropion monotherapy appears adequate. Continue current approach.`,
    plan: `1. Continue Bupropion 300mg
2. Guitar: Get it out of the closet. Play one song this week — no pressure for quality
3. Continue hiking group and new friendships
4. Relapse prevention: Update plan with new coping resources (hiking, cooking, friends)
5. Continue SMART Recovery + AA
6. Celebrate 15 months — acknowledge the work
7. PHQ-9 next visit, substance check
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(kevinDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // PRIYA SHARMA — OCD, Fluvoxamine 200mg
  // GAD-7: 16 -> 13 -> 10 -> 8
  // ==========================================================================
  {
    id: "note-priya-sharma-1",
    patient_id: "priya-sharma",
    appointment_id: "apt-priya-sharma-1",
    date_of_service: priyaDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports contamination obsessions remain prominent. "I washed my hands until they cracked and bled last Tuesday. I knew it was too much but I couldn't stop." Spends approximately 2 hours daily on rituals (handwashing, checking that stove/locks are off). ERP homework from last session: touched doorknob without washing for 5 minutes. "The anxiety was a 9 out of 10 but I did it. Then I washed for 20 minutes after." Reports Fluvoxamine 200mg is "helping the background noise but the spikes are still intense." Avoids public restrooms, shaking hands, and shared food.`,
    objective: `Appearance: Hands chapped and reddened. Affect: Anxious, distressed when discussing contamination. Mood: "Frustrated." Speech: Rapid during obsession descriptions. Thought process: Intrusive contamination thoughts with egodystonic quality. No SI/HI. GAD-7: 16 (used as general anxiety proxy; OCD-specific Y-BOCS planned for next session). Ritual time: ~2 hours/day.`,
    assessment: `F42.2 OCD, contamination subtype. GAD-7 at 16 indicates significant anxiety. ERP is progressing but response prevention remains incomplete (20-minute handwash after exposure). Fluvoxamine at 200mg is providing baseline reduction but OCD requires aggressive ERP. The 5-minute doorknob exposure was a meaningful step. Need to build on tolerance while shortening post-exposure ritual time. Hand damage from washing is a physical health concern.`,
    plan: `1. Continue Fluvoxamine 200mg
2. ERP hierarchy: Continue doorknob exposure — increase to 10 minutes, limit post-exposure handwash to 5 minutes
3. Hand care: Prescription-strength hand cream, max 6 handwashes per day (set alarm-based limit)
4. Track ritual time daily — goal: reduce by 15 minutes per week
5. Cognitive work: What does contamination mean? "If I don't wash, then..."
6. Administer Y-BOCS at next session for OCD-specific tracking
7. GAD-7 at each visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(priyaDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-priya-sharma-2",
    patient_id: "priya-sharma",
    appointment_id: "apt-priya-sharma-2",
    date_of_service: priyaDates[1]!,
    note_type: "progress_note",
    subjective: `Patient completed doorknob exposure for 10 minutes 4 times this week. "The anxiety peaked at 8 the first time but by the fourth it was a 6." Post-exposure handwash down to 8 minutes (from 20). Ritual time decreased to approximately 1.5 hours daily. "I caught myself checking the stove and stopped at 2 checks instead of 5." Hands are healing with the prescription cream. Completed the "If I don't wash, then..." thought chain: "Something bad will happen to my family." Reports insight: "I know that's irrational but it feels completely true in the moment."`,
    objective: `Appearance: Hands still reddened but less cracked. Affect: Anxious but more engaged than last session. Mood: "Determined." Speech: Normal rate. Thought process: Able to observe obsessive thoughts with some distance. No SI/HI. GAD-7: 13 (moderate, improved). Ritual time: ~1.5 hours/day (down from 2).`,
    assessment: `F42.2 OCD. GAD-7 at 13. ERP is producing measurable habituation — SUDS declining across repeated exposures. Post-exposure ritual time decreasing. Stove-checking reduction (5 to 2) was self-initiated, indicating internalization of response prevention principles. The thought chain reveals magical thinking linking contamination to family harm — a common OCD theme. Continue ERP with progressive exposures.`,
    plan: `1. Continue Fluvoxamine 200mg
2. ERP: Add new exposure — eat a snack without handwashing first (using clean plate/utensil)
3. Continue doorknob exposure — aim for SUDS below 5
4. Post-exposure handwash: Target 3 minutes maximum
5. Stove checking: Limit to 1 check using "checking is done" verbal cue
6. Cognitive defusion: "I'm having the OCD thought that my family will be harmed" vs believing it
7. GAD-7 next visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: toISO(priyaDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-priya-sharma-3",
    patient_id: "priya-sharma",
    appointment_id: "apt-priya-sharma-3",
    date_of_service: priyaDates[2]!,
    note_type: "progress_note",
    subjective: `Ate a snack without washing hands first on 3 occasions. "The first time I nearly threw up from anxiety. The third time it was just uncomfortable." Ritual time down to about 1 hour daily. Doorknob exposure SUDS now at 4-5. "I'm starting to believe nothing bad actually happens." Stove checking at 1 check. "I say 'checking is done' out loud and walk away. Sometimes I want to go back but I don't." Used a public restroom for the first time in months. "I was at the mall and I just... did it. I used paper towels on the handle and washed normally. My old self would have left the mall entirely."`,
    objective: `Appearance: Hands notably improved. Affect: More confident, prideful about mall restroom. Mood: "Winning." Speech: Animated. Thought process: Increased metacognitive awareness — distinguishing OCD thoughts from self. No SI/HI. GAD-7: 10 (moderate, continued improvement). Ritual time: ~1 hour/day.`,
    assessment: `F42.2 OCD, improving. GAD-7 at 10. Ritual time reduced from 2 hours to 1 hour daily — 50% reduction. The public restroom use was a spontaneous exposure representing significant avoidance reduction. Snack-without-washing exposures are challenging the core contamination fear directly. The verbal cue "checking is done" is an effective response prevention tool. OCD is becoming ego-dystonic (patient distinguishes OCD from self). Continue progressive ERP.`,
    plan: `1. Continue Fluvoxamine 200mg
2. ERP: Add handshaking exposure — shake hands with therapist, then resist washing for 15 minutes
3. Continue snack-without-washing — aim for daily
4. Public restroom: Repeat 2x this week
5. Ritual time goal: Under 45 minutes daily
6. Introduce contamination hierarchy chart — rank all avoided situations, work upward
7. GAD-7 next visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: toISO(priyaDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-priya-sharma-4",
    patient_id: "priya-sharma",
    appointment_id: "apt-priya-sharma-4",
    date_of_service: priyaDates[3]!,
    note_type: "progress_note",
    subjective: `Patient shook therapist's hand at session start — "I practiced with colleagues at work this week. Three handshakes, no washing after for 30 minutes." Ritual time is approximately 40-45 minutes daily. "I still have the thoughts but they feel quieter. Like someone turned the volume down." Used public restroom twice. "Still uncomfortable but not panic-level." Reports her sister noticed the improvement: "She said my hands look normal for the first time in years." Snacking without handwashing is now routine. "I just... eat. Like a normal person."`,
    objective: `Appearance: Hands appear healthy — no cracking or redness. Initiated handshake at session start. Affect: Confident, proud. Mood: "Strong." Speech: Normal. Thought process: Obsessive thoughts present but reduced in frequency and intensity. No SI/HI. GAD-7: 8 (mild anxiety). Ritual time: ~40-45 min/day.`,
    assessment: `F42.2 OCD, significant improvement. GAD-7 at 8, representing 50% reduction from baseline. Ritual time down from 2 hours to 40-45 minutes. Contamination avoidance behaviors are being systematically dismantled. The spontaneous work handshakes demonstrate real-world generalization of ERP skills. Hand health has recovered. Continue progressive hierarchy work.`,
    plan: `1. Continue Fluvoxamine 200mg
2. ERP: Move up hierarchy — eat shared food at a potluck or restaurant
3. Continue all current exposures as maintenance
4. Ritual time goal: Under 30 minutes daily
5. Discuss long-term OCD management: This is managed, not cured — relapse prevention
6. Contamination hierarchy: Review and identify next targets
7. GAD-7 next visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(priyaDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // ROBERT FITZGERALD — Grief/bereavement, no meds
  // PHQ-9: 12 -> 10 -> 8 -> 6
  // ==========================================================================
  {
    id: "note-robert-fitzgerald-1",
    patient_id: "robert-fitzgerald",
    appointment_id: "apt-robert-fitzgerald-1",
    date_of_service: robertDates[0]!,
    note_type: "progress_note",
    subjective: `Patient continues to grieve wife of 42 years who passed 6 months ago from ovarian cancer. "The house is so quiet. I talk to her picture sometimes. Is that crazy?" Reports difficulty with daily routines — meals are erratic, often eating cereal for dinner. "She did all the cooking. I never learned." Sleep disrupted — wakes at 3 AM, reaches for her side of the bed. "The worst part is that split second when I forget she's gone, then it hits me all over again." Reports children are supportive but live out of state. "They call every day but it's not the same as having someone here."`,
    objective: `Appearance: Neatly dressed but clothes appear loose (weight loss noted). Affect: Sad, tearful when discussing wife, but warm when sharing memories. Mood: "Lonely." Speech: Slow, measured, becomes soft during emotional content. Thought process: Grief-focused but organized. No SI — "She'd be furious if I gave up." No HI. PHQ-9: 12 (moderate). Weight loss of approximately 10 pounds since last visit.`,
    assessment: `Z63.4 Uncomplicated bereavement, complicated by depressive symptoms. PHQ-9 at 12 indicates moderate depressive symptoms in context of spousal loss. Talking to her picture is a normal grief behavior, not pathological. Weight loss and meal disruption are concerning from a nutritional standpoint — patient lives alone and lacks cooking skills. The 3 AM awakening with momentary forgetting is characteristic of grief. Protective factors: Children's support, stated commitment to life ("She'd be furious"). Focus on meaning-making, continuing bonds, and practical daily living skills.`,
    plan: `1. No medication at this time — grief is not depression, though overlap exists
2. Meaning-making: Bring a photo or object of hers to next session — share a story
3. Practical: Cooking class for widowers at community center (explore availability)
4. Meals: Meal delivery service for 2 weeks to ensure nutrition while building cooking skills
5. Continuing bonds: Writing letters to wife in a journal is okay and therapeutic
6. Social connection: One outing per week — church, community center, neighbor visit
7. PHQ-9 at each visit — monitor for transition to clinical depression
8. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(robertDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-robert-fitzgerald-2",
    patient_id: "robert-fitzgerald",
    appointment_id: "apt-robert-fitzgerald-2",
    date_of_service: robertDates[1]!,
    note_type: "progress_note",
    subjective: `Patient brought wife's gardening gloves. "She loved her garden. I've let it go since she died. I thought maybe I could try to tend it." Signed up for meal delivery and has been eating more regularly. "The food is decent. Not like hers, but it's food." Found a widowers' group at his church — goes this Thursday. "My neighbor goes. He lost his wife two years ago. He said it helps." Wrote two letters to his wife this week. "I told her about the garden idea. I think she'd like that." Sleep unchanged but "I'm not as scared of the 3 AM wakes now. I just lie there and think about her."`,
    objective: `Appearance: Same neatly dressed presentation, slightly less gaunt. Affect: Sad but warmer, animated when discussing garden plans. Mood: "Missing her but trying." Speech: More fluent than last session. Thought process: Grief present but emerging engagement with life activities. No SI/HI. PHQ-9: 10 (moderate, improved). Weight stable with meal delivery.`,
    assessment: `Z63.4 Bereavement. PHQ-9 at 10, improving. The garden plan represents a meaningful continuing bond — tending something she loved. Meal delivery is addressing nutritional needs. Widowers' group provides peer support from someone with shared experience. Letter-writing is healthy continuing bond practice. The shift in 3 AM experience from distress to peaceful reflection is a meaningful grief process marker.`,
    plan: `1. Continue no medication
2. Garden: Start small — one flower bed, one week. The goal is connection to her, not perfection
3. Attend widowers' group Thursday — report back on experience
4. Continue meal delivery and letter-writing
5. Meaning-making: What would she want for you going forward?
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(robertDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-robert-fitzgerald-3",
    patient_id: "robert-fitzgerald",
    appointment_id: "apt-robert-fitzgerald-3",
    date_of_service: robertDates[2]!,
    note_type: "progress_note",
    subjective: `Patient planted tulip bulbs in his wife's garden. "She always said tulips were the first sign of hope after winter. I figured it was fitting." Attended widowers' group. "I almost didn't go. But Frank — my neighbor — drove me. The other men understood. I didn't have to explain why I'm sad." Reports feeling "less alone." Ate dinner with his daughter (she visited this weekend). "She cried when she saw the garden. Good tears." Sleep improved to 6 hours. "I'm not reaching for her side anymore. I know she's not there. But I keep her pillow."`,
    objective: `Appearance: Brighter, slight tan from gardening. Affect: Sad but with genuine warmth and moments of peace. Mood: "Bittersweet." Speech: More animated, longer sentences. Thought process: Integrative — holding grief and hope simultaneously. No SI/HI. PHQ-9: 8 (mild, continued improvement). Weight stable.`,
    assessment: `Z63.4 Bereavement, progressing through grief. PHQ-9 at 8. The tulip planting is a beautiful continuing bond metaphor that the patient identified independently. Widowers' group is providing crucial peer support. Daughter visit and shared tears over garden represent family healing. The shift from reaching for wife's side to keeping her pillow shows acceptance without erasure — a healthy grief integration. Sleep and appetite improving in parallel with emotional processing.`,
    plan: `1. Continue no medication — symptoms trending toward healthy grief resolution
2. Continue garden — expand as it feels right
3. Continue widowers' group — weekly
4. Meaning-making: What are you learning about yourself through this grief?
5. Consider: Volunteer at church garden? Combine social connection with meaningful activity
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(robertDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-robert-fitzgerald-4",
    patient_id: "robert-fitzgerald",
    appointment_id: "apt-robert-fitzgerald-4",
    date_of_service: robertDates[3]!,
    note_type: "progress_note",
    subjective: `Patient reports "the best week since she died, which feels weird to say." Volunteered at church garden committee. "They needed someone who knew about tulips. Margaret would have laughed — I learned everything from her." Cooked a simple meal for the first time. "Scrambled eggs and toast. It's not Thanksgiving dinner but I did it myself." Widowers' group is now "something I look forward to, not dread." Sleep is 7 hours. "I still miss her every day. I think I always will. But I'm starting to see that missing her and living my life aren't mutually exclusive."`,
    objective: `Appearance: Tanned, healthy weight appearance, genuine smile. Affect: Warm, peaceful, full range including appropriate sadness. Mood: "Hopeful." Speech: Spontaneous, normal. Thought process: Integrative, wise. No SI/HI. PHQ-9: 6 (mild). Physical health improved.`,
    assessment: `Z63.4 Bereavement, healthy grief integration. PHQ-9 at 6, 50% reduction from baseline. Patient is demonstrating dual-process model of grief — oscillating between loss-orientation and restoration-orientation. The insight about missing and living coexisting is a marker of healthy grief integration. Community re-engagement (church, group, volunteer) is building a post-loss identity. Begin discussing treatment completion.`,
    plan: `1. Continue no medication
2. Discuss treatment arc: 3-4 more sessions focused on consolidation and relapse prevention
3. Continue garden, widowers' group, church volunteer
4. Cooking: Try one new recipe per week — meal delivery as backup
5. Anticipatory guidance: Holidays, anniversary, birthday will be hard — plan ahead
6. PHQ-9 next visit
7. Follow up in 1 week — discuss session spacing`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(robertDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // AALIYAH BROOKS — Social anxiety, no meds
  // GAD-7: 11 -> 9 -> 7 -> 5
  // ==========================================================================
  {
    id: "note-aaliyah-brooks-1",
    patient_id: "aaliyah-brooks",
    appointment_id: "apt-aaliyah-brooks-1",
    date_of_service: aaliyahDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports social anxiety continues to limit college experience. "I sit in the back of every class and never raise my hand. I know the answers but what if I'm wrong and everyone stares?" Avoids dining hall — eats in her dorm room. "The idea of sitting with strangers makes me sick." Had a panic-level response when called on in psychology class. "I froze. People looked at me. My face went red. I wanted to disappear." No medications — previously declined. Reports one close friend from high school. "She's the only person I'm normal around."`,
    objective: `Appearance: Quiet presentation, minimal eye contact initially, improved throughout session. Affect: Anxious, guarded. Mood: "Nervous." Speech: Soft, brief responses that expanded with comfort. Thought process: Focused on others' evaluation, catastrophic social predictions. No SI/HI. GAD-7: 11 (moderate anxiety). Demonstrates avoidance of social evaluation situations.`,
    assessment: `F40.10 Social Anxiety Disorder, moderate. GAD-7 at 11. College context amplifies social exposure demands. Safety behaviors (back of class, eating alone, avoiding eye contact) are maintaining the anxiety by preventing disconfirmation of feared outcomes. The classroom freeze suggests high physiological arousal in evaluation situations. The one close friendship demonstrates intact social capacity when anxiety is low. Treatment focus: graded exposure to social evaluation, behavioral experiments, cognitive restructuring around feared evaluation.`,
    plan: `1. No medication at this time — trial of CBT first
2. Exposure hierarchy: Start small — sit in the middle of one class this week (not front, just middle)
3. Behavioral experiment: Ask one question after class to a professor (private, low risk)
4. Dining hall exposure: Go during off-peak hours with friend, eat one meal
5. Cognitive work: What's the worst that happens if you answer wrong? How likely? How bad, really?
6. Relaxation: Box breathing before high-anxiety situations
7. GAD-7 at each visit
8. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(aaliyahDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-aaliyah-brooks-2",
    patient_id: "aaliyah-brooks",
    appointment_id: "apt-aaliyah-brooks-2",
    date_of_service: aaliyahDates[1]!,
    note_type: "progress_note",
    subjective: `Patient sat in the middle of class twice. "Nobody cared where I sat. I was so focused on this being A Thing and it wasn't." Asked professor a question after class — "She was really nice about it. She said she wished more students asked questions." Went to dining hall with friend during off-peak. "We sat in the corner but I ate there. It was loud and weird but fine." Reports a new challenge: group project assigned. "I have to work with three people I don't know. I almost asked to do it solo."`,
    objective: `Appearance: Slightly more relaxed, made eye contact more frequently. Affect: Still anxious but showed pride in exposures. Mood: "Nervous but kind of proud." Speech: Louder, more words per response. Thought process: Less focused on evaluation, more on behavioral outcomes. No SI/HI. GAD-7: 9 (mild-moderate, improved).`,
    assessment: `F40.10 Social Anxiety Disorder, improving. GAD-7 at 9. Behavioral experiments are producing disconfirmatory evidence — sitting in the middle was unremarkable, professor was welcoming. These experiences are directly challenging feared outcomes. The group project represents a natural exposure opportunity. Continue graded approach.`,
    plan: `1. Continue no medication
2. Group project: Attend first meeting. Goal: introduce yourself and contribute one idea
3. Continue sitting in middle of classes — aim for all classes this week
4. Dining hall: Go once without friend — sit near others, eat, leave
5. Cognitive restructuring: Post-mortem after each exposure — what happened vs what you predicted
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(aaliyahDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-aaliyah-brooks-3",
    patient_id: "aaliyah-brooks",
    appointment_id: "apt-aaliyah-brooks-3",
    date_of_service: aaliyahDates[2]!,
    note_type: "progress_note",
    subjective: `Group project meeting went well. "I introduced myself and said one idea. A guy named Marcus said it was a good idea. I almost died of shock." Went to dining hall alone — "I sat at a small table and ate my lunch. I was anxious the whole time but nobody looked at me weird." Sat in the middle of all classes. "It's becoming normal. I can't believe how much energy I was spending on seat selection." Reports she raised her hand in class for the first time. "The professor said 'great point' and I felt like I could fly."`,
    objective: `Appearance: More open posture, smiled several times, good eye contact. Affect: Lighter, increasing confidence. Mood: "Surprised at myself." Speech: Normal volume, increased spontaneity. Thought process: Post-exposure self-evaluation is becoming more balanced. No SI/HI. GAD-7: 7 (mild anxiety).`,
    assessment: `F40.10 Social Anxiety Disorder, notably improving. GAD-7 at 7. The hand-raising and positive professor response is a watershed moment — the core feared scenario (public evaluation) occurred and the outcome was positive. Group project collaboration is building social skills in a structured context. Solo dining hall visit demonstrates growing independence from safety behaviors. Rapid response to exposure-based treatment is typical of younger patients with shorter symptom duration.`,
    plan: `1. Continue no medication
2. Raise hand in class at least once per week — normalize it
3. Group project: Take on a collaborative task (not just solo work within the group)
4. Social expansion: Sit with someone new at dining hall — introduce yourself
5. Cognitive: Start noticing how often people are NOT paying attention to you
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(aaliyahDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-aaliyah-brooks-4",
    patient_id: "aaliyah-brooks",
    appointment_id: "apt-aaliyah-brooks-4",
    date_of_service: aaliyahDates[3]!,
    note_type: "progress_note",
    subjective: `Patient reports a "normal college week" with a big smile. Raised hand twice in classes. "It's getting easier. My heart still races but I do it." Group project members invited her to study together. "I went. We got coffee after. I think I might be making friends?" Sat with a classmate at dining hall — "She's in my bio class. We talked about the midterm. It was just... normal." Reports friend from home noticed the change. "She said I seem happier. I think she's right."`,
    objective: `Appearance: Bright, more colorful clothing, open body language. Affect: Warm, genuine, full range. Mood: "Happy — actually happy." Speech: Spontaneous, normal volume, even initiated topics. Thought process: Social cognitions are more balanced — less evaluation focus, more connection focus. No SI/HI. GAD-7: 5 (mild, approaching subclinical).`,
    assessment: `F40.10 Social Anxiety Disorder, mild, approaching remission. GAD-7 at 5, representing 55% reduction from baseline. Patient is developing organic social connections through structured exposure that generalized naturally. The study group coffee is spontaneous social engagement — a qualitative shift from avoidance. Treatment has been remarkably responsive. Discuss maintenance and relapse prevention.`,
    plan: `1. Continue no medication
2. Maintain all social behaviors — these are now habits to protect
3. New challenge: Join one campus club or activity that interests you
4. Relapse prevention: Identify situations that might trigger avoidance regression
5. Discuss transitioning to biweekly sessions
6. GAD-7 next visit
7. Follow up in 1 week — discuss session spacing`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(aaliyahDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // DANIEL PARK — Panic disorder, Paroxetine 20mg
  // GAD-7: 15 -> 12 -> 9 -> 7
  // ==========================================================================
  {
    id: "note-daniel-park-1",
    patient_id: "daniel-park",
    appointment_id: "apt-daniel-park-1",
    date_of_service: danielDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports 3 panic attacks this week. "The worst was on the subway. I thought I was having a heart attack — chest pain, couldn't breathe, hands tingling. I got off two stops early and walked 20 blocks." Avoids subways and elevators since. "I take stairs at work — I'm on the 8th floor." Paroxetine 20mg started 3 weeks ago. "I don't know if it's working. Maybe the attacks are slightly less intense?" Reports constant fear of the next attack. "I'm scanning my body all day for signs. Any weird sensation and I think, here it comes."`,
    objective: `Appearance: Well-groomed but tense. Affect: Hypervigilant, anxious. Mood: "On edge." Speech: Rapid when describing attacks, otherwise normal. Thought process: Body-focused, catastrophic interpretation of physical sensations. No SI/HI. GAD-7: 15 (moderate-severe anxiety). Heart rate elevated at start of session (patient self-reported), normalized by mid-session.`,
    assessment: `F41.0 Panic Disorder with agoraphobic avoidance. GAD-7 at 15. Three panic attacks this week with significant anticipatory anxiety and body scanning. Subway and elevator avoidance is expanding the agoraphobic component. Catastrophic misinterpretation of benign physical sensations is the core maintaining mechanism. Paroxetine at 3 weeks may be approaching therapeutic levels. Interoceptive exposure is the key intervention to break the sensation-catastrophe-panic cycle.`,
    plan: `1. Continue Paroxetine 20mg — nearing full therapeutic effect
2. Psychoeducation: Panic cycle diagram — sensation → catastrophic thought → anxiety → more sensations
3. Interoceptive exposure: Practice controlled hyperventilation (30 seconds) to recreate sensations safely
4. Safety behavior elimination: Take elevator at least once this week (start at 1 floor)
5. Body scanning reframe: Notice sensations without interpretation ("my hands are tingling" not "I'm dying")
6. GAD-7 at each visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(danielDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-daniel-park-2",
    patient_id: "daniel-park",
    appointment_id: "apt-daniel-park-2",
    date_of_service: danielDates[1]!,
    note_type: "progress_note",
    subjective: `Practiced controlled hyperventilation in session and at home. "It was terrifying the first time but I survived. By the third time I could say 'this is just adrenaline, not a heart attack.'" Took the elevator 3 times (1 floor). "My heart was pounding but I made it." Two panic attacks this week — "One in a meeting, one while driving. Both peaked and faded within 10 minutes." Subway still avoided. "I'm not ready for that yet." Reports the panic cycle diagram was "a revelation — I could see exactly how I make it worse."`,
    objective: `Appearance: Slightly more relaxed than last visit. Affect: Anxious but more self-aware. Mood: "Cautiously better." Speech: More measured. Thought process: Developing metacognitive awareness of catastrophic interpretations. No SI/HI. GAD-7: 12 (moderate, improved). Panic attacks: 2 (down from 3). Able to tolerate interoceptive sensations in session without escalation.`,
    assessment: `F41.0 Panic Disorder. GAD-7 at 12, improved. Panic frequency reduced to 2/week. Interoceptive exposure is building tolerance to physical sensations. Elevator exposures are progressing. The insight about the panic cycle is crucial — cognitive understanding enables behavioral change. Paroxetine appears to be reaching therapeutic effect (reduced attack intensity). Continue graduated exposure.`,
    plan: `1. Continue Paroxetine 20mg
2. Interoceptive exposure: Add spinning in chair (dizziness), straw breathing (restricted airflow)
3. Elevator: Increase to 3+ floors
4. Subway plan: This week, go to the station. Stand on the platform for 5 minutes. Don't ride yet.
5. Cognitive: When panic hits, label it: "Panic. Not heart attack. It will pass in 10 minutes."
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 53,
    signed_at: toISO(danielDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-daniel-park-3",
    patient_id: "daniel-park",
    appointment_id: "apt-daniel-park-3",
    date_of_service: danielDates[2]!,
    note_type: "progress_note",
    subjective: `One panic attack this week — "And it was short. Like 5 minutes. I labeled it 'panic, not heart attack' and just waited. My coworker didn't even notice." Took elevator to 8th floor twice. "The first time was intense. The second time was just uncomfortable." Went to the subway station, stood on the platform for 10 minutes. "Trains came and went. I wasn't on them but I was there. That's something." Completed dizziness interoceptive exposure. "I spun around and felt dizzy and... nothing terrible happened. Just dizzy."`,
    objective: `Appearance: Relaxed posture, less tense. Affect: Growing confidence, showed humor about elevator experience. Mood: "Making progress." Speech: Normal rate. Thought process: Catastrophic interpretations are being successfully challenged by experience. No SI/HI. GAD-7: 9 (mild anxiety). Panic attacks: 1/week.`,
    assessment: `F41.0 Panic Disorder, significantly improving. GAD-7 at 9. Panic attacks down to 1/week with shorter duration. Interoceptive exposure is producing habituation — dizziness no longer triggers panic cascade. Elevator avoidance resolved. Subway platform visit represents important approach behavior. The ability to have a panic attack unnoticed by coworker demonstrates that catastrophic visibility fears are unfounded. Continue toward full subway exposure.`,
    plan: `1. Continue Paroxetine 20mg
2. Subway: Ride one stop this week. Then get off. That's the whole goal.
3. Continue elevator use — it should now be routine
4. Interoceptive exposure maintenance: 2x/week
5. Cognitive: Track predictions vs. outcomes — "What I feared vs. what happened"
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(danielDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-daniel-park-4",
    patient_id: "daniel-park",
    appointment_id: "apt-daniel-park-4",
    date_of_service: danielDates[3]!,
    note_type: "progress_note",
    subjective: `Patient rode the subway one stop. "I got on, my heart was pounding, I counted the seconds. One minute and forty-two seconds. Then I got off and the world was still there." No panic attacks this week — "First time in... I can't remember. Months?" Elevator is "just an elevator now." Reports his wife noticed: "She said I seem like myself again." Predictions vs. outcomes log: "10 predictions, all wrong. Not one catastrophe materialized." Reports some residual anticipatory anxiety but it's "manageable — I feel it and do the thing anyway."`,
    objective: `Appearance: Relaxed, confident posture. Affect: Bright, full range. Mood: "Really good." Speech: Normal, spontaneous. Thought process: Balanced, reality-based. No SI/HI. GAD-7: 7 (mild anxiety). Zero panic attacks this week.`,
    assessment: `F41.0 Panic Disorder, in significant remission. GAD-7 at 7, reduced from 15 (53% reduction). Zero panic attacks for the first time in treatment. Subway ride achieved. Predictions log provides powerful cognitive evidence against catastrophic thinking. Anticipatory anxiety is present but no longer drives avoidance. Paroxetine 20mg and CBT with interoceptive exposure are producing excellent combined response.`,
    plan: `1. Continue Paroxetine 20mg — discuss maintenance duration
2. Subway: Ride to work 2x this week — expand exposure
3. Relapse prevention: Write panic management card for wallet
4. Continue predictions log for 2 more weeks
5. Discuss transitioning to biweekly sessions
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 48,
    signed_at: toISO(danielDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // MARIA RODRIGUEZ — PTSD, Venlafaxine 150mg + Prazosin 3mg
  // PCL-5: 55 -> 48 -> 42 -> 38
  // ==========================================================================
  {
    id: "note-maria-rodriguez-1",
    patient_id: "maria-rodriguez",
    appointment_id: "apt-maria-rodriguez-1",
    date_of_service: mariaDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports nightmares 5 nights this week despite Prazosin 3mg. "The same dream — I'm back in the house and I can't get out. I wake up screaming and my daughter comes running." Reports significant hypervigilance. "I check the locks 10 times before bed. I installed two new deadbolts last month." Avoids driving past the neighborhood where the assault occurred — adds 30 minutes to her commute. Emotional numbing: "I can't feel happy. Even good things feel flat." Venlafaxine 150mg — "The anxiety is a little less but the nightmares and flashbacks are the same."`,
    objective: `Appearance: Guarded, tense, wearing long sleeves. Affect: Constricted, hypervigilant — startled when AC turned on. Mood: "Surviving." Speech: Controlled, emotionally disconnected when describing trauma symptoms. Thought process: Trauma-focused, hypervigilant cognitions. No SI/HI. PCL-5: 55 (severe PTSD). Prazosin appears insufficient for nightmare control at current dose.`,
    assessment: `F43.10 PTSD, severe. PCL-5 at 55 indicates severe symptomatology across all clusters. Nightmares are poorly controlled despite Prazosin 3mg — may need dose increase. Re-experiencing (nightmares), avoidance (driving detour), hyperarousal (lock-checking), and emotional numbing are all active. The lock-checking may have OCD-like qualities but is more consistent with trauma-related safety behavior. Daughter witnessing nighttime screaming adds family impact. This is a high-acuity case requiring intensive CPT and medication optimization.`,
    plan: `1. Discuss Prazosin increase to 4mg with prescriber — nightmares inadequately controlled
2. Continue Venlafaxine 150mg
3. CPT: Begin ABC worksheet for trauma-related stuck points
4. Identify top 3 stuck points: "The world is dangerous," "I can't protect myself," "It was my fault"
5. Grounding kit: Ice cubes, strong mints, rubber band — keep in purse for flashbacks
6. Safety planning: Lock check limit — 2 checks maximum, then use verbal cue "locks are done"
7. PCL-5 at each visit
8. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 58,
    signed_at: toISO(mariaDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-maria-rodriguez-2",
    patient_id: "maria-rodriguez",
    appointment_id: "apt-maria-rodriguez-2",
    date_of_service: mariaDates[1]!,
    note_type: "progress_note",
    subjective: `Prazosin increased to 4mg — nightmares reduced to 3 this week. "Still bad but not every night." Used grounding kit during a flashback at work — "The ice cube brought me back. My coworker asked if I was okay and I said I had a headache." Completed ABC worksheet. Identified stuck point: "If I'd fought harder, it wouldn't have happened." Reports this thought "runs my life." Lock checking reduced to 3 times (from 10). "It's hard to stop at 2 but I got closer." Driving detour continues. "I'm not ready to go that way yet."`,
    objective: `Appearance: Same guarded presentation. Affect: Slightly more accessible when discussing grounding success. Mood: "Tired of fighting." Speech: More open about trauma content than previous sessions. Thought process: Self-blame prominent, beginning to examine stuck points. No SI/HI. PCL-5: 48 (still severe but improved).`,
    assessment: `F43.10 PTSD, severe, improving. PCL-5 at 48, 7-point decrease. Prazosin 4mg providing better nightmare control. Grounding techniques effective for flashback management in real-world setting. Self-blame stuck point ("If I'd fought harder") is a core cognitive target. Lock checking decreasing. The willingness to disclose flashback coping at work suggests growing trust in treatment relationship.`,
    plan: `1. Continue Prazosin 4mg and Venlafaxine 150mg
2. CPT: Socratic dialogue on "If I'd fought harder" — evidence for/against, what would you tell a friend?
3. Lock checking: Continue reducing — target 2 checks with verbal cue
4. Continue grounding kit
5. Driving route: Not yet — this will be a later exposure target
6. PCL-5 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 58,
    signed_at: toISO(mariaDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-maria-rodriguez-3",
    patient_id: "maria-rodriguez",
    appointment_id: "apt-maria-rodriguez-3",
    date_of_service: mariaDates[2]!,
    note_type: "progress_note",
    subjective: `Emotional session expected. "I did the Socratic questioning on 'If I'd fought harder.' I wrote it all out. I know — logically — that I was overpowered and fighting harder might have gotten me killed. But the guilt..." Reports nightmares 3 times again this week — content shifting. "Instead of being trapped, sometimes now I'm running and I actually get out." Emotional numbing slightly improved — "I laughed at something my daughter said. A real laugh, not a pretend one." Lock checking at 2 times. "I say 'locks are done' and I walk to my bedroom."`,
    objective: `Appearance: Emotional, tearful but engaged. Affect: More accessible — grief, guilt, and moments of lightness all present. Mood: "Raw but working." Speech: Emotionally connected. Thought process: Active cognitive processing of trauma material — guilt is being examined. No SI/HI. PCL-5: 42 (moderate-severe, continued improvement). Nightmare content change is prognostically positive.`,
    assessment: `F43.10 PTSD, improving. PCL-5 at 42, continued downward trajectory. The nightmare content shift (trapped to escaping) is a significant trauma processing indicator — the narrative is being rewritten. Self-blame stuck point is being intellectually challenged; emotional processing is beginning. Emotional numbing lifting (genuine laughter). Lock checking resolved to adaptive level. Treatment is working but this is the hardest phase — sitting with the guilt while releasing it.`,
    plan: `1. Continue Prazosin 4mg and Venlafaxine 150mg
2. CPT: Write trauma impact statement — "How has this trauma changed your beliefs about yourself?"
3. Continue Socratic work on self-blame — add compassion-focused approach
4. Validate: The guilt response is normal even when irrational — be gentle with yourself
5. Continue lock-checking at 2x with verbal cue
6. PCL-5 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 60,
    signed_at: toISO(mariaDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-maria-rodriguez-4",
    patient_id: "maria-rodriguez",
    appointment_id: "apt-maria-rodriguez-4",
    date_of_service: mariaDates[3]!,
    note_type: "progress_note",
    subjective: `Patient brought trauma impact statement. Read it aloud with tears but steady voice. "I wrote: 'This trauma made me believe I was weak and the world was dangerous. But I survived. I'm here. I'm raising my daughter alone and she's thriving. That's not weakness.'" Nightmares 2 times this week and content was less vivid. "I woke up faster and could go back to sleep." Reports she drove past the old neighborhood. "I didn't plan to. I was on autopilot and suddenly I was there. I kept driving. My hands were shaking but I didn't die." Emotional range continues to expand.`,
    objective: `Appearance: More present, eye contact improved. Affect: Full range — tears, determination, surprise about the drive. Mood: "Complicated but alive." Speech: Emotionally connected, stronger. Thought process: Integrating trauma narrative with survivor identity. No SI/HI. PCL-5: 38 (moderate). Nightmares: 2/week (down from 5 at baseline).`,
    assessment: `F43.10 PTSD, moderate, continuing improvement. PCL-5 at 38, representing 17-point total decrease from baseline 55. The trauma impact statement rewrite from "weak" to "survivor" is a core cognitive shift. Unplanned driving through old neighborhood demonstrates reduction in avoidance without prompting. Nightmare frequency and intensity decreasing. Emotional numbing lifting. However, PCL-5 remains above threshold and nightmares persist — continued treatment needed.`,
    plan: `1. Continue Prazosin 4mg and Venlafaxine 150mg — Prazosin review if nightmares continue decreasing
2. CPT: Rewrite stuck points — update "weak/dangerous" to "strong/cautious"
3. Driving: Intentionally drive past neighborhood once this week — planned, controlled
4. Continue trauma impact statement work — update as beliefs shift
5. Discuss with daughter age-appropriately: "Mom had something hard happen but is getting help"
6. PCL-5 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 58,
    signed_at: toISO(mariaDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // BENJAMIN COLE — MDD recurrent, Duloxetine 60mg
  // PHQ-9: 16 -> 14 -> 11 -> 9
  // ==========================================================================
  {
    id: "note-benjamin-cole-1",
    patient_id: "benjamin-cole",
    appointment_id: "apt-benjamin-cole-1",
    date_of_service: benjaminDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports this is his fourth depressive episode in 20 years. "I know the drill. The heaviness comes, everything turns gray, and I wait for it to pass. But this time it's not passing." Duloxetine 60mg started 4 weeks ago — "Some improvement in energy but mood is still low." Sleep is hypersomnic — 10+ hours on weekends. "I'd sleep all day if I could." Reports withdrawing from his men's Bible study group and golf league. "I cancelled everything. I just don't have it in me." Reports retirement 2 years ago may have contributed. "I lost my identity when I stopped working."`,
    objective: `Appearance: Well-dressed but subdued, moved slowly. Affect: Flat, limited range. Mood: "Gray." Speech: Slow, low energy. Thought process: Ruminative on lost identity, hopelessness about recovery. No SI — "I've been through this before. It gets better." No HI. PHQ-9: 16 (moderately severe). Psychomotor retardation noted.`,
    assessment: `F33.1 MDD, recurrent, moderately severe. Fourth lifetime episode. PHQ-9 at 16. Duloxetine 60mg at 4 weeks showing partial response (energy improved, mood lagging). Retirement-related identity loss is a key maintaining factor. Hypersomnia and social withdrawal are compounding depression. History of recovery is a protective factor — patient has evidence that episodes resolve. Focus on behavioral activation (anti-withdrawal), identity exploration, and medication optimization.`,
    plan: `1. Continue Duloxetine 60mg — may increase to 90mg if insufficient response in 2 weeks
2. Behavioral activation: Re-engage with one activity this week — Bible study OR golf, not both
3. Sleep regulation: No more than 8 hours — set alarm even on weekends
4. Identity work: What gave your career meaning? How can you find that outside work?
5. Reminder: You've recovered before. This episode is not different in kind.
6. PHQ-9 at each visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 55,
    signed_at: toISO(benjaminDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-benjamin-cole-2",
    patient_id: "benjamin-cole",
    appointment_id: "apt-benjamin-cole-2",
    date_of_service: benjaminDates[1]!,
    note_type: "progress_note",
    subjective: `Patient went to Bible study. "I almost turned around in the parking lot. But I went in and the guys were glad to see me. One of them said he'd been praying for me." Sleep: Followed the 8-hour rule 5/7 days. "The weekend was hard — I wanted to sleep until noon." Reports slight mood improvement. "The Bible study helped more than I expected. Being around people who care about me." Identity exploration homework: "I was an engineer. I solved problems. That was who I was. Now I'm just... retired." Started thinking about volunteer mentoring.`,
    objective: `Appearance: Slightly more animated. Affect: Still flat but showed emotion when describing Bible study reception. Mood: "A little lighter." Speech: Slow but more engaged. Thought process: Beginning identity exploration. No SI/HI. PHQ-9: 14 (moderate, improving).`,
    assessment: `F33.1 MDD, recurrent, moderate. PHQ-9 at 14. Bible study re-engagement produced meaningful social connection and mood lift. Sleep regulation is partially implemented. The engineering identity insight is important — patient equates worth with problem-solving. Mentoring could provide this outlet. Continue behavioral activation and identity work.`,
    plan: `1. Continue Duloxetine 60mg — reassess dose next visit
2. Add golf league back — aim to attend this week
3. Sleep: 7/7 nights at 8 hours maximum — this is a commitment
4. Volunteer mentoring: Research SCORE (Service Corps of Retired Executives) or similar
5. Identity: You're still a problem-solver. Where can you apply that?
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 50,
    signed_at: toISO(benjaminDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-benjamin-cole-3",
    patient_id: "benjamin-cole",
    appointment_id: "apt-benjamin-cole-3",
    date_of_service: benjaminDates[2]!,
    note_type: "progress_note",
    subjective: `Patient played golf with his league. "I shot terribly but I didn't care. It was just good to be outside with the guys." Bible study attendance continued. Sleep regulated all 7 days. "I'm starting to have more energy in the mornings. The fog is lifting." Researched SCORE mentoring — "They pair retired professionals with small business owners who need guidance. I applied." Reports mood is "the best it's been in 2 months. Not good, but trending the right way." Wife said he seems "more like himself."`,
    objective: `Appearance: Better posture, more energetic. Affect: Wider range, showed enthusiasm about SCORE. Mood: "Coming back." Speech: Normal rate, more volume. Thought process: Future-oriented, engaged. No SI/HI. PHQ-9: 11 (moderate, continued improvement). Psychomotor retardation resolved.`,
    assessment: `F33.1 MDD, recurrent, moderate, improving. PHQ-9 at 11, 5-point improvement from baseline. Behavioral activation is producing clear results — social reconnection and physical activity are both therapeutic. Sleep regulation has normalized energy levels. The SCORE application represents meaningful identity reconstruction. Duloxetine 60mg appears adequate with behavioral interventions. May not need dose increase.`,
    plan: `1. Continue Duloxetine 60mg — hold dose increase given positive trajectory
2. Continue Bible study and golf weekly — non-negotiable anchors
3. SCORE: Follow up on application
4. Challenge: Try one new activity — woodworking class, cooking class, volunteering
5. PHQ-9 next visit
6. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 48,
    signed_at: toISO(benjaminDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-benjamin-cole-4",
    patient_id: "benjamin-cole",
    appointment_id: "apt-benjamin-cole-4",
    date_of_service: benjaminDates[3]!,
    note_type: "progress_note",
    subjective: `SCORE accepted his application. "I'm matched with a woman who just started a small engineering consulting firm. She needs help with project management. I nearly cried." Golf twice this week. Bible study ongoing. "My schedule is almost as full as when I was working — but it's all things I choose." Sleep is 7.5 hours, consistent. Mood: "I feel useful again. That was the missing piece."`,
    objective: `Appearance: Vibrant, well-groomed, dressed sharply. Affect: Full range, genuine warmth and pride. Mood: "Hopeful — really hopeful." Speech: Animated, spontaneous. Thought process: Engaged, identity-coherent. No SI/HI. PHQ-9: 9 (mild). Energy and engagement markedly improved.`,
    assessment: `F33.1 MDD, recurrent, now mild. PHQ-9 at 9, 44% reduction from baseline. The SCORE mentoring match is a turning point — it directly addresses the identity loss that precipitated this episode. Patient has rebuilt a structured, meaningful weekly schedule. The insight "I feel useful again — that was the missing piece" is accurate and therapeutically significant. Begin maintenance and relapse prevention planning.`,
    plan: `1. Continue Duloxetine 60mg — discuss maintenance duration (minimum 6 months after remission)
2. Begin relapse prevention: What are your early warning signs? What will you do?
3. Continue all activities — schedule is now therapeutic in itself
4. SCORE mentoring: Approach thoughtfully — set boundaries to avoid overcommitment
5. Discuss transitioning to biweekly sessions in 2 weeks
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90837",
    duration_minutes: 48,
    signed_at: toISO(benjaminDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // LIGHT HISTORY PATIENTS (2 notes each)
  // ==========================================================================

  // SARAH JOHNSON — GAD, Hydroxyzine 25mg PRN. GAD-7: 8 -> 6
  {
    id: "note-sarah-johnson-1",
    patient_id: "sarah-johnson",
    appointment_id: "apt-sarah-johnson-1",
    date_of_service: sarahDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports manageable but persistent worry about finances and health. "I just spiral sometimes — what if I can't pay rent, what if that headache is something serious." Hydroxyzine 25mg PRN helps with acute anxiety. Sleep is okay — 6.5 hours. Started using a worry journal. "Writing it down helps me see how irrational some of the worries are."`,
    objective: `Appearance: Well-groomed, mildly tense. Affect: Mildly anxious, engaged. Mood: "Anxious but managing." Speech: Normal. Thought process: Ruminative but shows developing insight. No SI/HI. GAD-7: 8 (mild anxiety).`,
    assessment: `F41.1 GAD, mild. GAD-7 at 8. Worry journal is an effective tool for this patient. Hydroxyzine PRN providing adequate breakthrough relief. Worries are diffuse (finances, health) rather than focused, consistent with GAD. Continue cognitive-behavioral approach.`,
    plan: `1. Continue Hydroxyzine 25mg PRN
2. Worry journal: Add probability estimates — how likely is each feared outcome?
3. Introduce relaxation training: Progressive muscle relaxation
4. GAD-7 next visit
5. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(sarahDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-sarah-johnson-2",
    patient_id: "sarah-johnson",
    appointment_id: "apt-sarah-johnson-2",
    date_of_service: sarahDates[1]!,
    note_type: "progress_note",
    subjective: `Improvement this week. "The probability estimates are really helpful. Most of my worries have less than a 5% chance of happening. Seeing that on paper makes a difference." PMR practice 4x this week — "I feel physically calmer." Hydroxyzine used once this week (down from 3). Sleep improved to 7 hours.`,
    objective: `Appearance: More relaxed. Affect: Calmer, less fidgeting. Mood: "Better." Speech: Normal. No SI/HI. GAD-7: 6 (mild, improved).`,
    assessment: `F41.1 GAD, mild, improving. GAD-7 at 6. Cognitive restructuring via probability estimates is effective. PMR reducing somatic symptoms. Hydroxyzine use decreasing. Continue current approach.`,
    plan: `1. Continue Hydroxyzine 25mg PRN — may not need long-term
2. Continue worry journal with probability estimates
3. Continue PMR
4. Discuss session spacing — biweekly may be appropriate
5. GAD-7 next visit
6. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(sarahDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // MICHAEL CHEN — Dysthymia, Sertraline 50mg. PHQ-9: 9 -> 7
  {
    id: "note-michael-chen-1",
    patient_id: "michael-chen",
    appointment_id: "apt-michael-chen-1",
    date_of_service: michaelDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports chronic low-grade depressed mood that he describes as "my normal — I've felt this way for years." Sertraline 50mg for 6 weeks — "I think it helps a little. The lows aren't as low." Reports difficulty finding enjoyment in hobbies. "I used to love photography but I haven't picked up my camera in months." Sleep is adequate but reports fatigue despite sleeping 7-8 hours. "I'm just tired all the time."`,
    objective: `Appearance: Neatly dressed, flat affect. Mood: "Meh." Speech: Monotone, low energy. Thought process: Organized but colorless. No SI/HI. PHQ-9: 9 (mild depression). Chronic presentation consistent with dysthymia.`,
    assessment: `F34.1 Persistent Depressive Disorder (Dysthymia). PHQ-9 at 9. Chronic low-grade depression with anhedonia and fatigue as primary symptoms. Sertraline 50mg providing mild benefit. Behavioral activation targeting anhedonia is key — the photography abandonment is a marker of reduced pleasure-seeking. May need to consider Sertraline dose increase if behavioral activation alone is insufficient.`,
    plan: `1. Continue Sertraline 50mg — consider increase to 75mg if plateau
2. Behavioral activation: Pick up the camera once this week — no pressure for quality
3. Fatigue workup: Consider B12, thyroid, sleep study if not recently done
4. Exercise: Even 20 minutes of walking can improve dysthymic symptoms
5. PHQ-9 next visit
6. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(michaelDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-michael-chen-2",
    patient_id: "michael-chen",
    appointment_id: "apt-michael-chen-2",
    date_of_service: michaelDates[1]!,
    note_type: "progress_note",
    subjective: `Patient took camera to the park. "I took about 30 photos. A few were actually good. It felt like... something. Not joy exactly but not nothing." Walked 20 minutes 4x this week. "I do feel slightly less tired on walking days." Lab results normal — thyroid and B12 fine. "I guess it really is the depression, not something physical." Mood is "slightly better but I don't want to jinx it."`,
    objective: `Appearance: Same presentation, slight upward inflection when discussing photos. Affect: Marginally brighter. Mood: "A little better." Speech: Still low energy but more words. No SI/HI. PHQ-9: 7 (mild, improved).`,
    assessment: `F34.1 Persistent Depressive Disorder. PHQ-9 at 7. Photography re-engagement produced a glimmer of pleasure — significant for a patient with chronic anhedonia. Exercise is providing mild mood/energy benefit. Normal labs confirm psychiatric etiology. Continue behavioral activation with gradual expansion.`,
    plan: `1. Continue Sertraline 50mg — hold for now given improvement
2. Photography: Share one photo with someone this week — adding a social dimension
3. Continue walking — try to extend to 30 minutes
4. Explore: What other pleasures have you abandoned? Pick one to reintroduce
5. PHQ-9 next visit
6. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(michaelDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // JASMINE WILLIAMS — Adjustment disorder, no meds. PHQ-9: 10 -> 7
  {
    id: "note-jasmine-williams-1",
    patient_id: "jasmine-williams",
    appointment_id: "apt-jasmine-williams-1",
    date_of_service: jasmineDates[0]!,
    note_type: "progress_note",
    subjective: `Patient presents with depressed mood following a breakup 2 months ago. "He was my first serious relationship. I thought we'd get married. Now I'm 24 and starting over." Reports difficulty concentrating at work, tearfulness 2-3 times daily, and sleep disruption. "I scroll through old photos at night and cry. I know I shouldn't but I can't stop." No interest in socializing. "My friends are all coupled up. Being around them makes it worse."`,
    objective: `Appearance: Young woman, appropriately dressed, tearful. Affect: Sad, reactive. Mood: "Heartbroken." Speech: Normal rate, cracking when discussing relationship. Thought process: Focused on loss and comparison to peers. No SI/HI. PHQ-9: 10 (moderate).`,
    assessment: `F43.20 Adjustment Disorder with depressed mood, secondary to relationship loss. PHQ-9 at 10. Grief response to breakup is within expected range but intensity and duration (2 months) suggest therapeutic intervention is appropriate. Social comparison (coupled friends) and rumination (photo scrolling) are maintaining distress. No medication needed. Focus on grief processing, behavioral activation, and cognitive restructuring.`,
    plan: `1. No medication
2. Digital boundary: Remove or archive ex's photos — not delete, just out of easy reach
3. Grief processing: Write a letter you won't send — say everything unsaid
4. Social: Schedule one friend activity that isn't couples-focused
5. Cognitive: Challenge "starting over at 24" — reframe as "free at 24"
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(jasmineDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-jasmine-williams-2",
    patient_id: "jasmine-williams",
    appointment_id: "apt-jasmine-williams-2",
    date_of_service: jasmineDates[1]!,
    note_type: "progress_note",
    subjective: `Patient archived the photos. "It was hard but I stopped scrolling at night. I'm sleeping better — maybe 6.5 hours." Wrote the letter. "I cried for an hour after but then felt... lighter. Like I'd been carrying it." Went to a painting class with a single friend. "I forgot how fun it is to be silly with someone. We laughed so hard." Reports the "starting over at 24" reframe was helpful. "You're right — 24 is actually really young. I have so much time."`,
    objective: `Appearance: Brighter, wearing more color. Affect: Lighter, showed genuine laughter describing painting class. Mood: "Getting there." Speech: More animated. No SI/HI. PHQ-9: 7 (mild, improved).`,
    assessment: `F43.20 Adjustment Disorder, improving. PHQ-9 at 7. Digital boundary and grief letter were effective interventions. Social re-engagement is occurring. Sleep improving. This is a resilient young woman with a reactive mood episode that is resolving appropriately with brief therapy.`,
    plan: `1. Continue no medication
2. Continue social activities — build momentum
3. Explore: What do you want for yourself now? Not in a relationship context.
4. Discuss treatment completion timeline — 2-3 more sessions likely sufficient
5. PHQ-9 next visit
6. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(jasmineDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // OMAR HASSAN — MDD single episode, Escitalopram 10mg. PHQ-9: 14 -> 11
  {
    id: "note-omar-hassan-1",
    patient_id: "omar-hassan",
    appointment_id: "apt-omar-hassan-1",
    date_of_service: omarDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports first lifetime depressive episode triggered by job loss 3 months ago. "I was a project manager for 12 years. They eliminated my whole department. I've been applying everywhere but nothing." Reports worthlessness, poor concentration, and anhedonia. "I used to run every morning. Now I can't even get dressed before noon." Escitalopram 10mg started 3 weeks ago — "I think it's starting to work. The darkness isn't as dark." Sleep disrupted — insomnia with racing thoughts about finances.`,
    objective: `Appearance: Disheveled, unshaven. Affect: Defeated, constricted. Mood: "Lost." Speech: Slow, effortful. Thought process: Focused on job loss as identity loss. No SI/HI. PHQ-9: 14 (moderate depression).`,
    assessment: `F32.1 MDD, single episode, moderate. PHQ-9 at 14. First depressive episode precipitated by job loss with identity disruption. Escitalopram 10mg at 3 weeks showing early response. Behavioral deactivation is prominent — loss of exercise routine and daily structure are maintaining depression. Focus on rebuilding structure, separating identity from employment, and supporting job search coping.`,
    plan: `1. Continue Escitalopram 10mg — reassess at 6 weeks
2. Daily structure: Set alarm, get dressed, and leave the house by 9 AM regardless of plans
3. Exercise: Resume running — even 10 minutes counts
4. Job search: Limit applications to 2 hours/day to prevent burnout and rejection overload
5. Identity work: "What makes you valuable beyond your job title?"
6. PHQ-9 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(omarDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-omar-hassan-2",
    patient_id: "omar-hassan",
    appointment_id: "apt-omar-hassan-2",
    date_of_service: omarDates[1]!,
    note_type: "progress_note",
    subjective: `Patient followed the morning routine 5/7 days. "Getting dressed and out of the house early makes a real difference. I went to a coffee shop and just... existed in the world." Ran 15 minutes 3 times this week. "Slow and painful but I did it." Had a promising second interview. "Even if I don't get it, the interview went well. I remembered I'm actually good at what I do." Sleep improving to 6 hours. "The financial worry is still there but Escitalopram is making it less consuming."`,
    objective: `Appearance: Shaven, dressed in clean casual clothing. Affect: More hopeful, showed animation during interview story. Mood: "Cautiously optimistic." Speech: More fluent, normal rate. No SI/HI. PHQ-9: 11 (moderate, improved).`,
    assessment: `F32.1 MDD, single episode, moderate, improving. PHQ-9 at 11. Morning structure and exercise resumption are producing measurable improvement. The interview restored some professional self-concept. Escitalopram appears to be reaching therapeutic effect. Continue current approach.`,
    plan: `1. Continue Escitalopram 10mg
2. Maintain morning routine — 7/7 days
3. Increase running to 20 minutes
4. Interview prep: Regardless of outcome, each interview is evidence of competence
5. PHQ-9 next visit
6. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(omarDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // NATALIE KIM — Social anxiety, no meds. GAD-7: 9 -> 6
  {
    id: "note-natalie-kim-1",
    patient_id: "natalie-kim",
    appointment_id: "apt-natalie-kim-1",
    date_of_service: natalieDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports social anxiety primarily in professional settings. "I'm fine with close friends but at work meetings I freeze. I have good ideas but I never speak up." Reports avoiding networking events and team lunches. "I eat at my desk every day. My manager mentioned it in my review — she said I need to be more 'visible.'" No medications — prefers to try therapy first. Reports the anxiety is holding back her career. "I should be a senior designer by now but I can't advocate for myself."`,
    objective: `Appearance: Well-groomed, professional. Affect: Anxious in session initially, warmed up quickly. Mood: "Frustrated with myself." Speech: Articulate when comfortable, hesitant with new topics. No SI/HI. GAD-7: 9 (mild-moderate anxiety).`,
    assessment: `F40.10 Social Anxiety Disorder, primarily performance-type, occupational impact. GAD-7 at 9. Anxiety is situation-specific (professional settings) rather than generalized. Career impact is the primary motivator for treatment. Focus on exposure to professional social situations and cognitive restructuring around evaluation fears.`,
    plan: `1. No medication
2. Exposure: Speak up once in a meeting this week — prepared comment if needed
3. Team lunch: Attend once this week with a close work colleague as buffer
4. Cognitive: "What's the evidence that people will judge your ideas negatively?"
5. Manager: View her feedback as a sign she wants you to succeed, not a criticism
6. GAD-7 next visit
7. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(natalieDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-natalie-kim-2",
    patient_id: "natalie-kim",
    appointment_id: "apt-natalie-kim-2",
    date_of_service: natalieDates[1]!,
    note_type: "progress_note",
    subjective: `Patient spoke up in a design review meeting. "I suggested a change to the color palette and the lead said 'great catch.' I was shaking inside but nobody could tell." Went to team lunch twice — "My work friend came the first time. The second time she couldn't make it but I went anyway." Reports her manager noticed: "She said in our 1:1 that she's seen me being more engaged." The career frustration is shifting: "Maybe I've been the one holding myself back."`,
    objective: `Appearance: Same professional presentation, more relaxed posture. Affect: Growing confidence, smiled when sharing design review story. Mood: "Encouraged." Speech: More assertive. No SI/HI. GAD-7: 6 (mild, improved).`,
    assessment: `F40.10 Social Anxiety Disorder, improving. GAD-7 at 6. Rapid response to exposure-based intervention. The design review comment and positive feedback provided powerful disconfirmation of feared evaluation. Solo team lunch demonstrates independence from safety behavior (friend buffer). Manager's positive feedback is reinforcing new behaviors. Continue building professional social confidence.`,
    plan: `1. Continue no medication
2. Speak up in every meeting — at least one contribution
3. Networking: Attend one professional event or virtual meetup
4. Prepare a pitch for senior designer promotion timeline with manager
5. GAD-7 next visit
6. Follow up in 1 week — discuss session spacing`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(natalieDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // INACTIVE PATIENTS (1 final note each)
  // ==========================================================================

  // MARGARET WILLIAMS — MDD in remission. PHQ-9: 3 (final)
  {
    id: "note-margaret-williams-1",
    patient_id: "margaret-williams",
    appointment_id: "apt-margaret-williams-1",
    date_of_service: margaretDates[0]!,
    note_type: "progress_note",
    subjective: `Final session. Patient reports sustained remission from MDD. "I feel like myself again. The medication is doing its job and I have the tools to manage dips." Reports stable mood for 3 consecutive months, good sleep, maintained exercise routine, and active social life. "I know I need to stay on the medication for at least another 6 months. I'm okay with that." No concerns. "I know I can come back if I need to."`,
    objective: `Appearance: Well-groomed, vibrant. Affect: Full range, warm. Mood: "Good — genuinely good." Speech: Normal. Thought process: Clear, balanced. No SI/HI. PHQ-9: 3 (minimal symptoms — remission). Stable for 3 months.`,
    assessment: `F33.40 MDD, recurrent, in full remission. PHQ-9 at 3. Patient has maintained remission for 3 months with medication and CBT skills. Treatment goals met. Appropriate for discharge to medication management with PCP. Return to therapy PRN.`,
    plan: `1. Continue current medication via PCP management
2. Discharge from therapy — return as needed
3. Relapse prevention plan reviewed and in patient's possession
4. Open door policy — patient can self-refer back at any time
5. Final PHQ-9: 3 — documented in chart`,
    cpt_code: "90834",
    duration_minutes: 30,
    signed_at: toISO(margaretDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // THOMAS REED — GAD resolved. GAD-7: 2 (final)
  {
    id: "note-thomas-reed-1",
    patient_id: "thomas-reed",
    appointment_id: "apt-thomas-reed-1",
    date_of_service: thomasDates[0]!,
    note_type: "progress_note",
    subjective: `Final session. Patient reports anxiety symptoms have resolved. "I can't remember the last time I had a worry spiral. The techniques just became automatic." Reports strong sleep, manageable stress, and effective use of cognitive restructuring independently. "My wife says I'm 'annoyingly calm' now." Discussed maintaining gains. "I'll keep up the relaxation exercises. They're part of my routine."`,
    objective: `Appearance: Relaxed, casual. Affect: Calm, full range, humorous. Mood: "Peaceful." Speech: Normal. Thought process: Balanced, flexible. No SI/HI. GAD-7: 2 (minimal — subclinical).`,
    assessment: `F41.1 GAD, in remission. GAD-7 at 2. Patient has successfully completed CBT for GAD with full symptom remission. Skills are internalized and self-sustaining. Appropriate for discharge.`,
    plan: `1. Discontinue therapy — return as needed
2. Maintain relaxation and cognitive restructuring practices
3. Relapse prevention plan reviewed
4. Open door policy for return
5. Final GAD-7: 2`,
    cpt_code: "90834",
    duration_minutes: 30,
    signed_at: toISO(thomasDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // NO-SHOW: DEREK WASHINGTON — MDD moderate, Sertraline 50mg
  // PHQ-9: 16 -> 14 (2 notes for attended sessions)
  // ==========================================================================
  {
    id: "note-derek-washington-1",
    patient_id: "derek-washington",
    appointment_id: "apt-derek-washington-1",
    date_of_service: derekDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports persistent depressed mood. "I don't see the point of most things. I go to work, come home, sit on the couch, repeat." Started Sertraline 50mg last week — no noticeable effect yet. Sleep is poor — scrolling phone until 2 AM. "It's the only time I feel anything — even if it's just mindless entertainment." Reports limited social contact. "My friends stopped inviting me places because I always say no." Appetite is low — "I eat when I remember."`,
    objective: `Appearance: Unkempt, hoodie, minimal grooming. Affect: Flat, disengaged. Mood: "Whatever." Speech: Brief, low effort. Thought process: Nihilistic but no active SI. "Life is pointless but I'm not going to do anything about it." No HI. PHQ-9: 16 (moderately severe).`,
    assessment: `F32.1 MDD, single episode, moderate. PHQ-9 at 16. Significant anhedonia, social withdrawal, and disrupted sleep/eating patterns. Sertraline at 1 week is too early to assess. Phone scrolling until 2 AM is maintaining sleep disruption. The nihilistic presentation is concerning but passive — no active suicidal ideation. Engagement in treatment may be challenging given low motivation.`,
    plan: `1. Continue Sertraline 50mg — too early to judge, needs 4-6 weeks
2. Sleep: Phone in another room at midnight — non-negotiable
3. One social contact this week — text a friend, don't have to see them
4. Meals: Two meals per day minimum — set phone reminders
5. Behavioral activation: One small pleasant activity — video game, walk, music
6. PHQ-9 next visit
7. Follow up in 1 week — emphasize attendance importance`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(derekDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-derek-washington-2",
    patient_id: "derek-washington",
    appointment_id: "apt-derek-washington-2",
    date_of_service: derekDates[1]!,
    note_type: "progress_note",
    subjective: `Patient reports minimal improvement. "I put the phone in the kitchen at midnight... most nights. Slept a little better." Texted a friend. "He asked if I wanted to play basketball Saturday. I said maybe." Ate 2 meals on 4 days. "I'm trying. It just feels like everything takes enormous effort." Sertraline at 2 weeks — "Maybe slightly less dark? Hard to tell." Reports skipping class twice this week. "I couldn't face it."`,
    objective: `Appearance: Slightly cleaner presentation. Affect: Flat but marginally more responsive. Mood: "Meh." Speech: Brief but slightly more words. No active SI/HI. PHQ-9: 14 (moderate, slight improvement).`,
    assessment: `F32.1 MDD, moderate. PHQ-9 at 14. Minimal behavioral changes producing small improvements. Phone boundary partially implemented. Social texting is a step. However, class avoidance is concerning and could lead to academic consequences. Sertraline at 2 weeks may be starting to show early effect. Engagement in treatment remains tenuous.`,
    plan: `1. Continue Sertraline 50mg — evaluate at 4-week mark for dose increase
2. Class attendance: Go to at least one class tomorrow — sit in the back if needed
3. Basketball on Saturday: Say yes. Go even if you don't feel like it.
4. Continue phone boundary and meal reminders
5. Discuss: What would make these sessions worth coming to?
6. PHQ-9 next visit
7. Follow up in 1 week — if no-show, will call to reschedule`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(derekDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },

  // ==========================================================================
  // NON-BINARY: RIVER CHEN — GAD, Buspirone 10mg
  // GAD-7: 10 -> 8 -> 6 -> 4
  // ==========================================================================
  {
    id: "note-river-chen-1",
    patient_id: "river-chen",
    appointment_id: "apt-river-chen-1",
    date_of_service: riverDates[0]!,
    note_type: "progress_note",
    subjective: `Patient reports generalized anxiety that "covers everything — work, relationships, identity, the future." Identifies as non-binary and reports minority stress as a contributing factor. "I'm out at work but I still get misgendered regularly. It's exhausting to correct people." Buspirone 10mg started 2 weeks ago — "I think it's helping with the physical symptoms. My stomach isn't as knotted." Sleep is okay — 6.5 hours. Reports using art (painting) as a coping mechanism. "It's the only time my brain quiets down."`,
    objective: `Appearance: Casual, artistic clothing, relaxed with therapist. Affect: Anxious but expressive. Mood: "Wired." Speech: Normal rate, articulate. Thought process: Diffuse worry pattern, identity-related concerns woven throughout. No SI/HI. GAD-7: 10 (moderate anxiety). Reports good therapeutic alliance — "I feel safe here."`,
    assessment: `F41.1 GAD, moderate. GAD-7 at 10. Anxiety is multifactorial: dispositional worry tendency compounded by minority stress (misgendering, identity management labor). Buspirone 10mg providing some somatic relief. Art as coping is a strength. Treatment should address both general worry management and specific minority stress coping. Affirming approach essential.`,
    plan: `1. Continue Buspirone 10mg — evaluate for increase at 4 weeks
2. Worry management: Introduce mindfulness meditation — 5 min daily (apps: Insight Timer or Headspace)
3. Minority stress: Develop a "misgendering response toolkit" — what to say, when to correct, when to let go
4. Art as therapy: Continue and expand — consider keeping an art journal
5. GAD-7 at each visit
6. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(riverDates[0]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-river-chen-2",
    patient_id: "river-chen",
    appointment_id: "apt-river-chen-2",
    date_of_service: riverDates[1]!,
    note_type: "progress_note",
    subjective: `Patient tried mindfulness meditation 4 times this week. "The first time I lasted 2 minutes. By the fourth time I did 8 minutes. My brain fought it but I felt calmer after." Developed misgendering toolkit: "I decided I'll correct close colleagues every time, acquaintances when I have energy, and strangers almost never. It's about conserving my energy." Started an art journal. "I painted how anxiety feels. It was all jagged red lines." Sleep improved to 7 hours. "The meditation before bed helps."`,
    objective: `Appearance: Same artistic presentation, slightly more relaxed. Affect: Less anxious, thoughtful. Mood: "More in control." Speech: Normal. Thought process: Developing metacognitive awareness and energy management strategies. No SI/HI. GAD-7: 8 (mild-moderate, improved).`,
    assessment: `F41.1 GAD, improving. GAD-7 at 8. Mindfulness meditation is reducing general anxiety. The tiered misgendering response strategy is an adaptive approach to minority stress — conserves emotional resources while maintaining identity integrity. Art journal is providing externalization of anxiety. Continue building coping infrastructure.`,
    plan: `1. Continue Buspirone 10mg
2. Increase meditation to 10 minutes daily
3. Continue art journal — paint "calm" next, see how it differs from "anxiety"
4. Explore: What support systems exist? LGBTQ+ community groups, online spaces?
5. GAD-7 next visit
6. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(riverDates[1]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-river-chen-3",
    patient_id: "river-chen",
    appointment_id: "apt-river-chen-3",
    date_of_service: riverDates[2]!,
    note_type: "progress_note",
    subjective: `Patient painted "calm" — "It was all blues and slow curves. Looking at both paintings side by side was powerful. I can see the contrast." Meditation now 10 minutes daily. "It's becoming a habit. I actually look forward to it." Joined an online queer artists' community. "It's nice to be in a space where my pronouns are just... assumed correct." Reports anxiety at work is "much more manageable. The misgendering still happens but it doesn't ruin my whole day anymore." Sleep consistent at 7 hours.`,
    objective: `Appearance: Relaxed, bright. Affect: Lighter, creative energy apparent. Mood: "Grounded." Speech: Normal, expressive. Thought process: Balanced, resilient. No SI/HI. GAD-7: 6 (mild anxiety).`,
    assessment: `F41.1 GAD, mild. GAD-7 at 6. Art therapy approach producing meaningful emotional processing. Community connection (queer artists' group) addresses minority stress through belonging. Meditation is now habitual. Workplace stress is contained through energy management strategy. Buspirone and behavioral interventions are working well together.`,
    plan: `1. Continue Buspirone 10mg
2. Continue meditation and art journal
3. Community: Consider meeting online group members in person if comfortable
4. Work: Discuss with HR about pronoun norms training — only if patient feels safe doing so
5. GAD-7 next visit
6. Follow up in 1 week`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(riverDates[2]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
  {
    id: "note-river-chen-4",
    patient_id: "river-chen",
    appointment_id: "apt-river-chen-4",
    date_of_service: riverDates[3]!,
    note_type: "progress_note",
    subjective: `Patient met three people from the online group at an art show. "It was the first time in a while I felt completely myself in a social setting." Reports bringing up pronoun training to HR — "They were receptive. It's happening next month." Meditation is "non-negotiable now — like brushing my teeth." Anxiety is "still there but it's background noise, not a siren." Reports feeling "more like myself than I have in a long time."`,
    objective: `Appearance: Relaxed, colorful, confident. Affect: Warm, full range, grounded. Mood: "Myself." Speech: Normal, spontaneous. Thought process: Self-assured, values-driven. No SI/HI. GAD-7: 4 (minimal anxiety).`,
    assessment: `F41.1 GAD, minimal symptoms. GAD-7 at 4, 60% reduction from baseline. Patient has built a comprehensive coping infrastructure: meditation, art, community, minority stress management, and medication. HR advocacy shows empowerment beyond individual coping. Discuss maintenance and session spacing.`,
    plan: `1. Continue Buspirone 10mg — may discuss taper in future
2. Continue all coping practices — they're working
3. Discuss transitioning to biweekly sessions
4. Relapse prevention: What would early signs of worsening look like?
5. GAD-7 next visit
6. Follow up in 1 week — discuss session spacing`,
    cpt_code: "90834",
    duration_minutes: 45,
    signed_at: toISO(riverDates[3]!, "17:00:00"),
    signed_by: "Dr. Sarah Chen",
    status: "signed",
  },
];

export default SESSION_NOTES;
