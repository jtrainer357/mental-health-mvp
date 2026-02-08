import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Tebra Mental Health practice management platform",
};

/**
 * Privacy Policy Placeholder Page
 *
 * This is a placeholder for the full Privacy Policy document.
 * The actual legal content should be reviewed and approved by legal counsel.
 */
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
          <li>
            <strong>Account Information:</strong> Name, email address, phone number, practice
            name, professional credentials, and login credentials
          </li>
          <li>
            <strong>Practice Information:</strong> NPI number, practice address, specialty,
            state licensure information
          </li>
          <li>
            <strong>Usage Information:</strong> How you interact with our Service, features used,
            and actions taken
          </li>
          <li>
            <strong>Device Information:</strong> IP address, browser type, operating system,
            and device identifiers
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          3. Protected Health Information (PHI)
        </h2>
        <p className="text-gray-700">
          As a healthcare technology platform, we may process Protected Health Information (PHI)
          on behalf of our users. The handling of PHI is governed by our Business Associate
          Agreement (BAA) and complies with the Health Insurance Portability and Accountability
          Act (HIPAA).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Provide, maintain, and improve our Service</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices, updates, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Information Sharing</h2>
        <p className="text-gray-700 mb-4">We may share your information:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>With service providers who perform services on our behalf</li>
          <li>To comply with legal obligations or respond to lawful requests</li>
          <li>To protect the rights, privacy, safety, or property of Tebra or others</li>
          <li>In connection with a merger, acquisition, or sale of assets</li>
          <li>With your consent or at your direction</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
        <p className="text-gray-700">
          We implement appropriate technical and organizational measures to protect your
          information against unauthorized access, alteration, disclosure, or destruction.
          This includes encryption at rest and in transit, access controls, regular security
          assessments, and employee training.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
        <p className="text-gray-700">
          We retain your information for as long as necessary to provide the Service, comply
          with legal obligations, resolve disputes, and enforce our agreements. Healthcare
          records are retained in accordance with applicable state and federal requirements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
        <p className="text-gray-700 mb-4">Depending on your location, you may have rights to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Request deletion of your information</li>
          <li>Object to or restrict certain processing</li>
          <li>Data portability</li>
          <li>Withdraw consent</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
        <p className="text-gray-700">
          Our Service is not directed to children under 13. We do not knowingly collect
          personal information from children under 13. If we learn we have collected such
          information, we will delete it promptly.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
        <p className="text-gray-700">
          We may update this Privacy Policy from time to time. We will notify you of any
          changes by posting the new Privacy Policy on this page and updating the &quot;Last
          updated&quot; date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
        <p className="text-gray-700">
          For questions about this Privacy Policy or our privacy practices, please contact us
          at:{" "}
          <a href="mailto:privacy@tebra.com" className="text-teal-dark hover:underline">
            privacy@tebra.com
          </a>
        </p>
      </section>
    </article>
  );
}
