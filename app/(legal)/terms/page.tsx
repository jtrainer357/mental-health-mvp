import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service", description: "Terms of Service for Tebra Mental Health" };

export default function TermsOfServicePage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-8">
        <p className="text-sm text-amber-800 m-0"><strong>Placeholder Notice:</strong> This is a placeholder document. The complete Terms of Service will be provided by Tebra legal counsel prior to production deployment.</p>
      </div>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-700">By accessing or using the Tebra Mental Health platform (&quot;Service&quot;), you agree to be bound by these Terms of Service.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
        <p className="text-gray-700">Tebra Mental Health is a practice management platform designed for mental health practitioners.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. HIPAA Compliance</h2>
        <p className="text-gray-700">The Service is designed to comply with HIPAA. Users who handle PHI must execute a BAA with Tebra.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Contact</h2>
        <p className="text-gray-700">For questions, contact us at: <a href="mailto:legal@tebra.com" className="text-teal-dark hover:underline">legal@tebra.com</a></p>
      </section>
    </article>
  );
}
