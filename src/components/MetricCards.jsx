import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Target, 
  RefreshCw, 
  TrendingUp, 
  MousePointerClick,
  Eye,
  Percent,
  Sparkles,
  ChevronRight,
  Clock
} from 'lucide-react';
import { isToday, formatRelativeTime } from '../utils/dateUtils';

/**
 * Operational KPI Metrics Header displaying:
 * 1. Total Record Count
 * 2. Today's Lead Volume
 * 3. Today's Total Ad Spend (Meta Marketing API)
 * 4. Calculated Cost Per Lead (CPL)
 */
export default function MetricCards({ 
  leads = [], 
  metaData = {}, 
  lastUpdated, 
  isRefreshing, 
  onRefresh, 
  onOpenMetaInsights 
}) {
  const totalCount = leads.length;

  // Calculate leads logged today
  const todayLeadsCount = leads.filter(l => isToday(l.timestamp)).length;

  // Meta ad spend
  const todaySpend = metaData?.spend || 0;

  // Calculate CPL:
  // Today's CPL = Today's Spend / Today's Leads (if > 0), else Total Spend / Total Leads
  let cplValue = 0;
  let cplBasis = 'today';

  if (todayLeadsCount > 0 && todaySpend > 0) {
    cplValue = todaySpend / todayLeadsCount;
    cplBasis = 'today';
  } else if (totalCount > 0 && todaySpend > 0) {
    cplValue = todaySpend / totalCount;
    cplBasis = 'overall';
  }

  const spendFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(todaySpend);

  const cplFormatted = cplValue > 0
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(cplValue)
    : '$0.00';

  const cpcFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(metaData?.cpc || 0);

  const ctrFormatted = `${(metaData?.ctr || 0).toFixed(2)}%`;
  const clicksFormatted = new Intl.NumberFormat('en-US').format(metaData?.clicks || 0);
  const impressionsFormatted = new Intl.NumberFormat('en-US').format(metaData?.impressions || 0);

  return (
    <div className="space-y-4 mb-6">
      
      {/* 4 Main Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Leads Ingested */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-white">{totalCount}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              Sheet 1
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">All-time backend lead count</p>
        </div>

        {/* 2. Today's Lead Volume */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Leads</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-white">{todayLeadsCount}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
              {todayLeadsCount > 0 ? `${Math.round((todayLeadsCount / (totalCount || 1)) * 100)}% of total` : '24h window'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Logged in current calendar day</p>
        </div>

        {/* 3. Today's Total Ad Spend (Meta Marketing API) */}
        <div 
          onClick={onOpenMetaInsights}
          className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-slate-900 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/60 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-1">
              <span>Today's Ad Spend</span>
              <ChevronRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-white">{spendFormatted}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-300 border border-blue-500/20">
              Meta API
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>{clicksFormatted} clicks • {impressionsFormatted} imp</span>
            <span className="text-blue-400 group-hover:underline text-[11px]">View analytics</span>
          </p>
        </div>

        {/* 4. Calculated Cost Per Lead (CPL) */}
        <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-slate-900 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-purple-500/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Cost Per Lead (CPL)</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-purple-200">{cplFormatted}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-300 border border-purple-500/20">
              {cplBasis === 'today' ? 'Today CPL' : 'Blended'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {todayLeadsCount > 0
              ? `${spendFormatted} ÷ ${todayLeadsCount} today's leads`
              : 'Spend ÷ Total Leads'}
          </p>
        </div>

      </div>

      {/* Meta Ad Telemetry Sub-Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Avg. CPC:</span>
            <span className="font-semibold text-slate-200 font-mono">{cpcFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">CTR:</span>
            <span className="font-semibold text-purple-300 font-mono">{ctrFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Link Clicks:</span>
            <span className="font-semibold text-blue-300 font-mono">{clicksFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Impressions:</span>
            <span className="font-semibold text-slate-300 font-mono">{impressionsFormatted}</span>
          </div>

        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMetaInsights}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
          >
            <span>Full Campaign Insights</span>
            <ChevronRight className="h-3 w-3" />
          </button>
          
          <span className="text-slate-600">•</span>

          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="h-3 w-3" />
            Synced: <strong className="text-slate-400 font-normal">{lastUpdated ? formatRelativeTime(lastUpdated) : 'Just now'}</strong>
          </span>
        </div>
      </div>

    </div>
  );
}
