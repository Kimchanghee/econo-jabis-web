import { useState, useEffect, useCallback, useRef } from 'react';

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
      snippet: string;h
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
      fullBody: string;
      bodyParagraphs: string[];
      relatedKeywords: string[];
}

// ============================================================
// 경제 뉴스 키워드 쿼리 목록
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

// ============================================================
// 중복 감지
// ============================================================
const seenTitles = new Set<string>();
const seenUrls = new Set<string>();

function isSimilarTitle(a: string, b: string): boolean {
      const normalize = (s: string) => s.replace(/[^\w가-힣]/g, '').toLowerCase();
      const na = normalize(a);
      const nb = normalize(b);
      if (na === nb) return true;
      const shorter = na.length < nb.length ? na : nb;
      const longer = na.length < nb.length ? nb : na;
      if (shorter.length === 0) return false;
      if (longer.includes(shorter) && shorter.length > 10) return true;
      let common = 0;
      for (const ch of shorter) {
              if (longer.includes(ch)) common++;
      }
      return common / shorter.length > 0.85;
}

function isDuplicateArticle(title: string, url: string): boolean {
      const normalTitle = title.trim().toLowerCase();
      if (url && seenUrls.has(url)) return true;
      for (const seen of seenTitles) {
              if (isSimilarTitle(normalTitle, seen)) return true;
      }
      return false;
}

function registerArticle(title: string, url: string) {
      seenTitles.add(title.trim().toLowerCase());
      if (url) seenUrls.add(url);
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
// 카테고리별 Unsplash 이미지
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

function getNewsImageUrl(title: string, category: string): string {
      const CATEGORY_KEYWORDS: Record<string, string> = {
              '주식': 'stock-market,trading,finance',
              '경제': 'economy,business,finance',
              '부동산': 'real-estate,buildings,property',
              '암호화폐': 'cryptocurrency,bitcoin,blockchain',
              '환율': 'currency,exchange,forex',
              '시장': 'market,trading,business',
              '금융': 'finance,banking,money',
              '테크': 'technology,innovation,digital',
              '거시경제': 'economy,gdp,global',
      };
      const catKeyword = CATEGORY_KEYWORDS[category] || 'finance,business,economy';
      let titleKeyword = 'finance';
      if (title.includes('삼성') || title.includes('반도체')) titleKeyword = 'semiconductor,technology';
      else if (title.includes('금리') || title.includes('기준금리')) titleKeyword = 'interest-rate,federal-reserve';
      else if (title.includes('코스피') || title.includes('증시')) titleKeyword = 'stock-exchange,trading';
      else if (title.includes('달러') || title.includes('환율')) titleKeyword = 'dollar,currency,exchange';
      else if (title.includes('비트코인') || title.includes('코인')) titleKeyword = 'bitcoin,cryptocurrency';
      else if (title.includes('아파트') || title.includes('부동산')) titleKeyword = 'apartment,real-estate';
      else if (title.includes('수출') || title.includes('무역')) titleKeyword = 'trade,export,shipping';
      else if (title.includes('물가') || title.includes('인플레')) titleKeyword = 'inflation,economy';
      else if (title.includes('AI') || title.includes('인공지능')) titleKeyword = 'artificial-intelligence,technology';
      else if (title.includes('미국') || title.includes('연준')) titleKeyword = 'federal-reserve,usa,economy';
      else if (title.includes('중국')) titleKeyword = 'china,economy,trade';
      else titleKeyword = catKeyword;

  const hash = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const seed = hash % 1000;
      return `https://source.unsplash.com/800x450/?${titleKeyword}&sig=${seed}`;
}

// ============================================================
// Gemini API 호출 - Google Search Grounding으로 실시간 뉴스
// 쿼리 하나당 뉴스 기사 3개를 JSON 배열로 반환받음
// ============================================================
async function fetchGeminiNews(query: string, apiKey: string): Promise<NewsArticle[]> {
      const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `당신은 한국의 전문 경제/금융 저널리스트입니다.
  "${query}" 주제로 오늘 실시간 최신 뉴스 기사 3개를 작성해주세요.

  반드시 아래 JSON 배열 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:

  [
    {
        "title": "뉴스 제목 (구체적이고 흥미로운 제목)",
            "source": "출처 언론사명",
                "published_at": "2026-02-27T18:00:00+09:00",
                    "category": "주식|부동산|환율|암호화폐|금융|테크|거시경제|경제 중 하나",
                        "keywords": "키워드1,키워드2,키워드3",
                            "body": "기사 본문 (최소 1500자 이상, 8~10개 문단, 각 문단은 빈줄로 구분)\\n\\n첫 번째 문단: 핵심 사실 요약 및 독자 흥미 유발 (3~5문장)\\n\\n두 번째 문단: 배경과 맥락 설명 (구체적 수치, 날짜, 기업명 포함)\\n\\n세 번째 문단: 원인 분석 및 주요 요인 (전문가 의견 인용 포함)\\n\\n네 번째 문단: 시장 반응 및 관련 통계 데이터 (퍼센트, 수치 포함)\\n\\n다섯 번째 문단: 국내외 경제적 영향 분석\\n\\n여섯 번째 문단: 관련 기업 및 업종 동향\\n\\n일곱 번째 문단: 전문가 전망 및 분석\\n\\n여덟 번째 문단: 투자자 및 소비자에게 미치는 영향\\n\\n아홉 번째 문단: 향후 주목해야 할 포인트\\n\\n열 번째 문단: 결론 및 핵심 요약"
                              }
                              ]

                              중요 조건:
                              1. body는 반드시 최소 1500자 이상
                              2. 각 문단은 3~5문장으로 구성
                              3. 구체적인 수치, 퍼센트, 기업명, 인물명 반드시 포함
                              4. 오늘 날짜(2026년 2월 27일) 기준 최신 실제 뉴스 기반으로 작성
                              5. JSON 형식 외 다른 텍스트 절대 금지`;

  const requestBody = {
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 16384,
          },
  };

  const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini API error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  console.log('[EconoJabis] Gemini raw response length:', responseText.length);

  // JSON 배열 파싱
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
              console.warn('[EconoJabis] No JSON array found in response:', responseText.substring(0, 200));
              return [];
      }

  let raw: Record<string, unknown>[];
      try {
              raw = JSON.parse(jsonMatch[0]);
      } catch (e) {
              console.warn('[EconoJabis] JSON parse failed:', e);
              return [];
      }

  const articles: NewsArticle[] = [];

  for (const item of raw) {
          const title = String(item.title || '').trim();
          const url = String(item.url || `https://econojabis.com/article/${Date.now()}`).trim();
          const body = String(item.body || '').trim();

        if (!title || title.length < 5) continue;
          if (isDuplicateArticle(title, url)) continue;

        const paragraphs = body
            .split(/\n\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 20);

        const category = String(item.category || classifyCategory(title, body));
          const id = `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const publishedAt = String(item.published_at || new Date().toISOString());
          const imageUrl = getNewsImageUrl(title, category);

        registerArticle(title, url);

        articles.push({
                  id,
                  uuid: id,
                  title,
                  description: paragraphs[0] || '',
                  keywords: String(item.keywords || ''),
                  snippet: paragraphs[0] || '',
                  url,
                  image_url: imageUrl,
                  imageUrl,
                  language: 'ko',
                  published_at: publishedAt,
                  publishedAt,
                  source: String(item.source || 'EconoJabis'),
                  categories: [category],
                  category,
                  date: publishedAt,
                  relevance_score: null,
                  locale: 'ko',
                  isBreaking: false,
                  isFeatured: false,
                  summary: paragraphs[0] || '',
                  fullBody: body,
                  bodyParagraphs: paragraphs,
                  relatedKeywords: String(item.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
        });
  }

  console.log(`[EconoJabis] Query "${query}" -> ${articles.length} articles`);
      return articles;
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

      // API 키는 환경변수에서만 로드
      const apiKey = import.meta.env.VITE_GEMINI_KEY || '';

      const fetchNews = useCallback(async () => {
              if (fetchingRef.current) return;
              fetchingRef.current = true;
              setIsLoading(true);
              setError(null);

                                        if (!apiKey) {
                                                  console.error('[EconoJabis] VITE_GEMINI_KEY is not set!');
                                                  setError('API 키가 설정되지 않았습니다.');
                                                  setIsLoading(false);
                                                  fetchingRef.current = false;
                                                  return;
                                        }

                                        console.log('[EconoJabis] Starting news fetch with API key:', apiKey.substring(0, 10) + '...');

                                        try {
                                                  // 쿼리를 랜덤 섞어서 5개 선택
                const shuffled = [...NEWS_QUERIES].sort(() => Math.random() - 0.5);
                                                  const selectedQueries = shuffled.slice(0, 5);

                console.log('[EconoJabis] Selected queries:', selectedQueries);

                const results = await Promise.allSettled(
                            selectedQueries.map(q => fetchGeminiNews(q, apiKey))
                          );

                const newArticles: NewsArticle[] = [];
                                                  for (const result of results) {
                                                              if (result.status === 'fulfilled') {
                                                                            newArticles.push(...result.value);
                                                              } else {
                                                                            console.warn('[EconoJabis] Query failed:', result.reason);
                                                              }
                                                  }

                console.log('[EconoJabis] Total new articles fetched:', newArticles.length);

                // 날짜순 정렬
                newArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

                // 첫 번째 기사 featured 설정
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
                            console.log('[EconoJabis] Articles set:', allCached.length);
                } else {
                            console.warn('[EconoJabis] No articles fetched at all');
                            setError('실시간 뉴스를 불러오지 못했습니다. 잠시 후 다시 시도합니다.');
                }
                                        } catch (e) {
                                                  console.error('[EconoJabis] fetchNews error:', e);
                                                  setError('뉴스를 불러오는 중 오류가 발생했습니다.');
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
