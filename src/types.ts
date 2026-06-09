export type MetalType = 'platinum' | 'gold' | 'rosegold';
export type DiamondCut = 'solitaire' | 'emerald' | 'princess' | 'heart' | 'pear' | 'flat' | 'oval';

export interface ProductCustomization {
  metal: MetalType;
  cut: DiamondCut;
  engraving: string;
  glowIntensity: number;
}

export interface LuxurySection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  features: string[];
}

export interface ShowroomRing {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  metal: MetalType;
  cut: DiamondCut;
  gemType: 'diamond' | 'sapphire' | 'emerald' | 'pink_diamond' | 'none';
  gemColor: string; // Hex color or descriptive color
  ior: number;
  estimatedValuation: string;
  certificateId: string;
  badge: string;
  details: string[];
}
