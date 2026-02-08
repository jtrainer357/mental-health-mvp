import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1>Terms of Service</h1>
      <p className="lead text-muted-foreground">Last updated: February 2026</p>

      <div className="border-warning/50 bg-warning/10 my-6 rounded-lg border p-4">
        <p className="text-warning-foreground m-0 text-sm">
          <strong>Note:</strong> This is a placeholder document for demonstration purposes. Final
          legal terms will be provided before production launch.
        </p>
      </div>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using Tebra Mental Health (&quot;the Service&quot;), you agree to be bound
        by these Terms of Service. If you do not agree to these terms, please do not use the
        Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        Tebra Mental Health provides a cloud-based practice management platform designed
        specifically for mental health professionals. The Service includes patient scheduling,
        clinical documentation, billing, and related healthcare management tools.
      </p>

      <h2>3. HIPAA Compliance</h2>
      <p>
        The Service is designed to comply with the Health Insurance Portability and Accountability
        Act (HIPAA). Users must execute a Business Associate Agreement (BAA) with Tebra before using
        the Service for Protected Health Information (PHI).
      </p>

      <h2>4. User Responsibilities</h2>
      <ul>
        <li>Maintain the confidentiality of account credentials</li>
        <li>Ensure appropriate use of PHI in accordance with HIPAA</li>
        <li>Report any security breaches immediately</li>
        <li>Comply with all applicable laws and regulations</li>
      </ul>

      <h2>5. Data Security</h2>
      <p>We implement industry-standard security measures including:</p>
      <ul>
        <li>End-to-end encryption for data in transit</li>
        <li>AES-256 encryption for data at rest</li>
        <li>Multi-factor authentication options</li>
        <li>Regular security audits and penetration testing</li>
        <li>Automatic session timeouts (15 minutes of inactivity)</li>
      </ul>

      <h2>6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Tebra shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising from your use of the
        Service.
      </p>

      <h2>7. Modifications to Terms</h2>
      <p>
        Tebra reserves the right to modify these Terms at any time. Users will be notified of
        significant changes via email or in-app notification.
      </p>

      <h2>8. Contact Information</h2>
      <p>For questions about these Terms, please contact:</p>
      <p>
        <strong>Email:</strong> <a href="mailto:legal@tebra.com">legal@tebra.com</a>
        <br />
        <strong>Address:</strong> Tebra, Inc., [Address Placeholder]
      </p>
    </div>
  );
}
