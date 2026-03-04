import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "../components/SEOHead";
import AdBanner from "../components/AdBanner";
import { useLanguage } from "../hooks/useLanguage";

const NotFound = () => {
  const location = useLocation();
  const { language, t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-muted">
      <SEOHead
        title={t("notFoundTitle")}
        description={t("notFoundDescription")}
        canonicalUrl={window.location.href}
        language={language}
        noindex
      />
      <div className="w-full flex justify-center items-center bg-card border-b border-border py-2" style={{ minHeight: 94 }}>
        <AdBanner slotType="header" uid="not-found-top" />
      </div>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">{t("notFoundMessage")}</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            {t("returnHome")}
          </a>
        </div>
      </div>
      <div className="w-full flex justify-center items-center bg-card border-t border-border py-2" style={{ minHeight: 94 }}>
        <AdBanner slotType="footer" uid="not-found-bottom" />
      </div>
    </div>
  );
};

export default NotFound;
