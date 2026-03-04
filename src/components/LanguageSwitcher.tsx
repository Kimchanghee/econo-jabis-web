import { useMemo, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import type { Language } from "../data/newsData";

interface LangOption {
  code: Language;
  flag: string;
}

const LANGUAGES: LangOption[] = [
  { code: "ko", flag: "kr" },
  { code: "en", flag: "us" },
  { code: "es", flag: "es" },
  { code: "ja", flag: "jp" },
  { code: "zh", flag: "cn" },
  { code: "fr", flag: "fr" },
  { code: "de", flag: "de" },
  { code: "pt", flag: "br" },
  { code: "id", flag: "id" },
  { code: "ar", flag: "sa" },
  { code: "hi", flag: "in" },
];

const flagLabel: Record<string, string> = {
  kr: "KO",
  us: "EN",
  es: "ES",
  jp: "JA",
  cn: "ZH",
  fr: "FR",
  de: "DE",
  br: "PT",
  id: "ID",
  sa: "AR",
  in: "HI",
};

const LOCALE_MAP: Record<Language, string> = {
  ko: "ko-KR",
  en: "en-US",
  es: "es-ES",
  ja: "ja-JP",
  zh: "zh-CN",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  id: "id-ID",
  ar: "ar-SA",
  hi: "hi-IN",
};

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const displayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([LOCALE_MAP[language] || "en-US"], { type: "language" });
    } catch {
      return null;
    }
  }, [language]);

  const getLocalizedName = (code: Language) => {
    return displayNames?.of(code) || code.toUpperCase();
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700"
        aria-label={t("switchLanguage")}
      >
        <span className="text-xs font-bold">{flagLabel[currentLang.flag]}</span>
        <span className="hidden sm:inline">{getLocalizedName(currentLang.code)}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-72 overflow-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                language === lang.code ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
              }`}
            >
              <span className="text-xs font-bold w-8">{flagLabel[lang.flag]}</span>
              <span>{getLocalizedName(lang.code)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
