const defaultString = (value: unknown, fallback: string): string => {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

export const ADSTERRA_PROJECT_ID = 5630856;

export const ADSTERRA_728_KEY = defaultString(
  import.meta.env.VITE_ADSTERRA_728_KEY,
  "cab28a3c8ec96edb306ab13e7af5944b",
);

export const ADSTERRA_300_KEY = defaultString(
  import.meta.env.VITE_ADSTERRA_300_KEY,
  "333406d0aacce2e565463f8c1d21d1bd",
);

export const ADSTERRA_NATIVE_KEY = defaultString(
  import.meta.env.VITE_ADSTERRA_NATIVE_KEY,
  "ea5bbfe829e07e03a26eddac6389273b",
);

export const ADSTERRA_IFRAME_HOST = defaultString(
  import.meta.env.VITE_ADSTERRA_IFRAME_HOST,
  "highperformanceformat.com",
);

export const ADSTERRA_NATIVE_HOST = defaultString(
  import.meta.env.VITE_ADSTERRA_NATIVE_HOST,
  "pl28800200.effectivegatecpm.com",
);

export type AdSlotType = "header" | "sidebar" | "in-article" | "footer" | "native";

const isLikelyZoneKey = (value: string): boolean =>
  /^[a-zA-Z0-9]{16,64}$/.test(value) && !/^\d+$/.test(value);

const safeReadLocalStorage = (key: string): string => {
  if (typeof window === "undefined") return "";
  try {
    return String(window.localStorage.getItem(key) ?? "").trim();
  } catch {
    return "";
  }
};

const extractAdKey = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return trimmed;
  }

  const keyByOptions = trimmed.match(/["']?key["']?\s*[:=]\s*["']([a-zA-Z0-9]+)["']/i);
  if (keyByOptions?.[1]) return keyByOptions[1];

  const keyByInvoke = trimmed.match(/\/([a-zA-Z0-9]+)\/invoke\.js/i);
  if (keyByInvoke?.[1]) return keyByInvoke[1];

  return "";
};

const slotStorageKey: Record<Exclude<AdSlotType, "native">, string> = {
  header: "adsterra_header_key",
  sidebar: "adsterra_sidebar_key",
  "in-article": "adsterra_in-article_key",
  footer: "adsterra_footer_key",
};

export const getAdSlotKey = (slot: AdSlotType): string => {
  if (slot === "native") {
    const storedNative = extractAdKey(safeReadLocalStorage("adsterra_native_key"));
    return isLikelyZoneKey(storedNative) ? storedNative : ADSTERRA_NATIVE_KEY;
  }

  const stored = extractAdKey(safeReadLocalStorage(slotStorageKey[slot]));
  if (isLikelyZoneKey(stored)) return stored;

  if (slot === "sidebar") return ADSTERRA_300_KEY;
  return ADSTERRA_728_KEY;
};

export const getAdIframeSrcdoc = (key: string, width: number, height: number): string =>
  '<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head><body>' +
  `<script type="text/javascript">atOptions={"key":"${key}","format":"iframe","height":${height},"width":${width},"params":{}}<\/script>` +
  `<script type="text/javascript" src="https://${ADSTERRA_IFRAME_HOST}/${key}/invoke.js"><\/script>` +
  "</body></html>";

export const getAdNativeContainerId = (): string => `container-${ADSTERRA_NATIVE_KEY}`;

export const getAdNativeScriptUrl = (): string =>
  `https://${ADSTERRA_NATIVE_HOST}/${ADSTERRA_NATIVE_KEY}/invoke.js`;
