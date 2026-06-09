import { ShowroomRing } from './types';

export const SHOWROOM_RINGS: ShowroomRing[] = [
  {
    id: 'solitaire',
    name: 'Celestial Solitaire',
    subtitle: 'Classic Solitaire Diamond Ring',
    badge: 'LUXURY MAESTRO',
    description: 'An iconic Tiffany-style masterpiece. A breathtaking, pristine 4.5-carat round brilliant cut solitaire diamond suspended in an elegant elevated 6-claw hand-polished cathedral basket wire setting, upon a classic comfort-fit rounded platinum band.',
    metal: 'platinum',
    cut: 'solitaire',
    gemType: 'diamond',
    gemColor: '#FFFFFF',
    ior: 2.417,
    estimatedValuation: '$31,800',
    certificateId: 'GIA-41982-SOL',
    details: [
      'Authentic 4.5 carat colorless D-flawless center diamond',
      'Solid hand-sculpted Platinum-950 curved 6-prong layout',
      'Engineered metal thickness with custom inner comfort bevel profile'
    ]
  },
  {
    id: 'halo',
    name: 'Auroral Halo',
    subtitle: 'Halo Shimmering Diamond Ring',
    badge: 'RADIANT GLOW',
    description: 'An architectural alignment of supreme brilliance. A stellar 2.8-carat round brilliant center diamond is cradled in 4 split-claws and encircled by a precise, scintillating crown halo of 18 microscopic hand-set accent pavé gemstones.',
    metal: 'gold',
    cut: 'solitaire',
    gemType: 'diamond',
    gemColor: '#FFFFFF',
    ior: 2.417,
    estimatedValuation: '$24,500',
    certificateId: 'GIA-12114-HAL',
    details: [
      '2.8 carat round brilliant center stone with triple excellent symmery',
      '18 micro-pavé halo diamonds (0.65 carat total weight)',
      'Subtle knife-edge solid 18k yellow gold band to intensify light refraction'
    ]
  },
  {
    id: 'emerald',
    name: 'Sovereign Emerald',
    subtitle: 'Stepped Emerald Cut Diamond Ring',
    badge: 'ARCHITECTURAL STEPS',
    description: 'The epitome of high-end Harry Winston style. A striking 5.0-carat rectangular stepped cut emerald diamond protected by corner double-claws (8 claws total) to secure the fragile bezel, set on an architectural flat-beveled heavy platinum comfort band.',
    metal: 'platinum',
    cut: 'emerald',
    gemType: 'diamond',
    gemColor: '#FFFFFF',
    ior: 2.417,
    estimatedValuation: '$42,000',
    certificateId: 'GIA-11102-EMD',
    details: [
      '5.0 carat emerald-cut VVS1 clarity ideal step-facet diamond',
      'Protective corner double-prong setting mirroring classic Cartier standards',
      'Ultra-thick flat double-beveled comfort band with high specular shine'
    ]
  },
  {
    id: 'princess',
    name: 'Duchess Princess',
    subtitle: 'Geometric Princess Cut Diamond Ring',
    badge: 'MODERN GEOMETRY',
    description: 'Sleek, contemporary, and incredibly bold. Cradling a spectacular 3.5-carat square princess-cut diamond, safeguarded by custom hand-welded solid 18k yellow gold V-prongs that perfectly seal the sharp, delicate corners of the faceted grid.',
    metal: 'gold',
    cut: 'princess',
    gemType: 'diamond',
    gemColor: '#EAFCFF',
    ior: 2.417,
    estimatedValuation: '$28,000',
    certificateId: 'GIA-84091-PRN',
    details: [
      '3.5 carat square princess cut with high inverted pavilion facets',
      'Solid 18k yellow gold heavy flat comfort-bevel band geometry',
      'Modern solid box basket under-gallery for a sleek industrial silhouette'
    ]
  },
  {
    id: 'vintage_engagement',
    name: 'Antiquarian Filigree',
    subtitle: 'Ornate Vintage Heirloom Ring',
    badge: 'HISTORIC ATELIER',
    description: 'Intricacy of the Edwardian era reimagined. Beautiful hand-engraved scrolling metal curls are embellished with fine milgrain beaded rails, cradling an old-world 3.2-carat oval diamond inside a handcrafted filigree under-gallery crown vault.',
    metal: 'gold',
    cut: 'oval',
    gemType: 'diamond',
    gemColor: '#FFFCEB',
    ior: 2.417,
    estimatedValuation: '$29,800',
    certificateId: 'GIA-23037-VNT',
    details: [
      '3.2 carat warm antique old-European oval-cut center diamond',
      'Decorative milgrain bead-wheels procedurally paved down the shoulders',
      'Handcrafted filigree gothic arches supporting the central basket frame'
    ]
  },
  {
    id: 'twisted_infinity',
    name: 'Infinity Braid',
    subtitle: 'Helical Twisted Infinity Ring',
    badge: 'INTERTWINED DESTINY',
    description: 'A poetic celebration of complete form. Infinite platinum braids intertwine to support a 2.5-carat brilliant round diamond - one strand high-polished, the other fully pavé-set with 24 microscopic micro-gems sparkling with absolute scintillation.',
    metal: 'platinum',
    cut: 'solitaire',
    gemType: 'diamond',
    gemColor: '#FFFFFF',
    ior: 2.417,
    estimatedValuation: '$26,900',
    certificateId: 'GIA-64492-INF',
    details: [
      '2.5 carat brilliant round center stone with 4 elegant rounded claws',
      '3D procedural braided helical rope band with physical thickness',
      '24 micro-gems paved in individual gold socket prongs along the spiral'
    ]
  },
  {
    id: 'double_halo',
    name: 'Orphean Sapphire',
    subtitle: 'Concentric Double Halo Sapphire Ring',
    badge: 'ROYAL HEIRLOOM',
    description: 'A majestic celestial alignment. A central, deep royal Ceylon blue faceted sapphire is cradled in 4 rounded platinum prongs and encircled by double concentric circular halos holding 30 shimmering pavé diamonds set flush in gold bead settings.',
    metal: 'platinum',
    cut: 'solitaire',
    gemType: 'sapphire',
    gemColor: '#305FFF',
    ior: 1.767,
    estimatedValuation: '$36,000',
    certificateId: 'GIA-59012-SAP',
    details: [
      '4.2 carat royal blue heated Ceylon faceted center sapphire',
      'Double concentric circular crowns holding 30 micro-diamonds',
      'Heavy double-split shank band that divides beautifully as it joins the crown'
    ]
  },
  {
    id: 'rosegold_heart',
    name: 'Amore Heart',
    subtitle: 'Romantic Rose Gold Heart Ring',
    badge: 'VALENTINE SYMPHONY',
    description: 'Delicate romance refined. A warm 18k rose gold bezel band, elegantly carrying a gorgeous 2.2-carat pink heart-shape diamond center stone inside a heart-shaped collar seat, flanked by 20 pave side diamonds tumbling along the comfort-fit core.',
    metal: 'rosegold',
    cut: 'heart',
    gemType: 'pink_diamond',
    gemColor: '#FFA3BF',
    ior: 2.435,
    estimatedValuation: '$22,800',
    certificateId: 'GIA-75130-HRT',
    details: [
      '2.2 carat custom pink heart shaped diamond center stone',
      'Comfort-fit 18k rose gold rounded core band with custom metal depth',
      '20 accent side-diamonds inlaid along high-sheen rose shoulder tracks'
    ]
  }
];
