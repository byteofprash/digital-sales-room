import { currentEvents } from './calendar.ts';
import { hashProfileId, pickCurrent, toMeeting } from './meeting.ts';
import * as slack from './slack.ts';
import { evaluateMeeting } from './talon.ts';
import type { Config, SlackStatus } from './types.ts';

/** What we remember between runs. Persist it anywhere (file, KV, ...). */
export interface State {
  lastIntegrationId?: string;
  /** The status we last set, so we never overwrite one the user set by hand. */
  ours?: SlackStatus;
}

const same = (a: SlackStatus, b: { text: string; emoji: string }) => a.text === b.text && a.emoji === b.emoji;

export async function syncOnce(cfg: Config, state: State, opts: { dry?: boolean; log?: (s: string) => void } = {}) {
  const log = opts.log ?? (() => {});
  const { events, selfEmail } = await currentEvents(cfg.google);
  const internalDomain = cfg.internalDomain ?? selfEmail.split('@')[1] ?? '';
  const meeting = pickCurrent(
    events.map((e) => toMeeting(e, selfEmail, internalDomain)).filter((m) => m !== null),
  );

  if (!meeting) {
    state.lastIntegrationId = undefined; // status clears itself via its expiry
    return;
  }
  if (meeting.integrationId === state.lastIntegrationId) return; // already handled

  const profileId = cfg.profileId ?? hashProfileId(selfEmail);
  const status = await evaluateMeeting(cfg, profileId, meeting);
  state.lastIntegrationId = meeting.integrationId;
  log(`"${meeting.name}" (${meeting.scope}, ${meeting.participantType}) -> ${status ? `${status.emoji} ${status.text}` : 'no rule matched'}`);
  if (!status || opts.dry) return;

  const current = await slack.getStatus(cfg.slackToken);
  const manual = current.text !== '' && !(state.ours && same(state.ours, current));
  if (manual) return log('Existing manual Slack status left untouched.');

  await slack.setStatus(cfg.slackToken, status, meeting.end);
  state.ours = status;
}
