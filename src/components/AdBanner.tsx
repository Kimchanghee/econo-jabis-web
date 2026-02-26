import { useEffect, useRef } from 'react';

// Adsterra Network Ad Component
// Setup: Go to https://publishers.adsterra.com/ -> Ad Units -> Get zone keys
// Enter keys in Admin Panel -> Adsterra Settings
// or: localStorage.setItem('adsterra_header_key', 'YOUR_ZONE_KEY')

const AD_SIZES: Record<string, { width: number; height: number; label: string }> = {
  header: { width: 728, height: 90, label: 'Leaderboard 728x90' },
  sidebar: { width: 300, height: 250, label: 'Rectangle 300x250' },
  'in-article': { width: 300, height: 250, label: 'Rectangle 300x250' },
  footer: { width: 728, height: 90, label: 'Leaderboard 728x90' },
  'mobile-banner': { width: 320, height: 50, label: 'Mobile 320x50' },
};

type SlotType = 'header' | 'sidebar' | 'in-article' | 'footer' | 'mobile-banner';

interface AdBannerProps {
  slotType: SlotType;
  className?: string;
}

const AdBanner = ({ slotType, className = '' }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const size = AD_SIZES[slotType] || AD_SIZES.sidebar;
  const zoneKey = localStorage.getItem('adsterra_' + slotType + '_key') || '';
  const isActive = zoneKey.length > 5;

  useEffect(() => {
    if (!adRef.current) return;
    adRef.current.innerHTML = '';
    if (!isActive) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//' + 'pl' + zoneKey + '.effectivegatecpm.com/' + zoneKey + '/invoke.js';
    adRef.current.appendChild(script);
  }, [zoneKey, isActive]);

  if (!isActive) {
    return (
      <div
        className={'flex flex-col items-center justify-center bg-muted/20 border border-dashed border-border/40 rounded-md ' + className}
        style={{ width: '100%', maxWidth: size.width + 'px', height: size.height + 'px' }}
      >
        <p className="text-xs font-medium text-muted-foreground">Adsterra 광고</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{size.label}</p>
        <p className="text-[9px] text-muted-foreground/40 mt-1">관리자 패널 -&gt; Adsterra 키 입력</p>
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={'adsterra-zone ' + className}
      style={{ width: '100%', maxWidth: size.width + 'px', height: size.height + 'px', overflow: 'hidden' }}
    />
  );
};

export default AdBanner;