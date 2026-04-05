"use client";

import { motion } from "framer-motion";
import { Check, Shield, Zap } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExtractedAction {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  requiresApproval?: boolean;
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface ExtractedActionsCardProps {
  actions: ExtractedAction[];
  onToggleAction: (id: string) => void;
  isNewSession: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ExtractedActionsCard({
  actions,
  onToggleAction,
  isNewSession,
}: ExtractedActionsCardProps) {
  return (
    <Card className="border-border/70 bg-teal/5 flex flex-col overflow-hidden p-0 shadow-sm">
      <div className="border-border/30 border-b px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg">
              <Zap className="text-primary h-3.5 w-3.5" />
            </div>
            <Text size="xs" className="font-bold tracking-wide uppercase">
              Post-Session Actions
            </Text>
          </div>
        </div>
      </div>
      {isNewSession ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <Zap className="text-muted-foreground/30 mb-3 h-8 w-8" />
          <Text size="sm" className="text-muted-foreground">
            Actions will be extracted after the session note is generated.
          </Text>
          <Button variant="outline" size="sm" disabled className="mt-4 opacity-50">
            Let AI Handle These
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-5 pb-5">
          <div className="divide-border/30 flex-1 divide-y">
            {actions.map((action, i) => (
              <motion.div
                key={action.id}
                className="flex items-start gap-3 py-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.3 }}
              >
                <motion.button
                  onClick={() => onToggleAction(action.id)}
                  role="checkbox"
                  aria-checked={action.checked}
                  aria-label={action.title}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                    action.checked
                      ? "border-success bg-success/15 text-success"
                      : "border-border hover:border-primary/40 hover:bg-primary/5"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {action.checked && <Check className="h-3 w-3" />}
                </motion.button>
                <div className="min-w-0 flex-1">
                  <Text size="xs" className="font-bold">
                    {action.title}
                  </Text>
                  <Text size="xs" className="text-muted-foreground mt-0.5 leading-relaxed">
                    {action.description}
                  </Text>
                  {action.requiresApproval && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <Shield className="text-warning h-3 w-3" />
                      <Text size="xs" className="text-warning font-medium italic">
                        Requires provider approval (HITL)
                      </Text>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-3">
            <Button variant="outline" size="lg" className="w-full">
              Let AI Handle These
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
