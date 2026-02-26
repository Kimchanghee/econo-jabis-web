import React, { useState, useEffect } from 'react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'crypto' | 'forex';
}

const MarketTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const results: TickerItem[] = [];

      // 1. Crypto via Binance (no CORS issue, public API)
      try {
        const res = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","XRPUSDT","SOLUSDT"]'
        );
        if (res.ok) {
          const data = await res.json();
          const nameMap: Record<string, string> = {
            BTCUSDT: 'BTC/USD', ETHUSDT: 'ETH/USD', XRPUSDT: 'XRP/USD', SOLUSDT: 'SOL/USD',
          };
          if (Array.isArray(data)) {
            data.forEach((d: { symbol: string; lastPrice: string; priceChange: string; priceChangePercent: string }) => {
              results.push({
                symbol: nameMap[d.symbol] || d.symbol,
                price: parseFloat(d.lastPrice),
                change: parseFloat(d.priceChange),
                changePercent: parseFloat(d.priceChangePercent),
                type: 'crypto' as const,
              });
            });
          }
        }
      } catch {}

      // 2. Forex via open.er-api.com (free, no key needed)
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data?.rates) {
            const pairs = [
              { symbol: 'USD/KRW', rate: data.rates.KRW },
              { symbol: 'EUR/USD', rate: data.rates.EUR ? 1 / data.rates.EUR : 0 },
              { symbol: 'USD/JPY', rate: data.rates.JPY },
              { symbol: 'USD/CNY', rate: data.rates.CNY },
            ];
            pairs.forEach(p => {
              if (p.rate) {
                results.push({ symbol: p.symbol, price: p.rate, change: 0, changePercent: 0, type: 'forex' as const });
              }
            });
          }
        }
      } catch {}

      // 3. KOSPI & KOSDAQ via Yahoo Finance (proxy via allorigins to avoid CORS)
      const stockSymbols = [
        { symbol: '^KS11', display: 'KOSPI' },
        { symbol: '^KQ11', display: 'KOSDAQ' },
        { symbol: '005930.KS', display: '삼성전자' },
        { symbol: '000660.KS', display: 'SK하이닉스' },
      ];
      for (const s of stockSymbols) {
        try {
          const yahooUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(s.symbol) + '?interval=1d&range=1d';
          const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(yahooUrl);
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const data = await res.json();
            const meta = data?.chart?.result?.[0]?.meta;
            if (meta) {
              const price = meta.regularMarketPrice || 0;
              const prev = meta.chartPreviousClose || meta.previousClose || price;
              const change = price - prev;
              const pct = prev > 0 ? (change / prev) * 100 : 0;
              results.push({
                symbol: s.display,
                price,
                change,
                changePercent: pct,
                type: 'stock' as const,
              });
            }
          }
        } catch {}
      }

      if (results.length > 0) setItems(results);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const fmt = (item: TickerItem): string => {
    if (item.type === 'forex' && item.change === 0) return '';
    const sign = item.change >= 0 ? '+' : '';
    return `${sign}${item.change.toFixed(2)} (${sign}${item.changePercent.toFixed(2)}%)`;
};

  const validItems = items.filter(i => i.price > 0);
  if (validItems.length === 0) return null;

  return (
    <div className="bg-card border-b border-border py-1.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...validItems, ...validItems].map((item, idx) => (
          <span key={idx} className="mx-4 text-xs">
            <span className="text-muted-foreground mr-1">{item.symbol}</span>
            <span className="font-medium text-foreground">
              {item.price.toLocaleString(undefined, { maximumFractionDigits: item.price < 10 ? 4 : 2 })}
            </span>
            {fmt(item) && (
              <span className={`ml-1 ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {fmt(item)}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;}]