import { useEffect, useRef, useState } from 'react';

const ADSTERRA_SCRIPT = 'https://pl28800200.effectivegatecpm.com/ea5bbfe829e07e03a26eddac6389273b/invoke.js';
const BASE_CONTAINER_ID = 'container-ea5bbfe829e07e03a26eddac6389273b';

// 전역 스크립트 로딩 추적
let scriptLoaded = false;
let scriptLoading = false;
const pendingCallbacks: (() => void)[] = [];

function loadAdsterraScript(callback: () => void) {
  if (scriptLoaded) {
    callback();
    return;
  }
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

// 고유 ID 카운터 (인스턴스마다 다른 ID 부여)
let instanceCounter = 0;

const AdBanner = ({ slotType = 'banner', className = '' }: AdBannerProps) => {
  const [uniqueId] = useState(() => {
    instanceCounter++;
    return `${BASE_CONTAINER_ID}-${slotType}-${instanceCounter}-${Math.random().toString(36).slice(2,6)}`;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    loadAdsterraScript(() => {
      // 스크립트 로드 후 컨테이너 ID를 기본 ID로 잠시 변경해 광고 삽입 유도
      const container = containerRef.current;
      if (!container) return;

      // Adsterra native banner는 container-xxx ID를 찾아 광고를 삽입함
      // 각 인스턴스에 고유 ID를 부여해 여러 광고가 동시에 표시되도록 함
      setTimeout(() => {
        if (container && (window as any).adsterra) {
          try {
            (window as any).adsterra.init();
          } catch (e) {
            // ignore
          }
        }
      }, 500);
    });
  }, [uniqueId]);

  return (
    <div className={`adsterra-wrapper w-full ${className}`}>
      <div
        ref={containerRef}
        id={uniqueId}
        data-slot={slotType}
        className="adsterra-container min-h-[90px] flex items-center justify-center"
        style={{ minWidth: '300px' }}
      />
    </div>
  );
};

export default AdBanner;
