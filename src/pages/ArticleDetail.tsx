import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Share2, Link, Twitter, ExternalLink, ChevronRight, BookOpen } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import SEOHead from "../components/SEOHead";
import type { NewsArticle } from "../hooks/useTheNewsApi";

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

const getAllArticlesFromStore = (): NewsArticle[] => {
  try {
    const raw = localStorage.getItem(ARTICLE_STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
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

const Banner728x90Ad = ({ className = "" }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  useEffect(() => {
    if (!ref.current || loaded.current) return;
    loaded.current = true;
    ref.current.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.style.width = "728px";
    iframe.style.height = "90px";
    iframe.style.border = "none";
    iframe.style.maxWidth = "100%";
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");
    ref.current.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(
        '<script type="text/javascript">' +
        'atOptions = { key: "cab28a3c8ec96edb306ab13e7af5944b", format: "iframe", height: 90, width: 728, params: {} };' +
        '<' + '/script>' +
        '<script type="text/javascript" src="//highperformanceformat.com/cab28a3c8ec96edb306ab13e7af5944b/invoke.js"><' + '/script>'
      );
      doc.close();
    }
  }, []);
  return (
    <div
      ref={ref}
      className={"flex justify-center items-center overflow-hidden " + className}
      style={{ minHeight: "90px" }}
    />
  );
};

const Banner300x250Ad = ({ className = "" }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  useEffect(() => {
    if (!ref.current || loaded.current) return;
    loaded.current = true;
    ref.current.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.style.width = "300px";
    iframe.style.height = "250px";
    iframe.style.border = "none";
    iframe.style.maxWidth = "100%";
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");
    ref.current.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(
        '<script type="text/javascript">' +
        'atOptions = { key: "333406d0aacce2e565463f8c1d21d1bd", format: "iframe", height: 250, width: 300, params: {} };' +
        '<' + '/script>' +
        '<script type="text/javascript" src="//highperformanceformat.com/333406d0aacce2e565463f8c1d21d1bd/invoke.js"><' + '/script>'
      );
      doc.close();
    }
  }, []);
  return (
    <div
      ref={ref}
      className={"flex justify-center items-center overflow-hidden " + className}
      style={{ minHeight: "250px" }}
    />
  );
};

const NativeBannerAd = ({ className = "" }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  useEffect(() => {
    if (!ref.current || loaded.current) return;
    loaded.current = true;
    ref.current.innerHTML = "";
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "https://pl28800200.effectivegatecpm.com/ea5bbfe829e07e03a26eddac6389273b/invoke.js";
    const div = document.createElement("div");
    div.id = "container-ea5bbfe829e07e03a26eddac6389273b";
    ref.current.appendChild(script);
    ref.current.appendChild(div);
  }, []);
  return <div ref={ref} className={"w-full overflow-hidden " + className} />;
};

const buildArticleBody = (article: NewsArticle): string[] => {
  const geminiParagraphs = (article as any).bodyParagraphs as string[] | undefined;
  if (geminiParagraphs && geminiParagraphs.length >= 3) return geminiParagraphs;
  const fullBody = (article as any).fullBody as string | undefined;
  if (fullBody && fullBody.length > 300) {
    const paragraphs = fullBody
      .split(/\n\n+/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 20);
    if (paragraphs.length >= 3) return paragraphs;
  }
  const rawDesc = article.description || "";
  const rawSummary = (article as any).summary || "";
  const combined = [rawDesc, rawSummary]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
  if (!combined) return ["This article content could not be loaded. Please check the original link."];
  const clean = combined
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean];
  const parts: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    const para = sentences
      .slice(i, i + 3)
      .join(" ")
      .trim();
    if (para.length > 20) parts.push(para);
  }
  if (parts.join("").length < 200) {
    parts.push(
      article.title + " - Latest news in " + article.category + " sector.",
      "Experts are analyzing the impact of this development on domestic and international markets.",
      "Market analysts expect short-term volatility but stable medium-to-long-term trends.",
      "EconoJabis will continue to provide updates on this story as it develops.",
    );
  }
  return parts;
};

const RelatedArticleCard = ({ article, onClick }: { article: NewsArticle; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex gap-3 p-3 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all group"
  >
    {((article as any).imageUrl || (article as any).image) && (
      <img
        src={(article as any).imageUrl || (article as any).image}
        alt={article.title}
        className="w-24 h-20 object-cover rounded-lg flex-shrink-0 group-hover:opacity-90 transition-opacity"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    )}
    <div className="flex-1 min-w-0">
      <span className="text-xs font-semibold text-primary mb-1 block">{article.category}</span>
      <h3 className="text-sm font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
        {article.title}
      </h3>
      {(article.description || (article as any).summary) && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {article.description || (article as any).summary}
        </p>
      )}
      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{formatDate(article.publishedAt || (article as any).date || "")}</span>
      </div>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = id ? getArticleFromStore(id) : null;
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      setScrollProgress(progress);
      if (!articleRef.current) return;
      const el = articleRef.current;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight;
      const scrolled = Math.max(0, -rect.top + window.innerHeight * 0.5);
      const readPct = Math.min(100, Math.round((scrolled / total) * 100));
      setReadProgress(readPct);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!article) return;
    const src = (article as any).imageUrl || (article as any).image || "";
    setImageUrl(src);
    setImgError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [article]);

  const handleImageError = () => {
    if (imgError) return;
    setImgError(true);
    setImageUrl("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTwitterShare = () => {
    window.open(
      "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(article?.title || "") +
        "&url=" +
        encodeURIComponent(window.location.href),
      "_blank",
      "width=600,height=400",
    );
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 z-50 w-full h-1 bg-gray-200">
          <div className="h-full bg-orange-500 transition-all duration-150" style={{ width: scrollProgress + "%" }} />
        </div>
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">Article not found.</p>
          <p className="text-muted-foreground text-sm mb-6">Go back to homepage to check the latest news.</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </button>
        </div>
      </div>
    );
  }

  const bodyParagraphs = buildArticleBody(article);
  const allArticles = getAllArticlesFromStore();
  const relatedArticles = allArticles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 6);
  const moreArticles = allArticles.filter((a) => a.id !== article.id && a.category !== article.category).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={article.title}
        description={(article.description || (article as any).summary || "").slice(0, 160)}
        ogImage={imageUrl}
        article={{
          title: article.title,
          description: article.description || "",
          publishedAt: article.publishedAt || new Date().toISOString(),
          category: article.category || "",
          source: "EconoJabis",
          image: imageUrl,
        }}
      />
      <Header searchQuery="" onSearchChange={() => {}} />
      <div className="fixed top-0 left-0 z-50 h-0.5 bg-primary/20 w-full">
        <div className="h-full bg-primary transition-all duration-150" style={{ width: readProgress + "%" }} />
      </div>

      <div className="w-full flex justify-center py-2 bg-muted/30 border-b border-border">
        <Banner728x90Ad />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-8 items-start">
          <main className="flex-1 min-w-0" ref={articleRef}>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>

            <article>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                  {article.category}
                </span>
                {article.isBreaking && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white animate-pulse">
                    BREAKING
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{article.source}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 text-foreground">{article.title}</h1>

              <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(article.publishedAt || (article as any).date || "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTwitterShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    Twitter
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-accent transition-colors border border-border"
                  >
                    <Link className="h-3.5 w-3.5" />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Original
                    </a>
                  )}
                </div>
              </div>

              {imageUrl && (
                <div className="mb-6 overflow-hidden rounded-xl">
                  <img
                    src={imageUrl}
                    alt={article.title}
                    className="w-full object-cover max-h-[500px]"
                    onError={handleImageError}
                  />
                </div>
              )}

              <div className="my-4 flex justify-center">
                <Banner728x90Ad />
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {bodyParagraphs.map((para, i) => (
                  <div key={i}>
                    <p className="mb-5 text-base leading-relaxed text-foreground/90">{para}</p>
                    {i === 1 && (
                      <div className="my-6 flex justify-center">
                        <Banner728x90Ad />
                      </div>
                    )}
                    {i === 4 && (
                      <div className="my-6 flex justify-center">
                        <Banner728x90Ad />
                      </div>
                    )}
                    {i === 7 && (
                      <div className="my-6 flex justify-center">
                        <Banner728x90Ad />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(article as any).relatedKeywords?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Related Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {((article as any).relatedKeywords as string[]).slice(0, 8).map((kw: string) => (
                      <button
                        key={kw}
                        onClick={() => navigate("/?q=" + encodeURIComponent(kw))}
                        className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                      >
                        #{kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    List
                  </button>
                  <div className="flex items-center gap-2">
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Read Original
                      </a>
                    )}
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-semibold hover:bg-accent transition-colors border border-border"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <div className="my-8 flex justify-center">
              <Banner728x90Ad />
            </div>

            {relatedArticles.length > 0 && (
              <section className="mt-6 pt-6 border-t border-border">
                <h2 className="text-xl font-bold mb-5 text-foreground flex items-center gap-2">
                  <span className="text-primary">Related Articles</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedArticles.map((rel) => (
                    <RelatedArticleCard
                      key={rel.id}
                      article={rel}
                      onClick={() => navigate("/article/" + encodeURIComponent(rel.id))}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="my-6">
              <NativeBannerAd />
            </div>

            {moreArticles.length > 0 && (
              <section className="mt-4 pt-6 border-t border-border">
                <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                  <span className="text-orange-500">More Articles</span>
                </h2>
                <div className="space-y-2">
                  {moreArticles.map((rel) => (
                    <RelatedArticleCard
                      key={rel.id}
                      article={rel}
                      onClick={() => navigate("/article/" + encodeURIComponent(rel.id))}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
              <p className="text-sm font-semibold text-foreground mb-2">Explore more economic news</p>
              <p className="text-xs text-muted-foreground mb-4">Real-time domestic and international economic news</p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                All News
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>

          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-5" style={{ position: "sticky", top: "80px" }}>
            <div className="flex justify-center">
              <Banner300x250Ad />
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <span className="text-orange-500 text-sm font-bold">Trending</span>
                <h3 className="font-bold text-sm">Hot Keywords</h3>
              </div>
              <ul className="divide-y divide-border">
                {["Semiconductor", "KOSPI", "Interest Rate", "AI", "Bitcoin", "Exchange Rate", "Samsung", "Apartment"].map((kw, idx) => (
                  <li
                    key={kw}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/?q=" + encodeURIComponent(kw))}
                  >
                    <span className={"text-sm font-bold w-5 " + (idx < 3 ? "text-orange-500" : "text-muted-foreground")}>
                      {idx + 1}
                    </span>
                    <span className="text-sm flex-1">{kw}</span>
                    {idx < 2 && <span className="text-xs font-bold text-red-500">NEW</span>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center">
              <Banner300x250Ad />
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">Latest News</h3>
                <button onClick={() => navigate("/")} className="text-xs text-primary hover:underline">
                  More
                </button>
              </div>
              <div className="divide-y divide-border">
                {allArticles.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    className="p-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => navigate("/article/" + encodeURIComponent(a.id))}
                  >
                    <p className="text-xs font-semibold text-primary mb-1">{a.category}</p>
                    <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(a.publishedAt || (a as any).date || "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">Categories</h3>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {["Economy", "Stocks", "Markets", "Real Estate", "Crypto", "Tech", "Finance", "Macro"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => navigate("/?category=" + cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Banner300x250Ad />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
