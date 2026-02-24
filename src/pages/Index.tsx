// EconoJabis - Main page component
import { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import FeaturedNews from "../components/FeaturedNews";
import NewsList from "../components/NewsList";
import CategoryTabs from "../components/CategoryTabs";
import MarketTicker from "../components/MarketTicker";
import AdBanner from "../components/AdBanner";
import { useTheNewsApi } from "../hooks/useTheNewsApi";
import { useLanguage } from "../hooks/useLanguage";
import { saveArticlesToStore } from "./ArticleDetail";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { language, t } = useLanguage();

  const { articles, isLoading, error, lastFetched, refresh, extractTrendingKeywords } = useTheNewsApi(language);

  // Dynamic trending keywords from article content
  const trendingKeywords = useMemo(() => {
    return extractTrendingKeywords();
  }, [articles, extractTrendingKeywords]);

  useEffect(() => {
    if (articles.length > 0) saveArticlesToStore(articles);
  }, [articles]);

  // Get unique categories from articles
  const categories = useMemo(() => {
    const cats = new Set(articles.map((a) => a.category));
    return Array.from(cats).filter(Boolean);
  }, [articles]);

  // Filter articles by search and category
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
      {/* Header with language switcher */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Header Ad Banner */}
      <div className="bg-muted/30 border-b border-border py-2">
        <div className="mx-auto max-w-7xl px-4 flex justify-center">
          <AdBanner slotType="header" />
        </div>
      </div>

      {/* Real-time Market Ticker */}
      <MarketTicker />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Featured News */}
            <FeaturedNews articles={filteredArticles} />

            {/* Category Tabs */}
            <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border">
              <CategoryTabs
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
              />
            </div>

            {/* News List with inline ads */}
            <NewsList
              articles={filteredArticles}
              isLoading={isLoading}
              error={error}
              onRefresh={refresh}
              lastFetched={lastFetched}
            />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Sidebar Ad Top */}
              <AdBanner slotType="sidebar" />

              {/* Market Summary Widget */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                  {t("markets")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("loading")}</p>
              </div>

              {/* Trending Keywords - Dynamic from article analysis */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-orange-500">🔥</span>
                  {t("trending")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingKeywords.length > 0 ? (
                    trendingKeywords.map((item, idx) => (
                      <button
                        key={item.keyword}
                        onClick={() => setSearchQuery(item.keyword)}
                        className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-accent transition-colors text-secondary-foreground flex items-center gap-1"
                      >
                        <span className="text-orange-500 font-bold">{idx + 1}</span>
                        #{item.keyword}
                        <span className="text-muted-foreground text-[10px]">({item.count})</span>
                      </button>
                    ))
                  ) : (
                    ["Fed", "Bitcoin", "KOSPI", "USD/KRW", "Oil", "Gold", "S&P500"].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setSearchQuery(kw)}
                        className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-accent transition-colors text-secondary-foreground"
                      >
                        #{kw}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar Ad Middle */}
              <AdBanner slotType="sidebar" />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card">
        {/* Footer Ad */}
        <div className="py-3 flex justify-center border-b border-border">
          <AdBanner slotType="footer" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-foreground">EconoJabis</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("siteTagline")}</p>
            </div>
            <div className="text-xs text-muted-foreground text-center sm:text-right">
              <p>© 2025 EconoJabis. Powered by free RSS feeds & open APIs.</p>
              <p className="mt-0.5">News: RSS | Market Data: Binance, Yahoo Finance | FX: open.er-api.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
