import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pickCurrent, toMeeting, type GCalEvent } from '../src/meeting.ts';
import { statusFromEffects } from '../src/talon.ts';

const base = (o: Partial<GCalEvent>): GCalEvent => ({
  id: 'e1',
  summary: 'Acme sync',
  start: { dateTime: '2026-11-26T14:00:00Z' },
  end: { dateTime: '2026-11-26T15:00:00Z' },
  ...o,
});
const me = { email: 'me@talon.one', self: true, responseStatus: 'accepted' };

test('external 1:1', () => {
  const m = toMeeting(base({ attendees: [me, { email: 'c@acme.com' }] }), 'me@talon.one', 'talon.one')!;
  assert.equal(m.scope, 'external');
  assert.equal(m.participantType, 'one_on_one');
});
test('internal group', () => {
  const m = toMeeting(base({ attendees: [me, { email: 'a@talon.one' }, { email: 'b@talon.one' }] }), 'me@talon.one', 'talon.one')!;
  assert.equal(m.scope, 'internal');
  assert.equal(m.participantType, 'group');
  assert.equal(m.participantCount, 3);
});
test('no attendees is solo/internal; rooms are ignored', () => {
  const m = toMeeting(base({ summary: 'Lunch', attendees: [me, { email: 'room@resource.calendar.google.com', resource: true }] }), 'me@talon.one', 'talon.one')!;
  assert.equal(m.participantType, 'solo');
  assert.equal(m.scope, 'internal');
});
test('skips declined, all-day, free, cancelled', () => {
  const t = (o: Partial<GCalEvent>) => toMeeting(base(o), 'me@talon.one', 'talon.one');
  assert.equal(t({ attendees: [{ ...me, responseStatus: 'declined' }] }), null);
  assert.equal(t({ start: { date: '2026-11-26' }, end: { date: '2026-11-27' } }), null);
  assert.equal(t({ transparency: 'transparent' }), null);
  assert.equal(t({ status: 'cancelled' }), null);
});
test('editing an event changes its integrationId', () => {
  const a = toMeeting(base({}), 'me@talon.one', 'talon.one')!;
  const b = toMeeting(base({ summary: 'Renamed' }), 'me@talon.one', 'talon.one')!;
  assert.notEqual(a.integrationId, b.integrationId);
});
test('latest-started meeting wins', () => {
  const a = toMeeting(base({ id: 'a' }), 'me@talon.one', 'talon.one')!;
  const b = toMeeting(base({ id: 'b', start: { dateTime: '2026-11-26T14:30:00Z' } }), 'me@talon.one', 'talon.one')!;
  assert.equal(pickCurrent([a, b])!.name, 'Acme sync');
  assert.equal(pickCurrent([a, b])!.integrationId, b.integrationId);
});
test('reads the custom effect from a Talon.One response', () => {
  const s = statusFromEffects([
    { effectType: 'acceptCoupon' },
    { effectType: 'customEffect', props: { name: 'other', payload: { text: 'x' } } },
    { effectType: 'customEffect', props: { name: 'setSlackStatus', payload: { text: 'In an external 1:1', emoji: ':handshake:' } } },
  ]);
  assert.deepEqual(s, { text: 'In an external 1:1', emoji: ':handshake:' });
  assert.equal(statusFromEffects([]), null);
});
