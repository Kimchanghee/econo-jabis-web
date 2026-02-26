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
  const [stockData, setStockData] = useState<MarketItem[]>([]);

  useEffect(() => {
    // Crypto: Binance public API
    const fetchCrypto = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","XRPUSDT"]');
        if (!res.ok) return;
        const data = await res.json();
        const nameMap: Record<string, string> = { BTCUSDT: 'BTC', ETHUSDT: 'ETH', XRPUSDT: 'XRP' };
        setCryptoData(data.map((d: { symbol: string; lastPrice: string; priceChange: string; priceChangePercent: string }) => ({
          symbol: nameMap[d.symbol] || d.symbol,
          price: parseFloat(d.lastPrice),
          change: parseFloat(d.priceChange),
          changePercent: parseFloat(d.priceChangePercent),
        })));
      } catch {}
    };

    // Forex: open.er-api.com (free, no auth)
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

    // Stocks: Yahoo Finance via allorigins proxy (KOSPI, KOSDAQ)
    const fetchStocks = async () => {
      const symbols = [
        { s: '^KS11', label: 'KOSPI' },
        { s: '^KQ11', label: 'KOSDAQ' },
      ];
      const results: MarketItem[] = [];
      for (const { s, label } of symbols) {
        try {
          const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(s) + '?interval=1d&range=1d';
          const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
          const res = await fetch(proxy);
          if (!res.ok) continue;
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (meta) {
            const price = meta.regularMarketPrice || 0;
            const prev = meta.chartPreviousClose || price;
            const change = price - prev;
            const pct = prev > 0 ? (change / prev) * 100 : 0;
            results.push({ symbol: label, price, change, changePercent: pct });
          }
        } catch {}
      }
      if (results.length > 0) setStockData(results);
    };

    fetchCrypto();
    fetchForex();
    fetchStocks();

    const t = setInterval(() => { fetchCrypto(); fetchForex(); fetchStocks(); }, 60000);
    return () => clearInterval(t);
  }, []);

  const ColorVal = ({ item }: { item: MarketItem }) => (
    <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{item.symbol}</span>
      <div className="text-right">
        <div className="text-sm font-medium">
          {item.price.toLocaleString(undefined, { maximumFractionDigits: item.price < 10 ? 4 : 2 })}
        </div>
        {item.changePercent !== 0 && (
          <div className={`text-xs ${item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {stockData.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">주식 지수</h3>
          {stockData.map(item => <ColorVal key={item.symbol} item={item} />)}
        </div>
      )}
      {cryptoData.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">암호화폐</h3>
          {cryptoData.map(item => <ColorVal key={item.symbol} item={item} />)}
        </div>
      )}
      {forexData.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">환율</h3>
          {forexData.map(item => <ColorVal key={item.symbol} item={item} />)}
        </div>
      )}
    </div>
  );
};

export default MarketWidget;}}