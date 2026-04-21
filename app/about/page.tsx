import Link from "next/link";
import { ArrowLeft, EyeOff, Timer, MailX, Coffee } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-extrabold tracking-tight mb-6">About Tmp Mail</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12 leading-relaxed">
          We provide a fast, secure, and disposable email service designed to keep your real inbox clean and your personal data safe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
            <EyeOff size={22} className="text-zinc-400 dark:text-zinc-500 mb-4" />
            <h3 className="font-semibold mb-2">Private by Design</h3>
            <p className="text-sm text-zinc-500">
              No registration required. We don't ask for your personal information.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
            <Timer size={22} className="text-zinc-400 dark:text-zinc-500 mb-4" />
            <h3 className="font-semibold mb-2">Auto-Expiring</h3>
            <p className="text-sm text-zinc-500">
              Emails and sessions are automatically deleted after 1 hour for your security.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
            <MailX size={22} className="text-zinc-400 dark:text-zinc-500 mb-4" />
            <h3 className="font-semibold mb-2">Spam-Free Inbox</h3>
            <p className="text-sm text-zinc-500">
              Keep your real inbox clean by using disposable addresses for sign-ups.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Why use Tmp Mail?</h2>
          <p>
            The internet is full of services asking for your email address. Often, this leads to an inbox full of spam, promotional newsletters, and potential data leaks.
          </p>
          <p>
            Tmp Mail is the solution. Use our disposable addresses to bypass sign-up verifications, test services, or just keep your primary email address private. When you're done, simply close the page. The address and all its messages will vanish.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Support the Project</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                Tmp Mail is free. If it saves your inbox, consider buying us a coffee to keep the servers running.
              </p>
            </div>
            <a
              href="https://ko-fi.com/tmpmail"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-3 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold text-sm border border-zinc-800 dark:border-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
            >
              <Coffee size={16} />
              Buy me a coffee
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
