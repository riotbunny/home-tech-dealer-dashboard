import React from 'react';
import { SearchX, RefreshCw } from 'lucide-react';

/**
 * Empty state representation when no leads match the current filters
 */
export default function EmptyState({ onReset, message = 'No leads found matching your criteria.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mb-4 shadow-inner">
        <SearchX className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">No Lead Matches</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">
        {message}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold tracking-wide uppercase transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Clear All Filters
        </button>
      )}
    </div>
  );
}
