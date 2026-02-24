import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Flame, ArrowUp, RefreshCw } from "lucide-react";
import { NewsArticle } from "@/data/newsData";

interface RisingKeyword {
  rank: number;
  keyword: string;
  change: "new" | "up" | "same";
  score: number;
}

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
  "엔비디아": { display: "엔비디아", weight: 1.4 },
  "한국은행": { display: "한국은행", weight: 1.3 },
  "테슬라": { display: "테슬라", weight: 1.3 },
  "인플레이션": { display: "인플레이션", weight: 1.2 },
  "GDP": { display: "GDP", weight: 1.2 },
  "무역": { display: "무역", weight: 1.1 },
  "수출": { display: "수출", weight: 1.1 },
  "ETF": { display: "ETF", weight: 1.2 },
  "IPO": { display: "IPO", weight: 1.2 },
  "공매도": { display: "공매도", weight: 1.1 },
  "실업률": { display: "실업률", weight: 1.1 },
  "미중무역": { display: "미중무역", weight: 1.3 },
  "전기차": { display: "전기차", weight: 1.2 },
  "배당": { display: "배당", weight: 1.0 },
  "연금": { display: "연금", weight: 1.0 },
};

const STORAGE_KEY = "econojabis_prev_rankings";

function computeRisingKeywords(articles: NewsArticle[]): RisingKeyword[] {
  const scores: Record<string, number> = {};
  const now = Date.now();
  articles.forEach((article) => {
    const text = ((article.title || "") + " " + (article.description || "")).toLowerCase();
    const articleTime = new Date(article.publishedAt || Date.now()).getTime();
    const hoursAgo = (now - articleTime) / (1000 * 60 * 60);
    let recencyBoost = 1;
    if (hoursAgo < 2) recencyBoost = 2.0;
    else if (hoursAgo < 6) recencyBoost = 1.5;
    else if (hoursAgo < 12) recencyBoost = 1.2;
    Object.entries(KEYWORD_POOL).forEach(([key, { weight }]) => {
      if (text.includes(key.toLowerCase())) {
        scores[key] = (scores[key] || 0) + weight * recencyBoost;
      }
    });
  });
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  let prevRankings: Record<string, number> = {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) prevRankings = JSON.parse(stored);
  } catch {}
  const newRankings: Record<string, number> = {};
  const results: RisingKeyword[] = sorted.map(([key, score], idx) => {
    const rank = idx + 1;
    newRankings[key] = rank;
    let change: "new" | "up" | "same" = "new";
    if (prevRankings[key] !== undefined) {
      change = prevRankings[key] > rank ? "up" : "same";
    }
    return { rank, keyword: KEYWORD_POOL[key]?.display || key, change, score };
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRankings));
  } catch {}
  return results;
}

interface RisingKeywordsProps {
  articles: NewsArticle[];
  onKeywordClick?: (keyword: string) => void;
}

const RisingKeywords = ({ articles, onKeywordClick }: RisingKeywordsProps) => {
  const [keywords, setKeywords] = useState<RisingKeyword[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    const results = computeRisingKeywords(articles);
    setKeywords(results);
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  }, [articles]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-red-500 font-bold";
    if (rank === 2) return "text-orange-500 font-bold";
    if (rank === 3) return "text-yellow-600 font-bold";
    return "text-gray-500";
  };

  const getChangeIcon = (change: string) => {
    if (change === "new") {
      return <span className="text-xs bg-red-100 text-red-600 px-1 rounded font-bold">NEW</span>;
    }
    if (change === "up") {
      return <ArrowUp className="w-3 h-3 text-red-500" />;
    }
    return <span className="text-xs text-gray-400">—</span>;
  };

  if (keywords.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-gray-900">급상승 검색어</h3>
        </div>
        <button onClick={refresh} className="p-1 hover:bg-gray-100 rounded-full transition-colors" title="새로고침">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="space-y-1">
        {keywords.map((kw) => (
          <div key={kw.rank} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onKeywordClick?.(kw.keyword)}>
            <span className={`w-6 text-center text-sm ${getRankColor(kw.rank)}`}>{kw.rank}</span>
            <span className="flex-1 text-sm text-gray-800 truncate">{kw.keyword}</span>
            <div className="flex items-center w-8 justify-end">{getChangeIcon(kw.change)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-right">
          {lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준
        </p>
      </div>
    </div>
  );
};

export default RisingKeywords;
