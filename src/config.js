/**
 * Application Configuration & Dynamic Environment Settings
 * Reads directly from Vite environment variables (VITE_*) with working published Google Sheet defaults.
 */

// Google Sheet 1 CSV Export URL (Live Leads)
export const DEFAULT_SHEET_CSV_URL = 
  import.meta.env.VITE_SHEET_CSV_URL || 
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPyjot8fPjGZLgO-N0so6AmhAKqzUdHg5YNAkLYu1_nVyHxQR1ydEmir9mzWQN5kLOqJBuToOhyUyj/pub?output=csv';

// Google Sheet 3 CSV Export URL (Historical Performance Log)
export const DEFAULT_SHEET_HISTORICAL_URL = 
  import.meta.env.VITE_SHEET_HISTORICAL_URL || 
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPyjot8fPjGZLgO-N0so6AmhAKqzUdHg5YNAkLYu1_nVyHxQR1ydEmir9mzWQN5kLOqJBuToOhyUyj/pub?gid=1621694904&single=true&output=csv';

export const APP_CONFIG = {
  appName: 'Home Tech Dealer Leads Engine',
  appSubtitle: 'Operational Live Feed & Historical Performance Dashboard',
  version: '1.3.1',
  autoRefreshIntervalMs: 60000,
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  defaultSort: {
    column: 'timestamp',
    direction: 'desc'
  }
};
