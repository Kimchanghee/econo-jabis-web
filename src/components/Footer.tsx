import { Link } from "react-router-dom";
import AdBanner from "./AdBanner";

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      {/* Footer Ad */}
      <div className="py-3 flex justify-center border-b border-border">
        <AdBanner slotType="footer" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-foreground font-semibold mb-3">EconoJabis</h3>
            <p className="text-sm text-muted-foreground">실시간 경제뉴스, 주식, 암호화폐 정보를 한눈에 확인하세요.</p>
          </div>
          <div>
            <h3 className="text-foreground font-semibold mb-3">바로가기</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">홈</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">소개</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">문의하기</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-foreground font-semibold mb-3">법적 정보</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EconoJabis. All rights reserved.</p>
          <p className="mt-1">본 사이트의 뉴스는 자동으로 수집되며, 각 뉴스의 저작권은 해당 언론사에 있습니다.</p>
          <p className="mt-1">News: RSS | Market Data: Binance, Yahoo Finance | FX: open.er-api.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
