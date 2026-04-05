"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/design-system/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-8 text-center sm:max-w-[420px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to Tebra</DialogTitle>
          <DialogDescription>Your data has been successfully imported.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center">
          {/* Coral/Red Checkmark Circle */}
          <div className="bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <HugeiconsIcon icon={Tick02Icon} className="text-primary size-10" strokeWidth={3} />
          </div>

          {/* Heading */}
          <h2 className="text-foreground mb-3 text-2xl font-bold">Welcome to Tebra!</h2>

          {/* Description */}
          <p className="text-muted-foreground text-base leading-relaxed">
            Your data has been successfully imported. We&apos;re excited to help your practice grow.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
