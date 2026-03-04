import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../hooks/useLanguage";
import { DEFAULT_LANGUAGE, buildPageUrl } from "../lib/seo";

const About = () => {
  const { language, t } = useLanguage();
  const canonicalUrl = buildPageUrl("/about", { lang: language === DEFAULT_LANGUAGE ? undefined : language });

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={t("aboutSeoTitle")}
        description={t("aboutSeoDescription")}
        canonicalUrl={canonicalUrl}
        language={language}
        keywords={["about", "economic news", "editorial policy"]}
      />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-blue-600 hover:underline">
            {t("backHome")}
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("aboutTitle")}</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">{t("aboutVisionTitle")}</h2>
            <p>{t("aboutVisionBody")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("aboutServiceTitle")}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("aboutService1")}</li>
              <li>{t("aboutService2")}</li>
              <li>{t("aboutService3")}</li>
              <li>{t("aboutService4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("aboutFeatureTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold">{t("aboutFeature1Title")}</h3>
                <p className="text-sm mt-1">{t("aboutFeature1Body")}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold">{t("aboutFeature2Title")}</h3>
                <p className="text-sm mt-1">{t("aboutFeature2Body")}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h3 className="font-semibold">{t("aboutFeature3Title")}</h3>
                <p className="text-sm mt-1">{t("aboutFeature3Body")}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("aboutContactTitle")}</h2>
            <p>
              {t("aboutContactBodyPrefix")}{" "}
              <Link to="/contact" className="text-blue-600 hover:underline">
                {t("aboutContactBodyLink")}
              </Link>{" "}
              {t("aboutContactBodySuffix")}
            </p>
          </section>
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

export default About;
