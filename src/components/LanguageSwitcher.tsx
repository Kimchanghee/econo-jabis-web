import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../data/newsData';

interface LangOption {
  code: Language;
  name: string;
  flag: string;
  nativeName: string;
}

const LANGUAGES: LangOption[] = [
  { code: 'ko', name: 'Korean', flag: 'kr', nativeName: 'Korean' },
  { code: 'en', name: 'English', flag: 'us', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: 'es', nativeName: 'Espanol' },
  { code: 'ja', name: 'Japanese', flag: 'jp', nativeName: 'Japanese' },
  { code: 'zh', name: 'Chinese', flag: 'cn', nativeName: 'Chinese' },
];

const flagEmoji: Record<string, string> = {
  kr: 'KR',
  us: 'EN',
  es: 'ES',
  jp: 'JP',
  cn: 'ZH',
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

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
        aria-label="Switch language"
      >
        <span className="text-xs font-bold">{flagEmoji[currentLang.flag]}</span>
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                language === lang.code ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-xs font-bold w-6">{flagEmoji[lang.flag]}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;