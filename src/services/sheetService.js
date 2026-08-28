import Papa from 'papaparse';
import { SAMPLE_LEADS } from '../data/sampleLeads';

/**
 * Normalizes and maps raw CSV rows to the Home Tech Dealer schema.
 * Explicitly maps Columns A through I and strictly omits Columns J, K, and higher.
 *
 * Column A (0): fullName
 * Column B (1): phone
 * Column C (2): address
 * Column D (3): usage
 * Column E (4): timestamp
 * Column F (5): status
 * Column G (6): dripDay
 * Column H (7): City
 * Column I (8): State
 */
export function mapRowToLead(row, index) {
  // If row is an array from PapaParse with header: false
  if (Array.isArray(row)) {
    const rawName = (row[0] || '').trim();
    const rawPhone = (row[1] || '').trim();
    const rawAddress = (row[2] || '').trim();
    const rawUsage = (row[3] || '').trim();
    const rawTimestamp = (row[4] || '').trim();
    const rawStatus = (row[5] || '').trim();
    const rawDrip = (row[6] || '').trim();
    const rawCity = (row[7] || '').trim();
    const rawState = (row[8] || '').trim();

    return {
      id: `lead-live-${index + 1}`,
      fullName: rawName || 'N/A',
      phone: rawPhone || 'N/A',
      address: rawAddress || 'N/A',
      usage: rawUsage || 'Standard Lead',
      timestamp: rawTimestamp || new Date().toISOString(),
      status: rawStatus || 'New Lead',
      dripDay: rawDrip ? (rawDrip.toLowerCase().startsWith('day') ? rawDrip : `Day ${rawDrip}`) : 'Day 1',
      City: rawCity || 'N/A',
      State: rawState || 'N/A'
    };
  }

  // If parsed with header keys matching case-insensitively
  if (typeof row === 'object' && row !== null) {
    const getVal = (...keys) => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find(
          (item) => item.toLowerCase().replace(/[\s_-]/g, '') === k.toLowerCase().replace(/[\s_-]/g, '')
        );
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return String(row[foundKey]).trim();
        }
      }
      return '';
    };

    return {
      id: `lead-live-${index + 1}`,
      fullName: getVal('fullName', 'name', 'full_name', 'clientName') || 'N/A',
      phone: getVal('phone', 'phoneNumber', 'telephone', 'mobile') || 'N/A',
      address: getVal('address', 'street', 'streetAddress') || 'N/A',
      usage: getVal('usage', 'product', 'system', 'interest') || 'Standard Lead',
      timestamp: getVal('timestamp', 'date', 'created_at', 'loggedAt') || new Date().toISOString(),
      status: getVal('status', 'leadStatus', 'stage') || 'New Lead',
      dripDay: (() => {
        const d = getVal('dripDay', 'drip', 'dripStep');
        return d ? (d.toLowerCase().startsWith('day') ? d : `Day ${d}`) : 'Day 1';
      })(),
      City: getVal('city', 'town') || 'N/A',
      State: getVal('state', 'province', 'region') || 'N/A'
    };
  }

  return null;
}

/**
 * Checks if a parsed row appears to be a header row (e.g. "fullName", "phone", "address")
 */
function isHeaderRow(row) {
  if (Array.isArray(row)) {
    const firstCell = String(row[0] || '').toLowerCase().trim();
    const secondCell = String(row[1] || '').toLowerCase().trim();
    return (
      firstCell.includes('name') ||
      firstCell.includes('fullname') ||
      secondCell.includes('phone') ||
      firstCell === 'column a'
    );
  }
  return false;
}

/**
 * Normalizes any Google Sheet URL (edit, share, pubhtml, published web) into a direct CSV export endpoint.
 */
export function normalizeSheetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If already a direct CSV or gviz export URL with output=csv
  if (trimmed.includes('tqx=out:csv') || trimmed.includes('export?format=csv') || trimmed.includes('output=csv')) {
    return trimmed;
  }

  // Check for Published to Web link: /spreadsheets/d/e/(2PACX-[a-zA-Z0-9-_]+)
  const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/(2PACX-[a-zA-Z0-9-_]+)/);
  if (pubMatch && pubMatch[1]) {
    const pubId = pubMatch[1];
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?gid=${gid}&single=true&output=csv`;
  }

  // Standard Google Sheets URL: /spreadsheets/d/([a-zA-Z0-9-_]+) (excluding 'e')
  const match = trimmed.match(/\/spreadsheets\/d\/(?!e\/|\b)([^/?#]+)/);
  if (match && match[1] && match[1] !== 'e') {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  return trimmed;
}

/**
 * Ingests Google Sheet CSV feed using PapaParse.
 * Returns { leads: Array, source: 'live'|'fallback', error: string|null, timestamp: Date }
 */
export async function fetchSheetLeads(csvUrl) {
  if (!csvUrl || typeof csvUrl !== 'string') {
    return {
      leads: SAMPLE_LEADS,
      source: 'fallback',
      error: 'No Sheet CSV URL provided. Using sample leads dataset.',
      timestamp: new Date()
    };
  }

  const normalizedUrl = normalizeSheetUrl(csvUrl);

  try {
    // Attempt fetch with standard timeout
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
        throw new Error('HTTP Error 404: Sheet not found. Please verify the Sheet ID and ensure "File > Share > Publish to web" is enabled.');
      }
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Received empty response from CSV endpoint');
    }

    // Check if Google returned HTML login or error page instead of CSV
    if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
      throw new Error('Google returned HTML login page. Please enable "Anyone with the link can view" or publish via "File > Share > Publish to web".');
    }

    // Parse CSV with PapaParse
    const parsed = Papa.parse(csvText, {
      skipEmptyLines: 'greedy',
      header: false,
      dynamicTyping: false
    });

    if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
      throw new Error(`CSV Parse Error: ${parsed.errors[0].message}`);
    }

    let rawRows = parsed.data || [];

    // Filter out header row if present
    if (rawRows.length > 0 && isHeaderRow(rawRows[0])) {
      rawRows = rawRows.slice(1);
    }

    // Map strictly Columns A-I (drops column J, K, etc.)
    const leads = rawRows
      .filter(row => Array.isArray(row) && row.some(cell => String(cell || '').trim().length > 0))
      .map((row, index) => mapRowToLead(row, index));

    return {
      leads,
      source: 'live',
      error: null,
      timestamp: new Date()
    };
  } catch (err) {
    let cleanMessage = err.message || 'Failed to fetch live Google Sheet feed';
    if (err.name === 'AbortError' || cleanMessage.includes('aborted')) {
      cleanMessage = 'Connection timed out. Google Sheets endpoint is unreachable or blocking CORS.';
    }
    console.warn('[SheetService] Live fetch failed, activating fallback dataset:', cleanMessage);
    return {
      leads: SAMPLE_LEADS,
      source: 'fallback',
      error: cleanMessage,
      timestamp: new Date()
    };
  }
}
