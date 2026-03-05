import { useMemo } from "react";
import { getAdIframeSrcdoc, type AdSlotType, getAdSlotKey } from "../lib/adsterra";

interface AdBannerProps {
  slotType: AdSlotType;
  className?: string;
  uid?: string;
}

const getAdSize = (slotType: AdSlotType) => {
  if (slotType === "sidebar" || slotType === "in-article") {
    return { width: 300, height: 250 };
  }
  return { width: 728, height: 90 };
};

const AdBanner = ({ slotType, className = "", uid }: AdBannerProps) => {
  const { width, height } = useMemo(() => getAdSize(slotType), [slotType]);
  const adKey = useMemo(() => getAdSlotKey(slotType), [slotType]);
  const srcDoc = useMemo(() => getAdIframeSrcdoc(adKey, width, height), [adKey, width, height]);
  const title = useMemo(
    () => (uid ? `ad-${slotType}-${uid}` : `ad-${slotType}`),
    [slotType, uid],
  );

  if (!adKey) {
    return <div className={`adsterra-wrapper w-full ${className}`} style={{ minHeight: `${height}px` }} />;
  }

  return (
    <div
      className={`adsterra-wrapper w-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: `${height}px` }}
    >
      <iframe
        key={`${slotType}-${uid ?? "default"}-${adKey}`}
        title={title}
        srcDoc={srcDoc}
        width={width}
        height={height}
        scrolling="no"
        frameBorder={0}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        className="adsterra-container border-0"
      />
    </div>
  );
};

export default AdBanner;
