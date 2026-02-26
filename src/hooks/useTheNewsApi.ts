import { useState, useEffect, useCallback } from 'react';

export interface NewsArticle {
  id: string;
  uuid: string;
  title: string;
  description: string;
  keywords: string;
  snippet: string;
  url: string;
  image_url: string;
  imageUrl: string;
  language: string;
  published_at: string;
  source: string;
  categories: string[];
  category: string;
  date: string;
  relevance_score: number | null;
  locale: string;
  isBreaking: boolean;
  summary: string;
}

const BLOCKED_KEYWORDS = [
  '대학교', '대학원', '동아리', '입학', '캠퍼스', '총장', '교수',
  '성균관대', 'KAIST', '카이스트', '서울대', '연세대', '고려대', '한양대', '인천대',
  '충남대', '방송대', '경북대', '부산대', '전남대', '광주대', '제주대',
  '숙명여대', '이화여대', '홍익대', 'POSTECH', '포스텍', 'UNIST',
  '야구', '축구', '농구', '배구', '골프', '테니스', '올림픽', '월드컵',
  '아이돌', '드라마', '영화', '연예', '가수', '배우', '공연', '콘서트',
  '지역축제', '관광', '맛집', '레시피', '요리', '건강식품',
  '졸업식', '입학식', '학술대회', '논문', '연구팀', '실험실',
];

const REQUIRED_KEYWORDS = [
  '주식', '코스피', '코스닥', '증시', '금리', '환율', '경제', '금융', '투자',
  '펀드', '채권', 'ETF', '인플레이션', 'GDP', '무역', '수출', '수입', '관세',
  '연준', 'Fed', '기준금리', '통화정책', '재정', '세금', '예산', '부채',
  '삼성', 'SK', '현대', 'LG', '포스코', '카카오', '네이버',
  '테슬라', '애플', '구글', '마이크로소프트', '아마존', '엔비디아',
  '반도체', '배터리', '전기차', '에너지', '원자력',
  '비트코인', '이더리움', '암호화폐', '가상자산', '블록체인',
  '부동산', '아파트', '청약', '재개발',
  '달러', '엔화', '유로', '위안화', '원유', '금값',
  '기업', '상장', 'IPO', '인수합병', '실적', '매출', '영업이익',
  '트럼프', '관세정책', '무역전쟁', '경기', '물가', 'CPI',
  'business', 'economy', 'market', 'stock', 'finance', 'trade',
];

function isEconomicNews(article: Partial<NewsArticle>): boolean {
  const title = (article.title || '');
  const text = (title + ' ' + (article.description || '') + ' ' + (article.snippet || '')).toLowerCase();

  for (const blocked of BLOCKED_KEYWORDS) {
    if (title.toLowerCase().includes(blocked.toLowerCase())) {
      return false;
    }
  }

  for (const required of REQUIRED_KEYWORDS) {
    if (text.includes(required.toLowerCase())) {
      return true;
    }
  }

  const cats = article.categories || [];
  if (cats.some(c => ['business', 'finance', 'economics', 'markets', 'technology', 'crypto'].includes(c.toLowerCase()))) {
    return true;
  }

  return false;
}

function mapArticle(raw: Record<string, unknown>): NewsArticle {
  const cats = (raw.categories as string[]) || [];
  const catLabel = cats[0] || '전체';
  return {
    id: (raw.uuid as string) || String(Math.random()),
    uuid: (raw.uuid as string) || '',
    title: (raw.title as string) || '',
    description: (raw.description as string) || '',
    keywords: (raw.keywords as string) || '',
    snippet: (raw.snippet as string) || '',
    url: (raw.url as string) || '',
    image_url: (raw.image_url as string) || '',
    imageUrl: (raw.image_url as string) || '',
    language: (raw.language as string) || '',
    published_at: (raw.published_at as string) || '',
    source: (raw.source as string) || '',
    categories: cats,
    category: catLabel,
    date: (raw.published_at as string) || '',
    relevance_score: (raw.relevance_score as number) || null,
    locale: (raw.locale as string) || '',
    isBreaking: false,
    summary: (raw.description as string) || '',
  };
}

const API_KEY = 'BVlhq4TG29ylhFWB2VIb8GBjHnNVTaYU0lYl9AMI';

export const useTheNewsApi = (language = 'ko') => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const lang = language === 'ko' ? 'ko,en' : language + ',en';
      const url = `https://api.thenewsapi.com/v1/news/top?api_token=${API_KEY}&language=${lang}&categories=business,finance,economics,markets,technology&limit=50`;
      const res = await fetch(url);
      const data = await res.json();
      const raw: Record<string, unknown>[] = data.data || [];
      const mapped = raw.map(mapArticle);
      const filtered = mapped.filter(isEconomicNews);
      setArticles(filtered);
      setLastFetched(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류 발생');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const extractTrendingKeywords = useCallback(() => {
    const freq: Record<string, number> = {};
    for (const article of articles) {
      const words = (article.title + ' ' + article.keywords).split(/\s+/);
      for (const w of words) {
        const cleaned = w.replace(/[^\w가-힣]/g, '');
        if (cleaned.length > 1) {
          freq[cleaned] = (freq[cleaned] || 0) + 1;
        }
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }, [articles]);

  return { articles, isLoading, error, lastFetched, refresh: fetchNews, extractTrendingKeywords };
};