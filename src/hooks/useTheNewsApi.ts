import { useState, useEffect, useCallback, useRef } from "react";
import { NewsArticle, Language, Category, FALLBACK_IMAGES, fallbackArticles } from "@/data/newsData";

const THENEWSAPI_TOKEN = "s0V715Sqrsg661ZSgkpYxUPxxggdvPXmeTVtBiEW";
const THENEWSAPI_BASE = "https://api.thenewsapi.com/v1/news/all";
const CACHE_DURATION = 5 * 60 * 1000;
const REFRESH_INTERVAL = 10 * 60 * 1000;
const DELETED_KEY = "econojabis_deleted_ids";

const BLOCKED_DOMAINS = [
  "blog.naver.com", "blog.daum.net", "tistory.com",
  "blogspot.com", "medium.com", "cafe.naver.com",
  "blog.", "cafe.", "post.naver.com",
];

const BLOCKED_KEYWORDS = [
  "패션", "뷰티", "맛집", "요리", "여행", "게임", "연예", "드라마",
  "인테리어", "육아", "반려", "레시피", "fashion", "beauty", "recipe",
  "travel", "gaming", "celebrity", "sports", "스포츠", "entertainment",
  "movie", "film", "music", "health", "fitness", "diet", "weather",
  "날씨", "운세", "horoscope", "lottery", "comedy", "viral", "gossip",
];

const REQUIRED_KEYWORDS = [
  "stock", "equity", "shares", "nasdaq", "s&p", "dow", "kospi", "kosdaq",
  "ipo", "earnings", "dividend", "wall street", "etf", "fund", "trading",
  "investor", "market cap", "valuation",
  "주식", "증시", "상장", "배당", "투자", "펀드", "코스피", "코스닥",
  "주가", "나스닥", "다우", "매수", "매도",
  "economy", "economic", "finance", "financial", "gdp", "inflation",
  "interest rate", "federal reserve", "central bank", "recession",
  "경제", "금융", "금리", "물가", "인플레이션", "환율", "무역", "수출",
  "기준금리", "한국은행", "연준", "fed", "ecb",
  "bitcoin", "crypto", "blockchain", "ethereum", "btc",
  "비트코인", "암호화폐", "블록체인", "이더리움", "코인",
  "부동산", "아파트", "전세", "월세", "분양", "housing", "real estate", "mortgage",
  "oil", "gold", "commodity", "원유", "금값", "원자재",
  "삼성", "SK", "현대", "LG", "카카오", "네이버", "apple", "google", "tesla", "nvidia",
  "반도체", "semiconductor", "AI", "인공지능", "tech",
];

const TRENDING_KEYWORDS_MAP: Record<string, string> = {
  "stock": "주식", "economy": "경제", "bitcoin": "비트코인",
  "inflation": "인플레이션", "interest rate": "금리",
  "federal reserve": "연준", "fed": "연준", "kospi": "코스피",
  "kosdaq": "코스닥", "nasdaq": "나스닥", "dow": "다우",
  "s&p": "S&P500", "gdp": "GDP", "recession": "경기침체",
  "etf": "ETF", "ipo": "IPO", "dividend": "배당",
  "crypto": "암호화폐", "ethereum": "이더리움",
  "real estate": "부동산", "oil": "원유", "gold": "금값",
  "semiconductor": "반도체", "AI": "AI",
  "삼성": "삼성", "SK": "SK", "현대": "현대",
  "카카오": "카카오", "네이버": "네이버",
  "환율": "환율", "무역": "무역", "수출": "수출",
  "tesla": "테슬라", "nvidia": "엔비디아",
  "apple": "애플", "google": "구글",
  "코스피": "코스피", "코스닥": "코스닥",
  "비트코인": "비트코인", "금리": "금리",
  "주식": "주식", "경제": "경제", "부동산": "부동산",
  "반도체": "반도체", "인공지능": "AI",
  "인플레이션": "인플레이션", "한국은행": "한국은행",
};

interface TheNewsAPIArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string;
  source: string;
  categories: string[];
  published_at: string;
  language: string;
}

interface CachedData {
  articles: NewsArticle[];
  timestamp: number;
}

const isBlockedSource = (url: string, source: string): boolean => {
  const lowerUrl = url.toLowerCase();
  const lowerSource = source.toLowerCase();
  return BLOCKED_DOMAINS.some(d => lowerUrl.includes(d) || lowerSource.includes(d));
};

const isBlockedTitle = (title: string): boolean => {
  const lower = title.toLowerCase();
  return BLOCKED_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
};

const isFinanceArticle = (title: string, description: string): boolean => {
  const text = (title + " " + description).toLowerCase();
  return REQUIRED_KEYWORDS.some(k => text.includes(k.toLowerCase()));
};

const getDeletedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const deduplicateArticles = (articles: NewsArticle[]): NewsArticle[] => {
  const seen = new Map<string, boolean>();
  const deletedIds = getDeletedIds();
  return articles.filter(a => {
    if (deletedIds.includes(a.id)) return false;
    const normTitle = a.title.toLowerCase().replace(/[^a-z0-9\uAC00-\uD7AF]/g, "").slice(0, 50);
    if (seen.has(normTitle)) return false;
    seen.set(normTitle, true);
    return true;
  });
};

export const extractTrendingKeywords = (articles: NewsArticle[]): { keyword: string; count: number }[] => {
  const freq = new Map<string, number>();
  articles.forEach(a => {
    const text = (a.title + " " + (a.description || "")).toLowerCase();
    Object.entries(TRENDING_KEYWORDS_MAP).forEach(([key]) => {
      if (text.includes(key.toLowerCase())) {
        const display = TRENDING_KEYWORDS_MAP[key];
        freq.set(display, (freq.get(display) || 0) + 1);
      }
    });
  });
  return Array.from(freq.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

const getCachedData = (key: string): CachedData | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data: CachedData = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch { return null; }
};

const setCachedData = (key: string, articles: NewsArticle[]) => {
  localStorage.setItem(key, JSON.stringify({ articles, timestamp: Date.now() }));
};

const mapToNewsArticle = (a: TheNewsAPIArticle, idx: number): NewsArticle => {
  const categoryMap: Record<string, Category> = {
    business: "economy", tech: "stock", politics: "economy",
    finance: "stock", science: "tech", general: "economy",
  };
  const cat = a.categories?.[0] || "general";
  const mapped = categoryMap[cat] || "economy";
  return {
    id: a.uuid || `news-${Date.now()}-${idx}`,
    title: a.title,
    description: a.description || a.snippet || "",
    content: a.description || a.snippet || a.title,
    source: a.source || "뉴스",
    sourceUrl: a.url,
    imageUrl: a.image_url || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
    category: mapped as Category,
    publishedAt: a.published_at || new Date().toISOString(),
    isBreaking: false,
    isFeatured: false,
  };
};

export const useTheNewsApi = (language: Language = "ko") => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchArticles = useCallback(async () => {
    const cacheKey = "econojabis_cache_" + language;
    const cached = getCachedData(cacheKey);
    if (cached) {
      const deduped = deduplicateArticles(cached.articles);
      setArticles(deduped);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        api_token: THENEWSAPI_TOKEN,
        language: language === "ko" ? "ko" : "en",
        categories: "business,tech,politics",
        limit: "50",
      });
      if (language === "ko") {
        params.set("search", "경제 OR 주식 OR 금융 OR 투자 OR 코스피 OR 환율 OR 금리 OR 비트코인 OR 부동산 OR 반도체");
      } else {
        params.set("search", "economy OR stock OR finance OR Wall Street OR Federal Reserve OR Bitcoin OR GDP OR inflation");
      }
      const res = await fetch(`${THENEWSAPI_BASE}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      let mapped: NewsArticle[] = (json.data || [])
        .filter((a: TheNewsAPIArticle) => a.title && a.url && !isBlockedSource(a.url, a.source || "") && !isBlockedTitle(a.title) && isFinanceArticle(a.title, a.description || a.snippet || ""))
        .map((a: TheNewsAPIArticle, idx: number) => mapToNewsArticle(a, idx));
      mapped = deduplicateArticles(mapped);
      if (mapped.length === 0) {
        mapped = deduplicateArticles(fallbackArticles.filter((a) => !language || a.category));
      }
      if (mapped.length > 0) { mapped[0].isFeatured = true; mapped[0].isBreaking = true; }
      if (mapped.length > 1) { mapped[1].isFeatured = true; }
      setCachedData(cacheKey, mapped);
      setArticles(mapped);
      setLastFetched(new Date());
    } catch (e: any) {
      console.warn("TheNewsAPI error:", e);
      setError("뉴스 로딩 실패 - 임시 데이터를 표시합니다.");
      setArticles(deduplicateArticles(fallbackArticles));
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const refresh = useCallback(() => {
    localStorage.removeItem("econojabis_cache_" + language);
    fetchArticles();
  }, [language, fetchArticles]);

  useEffect(() => {
    fetchArticles();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      localStorage.removeItem("econojabis_cache_" + language);
      fetchArticles();
    }, REFRESH_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchArticles, language]);

  return { articles, isLoading, error, lastFetched, refresh, extractTrendingKeywords: () => extractTrendingKeywords(articles) };
};
