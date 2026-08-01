'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <h2 className="text-lg font-bold text-rose-400 mb-2">Something went wrong</h2>
          <p className="text-xs text-slate-400 mb-4">{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
