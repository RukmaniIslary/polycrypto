"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-5xl font-display font-bold text-accent-red mb-3">Oops</div>
        <p className="text-text-secondary mb-6 text-sm">{error.message || "Something went wrong"}</p>
        <button
          onClick={reset}
          className="bg-accent-blue text-white px-6 py-3 rounded-xl font-medium text-sm tap-scale"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
