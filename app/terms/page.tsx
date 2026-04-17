import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Terms of Service</h1>

        <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            By accessing or using Tmp Mail, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our service.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">1. Use of Service</h2>
            <p>
              Tmp Mail is provided for personal, non-commercial use to protect your privacy and avoid spam. You agree not to use this service for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sending unsolicited email (spam).</li>
              <li>Illegal activities or promoting illegal content.</li>
              <li>Harassment, abuse, or harming others.</li>
              <li>Interfering with the proper operation of the service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">2. No Warranty ("As Is")</h2>
            <p>
              The service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding the reliability, accuracy, availability, or security of the service. We are not liable for any lost emails, data loss, or damages resulting from the use of this service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">3. Determining Expiry</h2>
            <p>
              Email addresses and messages provided by this service are temporary. We reserve the right to recycle domains, expire addresses, or delete data at any time without notice. Do not use this service for important accounts or long-term communication.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">4. Limitation of Liability</h2>
            <p>
              In no event shall Tmp Mail or its operators be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service.
            </p>
          </section>

          <div className="pt-8 text-sm text-zinc-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}
