import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../hooks/useLanguage";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const copy = language === "ko"
    ? {
        title: "404 페이지를 찾을 수 없습니다",
        desc: "요청하신 페이지를 찾을 수 없습니다.",
        message: "페이지를 찾을 수 없습니다.",
        back: "홈으로 돌아가기",
      }
    : {
        title: "404 Not Found",
        desc: "The requested page could not be found.",
        message: "Oops! Page not found",
        back: "Return to Home",
      };

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEOHead
        title={copy.title}
        description={copy.desc}
        canonicalUrl={window.location.href}
        language={language}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{copy.message}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {copy.back}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
