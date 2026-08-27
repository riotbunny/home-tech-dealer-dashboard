import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-spend-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            if (url.pathname === '/api/spend') {
              // Pass environment variables to process.env for local serverless execution
              process.env.META_ACCESS_TOKEN = env.META_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
              process.env.META_AD_ACCOUNT_ID = env.META_AD_ACCOUNT_ID || process.env.META_AD_ACCOUNT_ID;

              try {
                // Dynamically import handler
                const { default: handler } = await import('./api/spend.js');

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
