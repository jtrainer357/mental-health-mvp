"use client";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { LeftNav } from "../left-nav";
import { HeaderSearch } from "../header-search";

type ActivePage = "home" | "patients" | "schedule" | "messages" | "billing" | "marketing";

interface PageShellProps {
  activePage?: ActivePage;
  children: React.ReactNode;
  /** Classes for the inner content wrapper div. Defaults to "mx-auto max-w-[1600px]". */
  className?: string;
  /** Override the main element classes (e.g. for pages without vertical padding). */
  mainClassName?: string;
  /** Content rendered outside the shell wrapper but inside the root container (e.g. FABs, modals). */
  outerChildren?: React.ReactNode;
}

export function PageShell({
  activePage,
  children,
  className,
  mainClassName,
  outerChildren,
}: PageShellProps) {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <AnimatedBackground />
      {outerChildren}
      <LeftNav activePage={activePage} />
      <div className="md:pl-24">
        <HeaderSearch />
        <main
          id="main-content"
          role="main"
          aria-label="Dashboard content"
          className={mainClassName || "px-4 py-4 sm:px-6 sm:py-6 md:py-8"}
        >
          <PageTransition>
            <div className={className || "mx-auto max-w-[1600px]"}>{children}</div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
