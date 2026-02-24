import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Flame, ArrowUp, RefreshCw } from "lucide-react";
import { NewsArticle } from "@/data/newsData";

interface RisingKeyword {
  rank: number;
  keyword: string;
  change: "new" | "up" | "same";
  score: number;
}

// Economy-related keyword pool with Korean display names
const KEYWORD_POOL: Record<string, { display: string; weight: number }> = {
  "코스피": { display: "코스피", weight: 1.5 },
  "코스닥": { display: "코스닥", weight: 1.3 },
  "나스닥": { display: "나스닥", weight: 1.3 },
  "비트코인": { display: "비트코인", weight: 1.4 },
  "이더리움": { display: "이더리움", weight: 1.2 },
  "환율": { display: "환율", weight: 1.3 },
  "금리": { display: "금리", weight: 1.5 },
  "반도체": { display: "반도체", weight: 1.4 },
  "삼성전자": { display: "삼성전자", weight: 1.3 },
  "SK하이닉스": { display: "SK하이닉스", weight: 1.2 },
  "부동산": { display: "부동산", weight: 1.2 },
  "아파트": { display: "아파트", weight: 1.1 },
  "금값": { display: "금값", weight: 1.1 },
  "원유": { display: "원유", weight: 1.1 },
  "AI": { display: "AI", weight: 1.5 },
  "연준": { display: "연준", weight: 1.4 },
  "한국은행": { display: "한국은행", weight: 1.3 },
  "테슬라": { display: "테슬라", weight: 1.3 },
  "엔비디아": { display: "엔비디아", weight: 1.4 },
  "카카오": { display: "카카오", weight: 1.1 },
  "네이버": { display: "네이버", weight: 1.1 },
  "인플레이션": { display: "인플레이션", weight: 1.3 },
  "경기침체": { display: "경기침체", weight: 1.2 },
  "ETF": { display: "ETF", weight: 1.2 },
  "IPO": { display: "IPO", weight: 1.1 },
  "배당주": { display: "배당주", weight: 1.0 },
  "공매도": { display: "공매도", weight: 1.0 },
  "수출": { display: "수출", weight: 1.1 },
  "S&P500": { display: "S&P500", weight: 1.2 },
  "다우": { display: "다우존스", weight: 1.1 },
};

const STORAGE_KEY = "econojabis_rising_kw";
const REFRESH_MS = 10 * 60 * 1000; // 10 minutes

function computeRisingKeywords(articles: NewsArticle[]): RisingKeyword[] {
  const freq = new Map<string, number>();
  const now = Date.now();

  articles.forEach((a) => {
    const text = (a.title + " " + (a.description || "")).toLowerCase();
    const pubTime = new Date(a.publishedAt).getTime();
    // recency boost: articles from last 2h get 2x, last 6h get 1.5x
    const ageH = (now - pubTime) / (1000 * 60 * 60);
    const recency = ageH < 2 ? 2.0 : ageH < 6 ? 1.5 : 1.0;

    Object.entries(KEYWORD_POOL).forEach(([key, meta]) => {
      if (text.includes(key.toLowerCase())) {
        const prev = freq.get(meta.display) || 0;
        freq.set(meta.display, prev + recency * meta.weight);
      }
    });
  });

  // Get previous rankings from storage
  let prevRanks: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) prevRanks = JSON.parse(raw);
  } catch {}

  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const results: RisingKeyword[] = sorted.map(([keyword, score], idx) => {
    const rank = idx + 1;
    const prevRank = prevRanks[keyword];
    let change: "new" | "up" | "same" = "same";
    if (prevRank === undefined) change = "new";
    else if (rank < prevRank) change = "up";
    return { rank, keyword, change, score };
  });

  // Save current rankings
  const currentRanks: Record<string, number> = {};
  results.forEach((r) => { currentRanks[r.keyword] = r.rank; });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRanks)); } catch {}

  return results;
}

interface Props {
  articles: NewsArticle[];
  onKeywordClick?: (keyword: string) => void;
}

const RisingKeywords = ({ articles, onKeywordClick }: Props) => {
  const [keywords, setKeywords] = useState<RisingKeyword[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateKeywords = useCallback(() => {
    if (articles.length === 0) return;
    setIsRefreshing(true);
    const rising = computeRisingKeywords(articles);
    setKeywords(rising);
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  }, [articles]);

  useEffect(() => {
    updateKeywords();
    const id = setInterval(updateKeywords, REFRESH_MS);
    return () => clearInterval(id);
  }, [updateKeywords]);

  const getChangeIcon = (change: string) => {
    if (change === "new") return <span className="text-[10px] text-red-500 font-bold">NEW</span>;
    if (change === "up") return <ArrowUp className="w-3 h-3 text-red-500" />;
    return <span className="text-[10px] text-gray-400">-</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-red-500 font-black";
    if (rank === 2) return "text-orange-500 font-bold";
    if (rank === 3) return "text-amber-500 font-bold";
    return "text-gray-500 font-semibold";
  };

  if (keywords.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-foreground">급상승 검색어</h3>
        </div>
        <p className="text-xs text-muted-foreground">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-foreground">급상승 검색어</h3>
            <TrendingUp className="w-3.5 h-3.5 text-red-400" />
          </div>
          <button
            onClick={updateKeywords}
            className="p-1 rounded hover:bg-accent transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
        {lastUpdate && (
          <p className="text-[10px] text-muted-foreground mt-1">
            {lastUpdate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준
          </p>
        )}
      </div>

      <div className="divide-y divide-border">
        {keywords.map((item) => (
          <button
            key={item.keyword}
            onClick={() => onKeywordClick?.(item.keyword)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left"
          >
            <span className={`w-5 text-center text-xs ${getRankColor(item.rank)}`}>
              {item.rank}
            </span>
            <span className="flex-1 text-sm text-foreground truncate">{item.keyword}</span>
            <span className="flex-shrink-0">{getChangeIcon(item.change)}</span>
          </button>
        ))}
      </div>

      <div className="px-4 py-2 bg-muted/30 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          뉴스 기사 분석 기반 · 10분마다 자동 갱신
        </p>
      </div>
    </div>
  );
};

export default RisingKeywords;

export default RisingKeywords;
