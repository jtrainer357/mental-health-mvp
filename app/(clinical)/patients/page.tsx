"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PatientsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main patients page
    router.replace("/home/patients");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}
