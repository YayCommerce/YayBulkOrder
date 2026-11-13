import { execFileSync } from 'child_process';
import path from 'path';

const E2E_DIR = path.join(__dirname, '..');

/**
 * Run a WP-CLI command in the wp-env "cli" container and return its trimmed
 * output. Slow (a few seconds per call): use it for setup and cleanup only,
 * never inside a test step a viewer watches.
 */
export function wpCli(args: string[]): string {
  // WP_ENV_CONFIG points at another site's config (the docs screenshot site).
  const config = process.env.WP_ENV_CONFIG ? [`--config=${process.env.WP_ENV_CONFIG}`] : [];
  const output = execFileSync('npx', ['wp-env', 'run', 'cli', ...config, 'wp', ...args], {
    cwd: E2E_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  // wp-env prints its own status lines ("ℹ Starting…", "✔ Ran…") around the command's output.
  return output
    .split('\n')
    .filter((line) => !/^[ℹ✔✖]/.test(line.trim()))
    .join('\n')
    .trim();
}

export const BLOCK_THEME = 'brandy';
export const CLASSIC_THEME = 'twentytwentyone';

export function activateTheme(slug: string): void {
  wpCli(['theme', 'activate', slug]);
}
