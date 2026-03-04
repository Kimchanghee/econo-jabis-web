const defaultString = (value: unknown, fallback: string): string => {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

export const ADSTERRA_PROJECT_ID = 5630856;

export const ADSTERRA_728_KEY = defaultString(
  import.meta.env.VITE_ADSTERRA_728_KEY,
  "28706840",
);

export const ADSTERRA_300_KEY = defaultString(
  import.meta.env.VITE_ADSTERRA_300_KEY,
  "28706845",
);

export const ADSTERRA_NATIVE_KEY = defaultString(
  import.meta.env.VITE_ADSTERRA_NATIVE_KEY,
  "28699701",
);

export const ADSTERRA_IFRAME_HOST = defaultString(
  import.meta.env.VITE_ADSTERRA_IFRAME_HOST,
  "highperformanceformat.com",
);

export const ADSTERRA_NATIVE_HOST = defaultString(
  import.meta.env.VITE_ADSTERRA_NATIVE_HOST,
  "pl28800200.effectivegatecpm.com",
);

export const getAdIframeSrcdoc = (key: string, width: number, height: number): string =>
  '<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head><body>' +
  `<script type="text/javascript">atOptions={"key":"${key}","format":"iframe","height":${height},"width":${width},"params":{}}<\/script>` +
  `<script type="text/javascript" src="//${ADSTERRA_IFRAME_HOST}/${key}/invoke.js"><\/script>` +
  "</body></html>";

export const getAdNativeContainerId = (): string => `container-${ADSTERRA_NATIVE_KEY}`;

export const getAdNativeScriptUrl = (): string =>
  `https://${ADSTERRA_NATIVE_HOST}/${ADSTERRA_NATIVE_KEY}/invoke.js`;

