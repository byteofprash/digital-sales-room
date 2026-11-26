import type { Config } from './types.ts';
import type { GCalEvent } from './meeting.ts';

async function accessToken(g: Config['google']): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: g.clientId,
      client_secret: g.clientSecret,
      refresh_token: g.refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Events happening right now on the primary calendar, plus the calendar owner's email. */
export async function currentEvents(
  g: Config['google'],
  now = new Date(),
): Promise<{ events: GCalEvent[]; selfEmail: string }> {
  const token = await accessToken(g);
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', now.toISOString());
  url.searchParams.set('timeMax', new Date(now.getTime() + 1000).toISOString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('fields', 'summary,items(id,summary,status,transparency,start,end,attendees,organizer)');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Google Calendar failed: ${res.status}`);
  const body = (await res.json()) as { summary?: string; items?: GCalEvent[] };
  // For the primary calendar, `summary` is the owner's email address.
  return { events: body.items ?? [], selfEmail: body.summary ?? '' };
}
