import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Associate Agreement",
  description: "HIPAA Business Associate Agreement for Tebra Mental Health",
};

/**
 * Business Associate Agreement (BAA) Placeholder Page
 *
 * This is a placeholder for the full BAA document required under HIPAA.
 * The actual legal content should be reviewed and approved by legal counsel.
 */
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
          <strong>HIPAA Requirement:</strong> Under the Health Insurance Portability and
          Accountability Act (HIPAA), a Business Associate Agreement must be in place between
          a Covered Entity and any Business Associate that creates, receives, maintains, or
          transmits Protected Health Information (PHI) on its behalf.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Definitions</h2>
        <p className="text-gray-700 mb-4">
          For purposes of this Agreement, the following terms shall have the meanings set forth
          below:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <strong>&quot;Covered Entity&quot;</strong> means the healthcare provider or practice
            that enters into this Agreement with Tebra
          </li>
          <li>
            <strong>&quot;Business Associate&quot;</strong> means Tebra, Inc., which performs
            services on behalf of the Covered Entity involving the use or disclosure of PHI
          </li>
          <li>
            <strong>&quot;Protected Health Information&quot; (PHI)</strong> means individually
            identifiable health information as defined by HIPAA
          </li>
          <li>
            <strong>&quot;Electronic PHI&quot; (ePHI)</strong> means PHI that is transmitted or
            maintained in electronic form
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          2. Obligations of Business Associate
        </h2>
        <p className="text-gray-700 mb-4">Tebra agrees to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            Not use or disclose PHI other than as permitted by this Agreement or as required by
            law
          </li>
          <li>
            Implement appropriate safeguards to prevent unauthorized use or disclosure of PHI
          </li>
          <li>
            Report to Covered Entity any use or disclosure of PHI not provided for by this
            Agreement, including any Security Incident or Breach
          </li>
          <li>
            Ensure that any subcontractors agree to the same restrictions and conditions as
            contained in this Agreement
          </li>
          <li>
            Make PHI available to Covered Entity for individual access rights under HIPAA
          </li>
          <li>
            Make PHI available for amendment and incorporate any amendments as required
          </li>
          <li>
            Maintain and make available information required for accounting of disclosures
          </li>
          <li>
            Comply with applicable requirements of the HIPAA Security Rule
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Permitted Uses and Disclosures</h2>
        <p className="text-gray-700 mb-4">
          Business Associate may use or disclose PHI only as follows:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            As necessary to perform services under the underlying service agreement
          </li>
          <li>
            For the proper management and administration of Business Associate
          </li>
          <li>
            As required by law
          </li>
          <li>
            For data aggregation services relating to the health care operations of Covered
            Entity
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Security Measures</h2>
        <p className="text-gray-700 mb-4">
          Business Associate shall implement administrative, physical, and technical safeguards
          including:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Encryption of ePHI at rest and in transit</li>
          <li>Access controls and audit logging</li>
          <li>Regular security risk assessments</li>
          <li>Employee training on HIPAA requirements</li>
          <li>Incident response procedures</li>
          <li>Business continuity and disaster recovery plans</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Breach Notification</h2>
        <p className="text-gray-700">
          Business Associate shall report any Breach of Unsecured PHI to Covered Entity without
          unreasonable delay and in no case later than 60 days after discovery. The report shall
          include identification of affected individuals, circumstances of the Breach, types of
          information involved, and steps taken to mitigate harm.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Term and Termination</h2>
        <p className="text-gray-700 mb-4">
          This Agreement shall be effective upon execution and shall terminate when:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>All PHI is destroyed or returned to Covered Entity</li>
          <li>The underlying service agreement terminates</li>
          <li>Either party terminates for material breach not cured within 30 days</li>
        </ul>
        <p className="text-gray-700 mt-4">
          Upon termination, Business Associate shall return or destroy all PHI in its possession
          and retain no copies, except where return or destruction is not feasible, in which case
          protections shall extend to such PHI.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Regulatory References</h2>
        <p className="text-gray-700 mb-4">This Agreement is governed by:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>HIPAA Privacy Rule (45 CFR Part 164, Subpart E)</li>
          <li>HIPAA Security Rule (45 CFR Part 164, Subpart C)</li>
          <li>HIPAA Breach Notification Rule (45 CFR Part 164, Subpart D)</li>
          <li>HITECH Act provisions</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">8. How to Execute a BAA</h2>
        <p className="text-gray-700">
          To execute a Business Associate Agreement with Tebra, please contact our compliance
          team at:{" "}
          <a href="mailto:compliance@tebra.com" className="text-teal-dark hover:underline">
            compliance@tebra.com
          </a>
        </p>
        <p className="text-gray-700 mt-4">
          Existing customers can request a BAA through their account settings or by contacting
          their account representative.
        </p>
      </section>
    </article>
  );
}
