"use client";

import * as React from "react";
import { Building2, Shield, FlaskConical, Pill, LucideIcon } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { MessageRowCard } from "@/design-system/components/ui/message-row-card";
import { Heading } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

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
];

interface MessagesWidgetProps {
  className?: string;
}

export function MessagesWidget({ className }: MessagesWidgetProps) {
  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <CardWrapper className={cn("flex max-h-[720px] flex-col", className)}>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Heading level={4} className="text-lg">
            Messages
          </Heading>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" className="h-7 rounded-full px-4 text-xs font-bold">
          Inbox
        </Button>
      </div>
      <div className="-mx-2 min-h-0 flex-1 space-y-2 overflow-y-auto px-2">
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
  );
}
