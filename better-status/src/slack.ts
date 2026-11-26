import type { SlackStatus } from './types.ts';

async function call(token: string, method: string, init: RequestInit & { query?: string }) {
  const res = await fetch(`https://slack.com/api/${method}${init.query ?? ''}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
  });
  const body = (await res.json()) as { ok: boolean; error?: string; profile?: Record<string, unknown> };
  if (!body.ok) throw new Error(`Slack ${method} failed: ${body.error}`);
  return body;
}

export async function getStatus(token: string): Promise<{ text: string; emoji: string }> {
  const { profile } = await call(token, 'users.profile.get', { method: 'GET' });
  return {
    text: String(profile?.status_text ?? ''),
    emoji: String(profile?.status_emoji ?? ''),
  };
}

export async function setStatus(token: string, s: SlackStatus | null, expiresAtIso?: string) {
  const expiration = expiresAtIso ? Math.floor(Date.parse(expiresAtIso) / 1000) : 0;
  await call(token, 'users.profile.set', {
    method: 'POST',
    body: JSON.stringify({
      profile: {
        status_text: s?.text ?? '',
        status_emoji: s?.emoji ?? '',
        status_expiration: s ? expiration : 0,
      },
    }),
  });
}
