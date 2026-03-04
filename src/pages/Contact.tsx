import { Link } from "react-router-dom";
import { useState } from "react";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";

const Contact = () => {
  const { language, t } = useLanguage();
  const canonicalUrl = buildPageUrl("/contact", { lang: language === DEFAULT_LANGUAGE ? undefined : language });
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={t("contactSeoTitle")}
        description={t("contactSeoDescription")}
        canonicalUrl={canonicalUrl}
        language={language}
        keywords={["contact", "newsroom support", "editorial feedback"]}
      />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-blue-600 hover:underline">
            {t("backHome")}
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("contactTitle")}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {submitted ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">{t("contactSubmittedTitle")}</h2>
              <p className="text-gray-600">{t("contactSubmittedBody")}</p>
              <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
                {t("contactBackHome")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("contactName")}</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("contactNamePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("contactEmail")}</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t("contactEmailPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("contactMessage")}</label>
                <textarea
                  required
                  rows={5}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t("contactMessagePlaceholder")}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("contactSubmit")}
              </button>
            </form>
          )}
        </div>
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t("contactInfoTitle")}</h2>
          <div className="space-y-2 text-gray-700">
            <p>{t("contactInfoEmail")}</p>
            <p>{t("contactInfoWeb")}</p>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 EconoJabis. {t("copyrightNotice")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
