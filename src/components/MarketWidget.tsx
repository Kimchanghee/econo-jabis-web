import { useState, useEffect } from 'react';

interface MarketItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const MarketWidget = () => {
  const [cryptoData, setCryptoData] = useState<MarketItem[]>([]);
  const [forexData, setForexData] = useState<MarketItem[]>([]);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","XRPUSDT"]');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const nameMap: Record<string, string> = { BTCUSDT: 'BTC', ETHUSDT: 'ETH', XRPUSDT: 'XRP' };
          setCryptoData(data.map((d: any) => ({
            symbol: nameMap[d.symbol] || d.symbol,
            price: parseFloat(d.lastPrice),
            change: parseFloat(d.priceChange),
            changePercent: parseFloat(d.priceChangePercent),
          })));
        }
      } catch {}
    };

    const fetchForex = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.rates) {
          setForexData([
            { symbol: 'USD/KRW', price: data.rates.KRW || 0, change: 0, changePercent: 0 },
            { symbol: 'USD/JPY', price: data.rates.JPY || 0, change: 0, changePercent: 0 },
          ]);
        }
      } catch {}
    };

    fetchCrypto();
    fetchForex();
    const i1 = setInterval(fetchCrypto, 30000);
    const i2 = setInterval(fetchForex, 5 * 60 * 1000);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, []);

  const allItems = [...cryptoData, ...forexData].filter(i => i.price > 0);

  if (allItems.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          실시간 시세
        </h3>
        <p className="text-xs text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
        실시간 시세
      </h3>
      <div className="space-y-2">
        {allItems.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{item.symbol}</span>
            <div className="text-right">
              <span className="font-semibold text-foreground">
                {item.price.toLocaleString(undefined, { maximumFractionDigits: item.price < 10 ? 4 : 2 })}
              </span>
              {item.changePercent !== 0 && (
                <span className={`ml-1.5 ${item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketWidget;
