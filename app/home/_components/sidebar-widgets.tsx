"use client";
import * as React from "react";
import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { MessageRowCard } from "@/design-system/components/ui/message-row-card";
import { OutstandingCard } from "@/design-system/components/ui/outstanding-card";
import { Heading } from "@/design-system/components/ui/typography";
import { Building2, Shield, FlaskConical, Pill, Receipt, LucideIcon } from "lucide-react";

interface Message {
  id: string;
  name: string;
  text: string;
  time: string;
  unread: boolean;
  avatarSrc?: string;
  icon?: LucideIcon;
}

const messages: Message[] = [
  {
    id: "msg-1",
    name: "Office: Appointment Request",
    text: "3 voicemails need follow-up",
    time: "5 MIN AGO",
    unread: true,
    icon: Building2,
  },
  {
    // Sarah Johnson: Female, 33yo (young), Caucasian
    id: "msg-2",
    name: "Sarah Johnson",
    text: "Need to reschedule Tuesday appointment",
    time: "12 MIN AGO",
    unread: true,
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/1.jpg",
  },
  {
    id: "msg-3",
    name: "Insurance: BCBS",
    text: "Coverage verification needed for Emily...",
    time: "25 MIN AGO",
    unread: true,
    icon: Shield,
  },
  {
    // Dr. Patel: Male, middle-aged, South Asian
    id: "msg-4",
    name: "Dr. Patel",
    text: "Can you check supply order status?",
    time: "35 MIN AGO",
    unread: true,
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/36.jpg",
  },
  {
    // Marcus Williams: Male, middle-aged, African American
    id: "msg-5",
    name: "Marcus Williams",
    text: "Question about copay amount from last...",
    time: "48 MIN AGO",
    unread: true,
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/9.jpg",
  },
  {
    id: "msg-6",
    name: "Lab: Quest Diagnostics",
    text: "Lab results ready for Patricia Moore",
    time: "1 HR AGO",
    unread: false,
    icon: FlaskConical,
  },
  {
    id: "msg-7",
    name: "Pharmacy: CVS",
    text: "Prescription refill request for James Wilson",
    time: "1 HR AGO",
    unread: false,
    icon: Pill,
  },
  {
    // Dr. Chen: Female, middle-aged, Asian
    id: "msg-8",
    name: "Dr. Chen",
    text: "Please review patient notes before 3 PM",
    time: "2 HR AGO",
    unread: false,
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/32.jpg",
  },
  {
    // Emily Rodriguez: Female, middle-aged, Hispanic
    id: "msg-9",
    name: "Emily Rodriguez",
    text: "Confirming appointment for next week",
    time: "2 HR AGO",
    unread: false,
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/62.jpg",
  },
  {
    id: "msg-10",
    name: "Insurance: Aetna",
    text: "Prior authorization approved for MRI",
    time: "3 HR AGO",
    unread: false,
    icon: Shield,
  },
  {
    id: "msg-11",
    name: "Office: Billing",
    text: "5 claims need review before submission",
    time: "3 HR AGO",
    unread: false,
    icon: Receipt,
  },
  {
    // Dr. Morrison: Male, senior, Caucasian
    id: "msg-12",
    name: "Dr. Morrison",
    text: "Patient referral documents attached",
    time: "4 HR AGO",
    unread: false,
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/5.jpg",
  },
];

export function SidebarWidgets() {
  return (
    <div className="flex h-full flex-col space-y-2">
      {/* Messages Widget */}
      <CardWrapper className="flex max-h-[720px] flex-col">
        <div className="flex items-center justify-between pb-4">
          <Heading level={4} className="text-lg">
            Messages
          </Heading>
          <Button variant="outline" size="sm" className="h-7 rounded-full px-4 text-xs font-bold">
            Inbox
          </Button>
        </div>
        <div className="-mx-2 h-full space-y-2 overflow-y-auto px-2">
          {messages.map((msg) => (
            <MessageRowCard
              key={msg.id}
              name={msg.name}
              text={msg.text}
              time={msg.time}
              unread={msg.unread}
              avatarSrc={msg.avatarSrc}
              icon={msg.icon}
            />
          ))}
        </div>
      </CardWrapper>

      {/* Outstanding Items Widget */}
      <OutstandingCard count={14} subtitle="Needs attention by 5 PM" />
    </div>
  );
}
