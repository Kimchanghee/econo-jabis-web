import { useState, useEffect, useCallback } from "react";
import { NewsArticle, Language, Category, FALLBACK_IMAGES, fallbackArticles } from "@/data/newsData";

const THENEWSAPI_TOKEN = "s0V715Sqrsg661ZSgkpYxUPxxggdvPXmeTVtBiEW";
const THENEWSAPI_BASE = "https://api.thenewsapi.com/v1/news/all";
const CACHE_DURATION = 30 * 60 * 1000; // 30분

// 필터링할 블로그/비경제 도메인
const BLOCKED_DOMAINS = [
  "blog.naver.com",
  "blog.daum.net",
  "tistory.com",
  "blogspot.com",
  "medium.com",
  "cafe.naver.com",
  "blog.",
  "cafe.",
  "post.naver.com",
];

// 비경제 뉴스 차단 키워드 (블랙리스트)
const BLOCKED_KEYWORDS = [
  "패션",
  "뷰티",
  "맛집",
  "요리",
  "여행",
  "게임",
  "연예",
  "드라마",
  "포멧",
  "리파",
  "포카라",
  "블로그",
  "인테리어",
  "육아",
  "반려",
  "레시피",
  "poetcore",
  "fashion",
  "beauty",
  "recipe",
  "travel",
  "gaming",
  "celebrity",
  "sports",
  "스포츠",
  "entertainment",
  "movie",
  "film",
  "music",
  "health",
  "fitness",
  "diet",
  "weather",
  "날씨",
  "운세",
  "horoscope",
  "lottery",
  "comedy",
  "viral",
  "tiktok",
  "instagram",
  "youtube",
  "influencer",
  "wedding",
  "결혼",
  "divorce",
  "이혼",
  "scandal",
  "gossip",
];

// 경제/금융/주식/크립토 관련 필수 허용 키워드 (화이트리스트) - 이 중 하나라도 포함해야 통과
const REQUIRED_KEYWORDS = [
  // 주식/증시
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
  "bull",
  "bear",
  "rally",
  "index",
  "fund",
  "etf",
  "portfolio",
  "trading",
  "investor",
  "valuation",
  "주식",
  "증시",
  "상장",
  "배당",
  "투자",
  "펀드",
  "코스피",
  "코스닥",
  "주가",
  "나스닥",
  "다우",
  "상승",
  "하락",
  "매수",
  "매도",
  // 경제/금융
  "economy",
  "economic",
  "finance",
  "financial",
  "gdp",
  "inflation",
  "interest rate",
  "federal reserve",
  "central bank",
  "monetary",
  "recession",
  "growth",
  "market",
  "fiscal",
  "trade",
  "export",
  "import",
  "경제",
  "금융",
  "금리",
  "물가",
  "인플레이션",
  "환율",
  "무역",
  "수출",
  "수입",
  "기준금리",
  "한국은행",
  "연준",
  "fed",
  "ecb",
  // 기업분석
  "revenue",
  "profit",
  "earnings",
  "quarterly",
  "annual report",
  "merger",
  "acquisition",
  "ipo",
  "corporate",
  "ceo",
  "cfo",
  "실적",
  "매출",
  "영업이익",
  "순이익",
  "기업",
  "분기",
  "인수합병",
  "상장기업",
  "코스닥기업",
  "유가증권",
  // 크립토/암호화폐
  "bitcoin",
  "crypto",
  "cryptocurrency",
  "blockchain",
  "ethereum",
  "btc",
  "eth",
  "defi",
  "nft",
  "token",
  "coin",
  "web3",
  "altcoin",
  "stablecoin",
  "mining",
  "wallet",
  "exchange",
  "binance",
  "upbit",
  "비트코인",
  "암호화폐",
  "블록체인",
  "이더리움",
  "코인",
  "토큰",
  "디파이",
  "업비트",
  "빗썸",
  // 부동산/자산
  "real estate",
  "reits",
  "property investment",
  "부동산투자",
  "리츠",
  // 은행/보험
  "bank",
  "banking",
  "insurance",
  "fintech",
  "은행",
  "금융",
  "보험",
  "핀테크",
];

// 경제/금융/주식/크립토 API 검색 쿼리
const FINANCE_SEARCH_QUERY =
  "stock OR economy OR finance OR crypto OR bitcoin OR earnings OR market OR investment OR IPO OR merger OR acquisition OR GDP OR inflation OR 주식 OR 경제 OR 기업 OR 암호화폐 OR 코스피 OR 나스닥 OR 실적 OR 금융";

interface CacheEntry {
  articles: NewsArticle[];
  timestamp: number;
}

let memoryCache: Record<string, CacheEntry> = {};

const detectCategory = (title: string, description: string): Category => {
  const text = (title + " " + description).toLowerCase();
  const keywords: Record<Category, string[]> = {
    주식: [
      "stock",
      "equity",
      "shares",
      "market",
      "nasdaq",
      "s&p",
      "kospi",
      "주식",
      "증시",
      "ipo",
      "earnings",
      "dividend",
      "wall street",
      "bull",
      "bear",
      "rally",
      "주가",
      "코스피",
      "코스닥",
      "나스닥",
      "다우",
      "상장",
      "배당",
      "투자",
    ],
    부동산: ["real estate", "housing", "property", "부동산", "아파트", "不動産", "房产"],
    환율: ["forex", "exchange rate", "currency", "dollar", "euro", "yen", "won", "환율", "달러", "為替", "汇率"],
    암호화폐: [
      "bitcoin",
      "crypto",
      "blockchain",
      "ethereum",
      "btc",
      "eth",
      "defi",
      "nft",
      "token",
      "coin",
      "web3",
      "altcoin",
      "stablecoin",
      "binance",
      "upbit",
      "비트코인",
      "암호화폐",
      "블록체인",
      "이더리움",
      "코인",
      "토큰",
      "디파이",
      "업비트",
      "빗썸",
    ],
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
    summary: item.snippet || item.description || "",
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

const isBlockedSource = (url: string, source: string): boolean => {
  const combined = (url + " " + source).toLowerCase();
  return BLOCKED_DOMAINS.some((d) => combined.includes(d));
};

const isBlockedTitle = (title: string): boolean => {
  const lower = title.toLowerCase();
  return BLOCKED_KEYWORDS.some((k) => lower.includes(k.toLowerCase()));
};

const isFinanceArticle = (title: string, description: string): boolean => {
  const text = (title + " " + (description || "")).toLowerCase();
  return REQUIRED_KEYWORDS.some((k) => text.includes(k.toLowerCase()));
};

const getCachedData = (lang: string): NewsArticle[] | null => {
  try {
    if (memoryCache[lang] && Date.now() - memoryCache[lang].timestamp < CACHE_DURATION) {
      return memoryCache[lang].articles;
    }
    const raw = localStorage.getItem(`thenewsapi_v2_${lang}`);
    if (raw) {
      const parsed: CacheEntry = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        memoryCache[lang] = parsed;
        return parsed.articles;
      }
    }
  } catch {}
  return null;
};

const setCachedData = (lang: string, articles: NewsArticle[]) => {
  const entry: CacheEntry = { articles, timestamp: Date.now() };
  memoryCache[lang] = entry;
  try {
    localStorage.setItem(`thenewsapi_v2_${lang}`, JSON.stringify(entry));
  } catch {}
};

export const useTheNewsApi = (language: Language = "ko") => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = useCallback(async (force = false) => {
    const cacheKey = "en"; // 영어로 고정 - 무료 플랜 최고 품질

    if (!force) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setArticles(cached);
        setLastFetched(new Date(memoryCache[cacheKey]?.timestamp || Date.now()));
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // 경제/주식/기업분석/크립토 뉴스만 검색
      const params = new URLSearchParams({
        api_token: THENEWSAPI_TOKEN,
        language: "en",
        categories: "business,tech",
        search: FINANCE_SEARCH_QUERY,
        limit: "50",
      });

      const res = await fetch(`${THENEWSAPI_BASE}?${params}`, {
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const items: TheNewsAPIArticle[] = data.data || [];

      if (items.length > 0) {
        const filtered = items.filter(
          (item) =>
            !isBlockedSource(item.url, item.source) &&
            !isBlockedTitle(item.title) &&
            isFinanceArticle(item.title, item.description || item.snippet || ""),
        );

        const mapped = filtered.map((item, idx) => mapToNewsArticle(item, idx));
        mapped.sort(
          (a, b) => new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime(),
        );
        if (mapped[0]) {
          mapped[0].isBreaking = true;
          mapped[0].isFeatured = true;
        }
        if (mapped[1]) {
          mapped[1].isFeatured = true;
        }

        setCachedData(cacheKey, mapped);
        setArticles(mapped);
        setLastFetched(new Date());
      } else {
        setArticles(fallbackArticles);
        setError("뉴스를 불러오지 못했습니다.");
      }
    } catch (e) {
      console.warn("TheNewsAPI error:", e);
      setArticles(fallbackArticles);
      setError("뉴스 로딩 실패 - 임시 데이터를 표시합니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, isLoading, error, lastFetched, refresh: () => fetchNews(true) };
};
