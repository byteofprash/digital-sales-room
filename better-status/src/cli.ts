import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadConfig } from './config.ts';
import { syncOnce, type State } from './sync.ts';

const STATE_FILE = new URL('../.state.json', import.meta.url);
const args = new Set(process.argv.slice(2));
const cfg = loadConfig();
const state: State = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : {};
const log = (s: string) => console.log(`[${new Date().toISOString()}] ${s}`);

async function tick() {
  try {
    await syncOnce(cfg, state, { dry: args.has('--dry'), log });
    if (!args.has('--dry')) writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch (e) {
    console.error(`[${new Date().toISOString()}]`, (e as Error).message);
    process.exitCode = 1;
  }
}

await tick();
if (!args.has('--once')) setInterval(tick, cfg.pollSeconds * 1000);
