/**
 * Application Configuration & Environment Settings
 */

// Default Google Sheet CSV export URL for Sheet 1 (Live Leads)
export const DEFAULT_SHEET_CSV_URL =
  import.meta.env.VITE_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet1';

// Default Google Sheet CSV export URL for Sheet 3 (Historical Daily Performance)
export const DEFAULT_SHEET_HISTORICAL_URL =
  import.meta.env.VITE_SHEET_HISTORICAL_URL ||
  'https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet3';

export const APP_CONFIG = {
  appName: 'Home Tech Dealer Leads Engine',
  appSubtitle: 'Operational Live Feed & Historical Performance Dashboard',
  version: '1.2.0',
  autoRefreshIntervalMs: 60000,
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  defaultSort: {
    column: 'timestamp',
    direction: 'desc'
  }
};
