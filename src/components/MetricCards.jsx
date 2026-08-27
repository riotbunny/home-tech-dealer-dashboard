import React from 'react';
import { 
  Users, 
  Calendar, 
  Activity, 
  Flame, 
  RefreshCw, 
  MapPin,
  TrendingUp,
  Clock
} from 'lucide-react';
import { isToday, formatRelativeTime, formatDateTime } from '../utils/dateUtils';

/**
 * Operational Metrics Header displaying KPI cards
 */
export default function MetricCards({ leads = [], lastUpdated, isRefreshing, onRefresh, dataSource }) {
  const totalCount = leads.length;

  // Calculate leads logged today
  const todayCount = leads.filter(l => isToday(l.timestamp)).length;

  // Active leads count (New, Contacted, In Progress, Qualified)
  const activeCount = leads.filter(l => {
    const s = (l.status || '').toLowerCase();
    return s.includes('new') || s.includes('contact') || s.includes('progress') || s.includes('qualif');
  }).length;

  // Converted count
  const convertedCount = leads.filter(l => {
    const s = (l.status || '').toLowerCase();
    return s.includes('convert') || s.includes('won') || s.includes('closed');
  }).length;

  // Top state calculation
  const stateCounts = leads.reduce((acc, lead) => {
    const st = lead.State && lead.State !== 'N/A' ? lead.State : null;
    if (st) acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const topState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Leads */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads Ingested</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold tracking-tight text-white">{totalCount}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            100% active
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Sheet 1 feed records</p>
      </div>

      {/* 2. Logged Today */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Logged Today</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold tracking-tight text-white">{todayCount}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
            {todayCount > 0 ? `${Math.round((todayCount / (totalCount || 1)) * 100)}% of total` : 'Current date'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Captured in last 24 hours</p>
      </div>

      {/* 3. Pipeline Active / Qualified */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Pipeline</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Activity className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold tracking-tight text-white">{activeCount}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
            {convertedCount} converted
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">In qualification & drip flow</p>
      </div>

      {/* 4. Top Territory & Sync Indicator */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top Market & Sync</span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Manual sync live data"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 active:scale-95 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-purple-300' : ''}`} />
          </button>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-center gap-1.5 text-2xl font-extrabold tracking-tight text-white">
            <MapPin className="h-5 w-5 text-purple-400 inline" />
            <span>{topState[0]}</span>
            <span className="text-sm font-normal text-slate-400">({topState[1]})</span>
          </div>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3 inline text-slate-500" />
          <span>Synced: <strong className="text-slate-300 font-normal">{lastUpdated ? formatRelativeTime(lastUpdated) : 'Just now'}</strong></span>
        </p>
      </div>
    </div>
  );
}
