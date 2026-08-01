import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
        <h2 className="text-lg font-bold text-slate-100 mb-2">404 - Page Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The requested page could not be found.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
