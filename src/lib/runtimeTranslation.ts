import type { Language } from "../data/newsData";

type ArticleLike = {
  title: string;
  description?: string;
  summary?: string;
  snippet?: string;
  fullBody?: string;
  bodyParagraphs?: string[];
  keywords?: string;
  category?: string;
  categories?: string[];
  relatedKeywords?: string[];
  source?: string;
  language?: string;
  locale?: string;
};

const CACHE_KEY = "econojabis_runtime_translation_v1";
const MAX_CACHE_ENTRIES = 3000;
const MAX_CHUNK_LENGTH = 3200;

const translationCache = new Map<string, string>();
const inflightTranslations = new Map<string, Promise<string>>();

let cacheLoaded = false;
let cacheSaveTimer: ReturnType<typeof setTimeout> | null = null;

const normalizeLanguage = (lang: string): Language =>
  ((lang || "en").toLowerCase().split("-")[0] as Language);

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const loadCache = () => {
  if (cacheLoaded || !canUseStorage()) return;
  cacheLoaded = true;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string>;
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === "string") translationCache.set(key, value);
    });
  } catch {
    // Ignore invalid cache payloads.
  }
};

const persistCache = () => {
  if (!canUseStorage()) return;
  try {
    const entries = Array.from(translationCache.entries()).slice(-MAX_CACHE_ENTRIES);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Ignore storage quota issues.
  }
};

const schedulePersistCache = () => {
  if (!canUseStorage()) return;
  if (cacheSaveTimer) clearTimeout(cacheSaveTimer);
  cacheSaveTimer = setTimeout(() => {
    persistCache();
    cacheSaveTimer = null;
  }, 300);
};

const setCacheValue = (key: string, value: string) => {
  if (translationCache.has(key)) translationCache.delete(key);
  translationCache.set(key, value);
  while (translationCache.size > MAX_CACHE_ENTRIES) {
    const firstKey = translationCache.keys().next().value;
    if (!firstKey) break;
    translationCache.delete(firstKey);
  }
  schedulePersistCache();
};

const shouldSkipTranslation = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^(https?:\/\/|www\.)/i.test(trimmed)) return true;
  if (/^[A-Z0-9./+_\-%\s]{1,12}$/.test(trimmed)) return true;
  return false;
};

const parseGoogleTranslateResponse = (payload: any): string => {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return "";
  return payload[0]
    .map((part: any) => (Array.isArray(part) && part[0] ? String(part[0]) : ""))
    .join("")
    .trim();
};

const splitForTranslation = (text: string, maxLength = MAX_CHUNK_LENGTH): string[] => {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxLength, text.length);
    if (end === text.length) {
      chunks.push(text.slice(start));
      break;
    }

    let splitAt = text.lastIndexOf("\n", end);
    if (splitAt <= start) splitAt = text.lastIndexOf(". ", end);
    if (splitAt <= start) splitAt = text.lastIndexOf(" ", end);
    if (splitAt <= start) splitAt = end;

    chunks.push(text.slice(start, splitAt).trim());
    start = splitAt;
  }

  return chunks.filter(Boolean);
};

export const translateText = async (text: string, language: string): Promise<string> => {
  loadCache();

  const targetLanguage = normalizeLanguage(language);
  const sourceText = text || "";
  if (!sourceText.trim() || shouldSkipTranslation(sourceText)) return sourceText;

  const cacheKey = `${targetLanguage}::${sourceText}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  const existingRequest = inflightTranslations.get(cacheKey);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    try {
      const chunks = splitForTranslation(sourceText);
      const translatedChunks: string[] = [];

      for (const chunk of chunks) {
        const endpoint =
          "https://translate.googleapis.com/translate_a/single" +
          `?client=gtx&sl=auto&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(chunk)}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          translatedChunks.push(chunk);
          continue;
        }
        const payload = await response.json();
        const translated = parseGoogleTranslateResponse(payload);
        translatedChunks.push(translated || chunk);
      }

      const translatedText = translatedChunks.join("\n").trim() || sourceText;
      setCacheValue(cacheKey, translatedText);
      return translatedText;
    } catch {
      return sourceText;
    } finally {
      inflightTranslations.delete(cacheKey);
    }
  })();

  inflightTranslations.set(cacheKey, request);
  return request;
};

const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
};

export const translateArticlePreview = async <T extends ArticleLike>(article: T, language: string): Promise<T> => {
  const targetLanguage = normalizeLanguage(language);
  const sourceLanguage = normalizeLanguage(article.language || article.locale || "");

  if (sourceLanguage === targetLanguage) {
    return {
      ...article,
      language: targetLanguage,
      locale: targetLanguage,
    };
  }

  const [
    title,
    description,
    summary,
    snippet,
    keywords,
    source,
    category,
    categories,
    relatedKeywords,
  ] = await Promise.all([
    translateText(article.title || "", targetLanguage),
    translateText(article.description || "", targetLanguage),
    translateText(article.summary || "", targetLanguage),
    translateText(article.snippet || "", targetLanguage),
    translateText(article.keywords || "", targetLanguage),
    translateText(article.source || "", targetLanguage),
    translateText(article.category || "", targetLanguage),
    Promise.all((article.categories || []).map((item) => translateText(item, targetLanguage))),
    Promise.all((article.relatedKeywords || []).map((item) => translateText(item, targetLanguage))),
  ]);

  return {
    ...article,
    title,
    description,
    summary,
    snippet,
    keywords,
    source,
    category,
    categories,
    relatedKeywords,
    language: targetLanguage,
    locale: targetLanguage,
  };
};

export const translateArticleDetail = async <T extends ArticleLike>(article: T, language: string): Promise<T> => {
  const previewTranslated = await translateArticlePreview(article, language);

  const targetLanguage = normalizeLanguage(language);
  const [fullBody, bodyParagraphs] = await Promise.all([
    translateText(previewTranslated.fullBody || "", targetLanguage),
    Promise.all((previewTranslated.bodyParagraphs || []).map((paragraph) => translateText(paragraph, targetLanguage))),
  ]);

  return {
    ...previewTranslated,
    fullBody,
    bodyParagraphs,
  };
};

export const translateArticlesPreview = async <T extends ArticleLike>(
  articles: T[],
  language: string,
  concurrency = 4,
): Promise<T[]> => {
  return mapWithConcurrency(articles, concurrency, (article) => translateArticlePreview(article, language));
};
