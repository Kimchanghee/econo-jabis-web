import { Link } from "react-router-dom";
import AdBanner from "./AdBanner";
import { useLanguage } from "../hooks/useLanguage";

const Footer = () => {
  const { t, language } = useLanguage();
  const dataSourceLine = language === "ko"
    ? "뉴스: RSS | 시세: Binance, Yahoo Finance | 환율: open.er-api.com"
    : "News: RSS | Market Data: Binance, Yahoo Finance | FX: open.er-api.com";

  return (
    <footer className="mt-12 border-t border-border bg-card">
      {/* Footer Ad */}
      <div className="py-3 flex justify-center border-b border-border">
        <AdBanner slotType="footer" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-foreground font-semibold mb-3">EconoJabis</h3>
            <p className="text-sm text-muted-foreground">{t("footerDescription")}</p>
          </div>
          <div>
            <h3 className="text-foreground font-semibold mb-3">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">{t("home")}</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t("about")}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">{t("contact")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-foreground font-semibold mb-3">{t("legalInfo")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">{t("privacyPolicy")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EconoJabis. {t("copyrightNotice")}</p>
          <p className="mt-1">{t("newsCopyrightNotice")}</p>
          <p className="mt-1">{dataSourceLine}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
