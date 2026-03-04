import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Clock, Share2, Link, Twitter, ChevronRight, BookOpen, Tag } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import Header from "../components/Header";
import SEOHead from "../components/SEOHead";
import AdBanner from "../components/AdBanner";
import { type NewsArticle } from "../hooks/useTheNewsApi";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";
import { translateArticleDetail, translateArticlesPreview } from "../lib/runtimeTranslation";
import { getAllArticlesFromStore, getArticleFromStore, normalizeArticleId, upsertArticleToStore } from "../lib/articleStore";

const LOCALE_BY_LANGUAGE: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
  es: "es-ES",
  ja: "ja-JP",
  zh: "zh-CN",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  id: "id-ID",
  ar: "ar-SA",
  hi: "hi-IN",
};

const DEFAULT_POPULAR_KEYWORDS: Record<string, string[]> = {
  ko: ["코스피", "환율", "금리", "반도체", "비트코인", "부동산", "삼성전자", "원달러"],
  en: ["S&P500", "Forex", "Rates", "Semiconductor", "Bitcoin", "Real Estate", "NVIDIA", "USD/KRW"],
};

const fmtDate = (s: string, language: string) => {
  try {
    const locale = LOCALE_BY_LANGUAGE[language] || LOCALE_BY_LANGUAGE.en;
    return new Date(s).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch { return s; }
};

const buildBody = (article: NewsArticle, loadingText: string): string[] => {
  const bp = (article as any).bodyParagraphs as string[] | undefined;
  if (bp && bp.length >= 3) return bp;
  const fullBody = (article as any).fullBody as string | undefined;
  if (fullBody && fullBody.length > 300) {
    const parts = fullBody.split(/\n\n+/).map((p: string) => p.trim()).filter((p: string) => p.length > 20);
    if (parts.length >= 3) return parts;
  }
  const raw = [article.description || "", (article as any).summary || ""].join(" ").trim();
  if (!raw) return [loadingText];
  const clean = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const sents = clean.match(/[^.!?]+[.!?]*/g) || [clean];
  const out: string[] = [];
  for (let i = 0; i < sents.length; i += 3) {
    const p = sents.slice(i, i + 3).join(" ").trim();
    if (p.length > 20) out.push(p);
  }
  if (out.join("").length < 200) {
    return [loadingText];
  }
  return out;
};

const RelatedCard = ({ article, onClick, language }: { article: NewsArticle; onClick: () => void; language: string }) => {
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
          <span>{fmtDate(article.publishedAt || (article as any).date || "", language)}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground self-center opacity-0 group-hover:opacity-100 flex-shrink-0" />
    </div>
  );
};

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const routeStateArticle = useMemo(() => {
    const state = location.state as { article?: NewsArticle } | null;
    if (!state?.article || !id) return null;
    return normalizeArticleId(state.article.id) === normalizeArticleId(id) ? state.article : null;
  }, [id, location.state]);
  const rawArticle = useMemo(() => {
    if (!id) return null;
    return routeStateArticle || getArticleFromStore(id);
  }, [id, routeStateArticle]);
  const [article, setArticle] = useState<NewsArticle | null>(rawArticle);
  const [all, setAll] = useState<NewsArticle[]>(() => getAllArticlesFromStore());
  const [imageUrl, setImageUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readPct, setReadPct] = useState(0);
  const [now, setNow] = useState<Date>(new Date());
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
    if (!rawArticle) {
      setArticle(null);
      return;
    }
    setArticle(rawArticle);
  }, [rawArticle]);

  useEffect(() => {
    if (!routeStateArticle) return;
    upsertArticleToStore(routeStateArticle);
  }, [routeStateArticle]);

  useEffect(() => {
    let cancelled = false;
    if (!rawArticle) return;

    void translateArticleDetail(rawArticle, language).then((translated) => {
      if (cancelled) return;
      setArticle(translated);
    });

    return () => {
      cancelled = true;
    };
  }, [rawArticle, language]);

  useEffect(() => {
    const stored = getAllArticlesFromStore();
    setAll(stored);

    let cancelled = false;
    void translateArticlesPreview(stored, language, 4).then((translated) => {
      if (cancelled) return;
      setAll(translated);
    });

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    if (!article) return;
    setImageUrl((article as any).imageUrl || (article as any).image || "");
    setImgError(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [article]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const openArticle = (nextArticle: NewsArticle) => {
    navigate("/article/" + encodeURIComponent(nextArticle.id), { state: { article: nextArticle } });
  };

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
          title={t("articleNotFound")}
          description={t("articleNotFound")}
          canonicalUrl={fallbackCanonical}
          language={language}
          noindex
        />
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="w-full flex justify-center items-center bg-muted/30 border-b border-border py-2 min-h-[94px]">
          <AdBanner slotType="header" uid="article-not-found-top" />
        </div>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-6">{t("articleNotFound")}</p>
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t("home")}
          </button>
        </div>
        <div className="w-full flex justify-center items-center bg-card border-t border-border py-2 min-h-[94px]">
          <AdBanner slotType="footer" uid="article-not-found-bottom" />
        </div>
      </div>
    );
  }

  const body = buildBody(article, t("articleLoading"));
  const related = all.filter(a => a.id !== article.id && a.category === article.category).slice(0, 6);
  const more = all.filter(a => a.id !== article.id && a.category !== article.category).slice(0, 4);
  const dynamicKeywords = Array.from(
    new Set(
      all.flatMap((a) => (((a as any).relatedKeywords as string[] | undefined) || []).map((kw) => kw.trim()).filter(Boolean))
    )
  ).slice(0, 8);
  const sidebarKeywords = dynamicKeywords.length > 0
    ? dynamicKeywords
    : (DEFAULT_POPULAR_KEYWORDS[language] || DEFAULT_POPULAR_KEYWORDS.en);
  const sidebarCategories = Array.from(new Set(all.map((a) => a.category).filter(Boolean))).slice(0, 8);
  const locale = LOCALE_BY_LANGUAGE[language] || LOCALE_BY_LANGUAGE.en;
  const keywordDate = now.toLocaleDateString(locale, { month: "2-digit", day: "2-digit" });
  const keywordTime = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
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
        <AdBanner slotType="header" uid="article-top" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-8 items-start">

          <main className="flex-1 min-w-0 max-w-3xl" ref={articleRef}>
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> {t("back")}
            </button>

            <div className="border-b-2 border-primary pb-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-primary text-primary-foreground uppercase tracking-wide">{article.category}</span>
                {article.isBreaking && <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-red-500 text-white animate-pulse">{t("breaking")}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-foreground mb-3">{article.title}</h1>
              <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{fmtDate(article.publishedAt || (article as any).date || "", language)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={tweetShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors">
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </button>
                  <button onClick={copyLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold hover:bg-accent transition-colors border border-border">
                    <Link className="h-3.5 w-3.5" /> {copied ? t("copied") : t("copyLink")}
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
              <AdBanner slotType="in-article" uid="article-after-image" />
            </div>

            <article className="text-[15px] leading-[1.9] text-foreground/90">
              {body.map((para, i) => (
                <div key={i}>
                  <p className="mb-4">{para}</p>
                  {i === 2 && (
                    <div className="flex justify-center my-5 bg-muted/20 rounded-lg py-1.5">
                      <AdBanner slotType="in-article" uid="article-mid-1" />
                    </div>
                  )}
                  {i === 5 && (
                    <div className="flex justify-center my-5 bg-muted/20 rounded-lg py-1.5">
                      <AdBanner slotType="in-article" uid="article-mid-2" />
                    </div>
                  )}
                  {i === 8 && (
                    <div className="flex justify-center my-5 bg-muted/20 rounded-lg py-1.5">
                      <AdBanner slotType="in-article" uid="article-mid-3" />
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
                  <ArrowLeft className="h-4 w-4" /> {t("backToList")}
                </button>
                <div className="flex gap-2">
                  <button onClick={copyLink} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted text-sm font-semibold hover:bg-accent transition-colors border border-border">
                    <Share2 className="h-4 w-4" /> {t("share")}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center my-6 bg-muted/20 rounded-lg py-1.5">
              <AdBanner slotType="footer" uid="article-bottom" />
            </div>

            {related.length > 0 && (
              <section className="mt-4 pt-5 border-t-2 border-primary/30">
                <h2 className="text-lg font-extrabold mb-4 text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded inline-block" /> {t("relatedArticles")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {related.map(rel => (
                    <RelatedCard key={rel.id} article={rel} language={language} onClick={() => openArticle(rel)} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-5 pt-4">
              <AdBanner slotType="in-article" uid="article-related-bottom" />
            </div>

            {more.length > 0 && (
              <section className="mt-5 pt-5 border-t border-border">
                <h2 className="text-base font-extrabold mb-4 text-foreground flex items-center gap-2">
                  <span className="text-orange-500">{t("readAlso")}</span>
                </h2>
                <div className="space-y-2">
                  {more.map(rel => (
                    <RelatedCard key={rel.id} article={rel} language={language} onClick={() => openArticle(rel)} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
              <p className="text-sm font-bold text-foreground mb-1">{t("moreEconomicNews")}</p>
              <p className="text-xs text-muted-foreground mb-4">{t("siteTagline")}</p>
              <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                {t("allNews")} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>

          <aside className="hidden lg:block w-72 flex-shrink-0" style={{ position: "sticky", top: "80px", alignSelf: "flex-start" }}>
            <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1 mb-4">
              <AdBanner slotType="sidebar" uid="article-sidebar-top" />
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <span className="text-orange-500 text-sm">{t("risingKeywords")}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">{keywordDate} {keywordTime}</span>
              </div>
              <ul className="divide-y divide-border">
                {sidebarKeywords.map((kw, idx) => (
                  <li key={kw} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate("/?q=" + encodeURIComponent(kw))}>
                    <span className={"text-sm font-bold w-5 " + (idx < 3 ? "text-orange-500" : "text-muted-foreground")}>{idx + 1}</span>
                    <span className="text-sm flex-1">{kw}</span>
                    {idx < 2 && <span className="text-xs font-bold text-red-500">{t("new")}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1 mb-4">
              <AdBanner slotType="sidebar" uid="article-sidebar-mid" />
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">{t("latestNews")}</h3>
                <button onClick={() => navigate("/")} className="text-xs text-primary hover:underline">{t("more")}</button>
              </div>
              <div className="divide-y divide-border">
                {all.slice(0, 6).map(a => (
                  <div key={a.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors group" onClick={() => openArticle(a)}>
                    <p className="text-xs font-semibold text-primary mb-0.5">{a.category}</p>
                    <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(a.publishedAt || (a as any).date || "", language)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">{t("categories")}</h3>
              </div>
              <div className="p-3 flex flex-wrap gap-1.5">
                {sidebarCategories.map(cat => (
                  <button key={cat} onClick={() => navigate("/?category=" + cat)} className="px-3 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1">
              <AdBanner slotType="sidebar" uid="article-sidebar-bottom" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
