"use client";

import * as React from "react";
import {
  MessageCircle,
  Instagram,
  MessageSquare,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  Wand2,
  Smile,
  Send,
  Play,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientDetail } from "./types";

// Channel tabs for messaging
const messageChannels = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "messenger", label: "Messenger", icon: MessageCircle },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
];

// Helper to parse voice message metadata
function parseVoiceMessage(
  messageBody: string | null
): { isVoice: boolean; duration: string } | null {
  if (!messageBody) return null;
  const match = messageBody.match(/^\[Voice message - (\d+:\d+)\]/);
  if (match && match[1]) {
    return { isVoice: true, duration: match[1] };
  }
  return null;
}

// Voice Message Bubble Component
function VoiceMessageBubble({ duration, isOutbound }: { duration: string; isOutbound: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Play voice message"
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
          isOutbound ? "bg-white/20 hover:bg-white/30" : "bg-gray-100 hover:bg-gray-200"
        )}
      >
        <Play className={cn("ml-0.5 h-5 w-5", isOutbound ? "text-white" : "text-gray-600")} />
      </button>
      <div className="flex items-center gap-2">
        {/* Waveform visualization */}
        <div className="flex items-center gap-[2px]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={cn("w-[2px] rounded-full", isOutbound ? "bg-white/60" : "bg-gray-300")}
              style={{
                height: `${Math.max(4, Math.sin(i * 0.5) * 12 + Math.random() * 8 + 8)}px`,
              }}
            />
          ))}
        </div>
        <span
          className={cn("text-sm tabular-nums", isOutbound ? "text-white/80" : "text-gray-500")}
        >
          {duration}
        </span>
        <Smile className={cn("h-5 w-5", isOutbound ? "text-white/60" : "text-gray-400")} />
      </div>
    </div>
  );
}

interface MessagesTabProps {
  patient: PatientDetail;
}

export function MessagesTab({ patient }: MessagesTabProps) {
  const [activeChannel, setActiveChannel] = React.useState("chat");
  const [messageInput, setMessageInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [patient.messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      // Handle sending message (would integrate with backend)
      setMessageInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  // Channel tabs component (used in both empty and filled states)
  const ChannelTabs = () => (
    <div className="border-border/50 border-t bg-white px-3 pt-3 sm:px-5">
      <div className="-mx-3 flex items-center gap-3 overflow-x-auto px-3 sm:mx-0 sm:gap-4 sm:overflow-visible sm:px-0">
        {messageChannels.map((channel) => (
          <button
            key={channel.id}
            type="button"
            onClick={() => setActiveChannel(channel.id)}
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
  );

  // Message input component (used in both empty and filled states)
  const MessageInput = () => (
    <div className="border-border/50 rounded-b-xl border-t bg-white p-2 sm:p-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="border-border bg-background focus-within:ring-ring flex h-10 flex-1 items-center rounded-full border pr-1 pl-3 focus-within:ring-2 sm:pr-2 sm:pl-4">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message"
            aria-label="Write a message to patient"
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <div className="hidden items-center sm:flex">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              aria-label="Attach image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              aria-label="AI assist"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              aria-label="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!messageInput.trim()}
          className="gap-2"
          size="default"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (!patient.messages || patient.messages.length === 0) {
    return (
      <div className="flex h-full flex-col">
        {/* Empty state */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <MessageCircle className="text-muted-foreground/30 mx-auto h-12 w-12" />
            <Text size="sm" muted className="mt-3">
              No messages yet
            </Text>
            <Text size="xs" muted className="mt-1">
              Start a conversation with {patient.name}
            </Text>
          </div>
        </div>

        <ChannelTabs />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 px-6 py-2 lg:overflow-y-auto">
        <div className="space-y-4">
          {patient.messages.map((message, index) => {
            const isOutbound = message.direction === "outbound";
            const showHeader =
              index === 0 || patient.messages![index - 1]?.direction !== message.direction;

            const messageTime = message.sentAt
              ? new Date(message.sentAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={message.id}
                className={cn("flex gap-3", isOutbound ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar for incoming messages */}
                {!isOutbound && showHeader && (
                  <Avatar className="h-8 w-8 shrink-0">
                    {patient.avatarSrc && (
                      <AvatarImage src={patient.avatarSrc} alt={patient.name} />
                    )}
                    <AvatarFallback className="bg-avatar-fallback text-xs font-medium text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isOutbound && !showHeader && <div className="w-8 shrink-0" />}

                <div className={cn("max-w-[75%] space-y-1", isOutbound && "items-end")}>
                  {/* Header with name and time for incoming */}
                  {!isOutbound && showHeader && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{patient.name}</span>
                      <span className="text-muted-foreground text-xs">{messageTime}</span>
                    </div>
                  )}

                  {/* Message bubble */}
                  {(() => {
                    const voiceData = parseVoiceMessage(message.messageBody);
                    if (voiceData) {
                      return (
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3",
                            isOutbound
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "border-border/50 rounded-bl-md border bg-white shadow-sm"
                          )}
                        >
                          <VoiceMessageBubble
                            duration={voiceData.duration}
                            isOutbound={isOutbound}
                          />
                        </div>
                      );
                    }
                    return (
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3",
                          isOutbound
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "border-border/50 rounded-bl-md border bg-white shadow-sm"
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.messageBody || "(No content)"}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Time and status for outbound */}
                  {isOutbound && (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-muted-foreground text-xs">{messageTime}</span>
                      {message.isRead && <CheckCheck className="text-primary h-3.5 w-3.5" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChannelTabs />
      <MessageInput />
    </div>
  );
}
