"use client";

import * as React from "react";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { CommunicationsPage } from "../_components/communications-page";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";

export default function CommunicationsRoute() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="messages" />

      {/* Main Content Wrapper */}
      <div className="md:pl-20">
        <HeaderSearch />

        <main
          id="main-content"
          role="main"
          aria-label="Communications content"
          className="px-4 sm:px-6"
        >
          <PageTransition>
            <CommunicationsPage />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
