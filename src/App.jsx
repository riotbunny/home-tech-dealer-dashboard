import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import FilterBar from './components/FilterBar';
import LeadsTable from './components/LeadsTable';
import LeadDrawer from './components/LeadDrawer';
import DataSourceModal from './components/DataSourceModal';
import MetaInsightsModal from './components/MetaInsightsModal';
import ViewToggle from './components/ViewToggle';
import HistoricalTable from './components/HistoricalTable';
import { fetchSheetLeads } from './services/sheetService';
import { fetchHistoricalPerformance } from './services/historicalService';
import { fetchMetaSpend, SAMPLE_META_INSIGHTS } from './services/metaSpendService';
import { DEFAULT_SHEET_CSV_URL, DEFAULT_SHEET_HISTORICAL_URL, APP_CONFIG } from './config';
import { exportLeadsToCSV } from './utils/exportUtils';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation View State
  const [activeView, setActiveView] = useState('live'); // 'live' | 'historical'

  // Google Sheet 1 (Live Leads) State
  const [sheet1Url, setSheet1Url] = useState(() => {
    return localStorage.getItem('custom_sheet1_csv_url') || DEFAULT_SHEET_CSV_URL;
  });
  const [leads, setLeads] = useState([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState(true);
  const [sheet1DataSource, setSheet1DataSource] = useState('fallback');
  const [sheet1FetchError, setSheet1FetchError] = useState(null);

  // Google Sheet 3 (Historical Performance) State
  const [sheet3Url, setSheet3Url] = useState(() => {
    return localStorage.getItem('custom_sheet3_csv_url') || DEFAULT_SHEET_HISTORICAL_URL;
  });
  const [historicalRecords, setHistoricalRecords] = useState([]);
  const [isHistoricalLoading, setIsHistoricalLoading] = useState(true);
  const [sheet3DataSource, setSheet3DataSource] = useState('fallback');
  const [sheet3FetchError, setSheet3FetchError] = useState(null);

  // Meta Marketing Ad Spend State
  const [metaData, setMetaData] = useState(SAMPLE_META_INSIGHTS);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);

  // General Sync State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Live Leads Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [dripFilter, setDripFilter] = useState('ALL');

  // Sorting & Pagination States (Live Leads)
  const [sortConfig, setSortConfig] = useState(APP_CONFIG.defaultSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(APP_CONFIG.defaultPageSize);

  // Modal / Drawer States
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  // Load Sheet 1 Leads
  const loadLeads = useCallback(async (urlToUse, isBg = false) => {
    if (!isBg) setIsLeadsLoading(true);
    try {
      const result = await fetchSheetLeads(urlToUse);
      setLeads(result.leads || []);
      setSheet1DataSource(result.source);
      setSheet1FetchError(result.error);
    } catch (err) {
      console.error('[App] Sheet 1 Leads Error:', err);
      setSheet1FetchError(err.message);
    } finally {
      setIsLeadsLoading(false);
    }
  }, []);

  // Load Sheet 3 Historical Performance
  const loadHistorical = useCallback(async (urlToUse, isBg = false) => {
    if (!isBg) setIsHistoricalLoading(true);
    try {
      const result = await fetchHistoricalPerformance(urlToUse);
      setHistoricalRecords(result.records || []);
      setSheet3DataSource(result.source);
      setSheet3FetchError(result.error);
    } catch (err) {
      console.error('[App] Sheet 3 Historical Error:', err);
      setSheet3FetchError(err.message);
    } finally {
      setIsHistoricalLoading(false);
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

  // Sync All Feeds
  const handleSyncAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      loadLeads(sheet1Url, true),
      loadHistorical(sheet3Url, true),
      loadMetaSpend(metaData.datePreset || 'today', true)
    ]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, [sheet1Url, sheet3Url, metaData.datePreset, loadLeads, loadHistorical, loadMetaSpend]);

  // Initial Load on Mount
  useEffect(() => {
    const initData = async () => {
      await Promise.allSettled([
        loadLeads(sheet1Url),
        loadHistorical(sheet3Url),
        loadMetaSpend('today')
      ]);
      setLastUpdated(new Date());
    };
    initData();
  }, [sheet1Url, sheet3Url, loadLeads, loadHistorical, loadMetaSpend]);

  // Update Sheet URLs
  const handleUpdateSheet1Url = (newUrl) => {
    setSheet1Url(newUrl);
    localStorage.setItem('custom_sheet1_csv_url', newUrl);
    loadLeads(newUrl);
  };

  const handleUpdateSheet3Url = (newUrl) => {
    setSheet3Url(newUrl);
    localStorage.setItem('custom_sheet3_csv_url', newUrl);
    loadHistorical(newUrl);
  };

  const handleResetDefaults = () => {
    setSheet1Url(DEFAULT_SHEET_CSV_URL);
    setSheet3Url(DEFAULT_SHEET_HISTORICAL_URL);
    localStorage.removeItem('custom_sheet1_csv_url');
    localStorage.removeItem('custom_sheet3_csv_url');
    loadLeads(DEFAULT_SHEET_CSV_URL);
    loadHistorical(DEFAULT_SHEET_HISTORICAL_URL);
  };

  // Sorting Handler (Live Leads)
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

  // Reset Live Filters Handler
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setStateFilter('ALL');
    setDripFilter('ALL');
    setCurrentPage(1);
  };

  // Unique Filter Options (Live Leads)
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

  // Live Leads Filtering and Sorting
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

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

    if (statusFilter !== 'ALL') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    if (stateFilter !== 'ALL') {
      result = result.filter(lead => lead.State === stateFilter);
    }

    if (dripFilter !== 'ALL') {
      result = result.filter(lead => lead.dripDay === dripFilter);
    }

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
      
      {/* Top Header Bar */}
      <Header
        isLiveSheet={sheet1DataSource === 'live'}
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
        
        {/* Navigation View Segmented Switch */}
        <ViewToggle
          activeView={activeView}
          onViewChange={setActiveView}
          liveCount={leads.length}
          historicalCount={historicalRecords.length}
        />

        {/* VIEW 1: LIVE LEADS (SHEET 1) */}
        {activeView === 'live' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Fallback Mode Banner */}
            {sheet1DataSource === 'fallback' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-200 text-xs shadow-md backdrop-blur-sm">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Google Sheet 1 Demo Mode:</span>{' '}
                    <span>
                      Live feed unreachable or requires web publishing. Displaying sample lead records.
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

            {/* Top KPI Metrics Header */}
            <MetricCards
              leads={leads}
              metaData={metaData}
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              onRefresh={handleSyncAll}
              onOpenMetaInsights={() => setIsMetaModalOpen(true)}
            />

            {/* Search & Multi-field Filter Bar */}
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

            {/* Responsive Leads Table */}
            {isLeadsLoading ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-16 flex flex-col items-center justify-center text-center">
                <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-200">Ingesting Sheet 1 Feed...</p>
                <p className="text-xs text-slate-400 mt-1">Connecting to live Google Sheets endpoint</p>
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

          </div>
        )}

        {/* VIEW 2: HISTORICAL LOG (SHEET 3) */}
        {activeView === 'historical' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Sheet 3 Fallback Banner */}
            {sheet3DataSource === 'fallback' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-purple-500/30 bg-purple-950/30 text-purple-200 text-xs shadow-md backdrop-blur-sm">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Google Sheet 3 Demo Mode:</span>{' '}
                    <span>
                      Historical feed is using sample daily performance records while waiting for live Google Sheet 3 connection.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-100 font-semibold transition-all"
                >
                  Configure Sheet 3 URL
                </button>
              </div>
            )}

            {/* Historical Daily Performance Table */}
            {isHistoricalLoading ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-16 flex flex-col items-center justify-center text-center">
                <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-200">Ingesting Sheet 3 Historical Feed...</p>
                <p className="text-xs text-slate-400 mt-1">Mapping Date, Total Spend, Total Leads, CPL, CTR, CPC</p>
              </div>
            ) : (
              <HistoricalTable
                records={historicalRecords}
                isLoading={isHistoricalLoading}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Home Tech Dealer Leads Engine • Sheet 1 (Live Leads) & Sheet 3 (Historical Log)</span>
          <span className="font-mono text-slate-400">React + Vite + Tailwind CSS</span>
        </div>
      </footer>

      {/* Lead Dossier Modal */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Data Source Configuration Modal (Sheet 1 & Sheet 3) */}
      <DataSourceModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSheet1Url={sheet1Url}
        currentSheet3Url={sheet3Url}
        onUpdateSheet1Url={handleUpdateSheet1Url}
        onUpdateSheet3Url={handleUpdateSheet3Url}
        onResetDefaults={handleResetDefaults}
        isLiveSheet1={sheet1DataSource === 'live'}
        isLiveSheet3={sheet3DataSource === 'live'}
        sheet1Error={sheet1FetchError}
        sheet3Error={sheet3FetchError}
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
