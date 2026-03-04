import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface MarketItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const ColorVal = ({ item }: { item: MarketItem }) => (
  <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
    <span className="text-xs text-muted-foreground">{item.symbol}</span>
    <div className="text-right">
      <div className="text-xs font-medium text-foreground">
        {item.price < 100
          ? item.price.toLocaleString(undefined, { maximumFractionDigits: 4 })
          : item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
      {item.change !== 0 && (
        <div className={`text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
        </div>
      )}
    </div>
  </div>
);

const MarketWidget = () => {
  const { t } = useLanguage();
  const [cryptoData, setCryptoData] = useState<MarketItem[]>([]);
  const [forexData, setForexData] = useState<MarketItem[]>([]);
  const [indexData, setIndexData] = useState<MarketItem[]>([]);

  useEffect(() => {
    // 1. Crypto top 7 via Binance
    const fetchCrypto = async () => {
      try {
        const res = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","XRPUSDT","SOLUSDT","DOGEUSDT","ADAUSDT"]'
        );
        if (!res.ok) return;
        const data = await res.json();
        const nameMap: Record<string, string> = {
          BTCUSDT: 'BTC', ETHUSDT: 'ETH', BNBUSDT: 'BNB',
          XRPUSDT: 'XRP', SOLUSDT: 'SOL', DOGEUSDT: 'DOGE', ADAUSDT: 'ADA'
        };
        setCryptoData(data.map((d: { symbol: string; lastPrice: string; priceChange: string; priceChangePercent: string }) => ({
          symbol: nameMap[d.symbol] || d.symbol,
          price: parseFloat(d.lastPrice),
          change: parseFloat(d.priceChange),
          changePercent: parseFloat(d.priceChangePercent),
      })));
      } catch (_) {}
    };

    // 2. Forex via open.er-api.com
    const fetchForex = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) return;
        const data = await res.json() as { rates: Record<string, number> };
        const krw = data.rates['KRW'] || 0;
        const eur = data.rates['EUR'] || 1;
        const jpy = data.rates['JPY'] || 1;
        const gbp = data.rates['GBP'] || 1;
        const cny = data.rates['CNY'] || 1;
        setForexData([
          { symbol: 'USD/KRW', price: krw, change: 0, changePercent: 0 },
          { symbol: 'EUR/KRW', price: krw / eur, change: 0, changePercent: 0 },
          { symbol: 'JPY/KRW', price: (krw / jpy) * 100, change: 0, changePercent: 0 },
          { symbol: 'GBP/KRW', price: krw / gbp, change: 0, changePercent: 0 },
          { symbol: 'CNY/KRW', price: krw / cny, change: 0, changePercent: 0 },
        ].filter(i => i.price > 0));
      } catch (_) {}
    };

    // 3. Global indices via allorigins + Yahoo Finance
    const fetchIndices = async () => {
      const list = [
        { sym: '%5EIXIC', name: 'NASDAQ' },
        { sym: '%5EGSPC', name: 'S&P500' },
        { sym: '%5EDJI', name: 'DOW' },
        { sym: '%5EKS11', name: 'KOSPI' },
        { sym: '%5EKOSDAQ', name: 'KOSDAQ' },
        { sym: '%5EN225', name: 'NIKKEI' },
        { sym: '%5EFTSE', name: 'FTSE' },
        { sym: '%5EGDAXI', name: 'DAX' },
      ];
      const results: MarketItem[] = [];
      for (const { sym, name } of list) {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`;
          const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const res = await fetch(proxy);
          if (!res.ok) continue;
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (!meta) continue;
          const price = meta.regularMarketPrice || 0;
          const prev = meta.chartPreviousClose || meta.previousClose || price;
          const change = price - prev;
          const changePercent = prev > 0 ? (change / prev) * 100 : 0;
          results.push({ symbol: name, price, change, changePercent });
        } catch (_) {}
      }
      if (results.length > 0) setIndexData(results);
    };

    fetchCrypto();
    fetchForex();
    fetchIndices();
    const t = setInterval(() => { fetchCrypto(); fetchForex(); fetchIndices(); }, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      {indexData.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("globalIndices")}</h3>
          {indexData.map(item => <ColorVal key={item.symbol} item={item} />)}
        </div>
      )}
      {cryptoData.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("crypto")}</h3>
          {cryptoData.map(item => <ColorVal key={item.symbol} item={item} />)}
        </div>
      )}
      {forexData.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("forex")}</h3>
          {forexData.map(item => <ColorVal key={item.symbol} item={item} />)}
        </div>
      )}
    </div>
  );
};

export default MarketWidget;
