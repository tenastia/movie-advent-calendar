import { getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';
import { getCalendarDay } from '../../src/lib/calendarDay';
import { visibleCalendar, type StoredCalendar } from '../../src/shared/sharedCalendar';
import { json } from '../lib/http';

/**
 * GET /api/calendars/:id?day=N: a shared calendar as a friend sees it on day N,
 * with titles only up to tomorrow (so future movies aren't in the response).
 * `day` is the browser's December day (or its ?day= test override); without
 * it, the server's date decides.
 */
export default async (req: Request, context: Context) => {
  const { id } = context.params;
  if (!id || !/^[A-Za-z0-9]{6,40}$/.test(id)) return json({ error: 'This calendar doesn’t exist.' }, 404);

  const stored = (await getStore({ name: 'calendars', consistency: 'strong' }).get(id, { type: 'json' })) as
    | StoredCalendar
    | null;
  if (!stored) return json({ error: 'This calendar doesn’t exist.' }, 404);

  const requested = Number(new URL(req.url).searchParams.get('day'));
  const day = Number.isInteger(requested) && requested >= 1 && requested <= 24 ? requested : getCalendarDay(new Date());
  return json(visibleCalendar(stored, day));
};

export const config: Config = { path: '/api/calendars/:id', method: 'GET' };
