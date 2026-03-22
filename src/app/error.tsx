"use client";

import { ArrowCounterClockwise, House } from "@/components/icons";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-16 h-16 bg-[--accent-soft] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-[--accent]">!</span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">Something went wrong</h2>
        <p className="text-[--muted] mb-8 leading-relaxed text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary"
          >
            <ArrowCounterClockwise className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary"
          >
            <House className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
