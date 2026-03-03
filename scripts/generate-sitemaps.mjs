import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const FALLBACK_SOURCE = path.join(ROOT, "src", "hooks", "useTheNewsApi.ts");
const SITE_URL = (process.env.SITE_URL || "https://econojabis.com").replace(/\/+$/, "");
const NOW = new Date();
const TODAY = NOW.toISOString().slice(0, 10);
const NOW_ISO = NOW.toISOString();

const LANGUAGES = ["ko", "en", "es", "ja", "zh", "fr", "de", "pt", "id", "ar", "hi"];

const STATIC_PAGES = [
  { path: "/", params: {}, priority: "1.0", changefreq: "hourly" },
  { path: "/about", params: {}, priority: "0.8", changefreq: "monthly" },
  { path: "/contact", params: {}, priority: "0.7", changefreq: "monthly" },
  { path: "/privacy", params: {}, priority: "0.5", changefreq: "yearly" },
];

const CATEGORY_PAGES = [
  "거시경제",
  "경제",
  "시장",
  "주식",
  "환율",
  "금융",
  "부동산",
  "암호화폐",
  "테크",
];

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const buildUrl = (pathname, params = {}) => {
  const url = new URL(`${SITE_URL}${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, String(value));
  });
  return url.toString();
};

const buildAlternates = (pathname, params = {}) =>
  LANGUAGES.map((lang) => {
    const next = { ...params };
    if (lang !== "ko") {
      next.lang = lang;
    }
    return {
      hreflang: lang,
      href: buildUrl(pathname, next),
    };
  }).concat({ hreflang: "x-default", href: buildUrl(pathname, params) });

const parseFallbackArticles = () => {
  const source = fs.readFileSync(FALLBACK_SOURCE, "utf8");
  const pattern =
    /id:\s*'(fallback_\d+)'.*?title:\s*'([^']+)'.*?publishedAt:\s*new Date\(now\.getTime\(\)\s*-\s*(\d+)\*60000\)\.toISOString\(\)/gs;
  const matches = [...source.matchAll(pattern)];

  const items = matches.map((match) => {
    const id = match[1];
    const title = match[2];
    const minutesAgo = Number.parseInt(match[3], 10);
    const published = new Date(NOW.getTime() - (Number.isFinite(minutesAgo) ? minutesAgo : 0) * 60_000).toISOString();
    return { id, title, publishedAt: published };
  });

  return items.length > 0
    ? items
    : [...new Set([...source.matchAll(/id:\s*'(fallback_\d+)'/g)].map((match) => match[1]))].map((id) => ({
        id,
        title: id,
        publishedAt: NOW_ISO,
      }));
};

const fallbackArticles = parseFallbackArticles();
const dynamicPages = CATEGORY_PAGES.map((category) => ({
  path: "/",
  params: { category },
  priority: "0.7",
  changefreq: "hourly",
}));
const articlePages = fallbackArticles.map((article) => ({
  path: `/article/${encodeURIComponent(article.id)}`,
  params: {},
  priority: "0.9",
  changefreq: "hourly",
  id: article.id,
  title: article.title,
  publishedAt: article.publishedAt,
}));

const allPages = [...STATIC_PAGES, ...dynamicPages, ...articlePages];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages
  .map(({ path: pagePath, params, priority, changefreq }) => {
    const canonical = buildUrl(pagePath, params);
    const alternates = buildAlternates(pagePath, params)
      .map(
        ({ hreflang, href }) =>
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`,
      )
      .join("\n");
    return `  <url>
    <loc>${escapeXml(canonical)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
  </url>`;
  })
  .join("\n")}
</urlset>
`;

const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articlePages
  .slice(0, 1000)
  .map(({ path: pagePath, id, title, publishedAt }) => {
    const canonical = buildUrl(pagePath, {});
    return `  <url>
    <loc>${escapeXml(canonical)}</loc>
    <news:news>
      <news:publication>
        <news:name>EconoJabis</news:name>
        <news:language>ko</news:language>
      </news:publication>
      <news:publication_date>${publishedAt || NOW_ISO}</news:publication_date>
      <news:title>${escapeXml(title || id || "EconoJabis News")}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXml, "utf8");
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-news.xml"), newsSitemapXml, "utf8");

console.log(`[seo] Generated sitemap.xml (${allPages.length} urls) and sitemap-news.xml (${articlePages.length} urls)`);
