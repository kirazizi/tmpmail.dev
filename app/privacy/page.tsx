import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Your privacy is critically important to us. At Tmp Mail, we operate with a fundamental respect for your anonymity and data security. Tmp Mail is a <strong>receive-only</strong> service — we generate a disposable inbox so you can receive verification codes and confirmation emails without sharing your real email address.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">1. Information Collection</h2>
            <p>
              We act as a strict data conduit. We do not require any personal information (such as your real name, address, or phone number) to use our service. No account registration is needed — just open the app and a temporary inbox is instantly ready for you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">2. Email Content and Data Retention</h2>
            <p>
              Incoming emails and the temporary addresses themselves are ephemeral. They are automatically deleted permanently after a short period (typically 1 hour) or when the session expires. We do not archive or backup this data. Once deleted, it is unrecoverable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">3. Cookies and Local Storage</h2>
            <p>
              We use browser Local Storage solely to maintain your active session state (e.g., your current temporary email address and authentication token). This data resides on your device. We may use minimal technical cookies necessary for the operation of the website (e.g., load balancing), but we do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">4. Third-Party Services</h2>
            <p>
              Our service relies on upstream email providers for inbound mail processing. While we choose partners who prioritize privacy, please be aware that emails pass through these providers before reaching your inbox. Do not rely on this service for sensitive personal communications or long-term account recovery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">5. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this page. Your continued use of the service after any changes constitutes acceptance of the new policy.
            </p>
          </section>

          <div className="pt-8 text-sm text-zinc-400">
            Last updated: April 18, 2026
          </div>
        </div>
      </div>
    </div>
  );
}
