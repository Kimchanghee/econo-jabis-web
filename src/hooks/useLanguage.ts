import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Language } from "../data/newsData";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "../lib/seo";
import { TRANSLATIONS } from "../i18n/translations.generated";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const languageNames: Record<Language, string> = {
  ko: "Korean",
  en: "English",
  es: "Spanish",
  ja: "Japanese",
  zh: "Chinese",
  fr: "French",
  de: "Deutsch",
  pt: "Portuguese",
  id: "Bahasa Indonesia",
  ar: "Arabic",
  hi: "Hindi",
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

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("econojabis-language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
    },
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${TRANSLATIONS.en.siteName} - ${languageNames[language]}`;
  }, [language]);

  return { language, setLanguage, t };
};
