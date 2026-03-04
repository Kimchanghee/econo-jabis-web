import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../hooks/useLanguage";

const NotFound = () => {
  const location = useLocation();
  const { language, t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEOHead
        title={t("notFoundTitle")}
        description={t("notFoundDescription")}
        canonicalUrl={window.location.href}
        language={language}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFoundMessage")}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t("returnHome")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
