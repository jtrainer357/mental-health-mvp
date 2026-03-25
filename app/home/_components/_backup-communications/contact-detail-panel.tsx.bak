"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import { Separator } from "@/design-system/components/ui/separator";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Textarea } from "@/design-system/components/ui/textarea";
import {
  X,
  MapPin,
  Mail,
  Phone,
  Building,
  Users,
  Link2,
  Ticket,
  Tag,
  Hash,
  Clock,
  Plus,
  UserCircle,
} from "lucide-react";

interface ContactInfo {
  name: string;
  visitorId?: string;
  avatarSrc?: string;
  location?: string;
  email?: string;
  phone?: string;
  contactProperty?: string;
}

interface AssignTeam {
  assignee?: string;
  team?: string;
}

interface Attributes {
  ticketType?: string;
  subject?: string;
  id?: string;
}

interface LastViewedPage {
  date: string;
  time: string;
  status: "Live" | "Offline";
}

interface ContactDetailPanelProps {
  contact: ContactInfo;
  assignTeam?: AssignTeam;
  attributes?: Attributes;
  lastViewedPage?: LastViewedPage;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  onClose?: () => void;
  onCreateLink?: () => void;
  onAddSubject?: () => void;
  className?: string;
}

const defaultContact: ContactInfo = {
  name: "Herry Brooks",
  visitorId: "Visitor 1234567",
  avatarSrc: "/avatars/herry.jpg",
  location: "Los Angeles, CA, United States",
  email: "herrybrooks@gmail.com",
  phone: "+1 123 456 7890",
  contactProperty: "+1 123 456 7890",
};

const defaultAttributes: Attributes = {
  ticketType: "Account M...",
  id: "#12456",
};

const defaultLastViewedPage: LastViewedPage = {
  date: "10 Jul 2024",
  time: "12:36 PM",
  status: "Live",
};

export function ContactDetailPanel({
  contact = defaultContact,
  assignTeam = { assignee: "Unassigned", team: "Unassigned" },
  attributes = defaultAttributes,
  lastViewedPage = defaultLastViewedPage,
  notes = "",
  onNotesChange,
  onClose,
  onCreateLink,
  onAddSubject,
  className,
}: ContactDetailPanelProps) {
  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <CardWrapper className={cn("flex h-full flex-col overflow-hidden p-0", className)}>
      {/* Header Tabs */}
      <div className="border-border/50 flex items-center justify-between gap-2 border-b px-3 sm:px-4">
        <div className="-ml-3 flex-1 overflow-x-auto sm:ml-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              className="border-primary text-primary shrink-0 border-b-2 py-3 text-sm font-medium"
            >
              Info
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground shrink-0 border-b-2 border-transparent py-3 text-sm"
            >
              Viewed pages
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground shrink-0 border-b-2 border-transparent py-3 text-sm"
            >
              Notes
            </button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 sm:h-11 sm:w-11"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* About Customer Section */}
        <div className="p-4">
          <Text size="xs" muted className="mb-3 font-semibold tracking-wider uppercase">
            About Customer
          </Text>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {contact.avatarSrc && <AvatarImage src={contact.avatarSrc} alt={contact.name} />}
              <AvatarFallback className="bg-avatar-fallback text-primary-foreground text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Heading level={5} className="text-base font-semibold">
                {contact.name}
              </Heading>
              {contact.visitorId && (
                <Text size="xs" muted>
                  {contact.visitorId}
                </Text>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {contact.location && (
              <div className="flex items-start gap-3">
                <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <Text size="xs" muted className="font-medium">
                    Location
                  </Text>
                  <Text size="sm">{contact.location}</Text>
                </div>
              </div>
            )}
            {contact.email && (
              <div className="flex items-start gap-3">
                <Mail className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <Text size="xs" muted className="font-medium">
                    Email
                  </Text>
                  <Text size="sm">{contact.email}</Text>
                </div>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-start gap-3">
                <Phone className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <Text size="xs" muted className="font-medium">
                    Phone
                  </Text>
                  <Text size="sm">{contact.phone}</Text>
                </div>
              </div>
            )}
            {contact.contactProperty && (
              <div className="flex items-start gap-3">
                <Building className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <Text size="xs" muted className="font-medium">
                    Contact Property
                  </Text>
                  <Text size="sm">{contact.contactProperty}</Text>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Assign Team Section */}
        <div className="p-4">
          <Text size="xs" muted className="mb-3 font-semibold tracking-wider uppercase">
            Assign Team
          </Text>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="text-muted-foreground h-4 w-4" />
                <Text size="sm">Assignee</Text>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground h-auto p-0">
                <UserCircle className="mr-1.5 h-4 w-4" />
                {assignTeam.assignee}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground h-4 w-4" />
                <Text size="sm">Team</Text>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground h-auto p-0">
                <Users className="mr-1.5 h-4 w-4" />
                {assignTeam.team}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="text-muted-foreground h-4 w-4" />
                <Text size="sm">Link</Text>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-auto p-0"
                onClick={onCreateLink}
              >
                <Link2 className="mr-1.5 h-4 w-4" />
                Create link
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Attributes Section */}
        <div className="p-4">
          <Text size="xs" muted className="mb-3 font-semibold tracking-wider uppercase">
            Attributes
          </Text>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="text-muted-foreground h-4 w-4" />
                <Text size="sm">Ticket type</Text>
              </div>
              <Badge variant="secondary" className="text-xs">
                {attributes.ticketType}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="text-muted-foreground h-4 w-4" />
                <Text size="sm">Subject</Text>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-auto p-0"
                onClick={onAddSubject}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="text-muted-foreground h-4 w-4" />
                <Text size="sm">ID</Text>
              </div>
              <Text size="sm" muted>
                {attributes.id}
              </Text>
            </div>
          </div>
        </div>

        <Separator />

        {/* Last Viewed Page Section */}
        <div className="p-4">
          <Text size="xs" muted className="mb-3 font-semibold tracking-wider uppercase">
            Last viewed page
          </Text>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <Text size="sm">
                {lastViewedPage.date}, {lastViewedPage.time}
              </Text>
            </div>
            <Badge
              variant={lastViewedPage.status === "Live" ? "default" : "secondary"}
              className={cn(
                "text-xs",
                lastViewedPage.status === "Live" && "bg-success hover:bg-success/90"
              )}
            >
              {lastViewedPage.status}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Notes Section */}
        <div className="p-4">
          <label htmlFor="contact-notes">
            <Text size="xs" muted className="mb-3 font-semibold tracking-wider uppercase">
              Notes
            </Text>
          </label>
          <Textarea
            id="contact-notes"
            placeholder="Add notes about this contact..."
            value={notes}
            onChange={(e) => onNotesChange?.(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
      </div>
    </CardWrapper>
  );
}

export type { ContactDetailPanelProps, ContactInfo, AssignTeam, Attributes, LastViewedPage };
