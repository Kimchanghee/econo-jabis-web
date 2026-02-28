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

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
};

function loadAdsterraIframe(el: HTMLElement, key: string, width: number, height: number) {
  const optScript = document.createElement('script');
  optScript.type = 'text/javascript';
  optScript.text = `window.atOptions = { key: "${key}", format: "iframe", height: ${height}, width: ${width}, params: {} };`;
  el.appendChild(optScript);
  const fake = document.createElement('script');
  fake.type = 'text/javascript';
  el.appendChild(fake);
  const orig = Object.getOwnPropertyDescriptor(Document.prototype, 'currentScript') || Object.getOwnPropertyDescriptor(document, 'currentScript');
  Object.defineProperty(document, 'currentScript', { get() { return fake; }, configurable: true });
  const inv = document.createElement('script');
  inv.async = false;
  inv.setAttribute('data-cfasync', 'false');
  inv.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
  inv.onload = () => {
    setTimeout(() => {
      try { if (orig) Object.defineProperty(document, 'currentScript', orig); } catch (_) {}
    }, 500);
  };
  el.appendChild(inv);
}

const InArticleBarAd = ({ instanceId }: { instanceId: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !ref.current) return;
    loaded.current = true;
    loadAdsterraIframe(ref.current, 'cab28a3c8ec96edb306ab13e7af5944b', 728, 90);
    setTimeout(() => {
      const el = ref.current;
      if (el && el.querySelectorAll('iframe').length === 0) {
        if (wrapRef.current) wrapRef.current.style.display = 'none';
      }
    }, 2000);
  }, []);
  return (
    <div ref={wrapRef} className="my-4 w-full flex justify-center bg-muted/20 rounded-lg py-2 border border-dashed border-border">
      <div ref={ref} data-ad-id={instanceId} style={{ width: '728px', maxWidth: '100%', margin: '0 auto', overflow: 'hidden' }} />
    </div>
  );
};

const NewsCard = ({ article }: { article: NewsArticle }) => {
  const dateStr = article.publishedAt || (article as any).published_at || article.date;
  const descStr = article.description || (article as any).summary || '';
  const imgSrc = article.imageUrl || (article as any).image_url || '';
  return (
    <Link
      to={`/article/${encodeURIComponent(article.id)}`}
      className="group flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors border-b border-border last:border-0"
    >
      <div className="flex-shrink-0 w-24 h-18 overflow-hidden rounded-md">
        <img
          src={imgSrc}
          alt={article.title}
          className="w-24 h-18 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&auto=format&fit=crop';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {article.isBreaking && (
            <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded font-bold">LIVE</span>
          )}
          <span className="text-xs text-primary font-medium">{article.category}</span>
        </div>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {descStr && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{descStr}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{dateStr ? new Date(dateStr).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
          {article.source && <span className="text-primary/70">· {article.source}</span>}
        </div>
      </div>
    </Link>
  );
};

const NewsList = ({ articles, isLoading, error, onRefresh, lastFetched }: NewsListProps) => {
  const { t } = useLanguage();
  const nonFeaturedArticles = articles.filter((a) => !a.isFeatured);

  return (
    <div style={{ overflowY: 'visible' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{t('latestNews')}</h2>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              {t('updated')}: {lastFetched.toLocaleTimeString()}
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
      {error && (
        <div className="text-center py-4 text-destructive text-sm">{error}</div>
      )}
      {isLoading && articles.length === 0 && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-3 animate-pulse">
              <div className="w-24 h-18 bg-muted rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
      <InArticleBarAd instanceId="newslist-top" />
      <div className="space-y-0">
        {nonFeaturedArticles.map((article, index) => (
          <div key={article.id}>
            <NewsCard article={article} />
            {(index + 1) % 5 === 0 && (
              <InArticleBarAd instanceId={`newslist-mid-${index}`} />
            )}
          </div>
        ))}
      </div>
      {!isLoading && nonFeaturedArticles.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t('loading')}
        </div>
      )}
    </div>
  );
};

export default NewsList;
