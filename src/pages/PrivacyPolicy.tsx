import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import AdBanner from "../components/AdBanner";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";

const PrivacyPolicy = () => {
  const { language, t } = useLanguage();
  const canonicalUrl = buildPageUrl("/privacy", { lang: language === DEFAULT_LANGUAGE ? undefined : language });

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={t("privacySeoTitle")}
        description={t("privacySeoDescription")}
        canonicalUrl={canonicalUrl}
        language={language}
        keywords={["privacy policy", "cookies", "data policy"]}
      />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-blue-600 hover:underline">
            {t("backHome")}
          </Link>
        </div>
      </header>
      <div className="w-full flex justify-center items-center bg-white border-b py-2" style={{ minHeight: 94 }}>
        <AdBanner slotType="header" uid="privacy-top" />
      </div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("privacyTitle")}</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-6 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">{t("privacyEffectiveDate")}</p>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacySec1Title")}</h2>
            <p>{t("privacySec1Body")}</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>{t("privacySec1Item1")}</li>
              <li>{t("privacySec1Item2")}</li>
              <li>{t("privacySec1Item3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacySec2Title")}</h2>
            <p>{t("privacySec2Body")}</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>{t("privacySec2Item1")}</li>
              <li>{t("privacySec2Item2")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacySec3Title")}</h2>
            <p>{t("privacySec3Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacySec4Title")}</h2>
            <p>{t("privacySec4Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacySec5Title")}</h2>
            <p>{t("privacySec5Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacySec6Title")}</h2>
            <p>{t("privacySec6Body")}</p>
          </section>
        </div>
        <div className="mt-8 flex justify-center rounded-lg bg-white shadow p-2">
          <AdBanner slotType="footer" uid="privacy-bottom" />
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

export default PrivacyPolicy;
