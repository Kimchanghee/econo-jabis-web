import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Share2, Link, Twitter, ChevronRight, BookOpen, Tag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import SEOHead from "../components/SEOHead";
import { FALLBACK_ARTICLES, type NewsArticle } from "../hooks/useTheNewsApi";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";

const ARTICLE_STORE_KEY = "econojabis_articles_v1";

export const saveArticlesToStore = (articles: NewsArticle[]) => {
  try { localStorage.setItem(ARTICLE_STORE_KEY, JSON.stringify(articles)); } catch {}
};

const getArticleFromStore = (id: string): NewsArticle | null => {
  try {
    const decoded = decodeURIComponent(id);
    const raw = localStorage.getItem(ARTICLE_STORE_KEY);
    if (!raw) {
      return FALLBACK_ARTICLES.find((a) => a.id === decoded) || null;
    }
    const all: NewsArticle[] = JSON.parse(raw);
    return all.find((a) => a.id === decoded) || FALLBACK_ARTICLES.find((a) => a.id === decoded) || null;
  } catch {
    return null;
  }
};

const getAllArticlesFromStore = (): NewsArticle[] => {
  try {
    const raw = localStorage.getItem(ARTICLE_STORE_KEY);
    if (!raw) return FALLBACK_ARTICLES;
    const saved: NewsArticle[] = JSON.parse(raw);
    const byId = new Map(saved.map((article) => [article.id, article]));
    FALLBACK_ARTICLES.forEach((article) => {
      if (!byId.has(article.id)) byId.set(article.id, article);
    });
    return Array.from(byId.values());
  } catch {
    return FALLBACK_ARTICLES;
  }
};

const fmtDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return s; }
};

const Ad728x90 = ({ uid }: { uid: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    iframe.srcdoc =
      '<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>' +
      '<script type="text/javascript">atOptions={"key":"cab28a3c8ec96edb306ab13e7af5944b","format":"iframe","height":90,"width":728,"params":{}}<\/script>' +
      '<script type="text/javascript" src="//highperformanceformat.com/cab28a3c8ec96edb306ab13e7af5944b/invoke.js"><\/script>' +
      '</body></html>';
  }, []);
  return (
    <div style={{ position: "relative", overflow: "hidden" }}
      onWheel={(e) => { e.stopPropagation(); window.scrollBy(0, e.deltaY); }}>
      <iframe ref={ref} key={uid} title={"ad-" + uid} scrolling="no" frameBorder="0"
        style={{ width: "728px", maxWidth: "100%", height: "90px", border: "none", display: "block" }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
    </div>
  );
};

const Ad300x250 = ({ uid }: { uid: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    iframe.srcdoc =
      '<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>' +
      '<script type="text/javascript">atOptions={"key":"333406d0aacce2e565463f8c1d21d1bd","format":"iframe","height":250,"width":300,"params":{}}<\/script>' +
      '<script type="text/javascript" src="//highperformanceformat.com/333406d0aacce2e565463f8c1d21d1bd/invoke.js"><\/script>' +
      '</body></html>';
  }, []);
  return (
    <div style={{ position: "relative", overflow: "hidden" }}
      onWheel={(e) => { e.stopPropagation(); window.scrollBy(0, e.deltaY); }}>
      <iframe ref={ref} key={uid} title={"ad-" + uid} scrolling="no" frameBorder="0"
        style={{ width: "300px", height: "250px", border: "none", display: "block" }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
    </div>
  );
};

const AdNative = () => {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !ref.current) return;
    loaded.current = true;
    const c = document.createElement("div");
    c.id = "container-native-" + Date.now();
    ref.current.appendChild(c);
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = "https://pl28800200.effectivegatecpm.com/ea5bbfe829e07e03a26eddac6389273b/invoke.js";
    ref.current.appendChild(s);
  }, []);
  return <div ref={ref} className="w-full min-h-[90px]" />;
};

const buildBody = (article: NewsArticle): string[] => {
  const bp = (article as any).bodyParagraphs as string[] | undefined;
  if (bp && bp.length >= 3) return bp;
  const fullBody = (article as any).fullBody as string | undefined;
  if (fullBody && fullBody.length > 300) {
    const parts = fullBody.split(/\n\n+/).map((p: string) => p.trim()).filter((p: string) => p.length > 20);
    if (parts.length >= 3) return parts;
  }
  const raw = [article.description || "", (article as any).summary || ""].join(" ").trim();
  if (!raw) return ["기사 내용을 불러오는 중입니다."];
  const clean = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const sents = clean.match(/[^.!?]+[.!?]*/g) || [clean];
  const out: string[] = [];
  for (let i = 0; i < sents.length; i += 3) {
    const p = sents.slice(i, i + 3).join(" ").trim();
    if (p.length > 20) out.push(p);
  }
  if (out.join("").length < 200) {
    return ["기사 내용을 불러오는 중입니다."];
  }
  return out;
};

const RelatedCard = ({ article, onClick }: { article: NewsArticle; onClick: () => void }) => {
  const img = (article as any).imageUrl || (article as any).image || "";
  return (
    <div onClick={onClick} className="flex gap-3 p-3 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all group">
      {img && (
        <img src={img} alt={article.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0 group-hover:opacity-90"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-primary mb-0.5 block">{article.category}</span>
        <h3 className="text-sm font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">{article.title}</h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{fmtDate(article.publishedAt || (article as any).date || "")}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground self-center opacity-0 group-hover:opacity-100 flex-shrink-0" />
    </div>
  );
};

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const article = id ? getArticleFromStore(id) : null;
  const [imageUrl, setImageUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readPct, setReadPct] = useState(0);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!articleRef.current) return;
      const el = articleRef.current;
      const scrolled = Math.max(0, -(el.getBoundingClientRect().top) + window.innerHeight * 0.4);
      setReadPct(Math.min(100, Math.round((scrolled / el.offsetHeight) * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!article) return;
    setImageUrl((article as any).imageUrl || (article as any).image || "");
    setImgError(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [article]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };
  const tweetShare = () => {
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(article?.title || "") + "&url=" + encodeURIComponent(window.location.href), "_blank", "width=600,height=400");
  };

  if (!article) {
    const fallbackCanonical = buildPageUrl(`/article/${encodeURIComponent(id || "unknown")}`, {
      lang: language === DEFAULT_LANGUAGE ? undefined : language,
    });
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Article Not Found"
          description="The requested article could not be found."
          canonicalUrl={fallbackCanonical}
          language={language}
          noindex
        />
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-6">기사를 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <ArrowLeft className="h-4 w-4" /> 홈
          </button>
        </div>
      </div>
    );
  }

  const body = buildBody(article);
  const all = getAllArticlesFromStore();
  const related = all.filter(a => a.id !== article.id && a.category === article.category).slice(0, 6);
  const more = all.filter(a => a.id !== article.id && a.category !== article.category).slice(0, 4);
  const canonicalUrl = buildPageUrl(`/article/${encodeURIComponent(article.id)}`, {
    lang: language === DEFAULT_LANGUAGE ? undefined : language,
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={article.title}
        description={(article.description || (article as any).summary || "").slice(0, 160)}
        canonicalUrl={canonicalUrl}
        language={language}
        ogImage={imageUrl}
        keywords={[
          ...(article.keywords || "")
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean),
          article.category,
          article.source,
        ]}
        article={{
          title: article.title,
          description: article.description || "",
          publishedAt: article.publishedAt || new Date().toISOString(),
          modifiedAt: article.publishedAt || new Date().toISOString(),
          category: article.category || "",
          source: article.source || "EconoJabis",
          author: article.source || "EconoJabis",
          image: imageUrl,
        }}
      />
      <div className="fixed top-0 left-0 z-50 h-0.5 bg-primary/20 w-full pointer-events-none">
        <div className="h-full bg-primary transition-all duration-100" style={{ width: readPct + "%" }} />
      </div>
      <Header searchQuery="" onSearchChange={() => {}} />

      <div className="w-full flex justify-center items-center bg-muted/30 border-b border-border py-2 min-h-[94px]">
        <Ad728x90 uid="article-top" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-8 items-start">

          <main className="flex-1 min-w-0 max-w-3xl" ref={articleRef}>
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> 뒤로
            </button>

            <div className="border-b-2 border-primary pb-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-primary text-primary-foreground uppercase tracking-wide">{article.category}</span>
                {article.isBreaking && <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-red-500 text-white animate-pulse">속보</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-foreground mb-3">{article.title}</h1>
              <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{fmtDate(article.publishedAt || (article as any).date || "")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={tweetShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors">
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </button>
                  <button onClick={copyLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold hover:bg-accent transition-colors border border-border">
                    <Link className="h-3.5 w-3.5" /> {copied ? "복사됨!" : "링크복사"}
                  </button>
                </div>
              </div>
            </div>

            {imageUrl && (
              <div className="mb-5 rounded-xl bg-muted overflow-hidden">
                <img src={imageUrl} alt={article.title} className="w-full object-cover max-h-[300px] pointer-events-none select-none"
                  onError={() => { if (!imgError) { setImgError(true); setImageUrl("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop"); }}} />
              </div>
            )}

            <div className="flex justify-center my-4 bg-muted/20 rounded-lg py-1.5">
              <Ad728x90 uid="article-after-img" />
            </div>

            <article className="text-[15px] leading-[1.9] text-foreground/90">
              {body.map((para, i) => (
                <div key={i}>
                  <p className="mb-4">{para}</p>
                  {i === 2 && (
                    <div className="flex justify-center my-5 bg-muted/20 rounded-lg py-1.5">
                      <Ad728x90 uid="article-mid1" />
                    </div>
                  )}
                  {i === 5 && (
                    <div className="flex justify-center my-5 bg-muted/20 rounded-lg py-1.5">
                      <Ad728x90 uid="article-mid2" />
                    </div>
                  )}
                  {i === 8 && (
                    <div className="flex justify-center my-5 bg-muted/20 rounded-lg py-1.5">
                      <Ad728x90 uid="article-mid3" />
                    </div>
                  )}
                </div>
              ))}
            </article>

            {(article as any).relatedKeywords?.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {((article as any).relatedKeywords as string[]).slice(0, 8).map((kw: string) => (
                    <button key={kw} onClick={() => navigate("/?q=" + encodeURIComponent(kw))}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border">
                      #{kw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm">
                  <ArrowLeft className="h-4 w-4" /> 목록으로
                </button>
                <div className="flex gap-2">
                  <button onClick={copyLink} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted text-sm font-semibold hover:bg-accent transition-colors border border-border">
                    <Share2 className="h-4 w-4" /> 공유
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center my-6 bg-muted/20 rounded-lg py-1.5">
              <Ad728x90 uid="article-bottom" />
            </div>

            {related.length > 0 && (
              <section className="mt-4 pt-5 border-t-2 border-primary/30">
                <h2 className="text-lg font-extrabold mb-4 text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded inline-block" /> 관련 기사
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {related.map(rel => (
                    <RelatedCard key={rel.id} article={rel} onClick={() => navigate("/article/" + encodeURIComponent(rel.id))} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-5 pt-4">
              <AdNative />
            </div>

            {more.length > 0 && (
              <section className="mt-5 pt-5 border-t border-border">
                <h2 className="text-base font-extrabold mb-4 text-foreground flex items-center gap-2">
                  <span className="text-orange-500">이 기사도 읽어보세요</span>
                </h2>
                <div className="space-y-2">
                  {more.map(rel => (
                    <RelatedCard key={rel.id} article={rel} onClick={() => navigate("/article/" + encodeURIComponent(rel.id))} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
              <p className="text-sm font-bold text-foreground mb-1">더 많은 경제 뉴스</p>
              <p className="text-xs text-muted-foreground mb-4">실시간 글로벌 경제 업데이트</p>
              <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                전체 뉴스 <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>

          <aside className="hidden lg:block w-72 flex-shrink-0" style={{ position: "sticky", top: "80px", alignSelf: "flex-start" }}>
            <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1 mb-4">
              <Ad300x250 uid="art-side-top" />
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <span className="text-orange-500 text-sm">인기 검색어</span>
              </div>
              <ul className="divide-y divide-border">
                {["코스피", "환율", "금리", "반도체", "비트코인", "부동산", "삼성전자", "원달러"].map((kw, idx) => (
                  <li key={kw} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate("/?q=" + encodeURIComponent(kw))}>
                    <span className={"text-sm font-bold w-5 " + (idx < 3 ? "text-orange-500" : "text-muted-foreground")}>{idx + 1}</span>
                    <span className="text-sm flex-1">{kw}</span>
                    {idx < 2 && <span className="text-xs font-bold text-red-500">NEW</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1 mb-4">
              <Ad300x250 uid="art-side-mid" />
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">최신 뉴스</h3>
                <button onClick={() => navigate("/")} className="text-xs text-primary hover:underline">더보기</button>
              </div>
              <div className="divide-y divide-border">
                {all.slice(0, 6).map(a => (
                  <div key={a.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors group" onClick={() => navigate("/article/" + encodeURIComponent(a.id))}>
                    <p className="text-xs font-semibold text-primary mb-0.5">{a.category}</p>
                    <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(a.publishedAt || (a as any).date || "")}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">카테고리</h3>
              </div>
              <div className="p-3 flex flex-wrap gap-1.5">
                {["거시경제", "주식", "시장", "부동산", "암호화폐", "테크", "금융", "환율"].map(cat => (
                  <button key={cat} onClick={() => navigate("/?category=" + cat)} className="px-3 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1">
              <Ad300x250 uid="art-side-bottom" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
