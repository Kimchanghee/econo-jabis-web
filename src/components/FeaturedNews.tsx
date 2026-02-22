import { Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import AdBanner from './AdBanner';
import type { NewsArticle } from '../data/newsData';

interface FeaturedNewsProps {
  articles: NewsArticle[];
}

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
};

const FeaturedNews = ({ articles }: FeaturedNewsProps) => {
  const { t } = useLanguage();

  if (!articles || articles.length === 0) {
    return (
      <section className="mb-8">
        <div className="text-center py-12 text-gray-500">{t('loading')}</div>
      </section>
    );
  }

  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);
  const dateStr = mainArticle.publishedAt || mainArticle.date;
  const descStr = mainArticle.description || mainArticle.summary || '';

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main featured article */}
        <div className="lg:col-span-2">
          <a
            href={mainArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative overflow-hidden rounded-xl bg-gray-900 aspect-video"
          >
            <img
              src={mainArticle.imageUrl}
              alt={mainArticle.title}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://source.unsplash.com/800x450/?economy';
              }}
            />

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
              {descStr && (
                <p className="text-white/70 text-sm line-clamp-2 hidden sm:block">
                  {descStr}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
                <Clock className="h-3 w-3" />
                <span>{formatDate(dateStr)}</span>
                <span>{mainArticle.source}</span>
                <ExternalLink className="h-3 w-3 ml-auto" />
              </div>
            </div>
          </a>
        </div>

        {/* Secondary articles + Ad */}
        <div className="flex flex-col gap-3">
          {secondaryArticles.map((article) => {
            const articleDate = article.publishedAt || article.date;
            const articleDesc = article.description || article.summary || '';
            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-20 h-16 overflow-hidden rounded-md">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
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
                  {articleDesc && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{articleDesc}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(articleDate)}</span>
                  </div>
                </div>
              </a>
            );
          })}

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