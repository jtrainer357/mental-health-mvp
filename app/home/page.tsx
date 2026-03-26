"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LeftNav } from "./_components/left-nav";
import { HeaderSearch } from "./_components/header-search";
import { DynamicCanvas } from "./_components/dynamic-canvas";
import { ScheduleAlertsWidget } from "./_components/schedule-alerts-widget";
import { BalanceAlertsWidget } from "./_components/balance-alerts-widget";
import { FeedbackWidget } from "./_components/feedback-widget";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { WelcomeModal } from "./_components/welcome-modal";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setupComplete = searchParams.get("setup_complete") === "true";
  const [showWelcome, setShowWelcome] = React.useState(false);

  // Show welcome modal if setup_complete is in URL
  React.useEffect(() => {
    if (setupComplete) {
      setShowWelcome(true);
      // Clean up URL by removing the query parameter
      router.replace("/home", { scroll: false });
    }
  }, [setupComplete, router]);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <AnimatedBackground />
      <WelcomeModal open={showWelcome} onOpenChange={setShowWelcome} />

      {/* Left Nav */}
      <LeftNav />

      {/* Main Content Wrapper */}
      <div className="md:pl-20">
        <HeaderSearch />

        <main
          id="main-content"
          role="main"
          aria-label="Dashboard content"
          className="px-4 py-4 sm:px-6 sm:py-6 md:py-8"
        >
          <PageTransition>
            <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:gap-2">
              {/* Main Content Area - Unified Card with Dynamic Canvas */}
              <CardWrapper className="flex min-h-[500px] min-w-0 flex-1 flex-col overflow-visible">
                <DynamicCanvas className="flex min-h-0 flex-1 flex-col" />
              </CardWrapper>

              {/* Right Sidebar Widgets - Hidden below lg, shown on lg+ */}
              <aside className="hidden w-[260px] shrink-0 flex-col gap-2 lg:flex xl:w-[300px] 2xl:w-[340px]">
                <ScheduleAlertsWidget />
                <BalanceAlertsWidget />
                <FeedbackWidget />
              </aside>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
