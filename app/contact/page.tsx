"use client";

import Link from "next/link";
import { ArrowLeft, AtSign, LifeBuoy, Bug, HelpCircle } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <h1 className="text-4xl font-extrabold tracking-tight mb-6">Contact Tmp Mail</h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12 leading-relaxed">
                    Have questions, suggestions, or need help? We'd love to hear from you.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
                        <AtSign size={22} className="text-zinc-400 dark:text-zinc-500 mb-4" />
                        <h3 className="font-semibold mb-2">General Inquiries</h3>
                        <p className="text-sm text-zinc-500 mb-4">
                            For general questions about the service or partnership opportunities.
                        </p>
                        <a href="mailto:contact@tmpmail.dev" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                            contact@tmpmail.dev
                        </a>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
                        <LifeBuoy size={22} className="text-zinc-400 dark:text-zinc-500 mb-4" />
                        <h3 className="font-semibold mb-2">Support</h3>
                        <p className="text-sm text-zinc-500 mb-4">
                            Need help with the service? Our support team is here to assist you.
                        </p>
                        <a href="mailto:support@tmpmail.dev" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                            support@tmpmail.dev
                        </a>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
                        <Bug size={22} className="text-zinc-400 dark:text-zinc-500 mb-4" />
                        <h3 className="font-semibold mb-2">Report a Bug</h3>
                        <p className="text-sm text-zinc-500 mb-4">
                            Found something broken? Let us know so we can fix it quickly.
                        </p>
                        <a href="mailto:bugs@tmpmail.dev" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                            bugs@tmpmail.dev
                        </a>
                    </div>
                </div>

                <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-100 dark:bg-zinc-900/50 p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <HelpCircle size={20} /> FAQ
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-1">How long do emails last?</h3>
                            <p className="text-sm">Emails and addresses are automatically deleted after 1 hour session expiry.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-1">Is it really free?</h3>
                            <p className="text-sm">Yes, Tmp Mail is completely free to use without any hidden costs.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
