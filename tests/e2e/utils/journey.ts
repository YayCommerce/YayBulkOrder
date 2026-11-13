import { test as base, Page } from '@playwright/test';

/**
 * Recording mode (`pnpm test:e2e:record`, RECORD=1), ported from Bookster's journeys: every page gets a
 * caption with the current step (top left), a red ring where each click lands and an outline on what was
 * clicked; each step ends with a pause (RECORD_PAUSE ms, default 1500) to read the result. The videos and
 * an index.html go to tests/e2e/videos/ (utils/video-index.ts). A plain run skips all of it.
 *
 * Specs import `test`, `expect` and `step` from here instead of @playwright/test.
 */
export const RECORD = !!process.env.RECORD && process.env.RECORD !== '0';
const PAUSE_MS = Number(process.env.RECORD_PAUSE ?? 1500);

function watchScript() {
  // Top page only: the editor canvas is an iframe of its own.
  if (window.top !== window) return;
  const css = `
    #ybod-rec-caption { position: fixed; left: 12px; bottom: 12px; max-width: 40vw; z-index: 2147483647;
      padding: 10px 14px; border-radius: 8px; background: rgba(17, 24, 39, 0.9); color: #fff;
      font: 600 15px/1.4 system-ui, sans-serif; pointer-events: none; }
    .ybod-rec-ring { position: fixed; z-index: 2147483647; width: 36px; height: 36px; margin: -18px 0 0 -18px;
      border: 3px solid #ef4444; border-radius: 50%; pointer-events: none; animation: ybod-rec-ring 0.9s ease-out forwards; }
    @keyframes ybod-rec-ring { from { transform: scale(0.4); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }
    .ybod-rec-target { outline: 3px solid #ef4444 !important; outline-offset: 2px !important; }`;

  function mount() {
    if (!document.body || document.getElementById('ybod-rec-style')) return;
    const style = document.createElement('style');
    style.id = 'ybod-rec-style';
    style.textContent = css;
    document.head.appendChild(style);
    const caption = document.createElement('div');
    caption.id = 'ybod-rec-caption';
    caption.textContent = sessionStorage.getItem('ybod-rec-caption') ?? '';
    caption.hidden = !caption.textContent;
    document.body.appendChild(caption);
  }
  document.addEventListener('DOMContentLoaded', mount);
  mount();

  document.addEventListener(
    'pointerdown',
    (event) => {
      const ring = document.createElement('div');
      ring.className = 'ybod-rec-ring';
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 1000);
      const target = (event.target as Element | null)?.closest('button, a, input, [role], label') ?? null;
      target?.classList.add('ybod-rec-target');
      setTimeout(() => target?.classList.remove('ybod-rec-target'), 1200);
    },
    true,
  );
}

/** The usual `test`; in recording mode every page of the test's context (new tabs too) is watchable. */
export const test = base.extend({
  context: async ({ context }, use) => {
    if (RECORD) await context.addInitScript(watchScript);
    await use(context);
  },
});
export { expect } from '@playwright/test';

async function setCaption(page: Page, text: string) {
  await page
    .evaluate((value) => {
      // Kept in sessionStorage so the caption survives page loads inside a step.
      sessionStorage.setItem('ybod-rec-caption', value);
      const caption = document.getElementById('ybod-rec-caption');
      if (caption) {
        caption.textContent = value;
        caption.hidden = !value;
      }
    }, text)
    // Before the first page load there is no document to caption; the next load reads sessionStorage.
    .catch(() => undefined);
}

/** A named step: in recording mode its title is the caption while it runs, then a pause to read the result. */
export async function step(page: Page, title: string, body: () => Promise<void>) {
  await test.step(title, async () => {
    if (!RECORD) return body();
    await setCaption(page, title);
    await body();
    await setCaption(page, title);
    await page.waitForTimeout(PAUSE_MS);
  });
}
