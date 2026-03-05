import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const FALLBACK_SOURCE = path.join(ROOT, "src", "hooks", "useTheNewsApi.ts");
const SITE_URL = (process.env.SITE_URL || "https://econojabis.com").replace(/\/+$/, "");
const NOW = new Date();
const NOW_RFC822 = NOW.toUTCString();

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const toRfc822 = (isoDate) => {
  try {
    return new Date(isoDate).toUTCString();
  } catch {
    return NOW_RFC822;
  }
};

const parseFallbackArticles = () => {
  const source = fs.readFileSync(FALLBACK_SOURCE, "utf8");

  // Match real_NNN or fallback_NNN patterns with flexible time offset multipliers
  const pattern =
    /id:\s*'(\w+_\d+)'.*?title:\s*'([^']+)'.*?description:\s*'([^']*)'.*?category:\s*'([^']*)'.*?publishedAt:\s*new Date\(now\.getTime\(\)\s*-\s*(\d+)\*(\d+)\)\.toISOString\(\)/gs;
  const matches = [...source.matchAll(pattern)];

  if (matches.length === 0) {
    // Simpler fallback pattern
    const simplePattern =
      /id:\s*'(\w+_\d+)'.*?title:\s*'([^']+)'.*?publishedAt:\s*new Date\(now\.getTime\(\)\s*-\s*(\d+)\*(\d+)\)\.toISOString\(\)/gs;
    const simpleMatches = [...source.matchAll(simplePattern)];
    return simpleMatches.map((match) => ({
      id: match[1],
      title: match[2],
      description: "",
      category: "경제",
      publishedAt: new Date(NOW.getTime() - Number.parseInt(match[3], 10) * Number.parseInt(match[4], 10)).toISOString(),
    }));
  }

  return matches.map((match) => ({
    id: match[1],
    title: match[2],
    description: match[3] || "",
    category: match[4] || "경제",
    publishedAt: new Date(NOW.getTime() - Number.parseInt(match[5], 10) * Number.parseInt(match[6], 10)).toISOString(),
  }));
};

const articles = parseFallbackArticles().slice(0, 50);

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>EconoJabis - Real-time Economic News</title>
    <link>${SITE_URL}</link>
    <description>Real-time global economic and financial news covering markets, rates, FX, commodities, and crypto.</description>
    <language>ko</language>
    <lastBuildDate>${NOW_RFC822}</lastBuildDate>
    <ttl>15</ttl>
    <copyright>Copyright ${NOW.getFullYear()} EconoJabis. All rights reserved.</copyright>
    <managingEditor>contact@econojabis.com (EconoJabis)</managingEditor>
    <webMaster>contact@econojabis.com (EconoJabis)</webMaster>
    <image>
      <url>${SITE_URL}/og-image.png</url>
      <title>EconoJabis</title>
      <link>${SITE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${articles
  .map(
    (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}/article/${encodeURIComponent(article.id)}</link>
      <description>${escapeXml(article.description || article.title)}</description>
      <pubDate>${toRfc822(article.publishedAt)}</pubDate>
      <category>${escapeXml(article.category)}</category>
      <guid isPermaLink="true">${SITE_URL}/article/${encodeURIComponent(article.id)}</guid>
      <author>contact@econojabis.com (EconoJabis)</author>
      <source url="${SITE_URL}/feed.xml">EconoJabis</source>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(PUBLIC_DIR, "feed.xml"), rssXml, "utf8");
console.log(`[seo] Generated feed.xml (${articles.length} items)`);
