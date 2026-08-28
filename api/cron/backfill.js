/**
 * Vercel Serverless Function: /api/cron/backfill
 * Backfills historical Meta ad spend, impressions, clicks, leads, and CPL
 * starting from August 20, 2026 onward into Sheet 3 format: [Date, Total Spend, Total Leads, CPL, CTR, CPC]
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Security Check (if CRON_SECRET is configured)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const querySecret = req.query?.secret;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    // In local dev without secret, allow or check
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Missing or invalid Bearer token / secret.'
      });
    }
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  let adAccountId = process.env.META_AD_ACCOUNT_ID;

  if (!accessToken || !adAccountId) {
    return res.status(500).json({
      success: false,
      error: 'META_ACCESS_TOKEN or META_AD_ACCOUNT_ID is not configured in environment variables.'
    });
  }

  if (!adAccountId.startsWith('act_')) {
    adAccountId = `act_${adAccountId}`;
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  // Date range (defaults: 2026-08-20 until yesterday)
  const startDate = req.query?.start_date || '2026-08-20';
  const endDate = req.query?.end_date || (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  try {
    console.log(`[Backfill] Fetching Meta insights from ${startDate} to ${endDate}...`);

    const fields = 'spend,cpc,ctr,impressions,clicks,cpm,actions';
    const timeRangeJson = JSON.stringify({ since: startDate, until: endDate });
    const metaUrl = `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=${fields}&time_range=${encodeURIComponent(
      timeRangeJson
    )}&time_increment=1&access_token=${encodeURIComponent(accessToken)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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

    const dailyItems = metaData.data || [];

    // Format rows
    const formattedRows = dailyItems.map((item, idx) => {
      const dateStr = item.date_start;
      const spend = item.spend ? parseFloat(item.spend) : 0;
      const cpc = item.cpc ? parseFloat(item.cpc) : 0;
      const ctr = item.ctr ? parseFloat(item.ctr) : 0;
      const impressions = item.impressions ? parseInt(item.impressions, 10) : 0;
      const clicks = item.clicks ? parseInt(item.clicks, 10) : 0;

      // Extract lead count from actions
      let leadCount = 0;
      if (item.actions && Array.isArray(item.actions)) {
        const leadAction = item.actions.find(
          a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped' || a.action_type === 'leadgen.other'
        );
        if (leadAction && leadAction.value) {
          leadCount = parseInt(leadAction.value, 10) || 0;
        }
      }

      const cpl = leadCount > 0 ? Number((spend / leadCount).toFixed(2)) : 0;

      return {
        id: `hist-backfill-${idx + 1}`,
        date: dateStr,
        totalSpend: Number(spend.toFixed(2)),
        totalLeads: leadCount,
        costPerLead: cpl,
        ctr: Number(ctr.toFixed(2)),
        cpc: Number(cpc.toFixed(2)),
        impressions,
        clicks,
        rowArray: [
          dateStr,
          Number(spend.toFixed(2)),
          leadCount,
          cpl,
          Number(ctr.toFixed(2)),
          Number(cpc.toFixed(2))
        ]
      };
    });

    // Generate TSV string for easy copy-paste into Google Sheets
    const headerRow = ['Date', 'Total Spend', 'Total Leads', 'Cost Per Lead (CPL)', 'CTR', 'CPC'];
    const tsvLines = [
      headerRow.join('\t'),
      ...formattedRows.map(r => r.rowArray.join('\t'))
    ];
    const tsvContent = tsvLines.join('\n');

    // Attempt Sheet 3 Webhook Append
    let sheetAppendResult = {
      attempted: false,
      success: false,
      message: 'No GOOGLE_SHEETS_WEBHOOK_URL configured. Use TSV copy to paste into Sheet 3.'
    };

    if (webhookUrl && formattedRows.length > 0) {
      try {
        const hookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheetName: 'Sheet3',
            rows: formattedRows.map(r => r.rowArray),
            data: formattedRows,
            secret: cronSecret || null
          })
        });

        const hookText = await hookRes.text();
        sheetAppendResult = {
          attempted: true,
          success: hookRes.ok,
          message: hookRes.ok ? `Successfully appended ${formattedRows.length} historical rows to Sheet 3!` : `Webhook returned HTTP ${hookRes.status}: ${hookText}`
        };
      } catch (hookErr) {
        sheetAppendResult = {
          attempted: true,
          success: false,
          message: `Webhook connection error: ${hookErr.message}`
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully backfilled ${formattedRows.length} days of Meta ad metrics from ${startDate} to ${endDate}.`,
      dateRange: { startDate, endDate },
      totalDays: formattedRows.length,
      records: formattedRows,
      tsvContent,
      sheetAppend: sheetAppendResult,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[Backfill Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
