# Better Status

Google Calendar → **Talon.One rules** → Slack status.

The service only reports *facts* about the meeting you're in. Talon.One decides what your
status should be, so wording, emoji and priorities are edited in the Campaign Manager, not in code.

```
Calendar ──▶ Better Status ──(POST /v3/events)──▶ Talon.One rules
                  ▲                                     │
                  └──── customEffect "setSlackStatus" ◀─┘
Better Status ──▶ Slack users.profile.set (text, emoji, expires at meeting end)
```

## Talon.One setup (one-time, done in the Campaign Manager)

**1. Attributes on the *Event* entity**

| Name | Type | Values |
|---|---|---|
| `eventName` | string | |
| `startTime`, `endTime` | time | |
| `scope` | string | `internal`, `external` |
| `participantType` | string | `solo`, `one_on_one`, `group` |
| `participantCount` | number | |

**2. Custom effect** named `setSlackStatus` with string parameters `text` and `emoji`
(Slack shortcode, e.g. `:handshake:`).

**3. Campaign** triggered by the custom event `meeting_started`, ruleset set to stop at the first
matching rule. Suggested rules, in order:

1. `eventName` contains `pickup` / `kindergarten` → `:school_satchel:` "Kindergarten pickup"
2. `eventName` contains `lunch` → `:fork_and_knife:` "At lunch"
3. `scope` = external, `participantType` = one_on_one → `:handshake:` "In an external 1:1"
4. `scope` = external → `:microphone:` "In an external meeting"
5. `scope` = internal, `participantType` = one_on_one → `:speech_balloon:` "In a 1:1"
6. `scope` = internal → `:busts_in_silhouette:` "In an internal meeting"

**4. Integration API key** for the application. (Event attributes are sent as-is, so they must
exist before the first event.)

## Run it

Needs Node ≥ 22.18, no dependencies.

```bash
cp .env.example .env   # fill in, then export the variables (e.g. `set -a; source .env; set +a`)
npm run dry            # one pass: calls Talon.One, prints the result, does NOT touch Slack
npm run once           # one pass including Slack
npm start              # poll every POLL_SECONDS (default 60)
npm test
```

Config: `TALON_URL` + `TALON_IAPI_KEY` are the only Talon-specific settings. Slack and Google
credentials are still needed to read the calendar and write the status.

## Behaviour

- One Talon.One event per meeting (re)start. The event ID includes a fingerprint of the event, so
  an edited meeting is re-evaluated and an unchanged one is never sent twice.
- Skipped: declined, cancelled, all-day and "free" events. Overlaps: the latest-started meeting wins.
- `internal`/`external` is derived from attendee email domains; emails are **not** sent to
  Talon.One. The profile ID is a hash of your email.
- The status expires at the meeting's end, so it clears itself. A status you set by hand is never overwritten.
- No rule matched → status left alone.
