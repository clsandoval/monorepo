import { writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://inheritance-frontend.fly.dev';
const today = new Date().toISOString().slice(0, 10);

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/intestate-succession-calculator', priority: '0.9', changefreq: 'monthly' },
  { path: '/legitimate-share-calculator', priority: '0.9', changefreq: 'monthly' },
  { path: '/spouse-and-children-inheritance', priority: '0.9', changefreq: 'monthly' },
  { path: '/illegitimate-child-inheritance', priority: '0.9', changefreq: 'monthly' },
  { path: '/parents-inheritance-share', priority: '0.9', changefreq: 'monthly' },
  { path: '/no-will-inheritance-philippines', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/intestate-vs-testate', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/how-to-compute-legitime', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/illegitimate-children-rights', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/no-will-philippines', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/preterition-explained', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/parents-inheritance-share', priority: '0.7', changefreq: 'monthly' },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

const outPath = resolve(import.meta.dirname, '../dist/sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`Sitemap written to ${outPath}`);
