import type { NewsArticle } from '@/data/newsData';
import CategoryBadge from './CategoryBadge';

const NewsCard = ({ article }: { article: NewsArticle }) => {
  return (
    <article className="group flex gap-4 rounded-xl border border-border bg-card p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CategoryBadge category={article.category} />
          {article.isBreaking && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
              속보
            </span>
          )}
        </div>
        <h3 className="mt-2 text-sm sm:text-base font-bold text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 hidden sm:block">
          {article.summary}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{article.source}</span>
          <span>·</span>
          <span>{article.date}</span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
