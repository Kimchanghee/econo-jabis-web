import { useEffect, useMemo, useRef } from "react";
import { ADSTERRA_IFRAME_HOST, type AdSlotType, getAdSlotKey } from "../lib/adsterra";

interface AdBannerProps {
  slotType: AdSlotType;
  className?: string;
  uid?: string;
}

const getAdSize = (slotType: AdSlotType) => {
  if (slotType === "sidebar") {
    return { width: 300, height: 250 };
  }
  return { width: 728, height: 90 };
};

let adRenderQueue: Promise<void> = Promise.resolve();

const enqueueAdRender = (job: () => Promise<void>): Promise<void> => {
  adRenderQueue = adRenderQueue.then(job).catch(() => undefined);
  return adRenderQueue;
};

const AdBanner = ({ slotType, className = "", uid }: AdBannerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useMemo(() => getAdSize(slotType), [slotType]);
  const title = useMemo(
    () => (uid ? `ad-${slotType}-${uid}` : `ad-${slotType}`),
    [slotType, uid],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const adKey = getAdSlotKey(slotType);
    if (!adKey) return;

    let cancelled = false;

    void enqueueAdRender(
      () =>
        new Promise<void>((resolve) => {
          if (cancelled) {
            resolve();
            return;
          }

          const optionsScript = document.createElement("script");
          optionsScript.type = "text/javascript";
          optionsScript.text = `window.atOptions={"key":"${adKey}","format":"iframe","height":${height},"width":${width},"params":{}};`;

          const invokeScript = document.createElement("script");
          invokeScript.type = "text/javascript";
          invokeScript.src = `https://${ADSTERRA_IFRAME_HOST}/${adKey}/invoke.js`;
          invokeScript.async = false;
          invokeScript.setAttribute("data-cfasync", "false");
          invokeScript.setAttribute("data-ad-title", title);

          const complete = () => resolve();
          invokeScript.onload = complete;
          invokeScript.onerror = complete;

          container.replaceChildren();
          container.appendChild(optionsScript);
          container.appendChild(invokeScript);

          window.setTimeout(complete, 3000);
        }),
    );

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [slotType, width, height, title]);

  return (
    <div
      className={`adsterra-wrapper w-full ${className}`}
      style={{ minHeight: `${height}px` }}
    >
      <div
        ref={containerRef}
        data-slot={slotType}
        className="adsterra-container flex items-center justify-center overflow-hidden"
      />
    </div>
  );
};

export default AdBanner;
