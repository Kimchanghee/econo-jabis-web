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
// 30개 폴백 기사 (API 실패 시 즉시 표시)
// ============================================================
const now = new Date();
const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    id: 'fallback_001', uuid: 'fallback_001', title: '코스피, 외국인 순매수에 2,650선 회복…반도체 강세',
    description: '외국인 투자자들의 반도체 대형주 집중 매수로 코스피가 2,650선을 회복하며 강세를 보이고 있다.',
    keywords: '코스피,반도체,외국인,삼성전자', snippet: '외국인 순매수에 코스피 강세',
    url: 'https://econojabis.com/article/fallback_001', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 10*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 10*60000).toISOString(),
    source: 'EconoJabis', categories: ['주식'], category: '주식', date: new Date(now.getTime() - 10*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: true, isFeatured: true,
    summary: '외국인 투자자들의 반도체 대형주 집중 매수로 코스피가 2,650선을 회복하며 강세를 보이고 있다.',
    fullBody: '외국인 투자자들의 반도체 대형주 집중 매수로 코스피가 2,650선을 회복하며 강세를 보이고 있다. 삼성전자와 SK하이닉스가 각각 2.3%, 3.1% 상승하며 지수 상승을 이끌었다.\n\n한국거래소에 따르면 외국인은 이날 유가증권시장에서 약 5,200억원 순매수했다. 이는 최근 한 달 중 최대 규모의 순매수로, 글로벌 반도체 업황 회복 기대감이 높아진 영향으로 분석된다.',
    bodyParagraphs: ['외국인 투자자들의 반도체 대형주 집중 매수로 코스피가 2,650선을 회복하며 강세를 보이고 있다.'],
    relatedKeywords: ['코스피', '반도체', '외국인']
  },
  {
    id: 'fallback_002', uuid: 'fallback_002', title: '원달러 환율, 1,320원대 하락…달러 약세에 원화 강세',
    description: '미국 달러화 약세와 국내 증시 외국인 순매수 영향으로 원달러 환율이 1,320원대로 하락했다.',
    keywords: '환율,원달러,달러,외환', snippet: '원달러 환율 1,320원대 하락',
    url: 'https://econojabis.com/article/fallback_002', image_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 20*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 20*60000).toISOString(),
    source: 'EconoJabis', categories: ['환율'], category: '환율', date: new Date(now.getTime() - 20*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '미국 달러화 약세와 국내 증시 외국인 순매수 영향으로 원달러 환율이 1,320원대로 하락했다.',
    fullBody: '미국 달러화 약세와 국내 증시 외국인 순매수 영향으로 원달러 환율이 1,320원대로 하락했다. 서울 외환시장에서 원달러 환율은 전일 대비 8.50원 내린 1,323.40원에 마감했다.\n\n달러 약세는 미국 연방준비제도(Fed)의 금리 인하 기대감이 커진 영향으로 풀이된다. 최근 발표된 미국 소비자물가지수(CPI)가 예상보다 낮게 나오면서 Fed의 조기 금리 인하 가능성이 높아졌다.',
    bodyParagraphs: ['원달러 환율이 1,320원대로 하락했다.'],
    relatedKeywords: ['환율', '달러', '원화']
  },
  {
    id: 'fallback_003', uuid: 'fallback_003', title: '비트코인 8만 달러 돌파…기관 투자 확대에 강세',
    description: '비트코인이 기관 투자자들의 매수세 확대와 ETF 자금 유입으로 8만 달러를 돌파하며 강세를 이어가고 있다.',
    keywords: '비트코인,암호화폐,ETF,기관', snippet: '비트코인 8만 달러 돌파',
    url: 'https://econojabis.com/article/fallback_003', image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 30*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 30*60000).toISOString(),
    source: 'EconoJabis', categories: ['암호화폐'], category: '암호화폐', date: new Date(now.getTime() - 30*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '비트코인이 기관 투자자들의 매수세 확대와 ETF 자금 유입으로 8만 달러를 돌파했다.',
    fullBody: '비트코인이 기관 투자자들의 매수세 확대와 ETF 자금 유입으로 8만 달러를 돌파하며 강세를 이어가고 있다. 국내 거래소에서도 비트코인은 1억 800만원을 넘어서며 사상 최고가에 근접하고 있다.\n\n글로벌 암호화폐 시장 데이터에 따르면 비트코인 현물 ETF에는 최근 5일 연속으로 자금이 순유입되고 있으며, 누적 유입액은 15억 달러를 넘어섰다.',
    bodyParagraphs: ['비트코인이 8만 달러를 돌파했다.'],
    relatedKeywords: ['비트코인', '암호화폐', 'ETF']
  }
,
  {
    id: 'fallback_004', uuid: 'fallback_004', title: '삼성전자, HBM4 양산 성공…AI 반도체 시장 선점',
    description: '삼성전자가 차세대 고대역폭 메모리 HBM4 양산에 성공하며 AI 반도체 시장에서 주도권을 확보했다.',
    keywords: '삼성전자,HBM4,반도체,AI', snippet: '삼성전자 HBM4 양산 성공',
    url: 'https://econojabis.com/article/fallback_004', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 40*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 40*60000).toISOString(),
    source: 'EconoJabis', categories: ['테크'], category: '테크', date: new Date(now.getTime() - 40*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '삼성전자가 HBM4 양산에 성공하며 AI 반도체 시장 주도권을 확보했다.',
    fullBody: '삼성전자가 차세대 고대역폭 메모리(HBM) HBM4 양산에 성공하며 엔비디아 등 글로벌 AI 칩 업체들과의 공급 협상에 속도를 내고 있다. HBM4는 기존 HBM3E 대비 데이터 전송 속도가 50% 이상 빠른 것이 특징이다.',
    bodyParagraphs: ['삼성전자가 HBM4 양산에 성공했다.'], relatedKeywords: ['삼성전자', 'HBM4', '반도체']
  },
  {
    id: 'fallback_005', uuid: 'fallback_005', title: '서울 아파트 매매가 3주 연속 상승…강남 3구 주도',
    description: '서울 아파트 매매가격이 3주 연속 상승세를 이어가며 강남 3구가 상승세를 주도하고 있다.',
    keywords: '서울,아파트,부동산,강남', snippet: '서울 아파트 3주 연속 상승',
    url: 'https://econojabis.com/article/fallback_005', image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 50*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 50*60000).toISOString(),
    source: 'EconoJabis', categories: ['부동산'], category: '부동산', date: new Date(now.getTime() - 50*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '서울 아파트 매매가격이 3주 연속 상승세를 이어가고 있다.',
    fullBody: '서울 아파트 매매가격이 3주 연속 상승세를 이어가며 강남 3구(강남·서초·송파)가 상승세를 주도하고 있다. 한국부동산원에 따르면 이번 주 서울 아파트 매매가격은 전주 대비 0.05% 상승했다.',
    bodyParagraphs: ['서울 아파트 3주 연속 상승세.'], relatedKeywords: ['서울', '아파트', '부동산']
  },
  {
    id: 'fallback_006', uuid: 'fallback_006', title: '한국은행, 기준금리 3.0% 동결…글로벌 불확실성 고려',
    description: '한국은행 금융통화위원회가 기준금리를 3.0%로 동결했다. 미국 연준의 금리 방향성과 국내 경기 회복 여부를 지켜보겠다는 입장이다.',
    keywords: '한국은행,기준금리,금통위,통화정책', snippet: '한국은행 기준금리 3.0% 동결',
    url: 'https://econojabis.com/article/fallback_006', image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 60*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 60*60000).toISOString(),
    source: 'EconoJabis', categories: ['금융'], category: '금융', date: new Date(now.getTime() - 60*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '한국은행이 기준금리를 3.0%로 동결했다.',
    fullBody: '한국은행 금융통화위원회가 기준금리를 현 수준인 연 3.0%로 동결했다. 이창용 한국은행 총재는 "글로벌 경제 불확실성이 여전히 높고 미국 연준의 통화정책 방향을 좀 더 지켜볼 필요가 있다"고 밝혔다.',
    bodyParagraphs: ['한국은행이 기준금리 3.0% 동결.'], relatedKeywords: ['한국은행', '기준금리', '금통위']
  },
  {
    id: 'fallback_007', uuid: 'fallback_007', title: '나스닥, AI 기업 실적 호조에 1.8% 급등',
    description: '미국 나스닥 지수가 주요 AI 기업들의 예상을 웃도는 실적 발표에 힘입어 1.8% 급등하며 사상 최고치를 경신했다.',
    keywords: '나스닥,AI,미국증시,엔비디아', snippet: '나스닥 AI 기업 실적에 급등',
    url: 'https://econojabis.com/article/fallback_007', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 70*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 70*60000).toISOString(),
    source: 'EconoJabis', categories: ['주식'], category: '주식', date: new Date(now.getTime() - 70*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '나스닥이 AI 기업 실적 호조에 1.8% 급등했다.',
    fullBody: '미국 나스닥 지수가 주요 AI 기업들의 호실적에 힘입어 전일 대비 1.8% 급등했다. 엔비디아는 4분기 매출이 전년 동기 대비 265% 증가한 390억 달러를 기록했다고 발표하며 주가가 5.2% 상승했다.',
    bodyParagraphs: ['나스닥 AI 기업 실적에 급등.'], relatedKeywords: ['나스닥', 'AI', '엔비디아']
  },
  {
    id: 'fallback_008', uuid: 'fallback_008', title: '트럼프, 한국산 철강에 25% 추가관세 부과 검토',
    description: '도널드 트럼프 미국 대통령이 한국산 철강 및 알루미늄 제품에 25% 추가 관세를 부과하는 방안을 검토 중인 것으로 알려졌다.',
    keywords: '트럼프,관세,무역,철강', snippet: '트럼프 한국산 철강 관세 검토',
    url: 'https://econojabis.com/article/fallback_008', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 80*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 80*60000).toISOString(),
    source: 'EconoJabis', categories: ['거시경제'], category: '거시경제', date: new Date(now.getTime() - 80*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '트럼프 대통령이 한국산 철강에 25% 추가 관세 부과를 검토 중이다.',
    fullBody: '도널드 트럼프 미국 대통령이 한국산 철강 및 알루미늄 제품에 25% 추가 관세를 부과하는 방안을 검토 중인 것으로 알려졌다. 이는 미국의 글로벌 무역 적자 해소를 위한 광범위한 관세 정책의 일환으로 해석된다.',
    bodyParagraphs: ['트럼프 한국산 철강 25% 관세 검토.'], relatedKeywords: ['트럼프', '관세', '무역']
  },
  {
    id: 'fallback_009', uuid: 'fallback_009', title: '국제 유가, 중동 긴장 완화에 배럴당 72달러대 하락',
    description: '중동 지역 지정학적 긴장이 다소 완화되고 미국 원유 재고가 증가하면서 국제유가가 배럴당 72달러대로 하락했다.',
    keywords: '유가,원유,중동,WTI', snippet: '국제유가 중동 완화에 하락',
    url: 'https://econojabis.com/article/fallback_009', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 90*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 90*60000).toISOString(),
    source: 'EconoJabis', categories: ['거시경제'], category: '거시경제', date: new Date(now.getTime() - 90*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '국제유가가 중동 긴장 완화로 72달러대로 하락했다.',
    fullBody: '중동 지역 지정학적 긴장이 다소 완화되고 미국 원유 재고가 증가하면서 국제유가가 배럴당 72달러대로 하락했다. 뉴욕상업거래소에서 서부텍사스산 원유(WTI)는 전일 대비 1.2% 하락한 배럴당 72.40달러에 거래됐다.',
    bodyParagraphs: ['국제유가 72달러대 하락.'], relatedKeywords: ['유가', 'WTI', '원유']
  },
  {
    id: 'fallback_010', uuid: 'fallback_010', title: '금값, 온스당 2,900달러 돌파…안전자산 수요 급증',
    description: '국제 금값이 글로벌 경제 불확실성과 달러 약세로 인해 온스당 2,900달러를 돌파하며 사상 최고치를 경신했다.',
    keywords: '금값,금,안전자산,달러', snippet: '금값 온스당 2,900달러 돌파',
    url: 'https://econojabis.com/article/fallback_010', image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 100*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 100*60000).toISOString(),
    source: 'EconoJabis', categories: ['금융'], category: '금융', date: new Date(now.getTime() - 100*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '국제 금값이 온스당 2,900달러를 돌파했다.',
    fullBody: '국제 금값이 글로벌 경제 불확실성 고조와 달러 약세로 인해 온스당 2,900달러를 돌파하며 사상 최고치를 경신했다. 뉴욕상품거래소에서 금 현물은 전일 대비 0.8% 상승한 온스당 2,912달러에 거래됐다.',
    bodyParagraphs: ['금값 온스당 2,900달러 돌파.'], relatedKeywords: ['금', '안전자산', '금값']
  },
  {
    id: 'fallback_011', uuid: 'fallback_011', title: 'SK하이닉스, 엔비디아 HBM 독점 공급 계약 연장',
    description: 'SK하이닉스가 엔비디아와의 HBM 메모리 독점 공급 계약을 2027년까지 연장했다. 계약 규모는 약 15조원으로 알려졌다.',
    keywords: 'SK하이닉스,엔비디아,HBM,반도체', snippet: 'SK하이닉스 엔비디아 HBM 공급 연장',
    url: 'https://econojabis.com/article/fallback_011', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 110*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 110*60000).toISOString(),
    source: 'EconoJabis', categories: ['테크'], category: '테크', date: new Date(now.getTime() - 110*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: 'SK하이닉스가 엔비디아와 HBM 공급 계약을 연장했다.',
    fullBody: 'SK하이닉스가 엔비디아와의 HBM(고대역폭 메모리) 독점 공급 계약을 2027년까지 연장하기로 했다. 업계에 따르면 계약 규모는 약 15조원에 달하는 것으로 알려졌다.',
    bodyParagraphs: ['SK하이닉스 엔비디아 HBM 계약 연장.'], relatedKeywords: ['SK하이닉스', 'HBM', '엔비디아']
  },
  {
    id: 'fallback_012', uuid: 'fallback_012', title: '네이버, 생성형 AI 검색 서비스 정식 출시…월 활성 사용자 1000만 목표',
    description: '네이버가 생성형 AI를 기반으로 한 차세대 검색 서비스를 정식 출시하고 연내 월 활성 사용자 1,000만 명 달성을 목표로 내세웠다.',
    keywords: '네이버,AI,검색,생성형AI', snippet: '네이버 AI 검색 서비스 출시',
    url: 'https://econojabis.com/article/fallback_012', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 120*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 120*60000).toISOString(),
    source: 'EconoJabis', categories: ['테크'], category: '테크', date: new Date(now.getTime() - 120*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '네이버가 AI 기반 검색 서비스를 정식 출시했다.',
    fullBody: '네이버가 생성형 AI를 기반으로 한 차세대 검색 서비스를 정식 출시했다. 이번 서비스는 기존 링크 중심의 검색 결과 대신 AI가 사용자 질문에 직접 답변하는 방식이다.',
    bodyParagraphs: ['네이버 AI 검색 서비스 출시.'], relatedKeywords: ['네이버', 'AI', '검색']
  },
  {
    id: 'fallback_013', uuid: 'fallback_013', title: '코스닥 바이오 대장주 셀트리온, 유럽 신약 허가 획득',
    description: '코스닥 대장주 셀트리온이 주요 자가면역 치료 바이오시밀러에 대한 유럽 의약청(EMA) 허가를 획득해 주가가 8% 급등했다.',
    keywords: '셀트리온,바이오,코스닥,EMA', snippet: '셀트리온 EMA 신약 허가 획득',
    url: 'https://econojabis.com/article/fallback_013', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 130*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 130*60000).toISOString(),
    source: 'EconoJabis', categories: ['주식'], category: '주식', date: new Date(now.getTime() - 130*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '셀트리온이 유럽 의약청 허가를 획득하며 주가가 8% 급등했다.',
    fullBody: '코스닥 대장주 셀트리온이 자가면역질환 치료제 바이오시밀러에 대한 유럽 의약청(EMA) 허가를 획득했다. 이 소식에 셀트리온 주가는 장중 한때 8.3% 급등하며 52주 신고가를 기록했다.',
    bodyParagraphs: ['셀트리온 EMA 허가로 주가 급등.'], relatedKeywords: ['셀트리온', '바이오', 'EMA']
  },
  {
    id: 'fallback_014', uuid: 'fallback_014', title: '이더리움 ETF 일일 순유입 최고치…기관 수요 급증',
    description: '이더리움 현물 ETF에 일일 기준 역대 최대 규모의 자금이 유입되며 이더리움 가격이 4,500달러를 돌파했다.',
    keywords: '이더리움,ETF,암호화폐,기관', snippet: '이더리움 ETF 자금 유입 최고치',
    url: 'https://econojabis.com/article/fallback_014', image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 140*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 140*60000).toISOString(),
    source: 'EconoJabis', categories: ['암호화폐'], category: '암호화폐', date: new Date(now.getTime() - 140*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '이더리움 ETF에 역대 최대 자금이 유입됐다.',
    fullBody: '이더리움 현물 ETF에 하루 만에 역대 최대 규모인 8억 달러의 자금이 순유입됐다. 이더리움 가격은 이 소식에 힘입어 4,500달러를 돌파하며 연고점을 경신했다.',
    bodyParagraphs: ['이더리움 ETF 자금 유입 최고치.'], relatedKeywords: ['이더리움', 'ETF', '암호화폐']
  },
  {
    id: 'fallback_015', uuid: 'fallback_015', title: '한국 수출 7개월 연속 증가…반도체·자동차 쌍끌이',
    description: '한국의 수출이 반도체와 자동차 호조에 힘입어 7개월 연속 증가세를 이어갔다. 이달 수출액은 전년 동기 대비 11.2% 증가했다.',
    keywords: '수출,반도체,자동차,무역', snippet: '한국 수출 7개월 연속 증가',
    url: 'https://econojabis.com/article/fallback_015', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 150*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 150*60000).toISOString(),
    source: 'EconoJabis', categories: ['거시경제'], category: '거시경제', date: new Date(now.getTime() - 150*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '한국 수출이 7개월 연속 증가했다.',
    fullBody: '한국의 수출이 반도체와 자동차의 호조에 힘입어 7개월 연속 증가세를 이어갔다. 산업통상자원부에 따르면 이달 수출액은 전년 동기 대비 11.2% 증가한 602억 달러를 기록했다.',
    bodyParagraphs: ['한국 수출 7개월 연속 증가.'], relatedKeywords: ['수출', '반도체', '자동차']
  },
  {
    id: 'fallback_016', uuid: 'fallback_016', title: '현대차, 전기차 배터리 화재 원인 규명…리콜 본격화',
    description: '현대자동차그룹이 전기차 배터리 화재 원인을 공식 규명하고 국내외 해당 차량에 대한 자발적 리콜을 실시한다고 밝혔다.',
    keywords: '현대차,전기차,배터리,리콜', snippet: '현대차 전기차 배터리 화재 리콜',
    url: 'https://econojabis.com/article/fallback_016', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 160*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 160*60000).toISOString(),
    source: 'EconoJabis', categories: ['테크'], category: '테크', date: new Date(now.getTime() - 160*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '현대차가 전기차 배터리 화재 원인 규명 후 리콜을 실시한다.',
    fullBody: '현대자동차그룹이 전기차 배터리 화재 원인을 공식 규명하고 국내외 해당 차량에 대한 자발적 리콜을 실시한다. 대상 차량은 아이오닉 6를 포함한 3개 모델 약 8만 대다.',
    bodyParagraphs: ['현대차 전기차 리콜 본격화.'], relatedKeywords: ['현대차', '전기차', '리콜']
  },
  {
    id: 'fallback_017', uuid: 'fallback_017', title: '엔화 환율, 달러당 148엔대…일본은행 추가 금리 인상 기대',
    description: '일본은행의 추가 금리 인상 기대감이 높아지며 엔달러 환율이 달러당 148엔대로 하락(엔화 강세)했다.',
    keywords: '엔화,일본은행,금리,환율', snippet: '엔화 강세 달러당 148엔대',
    url: 'https://econojabis.com/article/fallback_017', image_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 170*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 170*60000).toISOString(),
    source: 'EconoJabis', categories: ['환율'], category: '환율', date: new Date(now.getTime() - 170*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '엔화 환율이 달러당 148엔대로 하락했다.',
    fullBody: '일본은행(BOJ)의 추가 금리 인상 기대감이 높아지며 엔달러 환율이 달러당 148엔대로 하락(엔화 강세)했다. 일본 경제 지표 개선과 임금 상승세가 이어지며 시장에서는 BOJ의 연내 2차 금리 인상 가능성을 70%로 보고 있다.',
    bodyParagraphs: ['엔화 강세 달러당 148엔대.'], relatedKeywords: ['엔화', '일본은행', '금리']
  },
  {
    id: 'fallback_018', uuid: 'fallback_018', title: 'IPO 대어 케이뱅크, 상장 첫날 공모가 대비 43% 급등',
    description: '인터넷 전문은행 케이뱅크가 코스피 상장 첫날 공모가인 9,500원 대비 43% 급등한 13,600원으로 마감했다.',
    keywords: '케이뱅크,IPO,상장,코스피', snippet: '케이뱅크 상장 첫날 43% 급등',
    url: 'https://econojabis.com/article/fallback_018', image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 180*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 180*60000).toISOString(),
    source: 'EconoJabis', categories: ['금융'], category: '금융', date: new Date(now.getTime() - 180*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '케이뱅크가 상장 첫날 공모가 대비 43% 급등했다.',
    fullBody: '인터넷 전문은행 케이뱅크가 코스피에 상장한 첫날 공모가인 9,500원 대비 43% 급등한 13,600원에 마감했다. 케이뱅크의 시가총액은 약 6조 5천억원으로, 카카오뱅크에 이어 국내 두 번째로 큰 인터넷 전문은행으로 자리매김했다.',
    bodyParagraphs: ['케이뱅크 상장 첫날 43% 급등.'], relatedKeywords: ['케이뱅크', 'IPO', '상장']
  },
  {
    id: 'fallback_019', uuid: 'fallback_019', title: '美 연준 FOMC, 3월 금리 인하 가능성 시사…시장 환호',
    description: '미국 연방준비제도 제롬 파월 의장이 다음 FOMC 회의에서 금리 인하를 검토할 수 있다고 밝혀 뉴욕 증시가 일제히 급등했다.',
    keywords: '연준,FOMC,금리인하,파월', snippet: '연준 FOMC 3월 금리 인하 가능성',
    url: 'https://econojabis.com/article/fallback_019', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 190*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 190*60000).toISOString(),
    source: 'EconoJabis', categories: ['금융'], category: '금융', date: new Date(now.getTime() - 190*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '파월 연준 의장이 3월 금리 인하 가능성을 시사했다.',
    fullBody: '제롬 파월 미국 연방준비제도(Fed) 의장이 다음 FOMC 회의에서 기준금리 인하를 검토할 수 있다고 밝혔다. 파월 의장은 상하원 합동 청문회에서 "물가 안정 목표를 향해 충분한 진전이 있었다"고 발언해 시장에 금리 인하 기대감을 높였다.',
    bodyParagraphs: ['파월 의장 금리 인하 가능성 시사.'], relatedKeywords: ['연준', 'FOMC', '금리인하']
  },
  {
    id: 'fallback_020', uuid: 'fallback_020', title: '중국 경기 부양책에 항셍지수 3% 급등…아시아 증시 동반 상승',
    description: '중국 정부가 대규모 경기 부양책을 발표하며 항셍지수가 3% 급등했고, 이에 영향을 받아 아시아 주요 증시도 일제히 상승했다.',
    keywords: '중국,항셍,경기부양,아시아증시', snippet: '중국 부양책에 항셍 3% 급등',
    url: 'https://econojabis.com/article/fallback_020', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 200*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 200*60000).toISOString(),
    source: 'EconoJabis', categories: ['주식'], category: '주식', date: new Date(now.getTime() - 200*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '중국 경기 부양책에 항셍지수 3% 급등, 아시아 증시 동반 상승.',
    fullBody: '중국 정부가 소비 진작과 부동산 시장 안정화를 위한 대규모 경기 부양책을 발표하면서 홍콩 항셍지수가 전일 대비 3.2% 급등했다. 이에 영향을 받아 한국 코스피, 일본 닛케이, 대만 가권지수 등 아시아 주요 증시도 일제히 상승세를 보였다.',
    bodyParagraphs: ['중국 부양책에 항셍 급등, 아시아 증시 상승.'], relatedKeywords: ['중국', '항셍', '경기부양']
  },
  {
    id: 'fallback_021', uuid: 'fallback_021', title: '카카오, 카카오페이 합병 추진…핀테크 사업 강화',
    description: '카카오가 카카오페이를 흡수합병하는 방안을 추진하며 국내 최대 규모의 모바일 금융 플랫폼 구축에 나선다.',
    keywords: '카카오,카카오페이,핀테크,합병', snippet: '카카오 카카오페이 합병 추진',
    url: 'https://econojabis.com/article/fallback_021', image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 210*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 210*60000).toISOString(),
    source: 'EconoJabis', categories: ['금융'], category: '금융', date: new Date(now.getTime() - 210*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '카카오가 카카오페이와 합병을 추진한다.',
    fullBody: '카카오가 자회사 카카오페이를 흡수합병하는 방안을 추진한다고 밝혔다. 합병이 완료되면 카카오의 금융 서비스가 통합되어 국내 최대 모바일 금융 플랫폼으로 자리잡게 된다.',
    bodyParagraphs: ['카카오 카카오페이 합병 추진.'], relatedKeywords: ['카카오', '카카오페이', '핀테크']
  },
  {
    id: 'fallback_022', uuid: 'fallback_022', title: '국내 소비자물가 2.1% 상승…에너지·식품 하락으로 둔화',
    description: '2월 국내 소비자물가지수(CPI)가 전년 동기 대비 2.1% 상승해 물가 상승세가 뚜렷이 둔화됐다.',
    keywords: '소비자물가,CPI,인플레이션,에너지', snippet: '소비자물가 2.1% 상승 둔화',
    url: 'https://econojabis.com/article/fallback_022', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 220*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 220*60000).toISOString(),
    source: 'EconoJabis', categories: ['거시경제'], category: '거시경제', date: new Date(now.getTime() - 220*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '소비자물가 2.1% 상승으로 인플레이션 둔화.',
    fullBody: '2월 국내 소비자물가지수(CPI)가 전년 동기 대비 2.1% 상승해 물가 상승세가 3년 만에 최저 수준으로 둔화됐다. 통계청은 에너지와 식품 가격 하락이 물가 안정에 크게 기여했다고 설명했다.',
    bodyParagraphs: ['소비자물가 2.1% 상승, 3년 만에 최저.'], relatedKeywords: ['소비자물가', 'CPI', '인플레이션']
  },
  {
    id: 'fallback_023', uuid: 'fallback_023', title: '재건축 안전진단 완화로 서울 강남 노후 아파트 단지 기지개',
    description: '정부의 재건축 안전진단 기준 완화 조치가 시행되며 서울 강남권 노후 아파트 단지들의 재건축 추진이 가속화되고 있다.',
    keywords: '재건축,안전진단,강남,부동산정책', snippet: '재건축 안전진단 완화 강남 노후 아파트',
    url: 'https://econojabis.com/article/fallback_023', image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 230*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 230*60000).toISOString(),
    source: 'EconoJabis', categories: ['부동산'], category: '부동산', date: new Date(now.getTime() - 230*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '재건축 안전진단 완화로 강남 노후 아파트 재건축 가속화.',
    fullBody: '정부의 재건축 안전진단 기준 완화 조치가 시행되며 서울 강남권 노후 아파트 단지들의 재건축 추진에 속도가 붙고 있다. 강남구 대치동, 서초구 반포동 등의 주요 재건축 추진 단지들이 잇따라 안전진단을 신청하고 있다.',
    bodyParagraphs: ['재건축 안전진단 완화로 강남 재건축 가속.'], relatedKeywords: ['재건축', '안전진단', '강남']
  },
  {
    id: 'fallback_024', uuid: 'fallback_024', title: 'LG에너지솔루션, 차세대 전고체 배터리 양산 로드맵 발표',
    description: 'LG에너지솔루션이 2028년 전고체 배터리 양산을 목표로 한 구체적인 로드맵을 발표하며 글로벌 배터리 시장 선도 의지를 밝혔다.',
    keywords: 'LG에너지솔루션,전고체배터리,배터리,전기차', snippet: 'LG에너지솔루션 전고체 배터리 로드맵',
    url: 'https://econojabis.com/article/fallback_024', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 240*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 240*60000).toISOString(),
    source: 'EconoJabis', categories: ['테크'], category: '테크', date: new Date(now.getTime() - 240*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: 'LG에너지솔루션이 2028년 전고체 배터리 양산 로드맵을 발표했다.',
    fullBody: 'LG에너지솔루션이 2028년 전고체 배터리 양산을 목표로 한 구체적인 기술 개발 및 생산 로드맵을 발표했다. 전고체 배터리는 기존 리튬이온 배터리 대비 에너지 밀도가 2배 높고 화재 위험이 없어 차세대 전기차 배터리로 주목받고 있다.',
    bodyParagraphs: ['LG에너지솔루션 2028년 전고체 배터리 양산 목표.'], relatedKeywords: ['LG에너지솔루션', '전고체배터리', '배터리']
  },
  {
    id: 'fallback_025', uuid: 'fallback_025', title: '포스코퓨처엠, 양극재 해외공장 첫 흑자 달성…배터리 소재 성장세',
    description: '포스코퓨처엠의 캐나다 현지 양극재 공장이 설립 3년 만에 처음으로 흑자 전환에 성공하며 배터리 소재 사업의 성장세를 입증했다.',
    keywords: '포스코퓨처엠,양극재,배터리소재,캐나다', snippet: '포스코퓨처엠 해외 공장 흑자',
    url: 'https://econojabis.com/article/fallback_025', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 250*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 250*60000).toISOString(),
    source: 'EconoJabis', categories: ['주식'], category: '주식', date: new Date(now.getTime() - 250*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '포스코퓨처엠 해외 양극재 공장 첫 흑자 달성.',
    fullBody: '포스코퓨처엠의 캐나다 현지 양극재 생산 법인이 설립 3년 만에 처음으로 분기 흑자 전환에 성공했다. 이는 북미 전기차 시장의 성장과 함께 현지 배터리 소재 수요가 크게 증가한 덕분이다.',
    bodyParagraphs: ['포스코퓨처엠 해외 양극재 공장 첫 흑자.'], relatedKeywords: ['포스코퓨처엠', '양극재', '배터리소재']
  },
  {
    id: 'fallback_026', uuid: 'fallback_026', title: '솔라나, NFT 거래량 급증에 가격 250달러 돌파',
    description: '솔라나 블록체인 기반 NFT 거래량이 사상 최고치를 경신하며 솔라나(SOL) 가격이 250달러를 돌파했다.',
    keywords: '솔라나,NFT,암호화폐,블록체인', snippet: '솔라나 NFT 급증에 250달러 돌파',
    url: 'https://econojabis.com/article/fallback_026', image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 260*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 260*60000).toISOString(),
    source: 'EconoJabis', categories: ['암호화폐'], category: '암호화폐', date: new Date(now.getTime() - 260*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '솔라나 NFT 거래량 최고치에 가격 250달러 돌파.',
    fullBody: '솔라나 블록체인 기반 NFT 거래량이 월간 기준 사상 최고치를 기록하며 솔라나(SOL) 가격이 250달러를 돌파했다. 솔라나 생태계에서는 하루 평균 100만 건 이상의 NFT 거래가 발생하고 있다.',
    bodyParagraphs: ['솔라나 NFT 거래량 최고치, 가격 250달러 돌파.'], relatedKeywords: ['솔라나', 'NFT', '블록체인']
  },
  {
    id: 'fallback_027', uuid: 'fallback_027', title: '정부, 2026년 추경 예산 35조원 편성…경기 부양 총력',
    description: '정부가 국내 경기 침체 우려에 대응하기 위해 35조원 규모의 추가경정예산을 편성하기로 했다.',
    keywords: '추경,예산,경기부양,재정정책', snippet: '2026년 추경 35조원 편성',
    url: 'https://econojabis.com/article/fallback_027', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 270*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 270*60000).toISOString(),
    source: 'EconoJabis', categories: ['거시경제'], category: '거시경제', date: new Date(now.getTime() - 270*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '정부 2026년 추경 35조원 편성 결정.',
    fullBody: '정부가 2026년 추가경정예산(추경)을 35조원 규모로 편성하기로 결정했다. 이번 추경은 내수 경기 침체 대응과 취약계층 지원, 인공지능·반도체 등 미래 산업 육성에 집중 투입될 예정이다.',
    bodyParagraphs: ['정부 2026년 추경 35조원 편성 결정.'], relatedKeywords: ['추경', '예산', '경기부양']
  },
  {
    id: 'fallback_028', uuid: 'fallback_028', title: '국내 은행 예금금리 일제히 인하…수신 경쟁 완화',
    description: '주요 시중은행들이 기준금리 안정화 기대감을 반영해 정기예금 금리를 일제히 0.1~0.2%포인트 인하했다.',
    keywords: '예금금리,은행,금리인하,수신', snippet: '은행 예금금리 일제히 인하',
    url: 'https://econojabis.com/article/fallback_028', image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 280*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 280*60000).toISOString(),
    source: 'EconoJabis', categories: ['금융'], category: '금융', date: new Date(now.getTime() - 280*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '주요 은행들이 예금금리를 일제히 인하했다.',
    fullBody: '국민·신한·하나·우리 등 주요 시중은행들이 정기예금 금리를 일제히 0.1~0.2%포인트 인하했다. 이번 인하로 1년 만기 정기예금 최고 금리는 연 3.5%대에서 3.3%대로 낮아졌다.',
    bodyParagraphs: ['주요 은행 예금금리 0.1~0.2%p 인하.'], relatedKeywords: ['예금금리', '은행', '금리인하']
  },
  {
    id: 'fallback_029', uuid: 'fallback_029', title: '현대·기아차, 미국 관세 회피 위해 현지 생산 확대 결정',
    description: '현대자동차그룹이 미국의 수입차 관세 부과에 대응해 미국 조지아·앨라배마 공장의 생산량을 연 40만 대 증가시키기로 했다.',
    keywords: '현대차,기아차,미국,관세,현지생산', snippet: '현대기아차 미국 현지 생산 확대',
    url: 'https://econojabis.com/article/fallback_029', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 290*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 290*60000).toISOString(),
    source: 'EconoJabis', categories: ['거시경제'], category: '거시경제', date: new Date(now.getTime() - 290*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '현대·기아차가 미국 관세에 대응해 현지 생산을 확대한다.',
    fullBody: '현대자동차그룹이 미국의 수입차 25% 관세 부과에 대응해 미국 조지아 메타플랜트와 앨라배마 공장의 생산량을 연간 40만 대 늘리기로 결정했다. 이를 위해 향후 3년간 총 50억 달러를 추가 투자할 예정이다.',
    bodyParagraphs: ['현대기아차 미국 관세 대응 현지 생산 확대.'], relatedKeywords: ['현대차', '기아차', '관세']
  },
  {
    id: 'fallback_030', uuid: 'fallback_030', title: '2026 다보스포럼, 올해의 최대 경제 리스크로 AI 거버넌스 지목',
    description: '세계경제포럼(WEF) 다보스에서 열린 2026년 연차총회에서 글로벌 경제 지도자들이 AI 거버넌스 부재를 올해 최대 경제 리스크로 꼽았다.',
    keywords: '다보스,WEF,AI거버넌스,글로벌경제', snippet: '다보스포럼 AI 거버넌스 최대 경제 리스크',
    url: 'https://econojabis.com/article/fallback_030', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    language: 'ko', published_at: new Date(now.getTime() - 300*60000).toISOString(),
    publishedAt: new Date(now.getTime() - 300*60000).toISOString(),
    source: 'EconoJabis', categories: ['거시경제'], category: '거시경제', date: new Date(now.getTime() - 300*60000).toISOString(),
    relevance_score: null, locale: 'ko', isBreaking: false, isFeatured: false,
    summary: '다보스포럼이 AI 거버넌스 부재를 올해 최대 경제 리스크로 지목했다.',
    fullBody: '세계경제포럼(WEF)이 주최하는 2026년 다보스 연차총회에서 전 세계 경제·정치 지도자들이 AI 거버넌스 부재를 올해 최대 경제 리스크로 꼽았다. WEF가 120개국 1만여 명의 전문가를 대상으로 실시한 글로벌 리스크 설문조사에서도 AI 관련 리스크가 1위를 차지했다.',
    bodyParagraphs: ['다보스포럼, AI 거버넌스를 최대 경제 리스크로 지목.'], relatedKeywords: ['다보스', 'WEF', 'AI거버넌스']
  }
];

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
// ============================================================
async function fetchGeminiNews(query: string, _apiKey: string): Promise<NewsArticle[]> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://econojabis-backend-m2hewckpba-uc.a.run.app';
  
  try {
    const res = await fetch(`${backendUrl}/api/news?query=${encodeURIComponent(query)}`);
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
    console.log(`[EconoJabis] Backend query "${query}" -> ${articles.length} articles`);
    return articles;
  } catch (err) {
    console.error('[EconoJabis] Backend fetch error:', err);
    return [];
  }
}

// ============================================================
// 메인 훅 - 폴백 기사로 즉시 로딩, API로 실시간 갱신
// ============================================================
export const useTheNewsApi = (_language = 'ko') => {
  // 폴백 기사로 초기화 → 로딩 없이 즉시 30개 표시
  const [articles, setArticles] = useState<NewsArticle[]>(FALLBACK_ARTICLES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const fetchingRef = useRef(false);
  const articleCacheRef = useRef<Map<string, NewsArticle>>(new Map());

  // 폴백 기사를 캐시에 초기 등록
  useEffect(() => {
    for (const a of FALLBACK_ARTICLES) {
      articleCacheRef.current.set(a.id, a);
    }
  }, []);

  // API 키는 환경변수에서만 로드
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
        selectedQueries.map(q => fetchGeminiNews(q, backendUrl))
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

      // 새로운 실시간 기사를 캐시에 추가 (폴백보다 앞에 표시)
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
        // 캐시도 비었으면 폴백으로 복구
        setArticles(FALLBACK_ARTICLES);
        setError('실시간 뉴스를 불러오지 못했습니다. 기본 뉴스를 표시합니다.');
      }
    } catch (e) {
      console.error('[EconoJabis] fetchNews error:', e);
      // 에러가 나도 폴백 기사는 유지
      setError('실시간 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [backendUrl]);

  useEffect(() => {
    // 마운트 후 1초 뒤에 API 호출 (UI 먼저 렌더링)
    const timer = setTimeout(fetchNews, 1000);
    // 5분마다 갱신
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
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
