import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-blue-600 hover:underline">← 홈으로 돌아가기</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">EconoJabis 소개</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">우리의 비전</h2>
            <p>EconoJabis는 한국 경제 뉴스를 빠르고 정확하게 전달하는 경제뉴스 포털입니다. 실시간으로 업데이트되는 경제, 주식, 암호화폐 뉴스를 한눈에 확인할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제공 서비스</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>실시간 경제뉴스:</strong> 국내외 주요 경제 뉴스를 실시간으로 수집하여 제공합니다.</li>
              <li><strong>주식 시장 정보:</strong> 코스피, 코스닥 및 해외 주요 지수 관련 뉴스를 제공합니다.</li>
              <li><strong>암호화폐 정보:</strong> 비트코인, 이더리움 등 주요 암호화폐 관련 최신 뉴스를 제공합니다.</li>
              <li><strong>자동화된 뉴스 필터링:</strong> AI 기반 필터링으로 경제 관련 뉴스만 선별하여 제공합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">특징</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold">실시간 업데이트</h3>
                <p className="text-sm mt-1">10분마다 자동 업데이트</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold">카테고리별 분류</h3>
                <p className="text-sm mt-1">경제, 주식, 암호화폐</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">🌐</div>
                <h3 className="font-semibold">국내외 뉴스</h3>
                <p className="text-sm mt-1">국내외 경제 뉴스 통합</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">문의</h2>
            <p>서비스 관련 문의는 <Link to="/contact" className="text-blue-600 hover:underline">문의하기</Link> 페이지를 이용해 주세요.</p>
          </section>
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 EconoJabis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
