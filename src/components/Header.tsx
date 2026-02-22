import { Search, TrendingUp } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground leading-none">
                EconoJabis
              </h1>
              <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                경제뉴스 포털
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="뉴스 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-full border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Ticker bar */}
      <div className="border-t border-border bg-primary/[0.03]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-6 py-1.5 text-xs font-medium overflow-x-auto">
            <TickerItem label="코스피" value="2,712.45" change="+1.23%" positive />
            <TickerItem label="코스닥" value="891.32" change="+0.87%" positive />
            <TickerItem label="원/달러" value="1,352.50" change="-0.15%" positive={false} />
            <TickerItem label="BTC" value="$101,234" change="+2.45%" positive />
            <TickerItem label="금" value="$2,945" change="+0.32%" positive />
          </div>
        </div>
      </div>
    </header>
  );
};

const TickerItem = ({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) => (
  <div className="flex items-center gap-2 whitespace-nowrap">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-foreground">{value}</span>
    <span className={positive ? 'text-realestate' : 'text-accent'}>
      {change}
    </span>
  </div>
);

export default Header;
