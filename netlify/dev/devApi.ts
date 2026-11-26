/**
 * `npm run dev` only: serves the API functions in netlify/functions on their
 * configured paths, with Netlify Blobs backed by a local blob server (files in
 * .netlify/blobs-dev). In production Netlify does this itself.
 */
import { readdirSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { BlobsServer } from '@netlify/blobs/server';
import type { Plugin, ViteDevServer } from 'vite';

interface FunctionModule {
  default: (req: Request, context: { params: Record<string, string> }) => Promise<Response> | Response;
  config?: { path?: string | string[]; method?: string | string[] };
}

/** "/api/calendars/:id" → a matcher returning { id } for "/api/calendars/abc". */
function compilePath(path: string) {
  const names: string[] = [];
  const pattern = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:(\w+)/g, (_, name: string) => {
    names.push(name);
    return '([^/]+)';
  });
  const regex = new RegExp(`^${pattern}/?$`);
  return (pathname: string) => {
    const match = regex.exec(pathname);
    return match ? Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(match[i + 1])])) : null;
  };
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

async function send(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

export function devApi(root: string): Plugin {
  const functionsDir = resolve(root, 'netlify/functions');
  return {
    name: 'movie-advent:dev-api',
    apply: 'serve',
    async configureServer(server: ViteDevServer) {
      const blobs = new BlobsServer({ directory: resolve(root, '.netlify/blobs-dev'), token: 'local-dev' });
      const { port } = await blobs.start();
      const url = `http://localhost:${port}`;
      process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(
        JSON.stringify({ edgeURL: url, uncachedEdgeURL: url, siteID: 'local-dev', token: 'local-dev' }),
      ).toString('base64');
      server.httpServer?.once('close', () => void blobs.stop());

      server.middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url ?? '/', 'http://localhost');
        if (!pathname.startsWith('/api/')) return next();
        try {
          // Loaded per request so edits to a function apply without restarting.
          for (const file of readdirSync(functionsDir).filter((f) => /\.m?ts$/.test(f))) {
            const mod = (await server.ssrLoadModule(resolve(functionsDir, file))) as FunctionModule;
            const paths = [mod.config?.path ?? []].flat();
            const methods = [mod.config?.method ?? []].flat();
            if (methods.length && !methods.includes(req.method ?? 'GET')) continue;
            for (const path of paths) {
              const params = compilePath(path)(pathname);
              if (!params) continue;
              const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req);
              const request = new Request(new URL(req.url ?? '/', `http://${req.headers.host}`), {
                method: req.method,
                headers: req.headers as Record<string, string>,
                body: body ? new Uint8Array(body) : undefined,
              });
              return await send(res, await mod.default(request, { params }));
            }
          }
          res.statusCode = 404;
          res.end('No API route here');
        } catch (error) {
          server.config.logger.error(`[dev-api] ${pathname}: ${(error as Error).stack ?? error}`);
          res.statusCode = 500;
          res.end('API error (see the dev server log)');
        }
      });
    },
  };
}
