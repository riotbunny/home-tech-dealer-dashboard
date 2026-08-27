/**
 * Vercel Serverless Function: /api/spend
 * Securely queries Meta Marketing API Insights for automated daily ad spend.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  let adAccountId = process.env.META_AD_ACCOUNT_ID || 'act_1677753792720663';

  // Ensure adAccountId is formatted with act_ prefix
  if (adAccountId && !adAccountId.startsWith('act_')) {
    adAccountId = `act_${adAccountId}`;
  }

  // Get date_preset from query params (default to 'today')
  const datePreset = req.query?.date_preset || 'today';

  if (!accessToken) {
    console.warn('[API /spend] Missing META_ACCESS_TOKEN in environment variables.');
    return res.status(200).json({
      success: false,
      spend: 0,
      cpc: 0,
      ctr: 0,
      impressions: 0,
      clicks: 0,
      cpm: 0,
      datePreset,
      source: 'fallback',
      error: 'META_ACCESS_TOKEN is not configured on the server. Please add it to environment variables.',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const fields = 'spend,cpc,ctr,impressions,clicks,cpm';
    const metaUrl = `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=${fields}&date_preset=${encodeURIComponent(
      datePreset
    )}&access_token=${encodeURIComponent(accessToken)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(metaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMessage = data.error?.message || `Meta API error: HTTP ${response.status}`;
      console.error('[API /spend] Meta API Error:', errorMessage);

      return res.status(200).json({
        success: false,
        spend: 0,
        cpc: 0,
        ctr: 0,
        impressions: 0,
        clicks: 0,
        cpm: 0,
        datePreset,
        source: 'fallback',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }

    // Extract insights payload
    const insight = (data.data && data.data[0]) ? data.data[0] : null;

    const spend = insight?.spend ? parseFloat(insight.spend) : 0;
    const cpc = insight?.cpc ? parseFloat(insight.cpc) : 0;
    const ctr = insight?.ctr ? parseFloat(insight.ctr) : 0;
    const impressions = insight?.impressions ? parseInt(insight.impressions, 10) : 0;
    const clicks = insight?.clicks ? parseInt(insight.clicks, 10) : 0;
    const cpm = insight?.cpm ? parseFloat(insight.cpm) : 0;

    // Cache successful response for 60 seconds on CDN edge
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    return res.status(200).json({
      success: true,
      spend,
      cpc,
      ctr,
      impressions,
      clicks,
      cpm,
      datePreset,
      dateStart: insight?.date_start || null,
      dateStop: insight?.date_stop || null,
      source: 'live',
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[API /spend] Serverless Execution Exception:', err);
    return res.status(200).json({
      success: false,
      spend: 0,
      cpc: 0,
      ctr: 0,
      impressions: 0,
      clicks: 0,
      cpm: 0,
      datePreset,
      source: 'fallback',
      error: err.name === 'AbortError' ? 'Meta API request timed out after 8s.' : err.message,
      timestamp: new Date().toISOString()
    });
  }
}
