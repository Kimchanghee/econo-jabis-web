// ============================================================
// EconoJabis - News Data Types & RSS Feed Configuration
// All data sourced from FREE public RSS feeds & APIs
// ============================================================

export type Category = '전체' | '주식' | '부동산' | '환율' | '암호화폐';
export type Language = 'ko' | 'en' | 'es' | 'ja' | 'zh';

export interface NewsArticle {
  id: string;
  title: string;
    summary?: string;
  description?: string;
  category: Category;
  source: string;
  date: string;
  publishedAt?: string;
  imageUrl: string;
  url: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  language?: Language;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Category config with icons
export const categories: { label: Category; icon: string; color: string }[] = [
  { label: '전체', icon: 'LayoutGrid', color: 'primary' },
  { label: '주식', icon: 'TrendingUp', color: 'stocks' },
  { label: '부동산', icon: 'Building2', color: 'realestate' },
  { label: '환율', icon: 'ArrowLeftRight', color: 'exchange' },
  { label: '암호화폐', icon: 'Bitcoin', color: 'crypto' },
];

// Language config
export const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

// ============================================================
// FREE RSS FEEDS - No API key required
// ============================================================
// Korean sources: 한국경제, 매일경제, 연합뉴스, 조선비즈
// Global EN: Reuters, Bloomberg RSS, AP News, MarketWatch
// ES: El Economista, Expansion
// JP: NHK経済, 日本経済新聞
// ZH: 新浪财经, 东方财富
// ============================================================

export const RSS_FEEDS: Record<Language, { url: string; category: Category; source: string }[]> = {
  ko: [
    { url: 'https://api.allorigins.win/raw?url=https://www.hankyung.com/feed/all-news', category: '주식', source: '한국경제' },
    { url: 'https://api.allorigins.win/raw?url=https://www.mk.co.kr/rss/30000001/', category: '주식', source: '매일경제' },
    { url: 'https://api.allorigins.win/raw?url=https://www.yna.co.kr/rss/economy.xml', category: '주식', source: '연합뉴스' },
    { url: 'https://api.allorigins.win/raw?url=https://biz.chosun.com/rss/site.xml', category: '주식', source: '조선비즈' },
    { url: 'https://api.allorigins.win/raw?url=https://land.naver.com/news/newslist.nhn?rss=y', category: '부동산', source: '네이버부동산' },
    { url: 'https://api.allorigins.win/raw?url=https://coinreaders.com/rss/', category: '암호화폐', source: 'CoinReaders' },
  ],
  en: [
    { url: 'https://api.allorigins.win/raw?url=https://feeds.reuters.com/reuters/businessNews', category: '주식', source: 'Reuters' },
    { url: 'https://api.allorigins.win/raw?url=https://feeds.content.dowjones.io/public/rss/mw_topstories', category: '주식', source: 'MarketWatch' },
    { url: 'https://api.allorigins.win/raw?url=https://rss.app/feeds/yOjSFTBQo7H5Iyss.xml', category: '주식', source: 'Financial Times' },
    { url: 'https://api.allorigins.win/raw?url=https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: '주식', source: 'WSJ Markets' },
    { url: 'https://api.allorigins.win/raw?url=https://cointelegraph.com/rss', category: '암호화폐', source: 'CoinTelegraph' },
    { url: 'https://api.allorigins.win/raw?url=https://decrypt.co/feed', category: '암호화폐', source: 'Decrypt' },
  ],
  es: [
    { url: 'https://api.allorigins.win/raw?url=https://www.eleconomista.es/rss/rss-mercados-financieros.php', category: '주식', source: 'El Economista' },
    { url: 'https://api.allorigins.win/raw?url=https://e00-expansion.uecdn.es/rss/mercados.xml', category: '주식', source: 'Expansión' },
    { url: 'https://api.allorigins.win/raw?url=https://www.cronista.com/files/rss/rss_mercados.xml', category: '주식', source: 'El Cronista' },
  ],
  ja: [
    { url: 'https://api.allorigins.win/raw?url=https://www3.nhk.or.jp/rss/news/cat5.xml', category: '주식', source: 'NHK経済' },
    { url: 'https://api.allorigins.win/raw?url=https://jp.reuters.com/rssFeed/businessNews/', category: '주식', source: 'ロイター' },
    { url: 'https://api.allorigins.win/raw?url=https://coinpost.jp/?feed=rss2', category: '암호화폐', source: 'CoinPost' },
  ],
  zh: [
    { url: 'https://api.allorigins.win/raw?url=https://feed.sina.com.cn/api/roll/get?pageid=153&lid=2516&num=20&type=json', category: '주식', source: '新浪财经' },
    { url: 'https://api.allorigins.win/raw?url=https://feed.eastmoney.com/news/1344.html', category: '주식', source: '东方财富' },
  ],
};

// ============================================================
// FREE Market Data APIs (No key required)
// ============================================================
// Yahoo Finance API (unofficial, free): https://query1.finance.yahoo.com
// Binance Public API: https://api.binance.com
// ExchangeRate API: https://open.er-api.com (1500 req/month free)
// ============================================================

export const MARKET_API = {
  // Yahoo Finance - completely free, no key
  stocks: {
    kospi: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11?interval=1d&range=1d',
    kosdaq: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EKQ11?interval=1d&range=1d',
    sp500: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d',
    nasdaq: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC?interval=1d&range=1d',
    nikkei: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EN225?interval=1d&range=1d',
  },
  // ExchangeRate-API free tier
  forex: 'https://open.er-api.com/v6/latest/USD',
  // Binance public WebSocket - completely free
  crypto: {
    btc: 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT',
    eth: 'https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT',
    xrp: 'https://api.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT',
  },
  // Binance WebSocket for live ticker
  binanceWS: 'wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker',
};

// ============================================================
// Image Strategy: Unsplash Source API (completely free)
// No API key needed for source.unsplash.com
// ============================================================
export const getNewsImage = (category: Category, id: string): string => {
  const queries: Record<Category, string> = {
    '전체': 'economy,finance',
    '주식': 'stock-market,trading,finance',
    '부동산': 'real-estate,building,architecture',
    '환율': 'currency,forex,money',
    '암호화폐': 'cryptocurrency,bitcoin,blockchain',
  };
  const query = queries[category] || 'finance';
  // Unsplash Source API - completely free, no key required
  return `https://source.unsplash.com/800x450/?${query}&sig=${id}`;
};

// Fallback images by category (from Unsplash featured collections - free)
export const FALLBACK_IMAGES: Record<Category, string> = {
  '전체': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
  '주식': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
  '부동산': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
  '환율': 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop',
  '암호화폐': 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop',
};

// ============================================================
// i18n Translations
// ============================================================
export const translations: Record<Language, Record<string, string>> = {
  ko: {
    siteTitle: 'EconoJabis',
    siteTagline: '경제뉴스 포털',
    searchPlaceholder: '뉴스 검색...',
    latestNews: '최신 뉴스',
    breakingNews: '속보',
    featured: '주요',
    readMore: '더 보기',
    all: '전체',
    stocks: '주식',
    realestate: '부동산',
    forex: '환율',
    crypto: '암호화폐',
    loading: '로딩 중...',
    error: '데이터를 불러올 수 없습니다',
    adLabel: '광고',
    marketData: '실시간 시세',
    trendingTopics: '트렌딩',
    moreNews: '더 많은 뉴스',
  },
  en: {
    siteTitle: 'EconoJabis',
    siteTagline: 'Economic News Portal',
    searchPlaceholder: 'Search news...',
    latestNews: 'Latest News',
    breakingNews: 'Breaking',
    featured: 'Featured',
    readMore: 'Read More',
    all: 'All',
    stocks: 'Stocks',
    realestate: 'Real Estate',
    forex: 'Forex',
    crypto: 'Crypto',
    loading: 'Loading...',
    error: 'Failed to load data',
    adLabel: 'Advertisement',
    marketData: 'Live Markets',
    trendingTopics: 'Trending',
    moreNews: 'More News',
  },
  es: {
    siteTitle: 'EconoJabis',
    siteTagline: 'Portal de Noticias Económicas',
    searchPlaceholder: 'Buscar noticias...',
    latestNews: 'Últimas Noticias',
    breakingNews: 'Última Hora',
    featured: 'Destacado',
    readMore: 'Leer más',
    all: 'Todo',
    stocks: 'Acciones',
    realestate: 'Inmobiliario',
    forex: 'Divisas',
    crypto: 'Cripto',
    loading: 'Cargando...',
    error: 'Error al cargar',
    adLabel: 'Publicidad',
    marketData: 'Mercados en Vivo',
    trendingTopics: 'Tendencias',
    moreNews: 'Más Noticias',
  },
  ja: {
    siteTitle: 'EconoJabis',
    siteTagline: '経済ニュースポータル',
    searchPlaceholder: 'ニュースを検索...',
    latestNews: '最新ニュース',
    breakingNews: '速報',
    featured: 'おすすめ',
    readMore: '続きを読む',
    all: 'すべて',
    stocks: '株式',
    realestate: '不動産',
    forex: '為替',
    crypto: '仮想通貨',
    loading: '読み込み中...',
    error: 'データの読み込みに失敗',
    adLabel: '広告',
    marketData: 'リアルタイム相場',
    trendingTopics: 'トレンド',
    moreNews: 'もっと見る',
  },
  zh: {
    siteTitle: 'EconoJabis',
    siteTagline: '经济新闻门户',
    searchPlaceholder: '搜索新闻...',
    latestNews: '最新新闻',
    breakingNews: '突发',
    featured: '精选',
    readMore: '阅读更多',
    all: '全部',
    stocks: '股票',
    realestate: '房地产',
    forex: '外汇',
    crypto: '加密货币',
    loading: '加载中...',
    error: '加载失败',
    adLabel: '广告',
    marketData: '实时行情',
    trendingTopics: '热门',
    moreNews: '更多新闻',
  },
};

// ============================================================
// Google AdSense Configuration
// Replace with your AdSense publisher ID when approved
// Ad slots are placed strategically:
// 1. Header banner (728x90 leaderboard)
// 2. After 3rd article (300x250 medium rectangle)
// 3. Sidebar top (300x600 half page)
// 4. Sidebar middle (300x250)
// 5. After featured article (728x90)
// 6. Footer banner (728x90)
// 7. In-article native ads (every 5 articles)
// ============================================================
export const AD_CONFIG = {
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with real ID
  slots: {
    headerBanner: '1234567890',      // 728x90 leaderboard
    articleMidBanner: '0987654321',  // 300x250 after articles
    sidebarTop: '1122334455',        // 300x600 half page
    sidebarMid: '5544332211',        // 300x250 sidebar
    featuredBottom: '6677889900',    // 728x90 below featured
    footerBanner: '9988776655',      // 728x90 footer
    inArticle: '1357924680',         // Native in-article
  },
  // Until AdSense approved, use placeholder ads
  usePlaceholder: true,
};

// ============================================================
// Fallback static data (shown while APIs load)
// ============================================================
export const fallbackArticles: NewsArticle[] = [
  {
    id: 'f1',
    title: '코스피, 외국인 매수세에 2,700선 돌파…반도체주 강세',
    summary: '외국인 투자자들의 대규모 매수세에 힘입어 코스피 지수가 2,700선을 돌파했다. 삼성전자와 SK하이닉스 등 반도체 관련주가 강세를 보이며 지수 상승을 이끌었다.',
    category: '주식',
    source: '한국경제',
    date: new Date().toISOString().split('T')[0],
    imageUrl: FALLBACK_IMAGES['주식'],
    url: 'https://www.hankyung.com',
    isBreaking: true,
    isFeatured: true,
  },
  {
    id: 'f2',
    title: '서울 아파트 매매가 3주 연속 상승…강남권 중심으로',
    summary: '서울 아파트 매매가격이 3주 연속 상승세를 기록했다. 특히 강남구, 서초구 등 강남권을 중심으로 거래가 활발해지면서 가격 상승폭이 확대되고 있다.',
    category: '부동산',
    source: '매일경제',
    date: new Date().toISOString().split('T')[0],
    imageUrl: FALLBACK_IMAGES['부동산'],
    url: 'https://www.mk.co.kr',
    isFeatured: false,
  },
  {
    id: 'f3',
    title: '비트코인, 10만 달러 재돌파…기관 투자자 유입 가속',
    summary: '비트코인이 10만 달러를 다시 돌파하며 강세장을 이어가고 있다. 대형 기관 투자자들의 유입이 가속화되면서 시장 낙관론이 확산되고 있다.',
    category: '암호화폐',
    source: '블록미디어',
    date: new Date().toISOString().split('T')[0],
    imageUrl: FALLBACK_IMAGES['암호화폐'],
    url: 'https://www.blockmedia.co.kr',
  },
  {
    id: 'f4',
    title: '원/달러 환율 1,350원대 안착…연준 금리 동결 영향',
    summary: '원/달러 환율이 1,350원대에 안착했다. 미국 연방준비제도의 금리 동결 결정과 한국은행의 추가 인하 기대감이 환율에 영향을 미치고 있다.',
    category: '환율',
    source: '조선비즈',
    date: new Date().toISOString().split('T')[0],
    imageUrl: FALLBACK_IMAGES['환율'],
    url: 'https://biz.chosun.com',
  },
  {
    id: 'f5',
    title: '삼성전자, 차세대 HBM4 양산 계획 발표…AI 반도체 경쟁 가열',
    summary: '삼성전자가 차세대 고대역폭 메모리(HBM4)의 양산 계획을 공식 발표했다. AI 반도체 시장에서의 경쟁력 강화를 위한 전략으로 분석된다.',
    category: '주식',
    source: '전자신문',
    date: new Date().toISOString().split('T')[0],
    imageUrl: FALLBACK_IMAGES['주식'],
    url: 'https://www.etnews.com',
  },
];

export const newsArticles = fallbackArticles;