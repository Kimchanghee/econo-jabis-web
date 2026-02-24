// BytePlus Seedream AI Image Generation Hook
// API: https://ark.ap-southeast.bytepluses.com/api/v3/images/generations
// Docs: https://docs.byteplus.com/en/docs/ModelArk/1824121

const SEEDREAM_API_URL = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
const SEEDREAM_MODEL = "seedream-4-5-251128";
const CACHE_KEY = "econojabis_seedream_cache";
const API_KEY_STORAGE = "econojabis_seedream_apikey";

interface SeedreamCache {
  [articleId: string]: {
    url: string;
    generatedAt: number;
  };
}

interface SeedreamResponse {
  data: Array<{
    b64_image?: string;
    url?: string;
  }>;
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
    [["\uc8fc\uc2dd", "\ucf54\uc2a4\ud53c", "\ucf54\uc2a4\ub2e5", "\uc0c1\uc7a5", "\uc885\ubaa9", "\uc8fc\uac00", "\ub9e4\uc218", "\ub9e4\ub3c4"], "stock"],
    [["\ube44\ud2b8\ucf54\uc778", "\uac00\uc0c1\ud654\ud3d0", "\uc554\ud638\ud654\ud3d0", "\uc774\ub354\ub9ac\uc6c0", "\ud1a0\ud070", "\ube14\ub85d\uccb4\uc778"], "crypto"],
    [["\ubd80\ub3d9\uc0b0", "\uc544\ud30c\ud2b8", "\uc804\uc138", "\uc6d4\uc138", "\uc8fc\ud0dd", "\ub9e4\ub9e4", "\ubd84\uc591"], "realestate"],
    [["\uae08\ub9ac", "\ud658\uc728", "\uc740\ud589", "\ub300\ucd9c", "\uc608\uae08", "\uae08\uc735", "\ud22c\uc790"], "finance"],
    [["\uc815\ucc45", "\uc815\ubd80", "\uad6d\ud68c", "\ubc95\uc548", "\uaddc\uc81c", "\uc138\uae08", "\uc608\uc0b0"], "policy"],
    [["\ubc18\ub3c4\uccb4", "AI", "\uc778\uacf5\uc9c0\ub2a5", "\ud14c\ud06c", "\uc18c\ud504\ud2b8\uc6e8\uc5b4", "IT", "\ub514\uc9c0\ud138"], "technology"],
    [["\uc0b0\uc5c5", "\uc81c\uc870", "\uacf5\uc7a5", "\uc0dd\uc0b0", "\uc218\ucd9c", "\uc218\uc785", "\ubb34\uc5ed"], "industry"],
    [["\ubbf8\uad6d", "\uc911\uad6d", "\uc77c\ubcf8", "\uc720\ub7fd", "\uad6d\uc81c", "\ud574\uc678", "\uae00\ub85c\ubc8c"], "global"],
    [["\uacbd\uc81c", "GDP", "\ubb3c\uac00", "\uc778\ud50c\ub808\uc774\uc158", "\uc131\uc7a5\ub960", "\uacbd\uae30"], "economy"],
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
  } catch { /* silently fail */ }
}

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export async function generateSeedreamImage(
  articleId: string,
  title: string,
  category?: string
): Promise<string | null> {
  const cached = getCachedImage(articleId);
  if (cached) return cached;
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const prompt = generatePrompt(title, category);
  try {
    const response = await fetch(SEEDREAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: SEEDREAM_MODEL,
        prompt,
        size: "2K",
        watermark: false,
      }),
    });
    if (!response.ok) {
      console.error("Seedream API error:", response.status);
      return null;
    }
    const data: SeedreamResponse = await response.json();
    if (data.data && data.data.length > 0) {
      const imageData = data.data[0];
      let imageUrl: string | null = null;
      if (imageData.url) {
        imageUrl = imageData.url;
      } else if (imageData.b64_image) {
        imageUrl = `data:image/png;base64,${imageData.b64_image}`;
      }
      if (imageUrl) {
        setCachedImage(articleId, imageUrl);
        return imageUrl;
      }
    }
    return null;
  } catch (error) {
    console.error("Seedream image generation failed:", error);
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
export { detectCategory, generatePrompt };
