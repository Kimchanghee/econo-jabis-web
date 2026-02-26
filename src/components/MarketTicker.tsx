import React, { useState, useEffect } from 'react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'crypto' | 'forex' | 'index';
}

const MarketTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const results: TickerItem[] = [];

      // 1. Crypto top 7 via Binance
      try {
        const res = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","XRPUSDT","SOLUSDT","DOGEUSDT","ADAUSDT"]'
        );
        if (res.ok) {
          const data = await res.json() as Array<{symbol: string; lastPrice: string; priceChange: string; priceChangePercent: string}>;
          const nameMap: Record<string, string> = {
            BTCUSDT: 'BTC', ETHUSDT: 'ETH', BNBUSDT: 'BNB',
            XRPUSDT: 'XRP', SOLUSDT: 'SOL', DOGEUSDT: 'DOGE', ADAUSDT: 'ADA'
        };
          for (const d of data) {
            results.push({
              symbol: nameMap[d.symbol] || d.symbol,
              price: parseFloat(d.lastPrice),
              change: parseFloat(d.priceChange),
              changePercent: parseFloat(d.priceChangePercent),
              type: 'crypto'
            });
          }
        }
      } catch (_) {}

      // 2. Forex (환율) via open.er-api.com
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json() as { rates: Record<string, number> };
          const usdKrw = data.rates['KRW'] || 0;
          const eurKrw = (data.rates['KRW'] || 0) / (data.rates['EUR'] || 1);
          const jpyKrw = (data.rates['KRW'] || 0) / (data.rates['JPY'] || 1);
          const gbpKrw = (data.rates['KRW'] || 0) / (data.rates['GBP'] || 1);
          const cnhKrw = (data.rates['KRW'] || 0) / (data.rates['CNY'] || 1);
          if (usdKrw > 0) results.push({ symbol: 'USD/KRW', price: usdKrw, change: 0, changePercent: 0, type: 'forex' });
          if (eurKrw > 0) results.push({ symbol: 'EUR/KRW', price: eurKrw, change: 0, changePercent: 0, type: 'forex' });
          if (jpyKrw > 0) results.push({ symbol: 'JPY/KRW', price: jpyKrw * 100, change: 0, changePercent: 0, type: 'forex' });
          if (gbpKrw > 0) results.push({ symbol: 'GBP/KRW', price: gbpKrw, change: 0, changePercent: 0, type: 'forex' });
          if (cnhKrw > 0) results.push({ symbol: 'CNY/KRW', price: cnhKrw, change: 0, changePercent: 0, type: 'forex' });
        }
      } catch (_) {}

      // 3. Global indices via allorigins proxy (Yahoo Finance)
      const indicesMap: Record<string, string> = {
        '%5EIXIC': 'NASDAQ',
        '%5EGSPC': 'S&P500',
        '%5EDJI': 'DOW',
        '%5EKS11': 'KOSPI',
        '%5EKOSDAQ': 'KOSDAQ',
        '%5EN225': 'NIKKEI',
        '%5EFTSE': 'FTSE',
        '%5EGDAXI': 'DAX',
        '%5EFCHI': 'CAC40',
      };
      for (const [sym, name] of Object.entries(indicesMap)) {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`;
          const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const res = await fetch(proxy);
          if (res.ok) {
            const data = await res.json();
            const meta = data?.chart?.result?.[0]?.meta;
            if (meta) {
              const price = meta.regularMarketPrice || 0;
              const prev = meta.chartPreviousClose || meta.previousClose || price;
              const change = price - prev;
              const changePercent = prev > 0 ? (change / prev) * 100 : 0;
              results.push({ symbol: name, price, change, changePercent, type: 'index' });
            }
          }
        } catch (_) {}
      }

      if (results.length > 0) setItems(results);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60 * 1000);
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
              {item.type === 'forex'
                ? item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : item.price.toLocaleString(undefined, { maximumFractionDigits: item.price < 10 ? 4 : 2 })}
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