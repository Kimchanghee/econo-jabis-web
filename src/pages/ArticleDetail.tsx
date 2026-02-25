import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Share2, ExternalLink } from "lucide-react";
import Header from "../components/Header";
import { NewsArticle } from "../data/newsData";
import SEOHead from "../components/SEOHead";

const ARTICLE_STORE_KEY = "econojabis_articles_v1";

export const saveArticlesToStore = (articles: NewsArticle[]) => {
  try {
    localStorage.setItem(ARTICLE_STORE_KEY, JSON.stringify(articles));
  } catch {}
};

const getArticleFromStore = (id: string): NewsArticle | null => {
  try {
    const raw = localStorage.getItem(ARTICLE_STORE_KEY);
    if (!raw) return null;
    const all: NewsArticle[] = JSON.parse(raw);
    return all.find((a) => a.id === decodeURIComponent(id)) || null;
  } catch {
    return null;
  }
};

const formatDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
};

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = id ? getArticleFromStore(id) : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg mb-4">{"기사를 찾을 수 없습니다."}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {"홈으로"}
          </button>
        </div>
      </div>
    );
  }

  const body = [article.description, article.summary]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join("\n\n");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={article.title}
        description={article.description || article.summary || ""}
        ogImage={article.imageUrl}
        article={{
          title: article.title,
          description: article.description || article.summary || "",
          publishedAt: article.publishedAt || new Date().toISOString(),
          category: article.category || "",
          source: article.source || "EconoJabis",
          image: article.imageUrl,
        }}
      />
      <Header searchQuery="" onSearchChange={() => {}} />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-8 items-start">
          <main className="flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {"뒤로가기"}
            </button>

            <article>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                  {article.category}
                </span>
                {article.isBreaking && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white">{"속보"}</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 text-foreground">{article.title}</h1>

              <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{article.source}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(article.publishedAt || article.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {"원문"}
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: article.title,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    {"공유"}
                  </button>
                </div>
              </div>

              {article.imageUrl && (
                <div className="mb-6 overflow-hidden rounded-xl">
                  <img src={article.imageUrl} alt={article.title} className="w-full object-cover" />
                </div>
              )}

              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {body.split("\n").map((p, i) => (
                  <p key={i} className="mb-4 text-base leading-relaxed text-foreground/90">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {"목록으로"}
                  </button>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {"원문 보기"}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          </main>
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-5">
            <div className="bg-muted rounded-xl border border-border p-4 text-center min-h-[120px] flex items-center justify-center">
              <p className="text-xs text-muted-foreground">광고</p>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <span className="text-orange-500 text-sm font-bold">🔥</span>
                <h3 className="font-bold text-sm">급상승 검색어</h3>
              </div>
              <ul className="divide-y divide-border">
                <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <span className="text-sm font-bold w-5 text-orange-500">1</span>
                  <span className="text-sm">반도체</span>
                  <span className="ml-auto text-xs font-bold text-red-500">NEW</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <span className="text-sm font-bold w-5 text-orange-500">2</span>
                  <span className="text-sm">코스피</span>
                  <span className="ml-auto text-xs font-bold text-red-500">NEW</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <span className="text-sm font-bold w-5 text-orange-500">3</span>
                  <span className="text-sm">금리</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <span className="text-sm font-bold w-5 text-muted-foreground">4</span>
                  <span className="text-sm">AI</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <span className="text-sm font-bold w-5 text-muted-foreground">5</span>
                  <span className="text-sm">비트코인</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <span className="text-sm font-bold w-5 text-muted-foreground">6</span>
                  <span className="text-sm">환율</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <span className="text-sm font-bold w-5 text-muted-foreground">7</span>
                  <span className="text-sm">삼성전자</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <span className="text-sm font-bold w-5 text-muted-foreground">8</span>
                  <span className="text-sm">아파트</span>
                </li>
              </ul>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">최신 뉴스</h3>
                <button onClick={() => navigate("/")} className="text-xs text-primary hover:underline">
                  더보기
                </button>
              </div>
              <div className="p-3 text-sm text-muted-foreground text-center py-6">뉴스를 불러오는 중...</div>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">카테고리</h3>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                >
                  경제
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                >
                  시장
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                >
                  부동산
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                >
                  암호화폐
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                >
                  주식
                </button>
              </div>
            </div>
            <div className="bg-muted rounded-xl border border-border p-4 text-center min-h-[200px] flex items-center justify-center">
              <p className="text-xs text-muted-foreground">광고</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
