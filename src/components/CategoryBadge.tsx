import type { Category } from '@/data/newsData';

const badgeStyles: Record<Category, string> = {
  '전체': 'bg-primary/10 text-primary',
  '주식': 'bg-stocks/10 text-stocks',
  '부동산': 'bg-realestate/10 text-realestate',
  '환율': 'bg-exchange/10 text-exchange',
  '암호화폐': 'bg-crypto/10 text-crypto',
};

const CategoryBadge = ({ category }: { category: Category }) => (
  <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${badgeStyles[category]}`}>
    {category}
  </span>
);

export default CategoryBadge;
