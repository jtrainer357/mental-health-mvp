import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Tebra Mental Health practice management platform",
};

export default function TermsOfServicePage() {
  const lastUpdated = "February 2026";

  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-8">
        <p className="text-sm text-amber-800 m-0">
          <strong>Placeholder Notice:</strong> This is a placeholder document. The complete Terms
          of Service will be provided by Tebra legal counsel prior to production deployment.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-700">
          By accessing or using the Tebra Mental Health platform (&quot;Service&quot;), you agree
          to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these
          Terms, do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
        <p className="text-gray-700">
          Tebra Mental Health is a practice management platform designed for mental health
          practitioners. The Service provides tools for patient management, scheduling,
          clinical documentation, billing, and secure communications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
        <p className="text-gray-700 mb-4">To use the Service, you must create an account. You are responsible for:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use</li>
          <li>Ensuring your account information is accurate and current</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. HIPAA Compliance</h2>
        <p className="text-gray-700">
          The Service is designed to comply with the Health Insurance Portability and
          Accountability Act (HIPAA). Users who handle Protected Health Information (PHI)
          must execute a Business Associate Agreement (BAA) with Tebra prior to using the
          Service for such purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
        <p className="text-gray-700 mb-4">You agree not to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Transmit any viruses, malware, or other harmful code</li>
          <li>Violate any applicable laws or regulations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Information</h2>
        <p className="text-gray-700">
          For questions about these Terms, please contact us at:{" "}
          <a href="mailto:legal@tebra.com" className="text-teal-dark hover:underline">
            legal@tebra.com
          </a>
        </p>
      </section>
    </article>
  );
}
