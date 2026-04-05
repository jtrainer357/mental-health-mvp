import type { Metadata } from "next";
export const metadata: Metadata = { title: "Business Associate Agreement" };
export default function BaaPage() {
  return (
    <article className="prose max-w-none">
      <h1>Business Associate Agreement</h1>
      <p className="text-sm text-gray-500">Last updated: February 2026</p>
      <div className="my-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="m-0 text-sm text-amber-800">
          <strong>Placeholder:</strong> Full BAA will be provided by legal counsel.
        </p>
      </div>
      <div className="my-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
        <p className="m-0 text-sm text-teal-800">
          <strong>HIPAA Requirement:</strong> A BAA must be in place before processing PHI.
        </p>
      </div>
      <section>
        <h2>1. Obligations</h2>
        <p>Tebra implements safeguards and complies with HIPAA Security Rule.</p>
      </section>
      <section>
        <h2>2. Contact</h2>
        <p>
          To execute a BAA:{" "}
          <a href="mailto:compliance@tebra.com" className="text-teal-dark">
            compliance@tebra.com
          </a>
        </p>
      </section>
    </article>
  );
}
