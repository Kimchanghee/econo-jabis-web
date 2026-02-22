import type { NewsArticle } from '@/data/newsData';
import CategoryBadge from './CategoryBadge';

interface FeaturedNewsProps {
  articles: NewsArticle[];
}

const FeaturedNews = ({ articles }: FeaturedNewsProps) => {
  if (articles.length === 0) return null;
  const [main, ...side] = articles.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Main featured */}
      <div className="lg:col-span-3 group relative overflow-hidden rounded-2xl bg-primary p-6 sm:p-8 flex flex-col justify-end min-h-[280px] cursor-pointer transition-shadow hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40" />
        <div className="relative z-10">
          {main.isBreaking && (
            <span className="inline-block mb-3 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-accent-foreground uppercase tracking-wider animate-pulse">
              속보
            </span>
          )}
          <CategoryBadge category={main.category} />
          <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-primary-foreground leading-tight">
            {main.title}
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/70 line-clamp-2">
            {main.summary}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-primary-foreground/50">
            <span>{main.source}</span>
            <span>·</span>
            <span>{main.date}</span>
          </div>
        </div>
      </div>

      {/* Side featured */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {side.map((article) => (
          <div
            key={article.id}
            className="group flex-1 rounded-2xl border border-border bg-card p-5 cursor-pointer transition-all hover:shadow-lg hover:border-primary/20"
          >
            <CategoryBadge category={article.category} />
            <h3 className="mt-2 text-base font-bold text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
              {article.summary}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{article.source}</span>
              <span>·</span>
              <span>{article.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedNews;
