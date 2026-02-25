import { useEffect, useRef } from 'react';

const USE_PLACEHOLDER = false;
const ADSENSE_PUB_ID = 'ca-pub-5884595045902078';

type SlotType = 'header' | 'sidebar' | 'in-article' | 'footer' | 'mobile-banner';

interface AdDimensions {
  width: string;
  height: string;
  label: string;
}

const slotDimensions: Record<SlotType, AdDimensions> = {
  'header': { width: '728px', height: '90px', label: 'Header Ad' },
  'sidebar': { width: '300px', height: '250px', label: 'Sidebar Ad' },
  'in-article': { width: '300px', height: '250px', label: 'In-Article Ad' },
  'footer': { width: '728px', height: '90px', label: 'Footer Ad' },
  'mobile-banner': { width: '320px', height: '50px', label: 'Mobile Banner' },
};

interface AdBannerProps {
  slotType: SlotType;
  className?: string;
  adSlotId?: string;
}

const AdBanner = ({ slotType, className = '', adSlotId }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const dims = slotDimensions[slotType];

  useEffect(() => {
    if (!USE_PLACEHOLDER && adRef.current) {
      try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        const adArr = win['adsbygoogle'];
        if (Array.isArray(adArr)) {
          adArr.push({});
      }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  if (USE_PLACEHOLDER) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 text-gray-400 ${className}`}
        style={{ minHeight: dims.height, maxWidth: dims.width, width: '100%', margin: '0 auto' }}
      >
        <div className="text-center p-2">
          <div className="text-xs mb-1">Advertisement</div>
          <div className="text-xs">{dims.width}x{dims.height} {dims.label}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`ad-banner ${className}`} style={{ display: 'flex', justifyContent: 'center' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: dims.width, height: dims.height }}
        data-ad-client={ADSENSE_PUB_ID}
        data-ad-slot={adSlotId || ''}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};


export default AdBanner;
