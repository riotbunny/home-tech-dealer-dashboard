import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  MousePointerClick, 
  Eye, 
  TrendingUp, 
  Activity, 
  Layers, 
  ShieldCheck, 
  RefreshCw,
  Calendar,
  Percent,
  BarChart3
} from 'lucide-react';

/**
 * Detailed Meta Marketing Campaign Insights Modal
 */
export default function MetaInsightsModal({ 
  isOpen, 
  onClose, 
  metaData, 
  isLoading, 
  onRefreshPreset, 
  adAccountId = 'act_1677753792720663' 
}) {
  const [selectedPreset, setSelectedPreset] = useState(metaData?.datePreset || 'today');

  if (!isOpen) return null;

  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last_7d', label: 'Last 7 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'maximum', label: 'Maximum (All Time)' }
  ];

  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    if (onRefreshPreset) {
      onRefreshPreset(presetId);
    }
  };

  const spendFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(metaData?.spend || 0);

  const cpcFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(metaData?.cpc || 0);

  const cpmFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(metaData?.cpm || 0);

  const ctrFormatted = `${(metaData?.ctr || 0).toFixed(2)}%`;
  const clicksFormatted = new Intl.NumberFormat('en-US').format(metaData?.clicks || 0);
  const impressionsFormatted = new Intl.NumberFormat('en-US').format(metaData?.impressions || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Meta Marketing Ad Spend Intelligence</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Graph API v21.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Account: <code className="font-mono text-slate-300">{adAccountId}</code></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Preset Selector */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Date Range Preset:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedPreset === p.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  } disabled:opacity-50`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metric Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                Total Ad Spend ({selectedPreset.replace('_', ' ')})
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                {spendFormatted}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Active date range: {metaData?.dateStart || 'Today'} &rarr; {metaData?.dateStop || 'Today'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                metaData?.source === 'live'
                  ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/70 border border-amber-500/30 text-amber-300'
              }`}>
                <span className={`h-2 w-2 rounded-full ${metaData?.source === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {metaData?.source === 'live' ? 'Live Graph API' : 'Fallback / Zero Spend'}
              </span>
            </div>
          </div>

          {/* Secondary Grid Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Clicks */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <MousePointerClick className="h-3.5 w-3.5 text-blue-400" />
                Link Clicks
              </span>
              <p className="text-xl font-bold text-white">{clicksFormatted}</p>
            </div>

            {/* Impressions */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <Eye className="h-3.5 w-3.5 text-indigo-400" />
                Impressions
              </span>
              <p className="text-xl font-bold text-white">{impressionsFormatted}</p>
            </div>

            {/* CPC */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                Avg. CPC
              </span>
              <p className="text-xl font-bold text-emerald-400">{cpcFormatted}</p>
            </div>

            {/* CTR */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <Percent className="h-3.5 w-3.5 text-purple-400" />
                CTR (Click Rate)
              </span>
              <p className="text-xl font-bold text-purple-300">{ctrFormatted}</p>
            </div>

          </div>

          {/* Security & Serverless Architecture Details */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Secure Serverless Architecture
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Tokens are strictly kept server-side inside Vercel Serverless Function <code className="text-slate-200">/api/spend</code> using <code className="text-blue-300">META_ACCESS_TOKEN</code> and <code className="text-blue-300">META_AD_ACCOUNT_ID</code>. Client never exposes secret keys.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-850">
          <span className="text-xs text-slate-400">
            Last Synced: {metaData?.timestamp ? new Date(metaData.timestamp).toLocaleTimeString() : 'Just now'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
}
