#!/usr/bin/env node
// Generate /public/llms.txt and /public/llms-full.txt from the canonical sources.
// llms.txt convention: https://llmstxt.org

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(__dirname, '..');
const repoRoot = resolve(siteRoot, '..');
const publicDir = join(siteRoot, 'public');

const SITE = 'https://industrialindependence.org';

const sources = [
  {
    slug: 'field',
    title: 'The Field',
    url: `${SITE}/field/`,
    blurb:
      'Pillar I. Where operations works. Specific kinds of places, specific kinds of people, specific kinds of failures — the lived ground the architecture is shaped by.',
    file: join(repoRoot, 'docs/the-field.md')
  },
  {
    slug: 'problem',
    title: 'The Problem',
    url: `${SITE}/problem/`,
    blurb:
      'Pillar II. What stands in the way. The market sells dependence; IT inherits enterprise patterns; the field’s own gatekeepers will not teach. The 80% problem, closed stacks, reference architectures as security theater, IT-managed engineering workstations, integrator opacity, compliance economy, IT cadence imposed on OT.',
    file: join(repoRoot, 'docs/the-problem.md')
  },
  {
    slug: 'claim',
    title: 'Our Claim',
    url: `${SITE}/claim/`,
    blurb:
      'Pillar III. What operations is owed. What must be owned, taken back, formalized: SLAs that match production, bilateral contracts with IT, separation as architecture, recognition of IT / OT / ACS as different substrates, the reintroduction of engineering.',
    file: join(repoRoot, 'docs/our-claim.md')
  },
  {
    slug: 'philosophy',
    title: 'Our Philosophy',
    url: `${SITE}/philosophy/`,
    blurb:
      'Pillar IV. How we think about the substrate. The distinction (control systems act on physics, not on information), the SRP / CIA / SAIC vocabulary, and the seven principles.',
    file: join(siteRoot, 'src/content-src/philosophy.md')
  },
  {
    slug: 'architecture',
    title: 'The Architecture',
    url: `${SITE}/architecture/`,
    blurb:
      'Pillar V. The canonical statement of Industrial Independence Architecture. A secure edge gateway at the head of every zone, identical across the fractal, sovereign without upstream connectivity.',
    file: join(repoRoot, 'README.md')
  },
  {
    slug: 'docs/glossary',
    title: 'Glossary',
    url: `${SITE}/architecture/docs/glossary/`,
    blurb:
      'Vocabulary used across IIA documentation. Domain, architecture, and standards terms with normative definitions.',
    file: join(repoRoot, 'docs/glossary.md')
  }
];

async function readMaybe(file) {
  if (!existsSync(file)) {
    console.warn(`[build-llms] missing source: ${file}`);
    return null;
  }
  return (await readFile(file, 'utf8')).trim();
}

// llms.txt — index file
const indexLines = [
  '# Industrial Independence Alliance',
  '',
  '> Operational sovereignty for industrial infrastructure. The Alliance publishes its position in five pillars: The Field (where operations works), The Problem (what stands in the way), Our Claim (what operations is owed), Our Philosophy (how we think about it), and The Architecture (Industrial Independence Architecture, IIA — the technical spec).',
  '',
  'This file follows the llms.txt convention (https://llmstxt.org). The full concatenated documentation is at <' + SITE + '/llms-full.txt>.',
  '',
  '## Read — The Pillars',
  '',
  `- [The Field (Pillar I — observation)](${SITE}/field/): Where operations works. The lived ground the architecture is shaped by. Specific kinds of places, specific kinds of people, specific kinds of failures, and the architectural response to each.`,
  `- [The Problem (Pillar II — observation)](${SITE}/problem/): What stands in the way. The market, IT, and the field’s own gatekeepers. The 80% problem, closed stacks, reference architectures as security theater, IT-managed engineering workstations, integrator opacity, the compliance economy, IT cadence imposed on OT, knowledge withheld by senior practitioners.`,
  `- [Our Claim (Pillar III — position)](${SITE}/claim/): What operations is owed. What must be owned, taken back, formalized. SLAs that match production, bilateral contracts with IT, separation as architecture, recognition of IT / OT / ACS as different substrates, the reintroduction of engineering.`,
  `- [Our Philosophy (Pillar IV — position)](${SITE}/philosophy/): The principles that follow from the substrate distinction. The SRP Triad as foundation; SAIC critiqued as "Safety as afterthought"; seven principles from "physics overrides information" through "empower the practitioner."`,
  `- [The Architecture (Pillar V — artifact)](${SITE}/architecture/): The canonical statement. The principle, the domain boundary, the two-box method, the unit, the fractal, design constraints, prior art, data architecture, standards alignment, the thesis.`,
  '',
  '## Read — Supporting Documentation',
  '',
  `- [Glossary](${SITE}/architecture/docs/glossary/): Vocabulary used across the documentation.`,
  '',
  '## Standards & lineage',
  '',
  '- [SRP Triad — Robert Radvanovsky / Infracritical](https://srpmodel.infracritical.com/srpmodel.php): Safety, Reliability, Performance. The foundation of the ACS substrate model.',
  '- [PERA+ — Gary Rathwell / Entercon](https://www.pera.net): Reference architecture for industrial enterprise organization; the 4Rs, CIAD/CIND, "secure interfaces, not integration."',
  '- [IEC 62443](https://www.iec.ch/cyber-security/iec-62443): Cybersecurity for industrial automation. SL1–SL4, FR1–FR7.',
  '- [ISA-95](https://www.isa.org/standards-and-publications/isa-standards/isa-95): The IT↔ACS data-modeling backbone.',
  '',
  '## Optional',
  '',
  '- [Source repository](https://github.com/industrialindependence/architecture): The spec source tree. CC BY-SA 4.0; IIA and "Industrial Independence Architecture" are trademarks.',
  '- [Contact](' + SITE + '/contact/): Questions, corrections, deployments, contributions.',
  ''
];

await mkdir(publicDir, { recursive: true });
await writeFile(join(publicDir, 'llms.txt'), indexLines.join('\n'));

// llms-full.txt — concatenated content
const fullParts = [
  '# Industrial Independence Alliance — Full Documentation',
  '',
  '> The Alliance publishes The Philosophy (why) and The Architecture — Industrial Independence Architecture, IIA (how). This file is the concatenation of every public document.',
  '',
  `Source: ${SITE}/llms-full.txt`,
  `Index:  ${SITE}/llms.txt`,
  `Site:   ${SITE}/`,
  ''
];

for (const src of sources) {
  const body = await readMaybe(src.file);
  if (!body) continue;
  fullParts.push('---', '');
  fullParts.push(`## ${src.title}`, '');
  fullParts.push(`*Source: ${src.url}*`, '');
  fullParts.push(`_${src.blurb}_`, '');
  fullParts.push(body, '');
}

await writeFile(join(publicDir, 'llms-full.txt'), fullParts.join('\n'));

const indexBytes = (await readFile(join(publicDir, 'llms.txt'))).length;
const fullBytes = (await readFile(join(publicDir, 'llms-full.txt'))).length;
console.log(`[build-llms] wrote public/llms.txt (${indexBytes}b) and public/llms-full.txt (${fullBytes}b)`);
