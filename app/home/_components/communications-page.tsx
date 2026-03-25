"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { MessageSquare, Sparkles, Mail, Phone, Send, CheckCircle2, ArrowRight } from "lucide-react";

interface CommunicationsPageProps {
  className?: string;
}

export function CommunicationsPage({ className }: CommunicationsPageProps) {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center",
        className
      )}
    >
      <div className="flex w-full max-w-3xl flex-col items-center px-4 text-center">
        {/* Icon cluster */}
        <div className="relative mb-10">
          <div className="bg-teal/[0.08] flex h-24 w-24 items-center justify-center rounded-3xl">
            <MessageSquare className="text-teal h-12 w-12" strokeWidth={1.5} />
          </div>
          <div className="bg-primary/10 absolute -top-2 -right-5 flex h-9 w-9 items-center justify-center rounded-full">
            <Sparkles className="text-primary h-4.5 w-4.5" />
          </div>
          <div className="bg-teal/10 absolute -bottom-1.5 -left-4 flex h-8 w-8 items-center justify-center rounded-full">
            <Send className="text-teal h-4 w-4" />
          </div>
        </div>

        {/* Headline */}
        <Heading
          level={1}
          className="text-foreground-strong mb-4 text-4xl font-light tracking-tight sm:text-5xl"
        >
          AI-Powered Communications
        </Heading>

        <Text className="text-primary mb-3 text-xl font-medium sm:text-2xl">Coming Soon</Text>

        <Text muted className="mx-auto mb-12 max-w-lg text-base leading-relaxed sm:text-lg">
          A unified, intelligent messaging experience that brings together patient texts, emails,
          and calls — enhanced by AI so you respond faster and never miss a message.
        </Text>

        {/* Feature pills */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: MessageSquare, label: "Unified Inbox" },
            { icon: Sparkles, label: "AI-Drafted Replies" },
            { icon: Mail, label: "Email & SMS" },
            { icon: Phone, label: "Voice Transcripts" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="border-card-border-subtle flex items-center gap-2.5 rounded-full border bg-white/60 px-5 py-2.5 backdrop-blur-sm"
            >
              <feature.icon className="text-teal h-4 w-4" />
              <span className="text-foreground text-sm font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Email signup */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 flex-1 text-base"
              aria-label="Email address for early access"
            />
            <Button type="submit" className="h-12 shrink-0 gap-2 px-6 text-base">
              Get Early Access
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="border-success/20 bg-success/5 flex items-center gap-3 rounded-full border px-8 py-4">
            <CheckCircle2 className="text-success h-5 w-5" />
            <Text className="text-success text-base font-medium">
              You&apos;re on the list! We&apos;ll notify you when it&apos;s ready.
            </Text>
          </div>
        )}

        <Text muted className="mt-8 text-sm">
          Be among the first to experience intelligent patient communications.
        </Text>
      </div>
    </div>
  );
}

export type { CommunicationsPageProps };
