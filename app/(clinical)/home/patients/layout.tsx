import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Patients",
  description: "Patient roster and 360-degree clinical views",
};

export default function PatientsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
