import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">EconoJabis</h3>
            <p className="text-sm">실시간 경제뉴스, 주식, 암호화폐 정보를 한눈에 확인하세요.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">홈</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">소개</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">문의하기</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">법적 정보</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} EconoJabis. All rights reserved.</p>
          <p className="mt-1">본 사이트의 뉴스는 자동으로 수집되며, 각 뉴스의 저작권은 해당 언론사에 있습니다.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
