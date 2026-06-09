import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Compass, ShieldCheck, Heart, ArrowRight, Check, Diamond, Menu, X, ArrowLeft, ArrowRight as ChevronRight } from 'lucide-react';
import { ProductCustomization, MetalType, DiamondCut } from '../types';
import { SHOWROOM_RINGS } from '../data';

interface LuxuryHUDProps {
  activeRingIndex: number;
  setActiveRingIndex: (index: number) => void;
  customization: ProductCustomization;
  setCustomization: React.Dispatch<React.SetStateAction<ProductCustomization>>;
  scrollProgress: number;
  isCanvasHovered: boolean;
  introPhase: 'black' | 'particles' | 'reveal' | 'zoom' | 'brand' | 'ready';
}

export default function LuxuryHUD({
  activeRingIndex,
  setActiveRingIndex,
  customization,
  setCustomization,
  scrollProgress,
  isCanvasHovered,
  introPhase
}: LuxuryHUDProps) {
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  const selectedRing = SHOWROOM_RINGS[activeRingIndex];

  // Determine active scroll-based narration card
  let activeNarrativeIdx = 0;
  if (scrollProgress >= 0.33 && scrollProgress < 0.68) {
    activeNarrativeIdx = 1;
  } else if (scrollProgress >= 0.68) {
    activeNarrativeIdx = 2;
  }

  // Handle metal customize override
  const handleMetalChange = (metal: MetalType) => {
    setCustomization(prev => ({ ...prev, metal }));
  };

  // Handle cut customize override
  const handleCutChange = (cut: DiamondCut) => {
    setCustomization(prev => ({ ...prev, cut }));
  };

  // Handle engraving internal inscription text bounds
  const handleEngravingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 18).toUpperCase();
    setEngravingText(val);
    setCustomization(prev => ({ ...prev, engraving: val }));
  };

  const executeAcquisition = () => {
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 5000);
  };

  // Automatically sync local engravingText when customized object changes
  useEffect(() => {
    setEngravingText(customization.engraving);
  }, [customization.engraving]);

  // Center selected item in catalog carousel scroll position
  useEffect(() => {
    if (carouselContainerRef.current) {
      const selectedEl = carouselContainerRef.current.children[activeRingIndex] as HTMLElement;
      if (selectedEl) {
        const parentW = carouselContainerRef.current.offsetWidth;
        const selfW = selectedEl.offsetWidth;
        const left = selectedEl.offsetLeft;
        carouselContainerRef.current.scrollTo({
          left: left - parentW / 2 + selfW / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeRingIndex]);

  const cutLabels: Record<string, string> = {
    solitaire: 'Celestial Solitaire',
    emerald: 'Sovereign Emerald Step',
    princess: 'Duchess Princess Square',
    heart: 'Amore Heart Romantic',
    pear: 'Imperial Teardrop Pear',
    oval: 'Antiquarian Oval Facet',
    flat: 'Eternity Flush Bezel',
  };

  return (
    <div id="hud-root-overlay" className="absolute inset-0 w-full h-full pointer-events-none select-none z-20 font-sans text-white">
      
      {/* =========================================================================
          1. PREMIUM FULL-SCREEN CINEMATIC INTRO CHOREOGRAPHY OVERLAY CODE
          ========================================================================= */}
      {introPhase !== 'ready' && (
        <div 
          id="loading-intro-curtain"
          className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center p-6 z-50 pointer-events-none select-none transition-all duration-1000 ease-in-out"
          style={{
            opacity: introPhase === 'brand' ? 0.92 : 1,
            visibility: 'visible'
          }}
        >
          {/* Ornate Gold concentric optical focus rings */}
          <div className="absolute w-[440px] h-[440px] rounded-full border border-white/[0.03] flex items-center justify-center animate-spin-slow">
            <div className="w-[360px] h-[360px] rounded-full border border-dashed border-[#e5c384]/10 flex items-center justify-center">
              <div className="w-[280px] h-[280px] rounded-full border border-double border-white/[0.04]" />
            </div>
          </div>

          <div className="relative text-center max-w-lg w-full flex flex-col items-center">
            
            {/* Animated phase subtitle */}
            <div className="h-6 flex items-center justify-center mb-6">
              {introPhase === 'black' && (
                <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-gray-600 animate-pulse">
                  [ CALIBRATING CHRONOS MODULES ... ]
                </span>
              )}
              {introPhase === 'particles' && (
                <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#e5c384] animate-pulse">
                  GATHERING STARDUST PARTICLES SHARDS...
                </span>
              )}
              {introPhase === 'reveal' && (
                <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-cyan-400 animate-pulse">
                  OPTICAL INCIDENT LIGHT STREAKS ALIGNED
                </span>
              )}
              {introPhase === 'zoom' && (
                <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-pink-400 animate-bounce">
                  [ CAMERA SWEEP FLY-IN INITIATED ]
                </span>
              )}
              {introPhase === 'brand' && (
                <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#e5c384]/80">
                  WELCOMING TO THE ATELIER
                </span>
              )}
            </div>

            {/* Main Brand Header Title card */}
            <div className="overflow-hidden mb-2">
              <h1 
                className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e5c384] to-gray-300 uppercase transition-all duration-1000 transform leading-normal"
                style={{
                  transform: introPhase === 'black' ? 'translateY(120%)' : 'translateY(0)',
                  letterSpacing: introPhase === 'zoom' || introPhase === 'brand' ? '0.42em' : '0.3em'
                }}
              >
                AETHERIA
              </h1>
            </div>

            <p className="text-[10px] uppercase tracking-[0.45em] text-[#e5c384]/75 font-light mb-1">
              HAUTE JOAILLERIE
            </p>
            <p className="text-[8px] uppercase tracking-[0.25em] text-white/35 font-mono mb-1">
              A Luxury 3D Web Experience
            </p>
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#e5c384]/50 font-semibold mb-10">
              Created by Srushti Ambre
            </p>

            {/* Procedural progress bar lines */}
            <div className="relative w-40 h-[1.5px] bg-white/[0.07] overflow-hidden rounded">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#ffd995] to-[#e5c384] transition-all duration-700 rounded shadow-[0_0_8px_rgba(229,195,132,0.6)]"
                style={{
                  width: introPhase === 'black' ? '15%' : (introPhase === 'particles' ? '40%' : (introPhase === 'reveal' ? '68%' : (introPhase === 'zoom' ? '90%' : '100%')))
                }}
              />
            </div>

            {/* Technical notes footer */}
            <div className="mt-20 font-mono text-[8px] text-gray-600 tracking-[0.25em] h-4">
              {introPhase === 'particles' && 'VERTICES: 124,800 COMPILING...'}
              {introPhase === 'reveal' && 'RAY_DISPERSION_IOR_CALC: 2.417 READY'}
              {introPhase === 'zoom' && 'STABLE_60_FPS_LOCK: ACTIVE'}
            </div>

          </div>
        </div>
      )}


      {/* =========================================================================
          2. STANDARDIZED ATELIER UTILITY APP NAVBAR HEADER
          ========================================================================= */}
      {introPhase === 'ready' && (
        <>
          <header id="hud-header" className="fixed top-0 left-0 right-0 w-full flex items-center justify-between p-6 md:px-12 pointer-events-auto z-40 transition-all duration-700 ease-out bg-gradient-to-b from-black/80 via-black/30 to-transparent backdrop-blur-xs">
        <div className="flex flex-col text-left">
          <h1 className="text-xl md:text-2xl font-light tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-[#e5c384] to-gray-200">
            AETHERIA
          </h1>
          <span className="text-[8px] uppercase tracking-[0.45em] text-[#e5c384] font-medium block">
            Haute Joaillerie
          </span>
        </div>

        {/* Global Navigation Links */}
        <div className="hidden lg:flex items-center space-x-10 text-[9px] tracking-[0.35em] uppercase text-gray-300 font-light">
          <span className="hover:text-[#e5c384] transition-colors cursor-pointer active">Showroom Collection</span>
          <span className="hover:text-[#e5c384] transition-colors cursor-pointer">Bespoke Workshop</span>
          <span className="hover:text-[#e5c384] transition-colors cursor-pointer">Certificates</span>
          <span className="text-gray-700">|</span>
          <span className="text-[#e5c384] font-medium flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full backdrop-blur-md">
            <ShieldCheck size={11} className="text-[#e5c384]" /> SECURED ESCROW
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const el = document.getElementById('luxury-customizer-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[9px] md:text-[10px] border border-white/15 bg-black/50 hover:bg-black/90 px-6 py-2.5 rounded-none text-white hover:text-[#e5c384] hover:border-[#e5c384]/40 tracking-[0.3em] uppercase transition-all duration-300 cursor-pointer hidden sm:block font-medium shadow-md"
          >
            CUSTOM PERSONALIZATION
          </button>

          {/* Toggle Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white/[0.04] border border-white/10 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer block lg:hidden pointer-events-auto"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlays */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 w-full h-full bg-black/98 z-30 flex flex-col justify-between p-8 pt-32 pointer-events-auto animate-fade-in">
          <div className="flex flex-col space-y-8 text-left text-lg font-light tracking-[0.25em] uppercase">
            <button 
              onClick={() => { setActiveRingIndex(0); setMobileMenuOpen(false); }}
              className="hover:text-[#e5c384] text-left transition-colors cursor-pointer border-b border-white/5 pb-2"
            >
              01 • SHOWROOM
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById('luxury-customizer-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#e5c384] text-left transition-colors cursor-pointer border-b border-white/5 pb-2"
            >
              02 • ATELIER CONFIG
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#e5c384] text-left transition-colors cursor-pointer border-b border-white/5 pb-2"
            >
              03 • AUTHENTICITY CODE
            </button>
          </div>

          <div className="border-t border-white/10 pt-6">
            <span className="text-[10px] uppercase text-gray-500 tracking-widest block mb-1">SELECTED MODEL</span>
            <span className="text-[#e5c384] font-light text-lg">{selectedRing.name}</span>
            <p className="text-xs text-gray-400 mt-2 font-mono">{selectedRing.estimatedValuation} USD • {selectedRing.certificateId}</p>
          </div>
        </div>
      )}


      {/* =========================================================================
          3. DYNAMIC LEFT NARRATIVE PANEL (SCENE 1 & 2 OVERLAYS)
          ========================================================================= */}
      <main className="absolute inset-x-0 top-32 bottom-32 w-full flex items-center justify-between p-6 md:px-12 pointer-events-none">
        
        {/* Dynamic description of Selected Catalog Ring */}
        <div className="max-w-[420px] w-full pointer-events-auto z-10 transition-all duration-700 select-text translate-x-0 opacity-100 self-center">
          <div className="glass p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/[0.08] backdrop-blur-xl transition-all duration-300 hover:scale-[1.01]">
            
            {/* Elegant upper copper corner glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#e5c384]/8 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-[#e5c384]" />
              <span className="text-[9px] tracking-[0.4em] text-[#e5c384] font-semibold uppercase">
                {selectedRing.badge}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-1 leading-tight uppercase relative">
              {selectedRing.name}
            </h2>
            <p className="text-xs md:text-sm text-[#e5c384]/90 font-light italic mb-5 leading-normal">
              "{selectedRing.subtitle}"
            </p>

            <p className="text-xs md:text-sm text-white/70 leading-relaxed font-light mb-6">
              {selectedRing.description}
            </p>

            {/* Details Bullet rows */}
            <div className="space-y-3.5">
              {selectedRing.details.map((detail, i) => (
                <div key={i} className="flex items-start gap-3 text-[11px] text-white/60 font-light leading-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e5c384] mt-1.5 shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            {/* Segment Info Footer */}
            <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-white/40 tracking-widest font-mono">
              <span className="uppercase">SCENE 0{activeNarrativeIdx + 1} • {activeNarrativeIdx === 0 ? 'REVEAL' : (activeNarrativeIdx === 1 ? 'REFRACTION' : 'ATELIER')}</span>
              <span className="text-[#e5c384] uppercase font-bold">{selectedRing.metal === 'platinum' ? 'Pt-950' : '18K Gold'}</span>
            </div>
          </div>
        </div>

        {/* Right side interaction navigation helper cards */}
        <div className="absolute right-6 md:right-12 flex flex-col items-center space-y-6 z-10 pointer-events-auto">
          
          {/* Scroll progress markers */}
          <div className="flex flex-col items-center space-y-4 bg-black/40 border border-white/5 p-3 rounded-full backdrop-blur-md shadow-2xl">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => {
                  window.scrollTo({
                    top: idx * (document.documentElement.scrollHeight / 3.05 || window.innerHeight * 1.02),
                    behavior: 'smooth'
                  });
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                  activeNarrativeIdx === idx 
                    ? 'bg-[#e5c384] scale-125 shadow-[0_0_12px_rgba(229,195,132,0.9)]' 
                    : 'bg-gray-700 hover:bg-gray-400'
                }`}
                title={`Scene 0${idx + 1}`}
              />
            ))}
          </div>

          {/* Sparkler Hover status billboard card */}
          <div className={`hidden md:flex flex-col items-center glass p-4 rounded-xl text-center border transition-all duration-300 max-w-[110px] ${
            isCanvasHovered ? 'border-[#e5c384]/50 shadow-[0_0_15px_rgba(229,195,132,0.25)] bg-[#e5c384]/5' : 'border-white/5 bg-black/30'
          }`}>
            <Sparkles className={`w-5 h-5 mb-2 ${isCanvasHovered ? 'text-[#e5c384] animate-pulse scale-110' : 'text-gray-500'}`} />
            <span className="text-[8px] uppercase tracking-widest text-gray-400 leading-tight font-medium">
              {isCanvasHovered ? 'REFRACTION BOOM' : 'HOVER TO SPARKLE'}
            </span>
          </div>

          {/* Interactive Drag Orbit reminder card */}
          <div className="hidden md:flex flex-col items-center glass p-4 rounded-xl text-center border border-white/5 bg-black/30 max-w-[110px]">
            <Compass className="w-5 h-5 mb-2 text-gray-400 rotate-45 animate-spin-slow" />
            <span className="text-[8px] uppercase tracking-widest text-gray-400 leading-tight font-medium">
              DRAG CANVAS TO ROTATE
            </span>
          </div>
        </div>

      </main>


      {/* =========================================================================
          4. THE HORIZONTAL CATALOG CAROUSEL BAR SHOWCASING ALL 12 DESIGNS (SCENE 1 & 2)
          ========================================================================= */}
      <section 
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-6 pointer-events-auto z-30 transition-all duration-700 ease-out"
        style={{
          transform: scrollProgress >= 0.65 ? 'translate(-50%, 150%)' : 'translate(-50%, 0)',
          opacity: scrollProgress >= 0.65 ? 0 : 1,
          pointerEvents: scrollProgress >= 0.65 ? 'none' : 'auto'
        }}
      >
        <div className="glass p-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-[9px] uppercase tracking-[0.3em] font-medium text-gray-400">
              EXPLORE OUR MASTERPIECE SHOWROOM ({SHOWROOM_RINGS.length} IN COMPARISON)
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#e5c384] font-bold">
              CLICK MODEL TO INSPECT
            </span>
          </div>

          {/* Carousel wrapper */}
          <div 
            ref={carouselContainerRef}
            className="flex items-center space-x-3 overflow-x-auto scroll-smooth scrollbar-none py-1 px-1 select-none"
          >
            {SHOWROOM_RINGS.map((ring, idx) => {
              const isSelected = idx === activeRingIndex;
              return (
                <button
                  key={ring.id}
                  onClick={() => {
                    setActiveRingIndex(idx);
                    // Force pre-populate customized options with selection defaults
                    setCustomization({
                      metal: ring.metal,
                      cut: ring.cut,
                      engraving: '',
                      glowIntensity: 0.0
                    });
                  }}
                  className={`flex-none w-44 p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-[#e5c384] bg-[#e5c384]/10 shadow-[0_0_15px_rgba(229,195,132,0.2)]'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] uppercase tracking-wider text-[#e5c384] font-semibold">
                      {ring.id === 'wedding_band' ? 'ETERNITY' : ring.gemType.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] font-mono font-light text-gray-400">{ring.estimatedValuation}</span>
                  </div>

                  <h4 className="text-xs font-semibold tracking-wide text-white truncate max-w-full uppercase">
                    {ring.name}
                  </h4>
                  <span className="text-[8px] uppercase text-gray-400 tracking-widest block truncate">
                    {ring.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>


      {/* =========================================================================
          5. SCENE 3 ATELIER WORKBENCH CUSTOMIZATION PANEL (ELEVATES ON SCROLL 65%+)
          ========================================================================= */}
      <div 
        id="luxury-customizer-panel" 
        className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-gradient-to-t from-black via-[#050508]/99 to-transparent border-t border-white/[0.08] p-6 md:p-10 pointer-events-auto z-40 transition-all duration-700 ease-out select-text shadow-[0_-30px_60px_-10px_rgba(0,0,0,0.9)] rounded-t-3xl backdrop-blur-2xl"
        style={{
          transform: scrollProgress >= 0.65 ? 'translateY(0)' : 'translateY(105%)',
          opacity: scrollProgress >= 0.65 ? 1 : 0,
          pointerEvents: scrollProgress >= 0.65 ? 'auto' : 'none'
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Customizer Selection Options */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <span className="bg-[#e5c384]/15 text-[#e5c384] text-[9px] tracking-[0.35em] uppercase font-bold px-3 py-1 rounded border border-[#e5c384]/25 animate-pulse">
                  SECTION 03
                </span>
                <span className="text-xs tracking-widest text-gray-400 font-mono uppercase">BESPOKE WORKBENCH</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-light tracking-wide text-white glow-text mb-2.5 uppercase">
                TAILOR MASTERPIECE: {selectedRing.name}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light max-w-2xl mb-8">
                You are fine-tuning the base specifications for the <span className="text-[#e5c384] font-medium italic">"{selectedRing.name}"</span> concept. Override the default metals or gemstone facets underneath and secure your Golden certificate code.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* A. Metal core manager */}
                <div className="flex flex-col space-y-4 text-left">
                  <label className="text-xs text-gray-300 tracking-widest font-semibold uppercase">
                    SELECT CORE METAL MATRIX
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    
                    {/* Platinum Option */}
                    <button
                      onClick={() => handleMetalChange('platinum')}
                      className={`relative flex flex-col items-center p-3.5 rounded-lg border text-center transition-all cursor-pointer ${
                        customization.metal === 'platinum'
                          ? 'border-[#e5c384] bg-[#e5c384]/10 shadow-[0_0_15px_rgba(229,195,132,0.18)] text-white'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-400 via-gray-200 to-white border border-white/40 mb-2 shadow-inner" />
                      <span className="text-[9px] font-medium tracking-widest">PLATINUM</span>
                    </button>

                    {/* Yellow gold Option */}
                    <button
                      onClick={() => handleMetalChange('gold')}
                      className={`relative flex flex-col items-center p-3.5 rounded-lg border text-center transition-all cursor-pointer ${
                        customization.metal === 'gold'
                          ? 'border-[#e5c384] bg-[#e5c384]/10 shadow-[0_0_15px_rgba(229,195,132,0.18)] text-white'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 via-[#e5c384] to-amber-200 border border-amber-300/40 mb-2 shadow-inner" />
                      <span className="text-[9px] font-medium tracking-widest">18K GOLD</span>
                    </button>

                    {/* Rose gold Option */}
                    <button
                      onClick={() => handleMetalChange('rosegold')}
                      className={`relative flex flex-col items-center p-3.5 rounded-lg border text-center transition-all cursor-pointer ${
                        customization.metal === 'rosegold'
                          ? 'border-[#e5c384] bg-[#e5c384]/10 shadow-[0_0_15px_rgba(229,195,132,0.18)] text-white'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-500 via-pink-300 to-red-100 border border-red-300/40 mb-2 shadow-inner" />
                      <span className="text-[9px] font-medium tracking-widest">ROSE GOLD</span>
                    </button>

                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                    Changing the core component recalculates metallic specular maps, clearcoat highlights, and refraction dispersion coefficients inside the WebGL context dynamically.
                  </p>
                </div>

                {/* B. Cut overriding manager (Only active if center diamond is present / not flat) */}
                <div className="flex flex-col space-y-4 text-left">
                  <label className="text-xs text-gray-300 tracking-widest font-semibold uppercase">
                    CHOOSE GEM PRISM CUT
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'solitaire', label: 'Classic Round', desc: 'Ideal Symmetry' },
                      { key: 'emerald', label: 'Emerald Step', desc: 'Stepped Mirror Steps' },
                      { key: 'princess', label: 'Princess Square', desc: 'Inverted Pavilion' },
                      { key: 'heart', label: 'Heart Romantica', desc: 'Romantic Arcs' }
                    ].map((item) => {
                      const isSelected = customization.cut === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleCutChange(item.key as DiamondCut)}
                          className={`relative flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#e5c384] bg-[#e5c384]/10 shadow-[0_0_15px_rgba(229,195,132,0.18)] text-white'
                              : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-gray-400 hover:text-white'
                          }`}
                        >
                          <span className="text-[11px] font-semibold tracking-wider block mb-0.5 whitespace-nowrap">
                            {item.label}
                          </span>
                          <span className="text-[9px] text-[#e5c384]/70 font-light block uppercase tracking-widest">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                    Each diamond cut shifts the facet mesh parameters, modifying vertex normal structures for dramatic light break dispersion.
                  </p>
                </div>

              </div>

              {/* C. Engraving plate customization */}
              <div className="mt-8 flex flex-col space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-300 tracking-widest font-semibold uppercase">
                    LASER INTERNAL BAND ENGRAVING
                  </label>
                  <span className="text-[10px] font-mono text-gray-500">
                    {18 - engravingText.length} CHARACTER LIMIT
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={engravingText}
                    onChange={handleEngravingInput}
                    placeholder="ENTER ENGRAVING MESSAGE (E.G. 'INFINITE BOND')"
                    className="w-full bg-white/[0.03] border border-white/10 focus:border-[#e5c384] px-5 py-3.5 text-sm tracking-widest placeholder-gray-600 focus:outline-none rounded-lg text-white font-mono transition-colors"
                  />
                  <div className="absolute right-4 top-4.5 flex items-center gap-1.5 text-[8px] text-[#e5c384] tracking-widest font-mono select-none font-bold">
                    <Check size={11} /> LIVE ATELIER SYNC
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right valuation and acquisition billing summary card */}
          <div className="lg:col-span-4 glass p-6 md:p-8 relative overflow-hidden h-full flex flex-col justify-between rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#e5c384]/8 rounded-full blur-2xl" />

            <div className="text-left">
              <span className="text-[9px] uppercase tracking-widest text-[#e5c384] font-semibold mb-1 block">
                VALUATION EST.
              </span>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extralight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#ffd995] to-[#e5c384]">
                  {selectedRing.estimatedValuation}
                </span>
                <span className="text-xs text-gray-400 tracking-widest font-light font-mono">USD</span>
              </div>

              <div className="border-t border-white/[0.08] py-5 space-y-3.5">
                <div className="flex items-center justify-between text-xs tracking-wider">
                  <span className="text-gray-400 font-light">Custom Metal</span>
                  <span className="text-white capitalize font-mono font-light tracking-wide">{customization.metal}</span>
                </div>
                <div className="flex items-center justify-between text-xs tracking-wider">
                  <span className="text-gray-400 font-light">Diamond Gem facets</span>
                  <span className="text-white capitalize font-mono font-light tracking-wide">{cutLabels[customization.cut] || customization.cut}</span>
                </div>
                <div className="flex items-center justify-between text-xs tracking-wider">
                  <span className="text-gray-400 font-light">Chromatic Refraction</span>
                  <span className="text-[#e5c384] font-mono font-semibold">IOR {selectedRing.ior}</span>
                </div>
                <div className="flex items-center justify-between text-xs tracking-wider">
                  <span className="text-gray-400 font-light">Authenticity Certificate</span>
                  <span className="text-white/80 font-light text-[10px] tracking-widest font-mono">{selectedRing.certificateId}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col space-y-4">
              <button
                onClick={executeAcquisition}
                className="w-full gold-grad text-black font-bold tracking-[0.3em] text-[10px] uppercase px-6 py-4 rounded-none shadow-lg transition-all duration-300 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                REQUEST ACQUISITION <Sparkles size={12} className="text-black" />
              </button>
              
              <p className="text-[9px] text-gray-500 text-center uppercase tracking-widest font-light leading-normal">
                Authenticity code and GIA specs will accompany delivery. Checked via Aetheria Escrow.
              </p>
            </div>

          </div>

        </div>
      </div>


      {/* =========================================================================
          6. ACQUISITION CONCIERGE SUCCESS TOAST MODAL
          ========================================================================= */}
      <div 
        className="fixed top-24 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-black/98 border border-[#e5c384]/40 p-5 rounded-xl shadow-2xl z-50 transition-all duration-500 pointer-events-auto flex items-start gap-4 text-left"
        style={{
          opacity: purchaseSuccess ? 1 : 0,
          transform: purchaseSuccess ? 'translate(-50%, 0)' : 'translate(-50%, -40px)',
          visibility: purchaseSuccess ? 'visible' : 'hidden'
        }}
      >
        <div className="bg-[#e5c384]/10 p-3 border border-[#e5c384]/20 rounded-lg shrink-0">
          <Heart className="w-5 h-5 text-[#e5c384] animate-pulse" />
        </div>
        <div className="select-text">
          <h4 className="text-sm font-semibold tracking-wider text-[#e5c384] uppercase mb-1">CONCIERGE CONTACT SENT</h4>
          <p className="text-xs text-gray-300 font-light leading-relaxed">
            Our private joaillerie advisors have received your customized <span className="text-white font-medium">{selectedRing.name}</span> order. 
            Specifications: <span className="text-white font-medium">{customization.metal} metal</span>, <span className="text-white font-medium">{customization.cut} facet-cut</span>, internal engraving: <span className="text-white font-mono font-medium">"{customization.engraving ? customization.engraving : 'NONE'}"</span>. We will follow up via email within 2 hours.
          </p>
        </div>
      </div>


      {/* =========================================================================
          7. EDITORIAL LUXURY WATERMARK PROFILE SIGNATURE
          ========================================================================= */}
      <div 
        className="fixed bottom-6 left-6 md:left-12 flex flex-col text-left select-none pointer-events-none text-white/30 z-30 transition-all duration-700 font-light"
        style={{
          transform: scrollProgress >= 0.65 ? 'translateY(150%)' : 'translateY(0)',
          opacity: scrollProgress >= 0.65 ? 0 : 1,
        }}
      >
        <span className="text-[10px] uppercase font-bold tracking-[0.35em] text-[#e5c384]/50 leading-tight">AETHERIA</span>
        <span className="text-[7.5px] uppercase tracking-[0.25em] mb-1.5 text-white/15">Haute Joaillerie</span>
        <span className="text-[7.5px] uppercase tracking-[0.15em] font-mono whitespace-nowrap text-white/25">A Luxury 3D Web Experience</span>
        <span className="text-[7.5px] uppercase tracking-[0.15em] text-[#e5c384]/65 mt-0.5 font-semibold text-neutral-400">Created by Srushti Ambre</span>
      </div>
    </>
  )}

</div>
  );
}
