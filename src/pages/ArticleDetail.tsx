import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Clock, Share2 } from "lucide-react";
import Header from "../components/Header";
import AdBanner from "../components/AdBanner";
import { useTheNewsApi } from "../hooks/useTheNewsApi";
import { FALLBACK_IMAGES } from "../data/newsData";

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { articles } = useTheNewsApi("en");

  const article = articles.find((a) => a.id === decodeURIComponent(id || ""));

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg mb-4">기사를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const dateStr = article.publishedAt || article.date;
  const descStr = article.description || article.summary || "";

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" onSearchChange={() => {}} />

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </button>

        <article>
          {/* Category & Breaking badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {article.category}
            </span>
            {article.isBreaking && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">속보</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4">{article.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{formatDate(dateStr)}</span>
            </div>
            <span className="font-medium text-foreground">{article.source}</span>
            <div className="ml-auto flex items-center gap-3">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
                공유
              </a>
            </div>
          </div>

          {/* Hero image */}
          <div className="rounded-xl overflow-hidden mb-6">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full aspect-video object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = FALLBACK_IMAGES[article.category] || FALLBACK_IMAGES["전체"];
              }}
            />
          </div>

          {/* Ad */}
          <div className="mb-6 flex justify-center">
            <AdBanner slotType="in-article" />
          </div>

          {/* Article body */}
          <div className="prose prose-neutral max-w-none">
            <p className="text-base sm:text-lg leading-relaxed text-foreground/90">{descStr}</p>
            {article.summary && article.summary !== descStr && (
              <p className="text-base leading-relaxed text-foreground/80 mt-4">{article.summary}</p>
            )}
          </div>

          {/* Original link CTA */}
          <div className="mt-8 p-4 rounded-xl border border-border bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground mb-3">전체 기사를 원문에서 읽어보세요</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              원문 기사 보기 <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Bottom Ad */}
          <div className="mt-8 flex justify-center">
            <AdBanner slotType="footer" />
          </div>
        </article>
      </main>
    </div>
  );
};

export default ArticleDetail;
