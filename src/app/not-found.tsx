import Link from "next/link";
import { House, MagnifyingGlass } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <h1 className="text-8xl font-bold text-[--accent] mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">Page Not Found</h2>
        <p className="text-[--muted] mb-8 leading-relaxed text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary"
          >
            <House className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/search"
            className="btn-secondary"
          >
            <MagnifyingGlass className="w-4 h-4" />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
