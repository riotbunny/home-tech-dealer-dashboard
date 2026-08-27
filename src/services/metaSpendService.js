/**
 * Meta Marketing API Ad Spend Service
 * Communicates with /api/spend serverless route
 */

export const SAMPLE_META_INSIGHTS = {
  spend: 141.20,
  cpc: 0.39887,
  ctr: 9.84975,
  impressions: 3594,
  clicks: 354,
  cpm: 39.2877,
  datePreset: 'today',
  dateStart: new Date().toISOString().slice(0, 10),
  dateStop: new Date().toISOString().slice(0, 10),
  source: 'fallback',
  error: null,
  timestamp: new Date()
};

/**
 * Fetches daily Meta ad spend insights from the backend serverless API (/api/spend)
 */
export async function fetchMetaSpend(datePreset = 'today') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const endpoint = `/api/spend?date_preset=${encodeURIComponent(datePreset)}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: Failed to reach /api/spend`);
    }

    const data = await response.json();

    if (!data.success && data.error) {
      console.warn('[MetaSpendService] Backend reported issue:', data.error);
      return {
        ...SAMPLE_META_INSIGHTS,
        error: data.error,
        source: 'fallback',
        timestamp: new Date()
      };
    }

    return {
      spend: typeof data.spend === 'number' ? data.spend : parseFloat(data.spend) || 0,
      cpc: typeof data.cpc === 'number' ? data.cpc : parseFloat(data.cpc) || 0,
      ctr: typeof data.ctr === 'number' ? data.ctr : parseFloat(data.ctr) || 0,
      impressions: typeof data.impressions === 'number' ? data.impressions : parseInt(data.impressions, 10) || 0,
      clicks: typeof data.clicks === 'number' ? data.clicks : parseInt(data.clicks, 10) || 0,
      cpm: typeof data.cpm === 'number' ? data.cpm : parseFloat(data.cpm) || 0,
      datePreset: data.datePreset || datePreset,
      dateStart: data.dateStart || null,
      dateStop: data.dateStop || null,
      source: data.source || 'live',
      error: data.error || null,
      timestamp: new Date(data.timestamp || Date.now())
    };
  } catch (err) {
    console.warn('[MetaSpendService] Fetch failed, returning fallback metrics:', err.message);
    return {
      ...SAMPLE_META_INSIGHTS,
      error: err.message,
      source: 'fallback',
      timestamp: new Date()
    };
  }
}
