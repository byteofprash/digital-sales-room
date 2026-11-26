import { createHash } from 'node:crypto';
import type { Meeting } from './types.ts';

/** The subset of a Google Calendar event we use. */
export interface GCalEvent {
  id: string;
  summary?: string;
  status?: string;
  transparency?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: { email?: string; self?: boolean; resource?: boolean; responseStatus?: string }[];
  organizer?: { email?: string };
}

const domainOf = (email: string) => email.split('@')[1]?.toLowerCase() ?? '';

/** Returns null for events that should never change your status. */
export function toMeeting(ev: GCalEvent, selfEmail: string, internalDomain: string): Meeting | null {
  if (ev.status === 'cancelled') return null;
  if (!ev.start?.dateTime || !ev.end?.dateTime) return null; // all-day
  if (ev.transparency === 'transparent') return null; // marked "free"
  const me = ev.attendees?.find((a) => a.self);
  if (me?.responseStatus === 'declined') return null;

  const people = (ev.attendees ?? []).filter((a) => !a.resource && a.email);
  const others = people.filter((a) => !a.self);
  const external = others.some((a) => domainOf(a.email!) !== internalDomain.toLowerCase());
  const participantCount = Math.max(people.length, 1);
  const name = ev.summary?.trim() || '(no title)';
  const fingerprint = createHash('sha256')
    .update([ev.id, ev.start.dateTime, ev.end.dateTime, name, participantCount, external].join('|'))
    .digest('hex')
    .slice(0, 16);

  return {
    integrationId: `bs-${ev.id}-${fingerprint}`,
    name,
    start: ev.start.dateTime,
    end: ev.end.dateTime,
    scope: external ? 'external' : 'internal',
    participantType: participantCount <= 1 ? 'solo' : participantCount === 2 ? 'one_on_one' : 'group',
    participantCount,
  };
}

/** Of several overlapping meetings, the one that started most recently wins. */
export function pickCurrent(meetings: Meeting[]): Meeting | null {
  return [...meetings].sort((a, b) => Date.parse(b.start) - Date.parse(a.start))[0] ?? null;
}

export const hashProfileId = (email: string) =>
  'bs-' + createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 24);
