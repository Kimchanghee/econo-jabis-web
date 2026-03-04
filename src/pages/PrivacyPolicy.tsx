import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";

const COPY = {
  ko: {
    seoTitle: "개인정보처리방침",
    seoDescription: "EconoJabis 개인정보 및 쿠키 처리 정책 안내",
    backHome: "홈으로 돌아가기",
    title: "개인정보처리방침",
    effectiveDate: "시행일: 2025년 2월 25일",
    sec1Title: "1. 수집 목적",
    sec1Body:
      "서비스 품질 개선, 트래픽 분석, 광고 운영을 위해 최소한의 정보를 처리합니다. 목적이 변경될 경우 필요한 고지를 진행합니다.",
    sec1Item1: "웹사이트 이용 통계 분석",
    sec1Item2: "서비스 개선 및 성능 최적화",
    sec1Item3: "광고 제공 및 노출 품질 관리",
    sec2Title: "2. 처리 항목",
    sec2Body: "다음 정보가 자동 수집될 수 있습니다.",
    sec2Item1: "접속 로그, IP, 쿠키, 브라우저/OS 정보",
    sec2Item2: "광고 플랫폼을 통한 쿠키 및 식별 정보",
    sec3Title: "3. 쿠키 및 광고",
    sec3Body:
      "본 사이트는 광고 제공을 위해 쿠키를 사용할 수 있습니다. 사용자는 브라우저 또는 광고 설정에서 쿠키 동작을 관리할 수 있습니다.",
    sec4Title: "4. 보유 기간",
    sec4Body: "관련 법령 또는 서비스 운영 목적 범위 내에서 필요한 기간 동안만 정보를 보관합니다.",
    sec5Title: "5. 이용자 권리",
    sec5Body: "이용자는 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.",
    sec6Title: "6. 문의",
    sec6Body: "개인정보 관련 문의: contact@econojabis.com",
    copyright: "All rights reserved.",
  },
  en: {
    seoTitle: "Privacy Policy",
    seoDescription: "Privacy and cookie policy for EconoJabis.",
    backHome: "Back to Home",
    title: "Privacy Policy",
    effectiveDate: "Effective date: February 25, 2025",
    sec1Title: "1. Purpose of Processing",
    sec1Body:
      "We process minimum necessary information for service quality improvement, traffic analytics, and advertising operations. If purposes change, we provide required notice.",
    sec1Item1: "Website usage analytics",
    sec1Item2: "Service improvement and performance optimization",
    sec1Item3: "Ad delivery and quality control",
    sec2Title: "2. Data We Process",
    sec2Body: "The following information may be collected automatically.",
    sec2Item1: "Access logs, IP, cookies, browser and OS information",
    sec2Item2: "Cookie and identifier data through ad platforms",
    sec3Title: "3. Cookies and Ads",
    sec3Body:
      "This site may use cookies for ad delivery. Users can manage cookie behavior via browser settings or ad settings.",
    sec4Title: "4. Retention Period",
    sec4Body: "We keep data only for the period necessary under applicable law or operational purpose.",
    sec5Title: "5. User Rights",
    sec5Body: "Users may request access, correction, deletion, or suspension of processing.",
    sec6Title: "6. Contact",
    sec6Body: "Privacy inquiries: contact@econojabis.com",
    copyright: "All rights reserved.",
  },
} as const;

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const canonicalUrl = buildPageUrl("/privacy", { lang: language === DEFAULT_LANGUAGE ? undefined : language });
  const copy = language === "ko" ? COPY.ko : COPY.en;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonicalUrl={canonicalUrl}
        language={language}
        keywords={["privacy policy", "cookies", "data policy"]}
      />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-blue-600 hover:underline">
            {copy.backHome}
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{copy.title}</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-6 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">{copy.effectiveDate}</p>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sec1Title}</h2>
            <p>{copy.sec1Body}</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>{copy.sec1Item1}</li>
              <li>{copy.sec1Item2}</li>
              <li>{copy.sec1Item3}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sec2Title}</h2>
            <p>{copy.sec2Body}</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>{copy.sec2Item1}</li>
              <li>{copy.sec2Item2}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sec3Title}</h2>
            <p>{copy.sec3Body}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sec4Title}</h2>
            <p>{copy.sec4Body}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sec5Title}</h2>
            <p>{copy.sec5Body}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sec6Title}</h2>
            <p>{copy.sec6Body}</p>
          </section>
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 EconoJabis. {copy.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
