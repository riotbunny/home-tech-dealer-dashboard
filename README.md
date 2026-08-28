# Home Tech Dealer Leads & Meta Ad Intelligence Dashboard

A full-stack operational dashboard built with **React**, **Vite**, **Tailwind CSS**, and **Vercel Serverless Functions**. It combines live lead flow from **Sheet 1**, automated daily ad spend from the **Meta Marketing (Graph) API**, and historical daily campaign performance from **Sheet 3**.

---

## ⚡ Features

- **Interactive View Toggle**: Seamlessly switch between:
  - 🟢 **Live Leads (Sheet 1)**: Operational real-time backend monitoring, column mapping (A-I), soft status badges, multi-field search, and lead dossier inspection.
  - 📊 **Historical Log (Sheet 3)**: Daily performance analytics tracking Date, Total Spend, Total Leads, Cost Per Lead (CPL), CTR, and CPC with summary KPIs.
- **Automated Daily Meta Ad Spend**: Secure Vercel Serverless Function (`/api/spend`) querying Meta Graph API v21.0 for real-time daily spend, impressions, link clicks, CPC, and CTR.
- **Live Cost Per Lead (CPL) Engine**: Dynamically calculates live CPL:
  $$\text{CPL} = \frac{\text{Today's Total Ad Spend}}{\text{Today's Total Leads}}$$
- **Multi-Sheet Ingestion**: Uses **PapaParse** to ingest both Sheet 1 and Sheet 3 CSV feeds dynamically on load with offline fallback safety.
- **Export to CSV**: Export filtered live leads or full Sheet 3 historical daily performance logs with one click.

---

## 🔐 Environment Variables

| Variable Name | Description | Default / Example Value |
| :--- | :--- | :--- |
| `VITE_SHEET_CSV_URL` | Google Sheet 1 CSV export (Live Leads) | `https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet1` |
| `VITE_SHEET_HISTORICAL_URL` | Google Sheet 3 CSV export (Historical Performance) | `https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet3` |
| `META_ACCESS_TOKEN` | Meta System User / Long-Lived Token | `EAAblQds0dvIBSY6owb...` |
| `META_AD_ACCOUNT_ID` | Meta Ad Account ID | `act_1677753792720663` |

---

## 🚀 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (with /api/spend serverless emulation)
npm run dev
```

Open `http://localhost:3000`.

---

## 🐙 Push to GitHub

```bash
git add .
git commit -m "feat: add Sheet 3 historical daily performance view with navigation toggle"
git push origin main
```

---

## ▲ Deploy to Vercel

1. Import the repository `riotbunny/home-tech-dealer-dashboard` into [Vercel](https://vercel.com).
2. Configure the 4 Environment Variables (`VITE_SHEET_CSV_URL`, `VITE_SHEET_HISTORICAL_URL`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`).
3. Click **Deploy**.
