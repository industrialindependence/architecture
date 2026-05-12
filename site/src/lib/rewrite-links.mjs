import { visit } from 'unist-util-visit';

const DOC_SLUGS = new Set([
  'introduction',
  'internal-architecture',
  'glossary',
  'sample-contracts',
  'mcp-single-box'
]);

const PILLAR_SLUGS = new Map([
  ['the-field', '/field/'],
  ['the-problem', '/problem/'],
  ['our-claim', '/claim/']
]);

const IMAGE_NAMES = new Set([
  'box-architecture.png',
  'two-box-method.png',
  'fractal.png'
]);

function rewriteUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Skip absolute URLs and anchors
  if (/^[a-z]+:\/\//i.test(url) || url.startsWith('#') || url.startsWith('mailto:')) {
    return url;
  }

  // ../README.md → /architecture/  (and preserve hash)
  const readmeMatch = url.match(/^\.\.\/README\.md(#.*)?$/);
  if (readmeMatch) return '/architecture/' + (readmeMatch[1] ?? '');

  // bare README.md → /architecture/
  const bareReadmeMatch = url.match(/^README\.md(#.*)?$/);
  if (bareReadmeMatch) return '/architecture/' + (bareReadmeMatch[1] ?? '');

  // sibling doc:  internal-architecture.md  or  ./internal-architecture.md
  const siblingDocMatch = url.match(/^\.?\/?([a-z0-9-]+)\.md(#.*)?$/i);
  if (siblingDocMatch && DOC_SLUGS.has(siblingDocMatch[1])) {
    return `/architecture/docs/${siblingDocMatch[1]}/${siblingDocMatch[2] ?? ''}`;
  }
  if (siblingDocMatch && PILLAR_SLUGS.has(siblingDocMatch[1])) {
    return `${PILLAR_SLUGS.get(siblingDocMatch[1])}${siblingDocMatch[2] ?? ''}`;
  }

  // Images in docs/ — flatten to /diagrams/
  const imgMatch = url.match(/^\.?\/?([a-z0-9-]+\.png)$/i);
  if (imgMatch && IMAGE_NAMES.has(imgMatch[1])) {
    return `/diagrams/${imgMatch[1]}`;
  }

  // .dot source files — flatten to /diagrams/
  const dotMatch = url.match(/^\.?\/?([a-z0-9-]+\.dot)$/i);
  if (dotMatch) {
    return `/diagrams/${dotMatch[1]}`;
  }

  // README references to docs/foo.png
  const docsImgMatch = url.match(/^docs\/([a-z0-9-]+\.png)$/i);
  if (docsImgMatch) {
    return `/diagrams/${docsImgMatch[1]}`;
  }

  // README references to docs/foo.md
  const docsDocMatch = url.match(/^docs\/([a-z0-9-]+)\.md(#.*)?$/i);
  if (docsDocMatch && DOC_SLUGS.has(docsDocMatch[1])) {
    return `/architecture/docs/${docsDocMatch[1]}/${docsDocMatch[2] ?? ''}`;
  }
  if (docsDocMatch && PILLAR_SLUGS.has(docsDocMatch[1])) {
    return `${PILLAR_SLUGS.get(docsDocMatch[1])}${docsDocMatch[2] ?? ''}`;
  }

  return url;
}

export function rewriteLinks() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'element') {
        if (node.tagName === 'a' && node.properties?.href) {
          node.properties.href = rewriteUrl(node.properties.href);
        }
        if (node.tagName === 'img' && node.properties?.src) {
          node.properties.src = rewriteUrl(node.properties.src);
        }
      }
    });
  };
}
