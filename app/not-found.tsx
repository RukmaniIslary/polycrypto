"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl font-display font-bold text-accent-blue mb-4">404</div>
        <p className="text-text-secondary mb-6">Page not found</p>
        <Link href="/markets" className="bg-accent-blue text-white px-6 py-3 rounded-xl font-medium">
          Go to Markets
        </Link>
      </div>
    </div>
  );
}
