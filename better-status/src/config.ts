import type { Config } from './types.ts';

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const need = (k: string): string => {
    const v = env[k];
    if (!v) throw new Error(`Missing required env var ${k}`);
    return v;
  };
  return {
    talonUrl: need('TALON_URL'),
    talonKey: need('TALON_IAPI_KEY'),
    slackToken: need('SLACK_USER_TOKEN'),
    google: {
      clientId: need('GOOGLE_CLIENT_ID'),
      clientSecret: need('GOOGLE_CLIENT_SECRET'),
      refreshToken: need('GOOGLE_REFRESH_TOKEN'),
    },
    internalDomain: env.INTERNAL_DOMAIN,
    profileId: env.PROFILE_ID,
    pollSeconds: Number(env.POLL_SECONDS ?? 60),
  };
}
