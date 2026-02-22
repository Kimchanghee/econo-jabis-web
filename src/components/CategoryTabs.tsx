import { LayoutGrid, TrendingUp, Building2, ArrowLeftRight, Bitcoin } from 'lucide-react';
import type { Category } from '@/data/newsData';

const iconMap = {
  '전체': LayoutGrid,
  '주식': TrendingUp,
  '부동산': Building2,
  '환율': ArrowLeftRight,
  '암호화폐': Bitcoin,
};

const colorMap: Record<Category, string> = {
  '전체': 'bg-primary text-primary-foreground',
  '주식': 'bg-stocks text-primary-foreground',
  '부동산': 'bg-realestate text-primary-foreground',
  '환율': 'bg-exchange text-primary-foreground',
  '암호화폐': 'bg-crypto text-primary-foreground',
};

const inactiveMap: Record<Category, string> = {
  '전체': 'text-foreground hover:bg-secondary',
  '주식': 'text-stocks hover:bg-stocks/10',
  '부동산': 'text-realestate hover:bg-realestate/10',
  '환율': 'text-exchange hover:bg-exchange/10',
  '암호화폐': 'text-crypto hover:bg-crypto/10',
};

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const cats: Category[] = ['전체', '주식', '부동산', '환율', '암호화폐'];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {cats.map((cat) => {
        const Icon = iconMap[cat];
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              isActive ? colorMap[cat] : inactiveMap[cat]
            }`}
          >
            <Icon className="h-4 w-4" />
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
