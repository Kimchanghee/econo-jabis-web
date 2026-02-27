import { useEffect, useRef, useState } from 'react';

const ADSTERRA_SCRIPT = 'https://pl28800200.effectivegatecpm.com/ea5bbfe829e07e03a26eddac6389273b/invoke.js';
const BASE_CONTAINER_ID = 'container-ea5bbfe829e07e03a26eddac6389273b';

let scriptLoaded = false;
let scriptLoading = false;
const pendingCallbacks: (() => void)[] = [];

function loadAdsterraScript(callback: () => void) {
  if (scriptLoaded) { callback(); return; }
  pendingCallbacks.push(callback);
  if (scriptLoading) return;
  scriptLoading = true;
  const script = document.createElement('script');
  script.id = 'adsterra-native-script';
  script.async = true;
  script.setAttribute('data-cfasync', 'false');
  script.src = ADSTERRA_SCRIPT;
  script.onload = () => {
    scriptLoaded = true;
    scriptLoading = false;
    pendingCallbacks.forEach(cb => cb());
    pendingCallbacks.length = 0;
  };
  document.body.appendChild(script);
}

interface AdBannerProps {
  slotType?: string;
  className?: string;
}

let instanceCounter = 0;

const AdBanner = ({ slotType = 'banner', className = '' }: AdBannerProps) => {
  const [uniqueId] = useState(() => {
    instanceCounter++;
    return `${BASE_CONTAINER_ID}-${slotType}-${instanceCounter}-${Math.random().toString(36).slice(2,6)}`;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadAdsterraScript(() => {
      const container = containerRef.current;
      if (!container) return;
      setTimeout(() => {
        if (container && (window as any).adsterra) {
          try { (window as any).adsterra.init(); } catch (e) {}
        }
        // Check if content was inserted
        setTimeout(() => {
          if (container && container.children.length > 0) {
            setHasContent(true);
          }
        }, 1000);
      }, 500);
    });
  }, [uniqueId]);

  return (
    <div className={`adsterra-wrapper w-full ${className}`} style={{ height: hasContent ? 'auto' : 0, overflow: 'hidden' }}>
      <div
        ref={containerRef}
        id={uniqueId}
        data-slot={slotType}
        className="adsterra-container flex items-center justify-center"
      />
    </div>
  );
};

export default AdBanner;
