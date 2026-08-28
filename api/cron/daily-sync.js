/**
 * Vercel Serverless Cron Job: /api/cron/daily-sync
 * Scheduled via vercel.json: "5 0 * * *" (Every day at 00:05 AM UTC)
 * 
 * Workflow:
 * 1. Verifies Bearer Token Authentication (CRON_SECRET).
 * 2. Queries Meta Marketing Insights API for yesterday's spend, link clicks, impressions, and leads.
 * 3. Formats row: [Date, Total Spend, Total Leads, CPL, CTR, CPC].
 * 4. Appends new daily summary row to Sheet 3 via Google Sheets Webhook or Google API.
 */

export default async function handler(req, res) {
  // CORS & Methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Security Check: Authenticate Vercel Cron or Admin Bearer Token
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron /api/cron/daily-sync] Unauthorized request. Missing or invalid Bearer token.');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Invalid or missing Authorization: Bearer ${CRON_SECRET} header.',
      timestamp: new Date().toISOString()
    });
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  let adAccountId = process.env.META_AD_ACCOUNT_ID;
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!accessToken || !adAccountId) {
    return res.status(500).json({
      success: false,
      error: 'META_ACCESS_TOKEN or META_AD_ACCOUNT_ID is not configured in Vercel environment variables.',
      timestamp: new Date().toISOString()
    });
  }

  if (!adAccountId.startsWith('act_')) {
    adAccountId = `act_${adAccountId}`;
  }

  try {
    console.log('[Cron] Starting automated daily sync for date_preset=yesterday...');

    // 2. Query Meta Marketing Insights API for Yesterday
    const fields = 'spend,cpc,ctr,impressions,clicks,cpm,actions';
    const metaUrl = `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=${fields}&date_preset=yesterday&access_token=${encodeURIComponent(accessToken)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const metaResponse = await fetch(metaUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const metaData = await metaResponse.json();

    if (!metaResponse.ok || metaData.error) {
      const errMsg = metaData.error?.message || `Meta API HTTP ${metaResponse.status}`;
      throw new Error(`Meta Insights query failed: ${errMsg}`);
    }

    const insight = (metaData.data && metaData.data[0]) ? metaData.data[0] : null;

    // Determine target yesterday date string (YYYY-MM-DD)
    const yesterdayDate = insight?.date_start || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })();

    const spend = insight?.spend ? parseFloat(insight.spend) : 0;
    const cpc = insight?.cpc ? parseFloat(insight.cpc) : 0;
    const ctr = insight?.ctr ? parseFloat(insight.ctr) : 0;
    const clicks = insight?.clicks ? parseInt(insight.clicks, 10) : 0;
    const impressions = insight?.impressions ? parseInt(insight.impressions, 10) : 0;

    // Calculate Leads from Meta actions (leads / on-facebook leads)
    let leadCount = 0;
    if (insight?.actions && Array.isArray(insight.actions)) {
      const leadAction = insight.actions.find(
        a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped' || a.action_type === 'leadgen.other'
      );
      if (leadAction && leadAction.value) {
        leadCount = parseInt(leadAction.value, 10) || 0;
      }
    }

    // If Meta actions has no lead count, estimate or query Sheet 1 feed
    if (leadCount === 0 && spend > 0) {
      try {
        const sheet1Url = process.env.VITE_SHEET_CSV_URL;
        if (sheet1Url) {
          const sheet1Res = await fetch(sheet1Url, { headers: { 'Accept': 'text/csv, text/plain' } });
          if (sheet1Res.ok) {
            const sheet1Csv = await sheet1Res.text();
            // Count rows matching yesterday's date in timestamp column
            const lines = sheet1Csv.split('\n');
            const matches = lines.filter(line => line.includes(yesterdayDate));
            if (matches.length > 0) {
              leadCount = matches.length;
            }
          }
        }
      } catch (sheetErr) {
        console.warn('[Cron] Optional Sheet 1 lead count lookup failed:', sheetErr.message);
      }
    }

    // Default to at least 1 lead if zero or compute CPL accordingly
    const cpl = leadCount > 0 ? Number((spend / leadCount).toFixed(2)) : 0;

    const formattedRow = {
      date: yesterdayDate,
      totalSpend: Number(spend.toFixed(2)),
      totalLeads: leadCount,
      costPerLead: cpl,
      ctr: Number(ctr.toFixed(2)),
      cpc: Number(cpc.toFixed(2)),
      impressions,
      clicks
    };

    // Format array: [Date, Total Spend, Total Leads, CPL, CTR, CPC]
    const rowArray = [
      formattedRow.date,
      formattedRow.totalSpend,
      formattedRow.totalLeads,
      formattedRow.costPerLead,
      formattedRow.ctr,
      formattedRow.cpc
    ];

    let sheetAppendResult = {
      attempted: false,
      success: false,
      message: 'No GOOGLE_SHEETS_WEBHOOK_URL configured. Row ready for append.'
    };

    // 3. Append to Sheet 3 via Google Sheets Webhook
    if (webhookUrl) {
      try {
        const hookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheetName: 'Sheet3',
            row: rowArray,
            data: formattedRow,
            secret: cronSecret || null
          })
        });

        const hookText = await hookRes.text();
        sheetAppendResult = {
          attempted: true,
          success: hookRes.ok,
          message: hookRes.ok ? 'Successfully appended row to Sheet 3.' : `Webhook returned HTTP ${hookRes.status}: ${hookText}`
        };
      } catch (hookErr) {
        console.error('[Cron] Google Sheets webhook error:', hookErr);
        sheetAppendResult = {
          attempted: true,
          success: false,
          message: `Webhook connection failed: ${hookErr.message}`
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: `Daily cron sync completed for ${yesterdayDate}.`,
      date: yesterdayDate,
      metrics: formattedRow,
      rowArray,
      sheetAppend: sheetAppendResult,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[Cron /api/cron/daily-sync] Execution Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
