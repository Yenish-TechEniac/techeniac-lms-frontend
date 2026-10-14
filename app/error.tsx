"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report error to an external observability service in production
    // Avoid console.log per strict code conventions
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        An unexpected error occurred while rendering this page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
