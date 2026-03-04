import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
import { DEFAULT_LANGUAGE, buildPageUrl, isSupportedLanguage } from "../lib/seo";
import {
  ADSTERRA_300_KEY,
  ADSTERRA_728_KEY,
  getAdIframeSrcdoc,
  getAdNativeContainerId,
  getAdNativeScriptUrl,
} from "../lib/adsterra";

const Ad728x90 = ({ uid }: { uid: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    iframe.srcdoc = getAdIframeSrcdoc(ADSTERRA_728_KEY, 728, 90);
  }, []);
  return (
    <iframe
      ref={ref}
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
    iframe.srcdoc = getAdIframeSrcdoc(ADSTERRA_300_KEY, 300, 250);
  }, []);
  return (
    <iframe
      ref={ref}
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
    c.id = getAdNativeContainerId();
    el.appendChild(c);
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = getAdNativeScriptUrl();
    el.appendChild(s);
  }, []);
  return <div ref={ref} className="w-full" />;
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") || "all");
  const { language, setLanguage, t } = useLanguage();
  const { articles, isLoading, error, lastFetched, refresh, extractTrendingKeywords } = useTheNewsApi(language);
  const trendingKeywords = useMemo(() => extractTrendingKeywords(), [articles, extractTrendingKeywords]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextQuery = params.get("q") || "";
    const nextCategory = params.get("category") || "all";
    const nextLang = params.get("lang");

    setSearchQuery((prev) => (prev === nextQuery ? prev : nextQuery));
    setSelectedCategory((prev) => (prev === nextCategory ? prev : nextCategory));
    if (nextLang && isSupportedLanguage(nextLang)) {
      setLanguage(nextLang);
    }
  }, [location.search, setLanguage]);

  useEffect(() => {
    const next = new URLSearchParams();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      next.set("q", trimmedQuery);
    }

    if (selectedCategory !== "all") {
      next.set("category", selectedCategory);
    }

    if (language !== DEFAULT_LANGUAGE) {
      next.set("lang", language);
    }

    const currentSearch = location.search.startsWith("?") ? location.search.slice(1) : location.search;
    const nextSearch = next.toString();

    if (nextSearch !== currentSearch) {
      setSearchParams(next, { replace: true });
    }
  }, [language, location.search, searchQuery, selectedCategory, setSearchParams]);

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

  const seoCanonicalUrl = useMemo(() => {
    const langParam = language === DEFAULT_LANGUAGE ? undefined : language;
    const categoryParam = selectedCategory === "all" ? undefined : selectedCategory;
    return buildPageUrl("/", { lang: langParam, category: categoryParam });
  }, [language, selectedCategory]);

  const seoDescription = useMemo(() => {
    if (searchQuery.trim()) {
      return t("searchResultsDescription").replace("{query}", searchQuery).replace("{siteName}", t("siteName"));
    }
    return t("defaultSeoDescription");
  }, [searchQuery, t]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("globalEconomyMarketNews")}
        description={seoDescription}
        canonicalUrl={seoCanonicalUrl}
        language={language}
        keywords={trendingKeywords.slice(0, 10)}
        noindex={searchQuery.trim().length > 0}
      />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCategoryChange={setSelectedCategory} />
      <div className="w-full flex justify-center items-center bg-muted/30 border-b border-border py-2" style={{ minHeight: 94 }}>
        <Ad728x90 uid="index-header" />
      </div>
      <MarketTicker />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-6">
            <FeaturedNews articles={filteredArticles} />
            <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-2 border-b border-border">
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
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1">
                <Ad300x250 uid="sidebar-top" />
              </div>
              <RisingKeywords articles={articles} onKeywordClick={(kw) => setSearchQuery(kw)} />
              <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1">
                <Ad300x250 uid="sidebar-mid" />
              </div>
              <MarketWidget />
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-orange-500">*</span>
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
              <div className="flex justify-center bg-muted/20 rounded-xl border border-border p-1">
                <Ad300x250 uid="sidebar-bottom" />
              </div>
            </div>
          </aside>
        </div>
        <div className="mt-8 pt-4 border-t border-border">
          <AdNative />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
