import Link from "next/link";
import { Github, Coffee } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              tmpmail<span className="text-indigo-600 dark:text-indigo-400">.dev</span>
            </span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:justify-end">
            <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms of Service</Link>
            <Link
              href="https://ko-fi.com/tmpmail"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Buy Me a Coffee
            </Link>
            <span className="hidden sm:block w-px h-4 bg-zinc-300 dark:bg-zinc-700" />
            <Link
              href="https://github.com/kirazizi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all text-xs font-medium shadow-sm"
            >
              <Github className="h-3.5 w-3.5" />
              kirazizi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
