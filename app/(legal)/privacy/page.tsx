import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1>Privacy Policy</h1>
      <p className="lead text-muted-foreground">Last updated: February 2026</p>

      <div className="border-warning/50 bg-warning/10 my-6 rounded-lg border p-4">
        <p className="text-warning-foreground m-0 text-sm">
          <strong>Note:</strong> This is a placeholder document for demonstration purposes. Final
          privacy policy will be provided before production launch.
        </p>
      </div>

      <h2>1. Information We Collect</h2>
      <p>
        Tebra Mental Health collects information necessary to provide our practice management
        services:
      </p>
      <ul>
        <li>
          <strong>Account Information:</strong> Name, email, practice details
        </li>
        <li>
          <strong>Patient Data:</strong> PHI entered by healthcare providers (governed by BAA)
        </li>
        <li>
          <strong>Usage Data:</strong> Service interaction logs for security and improvement
        </li>
        <li>
          <strong>Technical Data:</strong> Device information, IP addresses, browser type
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide and maintain the Service</li>
        <li>Process transactions and send related information</li>
        <li>Send administrative information and updates</li>
        <li>Respond to inquiries and provide support</li>
        <li>Monitor and analyze usage patterns for improvements</li>
        <li>Detect and prevent fraud or security incidents</li>
      </ul>

      <h2>3. Protected Health Information (PHI)</h2>
      <p>
        PHI is handled in accordance with HIPAA regulations and our Business Associate Agreement.
        We:
      </p>
      <ul>
        <li>Only access PHI when necessary to provide support or as required by law</li>
        <li>Never sell or share PHI for marketing purposes</li>
        <li>Implement strict access controls and audit logging</li>
        <li>Encrypt all PHI at rest and in transit</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain data for as long as your account is active or as needed to provide services.
        Healthcare records are retained in accordance with applicable state and federal
        requirements.
      </p>

      <h2>5. Data Security</h2>
      <p>We implement comprehensive security measures:</p>
      <ul>
        <li>SOC 2 Type II certified infrastructure</li>
        <li>Regular third-party security assessments</li>
        <li>Employee security training and background checks</li>
        <li>Incident response procedures</li>
      </ul>

      <h2>6. Your Rights</h2>
      <p>Depending on your location, you may have rights to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Delete your data (subject to legal requirements)</li>
        <li>Export your data in a portable format</li>
        <li>Opt out of certain data processing</li>
      </ul>

      <h2>7. Third-Party Services</h2>
      <p>We may use third-party services that have their own privacy policies:</p>
      <ul>
        <li>Cloud infrastructure providers (AWS, GCP)</li>
        <li>Payment processors</li>
        <li>Analytics services (anonymized data only)</li>
      </ul>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        Our Service is not directed to children under 13. We do not knowingly collect personal
        information from children. Patient records for minors are maintained by their healthcare
        providers in accordance with applicable laws.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. We will notify you of any material changes
        via email or prominent notice on our Service.
      </p>

      <h2>10. Contact Us</h2>
      <p>For privacy-related inquiries:</p>
      <p>
        <strong>Email:</strong> <a href="mailto:privacy@tebra.com">privacy@tebra.com</a>
        <br />
        <strong>Data Protection Officer:</strong> <a href="mailto:dpo@tebra.com">dpo@tebra.com</a>
      </p>
    </div>
  );
}
