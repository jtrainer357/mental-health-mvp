"use client";

import * as React from "react";
import {
  Clock,
  User,
  FileText,
  Calendar,
  MessageSquare,
  CreditCard,
  Shield,
  Settings,
  ChevronDown,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { Badge } from "@/design-system/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { cn } from "@/design-system/lib/utils";

export type ActivityType =
  | "patient_created"
  | "patient_updated"
  | "demographics_changed"
  | "status_changed"
  | "appointment_scheduled"
  | "appointment_completed"
  | "appointment_cancelled"
  | "document_uploaded"
  | "document_viewed"
  | "document_deleted"
  | "insurance_added"
  | "insurance_updated"
  | "authorization_added"
  | "authorization_updated"
  | "message_sent"
  | "message_received"
  | "payment_received"
  | "claim_submitted"
  | "note_added"
  | "prescription_written"
  | "consent_signed"
  | "login"
  | "logout";

export interface ActivityLogEntry {
  id: string;
  patientId: string;
  type: ActivityType;
  timestamp: string;
  performedBy: {
    id: string;
    name: string;
    role?: string;
  };
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityLogTabProps {
  patientId: string;
  activities: ActivityLogEntry[];
  isLoading?: boolean;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  onRefresh?: () => Promise<void>;
  className?: string;
}

const activityTypeConfig: Record<
  ActivityType,
  { icon: React.ElementType; label: string; category: string }
> = {
  patient_created: { icon: User, label: "Patient Created", category: "patient" },
  patient_updated: { icon: User, label: "Patient Updated", category: "patient" },
  demographics_changed: { icon: User, label: "Demographics Changed", category: "patient" },
  status_changed: { icon: Settings, label: "Status Changed", category: "patient" },
  appointment_scheduled: { icon: Calendar, label: "Appointment Scheduled", category: "appointments" },
  appointment_completed: { icon: Calendar, label: "Appointment Completed", category: "appointments" },
  appointment_cancelled: { icon: Calendar, label: "Appointment Cancelled", category: "appointments" },
  document_uploaded: { icon: FileText, label: "Document Uploaded", category: "documents" },
  document_viewed: { icon: FileText, label: "Document Viewed", category: "documents" },
  document_deleted: { icon: FileText, label: "Document Deleted", category: "documents" },
  insurance_added: { icon: Shield, label: "Insurance Added", category: "insurance" },
  insurance_updated: { icon: Shield, label: "Insurance Updated", category: "insurance" },
  authorization_added: { icon: Shield, label: "Authorization Added", category: "insurance" },
  authorization_updated: { icon: Shield, label: "Authorization Updated", category: "insurance" },
  message_sent: { icon: MessageSquare, label: "Message Sent", category: "messages" },
  message_received: { icon: MessageSquare, label: "Message Received", category: "messages" },
  payment_received: { icon: CreditCard, label: "Payment Received", category: "billing" },
  claim_submitted: { icon: CreditCard, label: "Claim Submitted", category: "billing" },
  note_added: { icon: FileText, label: "Note Added", category: "clinical" },
  prescription_written: { icon: FileText, label: "Prescription Written", category: "clinical" },
  consent_signed: { icon: FileText, label: "Consent Signed", category: "documents" },
  login: { icon: User, label: "Login", category: "access" },
  logout: { icon: User, label: "Logout", category: "access" },
};

const categoryColors: Record<string, string> = {
  patient: "bg-blue-100 text-blue-800",
  appointments: "bg-green-100 text-green-800",
  documents: "bg-orange-100 text-orange-800",
  insurance: "bg-cyan-100 text-cyan-800",
  messages: "bg-indigo-100 text-indigo-800",
  billing: "bg-emerald-100 text-emerald-800",
  clinical: "bg-rose-100 text-rose-800",
  access: "bg-gray-100 text-gray-800",
};

function formatTimestamp(timestamp: string): { date: string; time: string; relative: string } {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let relative: string;
  if (diffMins < 1) {
    relative = "Just now";
  } else if (diffMins < 60) {
    relative = `${diffMins}m ago`;
  } else if (diffHours < 24) {
    relative = `${diffHours}h ago`;
  } else if (diffDays < 7) {
    relative = `${diffDays}d ago`;
  } else {
    relative = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return {
    date: date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    relative,
  };
}

function ActivityItem({ activity }: { activity: ActivityLogEntry }) {
  const config = activityTypeConfig[activity.type] || {
    icon: Clock,
    label: activity.type,
    category: "other",
  };
  const Icon = config.icon;
  const timestamps = formatTimestamp(activity.timestamp);

  return (
    <div className="group relative flex gap-3 py-3 px-1 hover:bg-muted/50 rounded-lg transition-colors">
      {/* Timeline line */}
      <div className="absolute left-5 top-10 bottom-0 w-px bg-border group-last:hidden" />

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          categoryColors[config.category] || "bg-gray-100"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Text size="sm" weight="medium">
                {config.label}
              </Text>
              <Badge variant="outline" className="text-xs">
                {config.category}
              </Badge>
            </div>
            <Text size="sm" className="mt-0.5 text-muted-foreground">
              {activity.description}
            </Text>
          </div>
          <div className="text-right shrink-0">
            <Text size="xs" className="text-muted-foreground whitespace-nowrap">
              {timestamps.relative}
            </Text>
          </div>
        </div>

        {/* Performer info */}
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{activity.performedBy.name}</span>
          {activity.performedBy.role && (
            <>
              <span>•</span>
              <span>{activity.performedBy.role}</span>
            </>
          )}
          <span>•</span>
          <span>{timestamps.time}</span>
        </div>
      </div>
    </div>
  );
}

function groupActivitiesByDate(
  activities: ActivityLogEntry[]
): Map<string, ActivityLogEntry[]> {
  const grouped = new Map<string, ActivityLogEntry[]>();

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    const dateKey = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(activity);
  });

  return grouped;
}

export function ActivityLogTab({
  patientId,
  activities,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  onRefresh,
  className,
}: ActivityLogTabProps) {
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    activities.forEach((a) => {
      const config = activityTypeConfig[a.type];
      if (config) cats.add(config.category);
    });
    return Array.from(cats).sort();
  }, [activities]);

  const filteredActivities = React.useMemo(() => {
    if (categoryFilter === "all") return activities;
    return activities.filter((a) => {
      const config = activityTypeConfig[a.type];
      return config?.category === categoryFilter;
    });
  }, [activities, categoryFilter]);

  const groupedActivities = React.useMemo(
    () => groupActivitiesByDate(filteredActivities),
    [filteredActivities]
  );

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex h-64 items-center justify-center", className)}>
        <Text size="sm" muted>
          Loading activity log...
        </Text>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="min-h-[44px]"
          >
            <RefreshCw className={cn("h-4 w-4 mr-1.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        )}
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <Text size="sm" muted className="mt-2">
            {categoryFilter === "all"
              ? "No activity recorded yet"
              : `No ${categoryFilter} activity found`}
          </Text>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedActivities.entries()).map(([dateKey, dayActivities]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                <Text size="xs" weight="medium" className="text-muted-foreground uppercase tracking-wide">
                  {dateKey}
                </Text>
              </div>

              {/* Activities for this date */}
              <div className="space-y-1">
                {dayActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="pt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="min-h-[44px]"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More
              </>
            )}
          </Button>
        </div>
      )}

      {/* Summary footer */}
      <div className="pt-4 border-t">
        <Text size="xs" muted className="text-center">
          Showing {filteredActivities.length} of {activities.length} activities
          {hasMore && " • More available"}
        </Text>
      </div>
    </div>
  );
}

// Demo data generator for testing
export function generateDemoActivities(patientId: string): ActivityLogEntry[] {
  const now = new Date();
  const activities: ActivityLogEntry[] = [
    {
      id: "1",
      patientId,
      type: "appointment_completed",
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
      performedBy: { id: "dr1", name: "Dr. Sarah Chen", role: "Psychiatrist" },
      description: "Completed 60-minute therapy session",
    },
    {
      id: "2",
      patientId,
      type: "note_added",
      timestamp: new Date(now.getTime() - 2.5 * 3600000).toISOString(),
      performedBy: { id: "dr1", name: "Dr. Sarah Chen", role: "Psychiatrist" },
      description: "Added session notes for Feb 8, 2026 visit",
    },
    {
      id: "3",
      patientId,
      type: "payment_received",
      timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
      performedBy: { id: "sys", name: "System", role: "Automated" },
      description: "Copay of $40.00 collected via credit card",
    },
    {
      id: "4",
      patientId,
      type: "document_uploaded",
      timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
      performedBy: { id: "admin1", name: "Jessica Martinez", role: "Front Desk" },
      description: "Uploaded insurance card scan (2 pages)",
    },
    {
      id: "5",
      patientId,
      type: "authorization_added",
      timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(),
      performedBy: { id: "admin1", name: "Jessica Martinez", role: "Front Desk" },
      description: "Added new authorization AUTH-2026-0892 for 12 sessions",
    },
    {
      id: "6",
      patientId,
      type: "appointment_scheduled",
      timestamp: new Date(now.getTime() - 72 * 3600000).toISOString(),
      performedBy: { id: "pt1", name: "Patient (Self)", role: "Patient" },
      description: "Scheduled follow-up appointment for Feb 15, 2026",
    },
    {
      id: "7",
      patientId,
      type: "demographics_changed",
      timestamp: new Date(now.getTime() - 96 * 3600000).toISOString(),
      performedBy: { id: "admin1", name: "Jessica Martinez", role: "Front Desk" },
      description: "Updated phone number and address",
    },
    {
      id: "8",
      patientId,
      type: "patient_created",
      timestamp: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(),
      performedBy: { id: "admin1", name: "Jessica Martinez", role: "Front Desk" },
      description: "Patient record created",
    },
  ];

  return activities;
}
