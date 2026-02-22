export type Category = '전체' | '주식' | '부동산' | '환율' | '암호화폐';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: Category;
  source: string;
  date: string;
  imageUrl: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
}

export const categories: { label: Category; icon: string; color: string }[] = [
  { label: '전체', icon: 'LayoutGrid', color: 'primary' },
  { label: '주식', icon: 'TrendingUp', color: 'stocks' },
  { label: '부동산', icon: 'Building2', color: 'realestate' },
  { label: '환율', icon: 'ArrowLeftRight', color: 'exchange' },
  { label: '암호화폐', icon: 'Bitcoin', color: 'crypto' },
];

export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: '코스피, 외국인 매수세에 2,700선 돌파…반도체주 강세',
    summary: '외국인 투자자들의 대규모 매수세에 힘입어 코스피 지수가 2,700선을 돌파했다. 삼성전자와 SK하이닉스 등 반도체 관련주가 강세를 보이며 지수 상승을 이끌었다.',
    category: '주식',
    source: '한국경제',
    date: '2026-02-22',
    imageUrl: '',
    isBreaking: true,
    isFeatured: true,
  },
  {
    id: '2',
    title: '서울 아파트 매매가 3주 연속 상승…강남권 중심으로',
    summary: '서울 아파트 매매가격이 3주 연속 상승세를 기록했다. 특히 강남구, 서초구 등 강남권을 중심으로 거래가 활발해지면서 가격 상승폭이 확대되고 있다.',
    category: '부동산',
    source: '매일경제',
    date: '2026-02-22',
    imageUrl: '',
    isFeatured: true,
  },
  {
    id: '3',
    title: '원/달러 환율 1,350원대 안착…연준 금리 동결 영향',
    summary: '원/달러 환율이 1,350원대에 안착했다. 미국 연방준비제도의 금리 동결 결정과 한국은행의 추가 인하 기대감이 환율에 영향을 미치고 있다.',
    category: '환율',
    source: '조선비즈',
    date: '2026-02-21',
    imageUrl: '',
  },
  {
    id: '4',
    title: '비트코인, 10만 달러 재돌파…기관 투자자 유입 가속',
    summary: '비트코인이 10만 달러를 다시 돌파하며 강세장을 이어가고 있다. 대형 기관 투자자들의 유입이 가속화되면서 시장 낙관론이 확산되고 있다.',
    category: '암호화폐',
    source: '블록미디어',
    date: '2026-02-21',
    imageUrl: '',
    isFeatured: true,
  },
  {
    id: '5',
    title: '삼성전자, 차세대 HBM4 양산 계획 발표…AI 반도체 경쟁 가열',
    summary: '삼성전자가 차세대 고대역폭 메모리(HBM4)의 양산 계획을 공식 발표했다. AI 반도체 시장에서의 경쟁력 강화를 위한 전략으로 분석된다.',
    category: '주식',
    source: '전자신문',
    date: '2026-02-21',
    imageUrl: '',
  },
  {
    id: '6',
    title: '수도권 신규 분양 물량 급증…3월 대규모 분양 예정',
    summary: '3월 수도권 신규 분양 물량이 대폭 증가할 전망이다. 서울, 경기, 인천 등 수도권 주요 지역에서 대규모 분양이 예정되어 있어 실수요자들의 관심이 높다.',
    category: '부동산',
    source: '머니투데이',
    date: '2026-02-20',
    imageUrl: '',
  },
  {
    id: '7',
    title: '엔화 약세 지속…일본 여행 수요 증가에 환전 급증',
    summary: '엔화 약세가 지속되면서 일본 여행을 계획하는 한국인들의 엔화 환전 수요가 급증하고 있다. 100엔당 850원대를 기록하며 환전 적기라는 분석이 나온다.',
    category: '환율',
    source: '서울경제',
    date: '2026-02-20',
    imageUrl: '',
  },
  {
    id: '8',
    title: '이더리움 업그레이드 앞두고 가격 급등…4,000달러 돌파',
    summary: '이더리움이 대규모 네트워크 업그레이드를 앞두고 가격이 급등, 4,000달러를 돌파했다. 스테이킹 보상 증가와 수수료 감소 기대감이 반영된 것으로 분석된다.',
    category: '암호화폐',
    source: '코인데스크코리아',
    date: '2026-02-20',
    imageUrl: '',
  },
  {
    id: '9',
    title: '2차전지 관련주 일제히 반등…LG에너지솔루션 5% 상승',
    summary: '2차전지 관련 종목들이 일제히 반등했다. LG에너지솔루션이 5% 이상 상승하며 시장을 이끌었고, 삼성SDI와 SK이노베이션도 강세를 보였다.',
    category: '주식',
    source: '한국투자증권',
    date: '2026-02-19',
    imageUrl: '',
  },
  {
    id: '10',
    title: '전세사기 방지법 시행 한달…시장 변화와 과제',
    summary: '전세사기 방지법이 시행된 지 한 달이 경과했다. 전세 보증금 보호 강화로 임차인 보호가 강화되었으나, 일부 집주인들의 반발과 시장 위축 우려도 제기되고 있다.',
    category: '부동산',
    source: '경향신문',
    date: '2026-02-19',
    imageUrl: '',
  },
];
