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

      // 1. Crypto via Binance
      try {
        const res = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","XRPUSDT","SOLUSDT"]'
        );
        if (res.ok) {
          const data = await res.json() as Array<{symbol: string; lastPrice: string; priceChange: string; priceChangePercent: string}>;
          const nameMap: Record<string, string> = {
            BTCUSDT: 'BTC/USD', ETHUSDT: 'ETH/USD', XRPUSDT: 'XRP/USD', SOLUSDT: 'SOL/USD',
          };
          if (Array.isArray(data)) {
            data.forEach((d) => {
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
      } catch (_e) {
        // ignore
      }

      // 2. Forex via open.er-api.com
      try {
        const res2 = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res2.ok) {
          const data2 = await res2.json() as {rates: Record<string, number>};
          const pairs: Array<{sym: string; base: string; quote: string}> = [
            { sym: 'USD/KRW', base: 'USD', quote: 'KRW' },
            { sym: 'USD/JPY', base: 'USD', quote: 'JPY' },
            { sym: 'EUR/USD', base: 'EUR', quote: 'USD' },
          ];
          if (data2.rates) {
            pairs.forEach((p) => {
              const rate = p.base === 'USD' ? (data2.rates[p.quote] || 0) : (1 / (data2.rates[p.base] || 1));
              results.push({
                symbol: p.sym,
                price: rate,
                change: 0,
                changePercent: 0,
                type: 'forex' as const,
              });
            });
          }
        }
      } catch (_e) {
        // ignore
      }

      // 3. Korean stocks via allorigins proxy (Yahoo Finance)
      const stockSymbols = [
        { sym: 'KOSPI', yahoo: '%5EKS11' },
        { sym: 'KOSDAQ', yahoo: '%5EKOSDAQ' },
        { sym: '삼성전자', yahoo: '005930.KS' },
      ];

      for (const s of stockSymbols) {
        try {
          const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
            `https://query1.finance.yahoo.com/v8/finance/chart/${s.yahoo}?interval=1d&range=1d`
          )}`;
          const res3 = await fetch(url);
          if (res3.ok) {
            const wrapper = await res3.json() as {contents: string};
            const json = JSON.parse(wrapper.contents) as {chart?: {result?: Array<{meta?: {regularMarketPrice?: number; chartPreviousClose?: number}}>}};
            const meta = json?.chart?.result?.[0]?.meta;
            if (meta && meta.regularMarketPrice) {
              const price = meta.regularMarketPrice;
              const prev = meta.chartPreviousClose || price;
              const change = price - prev;
              const changePct = prev ? (change / prev) * 100 : 0;
              results.push({
                symbol: s.sym,
                price,
                change,
                changePercent: changePct,
                type: 'stock' as const,
              });
            }
          }
        } catch (_e) {
          // ignore
        }
      }

      if (results.length > 0) {
        setItems(results);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (item: TickerItem): string => {
    if (item.type === 'forex' && item.change === 0) return '';
    const sign = item.change >= 0 ? '+' : '';
    return `${sign}${item.change.toFixed(2)} (${sign}${item.changePercent.toFixed(2)}%)`;
  };

  const validItems = items.filter((i) => i.price > 0);
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

export default MarketTicker;