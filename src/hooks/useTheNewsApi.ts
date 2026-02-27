import { useState, useEffect, useCallback, useRef } from 'react';
import { fallbackArticles } from '@/data/newsData';

// ============================================================
// Gemini API 기반 실시간 경제뉴스 훅
// API 키는 환경변수로 관리 (절대 소스코드에 하드코딩 금지)
// ============================================================

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
    publishedAt: string;
    source: string;
    categories: string[];
    category: string;
    date: string;
    relevance_score: number | null;
    locale: string;
    isBreaking: boolean;
    isFeatured: boolean;
    summary: string;
    // 풍부한 본문을 위한 추가 필드
  fullBody: string;
    bodyParagraphs: string[];
    relatedKeywords: string[];
}

// ============================================================
// 경제 뉴스 키워드 쿼리 목록 (다양한 분야 커버)
// ============================================================
const NEWS_QUERIES = [
    '오늘 코스피 코스닥 주식 시장 동향 2026',
    '한국 경제 금리 환율 최신 뉴스',
    '비트코인 이더리움 암호화폐 시세 오늘',
    '서울 부동산 아파트 매매 전세 최신',
    '삼성전자 SK하이닉스 반도체 실적 뉴스',
    '미국 연준 Fed 금리 결정 경제',
    '원달러 환율 외환 시장 오늘',
    '글로벌 증시 나스닥 S&P500 다우 오늘',
    '트럼프 관세 무역 경제 정책',
    '국내 기업 실적 IPO 상장 최신',
    '국제 유가 원자재 금 은 가격',
    '한국은행 기준금리 통화정책',
    '부동산 정책 청약 재개발 재건축',
    '인공지능 AI 반도체 테크 기업 주가',
    '카카오 네이버 국내 빅테크 주식',
  ];

// 중복 감지를 위한 해시셋 (제목 기반)
const seenTitles = new Set<string>();
const seenUrls = new Set<string>();

// 제목 유사도 체크 (80% 이상 같으면 중복)
function isSimilarTitle(a: string, b: string): boolean {
    const normalize = (s: string) => s.replace(/[^\w가-힣]/g, '').toLowerCase();
    const na = normalize(a);
    const nb = normalize(b);
    if (na === nb) return true;
    const shorter = na.length < nb.length ? na : nb;
    const longer = na.length < nb.length ? nb : na;
    if (shorter.length === 0) return false;
    // 짧은 쪽이 긴 쪽에 포함되면 중복
  if (longer.includes(shorter) && shorter.length > 10) return true;
    // 공통 문자 비율
  let common = 0;
    for (const ch of shorter) {
          if (longer.includes(ch)) common++;
    }
    return common / shorter.length > 0.85;
}

function isDuplicateArticle(title: string, url: string): boolean {
    const normalTitle = title.trim().toLowerCase();
    if (seenUrls.has(url)) return true;
    for (const seen of seenTitles) {
          if (isSimilarTitle(normalTitle, seen)) return true;
    }
    return false;
}

function registerArticle(title: string, url: string) {
    seenTitles.add(title.trim().toLowerCase());
    seenUrls.add(url);
}

// ============================================================
// 카테고리 분류
// ============================================================
function classifyCategory(title: string, body: string): string {
    const text = (title + ' ' + body).toLowerCase();
    if (/비트코인|이더리움|암호화폐|가상자산|블록체인|코인|crypto|bitcoin|ethereum/.test(text)) return '암호화폐';
    if (/아파트|부동산|전세|매매|청약|재건축|재개발|분양/.test(text)) return '부동산';
    if (/환율|달러|엔화|위안|유로|원달러|외환|forex/.test(text)) return '환율';
    if (/코스피|코스닥|주식|증시|상장|ipo|시가총액|주가|나스닥|s&p|다우/.test(text)) return '주식';
    if (/금리|기준금리|연준|fed|한국은행|통화정책|인플레/.test(text)) return '금융';
    if (/반도체|ai|인공지능|테크|it|소프트웨어|하드웨어/.test(text)) return '테크';
    if (/수출|수입|무역|관세|gdp|경기|물가|cpi/.test(text)) return '거시경제';
    return '경제';
}

// ============================================================
// Gemini API 호출 - Google Search Grounding으로 실시간 뉴스
// ============================================================
async function fetchGeminiNews(query: string, apiKey: string): Promise<NewsArticle[]> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `당신은 한국의 전문 경제/금융 저널리스트입니다. 아래 뉴스 정보를 바탕으로 독자들이 끝까지 읽고 싶은 깊이 있는 경제 뉴스 기사를 작성해주세요.

뉴스 제목: ${title}
카테고리: ${category}
요약: ${summary}

다음 조건을 반드시 지켜주세요:
1. 기사 분량: 최소 1500자 이상 (8~10개 문단 필수)
2. 각 문단은 3~5문장으로 구성
3. 첫 문단: 핵심 사실을 요약하되 독자의 흥미를 끌 것
4. 2~4 문단: 배경, 원인, 맥락 상세 설명
5. 5~7 문단: 시장/경제적 영향, 전문가 분석, 관련 통계 데이터 포함
6. 8~9 문단: 향후 전망, 투자자/소비자에게 미치는 영향
7. 마지막 문단: 결론 및 핵심 요약
8. 구체적인 수치, 퍼센트, 기업명, 인물명을 포함할 것
9. 전문 용어는 쉽게 설명을 덧붙일 것
10. 문단 사이는 빈 줄로 구분

위 조건을 모두 만족하는 완성도 높은 기사 본문만 출력하세요. 제목, 부제목, 메타데이터는 포함하지 마세요.`;

  const body = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 16384,
        },
  };

  const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
  });

  if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // JSON 파싱
  const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

  const raw: Record<string, unknown>[] = JSON.parse(jsonMatch[0]);

  const articles: NewsArticle[] = [];
    for (const item of raw) {
          const title = String(item.title || '').trim();
          const url = String(item.url || '').trim();
          const body = String(item.body || '').trim();

      if (!title || title.length < 5) continue;
          if (isDuplicateArticle(title, url)) continue;

      const paragraphs = body
            .split(/\n\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 20);

      // 본문이 부족하면 Gemini가 생성한 body 활용
      const fullBody = body;
          const category = String(item.category || classifyCategory(title, body));

      const id = `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const publishedAt = String(item.published_at || new Date().toISOString());

      registerArticle(title, url);

      articles.push({
              id,
              uuid: id,
              title,
              description: paragraphs[0] || '',
              keywords: String(item.keywords || ''),
              snippet: paragraphs[0] || '',
              url,
              image_url: String(item.image_url || ''),
              imageUrl: String(item.image_url || ''),
              language: 'ko',
              published_at: publishedAt,
              publishedAt,
              source: String(item.source || 'EconoJabis'),
              categories: [category],
              category,
              date: publishedAt,
              relevance_score: null,
              locale: 'ko',
              isBreaking: Boolean(item.isBreaking),
              isFeatured: false,
              summary: paragraphs[0] || '',
              fullBody,
              bodyParagraphs: paragraphs,
              relatedKeywords: String(item.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
      });
    }

  return articles;
}

// ============================================================
// 카테고리별 이미지 폴백
// ============================================================
const CATEGORY_IMAGES: Record<string, string> = {
    '주식': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    '부동산': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    '환율': 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    '암호화폐': 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop',
    '금융': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    '테크': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    '거시경제': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    '경제': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
};

export function getCategoryImage(category: string): string {
    return CATEGORY_IMAGES[category] || CATEGORY_IMAGES['경제'];
}

// ============================================================
// 메인 훅
// ============================================================
export const useTheNewsApi = (_language = 'ko') => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const fetchingRef = useRef(false);
    const articleCacheRef = useRef<Map<string, NewsArticle>>(new Map());

    // API 키는 환경변수에서만 로드 (절대 소스코드에 하드코딩 금지)
    const apiKey = import.meta.env.VITE_GEMINI_KEY || '';

    const fetchNews = useCallback(async () => {
          if (fetchingRef.current) return;
          fetchingRef.current = true;
          setIsLoading(true);
          setError(null);

                                      if (!apiKey) {
                                              console.warn('[EconoJabis] VITE_GEMINI_KEY not set. Using fallback data.');
                                              setArticles(fallbackArticles as unknown as NewsArticle[]);
                                              setError('API 키가 설정되지 않았습니다. 샘플 데이터를 표시합니다.');
                                              setIsLoading(false);
                                              fetchingRef.current = false;
                                              return;
                                      }

                                      try {
                                              // 세션마다 seenTitles/seenUrls 초기화 (5분마다 갱신 시 중복 감지 유지)
            // 단, 너무 오래된 캐시는 지우지 않음 (같은 기사 재노출 방지)

            // 쿼리를 랜덤하게 섞어서 매번 다른 뉴스 조합
            const shuffled = [...NEWS_QUERIES].sort(() => Math.random() - 0.5);
                                              // 한 번에 5개 쿼리만 병렬 호출 (API 제한 고려)
            const selectedQueries = shuffled.slice(0, 5);

            const results = await Promise.allSettled(
                      selectedQueries.map(q => fetchGeminiNews(q, apiKey))
                    );

            const newArticles: NewsArticle[] = [];
                                              for (const result of results) {
                                                        if (result.status === 'fulfilled') {
                                                                    newArticles.push(...result.value);
                                                        }
                                              }

            // 이미지 없는 기사에 카테고리 이미지 적용
            for (const a of newArticles) {
                      if (!a.imageUrl || a.imageUrl === '') {
                                  a.imageUrl = getCategoryImage(a.category);
                                  a.image_url = a.imageUrl;
                      }
            }

            // 날짜순 정렬 (최신순)
            newArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

            // 첫 번째 기사를 featured로 설정
            if (newArticles.length > 0) {
                      newArticles[0].isFeatured = true;
                      newArticles[0].isBreaking = true;
            }

            // 캐시에 추가 (누적)
            for (const a of newArticles) {
                      articleCacheRef.current.set(a.id, a);
            }

            const allCached = Array.from(articleCacheRef.current.values())
                                                .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

            if (allCached.length > 0) {
                      setArticles(allCached);
                      setLastFetched(new Date());
                      setError(null);
            } else {
                      setArticles(fallbackArticles as unknown as NewsArticle[]);
                      setError('실시간 뉴스를 불러오지 못했습니다. 샘플 데이터를 표시합니다.');
            }
                                      } catch (e) {
                                              console.error('[EconoJabis] fetchNews error:', e);
                                              if (articleCacheRef.current.size === 0) {
                                                        setArticles(fallbackArticles as unknown as NewsArticle[]);
                                                        setError('실시간 뉴스를 불러오지 못했습니다. 샘플 데이터를 표시합니다.');
                                              }
                                      } finally {
                                              setIsLoading(false);
                                              fetchingRef.current = false;
                                      }
    }, [apiKey]);

    useEffect(() => {
          fetchNews();
          // 5분마다 갱신
                  const interval = setInterval(fetchNews, 5 * 60 * 1000);
          return () => clearInterval(interval);
    }, [fetchNews]);

    const extractTrendingKeywords = useCallback(() => {
          const freq: Record<string, number> = {};
          for (const article of articles) {
                  const words = (article.title + ' ' + article.keywords).split(/[\s,]+/);
                  for (const w of words) {
                            const cleaned = w.replace(/[^\w가-힣]/g, '');
                            if (cleaned.length > 1) freq[cleaned] = (freq[cleaned] || 0) + 1;
                  }
          }
          return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }, [articles]);

    return {
          articles,
          isLoading,
          error,
          lastFetched,
          refresh: fetchNews,
          extractTrendingKeywords,
    };
};
