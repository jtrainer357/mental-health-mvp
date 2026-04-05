"use client";

import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { PriorityAction } from "@/design-system/components/ui/priority-action";
import { AIActionCard } from "@/design-system/components/ui/ai-action-card";
import { ScheduleRowCard } from "@/design-system/components/ui/schedule-row-card";
import { Heading, Text } from "@/design-system/components/ui/typography";

// Appointments with demographically-appropriate avatars
const appointments = [
  {
    // Michael Chen: Male, 52yo (middle-aged), Asian
    id: "apt-4",
    time: "9:30 AM",
    patient: "Michael Chen",
    type: "DIABETES FOLLOW-UP",
    provider: "Dr. Patel",
    status: "ARRIVED" as const,
    room: "Room 101",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/32.jpg",
  },
  {
    // Emma Johnson: Female, young, Caucasian (sports physical implies young)
    id: "apt-5",
    time: "9:45 AM",
    patient: "Emma Johnson",
    type: "SPORTS PHYSICAL",
    provider: "Dr. Chen",
    status: "ROOMED" as const,
    room: "Room 103",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/8.jpg",
  },
  {
    // Emily Rodriguez: Female, middle-aged, Hispanic
    id: "apt-6",
    time: "10:00 AM",
    patient: "Emily Rodriguez",
    type: "PHYSICAL",
    provider: "Dr. Patel",
    status: "SCHEDULED" as const,
    room: "Room 101",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/62.jpg",
  },
  {
    // James Wilson: Male, middle-aged (BP check), Caucasian
    id: "apt-7",
    time: "10:15 AM",
    patient: "James Wilson",
    type: "BLOOD PRESSURE CHECK",
    provider: "Dr. Morrison",
    status: "SCHEDULED" as const,
    room: "Room 201",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/3.jpg",
  },
  {
    // Lisa Thompson: Female, young/middle (prenatal), Caucasian
    id: "apt-8",
    time: "10:30 AM",
    patient: "Lisa Thompson",
    type: "PRENATAL VISIT",
    provider: "Dr. Chen",
    status: "SCHEDULED" as const,
    room: "Room 103",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/15.jpg",
  },
  {
    // Robert Garcia: Male, middle-aged, Hispanic
    id: "apt-9",
    time: "10:45 AM",
    patient: "Robert Garcia",
    type: "FOLLOW-UP",
    provider: "Dr. Patel",
    status: "SCHEDULED" as const,
    room: "Room 101",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/69.jpg",
  },
  {
    // Amanda Lee: Female, young (new patient), Asian
    id: "apt-10",
    time: "11:00 AM",
    patient: "Amanda Lee",
    type: "NEW PATIENT",
    provider: "Dr. Morrison",
    status: "SCHEDULED" as const,
    room: "Room 201",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/30.jpg",
  },
  {
    // Daniel Brown: Male, middle-aged (skin check), Caucasian
    id: "apt-11",
    time: "11:15 AM",
    patient: "Daniel Brown",
    type: "SKIN CHECK",
    provider: "Dr. Chen",
    status: "SCHEDULED" as const,
    room: "Room 103",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/10.jpg",
  },
  {
    // Jennifer Davis: Female, middle-aged (lab review), Caucasian
    id: "apt-12",
    time: "11:30 AM",
    patient: "Jennifer Davis",
    type: "LAB REVIEW",
    provider: "Dr. Patel",
    status: "SCHEDULED" as const,
    room: "Room 101",
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/female/17.jpg",
  },
];

export function ScheduleSection() {
  return (
    <CardWrapper className="flex h-full flex-col">
      <div className="flex flex-col gap-1 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading level={3} className="text-xl sm:text-2xl">
            Today&apos;s Actions
          </Heading>
          <Text size="xs" muted className="mt-1 tracking-widest uppercase">
            Saturday, Jan 3 •{" "}
            <span className="text-card-foreground font-semibold">39 Appointments</span>
          </Text>
        </div>
      </div>
      <div className="-mx-2 flex-1 space-y-4 overflow-y-auto px-2 sm:space-y-6">
        <PriorityAction
          title="Michael Chen is arriving"
          subtitle="9:30 AM appointment • Room 101"
          avatarInitials="MC"
          avatarSrc="https://xsgames.co/randomusers/assets/avatars/male/32.jpg"
          buttonText="Begin Check-in"
        />

        {/* AI Recommended Actions */}
        <div className="space-y-2">
          <AIActionCard
            patientName="Michael Chen"
            avatarSrc="https://xsgames.co/randomusers/assets/avatars/male/32.jpg"
            mainAction="A1C results available: 7.2% (↓ from 8.1%)"
            statusIndicators="EXCELLENT PROGRESS ON TYPE 2 DIABETES MANAGEMENT"
            readyStatus="Content ready"
            suggestedActions={3}
            badgeText="RESULTS READY"
            badgeVariant="default"
          />
          <AIActionCard
            patientName="Sarah Johnson"
            avatarSrc="https://xsgames.co/randomusers/assets/avatars/female/1.jpg"
            mainAction="9:00 AM Annual Physical"
            statusIndicators="INSURANCE VERIFIED • 2 CARE GAPS IDENTIFIED • RECENT MESSAGE FLAGGED"
            readyStatus="Everything pre-configured"
            suggestedActions={4}
            badgeText="FIRST APPT TODAY"
            badgeVariant="success"
          />
          <AIActionCard
            patientName="Margaret Williams"
            avatarSrc="https://xsgames.co/randomusers/assets/avatars/female/5.jpg"
            mainAction="Metformin 500mg: 5 days remaining"
            statusIndicators="SCHEDULED TODAY AT 10 AM • SAFETY CHECKS COMPLETE"
            readyStatus="One-click approval"
            badgeText="URGENT REFILL"
            badgeVariant="urgent"
          />
        </div>

        {/* Appointment List */}
        <div className="space-y-2">
          <Heading
            level={6}
            className="text-muted-foreground mt-2 mb-3 text-xs font-semibold tracking-wider uppercase"
          >
            Today&apos;s Patients
          </Heading>
          {appointments.map((apt) => (
            <ScheduleRowCard
              key={apt.id}
              time={apt.time}
              patient={apt.patient}
              type={apt.type}
              provider={apt.provider}
              status={apt.status}
              room={apt.room}
              avatarSrc={apt.avatarSrc}
            />
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}
