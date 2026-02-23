import { useState, useEffect, useCallback } from "react";
import { NewsArticle, Language, Category, FALLBACK_IMAGES, fallbackArticles } from "@/data/newsData";

const THENEWSAPI_TOKEN = "s0V715Sqrsg661ZSgkpYxUPxxggdvPXmeTVtBiEW";
const THENEWSAPI_BASE = "https://api.thenewsapi.com/v1/news/all";
const CACHE_DURATION = 30 * 60 * 1000;

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
    "revenue", "profit", "quarterly", "merger", "acquisition", "corporate",
    "실적", "매출", "영업이익", "순이익", "기업", "분기", "인수합병",
    "bitcoin", "crypto", "cryptocurrency", "blockchain", "ethereum",
    "btc", "eth", "defi", "nft", "coin", "binance", "upbit",
    "비트코인", "암호화폐", "블록체인", "이더리움", "코인", "업비트", "빗썸",
    "bank", "banking", "insurance", "fintech", "은행", "보험", "핀테크",
  ];

interface CacheEntry {
    articles: NewsArticle[];
    timestamp: number;
}

let memoryCache: Record<string, CacheEntry> = {};

const detectCategory = (title: string, description: string): Category => {
    const text = (title + " " + description).toLowerCase();
    const map: Record<string, string[]> = {
          "주식": ["stock", "equity", "shares", "nasdaq", "kospi", "주식", "증시", "주가", "코스피", "코스닥", "나스닥", "ipo", "earnings", "dividend"],
          "부동산": ["real estate", "housing", "property", "부동산", "아파트"],
          "환율": ["forex", "exchange rate", "currency", "dollar", "환율", "달러"],
          "암호화폐": ["bitcoin", "crypto", "blockchain", "ethereum", "btc", "eth", "coin", "비트코인", "암호화폐", "블록체인", "코인"],
    };
    for (const [cat, words] of Object.entries(map)) {
          if (words.some(w => text.includes(w))) return cat as Category;
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

const isBlockedSource = (url: string, source: string) =>
    BLOCKED_DOMAINS.some(d => (url + " " + source).toLowerCase().includes(d));

const isBlockedTitle = (title: string) =>
    BLOCKED_KEYWORDS.some(k => title.toLowerCase().includes(k.toLowerCase()));

const isFinanceArticle = (title: string, description: string) => {
    const text = (title + " " + (description || "")).toLowerCase();
    return REQUIRED_KEYWORDS.some(k => text.includes(k.toLowerCase()));
};

const getCachedData = (key: string): NewsArticle[] | null => {
    try {
          if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION)
                  return memoryCache[key].articles;
          const raw = localStorage.getItem(`thenewsapi_v3_${key}`);
          if (raw) {
                  const parsed: CacheEntry = JSON.parse(raw);
                  if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                            memoryCache[key] = parsed;
                            return parsed.articles;
                  }
          }
    } catch {}
    return null;
};

const setCachedData = (key: string, articles: NewsArticle[]) => {
    const entry: CacheEntry = { articles, timestamp: Date.now() };
    memoryCache[key] = entry;
    try { localStorage.setItem(`thenewsapi_v3_${key}`, JSON.stringify(entry)); } catch {}
};

export const useTheNewsApi = (language: Language = "ko") => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);

    const fetchNews = useCallback(async (force = false) => {
          const cacheKey = "finance_en";
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
                  const params = new URLSearchParams({
                            api_token: THENEWSAPI_TOKEN,
                            language: "en",
                            categories: "business",
                            limit: "50",
                  });
                  const res = await fetch(`${THENEWSAPI_BASE}?${params}`, {
                            signal: AbortSignal.timeout(10000),
                  });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const data = await res.json();
                  const items: TheNewsAPIArticle[] = data.data || [];
                  if (items.length > 0) {
                            const filtered = items.filter(item =>
                                        !isBlockedSource(item.url, item.source) &&
                                        !isBlockedTitle(item.title) &&
                                        isFinanceArticle(item.title, item.description || item.snippet || "")
                                                                 );
                            const mapped = filtered.map((item, idx) => mapToNewsArticle(item, idx));
                            mapped.sort((a, b) =>
                                        new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime()
                                               );
                            if (mapped[0]) { mapped[0].isBreaking = true; mapped[0].isFeatured = true; }
                            if (mapped[1]) { mapped[1].isFeatured = true; }
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

    useEffect(() => { fetchNews(); }, [fetchNews]);

    return { articles, isLoading, error, lastFetched, refresh: () => fetchNews(true) };
};
          }
          }
                  }
                  }
                  })
                  })
          }
                  }
          }
    })
}
}
                  }
          }
    }
}
}
    }
}
}
    }
    }
}
}
]
]
]