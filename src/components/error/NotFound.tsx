"use client";

import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

export interface NotFoundProps {
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Additional className */
  className?: string;
  /** Show search suggestion */
  showSearchSuggestion?: boolean;
}

/**
 * 404 Not Found component
 * Uses Tebra design system with Growth Teal accents
 */
export function NotFound({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  className,
  showSearchSuggestion = true,
}: NotFoundProps) {
  return (
    <div className={cn("flex min-h-[60vh] items-center justify-center p-4", className)}>
      <CardWrapper className="max-w-md text-center">
        {/* Icon with teal accent */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
          <FileQuestion className="h-8 w-8 text-teal" />
        </div>

        {/* 404 indicator */}
        <p className="mb-2 text-4xl font-bold text-teal">404</p>

        {/* Title */}
        <h1 className="mb-2 text-xl font-semibold text-foreground-strong">{title}</h1>

        {/* Message */}
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>

        {/* Navigation suggestions */}
        <div className="mb-6 rounded-lg bg-muted/30 p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Try one of these:</p>
          <ul className="space-y-2 text-left text-sm">
            <li>
              <a href="/home" className="flex items-center gap-2 text-teal hover:underline">
                <Home className="h-4 w-4" />
                Dashboard
              </a>
            </li>
            <li>
              <a href="/home/patients" className="flex items-center gap-2 text-teal hover:underline">
                <Search className="h-4 w-4" />
                Patients
              </a>
            </li>
            <li>
              <a href="/home/schedule" className="flex items-center gap-2 text-teal hover:underline">
                <Search className="h-4 w-4" />
                Schedule
              </a>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="gap-2">
            <a href="/home">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </a>
          </Button>

          <Button variant="ghost" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Search suggestion */}
        {showSearchSuggestion && (
          <p className="mt-6 text-xs text-muted-foreground">
            Need help finding something? Try using the search bar or voice commands.
          </p>
        )}
      </CardWrapper>
    </div>
  );
}
