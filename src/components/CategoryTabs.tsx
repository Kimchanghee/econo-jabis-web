import { useLanguage } from '../hooks/useLanguage';

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

const CategoryTabs = ({ selectedCategory, onCategoryChange, categories }: CategoryTabsProps) => {
  const { t } = useLanguage();

  const getCategoryLabel = (cat: string) => {
    const key = cat.toLowerCase().replace(/\s+/g, '');
    const translated = t(key);
    return translated === key ? cat : translated;
  };

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-1 pb-1">
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
          selectedCategory === 'all'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        {t('all')}
      </button>
      {categories.filter(c => c !== 'all').map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            selectedCategory === category
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          {getCategoryLabel(category)}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
