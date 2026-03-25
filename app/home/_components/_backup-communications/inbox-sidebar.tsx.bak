"use client";

import * as React from "react";
import { useCallback } from "react";
import { cn } from "@/design-system/lib/utils";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Heading } from "@/design-system/components/ui/typography";
import { ChevronDown, Search, Plus, LayoutGrid } from "lucide-react";
import {
  Squares2X2Icon,
  UserIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/16/solid";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  active?: boolean;
}

interface DirectMessage {
  id: string;
  name: string;
  initials: string;
  avatarSrc?: string;
  online?: boolean;
}

interface InboxSidebarProps {
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  activeContact?: string;
  onContactSelect?: (contactId: string) => void;
  className?: string;
}

const liveChats: NavItem[] = [
  { id: "unassigned", label: "Unassigned", icon: Squares2X2Icon },
  { id: "my-open", label: "My open", icon: UserIcon },
  { id: "solved", label: "Solved", icon: CheckCircleIcon },
];

const connectItems: NavItem[] = [
  { id: "messenger", label: "Messenger", icon: ChatBubbleLeftIcon },
  { id: "instagram", label: "Instagram", icon: ChatBubbleLeftRightIcon },
  { id: "whatsapp", label: "WhatsApp", icon: ChatBubbleLeftIcon },
  { id: "spam", label: "Spam", icon: ExclamationTriangleIcon },
];

// Direct messages with demographically-appropriate avatars
const directMessages: DirectMessage[] = [
  {
    // Adam Mccall: Male, middle-aged, Caucasian
    id: "adam",
    name: "Adam Mccall",
    initials: "AM",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/3.jpg",
  },
  {
    // Tahsan Khan: Male, young, South Asian
    id: "tahsan",
    name: "Tahsan Khan",
    initials: "TK",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/35.jpg",
    online: true,
  },
  {
    // Joe Roots: Male, middle-aged, Caucasian
    id: "joe",
    name: "Joe Roots",
    initials: "JR",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/17.jpg",
  },
  {
    // Herry Brooks: Male, middle-aged, African American
    id: "herry",
    name: "Herry Brooks",
    initials: "HB",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/16.jpg",
  },
  { id: "kane", name: "Herry Kane", initials: "HK" },
];

export function InboxSidebar({
  activeSection = "unassigned",
  onSectionChange,
  activeContact,
  onContactSelect,
  className,
}: InboxSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSectionChange = useCallback(
    (sectionId: string) => {
      onSectionChange?.(sectionId);
    },
    [onSectionChange]
  );

  const handleContactSelect = useCallback(
    (contactId: string) => {
      onContactSelect?.(contactId);
    },
    [onContactSelect]
  );

  return (
    <CardWrapper className={cn("flex h-full flex-col overflow-hidden p-0", className)}>
      {/* Header */}
      <div className="border-border/50 border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="gap-2 px-2 text-lg font-semibold">
            Inbox
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            aria-label="View layout options"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-3">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search inbox..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search inbox"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Live Chats Section */}
        <div className="p-4 pb-2">
          <Heading
            level={6}
            className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase"
          >
            Live Chats
          </Heading>
          <nav className="space-y-1">
            {liveChats.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                className={cn(
                  "flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Connect Section */}
        <div className="p-4 pb-2">
          <div className="mb-3 flex items-center justify-between">
            <Heading
              level={6}
              className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
            >
              Connect
            </Heading>
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Add connection">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <nav className="space-y-1">
            {connectItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                className={cn(
                  "flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Direct Messages Section */}
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <Heading
              level={6}
              className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
            >
              Direct Messages
            </Heading>
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          </div>
          <nav className="space-y-1">
            {directMessages.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleContactSelect(contact.id)}
                className={cn(
                  "flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  activeContact === contact.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Avatar className="h-5 w-5 shrink-0">
                  {contact.avatarSrc && <AvatarImage src={contact.avatarSrc} alt={contact.name} />}
                  <AvatarFallback className="bg-avatar-fallback text-primary-foreground text-[8px] font-medium">
                    {contact.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{contact.name}</span>
              </button>
            ))}
          </nav>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground mt-2 min-h-[44px] w-full justify-start px-3"
          >
            Add New Teammates
          </Button>
        </div>
      </div>
    </CardWrapper>
  );
}

export type { InboxSidebarProps };
