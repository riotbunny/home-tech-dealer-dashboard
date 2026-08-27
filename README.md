# Home Tech Dealer Leads & Meta Ad Intelligence Dashboard

A full-stack operational dashboard built with **React**, **Vite**, **Tailwind CSS**, and **Vercel Serverless Functions**. It connects live lead flow from the "Home Tech Dealer Leads" Google Sheet (Sheet 1 / `gid=0`) with automated daily ad spend and performance metrics from the **Meta Marketing (Graph) API**.

---

## ⚡ Features

- **Automated Daily Meta Ad Spend**: Secure Vercel Serverless Function (`/api/spend`) querying Meta Graph API v21.0 for real-time daily spend, impressions, link clicks, CPC, and CTR.
- **Cost Per Lead (CPL) Engine**: Dynamically calculates live Cost Per Lead:
  $$\text{CPL} = \frac{\text{Today's Total Ad Spend}}{\text{Today's Total Leads}}$$
- **Live Google Sheet Ingestion**: Ingests live data directly from the Sheet 1 CSV feed URL using **PapaParse**.
- **Strict Data Schema**: Maps Columns A through I and strictly omits Columns J and K.
  - Column A: `fullName`
  - Column B: `phone` (with click-to-call & quick copy)
  - Column C: `address`
  - Column D: `usage`
  - Column E: `timestamp` (with relative & formatted timestamps)
  - Column F: `status` (soft glowing badges for active states)
  - Column G: `dripDay`
  - Column H: `City`
  - Column I: `State`
- **Real-Time Operational Metrics**:
  - Total Record Count
  - Today's Lead Volume
  - Today's Total Ad Spend
  - Live Cost Per Lead (CPL)
  - Avg. CPC, CTR, Clicks, and Impressions
- **Interactive Meta Campaign Modal**: Inspect ad metrics across date presets (`today`, `yesterday`, `last_7d`, `this_month`, `maximum`).
- **Real-Time Search & Filtering**: Multi-field text search + Status, State, and Drip Day selectors.
- **Sortable & Paginated Table**: Full column sorting and customizable page sizes (10, 25, 50, 100).
- **Lead Dossier Drawer**: Click any lead row to inspect full profile details and initiate quick actions.
- **Export to CSV**: Export filtered or full datasets instantly.

---

## 🔐 Environment Variables

Configure the following environment variables in `.env` for local development and in **Vercel Project Settings**:

| Variable Name | Description | Example / Current Value |
| :--- | :--- | :--- |
| `VITE_SHEET_CSV_URL` | Google Sheet CSV export endpoint | `https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet1` |
| `META_ACCESS_TOKEN` | Meta System User / Long-Lived User Access Token | `EAAblQds0dvIBSY6owb...` |
| `META_AD_ACCOUNT_ID` | Meta Ad Account ID (prefixed with `act_`) | `act_1677753792720663` |

---

## 🚀 Getting Started Locally

```bash
# 1. Navigate to directory
cd home-tech-dealer-dashboard

# 2. Install dependencies
npm install

# 3. Start local development server (includes /api/spend local emulation)
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🐙 Push to GitHub

```bash
git add .
git commit -m "feat: integrate Meta Marketing API ad spend and CPL tracking"
git push origin main
```

---

## ▲ Deploy to Vercel

### Step 1: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New Project"** and select **`riotbunny/home-tech-dealer-dashboard`**.
3. Framework Preset will auto-detect **Vite**.

### Step 2: Set Environment Variables
Under **Environment Variables**, add the 3 required variables:

1. **`VITE_SHEET_CSV_URL`**:
   ```
   https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet1
   ```
2. **`META_ACCESS_TOKEN`**:
   ```
   EAAblQds0dvIBSY6owb2nXa4TeHq92ekZCPEqdFZBWPiJSAUlmO0QVEFMsTzDOXFmsOQqhufnZAX2IWsefnl57ydw23JFW5Nc0y6BTPEhXNuflTz5oyQm1QGzGpMjDqcAhbmpJkH3xkLUDVfSVnTdaWQ00R0Sk6lrlO6sWOPJp1AQUir470A7FMBgi56eE0ptAZDZD
   ```
3. **`META_AD_ACCOUNT_ID`**:
   ```
   act_1677753792720663
   ```

### Step 3: Deploy
Click **Deploy**. Vercel will automatically build the React Vite frontend and deploy the `/api/spend` serverless function on the edge!
