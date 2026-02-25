import { useEffect } from "react";

const SITE_NAME = "EconoJabis";
const SITE_URL = "https://econojabis.com";
const SITE_DESCRIPTION = "한국 경제 뉴스 포털 - 주식, 부동산, 환율, 암호화폐, 금리 등 실시간 경제 뉴스와 시장 분석을 제공합니다.";
const DEFAULT_IMAGE = "/og-image.png";
const LOCALE = "ko_KR";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  article?: {
    title: string;
    description: string;
    publishedAt: string;
    category: string;
    source: string;
    image?: string;
    author?: string;
  };
  keywords?: string[];
  noindex?: boolean;
}

function injectJsonLd(id: string, data: object) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

const SEOHead = ({
  title, description, canonicalUrl, ogType = "website",
  ogImage, article, keywords = [], noindex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    const fullTitle = title
      ? title + " | " + SITE_NAME
      : SITE_NAME + " - 실시간 경제뉴스 포털";
    const desc = description || article?.description || SITE_DESCRIPTION;
    const url = canonicalUrl || window.location.href;
    const image = ogImage || article?.image || DEFAULT_IMAGE;
    const type = article ? "article" : ogType;
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string, extra?: Record<string, string>) => {
      let selector = `link[rel="${rel}"]`;
      if (extra) Object.entries(extra).forEach(([k, v]) => { selector += `[${k}="${v}"]`; });
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
        document.head.appendChild(el);
      }
      (el as HTMLLinkElement).href = href;
    };

    // SEO Meta
    setMeta("name", "description", desc.slice(0, 160));
    setMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    setMeta("name", "googlebot", noindex ? "noindex" : "index,follow");
    const defaultKw = ["경제뉴스","주식","코스피","코스닥","환율","비트코인","부동산","금리","투자","재테크"];
    const allKw = [...new Set([...keywords, ...defaultKw])];
    setMeta("name", "keywords", allKw.join(","));
    setLink("canonical", url);

    // Open Graph
    setMeta("property", "og:type", type);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc.slice(0, 200));
    setMeta("property", "og:url", url);
    const fullImage = image.startsWith("http") ? image : SITE_URL + image;
    setMeta("property", "og:image", fullImage);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", LOCALE);
    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc.slice(0, 200));
    setMeta("name", "twitter:image", fullImage);

    if (article) {
      setMeta("property", "article:published_time", article.publishedAt);
      setMeta("property", "article:section", article.category);
      setMeta("property", "article:author", article.author || article.source);
      const aSchema = {
        "@context": "https://schema.org", "@type": "NewsArticle",
        headline: article.title.slice(0, 110),
        description: article.description.slice(0, 200),
        image: [fullImage],
        datePublished: article.publishedAt, dateModified: article.publishedAt,
        author: { "@type": "Organization", name: article.source || SITE_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: SITE_URL + "/logo.png" } },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isAccessibleForFree: true, inLanguage: "ko", keywords: allKw.join(", "),
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".article-summary", ".article-content p:first-of-type"]
        }
      };
      injectJsonLd("article-jsonld", aSchema);
      const bcSchema = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: article.category, item: SITE_URL + "/?category=" + encodeURIComponent(article.category) },
          { "@type": "ListItem", position: 3, name: article.title.slice(0, 60) },
        ],
      };
      injectJsonLd("breadcrumb-jsonld", bcSchema);
    } else {
      const wsSchema = {
        "@context": "https://schema.org", "@type": "WebSite",
        name: SITE_NAME, url: SITE_URL, description: SITE_DESCRIPTION, inLanguage: "ko",
        potentialAction: { "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: SITE_URL + "/?q={search_term_string}" },
          "query-input": "required name=search_term_string",
        },
      };
      injectJsonLd("website-jsonld", wsSchema);
      const orgSchema = {
        "@context": "https://schema.org", "@type": "Organization",
        name: SITE_NAME, url: SITE_URL, logo: SITE_URL + "/logo.png",
        description: SITE_DESCRIPTION, sameAs: [],
        contactPoint: { "@type": "ContactPoint", contactType: "customer service", availableLanguage: ["Korean","English"] },
      };
      injectJsonLd("org-jsonld", orgSchema);

      // FAQ Schema for AEO
      const faqSchema = {
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "EconoJabis는 어떤 서비스인가요?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "EconoJabis는 실시간 한국 경제뉴스를 제공하는 뉴스 포털입니다. 주식, 부동산, 환율, 암호화폐, 금리 등 다양한 경제 분야의 최신 뉴스를 자동으로 수집하여 10분마다 업데이트합니다."
            }
          },
          {
            "@type": "Question",
            name: "경제뉴스는 얼마나 자주 업데이트되나요?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "모든 경제뉴스는 10분마다 자동으로 업데이트됩니다. 새로고침 없이도 최신 경제 뉴스를 실시간으로 확인할 수 있습니다."
            }
          },
          {
            "@type": "Question",
            name: "어떤 카테고리의 뉴스를 볼 수 있나요?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "경제, 주식, 암호화폐 카테고리의 뉴스를 제공합니다. 코스피, 코스닥, 환율, 비트코인, 부동산, 금리 관련 한국 경제 뉴스를 한눈에 확인할 수 있습니다."
            }
          }
        ]
      };
      injectJsonLd("faq-jsonld", faqSchema);

      // Speakable Schema for AEO
      const speakableSchema = {
        "@context": "https://schema.org", "@type": "WebPage",
        name: fullTitle,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".news-headline", ".category-title", ".featured-news-title"]
        },
        url: url
      };
      injectJsonLd("speakable-jsonld", speakableSchema);
    }

    // GEO Tags
    setMeta("name", "geo.region", "KR");
    setMeta("name", "geo.placename", "South Korea");
    setMeta("name", "content-language", "ko");
    setLink("alternate", url, { hreflang: "ko" });
    setLink("alternate", url, { hreflang: "x-default" });

    return () => {
      ["article-jsonld","website-jsonld","org-jsonld","breadcrumb-jsonld","faq-jsonld","speakable-jsonld"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [title, description, canonicalUrl, ogType, ogImage, article, keywords, noindex]);

  return null;
};

export default SEOHead;
