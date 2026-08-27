# Home Tech Dealer Leads — Operational Dashboard

A high-contrast, clean operational React dashboard built with **Vite** and **Tailwind CSS** that dynamically pulls live lead flow data from the "Home Tech Dealer Leads" Google Sheet (Sheet 1 / `gid=0`) using **PapaParse**.

---

## ⚡ Features

- **Live Google Sheet Ingestion**: Ingests live data directly from the Sheet 1 CSV feed URL.
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
  - Records Logged Today
  - Active Pipeline Counter
  - Top Territory by Volume
  - Last Synced relative indicator with manual **Sync Now** trigger
- **Real-Time Search & Filtering**: Instant multi-field text search across name, phone, address, city, state, and usage, combined with dropdown filters for Status, State, and Drip Day.
- **Sortable & Paginated Table**: Full column sorting and customizable page sizes (10, 25, 50, 100).
- **Lead Dossier Drawer**: Click any lead row to inspect full profile details and initiate quick actions.
- **Export to CSV**: Export filtered or full datasets instantly.
- **Offline / Sample Fallback Mode**: Gracefully provides sample data and an interactive Feed Source configuration modal if the Google Sheet is private or offline.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
```bash
# Navigate to the project directory
cd home-tech-dealer-dashboard

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
VITE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet1
```

### 4. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📊 Google Sheets Setup & Public Sharing

For the Google Sheet to be accessible anonymously by the web application:

1. Open your Google Sheet.
2. Click **File** &gt; **Share** &gt; **Publish to web**.
3. Under **Link**, choose **Sheet1** and set format to **Comma-separated values (.csv)**.
4. Click **Publish** and copy the resulting URL.
5. In Google Drive sharing settings, ensure the sheet is set to **"Anyone with the link can view"**.

---

## 🐙 Push to GitHub

To push this project to a new GitHub repository:

```bash
# 1. Initialize git repository
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "feat: initial commit for Home Tech Dealer Leads dashboard"

# 4. Rename main branch
git branch -M main

# 5. Add your GitHub remote repository URL
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 6. Push to GitHub
git push -u origin main
```

---

## ▲ Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub (see steps above).
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New Project"** and import your GitHub repository.
4. Framework preset will automatically detect **Vite**.
5. Under **Environment Variables**, add:
   - **Key**: `VITE_SHEET_CSV_URL`
   - **Value**: `https://docs.google.com/spreadsheets/d/1ByosXXUL-go3Bpag7NBrt3i7DgMMw1_eh_9xl2U/gviz/tq?tqx=out:csv&sheet=Sheet1`
6. Click **Deploy**.

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally if not already installed
npm i -g vercel

# Login and deploy
vercel

# Deploy to production
vercel --prod
```

When prompted, set the environment variable:
```bash
vercel env add VITE_SHEET_CSV_URL
```

---

## 🛠️ Build & Verification Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```
