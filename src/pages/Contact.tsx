import { Link } from "react-router-dom";
import { useState } from "react";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";

const COPY = {
  ko: {
    seoTitle: "문의하기",
    seoDescription: "EconoJabis 편집팀 및 서비스 지원 문의 페이지입니다.",
    backHome: "홈으로 돌아가기",
    title: "문의하기",
    submittedTitle: "문의가 접수되었습니다",
    submittedBody: "빠른 시일 내에 답변 드리겠습니다.",
    backHomeShort: "홈으로 돌아가기",
    name: "이름",
    email: "이메일",
    message: "문의 내용",
    namePlaceholder: "이름을 입력해 주세요",
    emailPlaceholder: "이메일을 입력해 주세요",
    messagePlaceholder: "문의 내용을 입력해 주세요",
    submit: "문의 보내기",
    contactInfo: "연락처 정보",
    emailInfo: "이메일: contact@econojabis.com",
    webInfo: "웹사이트: https://econojabis.com",
    copyright: "모든 권리 보유.",
  },
  en: {
    seoTitle: "Contact EconoJabis",
    seoDescription: "Contact the EconoJabis editorial and support team.",
    backHome: "Back to Home",
    title: "Contact",
    submittedTitle: "Your Message Has Been Received",
    submittedBody: "We will get back to you as soon as possible.",
    backHomeShort: "Return Home",
    name: "Name",
    email: "Email",
    message: "Message",
    namePlaceholder: "Enter your name",
    emailPlaceholder: "Enter your email",
    messagePlaceholder: "Enter your message",
    submit: "Send Message",
    contactInfo: "Contact Information",
    emailInfo: "Email: contact@econojabis.com",
    webInfo: "Website: https://econojabis.com",
    copyright: "All rights reserved.",
  },
} as const;

const Contact = () => {
  const { language } = useLanguage();
  const canonicalUrl = buildPageUrl("/contact", { lang: language === DEFAULT_LANGUAGE ? undefined : language });
  const copy = language === "ko" ? COPY.ko : COPY.en;
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonicalUrl={canonicalUrl}
        language={language}
        keywords={["contact", "newsroom support", "editorial feedback"]}
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
        <div className="bg-white rounded-lg shadow p-6">
          {submitted ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">{copy.submittedTitle}</h2>
              <p className="text-gray-600">{copy.submittedBody}</p>
              <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
                {copy.backHomeShort}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{copy.name}</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={copy.namePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{copy.email}</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={copy.emailPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{copy.message}</label>
                <textarea
                  required
                  rows={5}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={copy.messagePlaceholder}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {copy.submit}
              </button>
            </form>
          )}
        </div>
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{copy.contactInfo}</h2>
          <div className="space-y-2 text-gray-700">
            <p>{copy.emailInfo}</p>
            <p>{copy.webInfo}</p>
          </div>
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

export default Contact;
