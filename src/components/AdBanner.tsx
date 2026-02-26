import { useEffect, useRef } from 'react';

const ADSTERRA_SCRIPT = 'https://pl28800200.effectivegatecpm.com/ea5bbfe829e07e03a26eddac6389273b/invoke.js';
const ADSTERRA_CONTAINER = 'container-ea5bbfe829e07e03a26eddac6389273b';

interface AdBannerProps {
  slotType?: string;
  className?: string;
}

const AdBanner = ({ className = '' }: AdBannerProps) => {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const existing = document.getElementById('adsterra-native-script');
    if (existing) return;
    const script = document.createElement('script');
    script.id = 'adsterra-native-script';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = ADSTERRA_SCRIPT;
    document.body.appendChild(script);
  }, []);

  return (
    <div className={`adsterra-wrapper ${className}`}>
      <div id={ADSTERRA_CONTAINER} />
    </div>
  );
};

export default AdBanner;