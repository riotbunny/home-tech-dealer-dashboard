import Papa from 'papaparse';
import { SAMPLE_HISTORICAL_PERFORMANCE } from '../data/sampleHistorical';
import { normalizeSheetUrl } from './sheetService';

/**
 * Sanitizes numeric string (removes $, %, commas) and parses float
 */
function cleanNumber(val, defaultVal = 0) {
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  if (!val || typeof val !== 'string') return defaultVal;
  const cleaned = val.replace(/[^0-9.-]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultVal : parsed;
}

/**
 * Checks if a parsed row appears to be a header row
 */
function isHeaderRow(row) {
  if (Array.isArray(row)) {
    const firstCell = String(row[0] || '').toLowerCase().trim();
    const secondCell = String(row[1] || '').toLowerCase().trim();
    return (
      firstCell.includes('date') ||
      firstCell.includes('day') ||
      secondCell.includes('spend') ||
      secondCell.includes('total') ||
      firstCell === 'column a'
    );
  }
  return false;
}

/**
 * Maps a single row to the Sheet 3 Historical schema
 */
export function mapRowToHistorical(row, index) {
  if (Array.isArray(row)) {
    const rawDate = String(row[0] || '').trim();
    const totalSpend = cleanNumber(row[1], 0);
    const totalLeads = Math.round(cleanNumber(row[2], 0));
    
    // If CPL not explicitly in column 3, compute it
    let costPerLead = cleanNumber(row[3], 0);
    if (costPerLead === 0 && totalLeads > 0 && totalSpend > 0) {
      costPerLead = totalSpend / totalLeads;
    }

    const ctr = cleanNumber(row[4], 0);
    const cpc = cleanNumber(row[5], 0);

    return {
      id: `hist-live-${index + 1}`,
      date: rawDate || new Date().toISOString().slice(0, 10),
      totalSpend,
      totalLeads,
      costPerLead: Number(costPerLead.toFixed(2)),
      ctr: Number(ctr.toFixed(2)),
      cpc: Number(cpc.toFixed(2))
    };
  }

  if (typeof row === 'object' && row !== null) {
    const getVal = (...keys) => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find(
          (item) => item.toLowerCase().replace(/[\s_$%()\-]/g, '') === k.toLowerCase().replace(/[\s_$%()\-]/g, '')
        );
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return row[foundKey];
        }
      }
      return '';
    };

    const rawDate = String(getVal('date', 'day', 'timestamp') || '').trim();
    const totalSpend = cleanNumber(getVal('totalSpend', 'spend', 'cost', 'adSpend'), 0);
    const totalLeads = Math.round(cleanNumber(getVal('totalLeads', 'leads', 'leadCount'), 0));
    
    let costPerLead = cleanNumber(getVal('costPerLead', 'cpl', 'cplead'), 0);
    if (costPerLead === 0 && totalLeads > 0 && totalSpend > 0) {
      costPerLead = totalSpend / totalLeads;
    }

    const ctr = cleanNumber(getVal('ctr', 'clickThroughRate'), 0);
    const cpc = cleanNumber(getVal('cpc', 'costPerClick'), 0);

    return {
      id: `hist-live-${index + 1}`,
      date: rawDate || new Date().toISOString().slice(0, 10),
      totalSpend,
      totalLeads,
      costPerLead: Number(costPerLead.toFixed(2)),
      ctr: Number(ctr.toFixed(2)),
      cpc: Number(cpc.toFixed(2))
    };
  }

  return null;
}

/**
 * Ingests Sheet 3 Historical CSV data using PapaParse
 */
export async function fetchHistoricalPerformance(csvUrl) {
  if (!csvUrl || typeof csvUrl !== 'string') {
    return {
      records: SAMPLE_HISTORICAL_PERFORMANCE,
      source: 'fallback',
      error: 'No Sheet 3 URL provided. Using sample historical dataset.',
      timestamp: new Date()
    };
  }

  const normalizedUrl = normalizeSheetUrl(csvUrl);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain, */*'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('HTTP 404: Sheet 3 not found. Check sheet name "Sheet3" and web publish settings.');
      }
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Received empty response from Sheet 3 CSV endpoint');
    }

    if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
      throw new Error('Endpoint returned HTML instead of CSV for Sheet 3');
    }

    const parsed = Papa.parse(csvText, {
      skipEmptyLines: 'greedy',
      header: false,
      dynamicTyping: false
    });

    if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
      throw new Error(`CSV Parse Error: ${parsed.errors[0].message}`);
    }

    let rawRows = parsed.data || [];

    if (rawRows.length > 0 && isHeaderRow(rawRows[0])) {
      rawRows = rawRows.slice(1);
    }

    const records = rawRows
      .filter(row => Array.isArray(row) && row.some(cell => String(cell || '').trim().length > 0))
      .map((row, idx) => mapRowToHistorical(row, idx))
      .filter(Boolean);

    return {
      records,
      source: 'live',
      error: null,
      timestamp: new Date()
    };
  } catch (err) {
    let msg = err.message || 'Failed to fetch Sheet 3 historical log';
    if (err.name === 'AbortError' || msg.includes('aborted')) {
      msg = 'Connection timed out while fetching Sheet 3';
    }
    console.warn('[HistoricalService] Live fetch failed, using fallback dataset:', msg);
    return {
      records: SAMPLE_HISTORICAL_PERFORMANCE,
      source: 'fallback',
      error: msg,
      timestamp: new Date()
    };
  }
}
