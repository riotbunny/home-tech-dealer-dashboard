# Home Tech Dealer Leads & Meta Ad Intelligence Dashboard

A full-stack operational dashboard built with **React**, **Vite**, **Tailwind CSS**, and **Vercel Serverless Functions**. It connects live lead flow from **Sheet 1**, automated daily ad spend from the **Meta Marketing (Graph) API**, historical performance analytics from **Sheet 3**, and an automated **Vercel Cron Job** running nightly to append yesterday's campaign performance.

---

## ⚡ Features

- **Automated Nightly Vercel Cron Job (`/api/cron/daily-sync`)**:
  - Automatically runs every night at **00:05 AM UTC** (`5 0 * * *`).
  - Queries the Meta Marketing Insights API for yesterday's spend, link clicks, impressions, and leads.
  - Automatically appends a new daily summary row `[Date, Total Spend, Total Leads, CPL, CTR, CPC]` to **Sheet 3**.
  - Protected with `Authorization: Bearer ${CRON_SECRET}` verification.
- **Interactive Navigation Toggle**:
  - 🟢 **Live Leads (Sheet 1)**: Operational backend lead flow monitoring, Columns A-I mapped, soft status badges, multi-field search, and lead dossier inspection.
  - 📊 **Historical Log (Sheet 3)**: Cumulative daily performance table with KPI cards, CPL efficiency badges, and date search.
- **Automated Daily Meta Ad Spend**: Secure serverless route (`/api/spend`) querying Meta Graph API v21.0.
- **Live Cost Per Lead (CPL) Calculation**: Dynamically computes live CPL ($\text{Spend} \div \text{Leads}$).
- **Export to CSV**: Download filtered live leads or Sheet 3 historical daily logs with one click.

---

## 🔐 Environment Variables for Vercel

Configure these variables in **Vercel Project Settings > Environment Variables**:

| Variable Name | Description | Example / Current Value |
| :--- | :--- | :--- |
| `VITE_SHEET_CSV_URL` | Google Sheet 1 CSV export (Live Leads) | `https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet1` |
| `VITE_SHEET_HISTORICAL_URL` | Google Sheet 3 CSV export (Historical Performance) | `https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet3` |
| `META_ACCESS_TOKEN` | Meta System User / Long-Lived User Access Token | `EAAblQds0dvIBSY6owb...` |
| `META_AD_ACCOUNT_ID` | Meta Ad Account ID (prefixed with `act_`) | `act_1677753792720663` |
| `CRON_SECRET` | Secret token to authenticate Vercel Cron requests | `ht_cron_sec_89d3a7f4e912bc0561a3` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | (Optional) Webhook URL to append rows to Sheet 3 | Deploy via `scripts/google-apps-script.js` |

---

## 🤖 Google Sheet 3 Webhook Setup (2 Minutes)

To allow the cron job to automatically write rows to Sheet 3:

1. Open your Google Sheet.
2. Go to **Extensions &gt; Apps Script**.
3. Copy and paste the script provided in [`scripts/google-apps-script.js`](file:///C:/Users/abelv/.gemini/antigravity/scratch/home-tech-dealer-dashboard/scripts/google-apps-script.js).
4. Click **Deploy &gt; New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the generated Web App URL and add it to Vercel as `GOOGLE_SHEETS_WEBHOOK_URL`.

---

## 🚀 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Run development server (with /api/spend and /api/cron/daily-sync local emulation)
npm run dev
```

Open `http://localhost:3000`.

---

## 🐙 Push to GitHub & Deploy to Vercel

```bash
git add .
git commit -m "feat: add automated nightly Vercel cron job for Sheet 3 sync"
git push origin main
```

When deployed to Vercel, the cron schedule in `vercel.json` (`5 0 * * *`) will automatically register under the **Cron Jobs** tab in your Vercel project dashboard!
