import { useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';

type AdSlotType = 'header' | 'sidebar' | 'in-article' | 'footer' | 'mobile-banner';

interface AdBannerProps {
  slotType: AdSlotType;
  className?: string;
  adSlotId?: string;
}

const AD_DIMENSIONS: Record<AdSlotType, { width: number; height: number; label: string }> = {
  'header': { width: 728, height: 90, label: 'Leaderboard' },
  'sidebar': { width: 300, height: 250, label: 'Medium Rectangle' },
  'in-article': { width: 300, height: 250, label: 'In-Article' },
  'footer': { width: 728, height: 90, label: 'Footer Banner' },
  'mobile-banner': { width: 320, height: 50, label: 'Mobile Banner' },
};

// Google AdSense publisher ID - replace with actual ID
const ADSENSE_PUB_ID = 'ca-pub-XXXXXXXXXXXXXXXXX';
const USE_PLACEHOLDER = true; // Set to false when AdSense is approved

const AdBanner = ({ slotType, className = '', adSlotId }: AdBannerProps) => {
  const { t } = useLanguage();
  const adRef = useRef<HTMLDivElement>(null);
  const dims = AD_DIMENSIONS[slotType];

  useEffect(() => {
    if (!USE_PLACEHOLDER && adRef.current) {
      try {
        // Push AdSense ad when not using placeholder
        const adsbygoogle = (window as Record<string, unknown>).adsbygoogle as unknown[];
        if (adsbygoogle) {
          adsbygoogle.push({});
}
      } catch (e) {
        console.warn('AdSense load error:', e);
      }
    }
  }, []);

  if (USE_PLACEHOLDER) {
    return (
      <div
        className={`ad-banner-placeholder flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-xs rounded ${className}`}
        style={{ minHeight: dims.height, maxWidth: dims.width, width: '100%', margin: '0 auto' }}
      >
        <div className="text-center p-2">
          <div className="text-xs text-gray-400 mb-1">{t('advertisement')}</div>
          <div className="text-xs text-gray-300">{dims.width}×{dims.height} {dims.label}</div>
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

export default AdBanner;))}}}}}})}