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

// ============================================================
// Adsterra Native Banner (헤더 하단 / 페이지 하단)
// ============================================================
const NativeBannerAd = () => {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !ref.current) return;
    done.current = true;
    const el = ref.current;
    const container = document.createElement('div');
    container.id = 'container-ea5bbfe829e07e03a26eddac6389273b';
    el.appendChild(container);
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync','false');
    s.src = 'https://pl28800200.effectivegatecpm.com/ea5bbfe829e07e03a26eddac6389273b/invoke.js';
    el.appendChild(s);
  }, []);
  return <div ref={ref} className="w-full flex justify-center min-h-[90px]" />;
};

// ============================================================
// Adsterra Banner 728x90
// key: cab28a3c8ec96edb306ab13e7af5944b
// ============================================================
const Banner728x90Ad = () => {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !ref.current) return;
    done.current = true;
    const el = ref.current;
    const s1 = document.createElement('script');
    s1.type = 'text/javascript';
    s1.text = `atOptions = {'key':'cab28a3c8ec96edb306ab13e7af5944b','format':'iframe','height':90,'width':728,'params':{}};`;
    el.appendChild(s1);
    const s2 = document.createElement('script');
    s2.type = 'text/javascript';
    s2.src = 'https://www.highperformanceformat.com/cab28a3c8ec96edb306ab13e7af5944b/invoke.js';
    el.appendChild(s2);
  }, []);
  return (
    <div ref={ref} className="flex justify-center items-center" style={{minHeight:'90px',width:'728px',maxWidth:'100%',margin:'0 auto'}} />
  );
};

// ============================================================
// Adsterra Banner 300x250 (사이드바/중간)
// key: 333406d0aacce2e565463f8c1d21d1bd
// ============================================================
const Banner300x250Ad = ({ id }: { id: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !ref.current) return;
    done.current = true;
    const el = ref.current;
    const s1 = document.createElement('script');
    s1.type = 'text/javascript';
    s1.text = `atOptions = {'key':'333406d0aacce2e565463f8c1d21d1bd','format':'iframe','height':250,'width':300,'params':{}};`;
    el.appendChild(s1);
    const s2 = document.createElement('script');
    s2.type = 'text/javascript';
    s2.src = 'https://www.highperformanceformat.com/333406d0aacce2e565463f8c1d21d1bd/invoke.js';
    el.appendChild(s2);
  }, []);
  return (
    <div ref={ref} id={id} className="flex justify-center items-center overflow-hidden rounded-xl" style={{minHeight:'250px',width:'300px',margin:'0 auto'}} />
  );
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
      const matchesCategory =
        selectedCategory === "all" || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
      />

      {/* 헤더 하단 - Native Banner */}
      <div className="bg-muted/30 border-b border-border py-2">
        <div className="mx-auto max-w-7xl px-4">
          <NativeBannerAd />
        </div>
      </div>

      {/* 실시간 마켓 티커 */}
      <MarketTicker />

      {/* 티커 하단 - 728x90 */}
      <div className="bg-background py-3 border-b border-border/50">
        <Banner728x90Ad />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0 space-y-6">
            <FeaturedNews articles={filteredArticles} />

            {/* 피처드 뉴스 하단 - 300x250 */}
            <div className="flex justify-center py-1">
              <Banner300x250Ad id="ad-featured-bottom" />
            </div>

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

            {/* 뉴스 목록 하단 - 728x90 */}
            <div className="flex justify-center py-4 border-t border-border">
              <Banner728x90Ad />
            </div>
          </div>

          {/* 사이드바 */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* 사이드바 상단 - 300x250 */}
              <Banner300x250Ad id="ad-sidebar-top" />

              <RisingKeywords
                articles={articles}
                onKeywordClick={(kw) => setSearchQuery(kw)}
              />
              <MarketWidget />

              {/* 트렌딩 키워드 */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-orange-500">🔥</span>{t("trending")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingKeywords.length > 0
                    ? trendingKeywords.map((item, idx) => (
                        <button key={item} onClick={() => setSearchQuery(item)}
                          className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-accent transition-colors text-secondary-foreground flex items-center gap-1">
                          <span className="text-orange-500 font-bold">{idx + 1}</span>#{item}
                        </button>
                      ))
                    : ["Fed","Bitcoin","KOSPI","USD/KRW","Oil","Gold","S&P500"].map((kw) => (
                        <button key={kw} onClick={() => setSearchQuery(kw)}
                          className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-accent transition-colors text-secondary-foreground">
                          #{kw}
                        </button>
                      ))}
                </div>
              </div>

              {/* 사이드바 하단 - 300x250 */}
              <Banner300x250Ad id="ad-sidebar-bottom" />
            </div>
          </aside>
        </div>

        {/* 페이지 하단 - Native Banner */}
        <div className="mt-8 py-4 border-t border-border">
          <NativeBannerAd />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
