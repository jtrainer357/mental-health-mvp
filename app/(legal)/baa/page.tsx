import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Associate Agreement",
  description: "HIPAA Business Associate Agreement for Tebra Mental Health",
};

export default function BusinessAssociateAgreementPage() {
  const lastUpdated = "February 2026";

  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Associate Agreement</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-8">
        <p className="text-sm text-amber-800 m-0">
          <strong>Placeholder Notice:</strong> This is a placeholder document. The complete
          Business Associate Agreement will be provided by Tebra legal counsel prior to
          production deployment. A fully executed BAA is required before processing PHI.
        </p>
      </div>

      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 mb-8">
        <p className="text-sm text-teal-800 m-0">
          <strong>HIPAA Requirement:</strong> Under HIPAA, a Business Associate Agreement must be
          in place between a Covered Entity and any Business Associate that creates, receives,
          maintains, or transmits Protected Health Information (PHI) on its behalf.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Definitions</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>&quot;Covered Entity&quot;</strong> means the healthcare provider or practice that enters into this Agreement</li>
          <li><strong>&quot;Business Associate&quot;</strong> means Tebra, Inc., which performs services on behalf of the Covered Entity</li>
          <li><strong>&quot;Protected Health Information&quot; (PHI)</strong> means individually identifiable health information as defined by HIPAA</li>
          <li><strong>&quot;Electronic PHI&quot; (ePHI)</strong> means PHI transmitted or maintained in electronic form</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Obligations of Business Associate</h2>
        <p className="text-gray-700 mb-4">Tebra agrees to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Not use or disclose PHI other than as permitted by this Agreement or as required by law</li>
          <li>Implement appropriate safeguards to prevent unauthorized use or disclosure of PHI</li>
          <li>Report to Covered Entity any use or disclosure not provided for by this Agreement</li>
          <li>Ensure that any subcontractors agree to the same restrictions</li>
          <li>Make PHI available for individual access rights under HIPAA</li>
          <li>Comply with applicable requirements of the HIPAA Security Rule</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Security Measures</h2>
        <p className="text-gray-700 mb-4">Business Associate shall implement safeguards including:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Encryption of ePHI at rest and in transit</li>
          <li>Access controls and audit logging</li>
          <li>Regular security risk assessments</li>
          <li>Employee training on HIPAA requirements</li>
          <li>Incident response procedures</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Breach Notification</h2>
        <p className="text-gray-700">
          Business Associate shall report any Breach of Unsecured PHI to Covered Entity without
          unreasonable delay and in no case later than 60 days after discovery.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. How to Execute a BAA</h2>
        <p className="text-gray-700">
          To execute a Business Associate Agreement with Tebra, please contact our compliance
          team at:{" "}
          <a href="mailto:compliance@tebra.com" className="text-teal-dark hover:underline">
            compliance@tebra.com
          </a>
        </p>
      </section>
    </article>
  );
}
