/**
 * Vercel Serverless Function: /api/sheet
 * Server-side CSV fetcher proxy that eliminates CORS, Safari ITP,
 * and mobile network isolation issues when fetching Google Sheets on mobile phones / PWAs.
 */

const DEFAULT_SHEET1_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPyjot8fPjGZLgO-N0so6AmhAKqzUdHg5YNAkLYu1_nVyHxQR1ydEmir9mzWQN5kLOqJBuToOhyUyj/pub?output=csv';
const DEFAULT_SHEET3_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPyjot8fPjGZLgO-N0so6AmhAKqzUdHg5YNAkLYu1_nVyHxQR1ydEmir9mzWQN5kLOqJBuToOhyUyj/pub?gid=1621694904&single=true&output=csv';

export default async function handler(req, res) {
  // Allow all origins & disable caching so mobile phones get real-time updates
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sheetParam = String(req.query?.sheet || '1'); // '1' or '3'
  let targetUrl = req.query?.url;

  if (!targetUrl) {
    if (sheetParam === '3') {
      targetUrl = process.env.VITE_SHEET_HISTORICAL_URL || process.env.SHEET_HISTORICAL_URL || DEFAULT_SHEET3_URL;
    } else {
      targetUrl = process.env.VITE_SHEET_CSV_URL || process.env.SHEET_CSV_URL || DEFAULT_SHEET1_URL;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const sheetRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!sheetRes.ok) {
      return res.status(sheetRes.status).json({
        success: false,
        error: `Google Sheets HTTP Error ${sheetRes.status}: ${sheetRes.statusText}`
      });
    }

    const csvText = await sheetRes.text();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(csvText);

  } catch (err) {
    console.error('[API /api/sheet proxy error]:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch Google Sheet server-side: ${err.message}`
    });
  }
}
