"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Mic, MessageSquare, Bell } from "lucide-react";
import { Input } from "@/design-system/components/ui/input";
import { Heading } from "@/design-system/components/ui/typography";
import { Button } from "@/design-system/components/ui/button";
import { VoiceControl } from "@/src/components/voice";

const DEFAULT_PLACEHOLDER = "Ask me anything about your practice or patients...";

export function HeaderSearch() {
  const [voiceTranscript, setVoiceTranscript] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);

  // Determine what to show in the input
  const displayText = voiceTranscript || "";
  const placeholder = voiceTranscript ? "" : isListening ? "Listening..." : DEFAULT_PLACEHOLDER;

  return (
    <header className="w-full shrink-0 px-4 pt-[18px] pb-4 sm:px-6">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Title - responsive sizing */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Image
            src="/tebra-logo.svg"
            alt="Tebra"
            width={96}
            height={24}
            className="hidden shrink-0 sm:block"
            priority
          />
          <Image
            src="/tebra-logo.svg"
            alt="Tebra"
            width={80}
            height={20}
            className="shrink-0 sm:hidden"
            priority
          />
          <Heading
            level={4}
            className="truncate text-right text-base leading-tight sm:text-lg md:text-xl"
          >
            Riverside Family Health & Wellness
          </Heading>
        </div>

        {/* Search bar with voice control inside + mobile header icons */}
        <div className="flex items-center gap-2 lg:flex-1">
          <div className="relative w-full">
            <div className="text-muted-foreground absolute top-1/2 left-3 z-10 flex -translate-y-1/2 items-center gap-1">
              {isListening ? (
                <Mic className="h-4 w-4 text-[var(--color-primary)]" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <Input
              className="focus-visible:ring-primary/20 h-10 w-full rounded-full border-none bg-white pr-12 pl-10 text-sm ring-1 ring-black/5 focus-visible:ring-2 md:h-11"
              placeholder={placeholder}
              value={displayText}
              readOnly
              aria-label="Ask about your practice or patients"
            />
            {/* Voice Control Button - inside search field */}
            <div className="absolute top-1/2 right-1 z-10 -translate-y-1/2">
              <VoiceControl
                size="sm"
                onTranscriptChange={setVoiceTranscript}
                onListeningChange={setIsListening}
              />
            </div>
          </div>

          {/* Mobile/Tablet header icons - Messages & Notifications */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-teal-dark h-11 w-11 rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:bg-white/80"
            >
              <Link href="/home/communications" prefetch={true}>
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Messages</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-teal-dark h-11 w-11 rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:bg-white/80"
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
