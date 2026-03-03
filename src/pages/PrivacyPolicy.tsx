import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const canonicalUrl = buildPageUrl("/privacy", { lang: language === DEFAULT_LANGUAGE ? undefined : language });

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Privacy Policy"
        description="Privacy and data handling policy for EconoJabis."
        canonicalUrl={canonicalUrl}
        language={language}
        keywords={["privacy policy", "cookies", "data policy"]}
      />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-blue-600 hover:underline">← 홈으로 돌아가기</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">개인정보처리방침</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-6 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">시행일: 2025년 2월 25일</p>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. 개인정보의 처리 목적</h2>
            <p>EconoJabis(이하 &apos;회사&apos;)는 다음의 목적을 위해 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>웹사이트 이용 통계 분석</li>
              <li>서비스 개선 및 품질 향상</li>
              <li>맞춤형 광고 제공 (Google AdSense)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 처리하는 개인정보 항목</h2>
            <p>회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>자동 수집 항목: 방문 기록, 접속 IP, 쿠키, 서비스 이용 기록, 브라우저 종류, OS 정보</li>
              <li>광고 관련: Google AdSense를 통한 쿠키 및 웹 비콘 정보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 쿠키 및 광고</h2>
            <p>회사는 Google AdSense를 사용하여 광고를 게재합니다. Google은 쿠키를 사용하여 이전 방문 기록을 기반으로 광고를 게재할 수 있습니다. 사용자는 Google 광고 설정 페이지에서 맞춤 광고를 설정할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. 개인정보의 보유 및 이용 기간</h2>
            <p>회사는 법령에 따른 개인정보 보유 및 이용기간 또는 정보주체로부터 개인정보를 수집 시 동의받은 개인정보 보유 및 이용기간 내에서 개인정보를 처리 및 보유합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. 정보주체의 권리</h2>
            <p>이용자는 언제든지 개인정보 열람, 수정, 삭제, 처리정지 요청을 할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. 연락처</h2>
            <p>개인정보 관련 문의는 아래 연락처로 문의해 주시기 바랍니다.</p>
            <p className="mt-2">이메일: contact@econojabis.com</p>
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

export default PrivacyPolicy;
