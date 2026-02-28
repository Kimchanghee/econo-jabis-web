// EconoJabis - Main page
import { useState, useMemo, useEffect, useRef } from "react";
import Header from "../components/Header";
import FeaturedNews from "../components/FeaturedNews";
import NewsList from "../components/NewsList";
import CategoryTabs from "../components/CategoryTabs";
import MarketTicker from "../components/MarketTicker";
import MarketWidget from "../components/MarketWidget";
import RisingKeywords from "../components/RisingKeywords";
import Footer from "../components/Footer";
import SEOHead from "../components/SEOHead";
import { useTheNewsApi } from "../hooks/useTheNewsApi";
import { useLanguage } from "../hooks/useLanguage";
import { saveArticlesToStore } from "./ArticleDetail";

// --- Ad Components (srcdoc iframe approach) ---
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
    <iframe
      ref={ref}
      key={uid}
      title={"ad-" + uid}
      scrolling="no"
      frameBorder="0"
      style={{ width: "728px", maxWidth: "100%", height: "90px", border: "none", display: "block" }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
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
    <iframe
      ref={ref}
      key={uid}
      title={"ad-" + uid}
      scrolling="no"
      frameBorder="0"
      style={{ width: "300px", height: "250px", border: "none", display: "block" }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
};

const AdNative = () => {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !ref.current) return;
    loaded.current = true;
    const el = ref.current;
    const c = document.createElement("div");
    c.id = "container-ea5bbfe829e07e03a26eddac6389273b";
    el.appendChild(c);
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = "https://pl28800200.effectivegatecpm.com/ea5bbfe829e07e03a26eddac6389273b/invoke.js";
    el.appendChild(s);
  }, []);
  return <div ref={ref} className="w-full" />;
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { language, t } = useLanguage();
  const { articles, isLoading, error, lastFetched, refresh, extractTrendingKeywords } = useTheNewsApi(language);
  const trendingKeywords = useMemo(() => extractTrendingKeywords(), [articles, extractTrendingKeywords]);

  useEffect(() => {
    if (articles.length > 0) saveArticlesToStore(articles);
  }, [articles]);

  const categories = useMemo(() => {
    const cats = new Set(articles.map((a) => a.category));
    return Array.from(cats).filter(Boolean);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCategoryChange={setSelectedCategory} />

      {/* Header Banner Ad 728x90 */}
      <div className="w-full flex justify-center items-center bg-muted/30 border-b border-border py-2 min-h-[94px]">
        <Ad728x90 uid="index-header" />
      </div>

      <MarketTicker />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            <FeaturedNews articles={filteredArticles} />

            {/* Category tabs */}
            <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border">
              <CategoryTabs
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
              />
            </div>

            <NewsList
              articles={filteredArticles}
              isLoading={isLoading}
              error={error}
              onRefresh={refresh}
              lastFetched={lastFetched}
            />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-4">

              {/* Sidebar Top Ad 300x250 */}
              <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1">
                <Ad300x250 uid="sidebar-top" />
              </div>

              {/* Rising Keywords */}
              <RisingKeywords articles={articles} onKeywordClick={(kw) => setSearchQuery(kw)} />

              {/* Ad between keywords and market */}
              <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1">
                <Ad300x250 uid="sidebar-mid" />
              </div>

              {/* Market Widget */}
              <MarketWidget />

              {/* Trending keywords */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-orange-500">🔥</span>
                  <span>{t("trending")}</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {trendingKeywords.length > 0
                    ? trendingKeywords.map((item, idx) => (
                        <button
                          key={item}
                          onClick={() => setSearchQuery(item)}
                          className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-secondary-foreground flex items-center gap-1"
                        >
                          <span className="text-orange-500 font-bold">{idx + 1}</span>
                          #{item}
                        </button>
                      ))
                    : ["Fed", "Bitcoin", "KOSPI", "USD/KRW", "Oil", "Gold", "S&P500"].map((kw) => (
                        <button
                          key={kw}
                          onClick={() => setSearchQuery(kw)}
                          className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-secondary-foreground"
                        >
                          #{kw}
                        </button>
                      ))}
                </div>
              </div>

              {/* Sidebar Bottom Ad 300x250 */}
              <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1">
                <Ad300x250 uid="sidebar-bottom" />
              </div>
            </div>
          </aside>
        </div>

        {/* Native Banner Ad at bottom */}
        <div className="mt-8 pt-4 border-t border-border">
          <AdNative />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
