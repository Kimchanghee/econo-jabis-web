import { useState, useEffect, useCallback } from 'react';
import { NewsArticle, Language, Category, RSS_FEEDS, FALLBACK_IMAGES, fallbackArticles } from '@/data/newsData';

// Parse RSS XML to articles
const parseRSS = (xmlText: string, source: string, category: Category, language: Language): NewsArticle[] => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item'));

    return items.slice(0, 10).map((item, idx) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const description = item.querySelector('description')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '#';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
      const enclosureUrl = item.querySelector('enclosure')?.getAttribute('url') || '';
      const mediaUrl = item.querySelector('media\\:content, content')?.getAttribute('url') || '';

      // Clean HTML from description
      const cleanDesc = description.replace(/<[^>]*>/g, '').slice(0, 200);

      const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // Image: use enclosure/media or fallback to Unsplash
      const imageUrl = enclosureUrl || mediaUrl || FALLBACK_IMAGES[category];

      return {
        id: `${source}-${language}-${idx}-${Date.now()}`,
        title,
              description: cleanDesc,
        category,
        source,
        date,
      publishedAt: date,
        imageUrl,
        url: link,
        isBreaking: idx === 0,
        isFeatured: idx < 2,
        language,
      };
    }).filter(a => a.title.length > 5);
  } catch (e) {
    console.warn(`RSS parse error for ${source}:`, e);
    return [];
  }
};

// Categorize articles by keywords
const detectCategory = (title: string, summary: string): Category => {
  const text = (title + ' ' + summary).toLowerCase();

  const keywords: Record<Category, string[]> = {
    '주식': ['주식', '코스피', '코스닥', '증시', '상장', '기업', 'stock', 'equity', 'shares', 'market', 'nasdaq', 's&p', '株', '股票', 'acciones'],
    '부동산': ['부동산', '아파트', '주택', '분양', '임대', 'real estate', 'housing', 'property', '不動産', '房产', 'inmobiliario'],
    '환율': ['환율', '달러', '원화', '엔화', '유로', 'forex', 'exchange rate', 'currency', '為替', '汇率', 'divisas'],
    '암호화폐': ['비트코인', '이더리움', '암호화폐', '코인', 'bitcoin', 'ethereum', 'crypto', 'blockchain', 'btc', '仮想通貨', '加密', 'cripto'],
    '전체': [],
  };

  for (const [cat, words] of Object.entries(keywords)) {
    if (cat === '전체') continue;
    if (words.some(w => text.includes(w))) return cat as Category;
  }

  return '주식'; // default
};

export const useRssFeed = (language: Language) => {
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchFeeds = useCallback(async (lang: Language) => {
    setIsLoading(true);
    setError(null);

    const feeds = RSS_FEEDS[lang] || RSS_FEEDS.ko;
    const allArticles: NewsArticle[] = [];

    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        try {
          const res = await fetch(feed.url, { signal: AbortSignal.timeout(8000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          const parsed = parseRSS(text, feed.source, feed.category, lang);
          return parsed;
        } catch (e) {
          console.warn(`Failed to fetch ${feed.source}:`, e);
          return [];
        }
      })
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      }
    });

    if (allArticles.length > 0) {
      // Re-categorize based on content
      const categorized = allArticles.map(a => ({
        ...a,
        category: a.category !== '전체' ? a.category : detectCategory(a.title, a.summary),
      }));

      // Sort by date (newest first)
      categorized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Mark first as breaking/featured
      if (categorized[0]) categorized[0].isBreaking = true;
      if (categorized[0]) categorized[0].isFeatured = true;
      if (categorized[1]) categorized[1].isFeatured = true;

      // Assign Unsplash images to articles without images
      const withImages = categorized.map((a, idx) => ({
        ...a,
        imageUrl: a.imageUrl && a.imageUrl.startsWith('http')
          ? a.imageUrl
          : `https://source.unsplash.com/800x450/?${encodeURIComponent(a.category === '주식' ? 'stock-market,finance' : a.category)}&sig=${idx}`,
      }));

      setArticles(withImages);
      setLastFetched(new Date());
    } else {
      // Show fallback data when all feeds fail
      setArticles(fallbackArticles);
      setError('실시간 뉴스를 불러오지 못했습니다. 샘플 데이터를 표시합니다.');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFeeds(language);
    // Refresh every 5 minutes
    const interval = setInterval(() => fetchFeeds(language), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [language, fetchFeeds]);

  const refresh = useCallback(() => fetchFeeds(language), [language, fetchFeeds]);
  return { articles, isLoading, error, refresh, lastFetched };
};