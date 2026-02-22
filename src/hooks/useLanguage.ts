import { useState, useEffect, createContext, useContext } from 'react';
import type { Language } from '../data/newsData';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ko: {
    siteName: 'EconoJabis',
    siteTagline: '실시간 글로벌 경제 뉴스',
    breaking: '속보',
    featured: '주요뉴스',
    latest: '최신뉴스',
    markets: '시장',
    stocks: '주식',
    crypto: '암호화폐',
    forex: '환율',
    economy: '경제',
    finance: '금융',
    realestate: '부동산',
    all: '전체',
    readMore: '더 보기',
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    refresh: '새로고침',
    lastUpdated: '마지막 업데이트',
    advertisement: '광고',
    search: '검색',
    trending: '트렌딩',
    more: '더보기',
    close: '닫기',
    share: '공유',
    save: '저장',
    home: '홈',
    news: '뉴스',
    analysis: '분석',
    opinion: '오피니언',
  },
  en: {
    siteName: 'EconoJabis',
    siteTagline: 'Real-time Global Economic News',
    breaking: 'Breaking',
    featured: 'Featured',
    latest: 'Latest',
    markets: 'Markets',
    stocks: 'Stocks',
    crypto: 'Crypto',
    forex: 'Forex',
    economy: 'Economy',
    finance: 'Finance',
    realestate: 'Real Estate',
    all: 'All',
    readMore: 'Read More',
    loading: 'Loading...',
    error: 'An error occurred',
    refresh: 'Refresh',
    lastUpdated: 'Last Updated',
    advertisement: 'Advertisement',
    search: 'Search',
    trending: 'Trending',
    more: 'More',
    close: 'Close',
    share: 'Share',
    save: 'Save',
    home: 'Home',
    news: 'News',
    analysis: 'Analysis',
    opinion: 'Opinion',
  },
  es: {
    siteName: 'EconoJabis',
    siteTagline: 'Noticias Económicas Globales en Tiempo Real',
    breaking: 'Última Hora',
    featured: 'Destacado',
    latest: 'Últimas Noticias',
    markets: 'Mercados',
    stocks: 'Acciones',
    crypto: 'Criptomonedas',
    forex: 'Divisas',
    economy: 'Economía',
    finance: 'Finanzas',
    realestate: 'Inmobiliaria',
    all: 'Todo',
    readMore: 'Leer Más',
    loading: 'Cargando...',
    error: 'Se produjo un error',
    refresh: 'Actualizar',
    lastUpdated: 'Última Actualización',
    advertisement: 'Publicidad',
    search: 'Buscar',
    trending: 'Tendencias',
    more: 'Más',
    close: 'Cerrar',
    share: 'Compartir',
    save: 'Guardar',
    home: 'Inicio',
    news: 'Noticias',
    analysis: 'Análisis',
    opinion: 'Opinión',
  },
  ja: {
    siteName: 'EconoJabis',
    siteTagline: 'リアルタイムグローバル経済ニュース',
    breaking: '速報',
    featured: '注目',
    latest: '最新ニュース',
    markets: '市場',
    stocks: '株式',
    crypto: '暗号資産',
    forex: '為替',
    economy: '経済',
    finance: '金融',
    realestate: '不動産',
    all: 'すべて',
    readMore: '続きを読む',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    refresh: '更新',
    lastUpdated: '最終更新',
    advertisement: '広告',
    search: '検索',
    trending: 'トレンド',
    more: 'もっと見る',
    close: '閉じる',
    share: 'シェア',
    save: '保存',
    home: 'ホーム',
    news: 'ニュース',
    analysis: '分析',
    opinion: 'オピニオン',
  },
  zh: {
    siteName: 'EconoJabis',
    siteTagline: '实时全球经济新闻',
    breaking: '突发',
    featured: '头条',
    latest: '最新新闻',
    markets: '市场',
    stocks: '股票',
    crypto: '加密货币',
    forex: '外汇',
    economy: '经济',
    finance: '金融',
    realestate: '房地产',
    all: '全部',
    readMore: '阅读更多',
    loading: '加载中...',
    error: '发生错误',
    refresh: '刷新',
    lastUpdated: '最后更新',
    advertisement: '广告',
    search: '搜索',
    trending: '热门',
    more: '更多',
    close: '关闭',
    share: '分享',
    save: '保存',
    home: '首页',
    news: '新闻',
    analysis: '分析',
    opinion: '观点',
  },
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'ko',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const useLanguageState = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('econojabis-language');
    return (saved as Language) || 'ko';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('econojabis-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
    const langNames: Record<Language, string> = {
      ko: '한국어',
      en: 'English',
      es: 'Español',
      ja: '日本語',
      zh: '中文',
    };
    document.title = `EconoJabis - ${langNames[language]} 경제뉴스`;
  }, [language]);

  return { language, setLanguage, t };
};