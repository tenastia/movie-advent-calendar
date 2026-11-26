/** The app's side of the sharing API (netlify/functions). */
import type { CalendarInput, SharedCalendar } from '../shared/sharedCalendar';

async function errorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/** Saves a calendar and returns its id. */
export async function createCalendar(input: CalendarInput): Promise<string> {
  const res = await fetch('/api/calendars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await errorMessage(res, 'Couldn’t save the calendar. Try again.'));
  return ((await res.json()) as { id: string }).id;
}

export class CalendarNotFound extends Error {}

/** A shared calendar as it stands on `day`. */
export async function fetchSharedCalendar(id: string, day: number): Promise<SharedCalendar> {
  const res = await fetch(`/api/calendars/${encodeURIComponent(id)}?day=${day}`);
  if (res.status === 404) throw new CalendarNotFound(await errorMessage(res, 'This calendar doesn’t exist.'));
  if (!res.ok) throw new Error(await errorMessage(res, 'Couldn’t open the calendar. Try again.'));
  return (await res.json()) as SharedCalendar;
}

/** Photos are resized to at most this many pixels on the long side before uploading. */
const MAX_IMAGE_SIDE = 1600;

/** Resizes a photo in the browser (JPEG, ≤ 1600px), so uploads stay small. */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Couldn’t read that photo.'))), 'image/jpeg', 0.86),
  );
}

/** Uploads one day's photo; returns its key (for the calendar) and URL (to show it). */
export async function uploadImage(file: File): Promise<{ key: string; url: string }> {
  const body = await downscale(file);
  const res = await fetch('/api/images', { method: 'POST', headers: { 'Content-Type': body.type }, body });
  if (!res.ok) throw new Error(await errorMessage(res, 'Couldn’t upload that photo. Try again.'));
  return (await res.json()) as { key: string; url: string };
}
