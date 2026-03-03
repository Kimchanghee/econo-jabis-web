import type { Language } from "../data/newsData";

export const SITE_NAME = "EconoJabis";
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://econojabis.com").replace(/\/+$/, "");
export const SITE_DEFAULT_IMAGE = "/og-image.png";
export const SITE_DEFAULT_DESCRIPTION =
  "Real-time global economic and financial news covering markets, rates, FX, commodities, and crypto.";

export const SUPPORTED_LANGUAGES: Language[] = [
  "ko",
  "en",
  "es",
  "ja",
  "zh",
  "fr",
  "de",
  "pt",
  "id",
  "ar",
  "hi",
];

export const DEFAULT_LANGUAGE: Language = "ko";

type LanguageMeta = {
  htmlLang: string;
  ogLocale: string;
  region: string;
  displayName: string;
};

export const LANGUAGE_META: Record<Language, LanguageMeta> = {
  ko: { htmlLang: "ko-KR", ogLocale: "ko_KR", region: "KR", displayName: "Korean" },
  en: { htmlLang: "en-US", ogLocale: "en_US", region: "US", displayName: "English" },
  es: { htmlLang: "es-ES", ogLocale: "es_ES", region: "ES", displayName: "Spanish" },
  ja: { htmlLang: "ja-JP", ogLocale: "ja_JP", region: "JP", displayName: "Japanese" },
  zh: { htmlLang: "zh-CN", ogLocale: "zh_CN", region: "CN", displayName: "Chinese" },
  fr: { htmlLang: "fr-FR", ogLocale: "fr_FR", region: "FR", displayName: "French" },
  de: { htmlLang: "de-DE", ogLocale: "de_DE", region: "DE", displayName: "German" },
  pt: { htmlLang: "pt-BR", ogLocale: "pt_BR", region: "BR", displayName: "Portuguese" },
  id: { htmlLang: "id-ID", ogLocale: "id_ID", region: "ID", displayName: "Indonesian" },
  ar: { htmlLang: "ar-SA", ogLocale: "ar_SA", region: "SA", displayName: "Arabic" },
  hi: { htmlLang: "hi-IN", ogLocale: "hi_IN", region: "IN", displayName: "Hindi" },
};

export const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
];

export const DEFAULT_KEYWORDS = [
  "economic news",
  "financial news",
  "market analysis",
  "stock market",
  "forex",
  "interest rates",
  "inflation",
  "commodities",
  "crypto news",
  "global economy",
];

export const isSupportedLanguage = (value: string): value is Language => {
  return SUPPORTED_LANGUAGES.includes(value as Language);
};

export const normalizeToAbsoluteUrl = (pathOrUrl: string): string => {
  if (!pathOrUrl) {
    return `${SITE_URL}/`;
  }
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const normalizeCanonicalUrl = (rawUrl: string): string => {
  const url = new URL(normalizeToAbsoluteUrl(rawUrl));
  url.hash = "";
  TRACKING_PARAMS.forEach((key) => url.searchParams.delete(key));
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
};

type UrlParamRecord = Record<string, string | undefined>;

export const buildPageUrl = (pathname: string, params: UrlParamRecord = {}): string => {
  const url = new URL(normalizeToAbsoluteUrl(pathname));
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  return normalizeCanonicalUrl(url.toString());
};

export const getLanguageAlternates = (
  canonicalUrl: string,
): Array<{ hreflang: string; href: string }> => {
  const normalized = new URL(normalizeCanonicalUrl(canonicalUrl));
  const alternates = SUPPORTED_LANGUAGES.map((lang) => {
    const next = new URL(normalized.toString());
    if (lang === DEFAULT_LANGUAGE) {
      next.searchParams.delete("lang");
    } else {
      next.searchParams.set("lang", lang);
    }
    return { hreflang: lang, href: next.toString() };
  });

  const defaultHref = alternates.find((item) => item.hreflang === DEFAULT_LANGUAGE)?.href || normalized.toString();
  alternates.push({ hreflang: "x-default" as any, href: defaultHref });
  return alternates;
};
