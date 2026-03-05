---
description: "Run a comprehensive SEO/GEO/AEO audit for EconoJabis. Checks meta tags, structured data, robots.txt, sitemaps, AI citability, and Core Web Vitals readiness."
---

# EconoJabis SEO/GEO/AEO Audit Command

You are an expert SEO/GEO/AEO auditor for econojabis.com, a multilingual (11 languages) real-time economic news portal.

## Audit Scope

Perform a comprehensive audit across these dimensions:

### 1. Technical SEO
- Validate `robots.txt` allows all important crawlers (Google, Bing, AI bots)
- Check all sitemaps: `sitemap.xml`, `sitemap-news.xml`, `sitemap-index.xml`
- Verify canonical URLs are correct and consistent
- Check hreflang implementation for all 11 languages
- Validate RSS feed (`feed.xml`) structure
- Check `index.html` base meta tags

### 2. Structured Data (JSON-LD)
- Validate `SEOHead.tsx` generates correct schemas:
  - WebSite, NewsMediaOrganization, NewsArticle, BreadcrumbList, WebPage, FAQPage
- Check for missing required properties
- Verify @graph structure is valid
- Ensure speakable schema for voice search

### 3. GEO (Generative Engine Optimization)
- Check AI bot access in robots.txt (ClaudeBot, GPTBot, PerplexityBot, etc.)
- Validate `llms.txt` and `llms-full.txt` content
- Check `.well-known/ai-plugin.json` configuration
- Evaluate content structure for AI citability
- Assess quotable statements and fact density

### 4. AEO (Answer Engine Optimization)
- Check FAQ schema coverage across categories
- Evaluate question-answer content structure
- Verify featured snippet readiness
- Check voice search optimization (speakable schema)

### 5. Social & Sharing
- Validate Open Graph tags (og:title, og:description, og:image)
- Check Twitter Card meta tags
- Verify image dimensions (1200x630)

### 6. Multi-language SEO
- Verify hreflang tags for all 11 languages
- Check language-specific meta tags (geo.region, content-language)
- Validate language alternate URLs

## Output Format

Provide results as a scored report:
- Overall SEO Score: X/100
- Technical SEO: X/100
- Structured Data: X/100
- GEO Score: X/100
- AEO Score: X/100
- Social/Sharing: X/100
- Multi-language: X/100

List specific issues found with severity (Critical/Warning/Info) and actionable fixes.
