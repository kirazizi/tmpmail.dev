import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 overflow-hidden">
      {/* Background blur decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* 404 gradient number */}
        <h1 className="text-[9rem] sm:text-[12rem] font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-400 dark:from-white dark:to-zinc-600 mb-4 select-none">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          This inbox doesn&apos;t exist
        </h2>

        {/* Description */}
        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed mb-8">
          Looks like this address got lost in the void. The page you&apos;re looking for
          may have expired, been moved, or never existed in the first place.
        </p>

        {/* CTA button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-all duration-200"
        >
          <MoveLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
