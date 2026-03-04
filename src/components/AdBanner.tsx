import { useEffect, useMemo, useRef } from "react";
import { type AdSlotType, getAdIframeSrcdoc, getAdSlotKey } from "../lib/adsterra";

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

    const iframe = document.createElement("iframe");
    iframe.title = title;
    iframe.scrolling = "no";
    iframe.setAttribute("frameBorder", "0");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-forms");
    iframe.style.width = `${width}px`;
    iframe.style.maxWidth = "100%";
    iframe.style.height = `${height}px`;
    iframe.style.border = "none";
    iframe.style.display = "block";
    iframe.srcdoc = getAdIframeSrcdoc(adKey, width, height);

    container.replaceChildren(iframe);

    return () => {
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
