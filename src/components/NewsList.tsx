import { Clock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import AdBanner from './AdBanner';
import type { NewsArticle } from '../data/newsData';

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

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard = ({ article }: NewsCardProps) => {
  const dateStr = article.publishedAt || article.date;
  const descStr = article.description || article.summary || '';

  return (
    <Link
      to={`/article/${article.id}`}
      className="group flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      <div className="flex-shrink-0 w-24 h-18 overflow-hidden rounded-md">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-24 h-18 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://source.unsplash.com/200x150/?finance';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {article.isBreaking && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">LIVE</span>
          )}
          <span className="text-xs text-primary font-medium">{article.category}</span>
        </div>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {descStr && (
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">{descStr}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(dateStr)}</span>
          <span className="text-gray-400">|</span>
          <span>{article.source}</span>
        </div>
      </div>
    </Link>
  );
};

const NewsList = ({ articles, isLoading, error, onRefresh, lastFetched }: NewsListProps) => {
  const { t } = useLanguage();

  const nonFeaturedArticles = articles.filter((a) => !a.isFeatured);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{t('latestNews')}</h2>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-gray-400">
              {t('updated')}: {lastFetched.toLocaleTimeString()}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-primary rounded hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-4 text-red-500 text-sm">{error}</div>
      )}

      {/* Loading state */}
      {isLoading && articles.length === 0 && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-3 animate-pulse">
              <div className="w-24 h-16 bg-gray-200 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
};

export default NewsList;