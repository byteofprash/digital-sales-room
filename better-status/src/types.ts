export interface Meeting {
  /** Unique per (calendar event, start, content) so edited events are re-evaluated. */
  integrationId: string;
  name: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  scope: 'internal' | 'external';
  participantType: 'solo' | 'one_on_one' | 'group';
  participantCount: number;
}

export interface SlackStatus {
  text: string;
  emoji: string; // Slack shortcode, e.g. ":handshake:"
}

export interface Config {
  talonUrl: string;
  talonKey: string;
  slackToken: string;
  google: { clientId: string; clientSecret: string; refreshToken: string };
  internalDomain?: string;
  profileId?: string;
  pollSeconds: number;
}
