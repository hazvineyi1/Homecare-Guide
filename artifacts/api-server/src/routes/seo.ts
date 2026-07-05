import { Router } from "express";
import { TOPICS } from "./tutor/topics";

// Crawlable, server-rendered pages so each caregiving topic can be indexed and
// rank individually in search, then hand off to the interactive SPA course.
const router = Router();

const SITE = "https://www.dorothymooka.com";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const bySlug = new Map(TOPICS.map((t) => [slugify(t.title), t]));

function shell(opts: { title: string; description: string; canonical: string; body: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}" />
<link rel="canonical" href="${opts.canonical}" />
<meta property="og:title" content="${esc(opts.title)}" />
<meta property="og:description" content="${esc(opts.description)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${opts.canonical}" />
<meta property="og:image" content="${SITE}/og-cover.jpg" />
<meta name="robots" content="index, follow" />
<style>
  :root{--ink:#0F172A;--soft:#475569;--blue:#1D4ED8;--line:#E2E8F0;--tint:#F4F7FC}
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:var(--ink);line-height:1.6;background:#fff}
  a{color:var(--blue)}
  .wrap{max-width:760px;margin:0 auto;padding:22px 20px 64px}
  header a{font-size:13px;font-weight:700;text-decoration:none}
  h1{font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;margin:16px 0 6px}
  h2{font-family:Georgia,serif;font-size:20px;margin:28px 0 8px}
  .eyebrow{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--blue)}
  .meta{color:var(--soft);font-size:14px;margin-bottom:14px}
  .cta{display:inline-block;background:var(--blue);color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:4px;margin:16px 0}
  .box{border-left:4px solid var(--blue);border-radius:4px;padding:12px 16px;background:var(--tint);margin:16px 0}
  .grid a{display:block;border:1px solid var(--line);border-radius:6px;padding:14px 16px;text-decoration:none;color:var(--ink);margin:10px 0}
  .grid a:hover{border-color:var(--blue)}
  .grid .t{font-family:Georgia,serif;font-size:18px}
  .disclaimer{color:var(--soft);font-size:13px;border-top:1px solid var(--line);margin-top:32px;padding-top:14px}
  footer{color:var(--soft);font-size:13px;border-top:1px solid var(--line);margin-top:38px;padding-top:16px}
  footer a{color:var(--soft)}
</style>
</head>
<body><div class="wrap">
<header><a href="/">&larr; A Guide to Homecare</a></header>
${opts.body}
<footer>Based on the book <em>A Guide to Homecare</em> by Dr Dorothy Mooka. This is a preparation and reference guide, not a licensed qualification or a substitute for professional medical advice. &middot; <a href="/topics">All topics</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a> &middot; <a href="mailto:info@synops-consulting.com">Contact</a></footer>
</div></body></html>`;
}

const topicCard = (t: { id: number; title: string }) =>
  `<a href="/topics/${slugify(t.title)}"><span class="t">${esc(t.title)}</span></a>`;

router.get("/topics", (_req, res) => {
  const body = `<div class="eyebrow">Reference library</div>
<h1>All caregiving topics</h1>
<p class="meta">Plain-language reference for ${TOPICS.length} home-caregiving topics, from the book <em>A Guide to Homecare</em> by Dr Dorothy Mooka. Read a topic, then practise it with Nurse Mooka, a Socratic AI tutor. The full course is free.</p>
<a class="cta" href="/">Start the interactive course &rarr;</a>
<div class="grid">${TOPICS.map(topicCard).join("")}</div>`;
  res.type("html").send(shell({
    title: "All caregiving topics | A Guide to Homecare",
    description: `Free plain-language reference for ${TOPICS.length} home-caregiving topics from A Guide to Homecare by Dr Dorothy Mooka.`,
    canonical: `${SITE}/topics`,
    body,
  }));
});

router.get("/topics/:slug", (req, res, next) => {
  const topic = bySlug.get(req.params.slug);
  if (!topic) return next();
  const description = topic.kb.slice(0, 155).replace(/\s+\S*$/, "") + "…";
  const others = TOPICS.filter((t) => t.id !== topic.id).slice(0, 6).map(topicCard).join("");
  const body = `<div class="eyebrow">Caregiving topic</div>
<h1>${esc(topic.title)}</h1>
<p class="meta">A plain-language reference guide, from <em>A Guide to Homecare</em> by Dr Dorothy Mooka.</p>
<a class="cta" href="/">Practise this with Nurse Mooka &rarr;</a>
<div class="box"><b>A situation to reason through:</b> ${esc(cap(topic.launch))}.</div>
<h2>What this topic covers</h2>
<p>${esc(topic.kb)}</p>
<a class="cta" href="/">Start the interactive lesson &rarr;</a>
<h2>More topics</h2>
<div class="grid">${others}</div>
<p><a href="/topics">Browse all ${TOPICS.length} topics &rarr;</a></p>
<p class="disclaimer">This guide helps you prepare and learn. It is not medical advice and does not replace a doctor, nurse, or emergency care. If someone is unwell or you are unsure, contact a health professional.</p>`;
  res.type("html").send(shell({
    title: `${topic.title} | A Guide to Homecare`,
    description,
    canonical: `${SITE}/topics/${req.params.slug}`,
    body,
  }));
});

router.get("/sitemap.xml", (_req, res) => {
  const urls = [
    `${SITE}/`,
    `${SITE}/topics`,
    `${SITE}/privacy`,
    `${SITE}/terms`,
    ...TOPICS.map((t) => `${SITE}/topics/${slugify(t.title)}`),
  ];
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${u}</loc></url>`)
      .join("\n")}\n</urlset>\n`,
  );
});

export default router;
