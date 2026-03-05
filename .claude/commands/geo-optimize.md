---
description: "Optimize EconoJabis content for AI citation (GEO/AEO). Improves visibility in ChatGPT, Perplexity, Claude, Google AI Overviews, and Gemini answers."
---

# EconoJabis GEO/AEO Content Optimizer

You are optimizing econojabis.com for maximum AI citability across ChatGPT, Perplexity AI, Claude, Google AI Overviews, and Gemini.

## Site Context
- Domain: econojabis.com
- Type: Real-time economic news portal
- Languages: 11 (ko, en, es, ja, zh, fr, de, pt, id, ar, hi)
- Categories: 거시경제, 경제, 시장, 주식, 환율, 금융, 부동산, 암호화폐, 테크
- Tech: Vite + React 18 + TypeScript

## GEO Optimization Checklist (Princeton 9 Methods)

Apply these research-backed methods:

1. **Cite Sources** (+77% visibility): Add authoritative source citations to content
2. **Quotation Addition** (+28%): Include expert quotes with attribution
3. **Statistics Addition** (+41%): Add precise numbers with sources
4. **Fluency Optimization** (+15%): Improve readability and flow
5. **Unique Words** (+12%): Use domain-specific terminology
6. **Technical Terms** (+9%): Include industry jargon appropriately
7. **Authoritative Tone** (+23%): Write with expertise signals
8. **Easy-to-Understand** (+18%): Balance expertise with accessibility
9. **Answer-Ready Format**: Structure content to directly answer questions

## Implementation Tasks

### A. Structured Data Enhancement
- Ensure all articles have NewsArticle schema with:
  - `speakable` for voice search
  - `citation` for source attribution
  - `about` entities for Knowledge Graph
  - `keywords` for topic targeting
- Add `ClaimReview` schema for fact-checked content
- Enhance `FAQPage` schema with more category-specific questions

### B. Content Structure for AI
- Lead paragraphs: concise factual summary (60 words max)
- Include "Key Takeaways" or "Summary" sections
- Use definition-style content for key terms
- Structure as Q&A where appropriate
- Add data tables with precise statistics

### C. AI Bot Access Optimization
- Verify robots.txt allows all major AI crawlers
- Ensure llms.txt is comprehensive and current
- Keep ai-plugin.json up to date
- Add IndexNow support for instant indexing

### D. E-E-A-T Signals
- Author credentials and expertise indicators
- Publication date and freshness signals
- Source attribution and citation links
- Editorial process transparency

## Output
After optimization, provide:
1. GEO Score: X/100 (before vs after)
2. Changes made with rationale
3. Remaining opportunities
