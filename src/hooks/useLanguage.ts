import { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "../data/newsData";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "../lib/seo";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const baseDictionary: Record<string, string> = {
  siteName: "EconoJabis",
  siteTagline: "Real-time Global Economic News",
  breaking: "Breaking",
  featured: "Featured",
  latest: "Latest",
  latestNews: "Latest News",
  updated: "Updated",
  markets: "Markets",
  stocks: "Stocks",
  crypto: "Crypto",
  forex: "Forex",
  economy: "Economy",
  finance: "Finance",
  realestate: "Real Estate",
  all: "All",
  readMore: "Read More",
  loading: "Loading...",
  error: "An error occurred",
  refresh: "Refresh",
  lastUpdated: "Last Updated",
  advertisement: "Advertisement",
  search: "Search",
  trending: "Trending",
  more: "More",
  close: "Close",
  share: "Share",
  save: "Save",
  home: "Home",
  news: "News",
  analysis: "Analysis",
  opinion: "Opinion",
};

const translations: Record<Language, Record<string, string>> = {
  ko: {
    ...baseDictionary,
    siteTagline: "실시간 글로벌 경제 뉴스",
    breaking: "속보",
    featured: "주요뉴스",
    latest: "최신뉴스",
    latestNews: "최신뉴스",
    updated: "업데이트",
    markets: "시장",
    stocks: "주식",
    crypto: "암호화폐",
    forex: "환율",
    economy: "경제",
    finance: "금융",
    realestate: "부동산",
    all: "전체",
    readMore: "더 보기",
    loading: "로딩 중...",
    error: "오류가 발생했습니다",
    refresh: "새로고침",
    lastUpdated: "마지막 업데이트",
    advertisement: "광고",
    search: "검색",
    trending: "트렌딩",
    more: "더보기",
    close: "닫기",
    share: "공유",
    save: "저장",
    home: "홈",
    news: "뉴스",
    analysis: "분석",
    opinion: "오피니언",
  },
  en: { ...baseDictionary },
  es: { ...baseDictionary, siteTagline: "Noticias económicas globales en tiempo real", search: "Buscar" },
  ja: { ...baseDictionary, siteTagline: "リアルタイムグローバル経済ニュース", search: "検索" },
  zh: { ...baseDictionary, siteTagline: "实时全球经济新闻", search: "搜索" },
  fr: { ...baseDictionary, siteTagline: "Actualités économiques mondiales en temps réel", search: "Recherche" },
  de: { ...baseDictionary, siteTagline: "Globale Wirtschaftsnachrichten in Echtzeit", search: "Suche" },
  pt: { ...baseDictionary, siteTagline: "Notícias econômicas globais em tempo real", search: "Buscar" },
  id: { ...baseDictionary, siteTagline: "Berita ekonomi global real-time", search: "Cari" },
  ar: { ...baseDictionary, siteTagline: "أخبار الاقتصاد العالمي لحظة بلحظة", search: "بحث" },
  hi: { ...baseDictionary, siteTagline: "रियल-टाइम वैश्विक आर्थिक समाचार", search: "खोजें" },
};

const languageNames: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  es: "Español",
  ja: "日本語",
  zh: "中文",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  id: "Bahasa Indonesia",
  ar: "العربية",
  hi: "हिन्दी",
};

const detectBrowserLanguage = (): Language => {
  const browserLang = (navigator.language || navigator.languages?.[0] || DEFAULT_LANGUAGE).toLowerCase();
  if (browserLang.startsWith("ko")) return "ko";
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("zh")) return "zh";
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("fr")) return "fr";
  if (browserLang.startsWith("de")) return "de";
  if (browserLang.startsWith("pt")) return "pt";
  if (browserLang.startsWith("id")) return "id";
  if (browserLang.startsWith("ar")) return "ar";
  if (browserLang.startsWith("hi")) return "hi";
  return "en";
};

const getLanguageFromUrl = (): Language | null => {
  const lang = new URLSearchParams(window.location.search).get("lang");
  if (lang && isSupportedLanguage(lang)) {
    return lang;
  }
  return null;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => undefined,
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const useLanguageState = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    const fromUrl = getLanguageFromUrl();
    if (fromUrl) return fromUrl;

    const saved = localStorage.getItem("econojabis-language");
    if (saved && isSupportedLanguage(saved)) {
      return saved;
    }

    return detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("econojabis-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  useEffect(() => {
    const fromUrl = getLanguageFromUrl();
    if (fromUrl && fromUrl !== language) {
      setLanguageState(fromUrl);
      localStorage.setItem("econojabis-language", fromUrl);
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${baseDictionary.siteName} - ${languageNames[language]}`;
  }, [language]);

  return { language, setLanguage, t };
};
