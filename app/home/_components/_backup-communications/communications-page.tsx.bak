"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { InboxSidebar } from "./inbox-sidebar";
import { ConversationList, type Conversation } from "./conversation-list";
import { ChatThread, type Message } from "./chat-thread";
import { Button } from "@/design-system/components/ui/button";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { Text } from "@/design-system/components/ui/typography";
import { ArrowLeft, Plus, MessageSquare, AlertTriangle, RefreshCw } from "lucide-react";
import { ConversationCardSkeleton, Skeleton } from "@/design-system/components/ui/skeleton";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Heading } from "@/design-system/components/ui/typography";
import { getCommunicationThreads, type Communication } from "@/src/lib/queries/communications";
import { DEMO_DATE_OBJECT } from "@/src/lib/utils/demo-date";

const messageFilterTabs = [
  { id: "all", label: "All Messages" },
  { id: "unread", label: "Unread" },
  { id: "pinned", label: "Pinned" },
  { id: "archived", label: "Archived" },
];

interface CommunicationsPageProps {
  className?: string;
}

// Format date relative to demo date
function formatMessageTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const demo = DEMO_DATE_OBJECT;
  const diffDays = Math.floor((demo.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Convert DB thread to conversation list item
function threadToConversation(thread: {
  patient: { id: string; first_name: string; last_name: string; avatar_url: string | null };
  messages: Communication[];
  unreadCount: number;
  lastMessage: Communication | null;
}): Conversation {
  // Determine channel from last message (normalize to sms or email)
  const lastChannel = thread.lastMessage?.channel?.toLowerCase();
  const channel: "sms" | "email" | undefined =
    lastChannel === "sms" ? "sms" : lastChannel === "email" ? "email" : undefined;

  return {
    id: thread.patient.id,
    name: `${thread.patient.first_name} ${thread.patient.last_name}`,
    preview: thread.lastMessage?.message_body?.substring(0, 50) || "No messages",
    time: formatMessageTime(thread.lastMessage?.sent_at || null),
    unreadCount: thread.unreadCount,
    avatarSrc: thread.patient.avatar_url || undefined,
    channel,
    pinned: thread.unreadCount > 0,
  };
}

// Parse voice message duration from content like "[Voice message - 1:23] description"
function parseVoiceDuration(content: string): string | undefined {
  const match = content.match(/\[Voice message - (\d+:\d+)\]/);
  return match ? match[1] : "0:30";
}

// Convert DB communication to chat message
function commToMessage(
  comm: Communication,
  patient: { first_name: string; last_name: string; avatar_url: string | null }
): Message {
  const isOutbound = comm.direction === "outbound";
  const isVoice = comm.channel?.toLowerCase() === "voice";

  return {
    id: comm.id,
    content: isVoice ? "" : comm.message_body || "",
    time: comm.sent_at
      ? new Date(comm.sent_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "",
    isOwn: isOutbound,
    senderName: isOutbound ? "You" : `${patient.first_name} ${patient.last_name}`,
    senderAvatar: isOutbound ? undefined : patient.avatar_url || undefined,
    status: comm.is_read ? "read" : "sent",
    type: isVoice ? "voice" : "text",
    voiceDuration: isVoice ? parseVoiceDuration(comm.message_body || "") : undefined,
  };
}

type MobileView = "list" | "chat";

interface ThreadData {
  patient: { id: string; first_name: string; last_name: string; avatar_url: string | null };
  messages: Communication[];
  unreadCount: number;
  lastMessage: Communication | null;
}

export function CommunicationsPage({ className }: CommunicationsPageProps) {
  const [selectedConversation, setSelectedConversation] = React.useState<string>("");
  const [activeSection, setActiveSection] = React.useState<string>("unassigned");
  const [activeContact, setActiveContact] = React.useState<string | undefined>();
  const [mobileView, setMobileView] = React.useState<MobileView>("list");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [threads, setThreads] = React.useState<ThreadData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load communications from Supabase
  const loadCommunications = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommunicationThreads();
      setThreads(data);
      // Select first thread by default if none selected
      if (data.length > 0) {
        setSelectedConversation((current) => current || data[0]!.patient.id);
      }
    } catch {
      setError("Unable to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCommunications();
  }, [loadCommunications]);

  const handleSendMessage = (_message: string) => {
    // Message sending will be implemented
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setMobileView("chat");
  };

  const handleBackToList = () => {
    setMobileView("list");
  };

  // Get conversations for list
  const conversations: Conversation[] = React.useMemo(() => {
    return threads
      .filter((t) => {
        if (activeFilter === "unread") return t.unreadCount > 0;
        return true;
      })
      .map(threadToConversation);
  }, [threads, activeFilter]);

  // Get selected thread
  const selectedThread = threads.find((t) => t.patient.id === selectedConversation);
  const messages: Message[] = React.useMemo(() => {
    if (!selectedThread) return [];
    return selectedThread.messages.map((m) => commToMessage(m, selectedThread.patient)).reverse(); // Show oldest first
  }, [selectedThread]);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className={cn("flex h-full flex-col overflow-hidden", className)}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="flex min-h-0 flex-1 gap-2">
          <div className="hidden w-40 shrink-0 lg:block xl:w-44">
            <CardWrapper className="h-full p-3">
              <Skeleton className="mb-4 h-5 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-md" />
                ))}
              </div>
            </CardWrapper>
          </div>
          <div className="w-full shrink-0 sm:w-72 md:w-80 lg:w-64 xl:w-72">
            <CardWrapper className="h-full p-3">
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ConversationCardSkeleton key={i} />
                ))}
              </div>
            </CardWrapper>
          </div>
          <div className="hidden min-w-0 flex-1 sm:block">
            <CardWrapper className="flex h-full flex-col p-4">
              <div className="mb-4 flex items-center gap-3 border-b pb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <Skeleton className={`h-16 ${i % 2 === 0 ? "w-3/4" : "w-1/2"} rounded-xl`} />
                  </div>
                ))}
              </div>
            </CardWrapper>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("flex h-full flex-col overflow-hidden", className)}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs
            tabs={messageFilterTabs}
            activeTab={activeFilter}
            onTabChange={setActiveFilter}
          />
          <Button className="shrink-0 gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            <span className="xs:inline hidden">New Message</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
        <CardWrapper className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <Heading level={4} className="mb-2 text-lg font-semibold">
            Unable to Load Messages
          </Heading>
          <Text muted className="mb-4 max-w-sm text-center">
            {error}
          </Text>
          <Button onClick={loadCommunications} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardWrapper>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className={cn("flex h-full flex-col overflow-hidden", className)}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs
            tabs={messageFilterTabs}
            activeTab={activeFilter}
            onTabChange={setActiveFilter}
          />
          <Button className="shrink-0 gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            <span className="xs:inline hidden">New Message</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
        <CardWrapper className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <MessageSquare className="h-7 w-7 text-gray-400" />
          </div>
          <Heading level={4} className="mb-2 text-lg font-semibold">
            No Messages Yet
          </Heading>
          <Text muted className="mb-4 max-w-sm text-center">
            {activeFilter === "unread"
              ? "No unread messages. You're all caught up!"
              : "Start a conversation with your patients."}
          </Text>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Send First Message
          </Button>
        </CardWrapper>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      {/* Filter Tabs and Add Message Button */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={messageFilterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
        />
        <Button className="shrink-0 gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span className="xs:inline hidden">New Message</span>
          <span className="xs:hidden">New</span>
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 gap-2">
        {/* Inbox Sidebar - Hidden on mobile/tablet, shown on lg+ */}
        <div className="hidden w-40 shrink-0 lg:block xl:w-44 2xl:w-48">
          <InboxSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            activeContact={activeContact}
            onContactSelect={setActiveContact}
            className="h-full"
          />
        </div>

        {/* Conversation List - Full width on mobile, fixed width on sm+ */}
        <div
          className={cn(
            "w-full shrink-0 sm:w-72 md:w-80 lg:w-64 xl:w-72 2xl:w-80",
            mobileView === "chat" && "hidden sm:block"
          )}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
            className="h-full"
          />
        </div>

        {/* Chat Thread - Full width on mobile when selected, flexible width on sm+ */}
        <div className={cn("min-w-0 flex-1", mobileView === "list" && "hidden sm:block")}>
          {/* Mobile Back Button */}
          <div className="mb-2 sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="text-muted-foreground gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to conversations
            </Button>
          </div>
          {selectedThread ? (
            <ChatThread
              contactName={`${selectedThread.patient.first_name} ${selectedThread.patient.last_name}`}
              contactRole="Patient"
              contactAvatar={selectedThread.patient.avatar_url || undefined}
              messages={messages}
              onSendMessage={handleSendMessage}
              className="h-full sm:h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Text size="sm" muted>
                Select a conversation to view messages
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { CommunicationsPageProps };
