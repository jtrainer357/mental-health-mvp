import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service" };
export default function TermsPage() {
  return (
    <article className="prose max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-sm text-gray-500">Last updated: February 2026</p>
      <div className="my-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="m-0 text-sm text-amber-800">
          <strong>Placeholder:</strong> Full terms will be provided by legal counsel.
        </p>
      </div>
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By using Tebra Mental Health, you agree to these terms.</p>
      </section>
      <section>
        <h2>2. HIPAA Compliance</h2>
        <p>Users handling PHI must execute a BAA with Tebra.</p>
      </section>
      <section>
        <h2>3. Contact</h2>
        <p>
          Email:{" "}
          <a href="mailto:legal@tebra.com" className="text-teal-dark">
            legal@tebra.com
          </a>
        </p>
      </section>
    </article>
  );
}
