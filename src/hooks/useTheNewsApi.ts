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
  '대학교', '대학원', '동아리', '입학', '졸업', '캠퍼스', '학생', '교수',
  '학과', '학부', '연구팀', '연구실', '총장', '학술', '오리엔테이션',
  '성균관대', '연세대', '고려대', '서울대', '한양대', 'kaist', '카이스트',
  '인천대', '강원대', '부산대', '경희대', '충남대', '전남대', '중앙대',
  '지역축제', '봉사활동', '공모전', '세미나', '군청', '구청', '사찰',
  '아이돌', '드라마', '뮤지컬', '야구', '축구', '농구', '골프',
];

const REQUIRED_KEYWORDS = [
  '주식', '코스피', '코스닥', '증시', '금융', '경제', '환율', '금리',
  '부동산', '아파트', '채권', '펀드', '투자', '기업', '매출',
  '실적', '영업이익', '적자', '흑자', '상장', '코인', '비트코인', '암호화폐',
  '물가', '인플레이션', '무역', '수출', '수입', '관세', '반도체', 'ai',
  '인공지능', '배당', 'ipo', '합병', '구조조정',
  '은행', '보험', '증권', '자산', '연금', '세금',
  '달러', '엔화', '위안화', '유로', '원자재', '유가', '금값',
  '삼성', 'sk', 'lg', '현대', '롯데', '포스코', '카카오', '네이버',
  '테슬라', '애플', '엔비디아', '구글', '메타', '아마존', '마이크로소프트',
  'fed', '연준', '한국은행', '기준금리', 'gdp', 'cpi',
];

const CATEGORY_MAP: Record<string, string> = {
  '주식': 'business',
  '암호화폐': 'tech',
  '부동산': 'business',
  '경제': 'business',
  '금융': 'business',
  '시장': 'business',
};

const API_KEY = 'xtqpWj0rNYQUHrRPkFfV5HZ0xL4RhCvPT9jS4Z6V';

function isEconomicNews(title: string, desc: string): boolean {
  const text = (title + ' ' + desc).toLowerCase();
  for (const b of BLOCKED_KEYWORDS) {
    if (text.includes(b.toLowerCase())) return false;
  }
  for (const r of REQUIRED_KEYWORDS) {
    if (text.includes(r.toLowerCase())) return true;
  }
  return false;
}

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
        const cat = CATEGORY_MAP[category] || 'business,tech,general';
        const params = new URLSearchParams({
          api_token: API_KEY,
          language: 'ko',
          categories: cat,
          limit: '50',
          page: String(page),
      });
        const res = await fetch(`https://api.thenewsapi.com/v1/news/all?${params}`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (!cancelled && data.data && Array.isArray(data.data)) {
          const filtered = (data.data as NewsArticle[]).filter((a) =>
            isEconomicNews(a.title, a.description || a.snippet || '')
          );
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