import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Tebra Mental Health practice management platform",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "February 2026";

  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-8">
        <p className="text-sm text-amber-800 m-0">
          <strong>Placeholder Notice:</strong> This is a placeholder document. The complete
          Privacy Policy will be provided by Tebra legal counsel prior to production deployment.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
        <p className="text-gray-700">
          Tebra, Inc. (&quot;Tebra,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
          committed to protecting the privacy and security of the information we collect. This
          Privacy Policy describes how we collect, use, disclose, and safeguard your information
          when you use our Tebra Mental Health platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
        <p className="text-gray-700 mb-4">We collect information you provide directly to us:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Account Information:</strong> Name, email address, phone number, practice name, professional credentials</li>
          <li><strong>Practice Information:</strong> NPI number, practice address, specialty, state licensure</li>
          <li><strong>Usage Information:</strong> How you interact with our Service, features used, and actions taken</li>
          <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Protected Health Information (PHI)</h2>
        <p className="text-gray-700">
          As a healthcare technology platform, we may process Protected Health Information (PHI)
          on behalf of our users. The handling of PHI is governed by our Business Associate
          Agreement (BAA) and complies with HIPAA.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
        <p className="text-gray-700">
          We implement appropriate technical and organizational measures to protect your
          information against unauthorized access, alteration, disclosure, or destruction.
          This includes encryption at rest and in transit, access controls, and regular security assessments.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
        <p className="text-gray-700 mb-4">Depending on your location, you may have rights to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Request deletion of your information</li>
          <li>Object to or restrict certain processing</li>
          <li>Data portability</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
        <p className="text-gray-700">
          For questions about this Privacy Policy, please contact us at:{" "}
          <a href="mailto:privacy@tebra.com" className="text-teal-dark hover:underline">
            privacy@tebra.com
          </a>
        </p>
      </section>
    </article>
  );
}
