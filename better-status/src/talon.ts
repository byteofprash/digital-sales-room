import type { Meeting, SlackStatus } from './types.ts';

export const EVENT_TYPE = 'meeting_started';
export const EFFECT_NAME = 'setSlackStatus';

interface Effect {
  effectType: string;
  props?: { name?: string; payload?: Record<string, unknown> };
}

/** Pull the status out of a Track Event response. First matching custom effect wins. */
export function statusFromEffects(effects: Effect[] | undefined): SlackStatus | null {
  const e = effects?.find((x) => x.effectType === 'customEffect' && x.props?.name === EFFECT_NAME);
  const p = e?.props?.payload;
  if (!p || typeof p.text !== 'string' || !p.text) return null;
  return { text: p.text.slice(0, 100), emoji: typeof p.emoji === 'string' ? p.emoji : '' };
}

export async function evaluateMeeting(
  cfg: { talonUrl: string; talonKey: string },
  profileId: string,
  m: Meeting,
  fetchImpl: typeof fetch = fetch,
): Promise<SlackStatus | null> {
  const host = cfg.talonUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const res = await fetchImpl(`https://${host}/v3/events`, {
    method: 'POST',
    headers: { Authorization: `ApiKey-v1 ${cfg.talonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId,
      integrationId: m.integrationId,
      type: EVENT_TYPE,
      attributes: {
        eventName: m.name,
        startTime: m.start,
        endTime: m.end,
        scope: m.scope,
        participantType: m.participantType,
        participantCount: m.participantCount,
      },
    }),
  });
  if (!res.ok) throw new Error(`Talon.One track event failed: ${res.status} ${await res.text()}`);
  return statusFromEffects(((await res.json()) as { effects?: Effect[] }).effects);
}
