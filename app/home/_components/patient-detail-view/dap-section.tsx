"use client";

import { motion } from "framer-motion";
import { Check, Pencil, RotateCcw } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { cn } from "@/design-system/lib/utils";
import { smoothEase } from "@/design-system/lib/animation-constants";

// ─── Types ──────────────────────────────────────────────────────────────────

export type SectionStatus = "machine-generated" | "human-edited" | "accepted";

export interface NoteSection {
  key: string;
  label: string;
  prefix: string;
  content: string;
  status: SectionStatus;
  tags?: string[];
}

// ─── Animation ─────────────────────────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: smoothEase },
  },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionActionBar() {
  return (
    <div className="border-border/30 mt-4 flex items-center gap-1 border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/50 hover:text-foreground hover:bg-muted/60 h-8 gap-1.5 rounded-lg px-3 text-sm font-medium"
      >
        <Check className="h-3.5 w-3.5" />
        Accept
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/50 hover:text-foreground hover:bg-muted/60 h-8 gap-1.5 rounded-lg px-3 text-sm font-medium"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/50 hover:text-foreground hover:bg-muted/60 h-8 gap-1.5 rounded-lg px-3 text-sm font-medium"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Rewrite
      </Button>
    </div>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface DAPSectionProps {
  section: NoteSection;
  noteType: string;
  onNoteTypeChange?: (value: string) => void;
  isNewSession: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DAPSection({ section, noteType, onNoteTypeChange, isNewSession }: DAPSectionProps) {
  return (
    <motion.section key={section.key} variants={sectionVariants} aria-label={section.label}>
      {/* Section header row */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-foreground flex h-7 w-7 items-center justify-center rounded-lg">
            <Text size="xs" className="text-card font-bold">
              {section.prefix}
            </Text>
          </div>
          <Text size="xs" className="text-foreground font-bold tracking-wider uppercase">
            {section.label}
          </Text>
          {section.key === "plan" &&
            section.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary rounded-md px-2 py-0 text-sm font-medium"
              >
                {tag}
              </Badge>
            ))}
        </div>
        {section.key === "data" && onNoteTypeChange && (
          <Select value={noteType} onValueChange={onNoteTypeChange}>
            <SelectTrigger className="h-8 w-[160px] text-xs" aria-label="Note format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dap">DAP Note</SelectItem>
              <SelectItem value="soap">SOAP Note</SelectItem>
              <SelectItem value="birp">BIRP Note</SelectItem>
              <SelectItem value="girp">GIRP Note</SelectItem>
              <SelectItem value="progress">Progress Note</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Section content card */}
      <Card
        className={cn(
          "border-border/70 bg-card p-5 shadow-sm",
          isNewSession && "min-h-[120px] py-8"
        )}
      >
        {section.key === "plan" ? (
          <ol className="space-y-2.5">
            {section.content.split("\n").map((item, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.06 * i,
                  duration: 0.3,
                  ease: smoothEase,
                }}
              >
                <span className="bg-primary/10 text-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {i + 1}
                </span>
                <Text size="sm" className="text-foreground/80 pt-0.5 leading-relaxed">
                  {item}
                </Text>
              </motion.li>
            ))}
          </ol>
        ) : (
          <Text size="sm" className="text-foreground/80 leading-relaxed">
            {section.content}
          </Text>
        )}

        {/* Tag pills for assessment section */}
        {section.key === "assessment" && section.tags && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {section.tags.map((tag) => (
              <motion.span
                key={tag}
                className="bg-muted/50 border-border/40 rounded-full border px-3 py-1 text-sm font-medium"
                whileHover={{ scale: 1.03 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        )}

        <SectionActionBar />
      </Card>
    </motion.section>
  );
}
