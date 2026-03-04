import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";

const COPY = {
  ko: {
    seoTitle: "EconoJabis 소개",
    seoDescription: "EconoJabis의 편집 원칙과 글로벌 경제 뉴스 제공 방식을 안내합니다.",
    backHome: "홈으로 돌아가기",
    title: "EconoJabis 소개",
    visionTitle: "비전",
    visionBody:
      "EconoJabis는 글로벌 경제 이슈를 빠르고 정확하게 전달합니다. 시장에 영향을 주는 핵심 뉴스만 선별해 제공합니다.",
    serviceTitle: "제공 서비스",
    service1: "실시간 경제 뉴스 업데이트",
    service2: "주식·환율·암호화폐 등 시장 카테고리 분류",
    service3: "핵심 이슈 중심의 기사 큐레이션",
    service4: "언어 선택에 따른 UI/뉴스 표시",
    featureTitle: "특징",
    feature1Title: "빠른 반영",
    feature1Body: "최신 시장 이슈를 우선 노출",
    feature2Title: "주제별 정리",
    feature2Body: "카테고리 탭으로 즉시 탐색",
    feature3Title: "글로벌 커버리지",
    feature3Body: "주요국 경제·금융 뉴스 통합",
    contactTitle: "문의",
    contactBodyPrefix: "서비스 문의는 ",
    contactBodyLink: "문의하기",
    contactBodySuffix: " 페이지를 이용해 주세요.",
    copyright: "All rights reserved.",
  },
  en: {
    seoTitle: "About EconoJabis",
    seoDescription: "Learn the editorial principles and global economy coverage of EconoJabis.",
    backHome: "Back to Home",
    title: "About EconoJabis",
    visionTitle: "Vision",
    visionBody:
      "EconoJabis delivers global economic stories quickly and accurately, focusing on market-moving signals.",
    serviceTitle: "What We Provide",
    service1: "Real-time economic news updates",
    service2: "Categorized coverage for stocks, FX, and crypto",
    service3: "Curated stories centered on key market themes",
    service4: "Language-aware UI and news rendering",
    featureTitle: "Highlights",
    feature1Title: "Fast Updates",
    feature1Body: "Priority display for critical market events",
    feature2Title: "Topic Navigation",
    feature2Body: "Immediate discovery through category tabs",
    feature3Title: "Global Coverage",
    feature3Body: "Integrated macro and finance stories from major regions",
    contactTitle: "Contact",
    contactBodyPrefix: "For service inquiries, visit the ",
    contactBodyLink: "Contact",
    contactBodySuffix: " page.",
    copyright: "All rights reserved.",
  },
} as const;

const About = () => {
  const { language } = useLanguage();
  const canonicalUrl = buildPageUrl("/about", { lang: language === DEFAULT_LANGUAGE ? undefined : language });
  const copy = language === "ko" ? COPY.ko : COPY.en;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonicalUrl={canonicalUrl}
        language={language}
        keywords={["about", "economic news", "editorial policy"]}
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
          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.visionTitle}</h2>
            <p>{copy.visionBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.serviceTitle}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{copy.service1}</li>
              <li>{copy.service2}</li>
              <li>{copy.service3}</li>
              <li>{copy.service4}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.featureTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold">{copy.feature1Title}</h3>
                <p className="text-sm mt-1">{copy.feature1Body}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold">{copy.feature2Title}</h3>
                <p className="text-sm mt-1">{copy.feature2Body}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold">{copy.feature3Title}</h3>
                <p className="text-sm mt-1">{copy.feature3Body}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.contactTitle}</h2>
            <p>
              {copy.contactBodyPrefix}
              <Link to="/contact" className="text-blue-600 hover:underline">
                {copy.contactBodyLink}
              </Link>
              {copy.contactBodySuffix}
            </p>
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

export default About;
