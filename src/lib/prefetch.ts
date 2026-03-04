let articleDetailPromise: Promise<unknown> | null = null;

export const prefetchArticleDetailPage = () => {
  if (!articleDetailPromise) {
    articleDetailPromise = import("../pages/ArticleDetail");
  }
  return articleDetailPromise;
};
