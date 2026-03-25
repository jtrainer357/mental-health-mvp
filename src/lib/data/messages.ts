/**
 * Seed Messages — Patient communication threads
 * Mix of SMS, email, and portal messages for ~15 active patients.
 * Timestamps spread over 2 weeks. 3-5 recent inbound messages are unread.
 */

import type { SeedMessage } from "./types";
import { daysFromNow, toISO } from "./helpers";

export const MESSAGES: SeedMessage[] = [
  // ==========================================================================
  // RACHEL TORRES — 4 messages
  // ==========================================================================
  {
    id: "msg-rachel-torres-1",
    patient_id: "rachel-torres",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Rachel, just a reminder about your appointment this Tuesday. Looking forward to seeing you!",
    timestamp: toISO(daysFromNow(-10), "09:00:00"),
    read: true,
  },
  {
    id: "msg-rachel-torres-2",
    patient_id: "rachel-torres",
    direction: "inbound",
    channel: "sms",
    content:
      "Thanks Dr. Chen! I'll be there. Quick question - should I keep taking Sertraline at the same time each day or does it matter?",
    timestamp: toISO(daysFromNow(-10), "10:15:00"),
    read: true,
  },
  {
    id: "msg-rachel-torres-3",
    patient_id: "rachel-torres",
    direction: "outbound",
    channel: "sms",
    content:
      "Great question! Yes, try to take it at the same time daily — mornings with breakfast works well for most people. Consistency helps maintain steady levels.",
    timestamp: toISO(daysFromNow(-10), "11:30:00"),
    read: true,
  },
  {
    id: "msg-rachel-torres-4",
    patient_id: "rachel-torres",
    direction: "inbound",
    channel: "sms",
    content: "I completed my thought record homework! Had a really good week. See you Tuesday.",
    timestamp: toISO(daysFromNow(-2), "14:22:00"),
    read: true,
  },

  // ==========================================================================
  // JAMES OKAFOR — 5 messages
  // ==========================================================================
  {
    id: "msg-james-okafor-1",
    patient_id: "james-okafor",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi James, appointment reminder for Wednesday. Also, I've attached the PTSD family handout we discussed — check your email.",
    timestamp: toISO(daysFromNow(-8), "08:30:00"),
    read: true,
  },
  {
    id: "msg-james-okafor-2",
    patient_id: "james-okafor",
    direction: "outbound",
    channel: "email",
    content:
      "James, as discussed in our session, here is the PTSD family education handout for your wife. It covers hyperarousal, nightmares, and how partners can help. Please don't hesitate to reach out if either of you have questions.",
    timestamp: toISO(daysFromNow(-8), "08:35:00"),
    read: true,
  },
  {
    id: "msg-james-okafor-3",
    patient_id: "james-okafor",
    direction: "inbound",
    channel: "sms",
    content:
      "Roger that. My wife read the handout. She had some questions - would it be possible to do a couples session?",
    timestamp: toISO(daysFromNow(-7), "19:42:00"),
    read: true,
  },
  {
    id: "msg-james-okafor-4",
    patient_id: "james-okafor",
    direction: "outbound",
    channel: "sms",
    content:
      "Absolutely — I think that's a great idea. Let's discuss scheduling during your next session on Wednesday.",
    timestamp: toISO(daysFromNow(-7), "20:15:00"),
    read: true,
  },
  {
    id: "msg-james-okafor-5",
    patient_id: "james-okafor",
    direction: "inbound",
    channel: "sms",
    content:
      "Went to my son's basketball game this weekend. Stayed the whole time. Thought you'd want to know.",
    timestamp: toISO(daysFromNow(-1), "08:10:00"),
    read: false,
  },

  // ==========================================================================
  // SOPHIA CHEN — 4 messages
  // ==========================================================================
  {
    id: "msg-sophia-chen-1",
    patient_id: "sophia-chen",
    direction: "outbound",
    channel: "email",
    content:
      "Hi Sophia, here's a link to the guided progressive muscle relaxation audio we discussed. Try it before bed this week and let me know how it goes.",
    timestamp: toISO(daysFromNow(-12), "16:00:00"),
    read: true,
  },
  {
    id: "msg-sophia-chen-2",
    patient_id: "sophia-chen",
    direction: "inbound",
    channel: "email",
    content:
      "Thank you Dr. Chen! I tried the PMR last night and fell asleep during it. I think that means it worked? Also, I submitted code with only 3 reviews instead of 5. Nothing bad happened. Baby steps!",
    timestamp: toISO(daysFromNow(-11), "07:45:00"),
    read: true,
  },
  {
    id: "msg-sophia-chen-3",
    patient_id: "sophia-chen",
    direction: "outbound",
    channel: "sms",
    content:
      "Appointment reminder: Monday at your usual time. Keep up the great work with the behavioral experiments!",
    timestamp: toISO(daysFromNow(-3), "09:00:00"),
    read: true,
  },
  {
    id: "msg-sophia-chen-4",
    patient_id: "sophia-chen",
    direction: "inbound",
    channel: "sms",
    content:
      "I'll be there! I actually submitted a design doc with a typo this week and didn't correct it. Nobody noticed. Mind = blown.",
    timestamp: toISO(daysFromNow(-2), "18:30:00"),
    read: true,
  },

  // ==========================================================================
  // MARCUS WASHINGTON — 3 messages
  // ==========================================================================
  {
    id: "msg-marcus-washington-1",
    patient_id: "marcus-washington",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Marcus, reminder about your Thursday appointment. How has the sleep regulation been going?",
    timestamp: toISO(daysFromNow(-5), "09:00:00"),
    read: true,
  },
  {
    id: "msg-marcus-washington-2",
    patient_id: "marcus-washington",
    direction: "inbound",
    channel: "sms",
    content:
      "Going well! 10:30 lights out 6 out of 7 nights. Went to poker with the guys. Feeling more stable.",
    timestamp: toISO(daysFromNow(-5), "12:15:00"),
    read: true,
  },
  {
    id: "msg-marcus-washington-3",
    patient_id: "marcus-washington",
    direction: "inbound",
    channel: "portal",
    content:
      "Dr. Chen, my wife wanted me to ask — should we be concerned about any spring-related mood changes? Last year around this time I had a hypomanic episode. We want to be proactive.",
    timestamp: toISO(daysFromNow(-1), "10:30:00"),
    read: false,
  },

  // ==========================================================================
  // LISA WHITFIELD — 5 messages
  // ==========================================================================
  {
    id: "msg-lisa-whitfield-1",
    patient_id: "lisa-whitfield",
    direction: "outbound",
    channel: "sms",
    content: "Hi Lisa, just checking in. How did the front porch exposure exercise go this week?",
    timestamp: toISO(daysFromNow(-9), "14:00:00"),
    read: true,
  },
  {
    id: "msg-lisa-whitfield-2",
    patient_id: "lisa-whitfield",
    direction: "inbound",
    channel: "sms",
    content:
      "I sat on the porch 3 times! 20 minutes each. The third time was almost okay. Trying the mailbox tomorrow.",
    timestamp: toISO(daysFromNow(-9), "15:22:00"),
    read: true,
  },
  {
    id: "msg-lisa-whitfield-3",
    patient_id: "lisa-whitfield",
    direction: "inbound",
    channel: "sms",
    content:
      "Dr. Chen I took the Clonazepam before going to the store today. I made it inside for 8 minutes. First time shopping alone in months! My hands were shaking but I did it.",
    timestamp: toISO(daysFromNow(-3), "11:45:00"),
    read: true,
  },
  {
    id: "msg-lisa-whitfield-4",
    patient_id: "lisa-whitfield",
    direction: "outbound",
    channel: "sms",
    content:
      "Lisa, that is a HUGE accomplishment! I'm so proud of you. 8 minutes in that store is worth celebrating. Let's talk about it at Friday's session.",
    timestamp: toISO(daysFromNow(-3), "12:30:00"),
    read: true,
  },
  {
    id: "msg-lisa-whitfield-5",
    patient_id: "lisa-whitfield",
    direction: "inbound",
    channel: "sms",
    content:
      "Thank you. I cried a little reading that. I know it seems small but it felt like climbing Everest. See you Friday.",
    timestamp: toISO(daysFromNow(-3), "13:00:00"),
    read: true,
  },

  // ==========================================================================
  // CARMEN ALVAREZ — 6 messages (high priority patient)
  // ==========================================================================
  {
    id: "msg-carmen-alvarez-1",
    patient_id: "carmen-alvarez",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Carmen, checking in between sessions. How are you doing this week? Remember, you can reach out anytime.",
    timestamp: toISO(daysFromNow(-11), "10:00:00"),
    read: true,
  },
  {
    id: "msg-carmen-alvarez-2",
    patient_id: "carmen-alvarez",
    direction: "inbound",
    channel: "sms",
    content:
      "Having a hard day. The baby won't stop crying and I feel like I can't do anything right. My husband took over but I just feel useless.",
    timestamp: toISO(daysFromNow(-11), "16:45:00"),
    read: true,
  },
  {
    id: "msg-carmen-alvarez-3",
    patient_id: "carmen-alvarez",
    direction: "outbound",
    channel: "sms",
    content:
      "I hear you, Carmen. Hard days are part of this — they don't define you as a mother. Accepting your husband's help IS good parenting. Can you do one small thing for yourself tonight? A shower, a walk, a cup of tea?",
    timestamp: toISO(daysFromNow(-11), "17:10:00"),
    read: true,
  },
  {
    id: "msg-carmen-alvarez-4",
    patient_id: "carmen-alvarez",
    direction: "inbound",
    channel: "sms",
    content: "I took a shower. It helped a little. Thank you for responding.",
    timestamp: toISO(daysFromNow(-11), "19:30:00"),
    read: true,
  },
  {
    id: "msg-carmen-alvarez-5",
    patient_id: "carmen-alvarez",
    direction: "outbound",
    channel: "email",
    content:
      "Carmen, here is the information for the postpartum depression support group we discussed. They meet Wednesday evenings. Several other mothers are working through similar experiences.",
    timestamp: toISO(daysFromNow(-6), "09:00:00"),
    read: true,
  },
  {
    id: "msg-carmen-alvarez-6",
    patient_id: "carmen-alvarez",
    direction: "inbound",
    channel: "sms",
    content:
      "I went to the support group. It helped to know I'm not alone. But today was really bad again. The nausea from the increased Sertraline isn't helping.",
    timestamp: toISO(daysFromNow(-1), "20:15:00"),
    read: false,
  },

  // ==========================================================================
  // KEVIN RHODES — 4 messages
  // ==========================================================================
  {
    id: "msg-kevin-rhodes-1",
    patient_id: "kevin-rhodes",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Kevin, reminder about your Thursday session. How's the weekend plan going — did you find a hiking group?",
    timestamp: toISO(daysFromNow(-8), "09:00:00"),
    read: true,
  },
  {
    id: "msg-kevin-rhodes-2",
    patient_id: "kevin-rhodes",
    direction: "inbound",
    channel: "sms",
    content:
      "Found a Saturday morning hiking group through SMART Recovery! Going this weekend. Also hit 15 months sober yesterday.",
    timestamp: toISO(daysFromNow(-7), "11:30:00"),
    read: true,
  },
  {
    id: "msg-kevin-rhodes-3",
    patient_id: "kevin-rhodes",
    direction: "outbound",
    channel: "sms",
    content:
      "15 months! That's a real milestone, Kevin. Proud of you. The hiking group sounds perfect. See you Thursday.",
    timestamp: toISO(daysFromNow(-7), "12:00:00"),
    read: true,
  },
  {
    id: "msg-kevin-rhodes-4",
    patient_id: "kevin-rhodes",
    direction: "inbound",
    channel: "sms",
    content:
      "The hike was great. Met 3 people in recovery. We're getting dinner this week. First time having friends outside AA in a long time.",
    timestamp: toISO(daysFromNow(-2), "09:45:00"),
    read: true,
  },

  // ==========================================================================
  // PRIYA SHARMA — 4 messages
  // ==========================================================================
  {
    id: "msg-priya-sharma-1",
    patient_id: "priya-sharma",
    direction: "outbound",
    channel: "sms",
    content: "Hi Priya, appointment reminder for Friday. How's the hand cream working?",
    timestamp: toISO(daysFromNow(-6), "09:00:00"),
    read: true,
  },
  {
    id: "msg-priya-sharma-2",
    patient_id: "priya-sharma",
    direction: "inbound",
    channel: "sms",
    content:
      "Hands are so much better! I can actually see them healing. Also I used a public restroom at the mall this week. First time in months.",
    timestamp: toISO(daysFromNow(-6), "12:10:00"),
    read: true,
  },
  {
    id: "msg-priya-sharma-3",
    patient_id: "priya-sharma",
    direction: "inbound",
    channel: "portal",
    content:
      "Dr. Chen, I shook hands with three colleagues at work this week without washing after for 30 minutes. My sister said my hands look normal for the first time in years. Wanted to share the good news!",
    timestamp: toISO(daysFromNow(-1), "16:00:00"),
    read: false,
  },
  {
    id: "msg-priya-sharma-4",
    patient_id: "priya-sharma",
    direction: "outbound",
    channel: "portal",
    content:
      "Priya, this is outstanding progress! Handshakes, public restrooms, your sister noticing — these are all signs of real change. We'll celebrate at Friday's session.",
    timestamp: toISO(daysFromNow(-1), "17:30:00"),
    read: true,
  },

  // ==========================================================================
  // DANIEL PARK — 4 messages
  // ==========================================================================
  {
    id: "msg-daniel-park-1",
    patient_id: "daniel-park",
    direction: "outbound",
    channel: "sms",
    content: "Hi Daniel, reminder for Monday. How did the subway platform exposure go?",
    timestamp: toISO(daysFromNow(-5), "09:00:00"),
    read: true,
  },
  {
    id: "msg-daniel-park-2",
    patient_id: "daniel-park",
    direction: "inbound",
    channel: "sms",
    content:
      "I stood on the platform for 10 minutes! Trains came and went. I didn't ride but I was THERE. Next step: one stop.",
    timestamp: toISO(daysFromNow(-4), "18:20:00"),
    read: true,
  },
  {
    id: "msg-daniel-park-3",
    patient_id: "daniel-park",
    direction: "inbound",
    channel: "sms",
    content:
      "DR. CHEN. I rode the subway one stop today. One minute forty-two seconds. Zero panic attacks this week!!",
    timestamp: toISO(daysFromNow(-1), "17:50:00"),
    read: false,
  },
  {
    id: "msg-daniel-park-4",
    patient_id: "daniel-park",
    direction: "outbound",
    channel: "sms",
    content:
      "Daniel, this is INCREDIBLE! One stop, one minute forty-two seconds, zero panic. You should be so proud. Let's build on this Monday!",
    timestamp: toISO(daysFromNow(-1), "18:30:00"),
    read: true,
  },

  // ==========================================================================
  // MARIA RODRIGUEZ — 5 messages
  // ==========================================================================
  {
    id: "msg-maria-rodriguez-1",
    patient_id: "maria-rodriguez",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Maria, appointment reminder for Thursday. Remember your grounding kit — ice cubes, mints, rubber band. Keep it in your purse.",
    timestamp: toISO(daysFromNow(-9), "09:00:00"),
    read: true,
  },
  {
    id: "msg-maria-rodriguez-2",
    patient_id: "maria-rodriguez",
    direction: "inbound",
    channel: "sms",
    content:
      "The ice cube technique worked at work yesterday during a flashback. My coworker didn't even notice anything was wrong.",
    timestamp: toISO(daysFromNow(-8), "07:30:00"),
    read: true,
  },
  {
    id: "msg-maria-rodriguez-3",
    patient_id: "maria-rodriguez",
    direction: "inbound",
    channel: "email",
    content:
      "Dr. Chen, I wrote my trauma impact statement like we discussed. It was the hardest thing I've ever written. I cried for an hour after. But I wrote: 'I survived. I'm here. I'm raising my daughter alone and she's thriving. That's not weakness.' I want to read it to you at our next session.",
    timestamp: toISO(daysFromNow(-4), "21:00:00"),
    read: true,
  },
  {
    id: "msg-maria-rodriguez-4",
    patient_id: "maria-rodriguez",
    direction: "outbound",
    channel: "email",
    content:
      "Maria, I'm deeply moved that you were able to write that. 'I survived' — that's the truth. I would be honored to hear you read it at Thursday's session. You're doing incredibly brave work.",
    timestamp: toISO(daysFromNow(-3), "08:15:00"),
    read: true,
  },
  {
    id: "msg-maria-rodriguez-5",
    patient_id: "maria-rodriguez",
    direction: "inbound",
    channel: "sms",
    content:
      "Something happened today. I accidentally drove through the old neighborhood. I kept driving. My hands shook but I didn't panic. I think something is changing.",
    timestamp: toISO(daysFromNow(0), "07:15:00"),
    read: false,
  },

  // ==========================================================================
  // EMMA KOWALSKI — 3 messages
  // ==========================================================================
  {
    id: "msg-emma-kowalski-1",
    patient_id: "emma-kowalski",
    direction: "outbound",
    channel: "sms",
    content: "Hi Emma, appointment reminder for Tuesday. How's the meal planning going this week?",
    timestamp: toISO(daysFromNow(-6), "09:00:00"),
    read: true,
  },
  {
    id: "msg-emma-kowalski-2",
    patient_id: "emma-kowalski",
    direction: "inbound",
    channel: "sms",
    content:
      "Two consecutive purge-free weeks! I went to brunch with friends and ate normally. I didn't even think about it until after. Also signing up for pottery class.",
    timestamp: toISO(daysFromNow(-2), "11:00:00"),
    read: true,
  },
  {
    id: "msg-emma-kowalski-3",
    patient_id: "emma-kowalski",
    direction: "outbound",
    channel: "sms",
    content:
      "Two weeks purge-free is a huge milestone, Emma! And pottery sounds wonderful — doing things that aren't about your body is exactly the right direction. See you Tuesday!",
    timestamp: toISO(daysFromNow(-2), "11:45:00"),
    read: true,
  },

  // ==========================================================================
  // DAVID NAKAMURA — 3 messages
  // ==========================================================================
  {
    id: "msg-david-nakamura-1",
    patient_id: "david-nakamura",
    direction: "inbound",
    channel: "email",
    content:
      "Dr. Chen, quick update — I had that conversation with my VP about workload. She agreed to hire a contractor! Also set a no-email-after-7pm rule. Things are looking up.",
    timestamp: toISO(daysFromNow(-5), "16:30:00"),
    read: true,
  },
  {
    id: "msg-david-nakamura-2",
    patient_id: "david-nakamura",
    direction: "outbound",
    channel: "email",
    content:
      "David, that's excellent advocacy for yourself. Both the VP conversation and the email boundary are exactly the kind of sustainable changes we've been working toward. See you Wednesday!",
    timestamp: toISO(daysFromNow(-5), "17:00:00"),
    read: true,
  },
  {
    id: "msg-david-nakamura-3",
    patient_id: "david-nakamura",
    direction: "inbound",
    channel: "sms",
    content:
      "Date night with the wife tonight. First one in months. Thanks for pushing me on the boundaries — it freed up time for what actually matters.",
    timestamp: toISO(daysFromNow(-2), "17:30:00"),
    read: true,
  },

  // ==========================================================================
  // AALIYAH BROOKS — 3 messages
  // ==========================================================================
  {
    id: "msg-aaliyah-brooks-1",
    patient_id: "aaliyah-brooks",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Aaliyah, appointment reminder for Wednesday. How did sitting in the middle of class go?",
    timestamp: toISO(daysFromNow(-7), "09:00:00"),
    read: true,
  },
  {
    id: "msg-aaliyah-brooks-2",
    patient_id: "aaliyah-brooks",
    direction: "inbound",
    channel: "sms",
    content:
      "I raised my hand in class!! The professor said 'great point' and I almost cried happy tears. Also my group project team invited me to study and get coffee. I think I'm making friends??",
    timestamp: toISO(daysFromNow(-4), "20:15:00"),
    read: true,
  },
  {
    id: "msg-aaliyah-brooks-3",
    patient_id: "aaliyah-brooks",
    direction: "outbound",
    channel: "sms",
    content:
      "Aaliyah, that is AMAZING progress! Raising your hand, getting a great response, making friends — you're proving your anxiety wrong every day. So proud of you!",
    timestamp: toISO(daysFromNow(-4), "20:45:00"),
    read: true,
  },

  // ==========================================================================
  // BENJAMIN COLE — 3 messages
  // ==========================================================================
  {
    id: "msg-benjamin-cole-1",
    patient_id: "benjamin-cole",
    direction: "inbound",
    channel: "portal",
    content:
      "Dr. Chen, I wanted you to know — SCORE accepted my mentoring application. I'm matched with a woman starting an engineering consulting firm. I nearly cried when I got the email. For the first time since retirement, I feel useful.",
    timestamp: toISO(daysFromNow(-3), "14:00:00"),
    read: true,
  },
  {
    id: "msg-benjamin-cole-2",
    patient_id: "benjamin-cole",
    direction: "outbound",
    channel: "portal",
    content:
      "Benjamin, that is wonderful news! The match sounds perfect for your experience. 'Feeling useful' — that's the piece we identified was missing. Let's discuss how to approach this thoughtfully at Friday's session.",
    timestamp: toISO(daysFromNow(-3), "15:30:00"),
    read: true,
  },
  {
    id: "msg-benjamin-cole-3",
    patient_id: "benjamin-cole",
    direction: "inbound",
    channel: "sms",
    content:
      "Played golf twice this week, Bible study, and had my first SCORE meeting. My calendar is almost as full as when I was working — but it's all things I choose. See you Friday.",
    timestamp: toISO(daysFromNow(-1), "09:00:00"),
    read: true,
  },

  // ==========================================================================
  // DEREK WASHINGTON — 3 messages (no-show patient)
  // ==========================================================================
  {
    id: "msg-derek-washington-1",
    patient_id: "derek-washington",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Derek, we missed you at your appointment today. No judgment — just want to make sure you're okay. Can we reschedule?",
    timestamp: toISO(daysFromNow(-6), "16:00:00"),
    read: true,
  },
  {
    id: "msg-derek-washington-2",
    patient_id: "derek-washington",
    direction: "inbound",
    channel: "sms",
    content: "Sorry. Couldn't get out of bed. I'll try to make the next one.",
    timestamp: toISO(daysFromNow(-5), "22:30:00"),
    read: true,
  },
  {
    id: "msg-derek-washington-3",
    patient_id: "derek-washington",
    direction: "outbound",
    channel: "sms",
    content:
      "No need to apologize, Derek. That's what depression does. Your next appointment is Thursday. Even if it's hard, showing up is the most important thing right now. I'm here.",
    timestamp: toISO(daysFromNow(-5), "23:00:00"),
    read: true,
  },

  // ==========================================================================
  // RIVER CHEN — 4 messages
  // ==========================================================================
  {
    id: "msg-river-chen-1",
    patient_id: "river-chen",
    direction: "outbound",
    channel: "email",
    content:
      "Hi River, here are some mindfulness meditation app recommendations we discussed: Insight Timer (free) and Headspace (subscription). Start with 5 minutes daily and build from there.",
    timestamp: toISO(daysFromNow(-12), "10:00:00"),
    read: true,
  },
  {
    id: "msg-river-chen-2",
    patient_id: "river-chen",
    direction: "inbound",
    channel: "email",
    content:
      "Thanks Dr. Chen! Downloaded Insight Timer. First session was only 2 minutes but I felt calmer after. Also joined an online queer artists' community — it's amazing to be in a space where my pronouns are just assumed correct.",
    timestamp: toISO(daysFromNow(-10), "19:00:00"),
    read: true,
  },
  {
    id: "msg-river-chen-3",
    patient_id: "river-chen",
    direction: "inbound",
    channel: "sms",
    content:
      "Update: I talked to HR about pronoun training for the office. They were receptive! It's happening next month. Also met 3 people from the online art group at an art show this weekend.",
    timestamp: toISO(daysFromNow(-1), "14:00:00"),
    read: true,
  },
  {
    id: "msg-river-chen-4",
    patient_id: "river-chen",
    direction: "outbound",
    channel: "sms",
    content:
      "River, that's incredible on both fronts — HR advocacy AND building community in person. You're creating the world you want to live in. See you Monday!",
    timestamp: toISO(daysFromNow(-1), "15:00:00"),
    read: true,
  },
];

export default MESSAGES;
