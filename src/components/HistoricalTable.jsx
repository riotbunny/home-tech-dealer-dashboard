import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Target, 
  Percent, 
  MousePointerClick, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Download, 
  RotateCcw,
  TrendingDown,
  Award,
  Sparkles
} from 'lucide-react';
import Papa from 'papaparse';

/**
 * Historical Daily Performance Table Component (Sheet 3)
 */
export default function HistoricalTable({ records = [], isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ column: 'date', direction: 'desc' });

  // Summary Metrics Computation
  const stats = useMemo(() => {
    if (!records.length) {
      return { totalSpend: 0, totalLeads: 0, blendedCpl: 0, bestDay: null };
    }

    const totalSpend = records.reduce((acc, r) => acc + (r.totalSpend || 0), 0);
    const totalLeads = records.reduce((acc, r) => acc + (r.totalLeads || 0), 0);
    const blendedCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

    // Find best performing day (lowest CPL with > 0 leads)
    const validDays = records.filter(r => (r.totalLeads || 0) > 0 && (r.costPerLead || 0) > 0);
    const bestDay = validDays.length > 0 
      ? validDays.reduce((min, cur) => cur.costPerLead < min.costPerLead ? cur : min, validDays[0])
      : null;

    return { totalSpend, totalLeads, blendedCpl, bestDay };
  }, [records]);

  // Handle Column Sorting
  const handleSort = (column) => {
    setSortConfig(prev => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'desc' };
    });
  };

  // Filter & Sort Processing
  const filteredAndSortedRecords = useMemo(() => {
    let list = [...records];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(r => {
        return (
          (r.date && r.date.toLowerCase().includes(q)) ||
          String(r.totalSpend).includes(q) ||
          String(r.totalLeads).includes(q) ||
          String(r.costPerLead).includes(q)
        );
      });
    }

    if (sortConfig.column) {
      list.sort((a, b) => {
        let valA = a[sortConfig.column];
        let valB = b[sortConfig.column];

        if (sortConfig.column === 'date') {
          const dateA = new Date(valA).getTime() || 0;
          const dateB = new Date(valB).getTime() || 0;
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        valA = Number(valA) || 0;
        valB = Number(valB) || 0;

        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      });
    }

    return list;
  }, [records, searchTerm, sortConfig]);

  // Export Historical CSV
  const handleExportCSV = () => {
    if (!filteredAndSortedRecords.length) return;
    const dataToExport = filteredAndSortedRecords.map(r => ({
      'Date': r.date,
      'Total Spend': `$${r.totalSpend.toFixed(2)}`,
      'Total Leads': r.totalLeads,
      'Cost Per Lead (CPL)': `$${r.costPerLead.toFixed(2)}`,
      'CTR': `${r.ctr.toFixed(2)}%`,
      'CPC': `$${r.cpc.toFixed(2)}`
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sheet3-historical-performance-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.column !== columnName) {
      return <ArrowUpDown className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-purple-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-purple-400" />
    );
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(val || 0);

  return (
    <div className="space-y-6">
      
      {/* Historical KPI Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Historical Spend */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Historical Spend</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{formatCurrency(stats.totalSpend)}</span>
            <span className="text-xs font-medium text-slate-400">{records.length} days logged</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Cumulative Sheet 3 ad budget</p>
        </div>

        {/* Total Historical Leads */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads Generated</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.totalLeads}</span>
            <span className="text-xs font-medium text-emerald-400">
              ~{(stats.totalLeads / (records.length || 1)).toFixed(1)} leads/day
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Historical acquisition volume</p>
        </div>

        {/* Blended CPL */}
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-slate-900 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Blended Historical CPL</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-purple-200">{formatCurrency(stats.blendedCpl)}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-300">
              All-Time CPL
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Overall lead acquisition cost</p>
        </div>

        {/* Best Performance Day */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 to-slate-900 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Lowest CPL Day</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-200">
              {stats.bestDay ? formatCurrency(stats.bestDay.costPerLead) : '$0.00'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300">
              {stats.bestDay ? stats.bestDay.date : 'N/A'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {stats.bestDay ? `${stats.bestDay.totalLeads} leads on ${stats.bestDay.date}` : 'Historical benchmark'}
          </p>
        </div>

      </div>

      {/* Historical Filter & Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-md backdrop-blur-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search historical dates (e.g. 2026-08)..."
            className="w-full pl-10 pr-9 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Sheet 3 CSV</span>
          </button>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            
            {/* Table Header */}
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                
                {/* Date */}
                <th 
                  onClick={() => handleSort('date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Date</span>
                    {getSortIcon('date')}
                  </div>
                </th>

                {/* Total Spend */}
                <th 
                  onClick={() => handleSort('totalSpend')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                    <span>Total Spend</span>
                    {getSortIcon('totalSpend')}
                  </div>
                </th>

                {/* Total Leads */}
                <th 
                  onClick={() => handleSort('totalLeads')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[130px]"
                >
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <span>Total Leads</span>
                    {getSortIcon('totalLeads')}
                  </div>
                </th>

                {/* Cost Per Lead (CPL) */}
                <th 
                  onClick={() => handleSort('costPerLead')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[160px]"
                >
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-slate-500" />
                    <span>Cost Per Lead (CPL)</span>
                    {getSortIcon('costPerLead')}
                  </div>
                </th>

                {/* CTR */}
                <th 
                  onClick={() => handleSort('ctr')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[110px]"
                >
                  <div className="flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5 text-slate-500" />
                    <span>CTR</span>
                    {getSortIcon('ctr')}
                  </div>
                </th>

                {/* CPC */}
                <th 
                  onClick={() => handleSort('cpc')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[110px]"
                >
                  <div className="flex items-center gap-1.5">
                    <MousePointerClick className="h-3.5 w-3.5 text-slate-500" />
                    <span>CPC</span>
                    {getSortIcon('cpc')}
                  </div>
                </th>

              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 font-normal text-slate-300">
              {filteredAndSortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        {records.length === 0 ? 'Sheet 3 Connected (Awaiting First Log)' : 'No records match your date search'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        {records.length === 0 
                          ? 'Your Google Sheet 3 is connected live and currently blank. The nightly cron job will automatically append yesterday\'s summary row here at 00:05 AM UTC.'
                          : 'Try changing your search term to see other historical dates.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedRecords.map((row) => {
                  // CPL Badge Color Coding
                  const cpl = row.costPerLead;
                  let cplBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (cpl > 0 && cpl <= 20) {
                    cplBadgeClass = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30';
                  } else if (cpl > 20 && cpl <= 25) {
                    cplBadgeClass = 'bg-purple-950/70 text-purple-300 border-purple-500/30';
                  } else if (cpl > 25) {
                    cplBadgeClass = 'bg-amber-950/70 text-amber-300 border-amber-500/30';
                  }

                  return (
                    <tr key={row.id} className="hover:bg-slate-800/50 transition-colors group">
                      
                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                          <span className="font-semibold text-slate-100 font-mono text-xs">
                            {row.date}
                          </span>
                        </div>
                      </td>

                      {/* Total Spend */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-100 font-mono text-xs">
                          {formatCurrency(row.totalSpend)}
                        </span>
                      </td>

                      {/* Total Leads */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30 font-mono">
                          {row.totalLeads} {row.totalLeads === 1 ? 'lead' : 'leads'}
                        </span>
                      </td>

                      {/* Cost Per Lead (CPL) */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border font-mono ${cplBadgeClass}`}>
                          <span>{formatCurrency(row.costPerLead)}</span>
                          <span className="text-[10px] opacity-75 font-normal">/lead</span>
                        </span>
                      </td>

                      {/* CTR */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-purple-300 font-semibold text-xs">
                          {row.ctr.toFixed(2)}%
                        </span>
                      </td>

                      {/* CPC */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-emerald-400 font-semibold text-xs">
                          {formatCurrency(row.cpc)}
                        </span>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Displaying <strong className="text-slate-200">{filteredAndSortedRecords.length}</strong> historical days</span>
          <span className="text-slate-500">Sheet 3 • Columns: Date, Total Spend, Total Leads, CPL, CTR, CPC</span>
        </div>
      </div>

    </div>
  );
}
