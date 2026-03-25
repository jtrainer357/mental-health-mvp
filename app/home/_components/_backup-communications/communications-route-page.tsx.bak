"use client";

import * as React from "react";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { CommunicationsPage } from "../_components/communications-page";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";

export default function CommunicationsRoute() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="messages" />

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        <HeaderSearch />

        <main
          id="main-content"
          role="main"
          aria-label="Communications content"
          className="px-4 py-4 sm:px-6 sm:py-6 md:py-8"
        >
          <PageTransition>
            <div className="mx-auto flex max-w-[1800px] flex-col lg:h-[calc(100vh-8.5rem)]">
              <CommunicationsPage />
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
