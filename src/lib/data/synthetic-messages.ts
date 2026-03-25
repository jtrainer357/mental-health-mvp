/**
 * Synthetic Message Threads for Communications Page
 */

import { SYNTHETIC_PATIENTS } from "./synthetic-patients";

export interface Message {
  id: string;
  patient_id: string;
  direction: "inbound" | "outbound";
  channel: "sms" | "email" | "portal";
  content: string;
  timestamp: string;
  read: boolean;
}

const inboundTemplates = [
  "Hi, I need to reschedule my appointment this week. Is there anything available on Friday?",
  "Thank you for the session today. I've been thinking about what we discussed.",
  "I'm feeling really anxious today. Can we talk about coping strategies at our next session?",
  "Just wanted to let you know the breathing exercises have been helping a lot!",
  "I had a rough weekend but I used the techniques we practiced.",
  "Is it okay if I bring my partner to the next session?",
  "Do you have any recommendations for books about managing anxiety?",
  "I think I need to increase my session frequency. Can we discuss?",
  "The medication adjustment seems to be working better now.",
  "I completed the homework assignment you gave me. Looking forward to discussing.",
];

const outboundTemplates = [
  "Of course! I have openings Friday at 10am or 2pm. Which works better for you?",
  "I'm glad to hear that. Remember, progress isn't always linear. You're doing great work.",
  "Let's definitely discuss that. In the meantime, try the 4-7-8 breathing technique.",
  "That's wonderful to hear! Keep up the great work with your practice.",
  "I'm proud of you for using your coping skills. We'll process this together.",
  "Absolutely, couples sessions can be very beneficial. We can arrange that.",
  "I'd recommend 'The Anxiety and Phobia Workbook' - it's an excellent resource.",
  "Yes, let's discuss that at your next session. I can see you twice weekly if needed.",
  "Great news! Let's continue monitoring and adjust as needed.",
  "Excellent work! I look forward to hearing about your experience with it.",
];

// Seeded random for consistency
let seed = 67890;
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function generateMessages(): Message[] {
  const messages: Message[] = [];
  let messageId = 1;

  // Generate message threads for first 30 patients (most active)
  SYNTHETIC_PATIENTS.slice(0, 30).forEach((patient) => {
    const numMessages = 3 + Math.floor(seededRandom() * 8); // 3-10 messages per patient
    const threadStart = new Date();
    threadStart.setDate(threadStart.getDate() - Math.floor(seededRandom() * 30)); // Within last 30 days

    for (let i = 0; i < numMessages; i++) {
      const isInbound = i % 2 === 0;
      const messageTime = new Date(threadStart);
      messageTime.setHours(messageTime.getHours() + i * (2 + Math.floor(seededRandom() * 24)));

      messages.push({
        id: `msg-${String(messageId++).padStart(5, "0")}`,
        patient_id: patient.id,
        direction: isInbound ? "inbound" : "outbound",
        channel: seededRandom() > 0.3 ? "sms" : "email",
        content: isInbound
          ? inboundTemplates[Math.floor(seededRandom() * inboundTemplates.length)]!
          : outboundTemplates[Math.floor(seededRandom() * outboundTemplates.length)]!,
        timestamp: messageTime.toISOString(),
        read: messageTime < new Date(Date.now() - 86400000), // Read if older than 1 day
      });
    }
  });

  // Add some unread recent messages for demo
  const recentPatients = SYNTHETIC_PATIENTS.slice(0, 5);
  recentPatients.forEach((patient, i) => {
    const recentTime = new Date();
    recentTime.setHours(recentTime.getHours() - (i + 1));

    messages.push({
      id: `msg-${String(messageId++).padStart(5, "0")}`,
      patient_id: patient.id,
      direction: "inbound",
      channel: "sms",
      content: inboundTemplates[i]!,
      timestamp: recentTime.toISOString(),
      read: false,
    });
  });

  return messages.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

const generatedMessages = generateMessages();

// ============================================================================
// COMPREHENSIVE DEMO PATIENT MESSAGES
// Rich communication threads for Patient 360 and Communications inbox
// ============================================================================

const DEMO_MESSAGES: Message[] = [
  // RACHEL TORRES - 4 messages (depression recovery)
  {
    id: "msg-demo-rachel-001",
    patient_id: "rachel-torres-demo",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Rachel, just a reminder about your appointment Monday at 9 AM. Looking forward to hearing about the new job!",
    timestamp: "2026-02-07T14:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-rachel-002",
    patient_id: "rachel-torres-demo",
    direction: "inbound",
    channel: "sms",
    content: "Thanks! Yes I'll be there. Had a really good first week at the new place :)",
    timestamp: "2026-02-07T15:30:00Z",
    read: true,
  },
  {
    id: "msg-demo-rachel-003",
    patient_id: "rachel-torres-demo",
    direction: "outbound",
    channel: "sms",
    content:
      "Great session today. Remember to try the values journaling exercise we discussed before next visit.",
    timestamp: "2026-02-03T18:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-rachel-004",
    patient_id: "rachel-torres-demo",
    direction: "outbound",
    channel: "email",
    content:
      "Subject: Session Summary & Homework\n\nHi Rachel,\n\nGreat session today! As discussed, here's a recap:\n\n1. Continue Sertraline 100mg\n2. Values journaling exercise - spend 10 minutes each evening writing about what mattered most that day\n3. Notice early warning signs: sleep changes, withdrawal, negative self-talk\n\nYou've made incredible progress this year. Keep up the great work!\n\nBest,\nDr. Demo",
    timestamp: "2026-01-20T17:00:00Z",
    read: true,
  },

  // JAMES OKAFOR - 3 messages (PTSD veteran)
  {
    id: "msg-demo-james-001",
    patient_id: "james-okafor-demo",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi James, confirming your 10:30 AM appointment Monday. We'll continue the trauma narrative work.",
    timestamp: "2026-02-07T10:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-james-002",
    patient_id: "james-okafor-demo",
    direction: "inbound",
    channel: "sms",
    content:
      "Confirmed. Had a rough night with nightmares but used the grounding technique. Helped some.",
    timestamp: "2026-02-08T08:15:00Z",
    read: false, // UNREAD
  },
  {
    id: "msg-demo-james-003",
    patient_id: "james-okafor-demo",
    direction: "outbound",
    channel: "email",
    content:
      "Subject: CPT Homework — Impact Statement\n\nHi James,\n\nAs we discussed, your homework before our next session is to write your impact statement. Remember:\n\n1. Write about how the event affected your beliefs about yourself, others, and the world\n2. Focus on stuck points we identified\n3. Don't worry about grammar or spelling - just write\n\nThis is difficult work. Take breaks if needed. Call if you need support.\n\nDr. Demo",
    timestamp: "2026-01-25T16:00:00Z",
    read: true,
  },

  // SOPHIA CHEN-MARTINEZ - 3 messages (grad student anxiety)
  {
    id: "msg-demo-sophia-001",
    patient_id: "sophia-chen-martinez-demo",
    direction: "inbound",
    channel: "sms",
    content:
      "Dr. Demo, I've been really anxious about qualifying exams. Can we talk about it Monday?",
    timestamp: "2026-02-08T19:30:00Z",
    read: false, // UNREAD
  },
  {
    id: "msg-demo-sophia-002",
    patient_id: "sophia-chen-martinez-demo",
    direction: "outbound",
    channel: "sms",
    content: "Remember: perfectionism is the enemy of progress. You're doing great work, Sophia.",
    timestamp: "2026-02-01T17:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-sophia-003",
    patient_id: "sophia-chen-martinez-demo",
    direction: "inbound",
    channel: "email",
    content:
      "Subject: Question about medication\n\nHi Dr. Demo,\n\nI have a question about the Buspirone timing. Should I take it with food or does it matter? I've been taking it with breakfast and dinner but wondering if that's optimal.\n\nThanks,\nSophia",
    timestamp: "2026-01-28T11:00:00Z",
    read: true,
  },

  // MARCUS WASHINGTON - 3 messages (bipolar maintenance)
  {
    id: "msg-demo-marcus-001",
    patient_id: "marcus-washington-demo",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Marcus, confirming your 3:30 PM appointment Monday. We'll do your 8-month stability review.",
    timestamp: "2026-02-07T11:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-marcus-002",
    patient_id: "marcus-washington-demo",
    direction: "inbound",
    channel: "sms",
    content: "Thanks! Looking forward to it. 8 months stable - feels good to say that.",
    timestamp: "2026-02-07T12:30:00Z",
    read: true,
  },
  {
    id: "msg-demo-marcus-003",
    patient_id: "marcus-washington-demo",
    direction: "outbound",
    channel: "sms",
    content: "You've earned it! Your hard work in recovery is paying off. See you Monday.",
    timestamp: "2026-02-07T12:45:00Z",
    read: true,
  },

  // EMMA KOWALSKI - 3 messages (eating disorder recovery)
  {
    id: "msg-demo-emma-001",
    patient_id: "emma-kowalski-demo",
    direction: "outbound",
    channel: "sms",
    content: "Hi Emma, reminder about your appointment Tuesday 2/10 at 10 AM. See you then!",
    timestamp: "2026-02-08T10:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-emma-002",
    patient_id: "emma-kowalski-demo",
    direction: "inbound",
    channel: "sms",
    content: "Thanks! I'll be there. Had a good week - no slips.",
    timestamp: "2026-02-08T11:30:00Z",
    read: true,
  },
  {
    id: "msg-demo-emma-003",
    patient_id: "emma-kowalski-demo",
    direction: "outbound",
    channel: "email",
    content:
      "Subject: Medication Review Coordination\n\nHi Emma,\n\nI'm coordinating with Dr. Patel regarding your Fluoxetine medication review. You've been on 60mg for 10 months now with excellent results.\n\nPlease schedule a follow-up with Dr. Patel's office within the next 2 weeks so we can ensure continuity of care.\n\nBest,\nDr. Demo",
    timestamp: "2026-02-05T15:00:00Z",
    read: true,
  },

  // DAVID NAKAMURA - 3 messages (work stress, couples)
  {
    id: "msg-demo-david-001",
    patient_id: "david-nakamura-demo",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi David, confirming Tuesday 2/10 at 2 PM. Your wife will be joining us - please confirm she received the pre-session questionnaire.",
    timestamp: "2026-02-07T14:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-david-002",
    patient_id: "david-nakamura-demo",
    direction: "inbound",
    channel: "sms",
    content: "Confirmed! Yes, she completed it last night. We're both looking forward to this.",
    timestamp: "2026-02-07T16:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-david-003",
    patient_id: "david-nakamura-demo",
    direction: "outbound",
    channel: "email",
    content:
      "Subject: Pre-Session Questionnaire for Couples Session\n\nHi David and Lisa,\n\nAttached is the pre-session questionnaire for our upcoming couples session on Feb 10. Please each complete it independently and bring it to the session.\n\nThis will help us make the most of our time together.\n\nBest,\nDr. Demo",
    timestamp: "2026-02-03T10:00:00Z",
    read: true,
  },

  // AALIYAH BROOKS - 3 messages (social anxiety, identity)
  {
    id: "msg-demo-aaliyah-001",
    patient_id: "aaliyah-brooks-demo",
    direction: "outbound",
    channel: "sms",
    content: "Hi Aaliyah, reminder about your appointment Wednesday 2/11 at 4 PM.",
    timestamp: "2026-02-08T12:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-aaliyah-002",
    patient_id: "aaliyah-brooks-demo",
    direction: "inbound",
    channel: "sms",
    content: "Thanks! I'll be there. Feeling more confident lately, want to talk about next steps.",
    timestamp: "2026-02-08T14:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-aaliyah-003",
    patient_id: "aaliyah-brooks-demo",
    direction: "outbound",
    channel: "email",
    content:
      "Subject: Resources We Discussed\n\nHi Aaliyah,\n\nAs promised, here are some resources:\n\n1. PFLAG website: pflag.org\n2. The Trevor Project: thetrevorproject.org\n3. Book recommendation: 'You and Your Gender Identity' by Dara Hoffman-Fox\n\nRemember, there's no rush on anything. You're in charge of your own timeline.\n\nDr. Demo",
    timestamp: "2026-01-30T16:00:00Z",
    read: true,
  },

  // ROBERT FITZGERALD - 3 messages (geriatric grief)
  {
    id: "msg-demo-robert-001",
    patient_id: "robert-fitzgerald-demo",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Robert, confirming your appointment Thursday 2/13 at 10 AM. Looking forward to our session.",
    timestamp: "2026-02-08T09:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-robert-002",
    patient_id: "robert-fitzgerald-demo",
    direction: "inbound",
    channel: "sms",
    content:
      "Thank you Dr Demo. I will be there. Just passed one year since Ellen - lots to discuss.",
    timestamp: "2026-02-08T10:30:00Z",
    read: true,
  },
  {
    id: "msg-demo-robert-003",
    patient_id: "robert-fitzgerald-demo",
    direction: "outbound",
    channel: "sms",
    content: "I'm here for you, Robert. That's a significant milestone. We'll process it together.",
    timestamp: "2026-02-08T10:45:00Z",
    read: true,
  },

  // CARMEN ALVAREZ - 4 messages (postpartum, HIGH RISK)
  // Critical: "scary thoughts" message should be UNREAD
  {
    id: "msg-demo-carmen-001",
    patient_id: "carmen-alvarez-demo",
    direction: "inbound",
    channel: "sms",
    content:
      "Having a hard day. The baby won't stop crying and I keep having those scary thoughts. I used the coping card.",
    timestamp: "2026-02-08T16:45:00Z",
    read: false, // UNREAD - triggers substrate alert
  },
  {
    id: "msg-demo-carmen-002",
    patient_id: "carmen-alvarez-demo",
    direction: "outbound",
    channel: "sms",
    content:
      "Carmen, I'm glad you used the coping card. Remember: thoughts are not actions. You're a good mom. If you need to talk before Friday, call the office.",
    timestamp: "2026-02-08T17:15:00Z",
    read: true,
  },
  {
    id: "msg-demo-carmen-003",
    patient_id: "carmen-alvarez-demo",
    direction: "outbound",
    channel: "sms",
    content: "Checking in after our session. How are you and baby doing this week?",
    timestamp: "2026-02-05T14:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-carmen-004",
    patient_id: "carmen-alvarez-demo",
    direction: "inbound",
    channel: "sms",
    content: "Better today. Mom came over to help. Got 4 hours of sleep in a row!",
    timestamp: "2026-02-05T16:30:00Z",
    read: true,
  },

  // TYLER HARRISON - 2 messages (NEW PATIENT)
  {
    id: "msg-demo-tyler-001",
    patient_id: "tyler-harrison-demo",
    direction: "outbound",
    channel: "email",
    content:
      "Subject: Welcome to our practice — Your intake appointment\n\nDear Mr. Harrison,\n\nWelcome to our practice! Your initial evaluation is scheduled for Monday, February 9, 2026 at 4:30 PM.\n\nPlease complete the attached intake forms before your appointment:\n- Patient information form\n- Medical history questionnaire\n- Insurance information\n\nPlan to arrive 10 minutes early. Bring a valid ID and insurance card.\n\nWe look forward to meeting you.\n\nBest regards,\nDr. Demo's Office",
    timestamp: "2026-02-06T10:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-tyler-002",
    patient_id: "tyler-harrison-demo",
    direction: "outbound",
    channel: "email",
    content:
      "Subject: Appointment reminder: Monday Feb 9 at 4:30 PM\n\nHi Tyler,\n\nThis is a reminder about your intake appointment tomorrow:\n\nDate: Monday, February 9, 2026\nTime: 4:30 PM\nLocation: Main Office, 245 Cedar Lane, Pittsburgh PA\n\nPlease bring completed intake forms, ID, and insurance card.\n\nSee you tomorrow!\nDr. Demo's Office",
    timestamp: "2026-02-08T10:00:00Z",
    read: true,
  },
  // ============================================================================
  // WEEK 1 TESTING ADDITIONS — Messages for 3 new patients
  // ============================================================================

  // KEVIN RHODES — cancellation messages
  {
    id: "msg-demo-kevin-001",
    patient_id: "kevin-rhodes-demo",
    direction: "inbound",
    channel: "sms",
    content:
      "Hi Dr Demo, I'm really sorry but I have to cancel today. Work emergency — they called an all-hands meeting. Can we reschedule for next week?",
    timestamp: "2026-02-09T07:45:00Z",
    read: true,
  },
  {
    id: "msg-demo-kevin-002",
    patient_id: "kevin-rhodes-demo",
    direction: "outbound",
    channel: "sms",
    content:
      "Hi Kevin, I understand. Let's get you rescheduled soon. I have availability Wednesday at 2:30 or Thursday at 3:00. Which works better?",
    timestamp: "2026-02-09T08:15:00Z",
    read: true,
  },

  // LISA WHITFIELD — appointment confirmation
  {
    id: "msg-demo-lisa-001",
    patient_id: "lisa-whitfield-demo",
    direction: "outbound",
    channel: "sms",
    content: "Hi Lisa, just a reminder about your appointment tomorrow at 11:30 AM. See you then!",
    timestamp: "2026-02-08T14:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-lisa-002",
    patient_id: "lisa-whitfield-demo",
    direction: "inbound",
    channel: "sms",
    content:
      "Thanks! I'll be there. I actually went to a concert this weekend and did great! Can't wait to tell you about it.",
    timestamp: "2026-02-08T15:30:00Z",
    read: true,
  },

  // PRIYA SHARMA — session follow-up
  {
    id: "msg-demo-priya-001",
    patient_id: "priya-sharma-demo",
    direction: "outbound",
    channel: "email",
    content:
      "Subject: Session follow-up\n\nHi Priya,\n\nGreat progress this week on the ERP homework. Remember to continue the daily exposure exercises we discussed. Your next appointment is Monday Feb 9 at 4:30 PM.\n\nAlso, I wanted to follow up on the billing discussion — please let me know if you'd like to set up a payment plan for the outstanding balance.\n\nBest,\nDr. Demo",
    timestamp: "2026-02-01T16:00:00Z",
    read: true,
  },
  {
    id: "msg-demo-priya-002",
    patient_id: "priya-sharma-demo",
    direction: "inbound",
    channel: "email",
    content:
      "Subject: Re: Session follow-up\n\nHi Dr. Demo,\n\nThank you! The exposures are going well. I touched the handrail at the gym twice this week without washing immediately after.\n\nRegarding the billing — yes, I'd like to discuss a payment plan. Can we talk about it at my next appointment?\n\nThanks,\nPriya",
    timestamp: "2026-02-02T10:00:00Z",
    read: true,
  },
];

// Combine generated and demo messages
export const SYNTHETIC_MESSAGES = [...generatedMessages, ...DEMO_MESSAGES].sort((a, b) =>
  b.timestamp.localeCompare(a.timestamp)
); // Most recent first

export default SYNTHETIC_MESSAGES;
