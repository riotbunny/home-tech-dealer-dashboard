import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  User,
  Clock,
  Cpu,
  Layers,
  ChevronDown
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDateTime, formatRelativeTime } from '../utils/dateUtils';
import EmptyState from './EmptyState';

/**
 * Responsive Data Table for Home Tech Dealer Leads
 */
export default function LeadsTable({
  leads = [],
  sortConfig,
  onSort,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onSelectLead,
  onResetFilters
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyPhone = (e, id, phone) => {
    e.stopPropagation();
    if (phone) {
      navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  // Pagination calculations
  const totalRecords = leads.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedLeads = leads.slice(startIndex, endIndex);

  // Sorting header icon helper
  const getSortIcon = (columnName) => {
    if (sortConfig.column !== columnName) {
      return <ArrowUpDown className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-emerald-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-emerald-400" />
    );
  };

  if (totalRecords === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
        <EmptyState onReset={onResetFilters} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden backdrop-blur-sm">
      
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          
          {/* Table Header */}
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
            <tr>
              
              {/* Full Name */}
              <th 
                onClick={() => onSort('fullName')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[180px]"
              >
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>Full Name</span>
                  {getSortIcon('fullName')}
                </div>
              </th>

              {/* Status */}
              <th 
                onClick={() => onSort('status')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>

              {/* Phone */}
              <th className="py-3.5 px-4 min-w-[150px]">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>Phone</span>
                </div>
              </th>

              {/* City & State */}
              <th 
                onClick={() => onSort('State')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>City / State</span>
                  {getSortIcon('State')}
                </div>
              </th>

              {/* Usage / Equipment */}
              <th 
                onClick={() => onSort('usage')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[170px]"
              >
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-slate-500" />
                  <span>Usage Interest</span>
                  {getSortIcon('usage')}
                </div>
              </th>

              {/* Drip Day */}
              <th 
                onClick={() => onSort('dripDay')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[100px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Drip Day</span>
                  {getSortIcon('dripDay')}
                </div>
              </th>

              {/* Address */}
              <th className="py-3.5 px-4 min-w-[200px] hidden md:table-cell">
                <span>Address</span>
              </th>

              {/* Timestamp */}
              <th 
                onClick={() => onSort('timestamp')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors group select-none min-w-[140px]"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Logged Date</span>
                  {getSortIcon('timestamp')}
                </div>
              </th>

            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/60 font-normal text-slate-300">
            {paginatedLeads.map((lead) => {
              const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
              const isCopied = copiedId === lead.id;

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  
                  {/* Full Name & Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 group-hover:border-emerald-500/40 group-hover:text-emerald-400 transition-colors">
                        {(lead.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors block">
                          {lead.fullName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Phone + Quick Copy */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${cleanPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-slate-200 hover:text-emerald-400 hover:underline transition-colors"
                      >
                        {lead.phone}
                      </a>
                      <button
                        onClick={(e) => handleCopyPhone(e, lead.id, lead.phone)}
                        title="Copy phone number"
                        className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        {isCopied ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* City & State */}
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1 text-slate-200">
                      <span>{lead.City || '—'}</span>
                      {lead.State && lead.State !== 'N/A' && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                          {lead.State}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Usage */}
                  <td className="py-3 px-4">
                    <span className="text-slate-300 font-medium line-clamp-1" title={lead.usage}>
                      {lead.usage}
                    </span>
                  </td>

                  {/* Drip Day */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950/50 border border-purple-500/20 text-purple-300">
                      {lead.dripDay}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                    <span className="line-clamp-1 max-w-[220px]" title={lead.address}>
                      {lead.address}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4">
                    <div className="text-slate-300" title={lead.timestamp}>
                      <span className="block font-medium">{formatRelativeTime(lead.timestamp)}</span>
                      <span className="text-[10px] text-slate-400 block">{formatDateTime(lead.timestamp)}</span>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
        
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-slate-400 ml-2">
            Showing <strong className="text-slate-200">{startIndex + 1}</strong> - <strong className="text-slate-200">{endIndex}</strong> of <strong className="text-slate-200">{totalRecords}</strong>
          </span>
        </div>

        {/* Page navigation controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            title="First page"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={validCurrentPage === 1}
            title="Previous page"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-3 py-1 text-slate-300 font-medium">
            Page <strong className="text-white">{validCurrentPage}</strong> of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={validCurrentPage === totalPages}
            title="Next page"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage === totalPages}
            title="Last page"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
