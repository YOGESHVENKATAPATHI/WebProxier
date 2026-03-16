import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom Vite plugin to handle Vercel serverless function locally
const vercelApiPlugin = () => ({
  name: 'vercel-api-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && req.url.startsWith('/api/proxy')) {
        try {
          const proxyModule = await server.ssrLoadModule('/api/proxy.js');
          const handler = proxyModule.default || proxyModule;
          
          // Parse query string for req.query compatibility
          const urlObj = new URL(req.url, 'http://localhost');
          const query = Object.fromEntries(urlObj.searchParams.entries());
          req.query = query;
          
          // Add Express-like res.send, res.status, res.setHeader helpers
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.send = (data) => {
            res.end(data);
          };
          
          await handler(req, res);
        } catch (error) {
          console.error('API Error:', error);
          res.statusCode = 500;
          res.end(error.message);
        }
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiPlugin()],
})
