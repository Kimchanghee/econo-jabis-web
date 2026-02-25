import React, { useState, useEffect } from 'react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'crypto' | 'forex';
}

const DEFAULT_ITEMS: TickerItem[] = [
  { symbol: 'BTC/USD', price: 0, change: 0, changePercent: 0, type: 'crypto' },
  { symbol: 'ETH/USD', price: 0, change: 0, changePercent: 0, type: 'crypto' },
  { symbol: 'USD/KRW', price: 0, change: 0, changePercent: 0, type: 'forex' },
  { symbol: 'EUR/USD', price: 0, change: 0, changePercent: 0, type: 'forex' },
  { symbol: 'JPY/KRW', price: 0, change: 0, changePercent: 0, type: 'forex' },
];

const MarketTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","XRPUSDT","SOLUSDT"]');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const nameMap: Record<string, string> = {
            BTCUSDT: 'BTC/USD', ETHUSDT: 'ETH/USD', XRPUSDT: 'XRP/USD', SOLUSDT: 'SOL/USD',
          };
          const cryptoItems: TickerItem[] = data.map((d: { symbol: string; lastPrice: string; priceChange: string; priceChangePercent: string }) => ({
            symbol: nameMap[d.symbol] || d.symbol,
            price: parseFloat(d.lastPrice),
            change: parseFloat(d.priceChange),
            changePercent: parseFloat(d.priceChangePercent),
            type: 'crypto' as const,
          }));
          setItems(prev => [...cryptoItems, ...prev.filter(p => p.type !== 'crypto')]);
        }
      } catch { /* keep defaults */ }
    };

    const fetchForex = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.rates) {
          const krw = data.rates.KRW || 0;
          const eur = data.rates.EUR || 0;
          const jpy = data.rates.JPY || 0;
          const cny = data.rates.CNY || 0;
          const forexItems: TickerItem[] = [
            { symbol: 'USD/KRW', price: krw, change: 0, changePercent: 0, type: 'forex' },
            { symbol: 'EUR/USD', price: eur ? 1 / eur : 0, change: 0, changePercent: 0, type: 'forex' },
            { symbol: 'USD/JPY', price: jpy, change: 0, changePercent: 0, type: 'forex' },
            { symbol: 'USD/CNY', price: cny, change: 0, changePercent: 0, type: 'forex' },
          ];
          setItems(prev => [...prev.filter(p => p.type !== 'forex'), ...forexItems]);
        }
      } catch { /* keep defaults */ }
    };

    fetchCrypto();
    fetchForex();
    const cryptoInterval = setInterval(fetchCrypto, 30000);
    const forexInterval = setInterval(fetchForex, 5 * 60 * 1000);
    return () => { clearInterval(cryptoInterval); clearInterval(forexInterval); };
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

export default MarketTicker;
