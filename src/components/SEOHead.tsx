import { useEffect } from "react";
import type { Language } from "../data/newsData";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_LANGUAGE,
  LANGUAGE_META,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
  getLanguageAlternates,
  normalizeCanonicalUrl,
  normalizeToAbsoluteUrl,
} from "../lib/seo";

const MANAGED_ATTR = "data-seo-head";
const GRAPH_SCRIPT_ID = "seo-graph-jsonld";

type SeoArticle = {
  title: string;
  description: string;
  publishedAt: string;
  modifiedAt?: string;
  category: string;
  source: string;
  image?: string;
  author?: string;
  wordCount?: number;
  sourceUrl?: string;
  summary?: string;
};

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  article?: SeoArticle;
  keywords?: string[];
  noindex?: boolean;
  language?: Language;
  categorySlug?: string;
}

// ─── GEO/AEO: Category → Wikidata entity IDs for Knowledge Graph ───
const CATEGORY_ENTITIES: Record<string, Array<{ name: string; sameAs: string }>> = {
  "주식": [
    { name: "Stock market", sameAs: "https://www.wikidata.org/wiki/Q11691" },
    { name: "Stock exchange", sameAs: "https://www.wikidata.org/wiki/Q11661" },
    { name: "Financial market", sameAs: "https://www.wikidata.org/wiki/Q183368" },
  ],
  "암호화폐": [
    { name: "Cryptocurrency", sameAs: "https://www.wikidata.org/wiki/Q13479982" },
    { name: "Bitcoin", sameAs: "https://www.wikidata.org/wiki/Q131723" },
    { name: "Blockchain", sameAs: "https://www.wikidata.org/wiki/Q20514253" },
  ],
  "환율": [
    { name: "Foreign exchange market", sameAs: "https://www.wikidata.org/wiki/Q132390" },
    { name: "Exchange rate", sameAs: "https://www.wikidata.org/wiki/Q205532" },
    { name: "Currency", sameAs: "https://www.wikidata.org/wiki/Q8142" },
  ],
  "부동산": [
    { name: "Real estate", sameAs: "https://www.wikidata.org/wiki/Q10494050" },
    { name: "Housing market", sameAs: "https://www.wikidata.org/wiki/Q1192847" },
    { name: "Mortgage loan", sameAs: "https://www.wikidata.org/wiki/Q103480" },
  ],
  "금융": [
    { name: "Finance", sameAs: "https://www.wikidata.org/wiki/Q43015" },
    { name: "Central bank", sameAs: "https://www.wikidata.org/wiki/Q66344" },
    { name: "Interest rate", sameAs: "https://www.wikidata.org/wiki/Q179179" },
  ],
  "거시경제": [
    { name: "Macroeconomics", sameAs: "https://www.wikidata.org/wiki/Q39680" },
    { name: "Gross domestic product", sameAs: "https://www.wikidata.org/wiki/Q12638" },
    { name: "Inflation", sameAs: "https://www.wikidata.org/wiki/Q11204" },
  ],
  "테크": [
    { name: "Technology", sameAs: "https://www.wikidata.org/wiki/Q11016" },
    { name: "Semiconductor", sameAs: "https://www.wikidata.org/wiki/Q11456" },
    { name: "Artificial intelligence", sameAs: "https://www.wikidata.org/wiki/Q11660" },
  ],
  "경제": [
    { name: "Economy", sameAs: "https://www.wikidata.org/wiki/Q159810" },
    { name: "Economic indicator", sameAs: "https://www.wikidata.org/wiki/Q1127759" },
    { name: "International trade", sameAs: "https://www.wikidata.org/wiki/Q178803" },
  ],
  "시장": [
    { name: "Commodity market", sameAs: "https://www.wikidata.org/wiki/Q11748378" },
    { name: "Futures contract", sameAs: "https://www.wikidata.org/wiki/Q183042" },
    { name: "Trading", sameAs: "https://www.wikidata.org/wiki/Q601401" },
  ],
};

const clamp = (value: string, limit: number) => value.slice(0, limit).trim();

const setMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

const setCanonical = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
};

const replaceAlternateLinks = (alternates: Array<{ hreflang: string; href: string }>) => {
  document.querySelectorAll(`link[rel="alternate"][${MANAGED_ATTR}="true"]`).forEach((el) => el.remove());
  alternates.forEach(({ hreflang, href }) => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.setAttribute("hreflang", hreflang);
    link.href = href;
    link.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(link);
  });
};

const replaceMetaList = (attr: "name" | "property", key: string, values: string[]) => {
  document
    .querySelectorAll(`meta[${attr}="${key}"][${MANAGED_ATTR}="true"]`)
    .forEach((el) => el.remove());
  values.forEach((value) => {
    const el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("content", value);
    el.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(el);
  });
};

const injectGraph = (graph: object[]) => {
  let script = document.getElementById(GRAPH_SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = GRAPH_SCRIPT_ID;
    script.type = "application/ld+json";
    script.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
};

// Category-specific FAQ data for rich results
const CATEGORY_FAQ: Record<string, Array<{ q: string; a: string }>> = {
  "주식": [
    { q: "How often are stock market updates published?", a: "Stock market news is updated in real-time throughout trading hours, covering major indexes including KOSPI, S&P 500, NASDAQ, and Dow Jones." },
    { q: "Which stock markets does EconoJabis cover?", a: "We cover global stock markets including Korea (KOSPI, KOSDAQ), US (NYSE, NASDAQ), Japan (Nikkei), China (SSE, SZSE), and European exchanges." },
    { q: "Does EconoJabis provide stock price data?", a: "We provide market analysis and news about stock price movements, earnings reports, and market trends from major global exchanges." },
  ],
  "암호화폐": [
    { q: "Which cryptocurrencies does EconoJabis cover?", a: "We cover major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and other top digital assets, along with DeFi, NFT, and blockchain ecosystem news." },
    { q: "How current is the crypto market news?", a: "Cryptocurrency news is published around the clock, reflecting the 24/7 nature of digital asset markets." },
    { q: "Does EconoJabis cover crypto regulation news?", a: "Yes, we cover regulatory developments from major jurisdictions including the US SEC, EU MiCA framework, and Asian regulatory bodies." },
  ],
  "환율": [
    { q: "Which currency pairs does EconoJabis track?", a: "We cover major forex pairs including USD/KRW, EUR/USD, USD/JPY, GBP/USD, and emerging market currencies." },
    { q: "How often is forex news updated?", a: "Foreign exchange news is updated continuously during global trading hours, covering central bank decisions, economic data releases, and geopolitical events affecting currencies." },
  ],
  "부동산": [
    { q: "Which real estate markets does EconoJabis cover?", a: "We cover real estate markets in Korea, the US, China, and other major economies, including residential, commercial, and REIT analysis." },
    { q: "Does EconoJabis cover housing policy news?", a: "Yes, we provide comprehensive coverage of government housing policies, mortgage rate changes, and real estate regulations across major markets." },
  ],
  "금융": [
    { q: "What financial topics does EconoJabis cover?", a: "We cover banking, insurance, fintech, central bank policies, interest rates, bond markets, and financial regulation across global markets." },
    { q: "Does EconoJabis report on central bank decisions?", a: "Yes, we provide real-time coverage and analysis of decisions from the Federal Reserve, ECB, Bank of Japan, Bank of Korea, and other major central banks." },
  ],
  "거시경제": [
    { q: "What macroeconomic indicators does EconoJabis track?", a: "We cover GDP, CPI/inflation, employment data, PMI, trade balances, and other key economic indicators from major economies worldwide." },
    { q: "How does EconoJabis analyze economic trends?", a: "Our coverage includes analysis of fiscal and monetary policy impacts, global supply chain dynamics, and cross-border economic relationships." },
  ],
  "테크": [
    { q: "What technology topics does EconoJabis cover?", a: "We cover AI/semiconductor industry, big tech earnings, startup ecosystems, and technology's impact on financial markets and the global economy." },
    { q: "Does EconoJabis cover semiconductor news?", a: "Yes, we provide in-depth coverage of the global semiconductor industry including Samsung, SK Hynix, TSMC, NVIDIA, and supply chain dynamics." },
  ],
};

const DEFAULT_FAQ = [
  { q: "How often is EconoJabis updated?", a: "Market and economy stories are refreshed frequently throughout the day as new developments are detected across global markets." },
  { q: "Which topics does EconoJabis cover?", a: "Coverage spans stocks, interest rates, currencies, commodities, real estate, technology, cryptocurrency, and macroeconomic policy from a global perspective." },
  { q: "In how many languages is EconoJabis available?", a: "EconoJabis is available in 11 languages: Korean, English, Spanish, Japanese, Chinese, French, German, Portuguese, Indonesian, Arabic, and Hindi." },
  { q: "Is EconoJabis free to use?", a: "Yes, all news content on EconoJabis is freely accessible without a subscription or paywall." },
];

const SEOHead = ({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  ogImage,
  article,
  keywords = [],
  noindex = false,
  language = DEFAULT_LANGUAGE,
  categorySlug,
}: SEOHeadProps) => {
  useEffect(() => {
    const languageMeta = LANGUAGE_META[language] || LANGUAGE_META[DEFAULT_LANGUAGE];
    const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Real-time Economic News`;
    const pageDescription = clamp(description || article?.description || SITE_DEFAULT_DESCRIPTION, 160);
    const canonical = normalizeCanonicalUrl(canonicalUrl || window.location.href);
    const fullImage = normalizeToAbsoluteUrl(ogImage || article?.image || SITE_DEFAULT_IMAGE);
    const type = article ? "article" : ogType;
    const allKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])].filter(Boolean);

    document.title = pageTitle;
    document.documentElement.lang = languageMeta.htmlLang;

    setCanonical(canonical);
    setMeta("name", "description", pageDescription);
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex,nofollow,max-image-preview:none"
        : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    );
    setMeta("name", "googlebot", noindex ? "noindex,nofollow" : "index,follow");
    setMeta("name", "bingbot", noindex ? "noindex,nofollow" : "index,follow");
    setMeta("name", "news_keywords", allKeywords.join(","));
    setMeta("name", "keywords", allKeywords.join(","));
    setMeta("name", "content-language", languageMeta.htmlLang);
    setMeta("name", "geo.region", languageMeta.region);
    setMeta("name", "referrer", "strict-origin-when-cross-origin");

    setMeta("property", "og:type", type);
    setMeta("property", "og:title", clamp(pageTitle, 110));
    setMeta("property", "og:description", clamp(pageDescription, 200));
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", fullImage);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", languageMeta.ogLocale);
    replaceMetaList(
      "property",
      "og:locale:alternate",
      Object.values(LANGUAGE_META)
        .map((meta) => meta.ogLocale)
        .filter((locale) => locale !== languageMeta.ogLocale),
    );

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", clamp(pageTitle, 70));
    setMeta("name", "twitter:description", clamp(pageDescription, 200));
    setMeta("name", "twitter:image", fullImage);

    if (article) {
      const modified = article.modifiedAt || article.publishedAt;
      setMeta("property", "article:published_time", article.publishedAt);
      setMeta("property", "article:modified_time", modified);
      setMeta("property", "article:section", article.category);
      setMeta("property", "article:author", article.author || article.source);

      // article:tag for each keyword (important for Google News & social)
      const articleTags = allKeywords.slice(0, 10);
      replaceMetaList("property", "article:tag", articleTags);
    }

    replaceAlternateLinks(getLanguageAlternates(canonical));

    // ─── JSON-LD Structured Data ───

    const websiteSchema = {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: languageMeta.htmlLang,
      description: SITE_DEFAULT_DESCRIPTION,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };

    const organizationSchema = {
      "@type": "NewsMediaOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["에코노자비스", "EconoJabis News", "이코노자비스"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: normalizeToAbsoluteUrl(SITE_DEFAULT_IMAGE),
        width: 1200,
        height: 630,
        caption: `${SITE_NAME} - Real-time Economic News`,
      },
      image: {
        "@type": "ImageObject",
        url: normalizeToAbsoluteUrl(SITE_DEFAULT_IMAGE),
        width: 1200,
        height: 630,
      },
      publishingPrinciples: `${SITE_URL}/about`,
      actionableFeedbackPolicy: `${SITE_URL}/contact`,
      correctionsPolicy: `${SITE_URL}/about`,
      ethicsPolicy: `${SITE_URL}/about`,
      unnamedSourcesPolicy: `${SITE_URL}/about`,
      masthead: `${SITE_URL}/about`,
      sameAs: [
        "https://econojabis.com",
      ],
      foundingDate: "2024-01-01",
      description: "Real-time global economic and financial news platform covering markets, rates, FX, commodities, and crypto in 11 languages.",
      areaServed: {
        "@type": "GeoShape",
        name: "Worldwide",
      },
      knowsAbout: [
        { "@type": "Thing", name: "Stock market", sameAs: "https://www.wikidata.org/wiki/Q11691" },
        { "@type": "Thing", name: "Foreign exchange market", sameAs: "https://www.wikidata.org/wiki/Q132390" },
        { "@type": "Thing", name: "Cryptocurrency", sameAs: "https://www.wikidata.org/wiki/Q13479982" },
        { "@type": "Thing", name: "Macroeconomics", sameAs: "https://www.wikidata.org/wiki/Q39680" },
        { "@type": "Thing", name: "Real estate", sameAs: "https://www.wikidata.org/wiki/Q10494050" },
        { "@type": "Thing", name: "Commodity market", sameAs: "https://www.wikidata.org/wiki/Q11748378" },
        { "@type": "Thing", name: "Central bank", sameAs: "https://www.wikidata.org/wiki/Q66344" },
        { "@type": "Thing", name: "Semiconductor", sameAs: "https://www.wikidata.org/wiki/Q11456" },
      ],
      knowsLanguage: ["ko", "en", "es", "ja", "zh", "fr", "de", "pt", "id", "ar", "hi"],
      numberOfEmployees: { "@type": "QuantitativeValue", value: 10 },
    };

    const graph: object[] = [websiteSchema, organizationSchema];

    if (article) {
      const modified = article.modifiedAt || article.publishedAt;
      const articleSchema: Record<string, any> = {
        "@type": "NewsArticle",
        "@id": `${canonical}#article`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonical,
        },
        headline: clamp(article.title, 110),
        description: clamp(article.description || pageDescription, 300),
        image: {
          "@type": "ImageObject",
          url: fullImage,
          width: 1200,
          height: 630,
        },
        datePublished: article.publishedAt,
        dateModified: modified,
        isAccessibleForFree: true,
        inLanguage: languageMeta.htmlLang,
        articleSection: article.category,
        keywords: allKeywords.join(", "),
        author: {
          "@type": "Organization",
          name: article.source || SITE_NAME,
        },
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        copyrightHolder: {
          "@id": `${SITE_URL}/#organization`,
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".article-summary", "article p:first-of-type"],
        },
        thumbnailUrl: fullImage,
      };

      // Word count if available
      if (article.wordCount && article.wordCount > 0) {
        articleSchema.wordCount = article.wordCount;
      }

      // Abstract/summary
      if (article.summary) {
        articleSchema.abstract = clamp(article.summary, 300);
      }

      // Citation to original source
      if (article.sourceUrl) {
        articleSchema.citation = article.sourceUrl;
      }

      // GEO: About entities with Wikidata sameAs for Knowledge Graph linking
      const entities = CATEGORY_ENTITIES[article.category] || [
        { name: "Economy", sameAs: "https://www.wikidata.org/wiki/Q159810" },
        { name: "Finance", sameAs: "https://www.wikidata.org/wiki/Q43015" },
      ];
      articleSchema.about = entities.map(({ name, sameAs }) => ({ "@type": "Thing", name, sameAs }));

      // GEO: Content accessibility and licensing signals
      articleSchema.isAccessibleForFree = true;
      articleSchema.license = "https://creativecommons.org/licenses/by-nc-nd/4.0/";
      articleSchema.creditText = `${article.source || SITE_NAME} via EconoJabis`;
      articleSchema.copyrightYear = new Date(article.publishedAt).getFullYear() || 2026;

      // GEO: Audience targeting for AI systems
      articleSchema.audience = {
        "@type": "Audience",
        audienceType: "Investors, Financial Analysts, Economists, Traders, General Public",
        geographicArea: { "@type": "AdministrativeArea", name: "Worldwide" },
      };

      // GEO: Content freshness signal
      articleSchema.dateCreated = article.publishedAt;
      articleSchema.expires = undefined; // News articles don't expire but freshness matters

      // GEO: Accessibility for AI citation
      articleSchema.conditionsOfAccess = "Free, no registration required";
      articleSchema.acquireLicensePage = `${SITE_URL}/about`;

      graph.push(
        articleSchema,
        {
          "@type": "BreadcrumbList",
          "@id": `${canonical}#breadcrumbs`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: article.category || "News",
              item: `${SITE_URL}/?category=${encodeURIComponent(article.category || "news")}`,
            },
            { "@type": "ListItem", position: 3, name: clamp(article.title, 80), item: canonical },
          ],
        },
      );
    } else {
      // Non-article pages: WebPage + category-specific or default FAQ
      const pageEntities = categorySlug && CATEGORY_ENTITIES[categorySlug]
        ? CATEGORY_ENTITIES[categorySlug].map(({ name, sameAs }) => ({ "@type": "Thing", name, sameAs }))
        : [
            { "@type": "Thing", name: "Global economy", sameAs: "https://www.wikidata.org/wiki/Q159810" },
            { "@type": "Thing", name: "Financial market", sameAs: "https://www.wikidata.org/wiki/Q183368" },
            { "@type": "Thing", name: "Stock market", sameAs: "https://www.wikidata.org/wiki/Q11691" },
            { "@type": "Thing", name: "Foreign exchange market", sameAs: "https://www.wikidata.org/wiki/Q132390" },
            { "@type": "Thing", name: "Cryptocurrency", sameAs: "https://www.wikidata.org/wiki/Q13479982" },
          ];

      graph.push({
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: pageTitle,
        description: pageDescription,
        inLanguage: languageMeta.htmlLang,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: pageEntities,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "h2", ".news-title", ".news-summary"],
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            ...(categorySlug
              ? [{ "@type": "ListItem", position: 2, name: categorySlug, item: canonical }]
              : []),
          ],
        },
        specialty: categorySlug || "Economic and Financial News",
        significantLink: [
          `${SITE_URL}/feed.xml`,
          `${SITE_URL}/sitemap-news.xml`,
        ],
      });

      // Category-specific FAQ or default FAQ (AEO: Answer Engine Optimization)
      const faqItems = (categorySlug && CATEGORY_FAQ[categorySlug]) || DEFAULT_FAQ;
      graph.push({
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: faqItems.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: {
            "@type": "Answer",
            text: a,
            dateCreated: "2024-01-01",
            inLanguage: "en",
          },
        })),
      });

      // GEO: CollectionPage schema for category listing pages
      if (categorySlug) {
        graph.push({
          "@type": "CollectionPage",
          "@id": `${canonical}#collection`,
          name: `${categorySlug} News - ${SITE_NAME}`,
          description: `Latest ${categorySlug} news and analysis from ${SITE_NAME}`,
          url: canonical,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: pageEntities,
          inLanguage: languageMeta.htmlLang,
        });
      }
    }

    injectGraph(graph);

    return () => {
      document.querySelectorAll(`[${MANAGED_ATTR}="true"]`).forEach((el) => {
        if ((el as HTMLElement).id === GRAPH_SCRIPT_ID) {
          return;
        }
        el.remove();
      });
    };
  }, [article, canonicalUrl, categorySlug, description, keywords, language, noindex, ogImage, ogType, title]);

  return null;
};

export default SEOHead;
