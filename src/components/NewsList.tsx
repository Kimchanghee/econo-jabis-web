import { Clock, ExternalLink, RefreshCw } from 'lucide-react';
import type { NewsArticle } from '../data/newsData';
import { useLanguage } from '../hooks/useLanguage';
import AdBanner from './AdBanner';

interface NewsListProps {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
  lastFetched?: Date | null;
}

const NewsCard = ({ article }: { article: NewsArticle }) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200"
    >
      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://source.unsplash.com/400x300/?business,economy';
          }}
        />
        {article.isBreaking && (
          <div className="absolute top-1 left-1">
            <span className="bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none">
              속보
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <span className="text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
            {article.category}
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mt-1.5 leading-snug">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1 hidden sm:block">
            {article.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(article.publishedAt)}</span>
          {article.source && (
            <>
              <span>·</span>
              <span className="truncate max-w-[100px]">{article.source}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
};

const NewsList = ({ articles, isLoading, error, onRefresh, lastFetched }: NewsListProps) => {
  const { t } = useLanguage();

  const nonFeaturedArticles = articles.filter(a => !a.isFeatured);

  if (isLoading && articles.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{t('latest')}</h2>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg border border-border bg-card animate-pulse">
            <div className="h-20 w-28 flex-shrink-0 rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-4/5" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm mb-3">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 mx-auto text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('refresh')}
          </button>
        )}
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">{t('latest')}</h2>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              {t('lastUpdated')}: {lastFetched.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
              title={t('refresh')}
            >
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Top in-article ad */}
      <div className="mb-4 flex justify-center">
        <AdBanner slotType="in-article" />
      </div>

      <div className="space-y-3">
        {nonFeaturedArticles.map((article, index) => (
          <div key={article.id}>
            <NewsCard article={article} />
            {/* Insert ad after every 5th article */}
            {(index + 1) % 5 === 0 && (
              <div className="my-4 flex justify-center">
                <AdBanner slotType="in-article" />
              </div>
            )}
          </div>
        ))}
      </div>

      {nonFeaturedArticles.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t('error')}
        </div>
      )}
    </section>
  );
};

export default NewsList;))))