import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import Header from "../components/Header";
import { NewsArticle } from "../data/newsData";

const ARTICLE_STORE_KEY = "econojabis_articles_v1";

export const saveArticlesToStore = (articles: NewsArticle[]) => {
    try { localStorage.setItem(ARTICLE_STORE_KEY, JSON.stringify(articles)); } catch {}
};

const getArticleFromStore = (id: string): NewsArticle | null => {
    try {
          const raw = localStorage.getItem(ARTICLE_STORE_KEY);
          if (!raw) return null;
          const all: NewsArticle[] = JSON.parse(raw);
          return all.find((a) => a.id === decodeURIComponent(id)) || null;
    } catch { return null; }
};

const fmt = (s: string) => {
    try { return new Date(s).toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" }); }
    catch { return s; }
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
                                    <p className="text-muted-foreground text-lg mb-4">기사를 찾을 수 없습니다.</p>p>
                                    <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
                                                <ArrowLeft className="h-4 w-4" /> 홈으로
                                    </button>button>
                          </div>div>
                  </div>div>
                );
    }
  
    const body = [article.description, article.summary]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join("\n\n");
  
    return (
          <div className="min-h-screen bg-background">
                <Header searchQuery="" onSearchChange={() => {}} />
                <main className="mx-auto max-w-3xl px-4 py-6">
                        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
                                  <ArrowLeft className="h-4 w-4" /> 뒤로가기
                        </button>button>
                        <article>
                                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{article.category}</span>span>
                                    {article.isBreaking && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">속보</span>span>}
                                  </div>div>
                                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 text-foreground">{article.title}</h1>h1>
                                  <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground flex-wrap gap-2">
                                              <div className="flex items-center gap-3">
                                                            <span className="font-medium text-foreground">{article.source}</span>span>
                                                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{fmt(article.publishedAt || article.date)}</span>span>
                                              </div>div>
                                              <button onClick={() => navigator.share ? navigator.share({ title: article.title }) : navigator.clipboard?.writeText(window.location.href)} className="inline-flex items-center gap-1 hover:text-foreground">
                                                            <Share2 className="h-4 w-4" /> 공유
                                              </button>button>
                                  </div>div>
                          {article.imageUrl && (
                        <img src={article.imageUrl} alt={article.title} className="w-full rounded-xl object-cover mb-6 max-h-96" onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
                      )}
                                  <div className="text-base leading-relaxed text-foreground space-y-4">
                                    {body.split("\n\n").map((p, i) => <p key={i}>{p}</p>p>)}
                                  </div>div>
                        </article>article>
                </main>main>
          </div>div>
        );
};

export default ArticleDetail;