import React from 'react';
import { Search, X, Filter, MapPin, Layers, Calendar, RotateCcw } from 'lucide-react';

/**
 * Real-time Search and Multi-field Filter Controls
 */
export default function FilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  stateFilter,
  setStateFilter,
  dripFilter,
  setDripFilter,
  uniqueStatuses = [],
  uniqueStates = [],
  uniqueDrips = [],
  totalCount,
  filteredCount,
  onReset
}) {
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL' || stateFilter !== 'ALL' || dripFilter !== 'ALL';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-md backdrop-blur-sm mb-6 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, city, state, address, or usage..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Container */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-initial min-w-[130px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses ({totalCount})</option>
              {uniqueStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <Layers className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* State Filter */}
          <div className="relative flex-1 sm:flex-initial min-w-[110px]">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">All States</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Drip Day Filter */}
          <div className="relative flex-1 sm:flex-initial min-w-[110px]">
            <select
              value={dripFilter}
              onChange={(e) => setDripFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Drip Days</option>
              {uniqueDrips.map((drip) => (
                <option key={drip} value={drip}>
                  {drip}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-all"
              title="Reset all search queries and filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* Filter Statistics Pill Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span>Displaying:</span>
          <span className="font-semibold text-slate-200">
            {filteredCount} {filteredCount === 1 ? 'record' : 'records'}
          </span>
          {filteredCount !== totalCount && (
            <span className="text-slate-500">
              (filtered from {totalCount} total)
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <span className="text-emerald-400/90 font-medium">
            Active filters applied
          </span>
        )}
      </div>
    </div>
  );
}
