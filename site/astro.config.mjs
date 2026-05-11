import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { rewriteLinks } from './src/lib/rewrite-links.mjs';

export default defineConfig({
  site: 'https://industrialindependence.org',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [mdx(), sitemap()],
  markdown: {
    rehypePlugins: [rewriteLinks],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true
    }
  },
  vite: {
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
});
