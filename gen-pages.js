#!/usr/bin/env node
/* Generate a real, indexable HTML page per service cube (and /about) from index.html.
   Each page = a full copy of the experience with cube-specific <title>/meta/og + crawlable
   text; the app reads location.pathname and auto-dives into that cube on load.
   Run after ANY edit to index.html:  node gen-pages.js
   Then commit the slug folders + sitemap.xml. */
const fs = require('fs'), path = require('path');
const ROOT = __dirname, SITE = 'https://rynh.net';
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// blurb = the visible/crawlable SEO paragraph; desc = short (<=155 chars) meta/og/twitter description
const PAGES = [
  { slug:'custom-software', title:'Custom Software & Apps',
    blurb:'The web app your business actually needs, built end to end. Dashboards, internal tools, customer portals, installable PWAs, with auth, payments, and realtime wired in where the job calls for it. Production-grade, not a prototype that breaks by week two.',
    desc:'Custom web apps built end to end: dashboards, internal tools, portals, and PWAs with auth, payments, and realtime. Production-grade from day one.' },
  { slug:'automation', title:'Business Automation',
    blurb:'The work your team redoes every week, done once and for good. We map the process, then build the automation or internal tool that runs it, so errors drop and hours come back. One we built lifted accuracy 20% across 1,000+ monthly shipments.',
    desc:'We map the process, then build the automation that runs it, so errors drop and hours come back. One build lifted accuracy 20% across 1,000+ shipments.' },
  { slug:'data-analytics', title:'Data & Analytics',
    blurb:'Stop deciding from stale spreadsheets. We build the pipelines and dashboards that turn scattered data into one live view of what is working and what is quietly costing you. SQL, clean reporting, Google-certified analytics.',
    desc:'Pipelines and dashboards that turn scattered data into one live view of what is working and what is quietly costing you. SQL and clean reporting.' },
  { slug:'web-presence', title:'Web Presence & Branding',
    blurb:'A site that earns the click and closes it. Fast, search-ready, and on-brand from logo to landing page, designed and built in one place so it looks sharp and actually converts.',
    desc:'A site that earns the click and closes it. Fast, search-ready, and on-brand from logo to landing page, designed and built in one place.' },
  { slug:'ai-integration', title:'AI Integration',
    blurb:'AI that does a real job, not a party trick. Assistants, document processing, and product features wired into your actual workflow and shipped with guardrails, so they stay useful long after the demo.',
    desc:'AI that does a real job: assistants, document processing, and product features wired into your workflow and shipped with guardrails.' },
  { slug:'strategy', title:'Strategy & Operations',
    blurb:'Know what to build before you pay to build it. We turn business goals into clear requirements, a technical plan, and the process to deliver, drawn from real project-management and operations experience. The right call early beats the expensive rebuild later.',
    desc:'Know what to build before you pay to build it. We turn business goals into clear requirements, a technical plan, and the process to deliver.' },
  { slug:'about', title:'About RYNH',
    blurb:'RYNH is a technology and business consultancy. Our team advises then builds, custom software, automation, data systems, brand-ready web, and AI integrations. We pair engineering with real operations and project-management experience, so the right call gets made early and the build actually ships.',
    desc:'RYNH is a technology and business consultancy. We advise then build: custom software, automation, data systems, web, and AI integrations.' },
];

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const enc = s => esc(s).replace(/"/g,'&quot;');

function build(p){
  const pageTitle = p.slug === 'about' ? p.title : `${p.title} - RYNH`, url = `${SITE}/${p.slug}/`;   // about already contains the brand; hyphen, never an em dash
  const related = PAGES.filter(x => x.slug !== p.slug);
  // per-page Service JSON-LD (inside the SEO block, so each page carries its own; about keeps just the shared Organization graph)
  const serviceLd = p.slug === 'about' ? '' : `
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Service',
      name: p.title, description: p.desc, url,
      provider: { '@id': 'https://rynh.net/#rynh' }, areaServed: 'Worldwide',
    })}<\/script>`;
  const seo = `
    <h1>${esc(p.title)}</h1>
    <p>${esc(p.blurb)}</p>
    <p><a href="mailto:ryan@rynh.net?subject=Let's%20talk">Let's talk about your project</a> or <a href="/">explore the studio</a>.</p>
    <h2>More from RYNH</h2>
    <ul>${related.map(r => `<li><a href="/${r.slug}/">${esc(r.title)}</a></li>`).join('')}</ul>
    <p>© 2026 RYNH &middot; Vancouver, BC</p>${serviceLd}
  `;
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${enc(pageTitle)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${enc(p.desc)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${enc(pageTitle)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${enc(p.desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${enc(pageTitle)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${enc(p.desc)}$2`)
    .replace(/<!--SEO:START-->[\s\S]*?<!--SEO:END-->/, `<!--SEO:START-->${seo}<!--SEO:END-->`);
  fs.mkdirSync(path.join(ROOT, p.slug), { recursive:true });
  fs.writeFileSync(path.join(ROOT, p.slug, 'index.html'), out);
  return url;
}

const urls = [SITE + '/'].concat(PAGES.map(build));
const today = process.env.GEN_DATE || new Date().toISOString().slice(0,10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u === SITE + '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log(`generated ${PAGES.length} pages + sitemap (${urls.length} urls)`);
