import { ALL_FALLBACK_ARTICLES, type NewsArticle } from "../hooks/useTheNewsApi";

export const ARTICLE_STORE_KEY = "econojabis_articles_v1";

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const normalizeArticleId = (id: string): string => {
  if (!id) return "";
  try {
    return decodeURIComponent(id).trim();
  } catch {
    return id.trim();
  }
};

const normalizeArticle = (article: NewsArticle): NewsArticle => {
  const normalizedId = normalizeArticleId(article.id);
  if (!normalizedId || normalizedId === article.id) return article;
  return {
    ...article,
    id: normalizedId,
    uuid: article.uuid || normalizedId,
  };
};

const sortByPublishedAtDesc = (articles: NewsArticle[]): NewsArticle[] => {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt || b.published_at || b.date || 0).getTime() -
      new Date(a.publishedAt || a.published_at || a.date || 0).getTime(),
  );
};

const dedupeById = (articles: NewsArticle[]): NewsArticle[] => {
  const byId = new Map<string, NewsArticle>();
  for (const raw of articles) {
    if (!raw?.id) continue;
    const article = normalizeArticle(raw);
    if (!article.id) continue;
    byId.set(article.id, article);
  }
  return sortByPublishedAtDesc(Array.from(byId.values()));
};

const readStoredArticles = (): NewsArticle[] => {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(ARTICLE_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NewsArticle[];
    if (!Array.isArray(parsed)) return [];
    return dedupeById(parsed);
  } catch {
    return [];
  }
};

export const getAllArticlesFromStore = (): NewsArticle[] => {
  const stored = readStoredArticles();
  return dedupeById([...ALL_FALLBACK_ARTICLES, ...stored]);
};

export const getArticleFromStore = (id: string): NewsArticle | null => {
  const normalizedId = normalizeArticleId(id);
  if (!normalizedId) return null;
  const all = getAllArticlesFromStore();
  return all.find((article) => normalizeArticleId(article.id) === normalizedId) || null;
};

export const saveArticlesToStore = (
  articles: NewsArticle[],
  options?: { mergeExisting?: boolean },
): void => {
  if (!hasStorage()) return;
  try {
    const base = options?.mergeExisting ? readStoredArticles() : [];
    const merged = dedupeById([...base, ...articles]);
    window.localStorage.setItem(ARTICLE_STORE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore quota/security errors and keep UI functional.
  }
};

export const upsertArticleToStore = (article: NewsArticle): void => {
  saveArticlesToStore([article], { mergeExisting: true });
};
