import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import { newId, parseCalendarInput, type StoredCalendar } from '../../src/shared/sharedCalendar';
import { json } from '../lib/http';

/** POST /api/calendars: saves a calendar from the Create page and returns its id for the share link. */
export default async (req: Request) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Expected a calendar as JSON.' }, 400);
  }

  const parsed = parseCalendarInput(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const id = newId();
  const calendar: StoredCalendar = {
    ...parsed.value,
    images: parsed.value.images ?? Array.from({ length: parsed.value.length }, () => null),
    id,
    createdAt: new Date().toISOString(),
  };
  await getStore({ name: 'calendars', consistency: 'strong' }).setJSON(id, calendar);
  return json({ id }, 201);
};

export const config: Config = {
  path: '/api/calendars',
  method: 'POST',
  // Plenty for people making calendars; stops a script from filling the store.
  rateLimit: { windowSize: 60, windowLimit: 10, aggregateBy: ['ip', 'domain'] },
};
