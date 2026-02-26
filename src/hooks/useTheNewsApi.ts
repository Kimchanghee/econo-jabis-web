import { useState, useEffect, useCallback } from 'react';

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

// 걸러낼 키워드 (대학교/동아리/지역행사/비경제성 기사)
const BLOCKED_KEYWORDS = [
  '대학교', '대학원', '동아리', '입학', '졸업', '캠퍼스', '학생', '교수',
  '학과', '학부', '연구팀', '연구실', '총장', '학술', '오리엔테이션',
  '성균관대', '연세대', '고려대', '서울대', '한양대', '카이스트', 'KAIST',
  '인천대', '강원대', '부산대', '경희대', '아주대', '충남대', '전남대',
  '지역축제', '봉사활동', '사회공헌', '행사', '공모전', '세미나',
  '지방자치', '군청', '구청', '시청 행사', '면사무소',
  '종교', '교회', '성당', '불교', '사찰',
  '연예인', '아이돌', '드라마', '영화제', '뮤지컬',
  '스포츠', '야구', '축구', '농구', '배구', '골프', '수영',
];

// 반드시 포함되어야 할 경제 관련 키워드 (하나라도 있어야 통과)
const REQUIRED_KEYWORDS = [
  '주식', '코스피', '코스닥', '증시', '금융', '경제', '환율', '금리',
  '부동산', '아파트', '부채', '채권', '펀드', '투자', '기업', '매출',
  '실적', '영업이익', '적자', '흑자', '상장', '코인', '비트코인', '암호화폐',
  '물가', '인플레이션', '무역', '수출', '수입', '관세', '반도체', 'AI',
  '인공지능', '배당', 'IPO', '공모', '합병', 'M&A', '구조조정',
  '은행', '보험', '증권', '자산', '펜션', '연금', '세금', '정책금리',
  '달러', '엔화', '위안화', '유로', '파운드', '원자재', '유가', '금값',
  '삼성', 'SK', 'LG', '현대', '롯데', '포스코', '카카오', '네이버',
  '테슬라', '애플', '엔비디아', '구글', '메타', '아마존', '마이크로소프트',
  'Fed', '연준', '한국은행', '기준금리', '통화정책', 'GDP', 'CPI',
];

function isEconomicNews(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase();
  
  // 차단 키워드 체크
  for (const blocked of BLOCKED_KEYWORDS) {
    if (text.includes(blocked.toLowerCase())) {
      return false;
    }
  }
  
  // 경제 키워드 체크 (하나라도 있어야 통과)
  for (const required of REQUIRED_KEYWORDS) {
    if (text.includes(required.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

const API_KEY = 'xtqpWj0rNYQUHrRPkFfV5HZ0xL4RhCvPT9jS4Z6V';

export const useTheNewsApi = ({ category = 'all', searchQuery = '', page = 1 }: UseTheNewsApiOptions = {}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const categoryMap: Record<string, string> = {
    '주식': 'business',
    '암호화폐': 'tech',
    '부동산': 'business',
    '경제': 'business',
    '금융': 'business',
    '시장': 'business',
  };

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const mappedCategory = categoryMap[category] || 'business,tech,general';
      
      const params = new URLSearchParams({
        api_token: API_KEY,
        language: 'ko',
        categories: mappedCategory,
        limit: '50',
        page: page.toString(),
      });

      const response = await fetch(`https://api.thenewsapi.com/v1/news/all?${params}`);

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        // 경제 뉴스만 필터링
        const filtered = data.data.filter((article: NewsArticle) =>
          isEconomicNews(article.title, article.description || article.snippet || '')
        );
        
        setArticles(filtered);
        setTotalPages(Math.ceil((data.meta?.found || filtered.length) / 30));
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error('뉴스 API 오류:', err);
      setError(err instanceof Error ? err.message : '뉴스를 불러오는 중 오류가 발생했습니다.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, page]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, totalPages, refetch: fetchNews };
};