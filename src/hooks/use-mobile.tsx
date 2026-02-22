import { useState, useEffect, useCallback } from 'react';
import { MARKET_API } from '@/data/newsData';

export interface MarketTicker {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

const DEFAULT_TICKERS: MarketTicker[] = [
  { symbol: 'KOSPI', name: '코스피', price: '2,712.45', change: '+34.21', changePercent: '+1.28%', isPositive: true },
  { symbol: 'KOSDAQ', name: '코스닥', price: '891.32', change: '+7.65', changePercent: '+0.87%', isPositive: true },
  { symbol: 'USD/KRW', name: '원/달러', price: '1,352.50', change: '-2.10', changePercent: '-0.15%', isPositive: false },
  { symbol: 'BTC/USD', name: 'BTC', price: '$101,234', change: '+2,456', changePercent: '+2.45%', isPositive: true },
  { symbol: 'ETH/USD', name: 'ETH', price: '$3,892', change: '+89', changePercent: '+2.34%', isPositive: true },
  { symbol: 'GOLD', name: '금', price: '$2,945', change: '+9.40', changePercent: '+0.32%', isPositive: true },
  { symbol: 'S&P500', name: 'S&P 500', price: '5,948.71', change: '+28.14', changePercent: '+0.47%', isPositive: true },
  { symbol: 'N225', name: '니케이', price: '38,947.00', change: '-124.30', changePercent: '-0.32%', isPositive: false },
];

// Parse Yahoo Finance response
const parseYahooFinance = (data: Record<string, unknown>, symbol: string, name: string): MarketTicker | null => {
  try {
    const chart = (data as { chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; chartPreviousClose?: number } }> } })?.chart?.result?.[0];
    if (!chart) return null;
    const price = chart.meta?.regularMarketPrice ?? 0;
    const prevClose = chart.meta?.chartPreviousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;
    return {
      symbol,
      name,
      price: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: (change >= 0 ? '+' : '') + change.toFixed(2),
      changePercent: (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%',
      isPositive: change >= 0,
    };
  } catch {
    return null;
  }
};

export const useMarketData = () => {
  const [tickers, setTickers] = useState<MarketTicker[]>(DEFAULT_TICKERS);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCrypto = useCallback(async () => {
    try {
      // Binance public API - no key needed
      const [btcRes, ethRes] = await Promise.allSettled([
        fetch(MARKET_API.crypto.btc),
        fetch(MARKET_API.crypto.eth),
      ]);

      const updates: Partial<Record<string, MarketTicker>> = {};

      if (btcRes.status === 'fulfilled' && btcRes.value.ok) {
        const btcData = await btcRes.value.json() as { lastPrice?: string; priceChange?: string; priceChangePercent?: string };
        const price = parseFloat(btcData.lastPrice || '0');
        const change = parseFloat(btcData.priceChange || '0');
        const pct = parseFloat(btcData.priceChangePercent || '0');
        updates['BTC/USD'] = {
          symbol: 'BTC/USD', name: 'BTC',
          price: '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 }),
          change: (change >= 0 ? '+' : '') + change.toFixed(0),
          changePercent: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%',
          isPositive: change >= 0,
        };
      }

      if (ethRes.status === 'fulfilled' && ethRes.value.ok) {
        const ethData = await ethRes.value.json() as { lastPrice?: string; priceChange?: string; priceChangePercent?: string };
        const price = parseFloat(ethData.lastPrice || '0');
        const change = parseFloat(ethData.priceChange || '0');
        const pct = parseFloat(ethData.priceChangePercent || '0');
        updates['ETH/USD'] = {
          symbol: 'ETH/USD', name: 'ETH',
          price: '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 }),
          change: (change >= 0 ? '+' : '') + change.toFixed(0),
          changePercent: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%',
          isPositive: change >= 0,
        };
      }

      if (Object.keys(updates).length > 0) {
        setTickers(prev => prev.map(t => updates[t.symbol] || t));
      }
    } catch (e) {
      console.warn('Crypto fetch failed, using defaults', e);
    }
  }, []);

  const fetchStocks = useCallback(async () => {
    try {
      // Yahoo Finance proxy via allorigins (free CORS proxy)
      const PROXY = 'https://api.allorigins.win/raw?url=';
      const stockEndpoints = [
        { url: MARKET_API.stocks.kospi, symbol: 'KOSPI', name: '코스피' },
        { url: MARKET_API.stocks.kosdaq, symbol: 'KOSDAQ', name: '코스닥' },
        { url: MARKET_API.stocks.sp500, symbol: 'S&P500', name: 'S&P 500' },
        { url: MARKET_API.stocks.nikkei, symbol: 'N225', name: '니케이' },
      ];

      const results = await Promise.allSettled(
        stockEndpoints.map(e => fetch(PROXY + encodeURIComponent(e.url)).then(r => r.json()))
      );

      const updates: Partial<Record<string, MarketTicker>> = {};
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const ticker = parseYahooFinance(result.value as Record<string, unknown>, stockEndpoints[i].symbol, stockEndpoints[i].name);
          if (ticker) updates[stockEndpoints[i].symbol] = ticker;
        }
      });

      if (Object.keys(updates).length > 0) {
        setTickers(prev => prev.map(t => updates[t.symbol] || t));
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.warn('Stock fetch failed, using defaults', e);
    }
  }, []);

  const fetchForex = useCallback(async () => {
    try {
      // ExchangeRate API - 1500 req/month free, no key for basic
      const res = await fetch(MARKET_API.forex);
      if (res.ok) {
        const data = await res.json() as { rates?: Record<string, number> };
        const krwRate = data.rates?.KRW;
        if (krwRate) {
          setTickers(prev => prev.map(t => {
            if (t.symbol === 'USD/KRW') {
              const prev_rate = 1352.50;
              const change = krwRate - prev_rate;
              return {
                ...t,
                price: krwRate.toFixed(2),
                change: (change >= 0 ? '+' : '') + change.toFixed(2),
                changePercent: (change >= 0 ? '+' : '') + ((change / prev_rate) * 100).toFixed(2) + '%',
                isPositive: change >= 0,
              };
            }
            return t;
          }));
        }
      }
    } catch (e) {
      console.warn('Forex fetch failed', e);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([fetchCrypto(), fetchStocks(), fetchForex()]);
    setIsLoading(false);
    setLastUpdated(new Date());
  }, [fetchCrypto, fetchStocks, fetchForex]);

  useEffect(() => {
    // Initial fetch
    refresh();
    // Refresh every 60 seconds
    const interval = setInterval(refresh, 60000);
    // Crypto refreshes more frequently (every 15s)
    const cryptoInterval = setInterval(fetchCrypto, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(cryptoInterval);
    };
  }, [refresh, fetchCrypto]);

  return { tickers, isLoading, lastUpdated, refresh };
};import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
