import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import { imageUrl, newId } from '../../src/shared/sharedCalendar';
import { json } from '../lib/http';

/** The browser downsizes photos before uploading, so this is generous. */
const MAX_BYTES = 4 * 1024 * 1024;

/** Recognise the image from its first bytes, rather than trusting the declared type. */
function sniffImageType(bytes: Uint8Array): string | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (starts(0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

/** POST /api/images: stores one day's photo (raw image bytes) and returns its key and URL. */
export default async (req: Request) => {
  const data = new Uint8Array(await req.arrayBuffer());
  if (data.byteLength === 0) return json({ error: 'The upload was empty.' }, 400);
  if (data.byteLength > MAX_BYTES) return json({ error: 'That photo is too large (4 MB at most).' }, 413);

  const type = sniffImageType(data);
  if (!type) return json({ error: 'Upload a JPEG, PNG, WebP or GIF.' }, 415);

  const key = newId(16);
  await getStore({ name: 'images', consistency: 'strong' }).set(key, data.buffer as ArrayBuffer, { metadata: { type } });
  return json({ key, url: imageUrl(key) }, 201);
};

export const config: Config = {
  path: '/api/images',
  method: 'POST',
  rateLimit: { windowSize: 60, windowLimit: 60, aggregateBy: ['ip', 'domain'] },
};
