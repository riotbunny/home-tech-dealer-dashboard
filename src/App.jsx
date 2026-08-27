import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import FilterBar from './components/FilterBar';
import LeadsTable from './components/LeadsTable';
import LeadDrawer from './components/LeadDrawer';
import DataSourceModal from './components/DataSourceModal';
import { fetchSheetLeads } from './services/sheetService';
import { DEFAULT_SHEET_CSV_URL, APP_CONFIG } from './config';
import { exportLeadsToCSV } from './utils/exportUtils';
import { AlertCircle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  // Data State
  const [sheetUrl, setSheetUrl] = useState(() => {
    return localStorage.getItem('custom_sheet_csv_url') || DEFAULT_SHEET_CSV_URL;
  });
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('fallback'); // 'live' | 'fallback'
  const [fetchError, setFetchError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [dripFilter, setDripFilter] = useState('ALL');

  // Sorting & Pagination States
  const [sortConfig, setSortConfig] = useState(APP_CONFIG.defaultSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(APP_CONFIG.defaultPageSize);

  // Modal / Drawer States
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core Data Loading Function
  const loadLeads = useCallback(async (urlToUse, isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await fetchSheetLeads(urlToUse);
      setLeads(result.leads || []);
      setDataSource(result.source);
      setFetchError(result.error);
      setLastUpdated(result.timestamp);
    } catch (err) {
      console.error('[App] Failed loading leads:', err);
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Ingest feed on initial load or when sheetUrl changes
  useEffect(() => {
    loadLeads(sheetUrl);
  }, [sheetUrl, loadLeads]);

  // Handle URL change
  const handleUpdateSheetUrl = (newUrl) => {
    setSheetUrl(newUrl);
    localStorage.setItem('custom_sheet_csv_url', newUrl);
    loadLeads(newUrl);
  };

  const handleResetDefaultUrl = () => {
    setSheetUrl(DEFAULT_SHEET_CSV_URL);
    localStorage.removeItem('custom_sheet_csv_url');
    loadLeads(DEFAULT_SHEET_CSV_URL);
  };

  // Sorting Handler
  const handleSort = (column) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { column, direction: 'asc' };
    });
  };

  // Filter Reset Handler
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setStateFilter('ALL');
    setDripFilter('ALL');
    setCurrentPage(1);
  };

  // Extract unique filter options dynamically from data
  const uniqueStatuses = useMemo(() => {
    const set = new Set(leads.map(l => l.status).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  const uniqueStates = useMemo(() => {
    const set = new Set(leads.map(l => l.State).filter(s => s && s !== 'N/A'));
    return Array.from(set).sort();
  }, [leads]);

  const uniqueDrips = useMemo(() => {
    const set = new Set(leads.map(l => l.dripDay).filter(Boolean));
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [leads]);

  // Real-time Filter & Sort Processing
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // 1. Text Search Filter (across fullName, phone, City, State, address, usage)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(lead => {
        return (
          (lead.fullName && lead.fullName.toLowerCase().includes(q)) ||
          (lead.phone && lead.phone.toLowerCase().includes(q)) ||
          (lead.City && lead.City.toLowerCase().includes(q)) ||
          (lead.State && lead.State.toLowerCase().includes(q)) ||
          (lead.address && lead.address.toLowerCase().includes(q)) ||
          (lead.usage && lead.usage.toLowerCase().includes(q)) ||
          (lead.status && lead.status.toLowerCase().includes(q))
        );
      });
    }

    // 2. Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    // 3. State Filter
    if (stateFilter !== 'ALL') {
      result = result.filter(lead => lead.State === stateFilter);
    }

    // 4. Drip Day Filter
    if (dripFilter !== 'ALL') {
      result = result.filter(lead => lead.dripDay === dripFilter);
    }

    // 5. Sorting
    if (sortConfig.column) {
      result.sort((a, b) => {
        let valA = a[sortConfig.column];
        let valB = b[sortConfig.column];

        // Handle date sorting
        if (sortConfig.column === 'timestamp') {
          const dateA = new Date(valA).getTime() || 0;
          const dateB = new Date(valB).getTime() || 0;
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Handle string sorting
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [leads, searchTerm, statusFilter, stateFilter, dripFilter, sortConfig]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, stateFilter, dripFilter]);

  // Export CSV Action
  const handleExportCSV = () => {
    exportLeadsToCSV(filteredAndSortedLeads, 'home-tech-dealer-leads-export');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Header Bar */}
      <Header
        isLive={dataSource === 'live'}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onRefresh={() => loadLeads(sheetUrl, true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExport={handleExportCSV}
      />

      {/* Main Operational Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        
        {/* Ingest / Fallback Status Banner */}
        {dataSource === 'fallback' && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-200 text-xs shadow-md backdrop-blur-sm animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Using Sample Leads Dataset:</span>{' '}
                <span>
                  The configured Google Sheet CSV feed returned an error or is private ({fetchError || '404/CORS'}). The dashboard is fully functional with pre-seeded sample data.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 font-semibold transition-all"
            >
              Configure Live URL
            </button>
          </div>
        )}

        {/* Top Metric Cards Header */}
        <MetricCards
          leads={leads}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={() => loadLeads(sheetUrl, true)}
          dataSource={dataSource}
        />

        {/* Real-time Search & Filter Controls */}
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          stateFilter={stateFilter}
          setStateFilter={setStateFilter}
          dripFilter={dripFilter}
          setDripFilter={setDripFilter}
          uniqueStatuses={uniqueStatuses}
          uniqueStates={uniqueStates}
          uniqueDrips={uniqueDrips}
          totalCount={leads.length}
          filteredCount={filteredAndSortedLeads.length}
          onReset={handleResetFilters}
        />

        {/* Responsive Data Table */}
        {isLoading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-200">Ingesting Sheet 1 Feed...</p>
            <p className="text-xs text-slate-400 mt-1">Parsing Columns A-I with PapaParse</p>
          </div>
        ) : (
          <LeadsTable
            leads={filteredAndSortedLeads}
            sortConfig={sortConfig}
            onSort={handleSort}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={APP_CONFIG.pageSizeOptions}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onResetFilters={handleResetFilters}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Home Tech Dealer Leads Operational Engine • Columns A-I Mapped (J & K Excluded)</span>
          <span className="font-mono text-slate-400">Vite + React + Tailwind CSS</span>
        </div>
      </footer>

      {/* Lead Dossier Modal */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Data Source Configuration Modal */}
      <DataSourceModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUrl={sheetUrl}
        onUpdateUrl={handleUpdateSheetUrl}
        onResetDefault={handleResetDefaultUrl}
        isLive={dataSource === 'live'}
        fetchError={fetchError}
      />

    </div>
  );
}
