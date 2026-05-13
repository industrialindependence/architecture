import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { rewriteLinks } from './src/lib/rewrite-links.mjs';

export default defineConfig({
  site: 'https://industrialindependence.org',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    mdx(),
    sitemap({
      lastmod: new Date(),
      changefreq: 'weekly',
      serialize(item) {
        const url = new URL(item.url);
        const path = url.pathname;
        if (path === '/') item.priority = 1.0;
        else if (path === '/philosophy/' || path === '/architecture/') item.priority = 0.9;
        else if (path === '/architecture/docs/') item.priority = 0.8;
        else if (path.startsWith('/architecture/docs/')) item.priority = 0.7;
        else item.priority = 0.5;
        return item;
      }
    })
  ],
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
