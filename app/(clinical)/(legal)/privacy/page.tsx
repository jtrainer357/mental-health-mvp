import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function PrivacyPage() {
  return (
    <article className="prose max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: February 2026</p>
      <div className="my-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="m-0 text-sm text-amber-800">
          <strong>Placeholder:</strong> Full privacy policy will be provided by legal counsel.
        </p>
      </div>
      <section>
        <h2>1. Data Collection</h2>
        <p>We collect account, practice, and usage information.</p>
      </section>
      <section>
        <h2>2. Security</h2>
        <p>We use encryption and access controls to protect data.</p>
      </section>
      <section>
        <h2>3. Contact</h2>
        <p>
          Email:{" "}
          <a href="mailto:privacy@tebra.com" className="text-teal-dark">
            privacy@tebra.com
          </a>
        </p>
      </section>
    </article>
  );
}
