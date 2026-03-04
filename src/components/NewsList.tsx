import { Clock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useRef, useEffect } from 'react';
import type { NewsArticle } from '../hooks/useTheNewsApi';

interface NewsListProps {
  articles: NewsArticle[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  lastFetched?: Date | null;
}

// Adsterra 728x90 bar ad via srcdoc iframe
const AdBar728 = ({ uid }: { uid: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const html = '<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;}</style></head><body>'
      + '<script type="text/javascript">atOptions={"key":"cab28a3c8ec96edb306ab13e7af5944b","format":"iframe","height":90,"width":728,"params":{}}</script>'
      + '<script type="text/javascript" src="//highperformanceformat.com/cab28a3c8ec96edb306ab13e7af5944b/invoke.js"></script>'
      + '</body></html>';
    iframe.srcdoc = html;
  }, []);
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}
      onWheel={(e) => { e.stopPropagation(); window.scrollBy(0, e.deltaY); }}>
      <iframe
        ref={ref}
        key={uid}
        title="ad-bar"
        scrolling="no"
        frameBorder="0"
        style={{ width: '728px', maxWidth: '100%', height: '90px', border: 'none', display: 'block' }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
};

const NewsCard = ({ article, locale, breakingLabel }: { article: NewsArticle; locale: string; breakingLabel: string }) => {
  const dateStr = article.publishedAt || (article as any).published_at || article.date;
  const descStr = article.description || (article as any).summary || '';
  const imgSrc = article.imageUrl || (article as any).image_url || '';
  return (
    <Link
      to={`/article/${encodeURIComponent(article.id)}`}
      className="group flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors border-b border-border last:border-0"
    >
      {imgSrc && (
        <div className="flex-shrink-0 w-24 overflow-hidden rounded-md">
          <img
            src={imgSrc}
            alt={article.title}
            className="w-24 h-16 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {article.isBreaking && (
            <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded font-bold">
              {breakingLabel}
            </span>
          )}
          <span className="text-xs text-primary font-semibold">{article.category}</span>
        </div>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {article.title}
        </h3>
        {descStr && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{descStr}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {dateStr
              ? new Date(dateStr).toLocaleString(locale, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </span>
        </div>
      </div>
    </Link>
  );
};

const NewsList = ({ articles, isLoading, error, onRefresh, lastFetched }: NewsListProps) => {
  const { t, language } = useLanguage();
  const nonFeaturedArticles = articles.filter((a) => !a.isFeatured);
  const localeMap: Record<string, string> = {
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
  const locale = localeMap[language] || "en-US";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-foreground">{t('latestNews')}</h2>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              {t('updated')}: {lastFetched.toLocaleTimeString(locale)}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-primary rounded hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
          )}
        </div>
      </div>

      {/* Top bar ad */}
      <div className="flex justify-center my-3 bg-muted/30 rounded-lg py-1.5">
        <AdBar728 uid="newslist-top" />
      </div>

      {error && <div className="text-center py-4 text-destructive text-sm">{error}</div>}

      {isLoading && articles.length === 0 && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-3 animate-pulse">
              <div className="w-24 h-16 bg-muted rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {nonFeaturedArticles.map((article, index) => (
          <div key={article.id}>
            <NewsCard article={article} locale={locale} breakingLabel={t("breaking")} />
            {(index + 1) % 5 === 0 && (
              <div className="flex justify-center py-2 bg-muted/20 border-t border-b border-dashed border-border">
                <AdBar728 uid={`newslist-mid-${index}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {!isLoading && nonFeaturedArticles.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground text-sm">{t('loading')}</div>
      )}
    </div>
  );
};

export default NewsList;
