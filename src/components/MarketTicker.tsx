import React, { useState, useEffect } from 'react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'crypto' | 'forex';
}

const DEFAULT_ITEMS: TickerItem[] = [
  { symbol: 'BTC/USD', price: 43250, change: 1250, changePercent: 2.98, type: 'crypto' },
  { symbol: 'ETH/USD', price: 2280, change: 45, changePercent: 2.01, type: 'crypto' },
  { symbol: 'EUR/USD', price: 1.0842, change: 0.0012, changePercent: 0.11, type: 'forex' },
  { symbol: 'USD/KRW', price: 1325.5, change: -2.3, changePercent: -0.17, type: 'forex' },
  { symbol: 'USD/JPY', price: 149.82, change: 0.34, changePercent: 0.23, type: 'forex' },
];

const MarketTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const cryptoItems: TickerItem[] = data.map((d: { symbol: string; lastPrice: string; priceChange: string; priceChangePercent: string }) => ({
            symbol: d.symbol.replace('USDT', '/USD'),
            price: parseFloat(d.lastPrice),
            change: parseFloat(d.priceChange),
            changePercent: parseFloat(d.priceChangePercent),
            type: 'crypto' as const,
          }));
          setItems(prev => [...cryptoItems, ...prev.filter(p => p.type !== 'crypto')]);
        }
      } catch {
        // keep defaults
      }
    };
    fetchCrypto();
    const interval = setInterval(fetchCrypto, 30000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (change: number, pct: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
  };

  return (
    <div className="bg-gray-900 text-white py-1.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="mx-4 text-xs">
            <span className="text-gray-400 mr-1">{item.symbol}</span>
            <span className="font-medium">{item.price.toLocaleString()}</span>
            <span className={`ml-1 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fmt(item.change, item.changePercent)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;