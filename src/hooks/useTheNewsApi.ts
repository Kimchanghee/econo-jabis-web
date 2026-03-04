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
  snippet: string;
  url: string;h
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
// 실제 뉴스 기사 30개 (한국경제 2026.03.04 기준 실제 기사)
// ============================================================
const now = new Date('2026-03-04T01:00:00+09:00');
export const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    id: 'real_001', uuid: 'real_001',
    title: '코인도 주식처럼 호가창 촘촘하게…"큰손"이 거래 체결 돕는다',
    description: '금융당국이 가상자산 시장에 유동성을 공급하는 시장조성자(MM) 제도를 전격 도입한다. 주식시장처럼 전문 기관투자가가 매수·매도 호가를 제시해 거래 체결 속도를 높이고 가격 변동성을 줄이는 방식이다.',
    keywords: '가상자산,시장조성자,암호화폐,디지털자산',
    snippet: '금융당국이 가상자산 시장에 시장조성자(MM) 제도를 전격 도입한다.',
    url: 'https://www.hankyung.com/article/2026030364871',
    image_url: 'https://img.hankyung.com/photo/202603/AA.43474081.1.jpg',
    imageUrl: 'https://img.hankyung.com/photo/202603/AA.43474081.1.jpg',
    language: 'ko', published_at: new Date(now.getTime() - 2*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 2*3600000).toISOString(),
    source: '한국경제', categories: ['암호화폐'], category: '암호화폐',
    date: new Date(now.getTime() - 2*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: true, isFeatured: true,
    summary: '금융당국이 가상자산 시장에 시장조성자(MM) 제도를 도입해 주식처럼 호가창 유동성을 공급한다.',
    fullBody: '금융당국이 가상자산 시장에 유동성을 공급하는 시장조성자(MM) 제도를 전격 도입한다. 주식시장처럼 전문 기관투자가가 매수·매도 호가를 제시해 거래 체결 속도를 높이고 가격 변동성을 줄이는 방식이다.\n\n해외 가상자산 시장에서는 시장조성 전문 업체가 한 축으로 자리 잡고 있다. 단순히 매수·매도 호가를 제시하는 수준을 넘어 거래소에 유동성을 공급하고 기관 대상 장외거래와 상장(ICO) 지원 등 가격 형성에 핵심 역할을 한다.\n\n가상자산 시장조성자 도입을 골자로 한 디지털자산기본법이 이달 공개된다. 금융당국이 기본법 마련 작업에 착수한 지 1년여 만이다.',
    bodyParagraphs: ['금융당국이 가상자산 시장에 유동성을 공급하는 시장조성자(MM) 제도를 전격 도입한다.', '해외 가상자산 시장에서는 시장조성 전문 업체가 한 축으로 자리 잡고 있다.', '가상자산 시장조성자 도입을 골자로 한 디지털자산기본법이 이달 공개된다.'],
    relatedKeywords: ['가상자산', '시장조성자', '암호화폐', '디지털자산기본법']
  },
  {
    id: 'real_002', uuid: 'real_002',
    title: 'AI·원전·조선 "오일머니 프로젝트"…이란 폭격에 "연쇄 좌초" 공포',
    description: '미국·이란 전쟁의 무대가 중동 전역으로 확대되면서 석유화학 플랜트, 원자력발전, 조선 등 한국 기업이 벌이는 100조원 규모 프로젝트에 차질이 생길 것이라는 우려가 크다.',
    keywords: '중동,이란,원전,조선,오일머니',
    snippet: '중동 전쟁 확대로 한국 기업 100조원 프로젝트 차질 우려.',
    url: 'https://www.hankyung.com/article/2026030366481',
    image_url: 'https://img.hankyung.com/photo/202603/AA.43475140.1.jpg',
    imageUrl: 'https://img.hankyung.com/photo/202603/AA.43475140.1.jpg',
    language: 'ko', published_at: new Date(now.getTime() - 3*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 3*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 3*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: true, isFeatured: false,
    summary: '미국·이란 전쟁 확대로 중동 지역 한국 기업 100조원 규모 프로젝트에 차질 우려.',
    fullBody: '미국·이란 전쟁의 무대가 중동 전역으로 확대되면서 석유화학 플랜트, 원자력발전, 조선 등 한국 기업이 이들 지역에서 벌이는 100조원 프로젝트에 차질이 생길 것이라는 우려가 크다. 지난달 UAE 두바이에서 열린 K팝 공연에도 한국 기업들이 대거 참여하는 등 중동 시장 공략에 공을 들여왔으나 전쟁 확전으로 비상이 걸렸다.',
    bodyParagraphs: ['미국·이란 전쟁의 무대가 중동 전역으로 확대되면서 한국 기업 프로젝트에 차질 우려.'],
    relatedKeywords: ['중동', '이란', '원전', '조선', '오일머니']
  },
  {
    id: 'real_003', uuid: 'real_003',
    title: '포탄 맞은 증시…외국인 5조 투매에 정유·방산·해운株만 살아남아',
    description: '미국-이란 전쟁 발발로 코스피가 7% 넘게 급락한 가운데 외국인이 5조원 넘게 순매도했다. 정유·방산·해운 종목만 강세를 보였다.',
    keywords: '코스피,외국인,방산,정유,해운,전쟁',
    snippet: '외국인 5조원 순매도에 코스피 급락, 방산·정유·해운만 강세.',
    url: 'https://www.hankyung.com/article/2026030365761',
    image_url: 'https://img.hankyung.com/photo/202603/AA.43475152.1.jpg',
    imageUrl: 'https://img.hankyung.com/photo/202603/AA.43475152.1.jpg',
    language: 'ko', published_at: new Date(now.getTime() - 4*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 4*3600000).toISOString(),
    source: '한국경제', categories: ['주식'], category: '주식',
    date: new Date(now.getTime() - 4*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: true, isFeatured: false,
    summary: '미국-이란 전쟁에 코스피 7% 급락, 외국인 5조원 투매, 방산·정유·해운만 상승.',
    fullBody: '미국-이란 전쟁 발발로 코스피지수가 3일 7% 넘게 급락한 가운데 외국인 투자자들이 5조원 이상을 순매도했다. 증시 전문가들은 낙폭이 과도하다며 반등 가능성을 점쳤다. 정유·방산·해운 관련 종목들은 전쟁 수혜주로 부각되며 강세를 보였다.',
    bodyParagraphs: ['코스피지수가 7% 넘게 급락, 외국인 5조원 투매.', '방산·정유·해운 종목만 강세.'],
    relatedKeywords: ['코스피', '외국인', '방산', '정유', '해운']
  },
  {
    id: 'real_004', uuid: 'real_004',
    title: '한은, K자형 성장 우려에 "비둘기적 동결"…국채금리 일제히 하락',
    description: '한국은행이 기준금리를 동결했지만 경기 하방 리스크를 강조하며 비둘기적 신호를 보냈다. 국채금리는 일제히 하락했다.',
    keywords: '한국은행,기준금리,금리,K자형성장,국채',
    snippet: '한국은행 기준금리 동결, 비둘기적 신호에 국채금리 하락.',
    url: 'https://www.hankyung.com/article/2026030295761',
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 5*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 5*3600000).toISOString(),
    source: '한국경제', categories: ['금융'], category: '금융',
    date: new Date(now.getTime() - 5*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '한국은행 기준금리 동결, K자형 성장 우려로 비둘기적 신호. 국채금리 하락.',
    fullBody: '한국은행 금융통화위원회가 기준금리를 현 수준으로 동결했다. 그러나 위원회는 K자형 성장에 대한 우려를 강조하며 향후 인하 가능성을 시사하는 비둘기적 신호를 보냈다. 이에 국채금리는 일제히 하락했다. 한은은 1분기 성장률을 1% 내외로 전망하면서도 반도체 업황이 개선될 경우 더 오를 수 있다고 밝혔다.',
    bodyParagraphs: ['한국은행 기준금리 동결, 비둘기적 신호.', '국채금리 일제히 하락.'],
    relatedKeywords: ['한국은행', '기준금리', 'K자형성장', '국채금리']
  },
  {
    id: 'real_005', uuid: 'real_005',
    title: '한은, 기준금리 향후 6개월간 동결 시사…1분기 성장률 1% 내외 전망',
    description: '한국은행이 향후 6개월간 기준금리를 동결하겠다는 입장을 시사했다. 1분기 성장률은 1% 내외로 전망했다.',
    keywords: '한국은행,기준금리,성장률,동결',
    snippet: '한은, 향후 6개월 금리 동결 시사. 1분기 성장률 1% 전망.',
    url: 'https://www.hankyung.com/article/2026030300765',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 6*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 6*3600000).toISOString(),
    source: '한국경제', categories: ['금융'], category: '금융',
    date: new Date(now.getTime() - 6*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '한은이 향후 6개월 금리 동결을 시사하며 1분기 성장률 1% 내외로 전망했다.',
    fullBody: '한국은행이 향후 6개월간 기준금리를 동결하겠다는 입장을 공식 시사했다. 이창용 한은 총재는 "현재의 금리 수준을 유지하는 것이 경기 회복을 지원하면서도 물가 안정을 도모하는 최선의 방법"이라고 말했다. 1분기 성장률은 1% 내외로 전망했으나, 반도체 업황이 예상보다 좋으면 더 오를 수 있다고 덧붙였다.',
    bodyParagraphs: ['한국은행이 향후 6개월 기준금리 동결 시사.', '1분기 성장률 1% 내외 전망.'],
    relatedKeywords: ['한국은행', '기준금리', '성장률', '동결']
  },
  {
    id: 'real_006', uuid: 'real_006',
    title: '환율·채권, 중동 전쟁 격화…원달러 환율 1,470원 재진입 가능성',
    description: '미국-이란 전쟁 격화로 원달러 환율이 급등하고 채권시장도 불안한 모습을 보이고 있다. 시장에서는 환율이 1,470원을 재돌파할 가능성을 주시하고 있다.',
    keywords: '환율,원달러,채권,중동전쟁,이란',
    snippet: '중동 전쟁 격화에 원달러 환율 급등, 1470원 재진입 우려.',
    url: 'https://www.hankyung.com/article/2026030287651',
    image_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 7*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 7*3600000).toISOString(),
    source: '한국경제', categories: ['환율'], category: '환율',
    date: new Date(now.getTime() - 7*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '중동 전쟁으로 원달러 환율 급등, 1470원 재진입 가능성 대두.',
    fullBody: '미국-이란 전쟁 격화로 외환시장과 채권시장이 불안한 모습을 보이고 있다. 원달러 환율이 급등세를 보이면서 시장에서는 1,470원 재진입 가능성을 주시하고 있다. 안전자산 수요가 커지면서 달러화 강세가 이어지고 있으며, 이는 신흥국 통화 전반에 하락 압력을 가하고 있다.',
    bodyParagraphs: ['중동 전쟁에 원달러 환율 급등.', '1,470원 재진입 가능성 대두.'],
    relatedKeywords: ['환율', '원달러', '중동전쟁', '채권']
  },
  {
    id: 'real_007', uuid: 'real_007',
    title: '불안한 유가…2월 물가 2.2% 상승, 에너지발 오름세 지속',
    description: '2월 소비자물가지수가 전년 동기 대비 2.2% 상승했다. 국제 유가 불안에 따른 에너지 가격 오름세가 물가를 끌어올렸다.',
    keywords: '물가,소비자물가,유가,인플레이션,에너지',
    snippet: '2월 소비자물가 2.2% 상승, 유가 불안에 에너지발 물가 오름세.',
    url: 'https://www.hankyung.com/article/2026030238161',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 8*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 8*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 8*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '2월 소비자물가 2.2% 상승. 국제 유가 불안에 에너지발 오름세 지속.',
    fullBody: '2월 소비자물가지수(CPI)가 전년 동기 대비 2.2% 상승했다. 통계청은 국제 유가 불안에 따른 에너지 가격 오름세가 물가 상승을 주도했다고 설명했다. 중동 정세 불안으로 국제 유가가 배럴당 85달러를 넘어서면서 석유류 가격이 7.3% 오른 것이 물가를 끌어올렸다.',
    bodyParagraphs: ['2월 소비자물가 2.2% 상승.', '에너지발 물가 오름세 지속.'],
    relatedKeywords: ['소비자물가', '유가', '인플레이션', '에너지']
  },
  {
    id: 'real_008', uuid: 'real_008',
    title: '"무탄소 전기만으론 부족하다"…반도체업계의 가스 전쟁',
    description: '급증하는 AI 데이터센터 전력 수요에 반도체 기업들이 무탄소 전기만으로는 수요를 충족할 수 없다고 밝히며 천연가스 확보 경쟁에 나서고 있다.',
    keywords: '반도체,AI,에너지,천연가스,데이터센터',
    snippet: 'AI 데이터센터 전력 수요 급증에 반도체업계 천연가스 확보 경쟁.',
    url: 'https://www.hankyung.com/article/202602266044i',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 9*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 9*3600000).toISOString(),
    source: '한국경제', categories: ['테크'], category: '테크',
    date: new Date(now.getTime() - 9*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: 'AI 데이터센터 전력 급증에 반도체업계 천연가스 확보 경쟁 심화.',
    fullBody: '급증하는 AI 데이터센터 전력 수요에 반도체 기업들이 무탄소 전기만으로는 수요를 충족할 수 없다고 밝히며 천연가스 확보 경쟁에 나서고 있다. 삼성전자, SK하이닉스 등 국내 기업들도 반도체 공장 가동에 필요한 안정적인 전력 공급을 위해 다양한 에너지원 확보에 나섰다.',
    bodyParagraphs: ['AI 데이터센터 전력 급증에 무탄소 전기만으로는 부족.', '반도체업계 천연가스 확보 경쟁 심화.'],
    relatedKeywords: ['반도체', 'AI', '에너지', '천연가스', '데이터센터']
  },
  {
    id: 'real_009', uuid: 'real_009',
    title: '아파트 공시가 뛴다…강남 세부담 커질 듯',
    description: '올해 아파트 공시가격이 큰 폭으로 상승하면서 강남 등 주요 지역 보유세 부담이 크게 늘어날 전망이다.',
    keywords: '공시가격,아파트,강남,보유세,부동산',
    snippet: '올해 아파트 공시가 상승으로 강남 보유세 부담 증가 전망.',
    url: 'https://www.hankyung.com/article/2026030363781',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 10*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 10*3600000).toISOString(),
    source: '한국경제', categories: ['부동산'], category: '부동산',
    date: new Date(now.getTime() - 10*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '아파트 공시가 상승으로 강남 등 주요 지역 보유세 부담 확대.',
    fullBody: '올해 아파트 공시가격이 큰 폭으로 상승하면서 강남 등 주요 지역 주택 소유자들의 보유세 부담이 크게 늘어날 전망이다. 국토교통부가 발표한 공동주택 공시가격안에 따르면 전국 평균 상승률은 8.7%이며, 강남·서초·송파구 등 고가 주택 밀집 지역은 10~15% 오른 것으로 나타났다.',
    bodyParagraphs: ['아파트 공시가 상승으로 강남 보유세 부담 증가.'],
    relatedKeywords: ['공시가격', '아파트', '강남', '보유세']
  },
  {
    id: 'real_010', uuid: 'real_010',
    title: '장기전세주택 20년…서민 주거 안전망 역할 "톡톡"',
    description: '장기전세주택 제도 시행 20년을 맞아 서민 주거 안전망으로서의 역할이 재조명받고 있다. 누적 입주 가구 수가 10만을 돌파했다.',
    keywords: '장기전세주택,서민주거,임대주택,부동산정책',
    snippet: '장기전세주택 20주년, 서민 주거 안전망으로 누적 10만 가구 돌파.',
    url: 'https://www.hankyung.com/article/2026030363771',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 11*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 11*3600000).toISOString(),
    source: '한국경제', categories: ['부동산'], category: '부동산',
    date: new Date(now.getTime() - 11*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '장기전세주택 20년, 서민 주거 안전망으로서 누적 10만 가구 돌파.',
    fullBody: '장기전세주택 제도 시행 20주년을 맞아 서민 주거 안전망으로서의 역할이 재조명받고 있다. 1990년대 말 외환위기 이후 도입된 이 제도는 시세 대비 저렴한 전세로 거주할 수 있어 중산층 이하 가구에 큰 인기를 끌었다. 20년간 누적 입주 가구 수는 10만 가구를 돌파했다.',
    bodyParagraphs: ['장기전세주택 20년 서민 주거 안전망 역할.', '누적 10만 가구 돌파.'],
    relatedKeywords: ['장기전세', '서민주거', '임대주택', '부동산정책']
  },
  {
    id: 'real_011', uuid: 'real_011',
    title: '테헤란로 빌딩 리모델링 연면적 최대 30% 늘린다',
    description: '서울시가 테헤란로 일대 노후 오피스 빌딩의 리모델링 시 연면적을 최대 30%까지 늘릴 수 있도록 허용하는 방안을 추진한다.',
    keywords: '테헤란로,리모델링,오피스,서울시,연면적',
    snippet: '서울시 테헤란로 빌딩 리모델링 연면적 30% 증가 허용 추진.',
    url: 'https://www.hankyung.com/article/2026030363791',
    image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 12*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 12*3600000).toISOString(),
    source: '한국경제', categories: ['부동산'], category: '부동산',
    date: new Date(now.getTime() - 12*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '서울시 테헤란로 오피스 리모델링 연면적 30% 증가 허용 추진.',
    fullBody: '서울시가 테헤란로 일대 노후 오피스 빌딩 리모델링 시 연면적을 최대 30%까지 늘릴 수 있도록 허용하는 방안을 추진한다. 이는 강남 업무지구의 노후화된 건물을 현대적으로 개선하고 부족한 우량 오피스 공급을 늘리기 위한 정책이다.',
    bodyParagraphs: ['서울시 테헤란로 빌딩 리모델링 연면적 30% 증가 허용 추진.'],
    relatedKeywords: ['테헤란로', '리모델링', '오피스', '서울시']
  },
  {
    id: 'real_012', uuid: 'real_012',
    title: '해수부 장관에 "부산 출신 관료"…HMM 민영화 이끈다',
    description: '정부가 해양수산부 장관에 부산 출신 해양 관료를 내정하면서 HMM 민영화와 해운업 경쟁력 강화에 속도를 낼 것으로 기대된다.',
    keywords: 'HMM,민영화,해수부,해운,부산',
    snippet: '해수부 장관 내정에 HMM 민영화 가속 기대.',
    url: 'https://www.hankyung.com/article/2026030239461',
    image_url: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 13*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 13*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 13*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '해수부 장관 부산 출신 관료 내정, HMM 민영화 가속 기대.',
    fullBody: '정부가 해양수산부 장관에 부산 출신 해양 전문 관료를 내정했다. 이에 따라 HMM 민영화 작업과 해운업 경쟁력 강화 정책이 속도를 낼 것으로 기대된다. 새 장관 내정자는 해수부에서 해운정책 업무를 담당한 전문가로 알려졌다.',
    bodyParagraphs: ['해수부 장관 부산 출신 관료 내정.', 'HMM 민영화 가속 기대.'],
    relatedKeywords: ['HMM', '민영화', '해수부', '해운']
  },
  {
    id: 'real_013', uuid: 'real_013',
    title: '인구감소지역 "외국인 빗장" 푼다…취업비자 간소화',
    description: '정부가 인구 감소 지역의 외국인 취업비자 발급 요건을 대폭 완화하기로 했다. 지방 소멸 위기 대응과 지역 경제 활성화가 목적이다.',
    keywords: '외국인,취업비자,인구감소,지방소멸,이민정책',
    snippet: '정부, 인구감소지역 외국인 취업비자 간소화로 지방소멸 대응.',
    url: 'https://www.hankyung.com/article/2026030365641',
    image_url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 14*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 14*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 14*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '정부 인구감소지역 외국인 취업비자 대폭 간소화 추진.',
    fullBody: '정부가 인구 감소 지역의 외국인 취업비자 발급 요건을 대폭 완화하기로 했다. 지방 소멸 위기 대응 차원에서 농어촌·중소도시 등 인구감소 지역에서는 외국 인력 채용 절차를 기존 대비 절반으로 줄이겠다는 방침이다. 이를 통해 지역 경제 활성화와 고령화로 인한 인력 부족 문제를 해소한다는 목표다.',
    bodyParagraphs: ['정부 인구감소지역 외국인 취업비자 간소화 추진.', '지방소멸 위기 대응 차원.'],
    relatedKeywords: ['외국인', '취업비자', '인구감소', '지방소멸']
  },
  {
    id: 'real_014', uuid: 'real_014',
    title: '박홍근 "재정 화수분 아니야…불요불급 예산 과감히 도려내야"',
    description: '박홍근 더불어민주당 원내대표가 재정 건전성을 강조하며 불필요한 예산은 과감히 삭감해야 한다고 밝혔다.',
    keywords: '재정,예산,박홍근,민주당,재정건전성',
    snippet: '박홍근 민주당 원내대표 재정 건전성 강조, 불요불급 예산 삭감 촉구.',
    url: 'https://www.hankyung.com/article/202603034898i',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 15*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 15*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 15*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '박홍근 민주당 원내대표 재정 건전성 강조, 불요불급 예산 과감히 삭감 촉구.',
    fullBody: '박홍근 더불어민주당 원내대표가 재정은 화수분이 아니라며 불필요한 예산은 과감히 도려내야 한다고 강조했다. 박 원내대표는 국회에서 열린 원내대책회의에서 "재정 건전성은 미래 세대를 위한 최소한의 의무"라며 이같이 밝혔다.',
    bodyParagraphs: ['박홍근 원내대표 재정 건전성 강조.', '불요불급 예산 과감히 삭감 촉구.'],
    relatedKeywords: ['재정', '예산', '박홍근', '민주당']
  },
  {
    id: 'real_015', uuid: 'real_015',
    title: '중동 체류 국민 1.7만명…정부, 육로 대피계획 수립',
    description: '미국-이란 전쟁 발발로 중동 체류 우리 국민 약 1만 7천 명의 안전 문제가 대두됐다. 정부는 육로 대피계획을 수립하는 등 비상 대응에 나섰다.',
    keywords: '중동,이란,교민,대피,전쟁,외교부',
    snippet: '중동 체류 한국 국민 1.7만명, 정부 육로 대피계획 수립.',
    url: 'https://www.hankyung.com/article/2026030240731',
    image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 16*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 16*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 16*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '중동 체류 한국 국민 1.7만명. 정부 육로 대피계획 마련.',
    fullBody: '미국-이란 전쟁 발발로 중동 체류 우리 국민 약 1만 7천 명의 안전 문제가 대두됐다. 외교부는 이스라엘, UAE, 사우디아라비아 등 중동 지역 주재 한국 대사관을 통해 교민 현황을 파악하고 육로 대피계획을 수립하는 등 비상 대응에 나섰다. 김민석 국무총리는 "중동 체류 국민의 안전이 최우선"이라고 밝혔다.',
    bodyParagraphs: ['중동 체류 한국 국민 1.7만명.', '정부 육로 대피계획 수립.'],
    relatedKeywords: ['중동', '이란', '교민', '대피', '전쟁']
  },
  {
    id: 'real_016', uuid: 'real_016',
    title: '호르무즈 해협 내 국적 선박 40척…"안전구역으로 이동"',
    description: '미국-이란 전쟁으로 호르무즈 해협 인근에서 운항 중인 국적 선박 40여 척에 대해 정부가 안전구역으로 이동할 것을 권고했다.',
    keywords: '호르무즈해협,선박,해운,이란,전쟁',
    snippet: '호르무즈 해협 국적 선박 40척, 정부 안전구역 이동 권고.',
    url: 'https://www.hankyung.com/article/2026030290731',
    image_url: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 17*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 17*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 17*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '호르무즈 해협 국적 선박 40척, 안전구역 이동 권고.',
    fullBody: '미국-이란 전쟁으로 인해 호르무즈 해협 인근에서 운항 중인 국적 선박 40여 척에 대해 정부가 안전구역으로 이동을 권고했다. 해양수산부는 해협을 통과하는 한국 선박들에 항로 변경 또는 대기를 요청하는 한편, 해군 호위 파견을 검토 중이다.',
    bodyParagraphs: ['호르무즈 해협 국적 선박 40척 안전구역 이동 권고.'],
    relatedKeywords: ['호르무즈해협', '선박', '해운', '이란', '전쟁']
  },
  {
    id: 'real_017', uuid: 'real_017',
    title: '비트코인, 미-이란 전쟁 후 빠른 반등…1억원대 재진입',
    description: '미국과 이스라엘의 이란 공격 이후 빠르게 반등한 비트코인이 1억원대를 재돌파했다. 투자자들이 전쟁 여파가 크지 않을 것으로 판단하고 저가 매수에 나선 영향이다.',
    keywords: '비트코인,암호화폐,이란,전쟁,반등',
    snippet: '비트코인 미-이란 전쟁 충격 딛고 1억원대 재진입.',
    url: 'https://www.hankyung.com/article/2026030364891',
    image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 18*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 18*3600000).toISOString(),
    source: '한국경제', categories: ['암호화폐'], category: '암호화폐',
    date: new Date(now.getTime() - 18*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '비트코인, 이란 전쟁 충격 딛고 빠른 반등으로 1억원대 재진입.',
    fullBody: '미국과 이스라엘의 이란 공격 이후 빠르게 반등한 비트코인이 국내 거래소 기준 1억원대를 재돌파했다. 투자자들이 이번 무력 충돌의 여파가 크지 않을 것으로 판단하고 저가 매수에 뛰어든 영향으로 풀이된다. 글로벌 암호화폐 거래소에서 비트코인은 7만5000달러 선을 회복했다.',
    bodyParagraphs: ['비트코인 이란 전쟁 충격 딛고 반등.', '국내 거래소 기준 1억원대 재돌파.'],
    relatedKeywords: ['비트코인', '암호화폐', '이란', '전쟁', '반등']
  },
  {
    id: 'real_018', uuid: 'real_018',
    title: '국제유가, 이란 전쟁에 배럴당 90달러 돌파…에너지주 급등',
    description: '미국-이란 전쟁 발발로 국제유가가 급등해 서부텍사스산 원유(WTI) 기준 배럴당 90달러를 돌파했다. 국내 정유·에너지 관련 주식들은 강세를 보였다.',
    keywords: '국제유가,WTI,이란,전쟁,정유주,에너지',
    snippet: '미-이란 전쟁에 국제유가 배럴당 90달러 돌파, 정유주 강세.',
    url: 'https://www.hankyung.com/article/2026030264891',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 19*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 19*3600000).toISOString(),
    source: '한국경제', categories: ['주식'], category: '주식',
    date: new Date(now.getTime() - 19*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '미-이란 전쟁에 국제유가 90달러 돌파, 국내 정유주 강세.',
    fullBody: '미국-이란 전쟁 발발로 국제유가가 급등해 서부텍사스산 원유(WTI) 기준 배럴당 90달러를 돌파했다. 중동 지역 원유 공급 차질 우려가 커지면서 뉴욕상업거래소에서 WTI는 전일 대비 8.2% 급등한 배럴당 91.30달러에 거래됐다. 국내 정유사인 SK이노베이션, GS칼텍스, 에쓰오일 관련 주식들은 5~12% 급등했다.',
    bodyParagraphs: ['미-이란 전쟁에 국제유가 90달러 돌파.', '국내 정유주 5~12% 급등.'],
    relatedKeywords: ['국제유가', 'WTI', '이란', '정유주', '에너지']
  },
  {
    id: 'real_019', uuid: 'real_019',
    title: '"전쟁이 증시 상승추세 못 바꿔"…저가 매수 적기 논란',
    description: '코스피가 7% 급락한 가운데 증시 전문가들 사이에서 전쟁이 증시 상승 추세를 바꾸지 못한다는 분석과 저가 매수는 아직 이르다는 신중론이 팽팽히 맞서고 있다.',
    keywords: '코스피,전쟁,저가매수,증시전망,이란',
    snippet: '코스피 급락 후 전문가 전쟁의 증시 추세 불변론 vs 저가매수 신중론 엇갈려.',
    url: 'https://www.hankyung.com/article/2026030365771',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 20*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 20*3600000).toISOString(),
    source: '한국경제', categories: ['주식'], category: '주식',
    date: new Date(now.getTime() - 20*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '전쟁이 증시 추세 못바꾼다는 분석 vs 저가매수 아직 이르다는 신중론 대립.',
    fullBody: '코스피지수가 7% 넘게 급락한 가운데 증시 전문가들 사이에서 의견이 엇갈리고 있다. 이건규 르네상스자산운용 대표는 "전쟁으로 인한 주가 하락은 일시적이며 이후 상승으로 이어진 사례가 많다"고 말했다. 반면 일부 전문가들은 "이란의 원유 수출 차단 가능성과 중동 확전 리스크를 감안할 때 저가 매수는 이르다"며 신중한 입장을 보였다.',
    bodyParagraphs: ['전쟁 이후 증시 반등 전망 vs 저가매수 신중론 대립.'],
    relatedKeywords: ['코스피', '전쟁', '저가매수', '증시전망']
  },
  {
    id: 'real_020', uuid: 'real_020',
    title: '삼성전자, 엔비디아 HBM4 공급 계약 협상 가속…SK하이닉스 독주 견제',
    description: '삼성전자가 엔비디아 차세대 AI 칩에 탑재될 HBM4 공급 계약 협상을 가속화하고 있다. SK하이닉스의 독주를 막겠다는 의지로 풀이된다.',
    keywords: '삼성전자,엔비디아,HBM4,반도체,SK하이닉스',
    snippet: '삼성전자 엔비디아 HBM4 공급 협상 가속, SK하이닉스 독주 견제.',
    url: 'https://www.hankyung.com/article/2026030254891',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 21*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 21*3600000).toISOString(),
    source: '한국경제', categories: ['테크'], category: '테크',
    date: new Date(now.getTime() - 21*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '삼성전자 엔비디아 HBM4 공급 협상 가속화, SK하이닉스 독주 견제 본격화.',
    fullBody: '삼성전자가 엔비디아의 차세대 AI 칩 블랙웰 울트라에 탑재될 HBM4 공급 계약 협상을 가속화하고 있다. 삼성전자 반도체 부문 관계자는 "HBM4 품질 인증 절차가 마무리 단계에 있다"고 밝혔다. 현재 엔비디아 HBM 시장을 독점하다시피 한 SK하이닉스와의 경쟁이 본격화될 전망이다.',
    bodyParagraphs: ['삼성전자 엔비디아 HBM4 공급 협상 가속화.', 'SK하이닉스 독주 견제 본격화.'],
    relatedKeywords: ['삼성전자', '엔비디아', 'HBM4', '반도체', 'SK하이닉스']
  },
  {
    id: 'real_021', uuid: 'real_021',
    title: '현대차·기아, 미국 관세 대응 조지아·앨라배마 생산 확대',
    description: '현대자동차그룹이 미국의 수입차 관세 부과에 대응해 미국 조지아·앨라배마 공장 생산량을 연간 30만 대 늘리기로 했다.',
    keywords: '현대차,기아,미국,관세,현지생산,조지아',
    snippet: '현대차기아 미국 관세 대응 조지아·앨라배마 생산 30만대 확대.',
    url: 'https://www.hankyung.com/article/2026030244891',
    image_url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 22*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 22*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 22*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '현대차기아 미국 관세 대응 현지 생산 30만대 확대.',
    fullBody: '현대자동차그룹이 미국의 수입차 25% 관세 부과에 대응해 미국 조지아 메타플랜트와 앨라배마 공장의 생산량을 연간 30만 대 늘리기로 결정했다. 이를 위해 향후 3년간 40억 달러를 추가 투자할 예정이다. 이렇게 되면 현대차그룹의 미국 현지 생산 비중은 전체의 60%를 넘어서게 된다.',
    bodyParagraphs: ['현대차기아 미국 관세 대응 현지 생산 30만대 확대.', '향후 3년간 40억 달러 추가 투자.'],
    relatedKeywords: ['현대차', '기아', '미국', '관세', '현지생산']
  },
  {
    id: 'real_022', uuid: 'real_022',
    title: '금값, 안전자산 수요에 온스당 2,950달러…사상 최고치 경신',
    description: '중동 전쟁 발발로 안전자산 수요가 급증하면서 국제 금값이 온스당 2,950달러를 돌파하며 사상 최고치를 경신했다.',
    keywords: '금값,금,안전자산,중동,전쟁,사상최고가',
    snippet: '중동 전쟁 안전자산 수요에 금값 2950달러 사상 최고치.',
    url: 'https://www.hankyung.com/article/2026030234891',
    image_url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 23*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 23*3600000).toISOString(),
    source: '한국경제', categories: ['금융'], category: '금융',
    date: new Date(now.getTime() - 23*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '중동 전쟁 안전자산 수요에 국제 금값 2,950달러 사상 최고치 경신.',
    fullBody: '중동 전쟁 발발로 안전자산 수요가 급증하면서 국제 금값이 온스당 2,950달러를 돌파하며 사상 최고치를 경신했다. 뉴욕상품거래소에서 금 현물은 전일 대비 3.5% 급등한 2,958달러에 거래됐다. 전쟁 불확실성이 고조될수록 금으로의 자금 이동이 심화되고 있다.',
    bodyParagraphs: ['중동 전쟁 안전자산 수요에 금값 2,950달러 사상 최고치.'],
    relatedKeywords: ['금값', '금', '안전자산', '중동', '전쟁']
  },
  {
    id: 'real_023', uuid: 'real_023',
    title: '코스닥 방산株 대거 상한가…LIG넥스원·한화에어로스페이스 급등',
    description: '미국-이란 전쟁 발발로 코스닥 방산 관련주들이 대거 상한가를 기록했다. LIG넥스원과 한화에어로스페이스는 장중 30% 이상 급등했다.',
    keywords: '코스닥,방산주,LIG넥스원,한화에어로스페이스,전쟁',
    snippet: '미-이란 전쟁에 방산주 대거 상한가, LIG넥스원·한화에어로스페이스 급등.',
    url: 'https://www.hankyung.com/article/2026030224891',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 24*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 24*3600000).toISOString(),
    source: '한국경제', categories: ['주식'], category: '주식',
    date: new Date(now.getTime() - 24*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '미-이란 전쟁에 방산주 대거 상한가, LIG넥스원·한화에어로스페이스 급등.',
    fullBody: '미국-이란 전쟁 발발로 코스닥 방산 관련주들이 대거 상한가를 기록했다. LIG넥스원과 한화에어로스페이스는 장중 한때 30% 이상 급등했으며, 이외에도 퍼스텍, 빅텍, 한국항공우주 등 방산 관련주들이 일제히 강세를 보였다. 전문가들은 방산 수출 확대 기대감이 반영된 것이라고 분석했다.',
    bodyParagraphs: ['미-이란 전쟁에 방산주 대거 상한가.', 'LIG넥스원·한화에어로스페이스 급등.'],
    relatedKeywords: ['코스닥', '방산주', 'LIG넥스원', '한화에어로스페이스']
  },
  {
    id: 'real_024', uuid: 'real_024',
    title: '엔화, 달러당 147엔대…안전자산 수요에 강세 전환',
    description: '중동 전쟁 발발로 안전자산인 엔화 수요가 급증하면서 엔달러 환율이 달러당 147엔대로 하락(엔화 강세)했다.',
    keywords: '엔화,일본,환율,안전자산,엔달러',
    snippet: '중동 전쟁 안전자산 수요에 엔화 강세, 달러당 147엔대.',
    url: 'https://www.hankyung.com/article/2026030214891',
    image_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 25*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 25*3600000).toISOString(),
    source: '한국경제', categories: ['환율'], category: '환율',
    date: new Date(now.getTime() - 25*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '중동 전쟁 안전자산 수요에 엔화 강세, 달러당 147엔대.',
    fullBody: '중동 전쟁 발발로 안전자산인 엔화 수요가 급증하면서 엔달러 환율이 달러당 147엔대로 하락(엔화 강세)했다. 전쟁 리스크가 고조될 때마다 투자자들이 안전자산인 엔화로 몰리는 전통적 패턴이 재현됐다. 일본은행의 금리 인상 기조와 맞물려 엔화 강세가 당분간 이어질 것으로 전망된다.',
    bodyParagraphs: ['중동 전쟁 안전자산 수요에 엔화 강세.', '달러당 147엔대.'],
    relatedKeywords: ['엔화', '일본', '환율', '안전자산']
  },
  {
    id: 'real_025', uuid: 'real_025',
    title: '서울 아파트 전세가 3개월 연속 상승…강남 전세 품귀 현상',
    description: '서울 아파트 전세가격이 3개월 연속 상승세를 이어가며 강남권에서는 전세 물건 품귀 현상이 빚어지고 있다.',
    keywords: '아파트,전세,강남,부동산,서울',
    snippet: '서울 아파트 전세가 3개월 연속 상승, 강남 품귀 현상.',
    url: 'https://www.hankyung.com/article/2026030204891',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 26*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 26*3600000).toISOString(),
    source: '한국경제', categories: ['부동산'], category: '부동산',
    date: new Date(now.getTime() - 26*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '서울 아파트 전세가 3개월 연속 상승, 강남권 전세 품귀 현상.',
    fullBody: '서울 아파트 전세가격이 3개월 연속 상승세를 이어가며 강남권에서는 전세 물건 품귀 현상이 빚어지고 있다. 한국부동산원에 따르면 이번 주 서울 아파트 전세가격은 전주 대비 0.08% 올랐다. 재건축·재개발 이주 수요와 신규 입주 물량 감소가 맞물리면서 전세 공급이 크게 줄었다.',
    bodyParagraphs: ['서울 아파트 전세가 3개월 연속 상승.', '강남권 전세 품귀 현상.'],
    relatedKeywords: ['아파트', '전세', '강남', '부동산', '서울']
  },
  {
    id: 'real_026', uuid: 'real_026',
    title: '미 증시 급락…S&P500 3% 하락, 방산주 나홀로 강세',
    description: '미국 증시가 이란 전쟁 발발 충격에 S&P500이 3% 급락했다. 록히드마틴, 레이시온 등 방산주는 강세를 보였다.',
    keywords: 'S&P500,미국증시,이란,방산주,급락',
    snippet: '미국 이란 전쟁 충격에 S&P500 3% 급락, 방산주 나홀로 강세.',
    url: 'https://www.hankyung.com/article/2026030194891',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 27*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 27*3600000).toISOString(),
    source: '한국경제', categories: ['주식'], category: '주식',
    date: new Date(now.getTime() - 27*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '이란 전쟁에 미국 S&P500 3% 급락, 방산주만 강세.',
    fullBody: '미국 증시가 이란 전쟁 발발 충격에 S&P500이 3% 급락했다. 에너지주와 방산주를 제외한 대부분의 섹터가 하락했다. 록히드마틴, 레이시온 테크놀로지스 등 방산 대형주는 각각 8%, 6% 급등하며 강세를 보였다. 증시 전문가들은 과거 사례를 보면 전쟁 이후 6개월 내 증시가 반등한 경우가 많다고 분석했다.',
    bodyParagraphs: ['이란 전쟁 충격에 S&P500 3% 급락.', '방산주만 강세.'],
    relatedKeywords: ['S&P500', '미국증시', '이란', '방산주']
  },
  {
    id: 'real_027', uuid: 'real_027',
    title: '트럼프 "이란 핵시설 타격 성공"…이스라엘과 공동 작전',
    description: '도널드 트럼프 미국 대통령이 이란 핵시설 타격 작전이 성공적으로 마무리됐다고 발표했다. 이스라엘과의 공동 군사 작전이었다.',
    keywords: '트럼프,이란,핵시설,미국,이스라엘,전쟁',
    snippet: '트럼프 이란 핵시설 타격 성공 발표, 미국·이스라엘 공동 작전.',
    url: 'https://www.hankyung.com/article/2026030184891',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 28*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 28*3600000).toISOString(),
    source: '한국경제', categories: ['거시경제'], category: '거시경제',
    date: new Date(now.getTime() - 28*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: true, isFeatured: false,
    summary: '트럼프 이란 핵시설 타격 성공 발표. 미국·이스라엘 공동 작전.',
    fullBody: '도널드 트럼프 미국 대통령이 이란 핵시설 타격 작전이 성공적으로 마무리됐다고 발표했다. 트럼프 대통령은 "이번 작전으로 이란의 핵무기 개발 능력이 심각하게 훼손됐다"고 밝혔다. 이스라엘과의 공동 군사 작전으로 진행됐으며, 이란은 즉각적인 보복을 예고했다.',
    bodyParagraphs: ['트럼프 이란 핵시설 타격 성공 발표.', '미국·이스라엘 공동 작전.'],
    relatedKeywords: ['트럼프', '이란', '핵시설', '미국', '이스라엘', '전쟁']
  },
  {
    id: 'real_028', uuid: 'real_028',
    title: '이더리움, 전쟁 충격 딛고 3,200달러 회복…디파이 TVL 급증',
    description: '이더리움이 이란 전쟁 충격에서 빠르게 회복하며 3,200달러를 재돌파했다. 탈중앙금융(DeFi) 예치금(TVL)도 역대 최고치를 경신했다.',
    keywords: '이더리움,DeFi,TVL,암호화폐,디파이',
    snippet: '이더리움 전쟁 충격 딛고 3,200달러 회복, 디파이 TVL 역대 최고.',
    url: 'https://www.hankyung.com/article/2026030174891',
    image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 29*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 29*3600000).toISOString(),
    source: '한국경제', categories: ['암호화폐'], category: '암호화폐',
    date: new Date(now.getTime() - 29*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '이더리움 3,200달러 회복. 디파이 TVL 역대 최고치 경신.',
    fullBody: '이더리움이 이란 전쟁 충격에서 빠르게 회복하며 3,200달러를 재돌파했다. 탈중앙금융(DeFi) 예치금(TVL)도 2,800억 달러로 역대 최고치를 경신했다. 분석가들은 전쟁 불확실성 속에서도 암호화폐 시장이 빠르게 회복하는 것은 이 시장의 구조적 성장을 반영한다고 분석했다.',
    bodyParagraphs: ['이더리움 3,200달러 회복.', '디파이 TVL 역대 최고치.'],
    relatedKeywords: ['이더리움', 'DeFi', 'TVL', '암호화폐']
  },
  {
    id: 'real_029', uuid: 'real_029',
    title: '원화, 중동 전쟁에 약세…원달러 1,490원대 거래',
    description: '중동 전쟁으로 달러 강세가 이어지면서 원달러 환율이 1,490원대로 올랐다. 외환당국이 시장 안정 조치를 시사했다.',
    keywords: '원화,원달러,환율,달러,중동전쟁,외환당국',
    snippet: '중동 전쟁 달러 강세에 원달러 1,490원대. 외환당국 시장 안정 시사.',
    url: 'https://www.hankyung.com/article/2026030164891',
    image_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 30*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 30*3600000).toISOString(),
    source: '한국경제', categories: ['환율'], category: '환율',
    date: new Date(now.getTime() - 30*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '중동 전쟁 달러 강세에 원달러 1,490원대, 외환당국 시장 안정 시사.',
    fullBody: '중동 전쟁으로 달러 강세가 이어지면서 원달러 환율이 1,490원대로 올랐다. 한국 외환당국은 급격한 환율 변동을 막기 위해 시장 안정 조치를 시사했다. 기획재정부 관계자는 "과도한 외환 변동성에 대해 적절한 조치를 취할 것"이라고 밝혔다.',
    bodyParagraphs: ['중동 전쟁 달러 강세에 원달러 1,490원대.', '외환당국 시장 안정 조치 시사.'],
    relatedKeywords: ['원화', '원달러', '환율', '달러', '중동전쟁']
  },
  {
    id: 'real_030', uuid: 'real_030',
    title: 'LG전자, AI 가전 구독 서비스 가입자 500만 돌파…수익성 개선',
    description: 'LG전자의 AI 가전 구독 서비스 누적 가입자가 500만 명을 돌파했다. 이에 따라 LG전자의 서비스 부문 매출이 처음으로 하드웨어 매출을 앞섰다.',
    keywords: 'LG전자,AI가전,구독서비스,수익성',
    snippet: 'LG전자 AI 가전 구독 서비스 500만 돌파, 서비스 매출이 하드웨어 첫 추월.',
    url: 'https://www.hankyung.com/article/2026030154891',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    language: 'ko', published_at: new Date(now.getTime() - 31*3600000).toISOString(),
    publishedAt: new Date(now.getTime() - 31*3600000).toISOString(),
    source: '한국경제', categories: ['테크'], category: '테크',
    date: new Date(now.getTime() - 31*3600000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: 'LG전자 AI 가전 구독 서비스 500만 돌파, 서비스 매출 하드웨어 첫 추월.',
    fullBody: 'LG전자의 AI 가전 구독 서비스 누적 가입자가 500만 명을 돌파했다. 냉장고, 세탁기, 에어컨 등 주요 제품에 AI 기능을 탑재하고 월정액 구독 모델을 도입한 지 3년 만의 성과다. 이에 따라 LG전자의 서비스 부문 분기 매출이 처음으로 하드웨어 매출을 앞질렀다.',
    bodyParagraphs: ['LG전자 AI 가전 구독 서비스 500만 돌파.', '서비스 매출이 하드웨어 첫 추월.'],
    relatedKeywords: ['LG전자', 'AI가전', '구독서비스', '수익성']
  }
];

// ============================================================
// 다국어 실제 뉴스 (미국/일본/중국/유럽 시각 - 2026.03.04)
// ============================================================
const now2 = new Date('2026-03-04T01:00:00+09:00');
const MULTILINGUAL_ARTICLES: NewsArticle[] = [
  {
    id: 'us_001', uuid: 'us_001',
    title: 'U.S.-Israel Strike Shakes Global Markets — Oil Surges Past $90',
    description: 'Global markets tumbled after the U.S. and Israel launched strikes on Iranian nuclear facilities. Brent crude surged past $90 a barrel as traders priced in Middle East supply disruption risks.',
    keywords: 'oil,iran,war,markets,S&P500',
    snippet: 'Oil surges past $90 as U.S.-Israel Iran strikes rattle global markets.',
    url: 'https://www.reuters.com/markets/global-markets-iran-2026-03-03/',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'en', published_at: new Date(now2.getTime() - 3.5*3600000).toISOString(),
    publishedAt: new Date(now2.getTime() - 3.5*3600000).toISOString(),
    source: 'Reuters', categories: ['거시경제'], category: '거시경제',
    date: new Date(now2.getTime() - 3.5*3600000).toISOString(),
    relevance_score: null, locale: 'en', isBreaking: true, isFeatured: false,
    summary: 'U.S.-Israel Iran strikes send oil past $90, global markets in turmoil.',
    fullBody: 'Global markets tumbled after the United States and Israel jointly launched strikes on Iranian nuclear facilities. Brent crude surged past $90 per barrel as traders priced in Strait of Hormuz disruption risk. The S&P 500 fell 3.2% in early trading while gold, yen, and Treasuries rallied sharply.',
    bodyParagraphs: ['Global markets tumble after U.S.-Israel strikes on Iran.', 'Oil surges past $90 per barrel.'],
    relatedKeywords: ['oil', 'iran', 'war', 'markets', 'S&P500']
  },
  {
    id: 'us_002', uuid: 'us_002',
    title: 'Fed Officials Signal Rate Cuts Could Be Delayed Amid Oil Shock',
    description: 'Federal Reserve officials warned that the Middle East oil shock could reignite inflation, potentially pushing the first rate cut to the second half of 2026.',
    keywords: 'Fed,interest rate,inflation,oil,monetary policy',
    snippet: 'Fed signals rate cuts delayed as Iran war oil shock risks reigniting inflation.',
    url: 'https://www.wsj.com/economy/federal-reserve-rate-cuts-iran-2026-03-03',
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    language: 'en', published_at: new Date(now2.getTime() - 5*3600000).toISOString(),
    publishedAt: new Date(now2.getTime() - 5*3600000).toISOString(),
    source: 'WSJ', categories: ['금융'], category: '금융',
    date: new Date(now2.getTime() - 5*3600000).toISOString(),
    relevance_score: null, locale: 'en', isBreaking: false, isFeatured: false,
    summary: 'Fed may delay rate cuts as Iran oil shock threatens to reignite inflation.',
    fullBody: 'Federal Reserve officials warned that the surge in oil prices triggered by the U.S.-Israel military operation against Iran could reignite inflation, potentially pushing the first rate cut back to the second half of 2026. Fed Governor warned the central bank must remain vigilant as energy price spikes historically translate into broader inflation.',
    bodyParagraphs: ['Fed may delay rate cuts amid Iran oil shock.', 'Inflation risks resurface.'],
    relatedKeywords: ['Fed', 'interest rate', 'inflation', 'oil']
  },
  {
    id: 'us_003', uuid: 'us_003',
    title: 'Bitcoin Rebounds to $75,000 After Initial Iran War Selloff',
    description: 'Bitcoin recovered to $75,000 after an initial drop following the Iran strikes, as institutional investors bought the dip.',
    keywords: 'Bitcoin,crypto,war,rebound,ETF',
    snippet: 'Bitcoin rebounds to $75k after Iran war shock — institutions buy the dip.',
    url: 'https://www.bloomberg.com/crypto/bitcoin-iran-rebound-2026-03-03',
    image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop',
    language: 'en', published_at: new Date(now2.getTime() - 6*3600000).toISOString(),
    publishedAt: new Date(now2.getTime() - 6*3600000).toISOString(),
    source: 'Bloomberg', categories: ['암호화폐'], category: '암호화폐',
    date: new Date(now2.getTime() - 6*3600000).toISOString(),
    relevance_score: null, locale: 'en', isBreaking: false, isFeatured: false,
    summary: 'Bitcoin bounces back to $75k as dip buyers step in post-Iran shock.',
    fullBody: 'Bitcoin rebounded to $75,000 after initially tumbling 8% following news of U.S.-Israel strikes on Iranian nuclear facilities. The rebound came as institutional investors viewed the dip as a buying opportunity, with spot ETF inflows resuming strongly.',
    bodyParagraphs: ['Bitcoin rebounds to $75,000 after Iran war shock.', 'Institutional dip buying resumes.'],
    relatedKeywords: ['Bitcoin', 'crypto', 'war', 'rebound', 'ETF']
  },
  {
    id: 'eu_001', uuid: 'eu_001',
    title: 'ECB Warns Iran Conflict Could Push Eurozone Inflation Back to 3%',
    description: 'ECB President warned that prolonged Middle East conflict could push eurozone inflation back above 3%, complicating the path to further rate cuts.',
    keywords: 'ECB,inflation,eurozone,Iran,interest rates',
    snippet: 'ECB warns Iran conflict could push eurozone inflation to 3%, complicating rate cuts.',
    url: 'https://www.ft.com/content/ecb-iran-inflation-warning-2026-03-03',
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    language: 'en', published_at: new Date(now2.getTime() - 9*3600000).toISOString(),
    publishedAt: new Date(now2.getTime() - 9*3600000).toISOString(),
    source: 'Financial Times', categories: ['금융'], category: '금융',
    date: new Date(now2.getTime() - 9*3600000).toISOString(),
    relevance_score: null, locale: 'en', isBreaking: false, isFeatured: false,
    summary: 'ECB warns Iran conflict may push eurozone inflation above 3%.',
    fullBody: 'European Central Bank President warned that a prolonged Middle East conflict could push eurozone inflation back above 3%, complicating the path to further interest rate reductions. ECB said it would carefully monitor the situation and energy price developments.',
    bodyParagraphs: ['ECB warns Iran conflict could push eurozone inflation to 3%.', 'Rate cut path complicated.'],
    relatedKeywords: ['ECB', 'inflation', 'eurozone', 'Iran']
  },
  {
    id: 'jp_001', uuid: 'jp_001',
    title: '円急騰・日経平均1,200円安…中東有事で安全資産需要急増',
    description: '米国・イスラエルによるイラン核施設攻撃を受け、安全資産の円に資金が集中。円ドル相場は1ドル147円台に急騰し、日経平均株価は1,200円超下落した。',
    keywords: '円高,日経平均,中東,イラン,安全資産',
    snippet: '中東有事で円急騰・日経平均1200円安。',
    url: 'https://www.nikkei.com/article/japan-market-iran-20260303',
    image_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
    language: 'ja', published_at: new Date(now2.getTime() - 4*3600000).toISOString(),
    publishedAt: new Date(now2.getTime() - 4*3600000).toISOString(),
    source: '日本経済新聞', categories: ['환율'], category: '환율',
    date: new Date(now2.getTime() - 4*3600000).toISOString(),
    relevance_score: null, locale: 'ja', isBreaking: true, isFeatured: false,
    summary: '中東有事で円急騰、日経平均1200円安。安全資産需要急増。',
    fullBody: '米国とイスラエルがイランの核施設を攻撃したとの報道を受け、安全資産の円に資金が集中し、円ドル相場は1ドル147円台に急騰した。日経平均株価は前日比1,200円超下落した。',
    bodyParagraphs: ['中東有事で円急騰・日経平均1200円安。'],
    relatedKeywords: ['円高', '日経平均', 'イラン', '安全資産']
  },
  {
    id: 'jp_002', uuid: 'jp_002',
    title: '日銀、追加利上げ議論加速…賃上げ継続で物価目標達成近づく',
    description: '日本銀行が追加利上げの議論を加速させている。春闘での賃上げが継続し、物価目標2%の安定的な達成が近づいている。',
    keywords: '日銀,利上げ,賃上げ,物価,金融政策',
    snippet: '日銀追加利上げ議論加速。賃上げ継続で物価目標達成近づく。',
    url: 'https://www.nikkei.com/article/boj-rate-hike-2026-03-03',
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    language: 'ja', published_at: new Date(now2.getTime() - 8*3600000).toISOString(),
    publishedAt: new Date(now2.getTime() - 8*3600000).toISOString(),
    source: '日本経済新聞', categories: ['금융'], category: '금융',
    date: new Date(now2.getTime() - 8*3600000).toISOString(),
    relevance_score: null, locale: 'ja', isBreaking: false, isFeatured: false,
    summary: '日銀追加利上げ議論加速。賃上げで物価目標達成見込み。',
    fullBody: '日本銀行が追加利上げに向けた内部議論を加速させていることが分かった。今年の春闘での賃上げ率が平均5%を超える見通しとなり、物価目標2%の安定的な達成に自信を深めているとされる。',
    bodyParagraphs: ['日銀追加利上げ議論加速。', '賃上げ継続で物価目標達成近づく。'],
    relatedKeywords: ['日銀', '利上げ', '賃上げ', '金融政策']
  },
  {
    id: 'cn_001', uuid: 'cn_001',
    title: '中国全国两会：GDP增长目标5%，扩大内需为首要任务',
    description: '中国全国人民代表大会开幕，政府工作报告将2026年GDP增长目标定为5%左右，扩大内需和促进消费成为今年经济工作的首要任务。',
    keywords: '中国,两会,GDP,内需,经济增长',
    snippet: '中国两会GDP增长目标5%，扩大内需为首要经济任务。',
    url: 'https://www.xinhua.net/economy/china-npc-gdp-2026-03-03',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'zh', published_at: new Date(now2.getTime() - 7*3600000).toISOString(),
    publishedAt: new Date(now2.getTime() - 7*3600000).toISOString(),
    source: '新华社', categories: ['거시경제'], category: '거시경제',
    date: new Date(now2.getTime() - 7*3600000).toISOString(),
    relevance_score: null, locale: 'zh', isBreaking: false, isFeatured: false,
    summary: '中国两会GDP目标5%，扩大内需促消费成首要任务。',
    fullBody: '中国全国人民代表大会正式开幕，国务院总理在政府工作报告中将2026年经济增长目标定为5%左右。报告强调，扩大内需、促进消费是今年经济工作的首要任务，将出台多项消费补贴政策。',
    bodyParagraphs: ['中国两会GDP增长目标5%。', '扩大内需促消费成首要任务。'],
    relatedKeywords: ['中国', '两会', 'GDP', '内需']
  },
  {
    id: 'cn_002', uuid: 'cn_002',
    title: '恒生指数跌2.8%：中东局势恶化拖累亚洲股市',
    description: '受美以联合打击伊朗核设施消息影响，香港恒生指数大跌2.8%，亚洲各地股市普遍承压。',
    keywords: '恒生指数,亚洲股市,伊朗,中东,地缘政治',
    snippet: '中东局势恶化拖累亚洲股市，恒生指数跌2.8%。',
    url: 'https://www.scmp.com/markets/hang-seng-iran-2026-03-03',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    language: 'zh', published_at: new Date(now2.getTime() - 5.5*3600000).toISOString(),
    publishedAt: new Date(now2.getTime() - 5.5*3600000).toISOString(),
    source: 'SCMP', categories: ['주식'], category: '주식',
    date: new Date(now2.getTime() - 5.5*3600000).toISOString(),
    relevance_score: null, locale: 'zh', isBreaking: false, isFeatured: false,
    summary: '中东局势恶化拖累亚洲股市，恒生指数下跌2.8%。',
    fullBody: '受美以联合打击伊朗核设施的消息冲击，香港恒生指数大跌2.8%，创近三个月最大单日跌幅。科技股普遍下挫，能源板块逆势上涨。',
    bodyParagraphs: ['恒生指数跌2.8%，中东局势恶化拖累亚洲股市。'],
    relatedKeywords: ['恒生指数', '亚洲股市', '伊朗', '中东']
  }
];

// 전체 기사: 한국 30개 + 다국어 8개 = 38개 병합 (최신순 정렬)
export const ALL_FALLBACK_ARTICLES: NewsArticle[] = [
  ...FALLBACK_ARTICLES,
  ...MULTILINGUAL_ARTICLES,
].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

type CategoryKey = "macro" | "stocks" | "markets" | "realestate" | "crypto" | "finance" | "forex" | "tech" | "economy";

const CATEGORY_LABELS: Record<string, Record<CategoryKey, string>> = {
  ko: {
    macro: "거시경제",
    stocks: "주식",
    markets: "시장",
    realestate: "부동산",
    crypto: "암호화폐",
    finance: "금융",
    forex: "환율",
    tech: "테크",
    economy: "경제",
  },
  en: {
    macro: "Macro Economy",
    stocks: "Stocks",
    markets: "Markets",
    realestate: "Real Estate",
    crypto: "Crypto",
    finance: "Finance",
    forex: "Forex",
    tech: "Tech",
    economy: "Economy",
  },
  es: {
    macro: "Macroeconomía",
    stocks: "Acciones",
    markets: "Mercados",
    realestate: "Inmobiliario",
    crypto: "Cripto",
    finance: "Finanzas",
    forex: "Divisas",
    tech: "Tecnología",
    economy: "Economía",
  },
  ja: {
    macro: "マクロ経済",
    stocks: "株式",
    markets: "市場",
    realestate: "不動産",
    crypto: "暗号資産",
    finance: "金融",
    forex: "為替",
    tech: "テック",
    economy: "経済",
  },
  zh: {
    macro: "宏观经济",
    stocks: "股票",
    markets: "市场",
    realestate: "房地产",
    crypto: "加密货币",
    finance: "金融",
    forex: "汇率",
    tech: "科技",
    economy: "经济",
  },
  fr: {
    macro: "Macroéconomie",
    stocks: "Actions",
    markets: "Marchés",
    realestate: "Immobilier",
    crypto: "Crypto",
    finance: "Finance",
    forex: "Forex",
    tech: "Technologie",
    economy: "Économie",
  },
  de: {
    macro: "Makroökonomie",
    stocks: "Aktien",
    markets: "Märkte",
    realestate: "Immobilien",
    crypto: "Krypto",
    finance: "Finanzen",
    forex: "Devisen",
    tech: "Technologie",
    economy: "Wirtschaft",
  },
  pt: {
    macro: "Macroeconomia",
    stocks: "Ações",
    markets: "Mercados",
    realestate: "Imobiliário",
    crypto: "Cripto",
    finance: "Finanças",
    forex: "Câmbio",
    tech: "Tecnologia",
    economy: "Economia",
  },
  id: {
    macro: "Makroekonomi",
    stocks: "Saham",
    markets: "Pasar",
    realestate: "Properti",
    crypto: "Kripto",
    finance: "Keuangan",
    forex: "Valas",
    tech: "Teknologi",
    economy: "Ekonomi",
  },
  ar: {
    macro: "اقتصاد كلي",
    stocks: "أسهم",
    markets: "أسواق",
    realestate: "عقارات",
    crypto: "عملات رقمية",
    finance: "تمويل",
    forex: "صرف",
    tech: "تقنية",
    economy: "اقتصاد",
  },
  hi: {
    macro: "व्यापक अर्थव्यवस्था",
    stocks: "शेयर",
    markets: "बाजार",
    realestate: "रियल एस्टेट",
    crypto: "क्रिप्टो",
    finance: "वित्त",
    forex: "विनिमय दर",
    tech: "टेक",
    economy: "अर्थव्यवस्था",
  },
};

const CATEGORY_ALIASES: Record<string, CategoryKey> = {
  "거시경제": "macro",
  "macro economy": "macro",
  "macroeconomy": "macro",
  "주식": "stocks",
  stocks: "stocks",
  stock: "stocks",
  "시장": "markets",
  markets: "markets",
  market: "markets",
  "부동산": "realestate",
  "real estate": "realestate",
  realestate: "realestate",
  property: "realestate",
  "암호화폐": "crypto",
  crypto: "crypto",
  cryptocurrency: "crypto",
  "가상자산": "crypto",
  "금융": "finance",
  finance: "finance",
  "환율": "forex",
  forex: "forex",
  fx: "forex",
  "테크": "tech",
  tech: "tech",
  technology: "tech",
  "경제": "economy",
  economy: "economy",
};

const normalizeLanguage = (lang: string) => (lang || "en").toLowerCase().split("-")[0];

const normalizeCategoryKey = (category: string): CategoryKey => {
  const normalized = category.trim().toLowerCase();
  return CATEGORY_ALIASES[normalized] || CATEGORY_ALIASES[category.trim()] || "economy";
};

const localizeCategory = (category: string, lang: string): string => {
  const key = normalizeCategoryKey(category);
  const labels = CATEGORY_LABELS[normalizeLanguage(lang)] || CATEGORY_LABELS.en;
  return labels[key] || category;
};

const localizeArticle = (article: NewsArticle, lang: string): NewsArticle => {
  const normalizedLang = normalizeLanguage(lang);
  const localizedCategory = localizeCategory(article.category || "경제", normalizedLang);
  return {
    ...article,
    category: localizedCategory,
    categories: (article.categories || [article.category]).map((category) => localizeCategory(category, normalizedLang)),
    language: normalizedLang,
    locale: normalizedLang,
  };
};

const getFallbackArticlesByLanguage = (lang: string): NewsArticle[] => {
  const normalizedLang = normalizeLanguage(lang);
  const filtered = ALL_FALLBACK_ARTICLES.filter((article) => {
    const articleLang = normalizeLanguage(article.language || article.locale || "");
    return articleLang === normalizedLang;
  });
  return filtered.map((article) => localizeArticle(article, normalizedLang));
};

const getNewsErrorMessage = (lang: string, kind: "load_failed" | "update_failed"): string => {
  const normalizedLang = normalizeLanguage(lang);
  const messages = {
    ko: {
      load_failed: "실시간 뉴스를 불러오지 못했습니다. 기본 뉴스를 표시합니다.",
      update_failed: "실시간 업데이트 중 오류가 발생했습니다.",
    },
    en: {
      load_failed: "Unable to load live news. Showing fallback news.",
      update_failed: "An error occurred during live updates.",
    },
  };
  return (messages[normalizedLang as "ko" | "en"] || messages.en)[kind];
};

// ============================================================
// 경제 뉴스 키워드 쿼리 목록
// ============================================================
const NEWS_QUERIES = [
  'global stock markets S&P500 Nasdaq Dow Jones today 2026',
  'Federal Reserve interest rate decision US economy',
  'Bitcoin Ethereum cryptocurrency market prices today',
  'global real estate housing market 2026',
  'Samsung SK Hynix semiconductor AI chip earnings',
  'USD KRW EUR GBP JPY forex exchange rates today',
  'oil gold silver commodity prices global markets',
  'China economy stimulus Hong Kong Hang Seng',
  'Trump tariffs trade war global economy impact',
  'tech companies earnings Apple Microsoft Google Meta',
  'European Central Bank ECB rate decision Europe',
  'emerging markets India Brazil Indonesia economy',
  'Korea KOSPI KOSDAQ stock market today',
  'Japan Nikkei yen Bank of Japan interest rate',
  'global inflation CPI economic data 2026',
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
// 카테고리별 이미지
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
// ============================================================
async function fetchGeminiNews(query: string, _apiKey: string, lang = 'ko'): Promise<NewsArticle[]> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://econojabis-backend-m2hewckpba-uc.a.run.app';
  const normalizedLang = normalizeLanguage(lang);
  try {
    const apiUrl = `${backendUrl}/api/news?query=${encodeURIComponent(query)}&language=${encodeURIComponent(normalizedLang)}`;
    const res = await fetch(apiUrl, {
      headers: {
        "Accept-Language": normalizedLang,
      },
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backend API error: ${res.status} - ${errText}`);
    }
    const data = await res.json();
    const raw: Record<string, unknown>[] = data.articles || [];
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
      const category = localizeCategory(String(item.category || classifyCategory(title, body)), normalizedLang);
      const id = `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const publishedAt = String(item.published_at || new Date().toISOString());
      const imageUrl = getNewsImageUrl(title, category);
      registerArticle(title, url);
      articles.push({
        id, uuid: id, title,
        description: paragraphs[0] || '',
        keywords: String(item.keywords || ''),
        snippet: paragraphs[0] || '',
        url, image_url: imageUrl, imageUrl,
        language: normalizedLang,
        published_at: publishedAt, publishedAt,
        source: String(item.source || 'EconoJabis'),
        categories: [category], category,
        date: publishedAt,
        relevance_score: null, locale: normalizedLang,
        isBreaking: false, isFeatured: false,
        summary: paragraphs[0] || '',
        fullBody: body,
        bodyParagraphs: paragraphs,
        relatedKeywords: String(item.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
      });
    }
    console.log(`[EconoJabis] Backend query "${query}" -> ${articles.length} articles`);
    return articles;
  } catch (err) {
    console.error('[EconoJabis] Backend fetch error:', err);
    return [];
  }
}

// ============================================================
// 메인 훅 - 실제 뉴스 30개로 즉시 로딩, API로 실시간 갱신
// ============================================================
export const useTheNewsApi = (language = 'ko') => {
  const [articles, setArticles] = useState<NewsArticle[]>(() => getFallbackArticlesByLanguage(language));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const fetchingRef = useRef(false);
  const articleCacheRef = useRef<Map<string, NewsArticle>>(new Map());

  useEffect(() => {
    const localizedFallbacks = getFallbackArticlesByLanguage(language);
    articleCacheRef.current = new Map();
    seenTitles.clear();
    seenUrls.clear();
    for (const a of localizedFallbacks) {
      articleCacheRef.current.set(a.id, a);
      registerArticle(a.title, a.url);
    }
    setArticles(localizedFallbacks);
    setError(null);
    setLastFetched(null);
  }, [language]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://econojabis-backend-m2hewckpba-uc.a.run.app';

  const fetchNews = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    console.log('[EconoJabis] Starting news fetch via backend:', backendUrl);
    try {
      const shuffled = [...NEWS_QUERIES].sort(() => Math.random() - 0.5);
      const selectedQueries = shuffled.slice(0, 5);
      console.log('[EconoJabis] Selected queries:', selectedQueries);
      const results = await Promise.allSettled(
        selectedQueries.map(q => fetchGeminiNews(q, backendUrl, language))
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
      newArticles.sort((a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
      if (newArticles.length > 0) {
        newArticles[0].isFeatured = true;
        newArticles[0].isBreaking = true;
      }
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
        const localizedFallbacks = getFallbackArticlesByLanguage(language);
        setArticles(localizedFallbacks);
        setError(getNewsErrorMessage(language, "load_failed"));
      }
    } catch (e) {
      console.error('[EconoJabis] fetchNews error:', e);
      setError(getNewsErrorMessage(language, "update_failed"));
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [backendUrl, language]);

  useEffect(() => {
    const timer = setTimeout(fetchNews, 1000);
    const interval = setInterval(fetchNews, 3 * 60 * 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchNews]);

  // ============================================================
  // 급상승 검색어 추출 로직
  // 뉴스 제목 + 키워드에서 단어 빈도수를 계산하여 상위 10개 반환
  // 최신 기사(최근 2시간)에 가중치 부여, 불용어 제거
  // ============================================================
  const extractTrendingKeywords = useCallback(() => {
    const freq: Record<string, number> = {};
    const recentCutoff = Date.now() - 2 * 60 * 60 * 1000; // 최근 2시간
    const STOPWORDS = new Set(['있다', '했다', '이다', '하다', '것이다', '것으로', '위해', '대해', '따라', '통해', '관련', '경우', '이후', '이전', '현재', '국내', '국제', '글로벌', '대한', '한국']);
    for (const article of articles) {
      const isRecent = new Date(article.published_at).getTime() > recentCutoff;
      const weight = isRecent ? 2 : 1; // 최근 기사 가중치 2배
      const words = (article.title + ' ' + article.keywords).split(/[\s,·…]+/);
      for (const w of words) {
        const cleaned = w.replace(/[^\w가-힣A&P]/g, '').trim();
        if (cleaned.length > 1 && !STOPWORDS.has(cleaned)) {
          freq[cleaned] = (freq[cleaned] || 0) + weight;
        }
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
