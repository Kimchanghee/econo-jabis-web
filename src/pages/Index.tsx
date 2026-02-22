import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import FeaturedNews from '@/components/FeaturedNews';
import NewsList from '@/components/NewsList';
import { newsArticles, type Category } from '@/data/newsData';
import { TrendingUp } from 'lucide-react';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('전체');

  const filteredArticles = useMemo(() => {
    return newsArticles.filter((article) => {
      const matchesCategory = activeCategory === '전체' || article.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredArticles = useMemo(
    () => filteredArticles.filter((a) => a.isFeatured),
    [filteredArticles]
  );

  const regularArticles = useMemo(
    () => filteredArticles.filter((a) => !a.isFeatured),
    [filteredArticles]
  );

  const showFeatured = !searchQuery && activeCategory === '전체';

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Category Tabs */}
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        {/* Featured Section */}
        {showFeatured && featuredArticles.length > 0 && (
          <FeaturedNews articles={featuredArticles} />
        )}

        {/* News List */}
        <NewsList
          articles={showFeatured ? regularArticles : filteredArticles}
          title={activeCategory === '전체' ? '최신 뉴스' : `${activeCategory} 뉴스`}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">EconoJabis</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 EconoJabis. 한국 경제 뉴스를 한눈에.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
