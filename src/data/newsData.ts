// ============================================================
// EconoJabis - News Data Types & Configuration
// 실제 데이터는 Gemini API (useTheNewsApi.ts) 에서 가져옵니다
// ============================================================

// NewsArticle 타입은 useTheNewsApi 에서 가져옴 (단일 소스)
export type { NewsArticle } from '../hooks/useTheNewsApi';

export type Category = "전체" | "주식" | "부동산" | "환율" | "암호화폐";
export type Language = "ko" | "en" | "es" | "ja" | "zh" | "fr" | "de" | "pt" | "id" | "ar" | "hi";

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Category config with icons
export const categories: { label: Category; icon: string; color: string }[] = [
  { label: "전체", icon: "LayoutGrid", color: "primary" },
  { label: "주식", icon: "TrendingUp", color: "stocks" },
  { label: "부동산", icon: "Building2", color: "realestate" },
  { label: "환율", icon: "ArrowLeftRight", color: "exchange" },
  { label: "암호화폐", icon: "Bitcoin", color: "crypto" },
];

// Language config
export const languages: { code: Language; label: string; flag: string }[] = [
  { code: "ko", label: "한국어", flag: "kr" },
  { code: "en", label: "English", flag: "us" },
  { code: "es", label: "Español", flag: "es" },
  { code: "ja", label: "日本語", flag: "jp" },
  { code: "zh", label: "中文", flag: "cn" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "pt", label: "Português", flag: "br" },
  { code: "id", label: "Bahasa Indonesia", flag: "id" },
  { code: "ar", label: "العربية", flag: "sa" },
  { code: "hi", label: "हिन्दी", flag: "in" },
];

// 기사 이미지 fallback 헬퍼
export const getNewsImage = (article: { imageUrl?: string; image_url?: string; category?: string }): string => {
  if (article.imageUrl && article.imageUrl.startsWith('http')) return article.imageUrl;
  if (article.image_url && article.image_url.startsWith('http')) return article.image_url;
  const placeholders: Record<string, string> = {
    '주식': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    '부동산': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    '환율': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    '암호화폐': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop',
  };
  return placeholders[article.category || ''] || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop';
};

// 더미 데이터 없음 - 실시간 Gemini API 사용
export const fallbackArticles: never[] = [];
export const newsArticles: never[] = [];
