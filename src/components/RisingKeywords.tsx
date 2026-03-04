import { useState, useEffect, useCallback, useRef } from "react";
import { Flame, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { NewsArticle } from "../data/newsData";
import { useLanguage } from "../hooks/useLanguage";

interface RisingKeyword {
  rank: number;
  keyword: string;
  change: "new" | "up" | "down" | "same";
  score: number;
  prevRank?: number;
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
  "이란": { display: "이란", weight: 1.6 },
  "전쟁": { display: "전쟁", weight: 1.6 },
  "방산": { display: "방산", weight: 1.4 },
  "관세": { display: "관세", weight: 1.4 },
  "트럼프": { display: "트럼프", weight: 1.3 },
  "공매도": { display: "공매도", weight: 1.1 },
  "실업률": { display: "실업률", weight: 1.1 },
  "전기차": { display: "전기차", weight: 1.2 },
  "배당": { display: "배당", weight: 1.0 },
  "연금": { display: "연금", weight: 1.0 },
};

const STORAGE_KEY = "econojabis_prev_rankings";

function computeRisingKeywords(articles: NewsArticle[]): RisingKeyword[] {
  const scores: Record<string, number> = {};
  const now = Date.now();
  articles.forEach((article) => {
    const text = ((article.title || "") + " " + (article.description || "") + " " + (article.keywords || "")).toLowerCase();
    const articleTime = new Date(article.publishedAt || Date.now()).getTime();
    const hoursAgo = (now - articleTime) / (1000 * 60 * 60);
    let recencyBoost = 1;
    if (hoursAgo < 1) recencyBoost = 3.0;
    else if (hoursAgo < 2) recencyBoost = 2.0;
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
    let change: "new" | "up" | "down" | "same" = "new";
    let prevRank: number | undefined = undefined;
    if (prevRankings[key] !== undefined) {
      prevRank = prevRankings[key];
      if (prevRankings[key] > rank) change = "up";
      else if (prevRankings[key] < rank) change = "down";
      else change = "same";
    }
    return { rank, keyword: KEYWORD_POOL[key]?.display || key, change, score, prevRank };
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newRankings)); } catch {}
  return results;
}

interface RisingKeywordsProps {
  articles: NewsArticle[];
  onKeywordClick?: (keyword: string) => void;
}

const RisingKeywords = ({ articles, onKeywordClick }: RisingKeywordsProps) => {
  const { t, language } = useLanguage();
  const [keywords, setKeywords] = useState<RisingKeyword[]>([]);
  const [now, setNow] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animatingRanks, setAnimatingRanks] = useState<Set<number>>(new Set());
  const previousRanksRef = useRef<number[]>([]);

  // 1분마다 시계 업데이트
  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    const prev = previousRanksRef.current;
    const results = computeRisingKeywords(articles);
    // 순위 변동 있는 항목 애니메이션
    const changed = new Set<number>();
    results.forEach((r, i) => {
      if (!prev[i] || prev[i] !== r.rank) changed.add(r.rank);
    });
    setAnimatingRanks(changed);
    setKeywords(results);
    previousRanksRef.current = results.map((keyword) => keyword.rank);
    setTimeout(() => {
      setIsRefreshing(false);
      setAnimatingRanks(new Set());
    }, 800);
  }, [articles]);

  // 기사 변경시 & 1분마다 키워드 갱신
  useEffect(() => {
    refresh();
  }, [articles]);

  useEffect(() => {
    const interval = setInterval(refresh, 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-destructive font-bold text-base";
    if (rank === 2) return "text-orange-500 font-bold";
    if (rank === 3) return "text-yellow-600 font-bold";
    return "text-muted-foreground";
  };

  const getChangeIcon = (change: string, prevRank?: number, rank?: number) => {
    if (change === "new") {
      return <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold animate-pulse">{t("new")}</span>;
    }
    if (change === "up" && prevRank !== undefined && rank !== undefined) {
      const diff = prevRank - rank;
      return (
        <span className="flex items-center gap-0.5 text-emerald-500">
          <ArrowUp className="w-3 h-3" />
          <span className="text-xs font-bold">{diff}</span>
        </span>
      );
    }
    if (change === "down" && prevRank !== undefined && rank !== undefined) {
      const diff = rank - prevRank;
      return (
        <span className="flex items-center gap-0.5 text-blue-400">
          <ArrowDown className="w-3 h-3" />
          <span className="text-xs font-bold">{diff}</span>
        </span>
      );
    }
    return <span className="text-xs text-muted-foreground">—</span>;
  };

  if (keywords.length === 0) return null;

  const localeMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    es: "es-ES",
    ja: "ja-JP",
    zh: "zh-CN",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-BR",
    id: "id-ID",
    ar: "ar-SA",
    hi: "hi-IN",
  };
  const locale = localeMap[language] || "en-US";
  const dateStr = now.toLocaleDateString(locale, { month: "numeric", day: "numeric", weekday: "short" });
  const timeStr = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive animate-pulse" />
          <h3 className="font-bold text-foreground">{t("risingKeywords")}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* 현재 날짜 + 시간 */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-primary">{dateStr}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{timeStr}</span>
          </div>
          <button
            onClick={refresh}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            title={t("refresh")}
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="space-y-0.5">
        {keywords.map((kw) => (
          <div
            key={kw.rank}
            className={`flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted cursor-pointer transition-all duration-300 ${
              animatingRanks.has(kw.rank) ? "bg-primary/5 scale-[1.01]" : ""
            }`}
            onClick={() => onKeywordClick?.(kw.keyword)}
          >
            <span className={`w-5 text-center text-sm ${getRankColor(kw.rank)}`}>{kw.rank}</span>
            <span className="flex-1 text-sm text-foreground truncate font-medium">{kw.keyword}</span>
            <div className="flex items-center w-10 justify-end">
              {getChangeIcon(kw.change, kw.prevRank, kw.rank)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground text-right">
          {dateStr} {timeStr} {t("basedAt")} · {t("updatesEveryMinute")}
        </p>
      </div>
    </div>
  );
};

export default RisingKeywords;
