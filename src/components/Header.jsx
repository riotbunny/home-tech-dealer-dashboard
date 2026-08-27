import React from 'react';
import { 
  RefreshCw, 
  Download, 
  Settings, 
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatRelativeTime } from '../utils/dateUtils';

/**
 * High-Contrast Operational Header with Dual Status (Sheets + Meta)
 */
export default function Header({
  isLiveSheet,
  isLiveMeta,
  isRefreshing,
  lastUpdated,
  onRefresh,
  onOpenSettings,
  onOpenMetaInsights,
  onExport
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 text-white shadow-lg shadow-emerald-500/20 font-black text-lg tracking-wider border border-emerald-400/30">
            HT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                Home Tech Dealer Leads
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700">
                Sheet 1 & Meta Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Operational Live Leads & Automated Daily Ad Spend
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Google Sheet Feed Status */}
          <div 
            onClick={onOpenSettings}
            title="Click to configure Google Sheet feed URL"
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-sm transition-all hover:scale-[1.02] ${
              isLiveSheet 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLiveSheet ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveSheet ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span>{isLiveSheet ? 'Sheet 1 Live' : 'Sheet 1 Sample'}</span>
          </div>

          {/* Meta API Status */}
          <div 
            onClick={onOpenMetaInsights}
            title="Click to view Meta Marketing API ad insights"
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-sm transition-all hover:scale-[1.02] ${
              isLiveMeta 
                ? 'bg-blue-950/60 border-blue-500/40 text-blue-300' 
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLiveMeta ? 'bg-blue-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveMeta ? 'bg-blue-500' : 'bg-amber-500'
              }`} />
            </span>
            <span>{isLiveMeta ? 'Meta Ads Live' : 'Meta Fallback'}</span>
          </div>

          {/* Sync All Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            title="Fetch latest leads and Meta spend"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync All'}</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white text-xs font-medium transition-all active:scale-95"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Feed URL Settings */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-medium transition-all active:scale-95"
            title="Configure Google Sheet CSV source URL"
          >
            <Settings className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Feed Source</span>
          </button>

        </div>

      </div>
    </header>
  );
}
