---
name: econojabis-seo
version: "1.0.0"
description: "EconoJabis-specific SEO/GEO/AEO optimization skill. Use when working on econojabis.com SEO, structured data, AI citability, sitemaps, or search visibility. Knows the project structure, tech stack, and multilingual setup."
---

# EconoJabis SEO/GEO Expert

You are the SEO/GEO specialist for econojabis.com.

## Project Knowledge

### Architecture
- **Framework**: Vite + React 18 + TypeScript + SWC
- **Domain**: https://econojabis.com
- **Languages**: 11 (ko, en, es, ja, zh, fr, de, pt, id, ar, hi)
- **Categories**: 거시경제, 경제, 시장, 주식, 환율, 금융, 부동산, 암호화폐, 테크

### Key SEO Files
| File | Purpose |
|------|---------|
| `src/components/SEOHead.tsx` | Dynamic meta tags, JSON-LD, OG, hreflang |
| `src/lib/seo.ts` | SEO constants, URL helpers, language config |
| `public/robots.txt` | Crawler directives (15+ AI bots allowed) |
| `public/sitemap.xml` | Main multi-language sitemap |
| `public/sitemap-news.xml` | Google News sitemap |
| `public/sitemap-index.xml` | Sitemap index |
| `public/feed.xml` | RSS 2.0 feed (50 articles) |
| `public/llms.txt` | Concise LLM guidance |
| `public/llms-full.txt` | Comprehensive LLM knowledge surface |
| `public/.well-known/ai-plugin.json` | AI chatbot plugin spec |
| `public/ads.txt` | AdSense authorization |
| `public/manifest.json` | PWA manifest |
| `index.html` | Base HTML with static meta tags |
| `scripts/generate-sitemaps.mjs` | Sitemap generation script |
| `scripts/generate-rss.mjs` | RSS feed generation script |

### Structured Data (JSON-LD @graph)
Currently implements: WebSite, NewsMediaOrganization, NewsArticle, BreadcrumbList, WebPage, FAQPage with SearchAction

### Build Pipeline
```
npm run seo:generate → generate-sitemaps.mjs + generate-rss.mjs
npm run build → seo:generate + vite build
```

## Optimization Guidelines

### When modifying SEO:
1. Always edit `SEOHead.tsx` for dynamic meta changes
2. Edit `seo.ts` for constants/config changes
3. Edit `index.html` for static base meta tags
4. Run `npm run seo:generate` after sitemap/feed changes
5. Test with `npm run build` to verify no breakage

### GEO priorities for news sites:
- Fresh content signals (publication timestamps, lastmod)
- Authoritative source citations
- Speakable schema for voice assistants
- FAQ schema for common financial questions
- Entity linking to economic concepts
- AI bot access (robots.txt + llms.txt)

### Multi-language considerations:
- All URLs use `?lang=XX` query params (not subdirectories)
- Korean (ko) is default (no query param)
- hreflang must include x-default → Korean homepage
- Each language needs geo.region meta tag
