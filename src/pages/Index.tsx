// EconoJabis - Main page component
import { useState, useMemo, useEffect, useRef } from "react";
import Header from "../components/Header";
import FeaturedNews from "../components/FeaturedNews";
import NewsList from "../components/NewsList";
import CategoryTabs from "../components/CategoryTabs";
import MarketTicker from "../components/MarketTicker";
import MarketWidget from "../components/MarketWidget";
import AdBanner from "../components/AdBanner";
import RisingKeywords from "../components/RisingKeywords";
import Footer from "../components/Footer";
import SEOHead from "../components/SEOHead";
import { useTheNewsApi } from "../hooks/useTheNewsApi";
import { useLanguage } from "../hooks/useLanguage";
import { saveArticlesToStore } from "./ArticleDetail";

const ADSENSE_PUB = "ca-pub-5884595045902078";

// AdSense 인라인 광고
const AdSenseBanner = ({ slot, format, style }: { slot: string; format: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      if (ref.current) {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      }
    } catch {}
  }, []);
  return (
    <div ref={ref} className="overflow-hidden flex justify-center">
      <ins className="adsbygoogle" style={{ display: "block", ...style }} data-ad-client={ADSENSE_PUB} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
    </div>
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
      const matchesSearch = !searchQuery ||
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

      {/* 헤더 하단 광고 배너 - Adsterra */}
      <div className="bg-muted/30 border-b border-border py-2">
        <div className="mx-auto max-w-7xl px-4 flex justify-center">
          <AdBanner slotType="header" />
        </div>
      </div>

      {/* 실시간 마켓 티커 */}
      <MarketTicker />

      {/* 티커 하단 AdSense 리더보드 */}
      <div className="bg-background py-2 border-b border-border/50">
        <AdSenseBanner slot="1234567890" format="horizontal" style={{ width: "728px", height: "90px" }} />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* 피처드 뉴스 */}
            <FeaturedNews articles={filteredArticles} />

            {/* 피처드 뉴스 하단 광고 */}
            <div className="flex justify-center py-1">
              <AdSenseBanner slot="9876543210" format="rectangle" style={{ width: "336px", height: "280px" }} />
            </div>

            {/* 카테고리 탭 */}
            <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border">
              <CategoryTabs selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} categories={categories} />
            </div>

            {/* 뉴스 목록 (5개마다 인라인 광고 포함) */}
            <NewsList articles={filteredArticles} isLoading={isLoading} error={error} onRefresh={refresh} lastFetched={lastFetched} />
          </div>

          {/* 사이드바 */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* 사이드바 상단 - Adsterra */}
              <AdBanner slotType="sidebar" />

              {/* 사이드바 AdSense */}
              <div className="rounded-xl border border-border overflow-hidden">
                <AdSenseBanner slot="1122334455" format="rectangle" style={{ width: "300px", height: "250px" }} />
              </div>

              {/* 급상승 키워드 */}
              <RisingKeywords articles={articles} onKeywordClick={(kw) => setSearchQuery(kw)} />

              {/* 시장 위젯 */}
              <MarketWidget />

              {/* 트렌딩 키워드 */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-orange-500">🔥</span>{t("trending")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingKeywords.length > 0
                    ? trendingKeywords.map((item, idx) => (
                        <button key={item} onClick={() => setSearchQuery(item)} className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-accent transition-colors text-secondary-foreground flex items-center gap-1">
                          <span className="text-orange-500 font-bold">{idx + 1}</span>#{item}
                        </button>
                      ))
                    : ["Fed", "Bitcoin", "KOSPI", "USD/KRW", "Oil", "Gold", "S&P500"].map((kw) => (
                        <button key={kw} onClick={() => setSearchQuery(kw)} className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-accent transition-colors text-secondary-foreground">#{kw}</button>
                      ))}
                </div>
              </div>

              {/* 사이드바 하단 AdSense */}
              <div className="rounded-xl border border-border overflow-hidden">
                <AdSenseBanner slot="5544332211" format="rectangle" style={{ width: "300px", height: "250px" }} />
              </div>

              {/* 사이드바 Adsterra */}
              <AdBanner slotType="sidebar" />
            </div>
          </aside>
        </div>

        {/* 콘텐츠 하단 광고 */}
        <div className="mt-8 py-4 flex justify-center border-t border-border">
          <AdSenseBanner slot="6677889900" format="horizontal" style={{ width: "728px", height: "90px" }} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
