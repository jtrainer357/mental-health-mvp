import { PageBackground } from "@/design-system/components/ui/page-background";
import { ActionOrchestrationModal } from "@/src/components/orchestration/ActionOrchestrationModal";
import { VoiceProvider } from "@/src/components/voice";
import { QueryProvider } from "@/src/lib/queries/query-provider";
import { SessionProvider } from "@/src/components/auth/SessionProvider";

export default function ClinicalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <VoiceProvider>
          <PageBackground>{children}</PageBackground>
          <ActionOrchestrationModal />
        </VoiceProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
