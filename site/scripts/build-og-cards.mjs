#!/usr/bin/env node
// Generate per-page OG cards using Chrome headless. Layout is 1200×630;
// rendered at 2x device scale → 2400×1260 PNG so social previews
// (LinkedIn especially) stay crisp instead of upscaling a 1x image.
// One unified "hero" format: brand bar, accent eyebrow, big bold centered
// title (auto-sized to fit), mono subtitle, footer.

import { writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(__dirname, '..');
const cardsDir = join(siteRoot, 'public/og-card');
const tmpDir = join(siteRoot, '.og-tmp');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// `break` (optional): explicit line split for the big title, segments joined by '|'.
const pages = [
  { slug: 'home',          eyebrow: 'Operational sovereignty for industrial infrastructure', title: 'Industrial Independence', break: 'Industrial|Independence', subtitle: 'Five pillars · The Field · The Problem · Our Claim · Our Philosophy · The Architecture' },
  { slug: 'field',         eyebrow: 'Pillar I · Observation',           title: 'The Field.',                                              subtitle: 'Where operations works. The lived ground the architecture is shaped by.' },
  { slug: 'problem',       eyebrow: 'Pillar II · Observation',          title: 'The Problem.',                                            subtitle: 'The market, IT, and the field’s own gatekeepers. What stands in the way.' },
  { slug: 'claim',         eyebrow: 'Pillar III · Position',            title: 'Our Claim.',                                              subtitle: 'What operations is owed. What must be owned, taken back, formalized.' },
  { slug: 'philosophy',    eyebrow: 'Pillar IV · Position',             title: 'Our Philosophy.',                                         subtitle: 'Control systems act on physics, not on information. SRP governs the substrate.' },
  { slug: 'architecture',  eyebrow: 'Pillar V · Artifact',              title: 'The Architecture.',                                       subtitle: 'One self-contained unit at every zone. Identical at every level.' },
  { slug: 'contact',       eyebrow: 'Contact',                           title: 'Drop a line.',                                            subtitle: 'Questions, corrections, deployments, contributions.' },
  { slug: 'docs',          eyebrow: 'The Architecture · Documentation',  title: 'The full set.',                                           subtitle: 'Every IIA architectural document.' },
  { slug: 'introduction',  eyebrow: 'Documentation · 01',                title: 'Introduction.',                                           subtitle: 'For readers new to industrial automation, ICS, or OT.' },
  { slug: 'internal-architecture', eyebrow: 'Documentation · 02',        title: 'Internal Architecture.',  break: 'Internal|Architecture', subtitle: 'The canonical implementation specification.' },
  { slug: 'sample-contracts',      eyebrow: 'Documentation · 03',        title: 'Sample Data Contracts.',  break: 'Sample Data|Contracts',  subtitle: 'Six worked contracts across the IIA contract catalog.' },
  { slug: 'mcp-single-box',        eyebrow: 'Documentation · 04',        title: 'MCP — Single Box Quickstart.', break: 'MCP — Single Box|Quickstart', subtitle: 'The smallest AI-agent consumption deployment.' },
  { slug: 'glossary',              eyebrow: 'Documentation · 05',        title: 'Glossary.',                                               subtitle: 'Vocabulary used across IIA documentation.' }
];

function escape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cardHtml({ eyebrow, title, subtitle, break: brk }) {
  const core = title.replace(/[.]\s*$/, '');
  const segments = brk ? brk.split('|') : null;
  // Sizing constraint: the widest unbreakable run (an explicit line, or the
  // longest word when wrapping naturally). Uppercase 800-weight glyphs run
  // ~0.60em wide; content width is ~1056px.
  const runs = segments ? segments : core.split(/\s+/);
  const widest = Math.max(...runs.map((s) => s.length));
  let fs;
  if (segments) {
    fs = widest <= 12 ? 150 : widest <= 16 ? 120 : widest <= 20 ? 98 : 80;
  } else {
    fs = widest <= 8 ? 150 : widest <= 10 ? 128 : widest <= 12 ? 108 : 92;
    if (core.length > 22) fs = Math.min(fs, 96);
  }
  const titleHtml = segments
    ? segments.map((s) => escape(s)).join('<br/>')
    : escape(core);

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>
    :root {
      --bg: #0e0d0b;
      --ink: #f1ece0;
      --ink-soft: #c8c1b1;
      --ink-mute: #8a8473;
      --accent: #d96a4f;
      --rule: rgba(245, 241, 232, 0.14);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 1200px; height: 630px; }
    body {
      font-family: 'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif;
      background:
        radial-gradient(ellipse 60% 80% at 88% 8%, rgba(217, 106, 79, 0.20), transparent 60%),
        radial-gradient(ellipse 55% 65% at 12% 94%, rgba(217, 106, 79, 0.08), transparent 60%),
        var(--bg);
      color: var(--ink);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 56px 72px;
      position: relative;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, Monaco, monospace;
    }
    .brand { display: inline-flex; align-items: center; gap: 14px; font-size: 18px; letter-spacing: 0.04em; }
    .brand .acro { font-weight: 700; letter-spacing: 0.12em; }
    .brand .full { color: var(--ink-soft); font-size: 15px; }
    .mark { color: var(--accent); display: inline-flex; }
    .domain { font-size: 15px; color: var(--ink-mute); letter-spacing: 0.04em; }
    .hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 26px;
    }
    .hero .eyebrow {
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, Monaco, monospace;
      font-size: 17px;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--accent);
      max-width: 1056px;
    }
    .hero h1 {
      font-size: ${fs}px;
      font-weight: 800;
      line-height: 0.92;
      letter-spacing: -0.035em;
      text-transform: uppercase;
      color: var(--ink);
      max-width: 1056px;
    }
    .hero h1 .dot { color: var(--accent); }
    .hero .sub {
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, Monaco, monospace;
      font-size: 17px;
      color: var(--ink-soft);
      letter-spacing: 0.04em;
      max-width: 1056px;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--rule);
      padding-top: 22px;
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, Monaco, monospace;
      font-size: 14px;
      color: var(--ink-mute);
      letter-spacing: 0.04em;
    }
    .footer .left { display: flex; gap: 28px; }
  </style></head><body>
    <div class="top">
      <div class="brand">
        <span class="mark">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-linejoin="round">
            <rect x="2.5" y="2.5" width="19" height="19" rx="1.4" stroke-width="2"/>
            <rect x="7" y="7" width="10" height="10" rx="0.8" stroke-width="1.7"/>
            <rect x="10.5" y="10.5" width="3" height="3" rx="0.4" stroke-width="1.5"/>
          </svg>
        </span>
        <span class="acro">IIA</span>
        <span class="full">Industrial Independence Alliance</span>
      </div>
      <div class="domain">industrialindependence.org</div>
    </div>

    <div class="hero">
      <div class="eyebrow">${escape(eyebrow)}</div>
      <h1>${titleHtml}<span class="dot">.</span></h1>
      <div class="sub">${escape(subtitle)}</div>
    </div>

    <div class="footer">
      <div class="left">
        <span>SRP · CIA · PERA+</span>
        <span>CC BY-SA 4.0</span>
      </div>
      <div>Industrial Independence Alliance</div>
    </div>
  </body></html>`;
}

await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });
await mkdir(cardsDir, { recursive: true });

let count = 0;
for (const page of pages) {
  const htmlPath = join(tmpDir, `${page.slug}.html`);
  const pngPath = join(cardsDir, `${page.slug}.png`);
  await writeFile(htmlPath, cardHtml(page));
  execFileSync(CHROME, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--disable-features=NetworkService',
    '--window-size=1200,630',
    '--force-device-scale-factor=2',
    '--virtual-time-budget=2500',
    '--timeout=8000',
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`
  ], { stdio: ['ignore', 'ignore', 'ignore'], timeout: 15000, killSignal: 'SIGKILL' });
  if (!existsSync(pngPath)) {
    throw new Error(`og card render failed for ${page.slug}`);
  }
  count++;
}

await rm(tmpDir, { recursive: true, force: true });
console.log(`[build-og-cards] rendered ${count} cards into public/og-card/`);
