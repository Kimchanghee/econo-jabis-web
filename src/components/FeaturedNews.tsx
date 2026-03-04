import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import AdBanner from "./AdBanner";
import type { NewsArticle } from "../hooks/useTheNewsApi";
import { prefetchArticleDetailPage } from "../lib/prefetch";

interface FeaturedNewsProps {
  articles: NewsArticle[];
}

const LOCALE_BY_LANGUAGE: Record<string, string> = {
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

const formatDate = (dateStr: string, language: string): string => {
  try {
    const locale = LOCALE_BY_LANGUAGE[language] || LOCALE_BY_LANGUAGE.en;
    return new Date(dateStr).toLocaleDateString(locale);
  } catch {
    return dateStr;
  }
};

const FeaturedNews = ({ articles }: FeaturedNewsProps) => {
  const { t, language } = useLanguage();

  if (!articles || articles.length === 0) {
    return (
      <section className="mb-2">
        <div className="text-center py-12 text-muted-foreground">{t("loading")}</div>
      </section>
    );
  }

  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);
  const dateStr = mainArticle.publishedAt || mainArticle.date;
  const descStr = mainArticle.description || mainArticle.summary || "";

  return (
    <section className="mb-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main featured article */}
        <div className="lg:col-span-2">
          <Link
            to={`/article/${encodeURIComponent(mainArticle.id)}`}
            state={{ article: mainArticle }}
            onMouseEnter={prefetchArticleDetailPage}
            onFocus={prefetchArticleDetailPage}
            onTouchStart={prefetchArticleDetailPage}
            className="group block relative overflow-hidden rounded-xl bg-foreground/90 aspect-video"
          >
            <img
              src={mainArticle.imageUrl}
              alt={mainArticle.title}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop";
              }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {mainArticle.isBreaking && (
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                  {t("breaking")}
                </span>
              )}
              <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
                {mainArticle.category}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2">{mainArticle.title}</h3>
              {descStr && <p className="text-white/70 text-sm line-clamp-2 hidden sm:block">{descStr}</p>}
              <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
                <Clock className="h-3 w-3" />
                <span>{formatDate(dateStr, language)}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary articles + Ad */}
        <div className="flex flex-col gap-3">
          {secondaryArticles.map((article) => {
            const articleDate = article.publishedAt || article.date;
            const articleDesc = article.description || article.summary || "";
            return (
              <Link
                key={article.id}
                to={`/article/${encodeURIComponent(article.id)}`}
                state={{ article }}
                onMouseEnter={prefetchArticleDetailPage}
                onFocus={prefetchArticleDetailPage}
                onTouchStart={prefetchArticleDetailPage}
                className="group flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-shrink-0 w-20 h-16 overflow-hidden rounded-md">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-primary font-medium">{article.category}</span>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mt-0.5">
                    {article.title}
                  </h3>
                  {articleDesc && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{articleDesc}</p>}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(articleDate, language)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          <AdBanner slotType="sidebar" className="mt-2" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;
