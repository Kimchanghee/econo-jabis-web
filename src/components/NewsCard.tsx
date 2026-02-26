import { Link } from "react-router-dom";
import type { NewsArticle } from '../hooks/useTheNewsApi';
import CategoryBadge from "./CategoryBadge";

const NewsCard = ({ article }: { article: NewsArticle }) => {
  return (
    <Link
      to={`/article/${encodeURIComponent(article.id)}`}
      className="group block rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CategoryBadge category={article.category} />
          {article.isBreaking && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">속보</span>
          )}
        </div>
        <h3 className="mt-2 text-sm sm:text-base font-bold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          
          
          <span>{article.date}</span>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
