import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url, `http://${req.headers.host}`);

            if (
              url.pathname === '/api/spend' ||
              url.pathname === '/api/cron/daily-sync' ||
              url.pathname === '/api/cron/backfill'
            ) {
              // Pass environment variables to process.env for local execution
              process.env.META_ACCESS_TOKEN = env.META_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
              process.env.META_AD_ACCOUNT_ID = env.META_AD_ACCOUNT_ID || process.env.META_AD_ACCOUNT_ID;
              process.env.CRON_SECRET = env.CRON_SECRET || process.env.CRON_SECRET;
              process.env.GOOGLE_SHEETS_WEBHOOK_URL = env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
              process.env.VITE_SHEET_CSV_URL = env.VITE_SHEET_CSV_URL || process.env.VITE_SHEET_CSV_URL;
              process.env.VITE_SHEET_HISTORICAL_URL = env.VITE_SHEET_HISTORICAL_URL || process.env.VITE_SHEET_HISTORICAL_URL;

              try {
                let handler;
                if (url.pathname === '/api/spend') {
                  const mod = await import('./api/spend.js');
                  handler = mod.default;
                } else if (url.pathname === '/api/cron/daily-sync') {
                  const mod = await import('./api/cron/daily-sync.js');
                  handler = mod.default;
                } else if (url.pathname === '/api/cron/backfill') {
                  const mod = await import('./api/cron/backfill.js');
                  handler = mod.default;
                }

                // Polyfill minimal res helper for Express-like Vercel functions
                const query = Object.fromEntries(url.searchParams.entries());
                const customReq = {
                  method: req.method,
                  query,
                  headers: req.headers
                };

                const customRes = {
                  statusCode: 200,
                  headers: {},
                  setHeader(k, v) {
                    this.headers[k] = v;
                    res.setHeader(k, v);
                    return this;
                  },
                  status(code) {
                    this.statusCode = code;
                    res.statusCode = code;
                    return this;
                  },
                  json(data) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end(data) {
                    res.end(data);
                  }
                };

                await handler(customReq, customRes);
              } catch (err) {
                console.error('[Vite Local API Plugin Error]:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
