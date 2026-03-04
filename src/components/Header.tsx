import { useState } from "react";
import { Search, TrendingUp, Menu, X } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryChange?: (category: string) => void;
}

const Header = ({ searchQuery, onSearchChange, onCategoryChange }: HeaderProps) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: "home", label: t("home"), category: "all" },
    { key: "economy", label: t("economy"), category: t("economy") },
    { key: "markets", label: t("markets"), category: t("markets") },
    { key: "realestate", label: t("realestate"), category: t("realestate") },
    { key: "crypto", label: t("crypto"), category: t("crypto") },
  ];

  const handleNavClick = (category: string) => {
    onCategoryChange?.(category);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-14 gap-3">
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => handleNavClick("all")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-foreground leading-none">EconoJabis</h1>
              <span className="text-[9px] font-medium text-muted-foreground tracking-widest uppercase hidden sm:block">
                {t("siteTagline")}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.category)}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={`${t("search")}...`}
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

        <div className="sm:hidden pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`${t("search")}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-full rounded-full border border-border bg-secondary pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-2">
          {navItems.map((item) => (
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
