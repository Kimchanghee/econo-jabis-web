import { useMarketData } from '../hooks/useMarketData';

const MarketTicker = () => {
  const { stocks, crypto, forex } = useMarketData();

  const formatChange = (change: number, changePercent: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const items = [
    ...stocks.map((s) => ({ symbol: s.symbol, price: s.price, change: s.change, changePercent: s.changePercent, type: 'stock' })),
    ...crypto.map((c) => ({ symbol: c.symbol, price: c.price, change: c.change, changePercent: c.changePercent, type: 'crypto' })),
    ...forex.map((f) => ({ symbol: f.symbol, price: f.price, change: f.change, changePercent: f.changePercent, type: 'forex' })),
  ];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-white py-1.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="mx-4 text-xs">
            <span className="text-gray-400 mr-1">{item.symbol}</span>
            <span className="font-medium">{item.price.toLocaleString()}</span>
            <span className={`ml-1 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(item.change, item.changePercent)}
            </span>
          </span>
        ))}
      </div>    </div>  );
};

export default MarketTicker;