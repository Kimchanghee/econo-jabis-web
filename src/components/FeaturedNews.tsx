import { Clock, TrendingUp, ExternalLink } from 'lucide-react';
import type { NewsArticle } from '../data/newsData';
import { useLanguage } from '../hooks/useLanguage';
import AdBanner from './AdBanner';

interface FeaturedNewsProps {
  articles: NewsArticle[];
}

const getDate = (article: NewsArticle): string =>
  (article as NewsArticle & { publishedAt?: string; date?: string }).publishedAt ||
  (article as NewsArticle & { date?: string }).date ||
  '';

const FeaturedNews = ({ articles }: FeaturedNewsProps) => {
  const { t } = useLanguage();
  const featuredArticles = articles.filter(a => a.isFeatured).slice(0, 3);

  if (featuredArticles.length === 0) return null;

  const mainArticle = featuredArticles[0];
  const secondaryArticles = featuredArticles.slice(1, 3);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
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
    <section className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">{t('featured')}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main featured article */}
        <div className="lg:col-span-2">
          <a
            href={mainArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
          >
            <div className="relative h-56 sm:h-72 overflow-hidden bg-muted">
              <img
                src={mainArticle.imageUrl}
                alt={mainArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://source.unsplash.com/800x450/?finance,economy';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {mainArticle.isBreaking && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                    {t('breaking')}
                  </span>
                )}
                <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
                  {mainArticle.category}
                </span>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-primary-foreground line-clamp-2">
                  {mainArticle.title}
                </h3>
                {(mainArticle as NewsArticle & { description?: string; summary?: string }).description || (mainArticle as NewsArticle & { summary?: string }).summary ? (
                  <p className="text-white/70 text-sm line-clamp-2 hidden sm:block">
                    {(mainArticle as NewsArticle & { description?: string; summary?: string }).description || (mainArticle as NewsArticle & { summary?: string }).summary}
                  </p>
                ) : null}
                <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(getDate(mainArticle))}
                  </span>
                  {mainArticle.source && <span>{mainArticle.source}</span>}
                  <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Secondary featured articles */}
        <div className="flex flex-col gap-4">
          {secondaryArticles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200 hover:border-primary/30"
            >
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://source.unsplash.com/400x300/?economy';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-primary font-medium">{article.category}</span>
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mt-0.5">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(getDate(article))}</span>
                </div>
              </div>
            </a>
          ))}

          {/* Ad below featured secondary articles */}
          <AdBanner slotType="sidebar" className="mt-2" />
        </div>
      </div>

      {/* Ad banner below featured section */}
      <div className="mt-4 flex justify-center">
        <AdBanner slotType="footer" />
      </div>
    </section>
  );
};

export default FeaturedNews;}