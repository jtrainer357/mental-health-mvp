"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PatientDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  useEffect(() => {
    // Redirect to the patients page with the patient ID as a query param
    router.replace(`/home/patients?patient=${patientId}`);
  }, [patientId, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}
