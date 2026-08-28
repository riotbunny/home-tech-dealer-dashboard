import React from 'react';
import { Users, History, Calendar, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Interactive Navigation Toggle between Live Leads (Sheet 1) and Historical Log (Sheet 3)
 */
export default function ViewToggle({ activeView, onViewChange, liveCount = 0, historicalCount = 0 }) {
  return (
    <div className="flex items-center justify-center sm:justify-start mb-6">
      <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        
        {/* Tab 1: Live Leads (Sheet 1) */}
        <button
          onClick={() => onViewChange('live')}
          className={`flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${
            activeView === 'live'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            {activeView === 'live' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              activeView === 'live' ? 'bg-emerald-200' : 'bg-slate-500'
            }`} />
          </span>
          <Users className="h-4 w-4" />
          <span>Live Leads (Sheet 1)</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
            activeView === 'live' 
              ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-400/30' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {liveCount}
          </span>
        </button>

        {/* Tab 2: Historical Log (Sheet 3) */}
        <button
          onClick={() => onViewChange('historical')}
          className={`flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${
            activeView === 'historical'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Historical Log (Sheet 3)</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
            activeView === 'historical' 
              ? 'bg-purple-950/60 text-purple-200 border border-purple-400/30' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {historicalCount}d
          </span>
        </button>

      </div>
    </div>
  );
}
