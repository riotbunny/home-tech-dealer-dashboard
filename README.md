# Home Tech Dealer Leads & Meta Ad Intelligence Dashboard

A high-performance operational intelligence dashboard built with **React**, **Vite**, **Tailwind CSS**, and **Vercel Serverless Functions**. It connects live lead flow from **Sheet 1**, automated daily ad spend from the **Meta Marketing (Graph) API**, historical performance analytics from **Sheet 3**, and an automated **Vercel Cron Job** running nightly to append yesterday's campaign performance.

---

## ⚡ Dynamic Environment Architecture & Instant Propagation

All data feeds and API integrations in this project are **100% dynamic** and driven exclusively by Vercel environment variables:

```
┌─────────────────────────────────────────────────────────────┐
│                 Vercel Environment Variables                │
├──────────────────────────────┬──────────────────────────────┤
│  Client-Side (Vite Injected) │ Serverless Backend (Node.js) │
│  • VITE_SHEET_CSV_URL        │ • META_ACCESS_TOKEN          │
│  • VITE_SHEET_HISTORICAL_URL │ • META_AD_ACCOUNT_ID         │
│                              │ • CRON_SECRET                │
│                              │ • GOOGLE_SHEETS_WEBHOOK_URL  │
└──────────────┬───────────────┴──────────────┬───────────────┘
               ▼                              ▼
        React SPA / PWA              Serverless Functions
     (Auto-Compiled on Build)       (/api/spend, /api/cron/*)
```

### 📱 Zero-Touch Client & Mobile PWA Updates
When you update any environment variable in your **Vercel Project Settings** and trigger a **Redeploy**:
1. Vite's production build step automatically bakes the updated `VITE_` variables into the production bundle.
2. Vercel deploys the updated bundle globally to edge CDNs.
3. All connected browsers, desktop tabs, and **installed mobile PWA instances** automatically pull and load the new sheet endpoints without requiring manual user configuration or code changes.

---

## 🔐 Environment Variables for Vercel

Configure these variables in **Vercel Project Settings > Environment Variables**:

| Variable Name | Scope | Description | Example / Current Value |
| :--- | :--- | :--- | :--- |
| `VITE_SHEET_CSV_URL` | Frontend | Google Sheet 1 CSV export (Live Leads) | `https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet1` |
| `VITE_SHEET_HISTORICAL_URL` | Frontend | Google Sheet 3 CSV export (Historical Performance) | `https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet3` |
| `META_ACCESS_TOKEN` | Backend | Meta Long-Lived / System User Access Token | `EAAblQds0dvIBSY6owb...` |
| `META_AD_ACCOUNT_ID` | Backend | Meta Ad Account ID (e.g., `act_1677753792720663`) | `act_1677753792720663` |
| `CRON_SECRET` | Backend | Bearer Token to authenticate Vercel Cron requests | `ht_cron_sec_89d3a7f4e912bc0561a3` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Backend | (Optional) Webhook to automatically append rows to Sheet 3 | Deployed from `scripts/google-apps-script.js` |

---

## 🤖 Nightly Vercel Cron Job (`/api/cron/daily-sync`)

- **Schedule**: `5 0 * * *` (Every night at 00:05 AM UTC).
- **Execution**:
  1. Authenticates request with `Authorization: Bearer ${CRON_SECRET}`.
  2. Queries Meta Marketing Insights API for `date_preset=yesterday`.
  3. Formats row: `[Date, Total Spend, Total Leads, CPL, CTR, CPC]`.
  4. Appends new daily summary row to **Sheet 3** via `GOOGLE_SHEETS_WEBHOOK_URL`.

---

## 🔄 Historical Backfill Engine (`/api/cron/backfill`)

- Queries day-by-day Meta ad spend and lead performance starting from **August 20, 2026 onward**.
- Available directly inside the dashboard under **Feed Source &rarr; Cron & Backfill Engine**.
- Generates 1-click clipboard export for Google Sheets or dispatches bulk append via webhook.

---

## 🚀 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Run development server (with /api/spend, /api/cron/daily-sync, /api/cron/backfill emulation)
npm run dev
```

Open `http://localhost:3000`.

---

## 🐙 Push to GitHub & Deploy to Vercel

```bash
git add .
git commit -m "feat: dynamic environment variable configuration and backfill engine"
git push origin main
```
