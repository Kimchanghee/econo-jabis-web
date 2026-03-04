import { beforeEach, describe, expect, it } from "vitest";
import { getArticleFromStore, saveArticlesToStore, upsertArticleToStore } from "./articleStore";
import type { NewsArticle } from "../hooks/useTheNewsApi";

const createArticle = (id: string, publishedAt: string): NewsArticle => ({
  id,
  uuid: id,
  title: `title-${id}`,
  description: `description-${id}`,
  keywords: "keyword",
  snippet: "snippet",
  url: `https://example.com/${id}`,
  image_url: "",
  imageUrl: "",
  language: "en",
  published_at: publishedAt,
  publishedAt,
  source: "EconoJabis",
  categories: ["Economy"],
  category: "Economy",
  date: publishedAt,
  relevance_score: null,
  locale: "en",
  isBreaking: false,
  isFeatured: false,
  summary: "summary",
  fullBody: "full body",
  bodyParagraphs: ["p1", "p2", "p3"],
  relatedKeywords: ["keyword"],
});

describe("articleStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("finds stored article even when route id is encoded", () => {
    const article = createArticle("gemini_foo_bar", "2026-03-05T00:00:00.000Z");
    saveArticlesToStore([article], { mergeExisting: true });

    const found = getArticleFromStore(encodeURIComponent(article.id));
    expect(found?.id).toBe(article.id);
  });

  it("merges existing articles when saving incrementally", () => {
    const older = createArticle("gemini_old", "2026-03-05T00:00:00.000Z");
    const newer = createArticle("gemini_new", "2026-03-05T01:00:00.000Z");

    saveArticlesToStore([older], { mergeExisting: true });
    saveArticlesToStore([newer], { mergeExisting: true });

    expect(getArticleFromStore(older.id)?.id).toBe(older.id);
    expect(getArticleFromStore(newer.id)?.id).toBe(newer.id);
  });

  it("upserts article into store", () => {
    const article = createArticle("gemini_upsert", "2026-03-05T02:00:00.000Z");
    upsertArticleToStore(article);

    expect(getArticleFromStore(article.id)?.title).toBe(article.title);
  });
});
