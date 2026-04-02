"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mic, FileText, Pencil } from "lucide-react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { smoothEase } from "@/design-system/lib/animation-constants";

// ─── Note Type Pills ────────────────────────────────────────────────────────

const NOTE_TYPES = [
  { id: "dap", label: "DAP" },
  { id: "soap", label: "SOAP" },
  { id: "gen-psych", label: "Gen Psych" },
  { id: "custom", label: "Custom" },
] as const;

interface EmptyNoteEditorProps {
  noteType: string;
  onNoteTypeChange: (type: string) => void;
  patientName: string;
  isFullView: boolean;
}

export function EmptyNoteEditor({
  noteType,
  onNoteTypeChange,
  patientName,
  isFullView,
}: EmptyNoteEditorProps) {
  const [editorContent, setEditorContent] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const firstName = patientName.split(" ")[0] || "patient";

  return (
    <CardWrapper
      className={cn(
        "flex flex-1 flex-col",
        !isFullView && "border-0 bg-transparent px-0 shadow-none backdrop-blur-none"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: smoothEase }}
        className="flex flex-1 flex-col"
      >
        {/* Header: Note type pills */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-4 w-4" />
            <Text size="xs" className="text-muted-foreground font-semibold tracking-wider uppercase">
              Session Note
            </Text>
          </div>
          <div className="flex gap-1 rounded-full border border-border/60 bg-backbone-1/30 p-1">
            {NOTE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => onNoteTypeChange(type.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                  noteType === type.id
                    ? "bg-foreground text-card shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor area */}
        <div
          className="border-border/60 bg-card flex flex-1 flex-col rounded-xl border shadow-sm cursor-text"
          onClick={() => textareaRef.current?.focus()}
        >
          {editorContent ? (
            /* Active editing state */
            <textarea
              ref={textareaRef}
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="text-foreground/80 min-h-[300px] flex-1 resize-none bg-transparent p-6 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50"
              placeholder={`Start typing your session note for ${firstName}...`}
            />
          ) : (
            /* Empty state — invites interaction */
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: smoothEase }}
                className="flex flex-col items-center"
              >
                {/* Subtle icon */}
                <div className="bg-backbone-1/50 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Pencil className="text-muted-foreground/60 h-6 w-6" />
                </div>

                <Text className="text-foreground/70 mb-1.5 text-sm font-medium">
                  Ready for your session with {firstName}
                </Text>
                <Text size="xs" muted className="mb-8 max-w-sm text-center leading-relaxed">
                  Start typing below, or use voice recording to generate your note automatically.
                </Text>

                {/* Two action paths */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 rounded-full border-border/60 px-4 text-xs font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditorContent(" ");
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.value = "";
                          setEditorContent("");
                          textareaRef.current.focus();
                        }
                      }, 50);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Type Manually
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 gap-2 rounded-full px-4 text-xs font-bold"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Start Listening
                  </Button>
                </div>
              </motion.div>

              {/* Hidden textarea for when they click "Type Manually" */}
              <textarea
                ref={textareaRef}
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="sr-only"
                tabIndex={-1}
              />
            </div>
          )}
        </div>
      </motion.div>
    </CardWrapper>
  );
}
