/**
 * Application Configuration & Dynamic Environment Settings
 * Reads directly from Vite environment variables (VITE_*)
 */

// Google Sheet 1 CSV Export URL (Live Leads)
export const DEFAULT_SHEET_CSV_URL = import.meta.env.VITE_SHEET_CSV_URL || '';

// Google Sheet 3 CSV Export URL (Historical Performance Log)
export const DEFAULT_SHEET_HISTORICAL_URL = import.meta.env.VITE_SHEET_HISTORICAL_URL || '';

export const APP_CONFIG = {
  appName: 'Home Tech Dealer Leads Engine',
  appSubtitle: 'Operational Live Feed & Historical Performance Dashboard',
  version: '1.3.0',
  autoRefreshIntervalMs: 60000,
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  defaultSort: {
    column: 'timestamp',
    direction: 'desc'
  }
};
