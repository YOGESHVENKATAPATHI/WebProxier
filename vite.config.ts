import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

// Extended ServerResponse type to include our custom helpers
interface CustomServerResponse extends ServerResponse {
  status: (code: number) => CustomServerResponse;
  send: (data: any) => void;
}

// Extended IncomingMessage type to include query
interface CustomIncomingMessage extends IncomingMessage {
  query?: Record<string, string>;
}

// Custom Vite plugin to handle Vercel serverless function locally
const vercelApiPlugin = (): Plugin => ({
  name: 'vercel-api-plugin',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.url && req.url.startsWith('/api/proxy')) {
        try {
          const proxyModule = await server.ssrLoadModule('/api/proxy.js');
          const handler = proxyModule.default || proxyModule;
          
          // Parse query string for req.query compatibility
          const urlObj = new URL(req.url, 'http://localhost');
          const query = Object.fromEntries(urlObj.searchParams.entries());
          
          // Cast request and response to include our custom properties
          const customReq = req as CustomIncomingMessage;
          customReq.query = query;
          
          const customRes = res as unknown as CustomServerResponse;
          
          // Add Express-like res.send, res.status, res.setHeader helpers
          customRes.status = (code: number) => {
            customRes.statusCode = code;
            return customRes;
          };
          customRes.send = (data: any) => {
            customRes.end(data);
          };
          
          await handler(customReq, customRes);
        } catch (error: unknown) {
          console.error('API Error:', error);
          res.statusCode = 500;
          if (error instanceof Error) {
            res.end(error.message);
          } else {
            res.end('Unknown error occurred');
          }
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
