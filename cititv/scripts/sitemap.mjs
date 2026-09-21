// Gera public/sitemap.xml com rotas estáticas. Troque SITE_URL pelo domínio final.
// Uso: npm run sitemap (requer Node 18+)
import { writeFileSync } from 'node:fs';

const SITE = process.env.SITE_URL || 'https://citytv.example.com';
const routes = ['/', '/animes', '/generos', '/populares'];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map((r) => `  <url><loc>${SITE}${r}</loc><changefreq>daily</changefreq><priority>${r === '/' ? '1.0' : '0.8'}</priority></url>`)
  .join('\n')}\n</urlset>\n`;

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log('sitemap.xml gerado para', SITE);
