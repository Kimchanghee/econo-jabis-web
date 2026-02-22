import type { NewsArticle } from '@/data/newsData';
import NewsCard from './NewsCard';

interface NewsListProps {
  articles: NewsArticle[];
  title: string;
}

const NewsList = ({ articles, title }: NewsListProps) => {
  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-lg font-semibold text-muted-foreground">검색 결과가 없습니다</p>
        <p className="mt-1 text-sm text-muted-foreground">다른 키워드로 검색해보세요</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-extrabold text-foreground mb-4">{title}</h2>
      <div className="flex flex-col gap-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
};

export default NewsList;
