// AI Image Generation Hook via Cloud Run Backend (Vertex AI)
// Uses gemini-3.1-flash-image-preview for image generation

const CACHE_KEY = "econojabis_seedream_cache";

interface SeedreamCache {
  [articleId: string]: {
    url: string;
    generatedAt: number;
  };
}

const CATEGORY_PROMPTS: Record<string, string> = {
  finance: "professional finance news photo, stock market trading floor, financial charts and graphs on monitors, realistic editorial photography, sharp focus, natural lighting, 16:9 aspect ratio, news media quality",
  economy: "professional economy news photo, modern city skyline with business district, economic activity, realistic editorial photography, sharp focus, natural lighting, 16:9 aspect ratio, news media quality",
  stock: "professional stock market news photo, close-up of stock ticker display, trading data screens, realistic editorial photography, sharp focus, dramatic lighting, 16:9 aspect ratio, news media quality",
  crypto: "professional cryptocurrency news photo, digital currency visualization, blockchain technology concept, futuristic financial data display, realistic editorial photography, 16:9 aspect ratio, news media quality",
  realestate: "professional real estate news photo, modern apartment buildings cityscape, urban development, realistic editorial photography, sharp focus, natural lighting, 16:9 aspect ratio, news media quality",
  policy: "professional government policy news photo, official government building exterior, press conference setting, realistic editorial photography, sharp focus, natural lighting, 16:9 aspect ratio, news media quality",
  industry: "professional industry news photo, modern manufacturing facility, industrial automation, realistic editorial photography, sharp focus, natural lighting, 16:9 aspect ratio, news media quality",
  technology: "professional technology news photo, modern tech office workspace, digital innovation concept, realistic editorial photography, sharp focus, clean lighting, 16:9 aspect ratio, news media quality",
  global: "professional international news photo, world map with economic data overlay, global trade concept, realistic editorial photography, sharp focus, 16:9 aspect ratio, news media quality",
  default: "professional economic news photo, modern business environment, corporate setting, realistic editorial photography, sharp focus, natural lighting, 16:9 aspect ratio, news media quality",
};

function detectCategory(title: string): string {
  const categoryMap: Array<[string[], string]> = [
    [["주식", "코스피", "코스닥", "상장", "종목", "주가", "매수", "매도"], "stock"],
    [["비트코인", "가상화폐", "암호화폐", "이더리움", "토큰", "블록체인"], "crypto"],
    [["부동산", "아파트", "전세", "월세", "주택", "매매", "분양"], "realestate"],
    [["금리", "환율", "은행", "대출", "예금", "금융", "투자"], "finance"],
    [["정책", "정부", "국회", "법안", "규제", "세금", "예산"], "policy"],
    [["반도체", "AI", "인공지능", "테크", "소프트웨어", "IT", "디지털"], "technology"],
    [["산업", "제조", "공장", "생산", "수출", "수입", "무역"], "industry"],
    [["미국", "중국", "일본", "유럽", "국제", "해외", "글로벌"], "global"],
    [["경제", "GDP", "물가", "인플레이션", "성장률", "경기"], "economy"],
  ];

  for (const [keywords, category] of categoryMap) {
    if (keywords.some((kw) => title.includes(kw))) {
      return category;
    }
  }
  return "default";
}

function generatePrompt(title: string, category?: string): string {
  const detected = category || detectCategory(title);
  return CATEGORY_PROMPTS[detected] || CATEGORY_PROMPTS.default;
}

function getCachedImage(articleId: string): string | null {
  try {
    const cache: SeedreamCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const entry = cache[articleId];
    if (entry && Date.now() - entry.generatedAt < 7 * 24 * 60 * 60 * 1000) {
      return entry.url;
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedImage(articleId: string, url: string): void {
  try {
    const cache: SeedreamCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    cache[articleId] = { url, generatedAt: Date.now() };
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      const sorted = keys.sort((a, b) => cache[a].generatedAt - cache[b].generatedAt);
      for (let i = 0; i < keys.length - 100; i++) {
        delete cache[sorted[i]];
      }
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* silently fail */
  }
}

export function getApiKey(): string {
  return 'backend-managed';
}

export function setApiKey(_key: string): void {
  // No-op: API key is managed by backend
}

export function hasApiKey(): boolean {
  return true; // Always true since backend handles auth
}

export async function generateSeedreamImage(
  articleId: string,
  title: string,
  category?: string
): Promise<string | null> {
  const cached = getCachedImage(articleId);
  if (cached) return cached;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://econojabis-backend-m2hewckpba-uc.a.run.app';
  const prompt = generatePrompt(title, category);

  try {
    const response = await fetch(`${backendUrl}/api/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      console.error("Backend image API error:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.imageUrl) {
      setCachedImage(articleId, data.imageUrl);
      return data.imageUrl;
    }

    return null;
  } catch (error) {
    console.error("Image generation via backend failed:", error);
    return null;
  }
}

export function getCategoryPlaceholder(title: string): string {
  const category = detectCategory(title);
  const gradients: Record<string, string> = {
    stock: "from-green-600 to-emerald-800",
    crypto: "from-orange-500 to-amber-700",
    realestate: "from-blue-500 to-indigo-700",
    finance: "from-purple-600 to-violet-800",
    policy: "from-red-500 to-rose-700",
    technology: "from-cyan-500 to-teal-700",
    industry: "from-gray-500 to-slate-700",
    global: "from-sky-500 to-blue-700",
    economy: "from-amber-500 to-yellow-700",
    default: "from-zinc-600 to-gray-800",
  };
  return gradients[category] || gradients.default;
}

export { detectCategory, generatePrompt };
