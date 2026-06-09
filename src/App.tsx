import { useState, useEffect } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import LuxuryHUD from './components/LuxuryHUD';
import { ProductCustomization } from './types';
import { SHOWROOM_RINGS } from './data';

export default function App() {
  const [activeRingIndex, setActiveRingIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [introPhase, setIntroPhase] = useState<'black' | 'particles' | 'reveal' | 'zoom' | 'brand' | 'ready'>('black');
  
  const [customization, setCustomization] = useState<ProductCustomization>({
    metal: 'platinum',
    cut: 'solitaire',
    engraving: '',
    glowIntensity: 0.0
  });

  // Track overall scroll progress to drive the custom cinematic Three.js camera transitions
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = Math.min(Math.max(scrollY / scrollHeight, 0), 1.0);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Sync customization controls to match selected ring type when switching catalog items
  useEffect(() => {
    const ring = SHOWROOM_RINGS[activeRingIndex];
    if (ring) {
      setCustomization({
        metal: ring.metal,
        cut: ring.cut,
        engraving: '',
        glowIntensity: 0.0
      });
    }
  }, [activeRingIndex]);

  // Determine if customization benchmark panel is active
  const isCustomizing = scrollProgress >= 0.65;

  return (
    <div className="relative min-h-[305vh] bg-[#050505] text-white selection:bg-[#e5c384] selection:text-black overflow-x-hidden font-sans">
      
      {/* 1. LUXURY BRASS MATTE GOLD PROGRESS LINE - HEADER ATELIER AT THE TOP */}
      <div className="fixed top-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#e5c384] to-transparent opacity-50 z-50 pointer-events-none" />

      {/* 2. CHROME ATMOSPHERE VIRTUAL AMBIENTS BACKGROUND LIGHTING */}
      <div className="fixed inset-0 opacity-45 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#1b140b] blur-[110px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0d1222] blur-[115px]" />
      </div>

      {/* 3. STATIC STUDIO SOFT WATERPROOF VEILS LAYERS */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-40 bg-repeat bg-center"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* 4. OPTICAL TELEMETRY WIREFRAME SHIELD DETAILS (Renders on Refraction Detail Orbit phase) */}
      <div 
        className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center transition-all duration-1000 ease-out"
        style={{ 
          opacity: scrollProgress > 0.15 && scrollProgress <= 0.60 ? 0.35 : 0,
          transform: scrollProgress > 0.15 && scrollProgress <= 0.60 ? 'scale(1.0)' : 'scale(1.12)',
        }}
      >
        <div className="w-[360px] h-[360px] rounded-full border border-dashed border-[#e5c384]/15 animate-spin-slow absolute" />
        <div className="w-[430px] h-[430px] rounded-full border border-double border-white/[0.03] animate-reverse-spin absolute" />
        
        {/* Holographic specs data lines */}
        <div className="absolute top-[28%] right-[12%] text-right font-mono text-[9px] text-[#e5c384]/50 leading-normal tracking-widest hidden md:block select-none">
          SECURE_CONCIERGE: ACTIVE<br />
          FACET_NORMAL: SOLVER<br />
          DISPERSION_MODEL: CUBIC
        </div>
        <div className="absolute bottom-[28%] left-[12%] text-left font-mono text-[9px] text-gray-500/50 leading-normal tracking-widest hidden md:block select-none">
          STABLE_60FPS_LOCKED: OK<br />
          HDR_ENVIL_MAP: ONLINE<br />
          STUDIO_SHADOW: ENABLED
        </div>
      </div>

      {/* 5. CANVAS RENDERER LAYER (Three.js WebGL canvas pinned stationary) */}
      <section className="fixed inset-0 w-full h-full z-0 block pointer-events-none select-none">
        <ThreeCanvas 
          activeRingIndex={activeRingIndex}
          customization={customization}
          scrollProgress={scrollProgress}
          onHoverStateChange={setIsHovered}
          introPhase={introPhase}
          onIntroUpdate={setIntroPhase}
          isCustomizing={isCustomizing}
        />
      </section>

      {/* 6. CONCIERGE HUB TEXTS & USER CONTROLS LAYER */}
      <LuxuryHUD 
        activeRingIndex={activeRingIndex}
        setActiveRingIndex={setActiveRingIndex}
        customization={customization}
        setCustomization={setCustomization}
        scrollProgress={scrollProgress}
        isCanvasHovered={isHovered}
        introPhase={introPhase}
      />

      {/* 7. SCROLL NAVIGATION SNAP HEIGHT GUIDELINES */}
      <div id="section-height-snapper-01" className="h-screen w-full relative pointer-events-none" />
      <div id="section-height-snapper-02" className="h-screen w-full relative pointer-events-none" />
      <div id="section-height-snapper-03" className="h-[105vh] w-full relative pointer-events-none" />

    </div>
  );
}
