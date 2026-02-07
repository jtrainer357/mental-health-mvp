import "@/design-system/styles/globals.css";
import { PageBackground } from "@/design-system/components/ui/page-background";
import { ActionOrchestrationModal } from "@/src/components/orchestration/ActionOrchestrationModal";
import { VoiceProvider } from "@/src/components/voice";
import { QueryProvider } from "@/src/lib/queries/query-provider";
import { SkipLink } from "@/src/components/a11y";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Tebra Mental Health",
    template: "%s | Tebra Mental Health",
  },
  description: "AI-native practice management platform for mental health practitioners",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <QueryProvider>
          <VoiceProvider>
            <PageBackground>{children}</PageBackground>
            <ActionOrchestrationModal />
          </VoiceProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
