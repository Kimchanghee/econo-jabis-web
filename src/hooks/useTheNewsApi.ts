import { useState, useEffect, useCallback } from 'react';
import { NewsArticle, Language, Category, FALLBACK_IMAGES, fallbackArticles } from '@/data/newsData';

const THENEWSAPI_TOKEN = 's0V715Sqrsg661ZSgkpYxUPxxggdvPXmeTVtBiEW';
const THENEWSAPI_BASE = 'https://api.thenewsapi.com/v1/news/all';
const CACHE_DURATION = 30 * 60 * 1000; // 30분

const langMap: Record<Language, string> = {
  ko: 'ko', en: 'en', es: 'es', ja: 'ja', zh: 'zh',
};

const detectCategory = (title: string, description: string): Category => {
  const text = (title + ' ' + description).toLowerCase();
  const keywords: Record<Category, string[]> = {
    '주식': ['stock', 'equity', 'shares', 'market', 'nasdaq', 's&p', 'kospi', '주식', '증시', '株', '股票'],
    '부동산': ['real estate', 'housing', 'property', '부동산', '아파트', '不動産', '房产'],
    '환율': ['forex', 'exchange rate', 'currency', 'dollar', '환율', '달러', '為替', '汇率'],
    '암호화폐': ['bitcoin', 'crypto', 'blockchain', 'ethereum', 'btc', '비트코인', '仮想通貨', '加密'],
    '전체': [],
  };
  for (const [cat, words] of Object.entries(keywords)) {
    if (cat === '전체') continue;
    if (words.some(w => text.includes(w))) return cat as Category;
  }
  return '주식';
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

interface CacheEntry {
  articles: NewsArticle[];
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};

const mapToNewsArticle = (item: TheNewsAPIArticle, idx: number): NewsArticle => {
  const category = detectCategory(item.title, item.description || item.snippet || '');
  const date = item.published_at ? item.published_at.split('T')[0] : new Date().toISOString().split('T')[0];
  return {
    id: item.uuid || `news-${idx}-${Date.now()}`,
    title: item.title,
    description: item.description || item.snippet || '',
    summary: item.snippet || '',
    category,
    source: item.source || 'TheNewsAPI',
    date,
    publishedAt: item.published_at || date,
    imageUrl: item.image_url || FALLBACK_IMAGES[category],
    url: item.url,
    isBreaking: idx === 0,
    isFeatured: idx < 2,
    language: item.language as Language,
  };
};

// localStorage 캐시 읽기/쓰기
const getCachedData = (lang: Language): NewsArticle[] | null => {
  try {
    // 메모리 캐시 먼저
    if (cache[lang] && Date.now() - cache[lang].timestamp < CACHE_DURATION) {
      return cache[lang].articles;
    }
    // localStorage 캐시
    const raw = localStorage.getItem(`thenewsapi_${lang}`);
    if (raw) {
      const parsed: CacheEntry = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        cache[lang] = parsed; // 메모리에도 저장
        return parsed.articles;
      }
    }
  } catch { /* ignore */ }
  return null;
};

const setCachedData = (lang: Language, articles: NewsArticle[]) => {
  const entry: CacheEntry = { articles, timestamp: Date.now() };
  cache[lang] = entry;
  try {
    localStorage.setItem(`thenewsapi_${lang}`, JSON.stringify(entry));
  } catch { /* quota exceeded 등 무시 */ }
};

export const useTheNewsApi = (language: Language) => {
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    return getCachedData(language) || fallbackArticles;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = useCallback(async (lang: Language, force = false) => {
    // 캐시 확인 (강제 새로고침이 아닌 경우)
    if (!force) {
      const cached = getCachedData(lang);
      if (cached) {
        setArticles(cached);
        setLastFetched(new Date(cache[lang]?.timestamp || Date.now()));
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `${THENEWSAPI_BASE}?api_token=${THENEWSAPI_TOKEN}&categories=business&language=en&limit=10`;

      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const BLOCKED_DOMAINS = ['blog.naver.com', 'blog.daum.net', 'tistory.com', 'blogspot.com', 'medium.com', 'cafe.naver.com'];
      const BLOCKED_KEYWORDS = ['패션', '뷰티', '맛집', '요리', '여행', '게임', '연예', '드라마', '포엣', '리파', '포카라', '블로그', '인테리어', '육아', '반려', '레시피'];
      const items: TheNewsAPIArticle[] = (data.data || []).filter(
        (item: TheNewsAPIArticle) =>
          !BLOCKED_DOMAINS.some(d => item.url?.includes(d)) &&
          !BLOCKED_KEYWORDS.some(kw => item.title?.includes(kw))
      );

      if (items.length > 0) {
        const mapped = items.map((item, idx) => mapToNewsArticle(item, idx));
        mapped.sort((a, b) => new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime());
        if (mapped[0]) { mapped[0].isBreaking = true; mapped[0].isFeatured = true; }
        if (mapped[1]) { mapped[1].isFeatured = true; }

        setArticles(mapped);
        setCachedData(lang, mapped);
        setLastFetched(new Date());
      } else {
        setArticles(fallbackArticles);
        setError('뉴스를 불러오지 못했습니다. 샘플 데이터를 표시합니다.');
      }
    } catch (e) {
      console.warn('TheNewsAPI fetch error:', e);
      setArticles(fallbackArticles);
      setError('실시간 뉴스를 불러오지 못했습니다. 샘플 데이터를 표시합니다.');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNews(language);
    const interval = setInterval(() => fetchNews(language), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [language, fetchNews]);

  const refresh = useCallback(() => fetchNews(language, true), [language, fetchNews]);
  return { articles, isLoading, error, refresh, lastFetched };
};
