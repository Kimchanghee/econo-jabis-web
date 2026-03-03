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
}

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
    }

    replaceAlternateLinks(getLanguageAlternates(canonical));

    const websiteSchema = {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: languageMeta.htmlLang,
      description: SITE_DEFAULT_DESCRIPTION,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };

    const organizationSchema = {
      "@type": "NewsMediaOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: normalizeToAbsoluteUrl(SITE_DEFAULT_IMAGE),
      },
      publishingPrinciples: `${SITE_URL}/about`,
      actionableFeedbackPolicy: `${SITE_URL}/contact`,
      sameAs: [],
    };

    const graph: object[] = [websiteSchema, organizationSchema];

    if (article) {
      const modified = article.modifiedAt || article.publishedAt;
      graph.push(
        {
          "@type": "NewsArticle",
          "@id": `${canonical}#article`,
          mainEntityOfPage: canonical,
          headline: clamp(article.title, 110),
          description: clamp(article.description || pageDescription, 300),
          image: [fullImage],
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
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".article-summary", "article p:first-of-type"],
          },
        },
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
      graph.push(
        {
          "@type": "CollectionPage",
          "@id": `${canonical}#webpage`,
          url: canonical,
          name: pageTitle,
          description: pageDescription,
          inLanguage: languageMeta.htmlLang,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: ["economy", "stocks", "forex", "commodities", "crypto"],
        },
        {
          "@type": "FAQPage",
          "@id": `${canonical}#faq`,
          mainEntity: [
            {
              "@type": "Question",
              name: "How often is this news site updated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Market and economy stories are refreshed frequently throughout the day as new developments are detected.",
              },
            },
            {
              "@type": "Question",
              name: "Which topics are covered?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Coverage includes stocks, rates, currencies, commodities, technology, policy, and cryptocurrency.",
              },
            },
          ],
        },
      );
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
  }, [article, canonicalUrl, description, keywords, language, noindex, ogImage, ogType, title]);

  return null;
};

export default SEOHead;
