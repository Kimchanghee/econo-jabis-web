import { useState, useEffect, useCallback, useRef } from "react";
import { NewsArticle, Language, Category, FALLBACK_IMAGES, fallbackArticles } from "@/data/newsData";

const THENEWSAPI_TOKEN = "s0V715Sqrsg661ZSgkpYxUPxxggdvPXmeTVtBiEW";
const THENEWSAPI_BASE = "https://api.thenewsapi.com/v1/news/all";
const CACHE_DURATION = 5 * 60 * 1000;
const REFRESH_INTERVAL = 10 * 60 * 1000;
const DELETED_KEY = "econojabis_deleted_ids";

// 완전히 관련없는 도메인만 차단
const BLOCKED_DOMAINS = ["blog.naver.com", "blog.daum.net", "cafe.naver.com", "cafe.", "post.naver.com"];

// 명백히 경제와 무관한 키워드만 차단 (최소화)
const BLOCKED_KEYWORDS = [
  "패션",
  "뷰티",
  "맛집",
  "요리",
  "여행",
  "게임",
  "연예",
  "드라마",
  "인테리어",
  "육아",
  "반려",
  "레시피",
  "recipe",
  "gaming",
  "celebrity",
  "entertainment",
  "movie",
  "film",
  "music",
  "fitness",
  "diet",
  "날씨",
  "운세",
  "horoscope",
  "lottery",
  "comedy",
  "viral",
  "gossip",
];

// REQUIRED_KEYWORDS 필터 제거 - API에서 categories로 필터링하므로 불필요
// 카테고리 검색 키워드
const categorySearchMap: Record<Category, string> = {
  전체: "economy OR finance OR market OR stock OR bitcoin OR 경제 OR 주식 OR 금융",
  주식: "stock OR equity OR shares OR kospi OR kosdaq OR 주식 OR 코스피",
  부동산: "real estate OR housing OR 부동산 OR 아파트",
  환율: "forex OR exchange rate OR 환율 OR 달러",
  암호화폐: "bitcoin OR cryptocurrency OR 비트코인 OR 암호화폐",
};

const TRENDING_KEYWORDS_MAP: Record<string, string> = {
  stock: "주식",
  economy: "경제",
  bitcoin: "비트코인",
  inflation: "인플레이션",
  "interest rate": "금리",
  "federal reserve": "연준",
  fed: "연준",
  kospi: "코스피",
  kosdaq: "코스닥",
  nasdaq: "나스닥",
  dow: "다우",
  "s&p": "S&P500",
  gdp: "GDP",
  recession: "경기침체",
  etf: "ETF",
  ipo: "IPO",
  dividend: "배당",
  crypto: "암호화폐",
  ethereum: "이더리움",
  "real estate": "부동산",
  oil: "원유",
  gold: "금값",
  semiconductor: "반도체",
  AI: "AI",
  삼성: "삼성",
  SK: "SK",
  현대: "현대",
  카카오: "카카오",
  네이버: "네이버",
  환율: "환율",
  무역: "무역",
  수출: "수출",
  tesla: "테슬라",
  nvidia: "엔비디아",
  apple: "애플",
  google: "구글",
  코스피: "코스피",
  코스닥: "코스닥",
  비트코인: "비트코인",
  금리: "금리",
  주식: "주식",
  경제: "경제",
  부동산: "부동산",
  반도체: "반도체",
  인공지능: "AI",
  인플레이션: "인플레이션",
  한국은행: "한국은행",
};

interface TheNewsAPIArticle {
  uuid: string;
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  published_at: string;
  source: string;
  categories: string[];
  language: string;
  snippet: string;
}

interface CacheData {
  articles: NewsArticle[];
  timestamp: number;
  language: Language;
}

const CACHE_KEY_PREFIX = "econojabis_cache_";
const ARTICLES_KEY = "econojabis_articles_v1";

function getCache(language: Language): CacheData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + language);
    if (!raw) return null;
    const data: CacheData = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_DURATION) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(language: Language, articles: NewsArticle[]) {
  try {
    const data: CacheData = { articles, timestamp: Date.now(), language };
    localStorage.setItem(CACHE_KEY_PREFIX + language, JSON.stringify(data));
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  } catch {}
}

function isBlocked(article: TheNewsAPIArticle): boolean {
  const url = (article.url || "").toLowerCase();
  if (BLOCKED_DOMAINS.some((d) => url.includes(d))) return true;

  const text = ((article.title || "") + " " + (article.description || "")).toLowerCase();
  if (BLOCKED_KEYWORDS.some((k) => text.includes(k.toLowerCase()))) return true;

  return false;
}

function mapToNewsArticle(a: TheNewsAPIArticle, index: number): NewsArticle {
  const catMap: Record<string, Category> = {
    business: "주식",
    finance: "주식",
    tech: "주식",
    general: "전체",
    science: "전체",
    health: "전체",
    sports: "전체",
    entertainment: "전체",
  };
  const cat: Category = a.categories?.[0] ? catMap[a.categories[0]] || "전체" : "전체";

  return {
    id: a.uuid || `api_${index}`,
    title: a.title,
    summary: a.description || a.snippet || "",

    category: cat,
    source: a.source || "해외뉴스",
    date: a.published_at ? a.published_at.split("T")[0].replace(/-/g, ". ") + "." : "",
    imageUrl: a.image_url || FALLBACK_IMAGES[cat] || FALLBACK_IMAGES["전체"],
    url: a.url,
    isBreaking: index === 0,
    snippet: a.snippet || a.description || "",
  };
}

export function extractTrendingKeywordsFromArticles(articles: NewsArticle[]): string[] {
  const text = articles.map((a) => (a.title + " " + a.summary).toLowerCase()).join(" ");
  const counts: Record<string, number> = {};
  Object.entries(TRENDING_KEYWORDS_MAP).forEach(([eng, kor]) => {
    const count = (text.match(new RegExp(eng, "gi")) || []).length;
    if (count > 0) counts[kor] = (counts[kor] || 0) + count;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k]) => k);
}

async function fetchNewsFromAPI(language: Language, category: Category): Promise<NewsArticle[]> {
  const langMap: Record<Language, string> = {
    ko: "ko",
    en: "en",
    es: "es",
    ja: "ja",
    zh: "zh",
  };

  const categoryMap: Record<string, string> = { "주식": "business", "부동산": "business", "환율": "business", "암호화폐": "tech", "전체": "business,tech,general" };

  const params = new URLSearchParams({
    api_token: THENEWSAPI_TOKEN,
    language: langMap[language] || "en",
        categories: categoryMap[category] || "business,tech,general",
    limit: "30",
    sort: "published_at",
  });

  console.log("[EconoJabis] Fetching news from API...", params.toString());

  const res = await fetch(`${THENEWSAPI_BASE}?${params}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const data = await res.json();
  console.log("[EconoJabis] API response:", data.meta, "articles count:", data.data?.length);

  if (!data.data || data.data.length === 0) {
    console.warn("[EconoJabis] No articles from API, using fallback");
    return [];
  }

  const deletedIds = new Set(JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"));

  const articles = data.data
    .filter((a: TheNewsAPIArticle) => !isBlocked(a) && !deletedIds.has(a.uuid))
    .map((a: TheNewsAPIArticle, i: number) => mapToNewsArticle(a, i));

  console.log("[EconoJabis] Filtered articles:", articles.length);
  return articles;
}

export function useTheNewsApi(language: Language = "ko", category: Category = "전체") {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchArticles = useCallback(
    async (force = false) => {
      if (!force) {
        const cached = getCache(language);
        if (cached && cached.articles.length > 0) {
          // 캐시 기사가 모두 fallback이면 강제 재fetch
          const allFallback = cached.articles.every((a) => a.id.startsWith("f"));
          if (!allFallback) {
            console.log("[EconoJabis] Using cache", cached.articles.length, "articles");
            setArticles(cached.articles);
            setIsLoading(false);
            return;
          }
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetched = await fetchNewsFromAPI(language, category);
        if (fetched.length > 0) {
          setArticles(fetched);
          setCache(language, fetched);
          setLastFetched(new Date());
        } else {
          console.warn("[EconoJabis] Falling back to static articles");
          setArticles(fallbackArticles);
          setCache(language, fallbackArticles);
        }
      } catch (err) {
        console.error("[EconoJabis] Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        const cached = getCache(language);
        if (cached && cached.articles.length > 0) {
          setArticles(cached.articles);
        } else {
          setArticles(fallbackArticles);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [language, category],
  );

  useEffect(() => {
    // 캐시 클리어 후 즉시 fetch
    const cached = getCache(language);
    const allFallback = cached?.articles.every((a) => a.id.startsWith("f")) ?? true;
    fetchArticles(allFallback);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchArticles(true);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [language, category, fetchArticles]);

  const refresh = useCallback(() => fetchArticles(true), [fetchArticles]);

  const deleteArticle = useCallback((id: string) => {
    try {
      const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
      deleted.push(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    } catch {}
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const extractTrendingKeywords = useCallback(() => {
    return extractTrendingKeywordsFromArticles(articles);
  }, [articles]);

  return {
    articles,
    isLoading,
    error,
    lastFetched,
    refresh,
    deleteArticle,
    extractTrendingKeywords,
  };
}
