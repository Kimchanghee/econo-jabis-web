import { useState, useEffect } from 'react';

export interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  keywords: string;
  snippet: string;
  url: string;
  image_url: string;
  language: string;
  published_at: string;
  source: string;
  categories: string[];
  relevance_score: number | null;
  locale: string;
}

interface UseTheNewsApiOptions {
  category?: string;
  searchQuery?: string;
  page?: number;
}

const BLOCKED_KEYWORDS = [
  '대학교', '대학원', '학교', '동아리', '입학', '캠퍼스', '총장', '교수', '학생',
  '성균관대', 'KAIST', '카이스트', '서울대', '연세대', '고려대', '한양대', '인천대',
  '충남대', '방송대', '경북대', '부산대', '전남대', '광주대', '제주대', '숙명여대',
  '이화여대', '홍익대', 'POSTECH', '포스텍', '울산과기원', 'UNIST',
  '야구', '축구', '농구', '배구', '골프', '테니스', '올림픽', '월드컵', '스포츠',
  '아이돌', '드라마', '영화', '연예', '가수', '배우', '공연', '콘서트', '음악방송',
  '지역축제', '관광', '여행', '맛집', '레시피', '요리', '건강식품', '다이어트',
  '졸업식', '입학식', '학술대회', '논문', '연구팀', '실험실', '학부',
];

const REQUIRED_KEYWORDS = [
  '주식', '코스피', '코스닥', '증시', '금리', '환율', '경제', '금융', '투자', '펀드',
  '채권', '파생상품', 'ETF', '인플레이션', 'GDP', '무역', '수출', '수입', '관세',
  '연준', 'Fed', '기준금리', '통화정책', '재정정책', '세금', '예산', '부채',
  '삼성전자', 'SK하이닉스', '현대차', '기아', 'LG전자', '포스코', '카카오', '네이버',
  '테슬라', '애플', '구글', '마이크로소프트', '아마존', '엔비디아', '메타',
  'AI', '반도체', '배터리', '전기차', '신재생에너지', '원자력',
  '비트코인', '이더리움', '암호화폐', '가상자산', '블록체인',
  '부동산', '아파트', '청약', '재개발', '공급', '금리인상', '금리인하',
  '원달러', '달러', '엔화', '유로', '위안화', '원유', '금값',
  '기업', '상장', 'IPO', '인수합병', 'M&A', '실적', '매출', '영업이익', '순이익',
  '트럼프', '관세정책', '무역전쟁', '경기침체', '경기회복', '물가', 'CPI', 'PPI',
];

function isEconomicNews(article: NewsArticle): boolean {
  const text = ((article.title || '') + ' ' + (article.description || '') + ' ' + (article.snippet || '')).toLowerCase();
  const titleLower = (article.title || '').toLowerCase();

  for (const blocked of BLOCKED_KEYWORDS) {
    if (titleLower.includes(blocked.toLowerCase())) {
      return false;
    }
  }

  for (const required of REQUIRED_KEYWORDS) {
    if (text.includes(required.toLowerCase())) {
      return true;
    }
  }

  const cats = article.categories || [];
  const economicCats = ['business', 'finance', 'economics', 'markets', 'technology', 'crypto'];
  const hasEconomicCat = cats.some(c => economicCats.includes(c.toLowerCase()));
  if (hasEconomicCat) return true;

  return false;
}

const CATEGORY_MAP: Record<string, string> = {
  all: 'business,finance,economics,markets,technology',
  economy: 'economics,finance',
  markets: 'markets,business',
  realestate: 'real-estate',
  crypto: 'crypto',
};

export const useTheNewsApi = ({ category = 'all', searchQuery = '', page = 1 }: UseTheNewsApiOptions = {}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = 'BVlhq4TG29ylhFWB2VIb8GBjHnNVTaYU0lYl9AMI';
        const cats = CATEGORY_MAP[category] || CATEGORY_MAP['all'];
        let url = '';
        if (searchQuery && searchQuery.trim() !== '') {
          url = `https://api.thenewsapi.com/v1/news/all?api_token=${apiKey}&search=${encodeURIComponent(searchQuery)}&language=ko,en&limit=50&page=${page}`;
        } else {
          url = `https://api.thenewsapi.com/v1/news/top?api_token=${apiKey}&language=ko,en&categories=${cats}&limit=50&page=${page}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled) {
          const raw: NewsArticle[] = data.data || [];
          const filtered = raw.filter(isEconomicNews);
          setArticles(filtered);
          setTotalPages(Math.ceil((data.meta?.found || filtered.length) / 30));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '오류 발생');
          setArticles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [category, searchQuery, page]);

  return { articles, loading, error, totalPages };
};