"use client";

import * as React from "react";
import { useCallback } from "react";
import { cn } from "@/design-system/lib/utils";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { ChatMessage } from "@/design-system/components/ui/chat-message";
import { ChatInput } from "@/design-system/components/ui/chat-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import {
  Check,
  MoreVertical,
  Bookmark,
  MessageCircle,
  Instagram,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  time: string;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  type?: "text" | "voice";
  status?: "sent" | "delivered" | "read";
  voiceDuration?: string;
  reaction?: string;
}

interface Channel {
  id: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
}

interface ChatThreadProps {
  contactName: string;
  contactRole?: string;
  contactAvatar?: string;
  messages: Message[];
  channels?: Channel[];
  activeChannel?: string;
  onChannelChange?: (channelId: string) => void;
  onMarkDone?: () => void;
  onSendMessage?: (message: string) => void;
  className?: string;
}

const defaultChannels: Channel[] = [
  { id: "chat", label: "Chat", icon: MessageCircle, active: true },
  { id: "messenger", label: "Messenger", icon: MessageCircle },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
];

const sampleMessages: Message[] = [
  {
    id: "1",
    content: "Hi there",
    time: "Jul 07, 2024",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "/avatars/herry.jpg",
  },
  {
    id: "2",
    content:
      "I recently filled out the form on your website to sign up for a demo account and am now waiting for further instructions. Is there anything else I need to do at this point?",
    time: "",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "/avatars/herry.jpg",
  },
  {
    id: "3",
    content: "Best regards,\nBrooks",
    time: "10:44",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "/avatars/herry.jpg",
    status: "read",
  },
  {
    id: "4",
    content: "Hello Brooks! 👋",
    time: "Jul 07, 2024",
    isOwn: true,
    senderName: "You",
  },
  {
    id: "5",
    content:
      "Thank you for your interest in our product. I've added you to the waitlist for our private beta. You'll receive an access key via email in the next few days.\n\nThanks again for your patience and enthusiasm!\n\nBest regards,\nTahsan",
    time: "12:02",
    isOwn: true,
    senderName: "You",
    status: "read",
    reaction: "😊",
  },
  {
    id: "6",
    content: "Thats Perfect, looking forward! my email herrybro@pixem.com",
    time: "",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "/avatars/herry.jpg",
  },
  {
    id: "7",
    content: "",
    time: "10:44",
    isOwn: false,
    senderName: "Herry Brooks",
    senderAvatar: "/avatars/herry.jpg",
    type: "voice",
    voiceDuration: "00:24",
    status: "read",
  },
];

export function ChatThread({
  contactName,
  contactRole = "Assignee",
  contactAvatar,
  messages = sampleMessages,
  channels = defaultChannels,
  activeChannel = "chat",
  onChannelChange,
  onMarkDone,
  onSendMessage,
  className,
}: ChatThreadProps) {
  const initials = contactName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleChannelChange = useCallback(
    (channelId: string) => {
      onChannelChange?.(channelId);
    },
    [onChannelChange]
  );

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <CardWrapper className={cn("flex h-full flex-col overflow-hidden p-0", className)}>
      {/* Header */}
      <div className="border-border/50 flex items-center justify-between gap-2 border-b p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
            {contactAvatar && <AvatarImage src={contactAvatar} alt={contactName} />}
            <AvatarFallback className="bg-avatar-fallback text-primary-foreground text-xs font-medium sm:text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Heading level={5} className="truncate text-sm font-semibold sm:text-base">
              {contactName}
            </Heading>
            <Text size="xs" muted className="hidden sm:block">
              {contactRole}
            </Text>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" className="hidden gap-2 sm:flex" onClick={onMarkDone}>
            <Check className="h-4 w-4" />
            Mark as Done
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:hidden"
            onClick={onMarkDone}
            aria-label="Mark as Done"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-11 sm:w-11"
            aria-label="Bookmark conversation"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-11 sm:w-11"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const showAvatar =
              index === 0 ||
              messages[index - 1]?.isOwn !== message.isOwn ||
              messages[index - 1]?.senderName !== message.senderName;

            return (
              <div key={message.id} className="relative">
                <ChatMessage
                  content={message.content}
                  time={message.time}
                  isOwn={message.isOwn}
                  senderName={showAvatar ? message.senderName : undefined}
                  senderAvatar={showAvatar ? message.senderAvatar : undefined}
                  type={message.type}
                  status={message.status}
                  voiceDuration={message.voiceDuration}
                  showAvatar={showAvatar}
                />
                {message.reaction && (
                  <span className="absolute -bottom-2 left-12 text-sm">{message.reaction}</span>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="border-border/50 border-t px-4 pt-3">
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex items-center gap-4">
            {channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => handleChannelChange(channel.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm transition-colors",
                  activeChannel === channel.id
                    ? "border-primary text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <channel.icon className="h-4 w-4" />
                {channel.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <ChatInput placeholder="Write a message" onSend={onSendMessage} />
    </CardWrapper>
  );
}

export type { ChatThreadProps, Message, Channel };
