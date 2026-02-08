import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Associate Agreement",
};

export default function BaaPage() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1>Business Associate Agreement (BAA)</h1>
      <p className="lead text-muted-foreground">Last updated: February 2026</p>

      <div className="border-warning/50 bg-warning/10 my-6 rounded-lg border p-4">
        <p className="text-warning-foreground m-0 text-sm">
          <strong>Note:</strong> This is a placeholder document for demonstration purposes. The
          actual BAA will be executed separately and provided before production use.
        </p>
      </div>

      <h2>Overview</h2>
      <p>
        This Business Associate Agreement (&quot;BAA&quot;) is entered into between Tebra, Inc.
        (&quot;Business Associate&quot;) and the healthcare provider (&quot;Covered Entity&quot;) to
        ensure compliance with the Health Insurance Portability and Accountability Act of 1996
        (&quot;HIPAA&quot;) and the Health Information Technology for Economic and Clinical Health
        Act (&quot;HITECH&quot;).
      </p>

      <h2>1. Definitions</h2>
      <ul>
        <li>
          <strong>Protected Health Information (PHI):</strong> Individually identifiable health
          information transmitted or maintained in any form or medium.
        </li>
        <li>
          <strong>Electronic Protected Health Information (ePHI):</strong> PHI that is transmitted
          or maintained in electronic form.
        </li>
        <li>
          <strong>Breach:</strong> The acquisition, access, use, or disclosure of PHI in a manner
          not permitted by the Privacy Rule.
        </li>
      </ul>

      <h2>2. Obligations of Business Associate</h2>
      <p>Tebra agrees to:</p>
      <ul>
        <li>Use PHI only as permitted by this Agreement or as required by law</li>
        <li>Implement appropriate safeguards to prevent unauthorized use or disclosure</li>
        <li>Report any use or disclosure not provided for by this Agreement</li>
        <li>Report any Security Incident or Breach as required by HIPAA/HITECH</li>
        <li>Make available PHI for access by individuals as required</li>
        <li>Make available PHI for amendment as required</li>
        <li>Provide accounting of disclosures as required</li>
        <li>Make internal practices and records available to HHS for compliance review</li>
        <li>Ensure subcontractors agree to the same restrictions and conditions</li>
        <li>Return or destroy all PHI upon termination where feasible</li>
      </ul>

      <h2>3. Permitted Uses and Disclosures</h2>
      <p>Business Associate may use or disclose PHI:</p>
      <ul>
        <li>To perform services under the service agreement with Covered Entity</li>
        <li>For proper management and administration of Business Associate</li>
        <li>To provide Data Aggregation services as permitted by 45 CFR 164.504(e)(2)(i)(B)</li>
        <li>As required by law</li>
      </ul>

      <h2>4. Security Requirements</h2>
      <p>Tebra implements the following security measures:</p>
      <ul>
        <li>Administrative safeguards including workforce training and security policies</li>
        <li>Physical safeguards including facility access controls and workstation security</li>
        <li>Technical safeguards including access controls, audit controls, and encryption</li>
        <li>Regular risk assessments and security audits</li>
        <li>Incident response and breach notification procedures</li>
      </ul>

      <h2>5. Breach Notification</h2>
      <p>In the event of a Breach of unsecured PHI, Business Associate shall:</p>
      <ul>
        <li>Notify Covered Entity within 10 business days of discovery</li>
        <li>Provide sufficient information for Covered Entity to meet notification obligations</li>
        <li>Cooperate in investigation and mitigation efforts</li>
        <li>Document all breaches regardless of significance</li>
      </ul>

      <h2>6. Term and Termination</h2>
      <ul>
        <li>This Agreement is effective upon acceptance and continues until terminated</li>
        <li>Either party may terminate upon material breach if not cured within 30 days</li>
        <li>Upon termination, Business Associate will return or destroy all PHI</li>
        <li>Certain provisions survive termination as required for compliance</li>
      </ul>

      <h2>7. Subcontractors</h2>
      <p>
        Tebra ensures that any subcontractors who create, receive, maintain, or transmit PHI on
        behalf of Tebra agree to the same restrictions, conditions, and requirements that apply to
        Tebra with respect to such information.
      </p>

      <h2>8. Amendments</h2>
      <p>
        This Agreement may be amended by mutual written consent of both parties. Amendments required
        by changes to HIPAA regulations shall be incorporated automatically upon the effective date
        of such regulations.
      </p>

      <h2>Contact Information</h2>
      <p>For BAA-related inquiries:</p>
      <p>
        <strong>HIPAA Compliance Officer:</strong>{" "}
        <a href="mailto:compliance@tebra.com">compliance@tebra.com</a>
        <br />
        <strong>Security Team:</strong> <a href="mailto:security@tebra.com">security@tebra.com</a>
      </p>
    </div>
  );
}
