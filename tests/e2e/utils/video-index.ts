import fs from 'fs';
import path from 'path';
import type { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

/** Where `pnpm test:e2e:record` puts the videos and their index.html (git ignores it). */
const DIR = path.join(__dirname, '..', 'videos');

type Recorded = { file: string; title: string; status: string; steps: string[]; videos: string[] };

/**
 * Recording mode only: copies each test's videos into tests/e2e/videos/ and writes an index.html there,
 * one section per spec file, then each test's step captions and videos. Open it in a browser.
 */
export default class VideoIndex implements Reporter {
  private readonly recorded: Recorded[] = [];

  onBegin() {
    fs.rmSync(DIR, { recursive: true, force: true });
    fs.mkdirSync(DIR, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // The login setup is not a flow anyone needs to watch.
    if (result.status === 'skipped' || test.location.file.endsWith('.setup.ts')) return;
    const file = path.basename(test.location.file).replace(/\.spec\.ts$/, '');
    const slug = `${file}-${test.title}`
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 90);
    const videos = result.attachments
      .filter((a) => a.contentType === 'video/webm' && a.path && fs.existsSync(a.path))
      .map((a, i) => {
        const name = `${slug}${i ? `-${i + 1}` : ''}.webm`;
        fs.copyFileSync(a.path!, path.join(DIR, name));
        return name;
      });
    if (!videos.length) return;
    this.recorded.push({ file, title: test.title, status: result.status, steps: stepTitles(result.steps), videos });
  }

  onEnd() {
    const files = [...new Set(this.recorded.map((r) => r.file))];
    const sections = files.map((file) => {
      const tests = this.recorded
        .filter((r) => r.file === file)
        .map(renderTest)
        .join('\n');
      return `<section id="${esc(file)}"><h2>${esc(file)}</h2>${tests}</section>`;
    });
    const nav = files.map((file) => `<a href="#${esc(file)}">${esc(file)}</a>`).join(' · ');
    fs.writeFileSync(path.join(DIR, 'index.html'), page(nav, sections.join('\n')));
    console.log(`\nVideos: ${path.join(DIR, 'index.html')}`);
  }
}

function stepTitles(steps: TestStep[]): string[] {
  return steps.filter((s) => s.category === 'test.step').map((s) => s.title);
}

function renderTest(r: Recorded): string {
  const steps = r.steps.map((s) => `<li>${esc(s)}</li>`).join('');
  const videos = r.videos.map((v) => `<video controls preload="metadata" src="${esc(v)}"></video>`).join('');
  // A test.fail() test that fails as expected still reports "failed" here: say which.
  const status = r.status === 'passed' ? '' : ` <span class="failed">${esc(r.status)}</span>`;
  return `<article><h3>${esc(r.title)}${status}</h3>${steps ? `<ol>${steps}</ol>` : ''}${videos}</article>`;
}

function esc(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function page(nav: string, body: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Yay Bulk Order e2e videos</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; margin: 0 auto; max-width: 960px; padding: 24px 16px; color: #111827; }
  nav { position: sticky; top: 0; background: #fff; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
  section { margin-top: 32px; } h2 { margin-bottom: 8px; } h3 { font-size: 16px; margin: 20px 0 6px; }
  video { width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 6px; }
  ol { margin: 4px 0; padding-left: 20px; } .failed { color: #b91c1c; font-size: 13px; }
</style></head>
<body><h1>Yay Bulk Order e2e videos</h1><p>Recorded ${new Date().toISOString().slice(0, 10)}.</p>
<nav>${nav}</nav>
${body}
</body></html>
`;
}
