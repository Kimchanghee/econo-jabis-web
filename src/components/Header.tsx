import { useState } from 'react';
import { Search, TrendingUp, Menu, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryChange?: (category: string) => void;
}

const Header = ({ searchQuery, onSearchChange, onCategoryChange }: HeaderProps) => {
  const { t, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const normalizedLang = language.toLowerCase().split("-")[0];
  const navCategoryMap: Record<string, { economy: string; markets: string; realestate: string; crypto: string }> = {
    ko: { economy: "거시경제", markets: "주식", realestate: "부동산", crypto: "암호화폐" },
    en: { economy: "Macro Economy", markets: "Stocks", realestate: "Real Estate", crypto: "Crypto" },
    es: { economy: "Macroeconomía", markets: "Acciones", realestate: "Inmobiliario", crypto: "Cripto" },
    ja: { economy: "マクロ経済", markets: "株式", realestate: "不動産", crypto: "暗号資産" },
    zh: { economy: "宏观经济", markets: "股票", realestate: "房地产", crypto: "加密货币" },
    fr: { economy: "Macroéconomie", markets: "Actions", realestate: "Immobilier", crypto: "Crypto" },
    de: { economy: "Makroökonomie", markets: "Aktien", realestate: "Immobilien", crypto: "Krypto" },
    pt: { economy: "Macroeconomia", markets: "Ações", realestate: "Imobiliário", crypto: "Cripto" },
    id: { economy: "Makroekonomi", markets: "Saham", realestate: "Properti", crypto: "Kripto" },
    ar: { economy: "اقتصاد كلي", markets: "أسهم", realestate: "عقارات", crypto: "عملات رقمية" },
    hi: { economy: "व्यापक अर्थव्यवस्था", markets: "शेयर", realestate: "रियल एस्टेट", crypto: "क्रिप्टो" },
  };
  const navCategory = navCategoryMap[normalizedLang] || navCategoryMap.en;

  const navItems = [
    { key: 'home', label: t('home'), category: 'all' },
    { key: 'economy', label: t('economy'), category: navCategory.economy },
    { key: 'markets', label: t('markets'), category: navCategory.markets },
    { key: 'realestate', label: t('realestate'), category: navCategory.realestate },
    { key: 'crypto', label: t('crypto'), category: navCategory.crypto },
  ];

  const handleNavClick = (category: string) => {
    onCategoryChange?.(category);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => handleNavClick('all')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-foreground leading-none">
                EconoJabis
              </h1>
              <span className="text-[9px] font-medium text-muted-foreground tracking-widest uppercase hidden sm:block">
                {t('siteTagline')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.category)}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={`${t('search')}...`}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 w-44 rounded-full border border-border bg-secondary pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:w-56 transition-all"
              />
            </div>
            <LanguageSwitcher />
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`${t('search')}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-full rounded-full border border-border bg-secondary pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-2">
          {navItems.map(item => (
            <button
              key={item.key}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => handleNavClick(item.category)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
