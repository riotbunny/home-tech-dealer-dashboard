import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import FilterBar from './components/FilterBar';
import LeadsTable from './components/LeadsTable';
import LeadDrawer from './components/LeadDrawer';
import DataSourceModal from './components/DataSourceModal';
import MetaInsightsModal from './components/MetaInsightsModal';
import { fetchSheetLeads } from './services/sheetService';
import { fetchMetaSpend, SAMPLE_META_INSIGHTS } from './services/metaSpendService';
import { DEFAULT_SHEET_CSV_URL, APP_CONFIG } from './config';
import { exportLeadsToCSV } from './utils/exportUtils';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Google Sheet Data State
  const [sheetUrl, setSheetUrl] = useState(() => {
    return localStorage.getItem('custom_sheet_csv_url') || DEFAULT_SHEET_CSV_URL;
  });
  const [leads, setLeads] = useState([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState(true);
  const [sheetDataSource, setSheetDataSource] = useState('fallback'); // 'live' | 'fallback'
  const [sheetFetchError, setSheetFetchError] = useState(null);

  // Meta Marketing Ad Spend State
  const [metaData, setMetaData] = useState(SAMPLE_META_INSIGHTS);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);

  // General Status State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

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
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  // Load Google Sheet Leads
  const loadLeads = useCallback(async (urlToUse, isBg = false) => {
    if (!isBg) setIsLeadsLoading(true);
    try {
      const result = await fetchSheetLeads(urlToUse);
      setLeads(result.leads || []);
      setSheetDataSource(result.source);
      setSheetFetchError(result.error);
    } catch (err) {
      console.error('[App] Leads error:', err);
      setSheetFetchError(err.message);
    } finally {
      setIsLeadsLoading(false);
    }
  }, []);

  // Load Meta Ad Spend
  const loadMetaSpend = useCallback(async (datePreset = 'today', isBg = false) => {
    if (!isBg) setIsMetaLoading(true);
    try {
      const result = await fetchMetaSpend(datePreset);
      setMetaData(result);
      setMetaError(result.error);
    } catch (err) {
      console.error('[App] Meta spend error:', err);
      setMetaError(err.message);
    } finally {
      setIsMetaLoading(false);
    }
  }, []);

  // Synchronize All Data Feeds
  const handleSyncAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      loadLeads(sheetUrl, true),
      loadMetaSpend(metaData.datePreset || 'today', true)
    ]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, [sheetUrl, metaData.datePreset, loadLeads, loadMetaSpend]);

  // Initial Load
  useEffect(() => {
    const initData = async () => {
      await Promise.allSettled([
        loadLeads(sheetUrl),
        loadMetaSpend('today')
      ]);
      setLastUpdated(new Date());
    };
    initData();
  }, [sheetUrl, loadLeads, loadMetaSpend]);

  // Update Sheet URL Handler
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

  // Unique filter options
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

    // 1. Text Search Filter
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

        if (sortConfig.column === 'timestamp') {
          const dateA = new Date(valA).getTime() || 0;
          const dateB = new Date(valB).getTime() || 0;
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [leads, searchTerm, statusFilter, stateFilter, dripFilter, sortConfig]);

  // Reset page on filter changes
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
        isLiveSheet={sheetDataSource === 'live'}
        isLiveMeta={metaData.source === 'live'}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onRefresh={handleSyncAll}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMetaInsights={() => setIsMetaModalOpen(true)}
        onExport={handleExportCSV}
      />

      {/* Main Operational Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        
        {/* Ingest / Fallback Status Banner */}
        {sheetDataSource === 'fallback' && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-200 text-xs shadow-md backdrop-blur-sm animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Google Sheet Demo Mode:</span>{' '}
                <span>
                  The configured Google Sheet CSV feed returned an error or requires public permissions. Using sample leads dataset.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 font-semibold transition-all"
            >
              Configure Feed URL
            </button>
          </div>
        )}

        {/* Top Metric Cards Header (Leads + Meta Spend + CPL) */}
        <MetricCards
          leads={leads}
          metaData={metaData}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleSyncAll}
          onOpenMetaInsights={() => setIsMetaModalOpen(true)}
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
        {isLeadsLoading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-200">Ingesting Leads & Meta Ad Spend...</p>
            <p className="text-xs text-slate-400 mt-1">Connecting to Google Sheet & Meta Graph API v21.0</p>
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
          <span>Home Tech Dealer Leads & Meta Ad Intelligence • Columns A-I Mapped</span>
          <span className="font-mono text-slate-400">React + Vite + Vercel Serverless</span>
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
        isLive={sheetDataSource === 'live'}
        fetchError={sheetFetchError}
      />

      {/* Meta Ad Insights Modal */}
      <MetaInsightsModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        metaData={metaData}
        isLoading={isMetaLoading}
        onRefreshPreset={(preset) => loadMetaSpend(preset)}
      />

    </div>
  );
}
