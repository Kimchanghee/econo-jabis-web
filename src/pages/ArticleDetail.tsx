import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Share2, Link, MessageCircle, Twitter } from "lucide-react";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { NewsArticle } from "../data/newsData";
import SEOHead from "../components/SEOHead";

const ARTICLE_STORE_KEY = "econojabis_articles_v1";
const ADSENSE_PUB = "ca-pub-5884595045902078";

export const saveArticlesToStore = (articles: NewsArticle[]) => {
  try {
    localStorage.setItem(ARTICLE_STORE_KEY, JSON.stringify(articles));
  } catch {}
};

const getArticleFromStore = (id: string): NewsArticle | null => {
  try {
    const raw = localStorage.getItem(ARTICLE_STORE_KEY);
    if (!raw) return null;
    const all: NewsArticle[] = JSON.parse(raw);
    return all.find((a) => a.id === decodeURIComponent(id)) || null;
  } catch {
    return null;
  }
};

const getAllArticlesFromStore = (): NewsArticle[] => {
  try {
    const raw = localStorage.getItem(ARTICLE_STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const formatDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
};

const generateSeedreamImage = async (title: string, apiKey: string): Promise<string | null> => {
  if (!apiKey) return null;
  try {
    const response = await fetch("https://api.byteplus.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "seedream-3.0",
        prompt: "Professional news article illustration for: " + title + ". Financial news, economy, clean modern style, no text.",
        n: 1,
        size: "1024x576",
        response_format: "url",
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data?.[0]?.url || null;
  } catch {
    return null;
  }
};

const AdBanner = ({ slot, format, style }: { slot: string; format: string; style?: React.CSSProperties }) => {
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {}
  }, []);
  return (
    <div style={style} className="overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={ADSENSE_PUB}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

const buildArticleBody = (article: NewsArticle): string[] => {
  const parts: string[] = [];
  const rawDesc = article.description || "";
  const rawSummary = (article as any).summary || "";
  const rawContent = (article as any).content || "";
  const combined = [rawDesc, rawContent, rawSummary]
    .map(s => s.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" ");
  if (!combined) return ["이 기사의 본문을 불러올 수 없습니다."];
  const clean = combined.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
  const sentences = clean.match(/[^.!?。]+[.!?。]*/g) || [clean];
  const SENTENCES_PER_PARA = 3;
  for (let i = 0; i < sentences.length; i += SENTENCES_PER_PARA) {
    const para = sentences.slice(i, i + SENTENCES_PER_PARA).join(" ").trim();
    if (para.length > 20) parts.push(para);
  }
  if (parts.join("").length < 200) {
    const title = article.title || "";
    const category = article.category || "경제";
    parts.push(
      title + "에 관한 최신 소식입니다. 본 기사는 " + category + " 분야의 주요 동향을 전달합니다.",
      "전문가들은 이번 사안이 국내외 경제에 미치는 영향을 분석하고 있으며, 관련 업계에서도 지속적인 관심을 보이고 있습니다.",
      "향후 시장 동향과 정책 변화에 따라 추가적인 영향이 예상되며, EconoJabis는 관련 소식을 지속적으로 전달할 예정입니다."
    );
  }
  return parts;
};

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = id ? getArticleFromStore(id) : null;
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!article) return;
    const src = (article as any).imageUrl || (article as any).image || "";
    setImageUrl(src);
    setImgError(false);
  }, [article]);

  const handleImageError = async () => {
    if (imgError) return;
    setImgError(true);
    const seedreamKey = localStorage.getItem("seedream_api_key") || "";
    if (seedreamKey && article) {
      const generated = await generateSeedreamImage(article.title, seedreamKey);
      if (generated) {
        setImageUrl(generated);
        return;
      }
    }
    setImageUrl("https://picsum.photos/seed/" + encodeURIComponent(article?.title || "news") + "/800/450");
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg mb-4">기사를 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
            <ArrowLeft className="h-4 w-4" />홈으로
          </button>
        </div>
      </div>
    );
  }

  const bodyParagraphs = buildArticleBody(article);
  const allArticles = getAllArticlesFromStore();
  const relatedArticles = allArticles.filter(a => a.id !== article.id && a.category === article.category).slice(0, 4);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKakaoShare = () => {
    window.open("https://story.kakao.com/share?url=" + encodeURIComponent(window.location.href), "_blank", "width=600,height=400");
  };

  const handleTwitterShare = () => {
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(article.title) + "&url=" + encodeURIComponent(window.location.href), "_blank", "width=600,height=400");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={article.title}
        description={(article.description || (article as any).summary || "").slice(0, 160)}
        ogImage={imageUrl}
          article={{ title: article.title, description: article.description || "", publishedAt: article.publishedAt || new Date().toISOString(), category: article.category || "", source: "EconoJabis", image: imageUrl }}
      />
      <Header searchQuery="" onSearchChange={() => {}} />
      <div className="w-full flex justify-center py-2 bg-muted/30 border-b border-border">
        <AdBanner slot="1234567890" format="horizontal" style={{ width: "728px", height: "90px" }} />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-8 items-start">
          <main className="flex-1 min-w-0">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />뒤로가기
            </button>
            <article>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">{article.category}</span>
                {article.isBreaking && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white">속보</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 text-foreground">{article.title}</h1>
              <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(article.publishedAt || (article as any).date || "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleKakaoShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-semibold hover:bg-yellow-500 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" />카카오
                  </button>
                  <button onClick={handleTwitterShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors">
                    <Twitter className="h-3.5 w-3.5" />트위터
                  </button>
                  <button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-accent transition-colors border border-border">
                    <Link className="h-3.5 w-3.5" />{copied ? "복사됨!" : "링크복사"}
                  </button>
                </div>
              </div>
              {imageUrl && (
                <div className="mb-6 overflow-hidden rounded-xl">
                  <img src={imageUrl} alt={article.title} className="w-full object-cover max-h-[500px]" onError={handleImageError} />
                </div>
              )}
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {bodyParagraphs.map((para, i) => (
                  <div key={i}>
                    <p className="mb-5 text-base leading-relaxed text-foreground/90">{para}</p>
                    {i === 2 && (
                      <div className="my-6 flex justify-center">
                        <AdBanner slot="9876543210" format="rectangle" style={{ width: "336px", height: "280px" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
                    <ArrowLeft className="h-4 w-4" />목록으로
                  </button>
                  <button onClick={handleKakaoShare} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 text-yellow-900 text-sm font-semibold hover:bg-yellow-500 transition-colors">
                    <Share2 className="h-4 w-4" />공유하기
                  </button>
                </div>
              </div>
            </article>
            {relatedArticles.length > 0 && (
              <section className="mt-10 pt-8 border-t border-border">
                <h2 className="text-xl font-bold mb-5 text-foreground">관련 기사</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedArticles.map((rel) => (
                    <div key={rel.id} onClick={() => navigate("/article/" + encodeURIComponent(rel.id))} className="flex gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                      {((rel as any).imageUrl || (rel as any).image) && (
                        <img src={(rel as any).imageUrl || (rel as any).image} alt={rel.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-primary mb-1 block">{rel.category}</span>
                        <h3 className="text-sm font-semibold line-clamp-2 text-foreground">{rel.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(rel.publishedAt || (rel as any).date || "")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-5">
            <div className="bg-muted rounded-xl border border-border p-2 text-center">
              <AdBanner slot="1122334455" format="rectangle" style={{ width: "300px", height: "250px" }} />
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <span className="text-orange-500 text-sm font-bold">🔥</span>
                <h3 className="font-bold text-sm">급상승 검색어</h3>
              </div>
              <ul className="divide-y divide-border">
                {["반도체", "코스피", "금리", "AI", "비트코인", "환율", "삼성전자", "아파트"].map((kw, idx) => (
                  <li key={kw} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer" onClick={() => navigate("/?q=" + encodeURIComponent(kw))}>
                    <span className={"text-sm font-bold w-5 " + (idx < 2 ? "text-orange-500" : "text-muted-foreground")}>{idx + 1}</span>
                    <span className="text-sm">{kw}</span>
                    {idx < 2 && <span className="ml-auto text-xs font-bold text-red-500">NEW</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="font-bold text-sm">최신 뉴스</h3>
                <button onClick={() => navigate("/")} className="text-xs text-primary hover:underline">더보기</button>
              </div>
              <div className="divide-y divide-border">
                {allArticles.slice(0, 5).map((a) => (
                  <div key={a.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate("/article/" + encodeURIComponent(a.id))}>
                    <p className="text-xs font-semibold text-primary mb-1">{a.category}</p>
                    <p className="text-sm font-medium line-clamp-2 text-foreground">{a.title}</p>
                  </div>
                ))}
                {allArticles.length === 0 && <div className="p-3 text-sm text-muted-foreground text-center py-6">뉴스를 불러오는 중...</div>}
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/50"><h3 className="font-bold text-sm">카테고리</h3></div>
              <div className="p-3 flex flex-wrap gap-2">
                {["경제", "시장", "부동산", "암호화폐", "주식"].map(cat => (
                  <button key={cat} onClick={() => navigate("/?category=" + cat)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors border border-border">{cat}</button>
                ))}
              </div>
            </div>
            <div className="bg-muted rounded-xl border border-border p-2 text-center">
              <AdBanner slot="5544332211" format="auto" style={{ width: "300px", height: "250px" }} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
