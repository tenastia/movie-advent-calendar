import { getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';
import { isImageKey } from '../../src/shared/sharedCalendar';

/** GET /api/images/:key: a stored photo. Keys never change, so it can be cached for good. */
export default async (_req: Request, context: Context) => {
  const { key } = context.params;
  if (!isImageKey(key)) return new Response('Not found', { status: 404 });

  const result = await getStore({ name: 'images', consistency: 'strong' }).getWithMetadata(key, { type: 'arrayBuffer' });
  if (!result) return new Response('Not found', { status: 404 });

  return new Response(result.data, {
    headers: {
      'Content-Type': String(result.metadata.type ?? 'application/octet-stream'),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

export const config: Config = { path: '/api/images/:key', method: 'GET' };
