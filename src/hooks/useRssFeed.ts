import { useState, useEffect, useCallback } from "react";
import { NewsArticle, Language, Category, FALLBACK_IMAGES, fallbackArticles } from "@/data/newsData";

const THENEWSAPI_TOKEN = "s0V715Sqrsg661ZSgkpYxUPxxggdvPXmeTVtBiEW";
const THENEWSAPI_BASE = "https://api.thenewsapi.com/v1/news/all";

// Map language to TheNewsAPI locale/language codes
const langMap: Record<Language, string> = {
  ko: "ko",
  en: "en",
  es: "es",
  ja: "ja",
  zh: "zh",
};

// Map categories to search keywords for TheNewsAPI
const categoryKeywords: Record<Category, string> = {
  전체: "economy OR finance OR market",
  주식: "stock market OR equity OR shares OR nasdaq OR S&P",
  부동산: "real estate OR housing OR property",
  환율: "forex OR exchange rate OR currency",
  암호화폐: "bitcoin OR cryptocurrency OR blockchain OR ethereum",
};

// 경제/금융 관련 필수 키워드
const REQUIRED_KEYWORDS = [
  "stock",
  "equity",
  "shares",
  "nasdaq",
  "s&p",
  "dow",
  "kospi",
  "kosdaq",
  "ipo",
  "earnings",
  "dividend",
  "wall street",
  "index",
  "fund",
  "etf",
  "trading",
  "investor",
  "주식",
  "증시",
  "투자",
  "펀드",
  "코스피",
  "economy",
  "economic",
  "gdp",
  "inflation",
  "interest rate",
  "fed",
  "central bank",
  "recession",
  "bond",
  "treasury",
  "yield",
  "금리",
  "경제",
  "인플레이션",
  "한은",
  "연준",
  "무역",
  "수출",
  "GDP",
  "물가",
  "revenue",
  "profit",
  "earnings",
  "ceo",
  "merger",
  "acquisition",
  "m&a",
  "corporate",
  "business",
  "실적",
  "매출",
  "영업이익",
  "기업",
  "real estate",
  "housing",
  "property",
  "mortgage",
  "부동산",
  "아파트",
  "forex",
  "exchange rate",
  "currency",
  "dollar",
  "환율",
  "달러",
  "bitcoin",
  "crypto",
  "blockchain",
  "ethereum",
  "btc",
  "defi",
  "nft",
  "coin",
  "web3",
  "비트코인",
  "암호화폐",
  "이더리움",
  "블록체인",
  "코인",
  "ton",
  "bank",
  "banking",
  "finance",
  "financial",
  "fintech",
  "은행",
  "금융",
];

const BLOCKED_KEYWORDS = [
  "패션",
  "뷰티",
  "맛집",
  "요리",
  "여행",
  "게임",
  "연예",
  "드라마",
  "스포츠",
  "sports",
  "entertainment",
  "movie",
  "music",
  "health",
  "fitness",
  "weather",
  "날씨",
  "운세",
  "gossip",
  "celebrity",
];

const isRelevantArticle = (title: string, description: string): boolean => {
  const text = (title + " " + (description || "")).toLowerCase();
  if (BLOCKED_KEYWORDS.some((k) => text.includes(k.toLowerCase()))) return false;
  return REQUIRED_KEYWORDS.some((k) => text.includes(k.toLowerCase()));
};

// Detect category from article content
const detectCategory = (title: string, description: string): Category => {
  const text = (title + " " + description).toLowerCase();
  const keywords: Record<Category, string[]> = {
    주식: ["stock", "equity", "shares", "market", "nasdaq", "s&p", "kospi", "주식", "증시", "株", "股票"],
    부동산: ["real estate", "housing", "property", "부동산", "아파트", "不動産", "房产"],
    환율: ["forex", "exchange rate", "currency", "dollar", "환율", "달러", "為替", "汇率"],
    암호화폐: ["bitcoin", "crypto", "blockchain", "ethereum", "btc", "비트코인", "仮想通貨", "加密"],
    전체: [],
  };
  for (const [cat, words] of Object.entries(keywords)) {
    if (cat === "전체") continue;
    if (words.some((w) => text.includes(w))) return cat as Category;
  }
  return "주식";
};

interface TheNewsAPIArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string;
  published_at: string;
  source: string;
  categories: string[];
  language: string;
}

const mapToNewsArticle = (item: TheNewsAPIArticle, idx: number): NewsArticle => {
  const category = detectCategory(item.title, item.description || item.snippet || "");
  const date = item.published_at ? item.published_at.split("T")[0] : new Date().toISOString().split("T")[0];

  return {
    id: item.uuid || `news-${idx}-${Date.now()}`,
    title: item.title,
    description: item.description || item.snippet || "",
    summary: item.snippet || "",
    category,
    source: item.source || "TheNewsAPI",
    date,
    publishedAt: item.published_at || date,
    imageUrl: item.image_url || FALLBACK_IMAGES[category],
    url: item.url,
    isBreaking: idx === 0,
    isFeatured: idx < 2,
    language: item.language as Language,
  };
};

export const useRssFeed = (language: Language) => {
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchFeeds = useCallback(async (lang: Language) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        api_token: THENEWSAPI_TOKEN,
        language: langMap[lang] || "en",
        categories: "business",
        search:
          "stock OR economy OR finance OR crypto OR bitcoin OR earnings OR market OR investment OR IPO OR merger OR GDP OR inflation OR 주식 OR 경제 OR 기업 OR 암호화폐 OR 금융 OR 실적",
        limit: "50",
      });

      const res = await fetch(`${THENEWSAPI_BASE}?${params}`, {
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const items: TheNewsAPIArticle[] = data.data || [];

      if (items.length > 0) {
        const filtered = items.filter((item) => isRelevantArticle(item.title, item.description || item.snippet || ""));
        const mapped = filtered.map((item, idx) => mapToNewsArticle(item, idx));
        // Sort by date
        mapped.sort(
          (a, b) => new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime(),
        );
        // Re-mark featured
        if (mapped[0]) {
          mapped[0].isBreaking = true;
          mapped[0].isFeatured = true;
        }
        if (mapped[1]) {
          mapped[1].isFeatured = true;
        }

        setArticles(mapped);
        setLastFetched(new Date());
      } else {
        setArticles(fallbackArticles);
        setError("뉴스를 불러오지 못했습니다. 샘플 데이터를 표시합니다.");
      }
    } catch (e) {
      console.warn("TheNewsAPI fetch error:", e);
      setArticles(fallbackArticles);
      setError("실시간 뉴스를 불러오지 못했습니다. 샘플 데이터를 표시합니다.");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFeeds(language);
    const interval = setInterval(() => fetchFeeds(language), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [language, fetchFeeds]);

  const refresh = useCallback(() => fetchFeeds(language), [language, fetchFeeds]);
  return { articles, isLoading, error, refresh, lastFetched };
};
