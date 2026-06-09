import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ProductCustomization } from '../types';
import { SHOWROOM_RINGS } from '../data';

interface ThreeCanvasProps {
  activeRingIndex: number;
  customization: ProductCustomization;
  scrollProgress: number;
  onHoverStateChange: (isHovered: boolean) => void;
  introPhase: 'black' | 'particles' | 'reveal' | 'zoom' | 'brand' | 'ready';
  onIntroUpdate: (phase: 'black' | 'particles' | 'reveal' | 'zoom' | 'brand' | 'ready') => void;
  isCustomizing: boolean;
}

// Custom shaders for physical gemstone refraction, dispersive fire, and luxury glint
const DIAMOND_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vEyeVec;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vEyeVec = worldPos.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const DIAMOND_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uGlowIntensity;
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uIOR;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vEyeVec;
  varying vec2 vUv;

  // Cinematic studio reflection environment map simulator
  vec3 sampleJewelryEnv(vec3 dir) {
    vec3 lights = vec3(0.006, 0.006, 0.015); // Velvet black backdrop background shadow

    // Key spotlight (Overhead warm studio light)
    float keyLight = smoothstep(0.70, 0.99, dot(dir, normalize(vec3(0.5, 1.8, 0.3))));
    lights += vec3(1.0, 0.96, 0.86) * keyLight * 2.9;

    // Side rim light (Cool platinum shine)
    float rimLight = smoothstep(0.60, 0.98, dot(dir, normalize(vec3(-0.8, -0.8, -0.6))));
    lights += vec3(0.78, 0.91, 1.00) * rimLight * 2.0;

    // Ambient warm fill shine
    float sideLight = smoothstep(0.40, 0.92, dot(dir, normalize(vec3(0.9, -0.2, 0.9))));
    lights += vec3(0.96, 0.68, 0.42) * sideLight * 0.85;

    // micro-facet sparkling glint solver
    float sparkles = pow(max(0.0, dot(dir, normalize(vec3(cos(uTime * 0.4), sin(uTime * 0.2), -0.5)))), 96.0);
    lights += vec3(1.0, 1.0, 1.0) * sparkles * (4.2 + uGlowIntensity * 6.5);

    return lights;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vEyeVec);

    // Reflective surface flash
    vec3 reflectDir = reflect(viewDir, normal);
    vec3 reflectionColor = sampleJewelryEnv(reflectDir);

    // Chromatic Dispersion paths (refract R, G, B separately for dispersive luxury fire)
    float iorBase = 1.0 / (uIOR + uGlowIntensity * 0.04);
    float iorR = iorBase * 0.990;
    float iorG = iorBase * 1.000;
    float iorB = iorBase * 1.010;

    vec3 refractR = refract(viewDir, normal, iorR);
    vec3 refractG = refract(viewDir, normal, iorG);
    vec3 refractB = refract(viewDir, normal, iorB);

    vec3 refractionColor;
    refractionColor.r = sampleJewelryEnv(refractR).r;
    refractionColor.g = sampleJewelryEnv(refractG).g;
    refractionColor.b = sampleJewelryEnv(refractB).b;

    // Fresnel (Schlick approximation)
    float R0 = pow((1.0 - uIOR) / (1.0 + uIOR), 2.0);
    float fresnel = R0 + (1.0 - R0) * pow(1.0 - max(0.0, dot(normal, -viewDir)), 5.0);

    // Combine refraction, environment gloss, and gemstone tint
    vec3 finalGemColor = mix(refractionColor * uColor, reflectionColor, fresnel);

    // High frequency sparkle glitter pop
    float sparkleHighlight = pow(max(0.0, dot(reflectDir, normalize(vec3(0.2, 1.0, 0.4)))), 150.0);
    finalGemColor += vec3(1.0, 0.98, 0.96) * sparkleHighlight * (3.5 + uGlowIntensity * 5.0);

    // Inner glow
    finalGemColor += uColor * 0.08 * (1.0 + uGlowIntensity * 2.0);

    gl_FragColor = vec4(finalGemColor, 1.0);
  }
`;

// Procedural high-fidelity gemstone vertex model builder with complex facets
function generateDiamondGeometry(cut: string): THREE.BufferGeometry {
  const mergedGeom = new THREE.BufferGeometry();

  if (cut === 'emerald') {
    const verticesList: number[] = [];
    const indicesList: number[] = [];

    // Table plate: Y = 0.32
    verticesList.push(-0.24, 0.32, -0.32); // 0
    verticesList.push( 0.24, 0.32, -0.32); // 1
    verticesList.push( 0.24, 0.32,  0.32); // 2
    verticesList.push(-0.24, 0.32,  0.32); // 3

    // Crown Step 1: Y = 0.15
    verticesList.push(-0.36, 0.15, -0.44); // 4
    verticesList.push( 0.36, 0.15, -0.44); // 5
    verticesList.push( 0.36, 0.15,  0.44); // 6
    verticesList.push(-0.36, 0.15,  0.44); // 7

    // Girdle plane: Y = 0.0
    verticesList.push(-0.48, 0.0, -0.56); // 8
    verticesList.push( 0.48, 0.0, -0.56); // 9
    verticesList.push( 0.48, 0.0,  0.56); // 10
    verticesList.push(-0.48, 0.0,  0.56); // 11

    // Pavilion Step: Y = -0.28
    verticesList.push(-0.30, -0.28, -0.38); // 12
    verticesList.push( 0.30, -0.28, -0.38); // 13
    verticesList.push( 0.30, -0.28,  0.38); // 14
    verticesList.push(-0.30, -0.28,  0.38); // 15

    // Culet point: Y = -0.52
    verticesList.push(-0.04, -0.52, -0.06); // 16
    verticesList.push( 0.04, -0.52, -0.06); // 17
    verticesList.push( 0.04, -0.52,  0.06); // 18
    verticesList.push(-0.04, -0.52,  0.06); // 19

    // Build Step Facets
    indicesList.push(0, 2, 1); indicesList.push(0, 3, 2); // Table plate
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      indicesList.push(i, i + 4, next + 4); indicesList.push(i, next + 4, next); // Crown Upper
      indicesList.push(i + 4, i + 8, next + 8); indicesList.push(i + 4, next + 8, next + 4); // Crown Lower
      indicesList.push(i + 8, i + 12, next + 12); indicesList.push(i + 8, next + 12, next + 8); // Pavilion Upper
      indicesList.push(i + 12, i + 16, next + 16); indicesList.push(i + 12, next + 16, next + 12); // Pavilion Lower
    }
    // Culet cap
    indicesList.push(16, 17, 18); indicesList.push(16, 18, 19);

    mergedGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verticesList), 3));
    mergedGeom.setIndex(indicesList);
  } else if (cut === 'princess') {
    const vertices: number[] = [];
    const indices: number[] = [];

    // Table plate Y = 0.32
    vertices.push(-0.28, 0.32, -0.28); // 0
    vertices.push( 0.28, 0.32, -0.28); // 1
    vertices.push( 0.28, 0.32,  0.28); // 2
    vertices.push(-0.28, 0.32,  0.28); // 3

    // Girdle outer flange Y = 0.02
    vertices.push(-0.48, 0.02, -0.48); // 4
    vertices.push( 0.48, 0.02, -0.48); // 5
    vertices.push( 0.48, 0.02,  0.48); // 6
    vertices.push(-0.48, 0.02,  0.48); // 7

    // Lower facet pyramid step Y = -0.26
    vertices.push(-0.24, -0.26, -0.24); // 8
    vertices.push( 0.24, -0.26, -0.24); // 9
    vertices.push( 0.24, -0.26,  0.24); // 10
    vertices.push(-0.24, -0.26,  0.24); // 11

    // Pavilion bottom tip Y = -0.58
    vertices.push(0.0, -0.58, 0.0); // 12

    // Facet geometry indices
    indices.push(0, 2, 1); indices.push(0, 3, 2);
    for (let i = 0; i < 4; i++) {
       const next = (i + 1) % 4;
       indices.push(i, i + 4, next + 4); indices.push(i, next + 4, next);
       indices.push(i + 4, i + 8, next + 8); indices.push(i + 4, next + 8, next + 4);
       indices.push(i + 8, 12, next + 8);
    }

    mergedGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    mergedGeom.setIndex(indices);
  } else if (cut === 'heart') {
    const vertices: number[] = [];
    const indices: number[] = [];
    const steps = 16;
    const yTable = 0.32, yGirdle = 0.0, yCulet = -0.54;

    // Outer heart equations for luxurious concentric profiles
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = Math.sin(angle) * Math.sin(angle) * Math.sin(angle);
      const z = (13.0 * Math.cos(angle) - 5.0 * Math.cos(2.0*angle) - 2.0 * Math.cos(3.0*angle) - Math.cos(4.0*angle)) / 16.0;
      vertices.push(x * 0.32, yTable, -z * 0.32 - 0.06);
    }
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = Math.sin(angle) * Math.sin(angle) * Math.sin(angle);
      const z = (13.0 * Math.cos(angle) - 5.0 * Math.cos(2.0*angle) - 2.0 * Math.cos(3.0*angle) - Math.cos(4.0*angle)) / 16.0;
      vertices.push(x * 0.54, yGirdle, -z * 0.54 - 0.06);
    }
    vertices.push(0, yCulet, -0.06); // Culet point at center bottom

    const topOffset = 0;
    const midOffset = steps;
    const culetIndex = steps * 2;

    for (let i = 0; i < steps; i++) {
      const next = (i + 1) % steps;
      indices.push(topOffset + i, midOffset + i, midOffset + next);
      indices.push(topOffset + i, midOffset + next, topOffset + next);
      indices.push(midOffset + i, culetIndex, midOffset + next);
    }
    for (let i = 1; i < steps - 1; i++) {
      indices.push(0, i + 1, i);
    }

    mergedGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    mergedGeom.setIndex(indices);
  } else if (cut === 'pear') {
    const vertices: number[] = [];
    const indices: number[] = [];
    const steps = 16;
    const yTable = 0.32, yGirdle = 0.0, yCulet = -0.56;

    // Classic pear design geometry lines
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const x = Math.sin(t) * (1.1 - Math.cos(t) * 0.5);
      const z = -Math.cos(t) * 1.35;
      vertices.push(x * 0.22, yTable, z * 0.22);
    }
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const x = Math.sin(t) * (1.1 - Math.cos(t) * 0.5);
      const z = -Math.cos(t) * 1.35;
      vertices.push(x * 0.38, yGirdle, z * 0.38);
    }
    vertices.push(0, yCulet, 0); // Bottom Culet

    const topOffset = 0;
    const midOffset = steps;
    const culetIndex = steps * 2;

    for (let i = 0; i < steps; i++) {
      const next = (i + 1) % steps;
      indices.push(topOffset + i, midOffset + i, midOffset + next);
      indices.push(topOffset + i, midOffset + next, topOffset + next);
      indices.push(midOffset + i, culetIndex, midOffset + next);
    }
    for (let i = 1; i < steps - 1; i++) {
      indices.push(0, i + 1, i);
    }

    mergedGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    mergedGeom.setIndex(indices);
  } else if (cut === 'oval') {
    const vertices: number[] = [];
    const indices: number[] = [];
    const steps = 14;
    const yTable = 0.30, yGirdle = 0.0, yCulet = -0.54;

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      vertices.push(Math.cos(angle) * 0.44, yTable, Math.sin(angle) * 0.30);
    }
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      vertices.push(Math.cos(angle) * 0.64, yGirdle, Math.sin(angle) * 0.44);
    }
    vertices.push(0, yCulet, 0);

    const topOffset = 0;
    const midOffset = steps;
    const culetIndex = steps * 2;

    for (let i = 0; i < steps; i++) {
      const next = (i + 1) % steps;
      indices.push(topOffset + i, midOffset + i, midOffset + next);
      indices.push(topOffset + i, midOffset + next, topOffset + next);
      indices.push(midOffset + i, culetIndex, midOffset + next);
    }
    for (let i = 1; i < steps - 1; i++) {
      indices.push(0, i + 1, i);
    }

    mergedGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    mergedGeom.setIndex(indices);
  } else {
    // Standard round brilliant cut (32 magnificent facet pairings)
    const verticesList: number[] = [];
    const indicesList: number[] = [];
    const facets = 18;

    for (let i = 0; i < facets; i++) {
      const angle = (i / facets) * Math.PI * 2;
      verticesList.push(Math.cos(angle) * 0.33, 0.32, Math.sin(angle) * 0.33); // upper facet table boundary
    }
    for (let i = 0; i < facets; i++) {
      const angle = (i / facets) * Math.PI * 2;
      verticesList.push(Math.cos(angle) * 0.54, 0.04, Math.sin(angle) * 0.54); // girdle top rim
    }
    for (let i = 0; i < facets; i++) {
      const angle = (i / facets) * Math.PI * 2;
      verticesList.push(Math.cos(angle) * 0.54, -0.04, Math.sin(angle) * 0.54); // girdle bottom rim
    }
    verticesList.push(0, -0.56, 0); // bottom tip pavilion culet

    const topOffset = 0;
    const r1Offset = facets;
    const r2Offset = facets * 2;
    const culetIndex = facets * 3;

    for (let i = 0; i < facets; i++) {
      const next = (i + 1) % facets;
      indicesList.push(topOffset + i, r1Offset + i, r1Offset + next);
      indicesList.push(topOffset + i, r1Offset + next, topOffset + next);
      indicesList.push(r1Offset + i, r2Offset + i, r2Offset + next);
      indicesList.push(r1Offset + i, r2Offset + next, r1Offset + next);
      indicesList.push(r2Offset + i, culetIndex, r2Offset + next);
    }
    for (let i = 1; i < facets - 1; i++) {
      indicesList.push(0, i + 1, i);
    }

    mergedGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verticesList), 3));
    mergedGeom.setIndex(indicesList);
  }

  const nonIndexedGeom = mergedGeom.toNonIndexed();
  nonIndexedGeom.computeVertexNormals();
  return nonIndexedGeom;
}

// =========================================================================
// HIGH-FIDELITY COMFORT-THICKNESS BAND LATHE GENERATORS
// =========================================================================

// Style 1: Comfort-fit heavy round dome band (Cartier/Tiffany Style)
function createClassicDomeBandGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const rInner = 0.95; // ring hole radius
  const rOuter = 1.15; // outside diameter at top center
  const halfWidth = 0.09;
  const segments = 12;

  // Comfort inner curve
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -halfWidth + 2 * halfWidth * t;
    const x = rInner + 0.015 * Math.sin(t * Math.PI); // slight inner bevel curve
    points.push(new THREE.Vector2(x, y));
  }
  // Curved dome outer surface
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const y = -halfWidth + 2 * halfWidth * t;
    const x = rOuter - 0.04 * (1.0 - Math.sin(t * Math.PI)); // dome slope profile
    points.push(new THREE.Vector2(x, y));
  }
  points.push(points[0].clone()); // seal the loop
  const geom = new THREE.LatheGeometry(points, 64);
  geom.computeVertexNormals();
  return geom;
}

// Style 2: Sharp knife-edge band geometry
function createKnifeEdgeBandGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const rInner = 0.95;
  const rOuter = 1.16;
  const halfWidth = 0.085;
  const segments = 12;

  // comfort inner curve
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -halfWidth + 2 * halfWidth * t;
    const x = rInner + 0.01 * Math.sin(t * Math.PI);
    points.push(new THREE.Vector2(x, y));
  }
  // Sharp outer edge pointing outward
  points.push(new THREE.Vector2(rInner + 0.03, halfWidth));
  points.push(new THREE.Vector2(rOuter, 0.0));
  points.push(new THREE.Vector2(rInner + 0.03, -halfWidth));
  points.push(points[0].clone());

  const geom = new THREE.LatheGeometry(points, 64);
  geom.computeVertexNormals();
  return geom;
}

// Style 3: Flat-beveled heavy comfort band (Bulgari layout)
function createFlatBeveledBandGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const rInner = 0.95;
  const rOuter = 1.14;
  const halfWidth = 0.11;
  const segments = 12;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -halfWidth + 2 * halfWidth * t;
    const x = rInner + 0.012 * Math.sin(t * Math.PI);
    points.push(new THREE.Vector2(x, y));
  }
  // Sharp outer beveled blocks
  const chamfer = 0.02;
  points.push(new THREE.Vector2(rInner + 0.04, halfWidth));
  points.push(new THREE.Vector2(rOuter - chamfer, halfWidth));
  points.push(new THREE.Vector2(rOuter, halfWidth - chamfer));
  points.push(new THREE.Vector2(rOuter, -halfWidth + chamfer));
  points.push(new THREE.Vector2(rOuter - chamfer, -halfWidth));
  points.push(new THREE.Vector2(rInner + 0.04, -halfWidth));
  points.push(points[0].clone());

  const geom = new THREE.LatheGeometry(points, 64);
  geom.computeVertexNormals();
  return geom;
}

// =========================================================================
// BENT CLAW AND BASKET GENERATOR UTILITIES
// =========================================================================
function createCurvedProng(start: THREE.Vector3, end: THREE.Vector3, control: THREE.Vector3, radius: number, metalMat: THREE.Material) {
  const prongGroup = new THREE.Group();
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);
  const geom = new THREE.TubeGeometry(curve, 16, radius, 8, false);
  const tubeMesh = new THREE.Mesh(geom, metalMat);
  tubeMesh.castShadow = true;
  prongGroup.add(tubeMesh);

  // High-end jewelry polished claw bead caps
  const capGeom = new THREE.SphereGeometry(radius * 1.25, 10, 10);
  const capMesh = new THREE.Mesh(capGeom, metalMat);
  capMesh.position.copy(end);
  capMesh.castShadow = true;
  prongGroup.add(capMesh);

  return prongGroup;
}

// 1. Classical 6-prong Solitaire Cathedral Basket
function addSolitaireBasket(group: THREE.Group, metalMat: THREE.Material, parentY: number, scale: number = 0.58) {
  // Upper bezel collar ring seat (girdle bracket)
  const seatUpper = new THREE.Mesh(new THREE.TorusGeometry(0.32 * 2 * scale, 0.024 * scale, 8, 48), metalMat);
  seatUpper.position.set(0, parentY - 0.03 * scale, 0);
  seatUpper.rotation.x = Math.PI / 2;
  group.add(seatUpper);

  // Lower bezel collar support ring (under-gallery wire)
  const seatLower = new THREE.Mesh(new THREE.TorusGeometry(0.22 * 2 * scale, 0.018 * scale, 8, 48), metalMat);
  seatLower.position.set(0, parentY - 0.20 * scale, 0);
  seatLower.rotation.x = Math.PI / 2;
  group.add(seatLower);

  // Curved vertical support struts (realistic prongs)
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * Math.PI * 2;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    
    const pStart = new THREE.Vector3(ct * 0.21 * 2 * scale, parentY - 0.30 * scale, st * 0.21 * 2 * scale);
    const pControl = new THREE.Vector3(ct * 0.36 * 2 * scale, parentY - 0.08 * scale, st * 0.36 * 2 * scale);
    const pEnd = new THREE.Vector3(ct * 0.31 * 2 * scale, parentY + 0.16 * scale, st * 0.31 * 2 * scale);
    
    const prong = createCurvedProng(pStart, pEnd, pControl, 0.028 * scale, metalMat);
    group.add(prong);
  }
}

// 2. Halo beaded micro-stones framing tray setting
function addHaloBasket(group: THREE.Group, metalMat: THREE.Material, gemMat: THREE.Material, gemMeshList: THREE.Mesh[], parentY: number, scale: number = 0.58) {
  const haloOuterTorus = new THREE.Mesh(new THREE.TorusGeometry(0.48 * 2 * scale, 0.044 * scale, 12, 48), metalMat);
  haloOuterTorus.position.set(0, parentY - 0.015 * scale, 0);
  haloOuterTorus.rotation.x = Math.PI / 2;
  group.add(haloOuterTorus);

  const lowerStrutTorus = new THREE.Mesh(new THREE.TorusGeometry(0.30 * 2 * scale, 0.026 * scale, 8, 36), metalMat);
  lowerStrutTorus.position.set(0, parentY - 0.22 * scale, 0);
  lowerStrutTorus.rotation.x = Math.PI / 2;
  group.add(lowerStrutTorus);

  // Lateral scroll trellis braces
  for (let i = 0; i < 4; i++) {
    const theta = (i / 4) * Math.PI * 2;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const struts = createCurvedProng(
      new THREE.Vector3(0, parentY - 0.28 * scale, 0),
      new THREE.Vector3(ct * 0.44 * 2 * scale, parentY - 0.04 * scale, st * 0.44 * 2 * scale),
      new THREE.Vector3(ct * 0.20 * 2 * scale, parentY - 0.20 * scale, st * 0.20 * 2 * scale),
      0.024 * scale,
      metalMat
    );
    group.add(struts);
  }

  // 4 secure central claw supports holding the stone crown
  for (let i = 0; i < 4; i++) {
    const theta = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const prong = createCurvedProng(
      new THREE.Vector3(ct * 0.20 * 2 * scale, parentY - 0.14 * scale, st * 0.20 * 2 * scale),
      new THREE.Vector3(ct * 0.23 * 2 * scale, parentY + 0.18 * scale, st * 0.23 * 2 * scale),
      new THREE.Vector3(ct * 0.25 * 2 * scale, parentY, st * 0.25 * 2 * scale),
      0.025 * scale,
      metalMat
    );
    group.add(prong);
  }

  // Micro diamonds tray (18 stones)
  const count = 18;
  const miniGemGeom = generateDiamondGeometry('flat');
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2;
    const mx = Math.cos(theta) * 0.48 * 2 * scale;
    const mz = Math.sin(theta) * 0.48 * 2 * scale;

    const microGem = new THREE.Mesh(miniGemGeom, gemMat);
    microGem.scale.setScalar(0.04 * scale * 2);
    microGem.position.set(mx, parentY + 0.016 * scale, mz);
    microGem.rotation.x = Math.PI / 2;
    microGem.rotation.y = -theta;
    group.add(microGem);
    gemMeshList.push(microGem);

    // Micro metal beads pinning diamonds
    const bd1 = new THREE.Mesh(new THREE.SphereGeometry(0.015 * scale * 2, 4, 4), metalMat);
    bd1.position.set(Math.cos(theta + 0.09) * 0.52 * 2 * scale, parentY + 0.03 * scale, Math.sin(theta + 0.09) * 0.52 * 2 * scale);
    group.add(bd1);
  }
}

// 3. Double corner claw Emerald cut setting cage
function addEmeraldSetting(group: THREE.Group, metalMat: THREE.Material, parentY: number, scale: number = 0.58) {
  const cx = 0.48 * scale * 0.88; 
  const cz = 0.56 * scale * 0.88;
  const corners = [
    { x: cx, z: cz },
    { x: -cx, z: cz },
    { x: cx, z: -cz },
    { x: -cx, z: -cz }
  ];

  corners.forEach((c) => {
    const sx = Math.sign(c.x);
    const sz = Math.sign(c.z);
    
    // 2 double-claws per corner to preserve fragile emerald gemstone corners
    const angles = [-0.08, 0.08];
    angles.forEach((offsetAngle) => {
      const start = new THREE.Vector3(c.x * 0.75, parentY - 0.22 * scale, c.z * 0.75);
      const end = new THREE.Vector3(
        c.x + (offsetAngle * sz * 0.3) + (0.01 * sx),
        parentY + 0.14 * scale,
        c.z - (offsetAngle * sx * 0.3) + (0.01 * sz)
      );
      const control = new THREE.Vector3(
        (c.x + offsetAngle * sz * 0.45) * 1.12,
        parentY - 0.05 * scale,
        (c.z - offsetAngle * sx * 0.45) * 1.12
      );
      const doubleProngCurve = createCurvedProng(start, end, control, 0.024 * scale, metalMat);
      group.add(doubleProngCurve);
    });
  });

  const upperRectBar = new THREE.Mesh(new THREE.BoxGeometry(0.48 * 2 * scale * 0.9, 0.04 * scale, 0.56 * 2 * scale * 0.9), metalMat);
  upperRectBar.position.set(0, parentY - 0.05 * scale, 0);
  group.add(upperRectBar);

  const lowerRectBar = new THREE.Mesh(new THREE.BoxGeometry(0.38 * 2 * scale * 0.8, 0.03 * scale, 0.44 * 2 * scale * 0.8), metalMat);
  lowerRectBar.position.set(0, parentY - 0.20 * scale, 0);
  group.add(lowerRectBar);
}

// 4. V-Prong corner caps for Princess cut geometry
function addPrincessSetting(group: THREE.Group, metalMat: THREE.Material, parentY: number, scale: number = 0.58) {
  const factor = 0.48 * scale;
  const corners = [
    { x: factor, z: 0.0 },
    { x: -factor, z: 0.0 },
    { x: 0.0, z: factor },
    { x: 0.0, z: -factor }
  ]; 

  corners.forEach((c) => {
    let sx = Math.sign(c.x);
    let sz = Math.sign(c.z);
    if (sx === 0) sx = c.z > 0 ? 0.2 : -0.2;
    if (sz === 0) sz = c.x > 0 ? 0.2 : -0.2;
    
    // Construct V clamp A
    const prongA = createCurvedProng(
      new THREE.Vector3(c.x * 0.78, parentY - 0.22 * scale, c.z * 0.78),
      new THREE.Vector3(c.x + sx * 0.024, parentY + 0.12 * scale, c.z),
      new THREE.Vector3(c.x + sx * 0.046, parentY - 0.05 * scale, c.z + sz * 0.016),
      0.025 * scale,
      metalMat
    );
    group.add(prongA);

    // Construct V clamp B
    const prongB = createCurvedProng(
      new THREE.Vector3(c.x * 0.78, parentY - 0.22 * scale, c.z * 0.78),
      new THREE.Vector3(c.x, parentY + 0.12 * scale, c.z + sz * 0.024),
      new THREE.Vector3(c.x + sx * 0.016, parentY - 0.05 * scale, c.z + sz * 0.046),
      0.025 * scale,
      metalMat
    );
    group.add(prongB);
  });

  const seatBox = new THREE.Mesh(new THREE.BoxGeometry(0.38 * 2 * scale, 0.046 * scale, 0.38 * 2 * scale), metalMat);
  seatBox.position.set(0, parentY - 0.08 * scale, 0);
  seatBox.rotation.y = Math.PI / 4;
  group.add(seatBox);
}

// 5. Classic Ornate scroll milgrain filigree basket (Vintage layout)
function addVintageSetting(group: THREE.Group, metalMat: THREE.Material, parentY: number, scale: number = 0.58) {
  const supportSeat = new THREE.Mesh(new THREE.TorusGeometry(0.33 * 2 * scale, 0.028 * scale, 8, 36), metalMat);
  supportSeat.position.set(0, parentY - 0.06 * scale, 0);
  supportSeat.rotation.x = Math.PI / 2;
  group.add(supportSeat);

  // Gothic crown styled scroll bridges underneath
  const arches = 6;
  for (let i = 0; i < arches; i++) {
    const theta = (i / arches) * Math.PI * 2;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const scrollStrut = createCurvedProng(
      new THREE.Vector3(0, parentY - 0.25 * scale, 0),
      new THREE.Vector3(ct * 0.33 * 2 * scale, parentY - 0.05 * scale, st * 0.33 * 2 * scale),
      new THREE.Vector3(ct * 0.44 * 2 * scale, parentY - 0.16 * scale, st * 0.44 * 2 * scale),
      0.020 * scale,
      metalMat
    );
    group.add(scrollStrut);

    // Decorative vintage milgrain gold pearls
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.026 * scale, 6, 6), metalMat);
    bead.position.set(ct * 0.33 * 2 * scale, parentY - 0.11 * scale, st * 0.33 * 2 * scale);
    group.add(bead);
  }

  // 4 vintage claw leaf prongs supporting original old-european diamond
  for (let i = 0; i < 4; i++) {
    const theta = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const goldLeafProng = createCurvedProng(
      new THREE.Vector3(ct * 0.24 * 2 * scale, parentY - 0.15 * scale, st * 0.24 * 2 * scale),
      new THREE.Vector3(ct * 0.28 * 2 * scale, parentY + 0.15 * scale, st * 0.28 * 2 * scale),
      new THREE.Vector3(ct * 0.32 * 2 * scale, parentY, st * 0.32 * 2 * scale),
      0.025 * scale,
      metalMat
    );
    group.add(goldLeafProng);
  }
}

// 6. Hearts Romantic custom Rose Gold profile setting
function addRoseGoldHeartSetting(group: THREE.Group, metalMat: THREE.Material, parentY: number, scale: number = 0.58) {
  const steps = 32;
  const heartPathBezel = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const x = Math.sin(angle) * Math.sin(angle) * Math.sin(angle);
    const z = (13.0 * Math.cos(angle) - 5.0 * Math.cos(2.0*angle) - 2.0 * Math.cos(3.0*angle) - Math.cos(4.0*angle)) / 16.0;
    heartPathBezel.push(new THREE.Vector3(x * 0.40 * 2 * scale, parentY - 0.02 * scale, -z * 0.40 * 2 * scale));
  }
  const heartSpline = new THREE.CatmullRomCurve3(heartPathBezel);
  const heartBezelGeom = new THREE.TubeGeometry(heartSpline, 40, 0.028 * scale, 8, true);
  const heartBezel = new THREE.Mesh(heartBezelGeom, metalMat);
  group.add(heartBezel);

  // Structural diagonal brace poles
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 4;
    const ct = Math.cos(angle);
    const st = Math.sin(angle);
    const supportWire = createCurvedProng(
      new THREE.Vector3(0, parentY - 0.24 * scale, 0),
      new THREE.Vector3(ct * 0.30 * 2 * scale, parentY - 0.02 * scale, st * 0.30 * 2 * scale),
      new THREE.Vector3(ct * 0.16 * 2 * scale, parentY - 0.15 * scale, st * 0.16 * 2 * scale),
      0.024 * scale,
      metalMat
    );
    group.add(supportWire);
  }

  // 3 robust prongs holding heart shape
  const heartProngsList = [
    { start: new THREE.Vector3(0, parentY - 0.14 * scale, -0.38 * 2 * scale), end: new THREE.Vector3(0, parentY + 0.14 * scale, -0.42 * 2 * scale) }, // Bottom corner Tip prong
    { start: new THREE.Vector3(0.22 * 2 * scale, parentY - 0.14 * scale, 0.14 * 2 * scale), end: new THREE.Vector3(0.22 * 2 * scale, parentY + 0.14 * scale,  0.14 * 2 * scale) }, // Right upper lobe
    { start: new THREE.Vector3(-0.22 * 2 * scale, parentY - 0.14 * scale, 0.14 * 2 * scale), end: new THREE.Vector3(-0.22 * 2 * scale, parentY + 0.14 * scale,  0.14 * 2 * scale) } // Left upper lobe
  ];
  heartProngsList.forEach((pd) => {
    const pControl = pd.start.clone().lerp(pd.end, 0.5);
    pControl.x *= 1.25;
    pControl.z *= 1.25;
    const claw = createCurvedProng(pd.start, pd.end, pControl, 0.026 * scale, metalMat);
    group.add(claw);
  });
}

// 7. Double decker frame Sapphire royal setting
function addSapphireDoubleHaloSetting(group: THREE.Group, metalMat: THREE.Material, gemMat: THREE.Material, gemMeshList: THREE.Mesh[], parentY: number, scale: number = 0.58) {
  // Level 1: Inner ring
  const innerTray = new THREE.Mesh(new THREE.TorusGeometry(0.35 * 2 * scale, 0.03 * scale, 8, 36), metalMat);
  innerTray.position.set(0, parentY, 0);
  innerTray.rotation.x = Math.PI / 2;
  group.add(innerTray);

  // Level 2: Outer expanded ring
  const outerTray = new THREE.Mesh(new THREE.TorusGeometry(0.55 * 2 * scale, 0.03 * scale, 8, 48), metalMat);
  outerTray.position.set(0, parentY - 0.08 * scale, 0);
  outerTray.rotation.x = Math.PI / 2;
  group.add(outerTray);

  // Double scroll support lattices
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * Math.PI * 2;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const trellis = createCurvedProng(
      new THREE.Vector3(0, parentY - 0.28 * scale, 0),
      new THREE.Vector3(ct * 0.55 * 2 * scale, parentY - 0.08 * scale, st * 0.55 * 2 * scale),
      new THREE.Vector3(ct * 0.30 * 2 * scale, parentY - 0.22 * scale, st * 0.30 * 2 * scale),
      0.022 * scale,
      metalMat
    );
    group.add(trellis);
  }

  // 4 center claw anchors
  for (let i = 0; i < 4; i++) {
    const theta = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const prong = createCurvedProng(
      new THREE.Vector3(ct * 0.18 * 2 * scale, parentY - 0.12 * scale, st * 0.18 * 2 * scale),
      new THREE.Vector3(ct * 0.19 * 2 * scale, parentY + 0.16 * scale, st * 0.19 * 2 * scale),
      new THREE.Vector3(ct * 0.24 * 2 * scale, parentY, st * 0.24 * 2 * scale),
      0.024 * scale,
      metalMat
    );
    group.add(prong);
  }

  // Micro stones loops
  const flatGemGeom = generateDiamondGeometry('flat');

  // Outer ring: 18 brilliant white gems
  for (let i = 0; i < 18; i++) {
    const theta = (i / 18) * Math.PI * 2;
    const gem = new THREE.Mesh(flatGemGeom, gemMat);
    gem.scale.setScalar(0.036 * scale * 2);
    gem.position.set(Math.cos(theta) * 0.55 * 2 * scale, parentY - 0.065 * scale, Math.sin(theta) * 0.55 * 2 * scale);
    gem.rotation.x = Math.PI / 2;
    group.add(gem);
    gemMeshList.push(gem);
  }

  // Inner ring: 12 brilliant white gems
  for (let i = 0; i < 12; i++) {
    const theta = (i / 12) * Math.PI * 2 + 0.15;
    const gem = new THREE.Mesh(flatGemGeom, gemMat);
    gem.scale.setScalar(0.032 * scale * 2);
    gem.position.set(Math.cos(theta) * 0.35 * 2 * scale, parentY + 0.012 * scale, Math.sin(theta) * 0.35 * 2 * scale);
    gem.rotation.x = Math.PI / 2;
    group.add(gem);
    gemMeshList.push(gem);
  }
}

// 8. Specialized 3D spiral braided rope band generator (Twisted Infinity)
function createTwistedInfinityBandGroup(metalMat: THREE.Material, gemMat: THREE.Material, gemMeshList: THREE.Mesh[]): THREE.Group {
  const group = new THREE.Group();
  const steps = 96;
  const rMajor = 1.05;
  const rMinor = 0.055;
  const helixFrequency = 12.0;

  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);

    // Helicoid strand 1: Sol Polished Metal
    const h1x = ct * rMajor + Math.cos(t * helixFrequency) * rMinor;
    const h1y = st * rMajor + Math.sin(t * helixFrequency) * rMinor;
    const h1z = Math.cos(t * helixFrequency) * rMinor;

    const sph1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), metalMat);
    sph1.position.set(h1x, h1y, h1z);
    sph1.castShadow = true;
    group.add(sph1);

    // Helicoid strand 2: Fully micro-paved diamonds curve visible on front face
    const h2x = ct * rMajor - Math.cos(t * helixFrequency) * rMinor;
    const h2y = st * rMajor - Math.sin(t * helixFrequency) * rMinor;
    const h2z = -Math.cos(t * helixFrequency) * rMinor;

    if (st > -0.32) {
      // visible front arc is paved
      const paveGem = new THREE.Mesh(generateDiamondGeometry('flat'), gemMat);
      paveGem.scale.setScalar(0.04);
      paveGem.position.set(h2x, h2y, h2z);
      group.add(paveGem);
      gemMeshList.push(paveGem);

      // Micro crown bead grip
      const grp = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), metalMat);
      grp.position.set(h2x, h2y + 0.03, h2z + 0.01);
      group.add(grp);
    } else {
      // hidden bottom is solid metal beads
      const sph2 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), metalMat);
      sph2.position.set(h2x, h2y, h2z);
      sph1.castShadow = true;
      group.add(sph2);
    }
  }

  group.rotation.x = Math.PI / 2;
  return group;
}

// 9. Handcrafted split shank band that branches in elegant lines (Orphean Sapphire layout)
function createSplitShankBandGroup(metalMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const steps = 72;
  const rMajor = 1.05;

  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);

    // split thickness starts expanding near top shoulder (st > 0)
    const splitDistanceZ = (st > 0.0) ? (st * st * 0.11) : 0.0;

    // Piece 1: Left branch
    const leftEl = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), metalMat);
    leftEl.position.set(ct * rMajor, st * rMajor, splitDistanceZ);
    leftEl.castShadow = true;
    group.add(leftEl);

    // Piece 2: Right branch
    const rightEl = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), metalMat);
    rightEl.position.set(ct * rMajor, st * rMajor, -splitDistanceZ);
    rightEl.castShadow = true;
    group.add(rightEl);
  }

  group.rotation.x = Math.PI / 2;
  return group;
}

// =========================================================================
// LUXURY BLACK MARBLE TEXTURE GENERATOR
// =========================================================================
const createBlackMarbleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Base deep charcoal/black marble color
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, 512, 512);
  
  // Subtle dark cloud variation
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 100 + Math.random() * 150;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(12, 12, 20, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw elegant marble veins (fine lines of ivory white and gold)
  const drawVein = (startX: number, startY: number, segments: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    let cx = startX;
    let cy = startY;
    for (let j = 0; j < segments; j++) {
      cx += (Math.random() - 0.42) * 32;
      cy += (Math.random() - 0.35) * 32;
      cx = (cx + 512) % 512;
      cy = (cy + 512) % 512;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  };

  // Multiple fine white veins
  ctx.lineWidth = 1.0;
  for (let i = 0; i < 6; i++) {
    drawVein(Math.random() * 512, Math.random() * 512, 14, 'rgba(238, 235, 225, 0.14)');
  }

  // Soft faint gold veins
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    drawVein(Math.random() * 512, Math.random() * 512, 10, 'rgba(215, 175, 55, 0.08)');
  }
  
  return new THREE.CanvasTexture(canvas);
};

// =========================================================================
// MAIN THREE.JS SHOWROOM RENDER COMPONENT
// =========================================================================
export default function ThreeCanvas({
  activeRingIndex,
  customization,
  scrollProgress,
  onHoverStateChange,
  introPhase,
  onIntroUpdate,
  isCustomizing
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State caches
  const activeRingIndexRef = useRef(activeRingIndex);
  const scrollRef = useRef(scrollProgress);
  const customizationRef = useRef(customization);
  const hoverRef = useRef<number | null>(null);
  const targetGlowRef = useRef(0.0);
  const currentGlowRef = useRef(0.0);
  const isCustomizingRef = useRef(isCustomizing);

  useEffect(() => { activeRingIndexRef.current = activeRingIndex; }, [activeRingIndex]);
  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { customizationRef.current = customization; }, [customization]);
  useEffect(() => { isCustomizingRef.current = isCustomizing; }, [isCustomizing]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#050505', 0.08);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 12);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- Cinematic Lights Rig ---
    const overheadSpot = new THREE.SpotLight('#FFEBBF', 15.0, 18, Math.PI / 4, 0.6, 1.0);
    overheadSpot.position.set(0, 3.2, 1.8);
    overheadSpot.castShadow = true;
    overheadSpot.shadow.mapSize.width = 1024;
    overheadSpot.shadow.mapSize.height = 1024;
    overheadSpot.shadow.bias = -0.0004;
    scene.add(overheadSpot);

    const spotTarget = new THREE.Object3D();
    scene.add(spotTarget);
    overheadSpot.target = spotTarget;

    const leftRimLight = new THREE.DirectionalLight('#BCD8FF', 4.0);
    leftRimLight.position.set(-8, 4, 3);
    scene.add(leftRimLight);

    const rightRimLight = new THREE.DirectionalLight('#E0C3FF', 3.0);
    rightRimLight.position.set(8, 4, 3);
    scene.add(rightRimLight);

    const goldFloorBounceOfColors = new THREE.DirectionalLight('#FFDFAC', 2.0);
    goldFloorBounceOfColors.position.set(0, -6, 2);
    scene.add(goldFloorBounceOfColors);

    const sceneAmbientAtmosphere = new THREE.AmbientLight('#08080c', 1.25);
    scene.add(sceneAmbientAtmosphere);

    // Marble texture initialization
    const marbleTex = createBlackMarbleTexture();
    marbleTex.wrapS = THREE.RepeatWrapping;
    marbleTex.wrapT = THREE.RepeatWrapping;
    marbleTex.repeat.set(2.0, 2.0);

    // Metal profiles generator
    const createMetalMaterial = (metal: 'platinum' | 'gold' | 'rosegold') => {
      if (metal === 'platinum') {
        return new THREE.MeshPhysicalMaterial({
          color: '#E8EDF4',
          metalness: 1.0,
          roughness: 0.10,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03,
          reflectivity: 1.0,
          emissive: new THREE.Color('#000000'),
        });
      } else if (metal === 'rosegold') {
        return new THREE.MeshPhysicalMaterial({
          color: '#DE997D',
          metalness: 1.0,
          roughness: 0.11,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          reflectivity: 0.96,
          emissive: new THREE.Color('#391104'),
          emissiveIntensity: 0.11,
        });
      } else {
        return new THREE.MeshPhysicalMaterial({
          color: '#ECC16E',
          metalness: 1.0,
          roughness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          reflectivity: 0.98,
          emissive: new THREE.Color('#442502'),
          emissiveIntensity: 0.14,
        });
      }
    };

    const createGemMaterial = (colorStr: string, iorValue: number) => {
      return new THREE.ShaderMaterial({
        vertexShader: DIAMOND_VERTEX_SHADER,
        fragmentShader: DIAMOND_FRAGMENT_SHADER,
        uniforms: {
          uColor: { value: new THREE.Color(colorStr) },
          uGlowIntensity: { value: 0.0 },
          uTime: { value: 0.0 },
          uScrollProgress: { value: 0.0 },
          uIOR: { value: iorValue },
        },
        transparent: true,
        side: THREE.DoubleSide,
      });
    };

    // --- PROCEDURAL 3D SHOWROOM MODELS SETUP (8 INDIVIDUAL LUXURY RINGS) ---
    const pedestalsGroup = new THREE.Group();
    scene.add(pedestalsGroup);

    const ringTransforms: {
      group: THREE.Group;
      bandMesh: THREE.Mesh | THREE.Group;
      gemMeshList: THREE.Mesh[];
      pedestalBase: THREE.Mesh;
      pedestalHalo: THREE.Mesh;
      id: string;
    }[] = [];

    SHOWROOM_RINGS.forEach((ringDef, index) => {
      const ringContainer = new THREE.Group();
      ringContainer.position.set(index * 6.0, 0.0, 0.0);
      pedestalsGroup.add(ringContainer);

      // --- Floating Pedestal Base (Luxury Black Marble cylinder) ---
      const pedBaseGeom = new THREE.CylinderGeometry(0.8, 0.85, 0.4, 48);
      const pedBaseMat = new THREE.MeshPhysicalMaterial({
        map: marbleTex,
        roughness: 0.12,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 0.9,
      });
      const pedBaseMesh = new THREE.Mesh(pedBaseGeom, pedBaseMat);
      pedBaseMesh.position.y = -0.95;
      pedBaseMesh.receiveShadow = true;
      ringContainer.add(pedBaseMesh);

      // Gold orbital ring
      const pedHaloGeom = new THREE.RingGeometry(0.7, 0.72, 64);
      const pedHaloMat = new THREE.MeshBasicMaterial({
        color: '#e5c384',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
      });
      const pedHaloMesh = new THREE.Mesh(pedHaloGeom, pedHaloMat);
      pedHaloMesh.rotation.x = Math.PI / 2;
      pedHaloMesh.position.y = -0.74;
      ringContainer.add(pedHaloMesh);

      // --- Custom Ring Model Crafting ---
      const activeMetal = ringDef.metal;
      const metalMat = createMetalMaterial(activeMetal);
      const gemMat = createGemMaterial(ringDef.gemColor, ringDef.ior);

      const ringModelGroup = new THREE.Group();
      ringModelGroup.scale.setScalar(0.6); // Scale model down by 40% (60% active size)
      ringModelGroup.position.y = 0.15;
      ringModelGroup.name = ringDef.id;
      ringModelGroup.rotation.x = 0.5236; // Set beautiful 30-degree editorial angle presentation
      ringContainer.add(ringModelGroup);

      let bandMesh: THREE.Mesh | THREE.Group;
      const gemMeshList: THREE.Mesh[] = [];

      // NO TORUSGEOMETRY BANISTER - ALL COMFORT-BANDS PROCESSED VIA HIGH-THICKNESS LATHE/HELIX
      if (ringDef.id === 'solitaire') {
        const bandGeom = createClassicDomeBandGeometry();
        bandMesh = new THREE.Mesh(bandGeom, metalMat);
        bandMesh.rotation.x = Math.PI / 2;
        bandMesh.castShadow = true;
        ringModelGroup.add(bandMesh);

        // Claws & Crown Baskets
        addSolitaireBasket(ringModelGroup, metalMat, 1.34, 0.58);

        // Gemstone insertion
        const centerGem = new THREE.Mesh(generateDiamondGeometry('solitaire'), gemMat);
        centerGem.scale.setScalar(0.58);
        centerGem.position.set(0, 1.34, 0.0);
        centerGem.rotation.set(0, 0, 0);
        ringModelGroup.add(centerGem);
        gemMeshList.push(centerGem);

      } else if (ringDef.id === 'halo') {
        const bandGeom = createKnifeEdgeBandGeometry();
        bandMesh = new THREE.Mesh(bandGeom, metalMat);
        bandMesh.rotation.x = Math.PI / 2;
        bandMesh.castShadow = true;
        ringModelGroup.add(bandMesh);

        // Core Halo structure helper
        addHaloBasket(ringModelGroup, metalMat, gemMat, gemMeshList, 1.34, 0.58);

        const centerGem = new THREE.Mesh(generateDiamondGeometry('solitaire'), gemMat);
        centerGem.scale.setScalar(0.58 * 0.72);
        centerGem.position.set(0, 1.35, 0.0);
        centerGem.rotation.set(0, 0, 0);
        ringModelGroup.add(centerGem);
        gemMeshList.push(centerGem);

      } else if (ringDef.id === 'emerald') {
        const bandGeom = createFlatBeveledBandGeometry();
        bandMesh = new THREE.Mesh(bandGeom, metalMat);
        bandMesh.rotation.x = Math.PI / 2;
        bandMesh.castShadow = true;
        ringModelGroup.add(bandMesh);

        addEmeraldSetting(ringModelGroup, metalMat, 1.34, 0.58);

        const centerGem = new THREE.Mesh(generateDiamondGeometry('emerald'), gemMat);
        centerGem.scale.setScalar(0.58);
        centerGem.position.set(0, 1.34, 0.0);
        centerGem.rotation.set(0, 0, 0);
        ringModelGroup.add(centerGem);
        gemMeshList.push(centerGem);

        // flanking side-tapered baguette white diamonds
        const whiteDiamondMat = createGemMaterial('#FFFFFF', 2.417);
        const lBaguette = new THREE.Mesh(generateDiamondGeometry('emerald'), whiteDiamondMat);
        lBaguette.scale.set(0.58 * 0.38 * 1.5, 0.58 * 0.44 * 1.5, 0.58 * 0.38 * 1.5);
        lBaguette.position.set(-0.35, 1.28, 0.0);
        lBaguette.rotation.set(0, 0, Math.PI / 6);
        ringModelGroup.add(lBaguette);
        gemMeshList.push(lBaguette);

        const rBaguette = new THREE.Mesh(generateDiamondGeometry('emerald'), whiteDiamondMat);
        rBaguette.scale.set(0.58 * 0.38 * 1.5, 0.58 * 0.44 * 1.5, 0.58 * 0.38 * 1.5);
        rBaguette.position.set(0.35, 1.28, 0.0);
        rBaguette.rotation.set(0, 0, -Math.PI / 6);
        ringModelGroup.add(rBaguette);
        gemMeshList.push(rBaguette);

      } else if (ringDef.id === 'princess') {
        const bandGeom = createFlatBeveledBandGeometry();
        bandMesh = new THREE.Mesh(bandGeom, metalMat);
        bandMesh.rotation.x = Math.PI / 2;
        bandMesh.castShadow = true;
        ringModelGroup.add(bandMesh);

        addPrincessSetting(ringModelGroup, metalMat, 1.34, 0.58);

        const centerGem = new THREE.Mesh(generateDiamondGeometry('princess'), gemMat);
        centerGem.scale.setScalar(0.58);
        centerGem.position.set(0, 1.34, 0.0);
        centerGem.rotation.set(0, Math.PI / 4, 0); 
        ringModelGroup.add(centerGem);
        gemMeshList.push(centerGem);

      } else if (ringDef.id === 'vintage_engagement') {
        const bandGeom = createClassicDomeBandGeometry();
        bandMesh = new THREE.Mesh(bandGeom, metalMat);
        bandMesh.rotation.x = Math.PI / 2;
        bandMesh.castShadow = true;
        ringModelGroup.add(bandMesh);

        // Milgrain tiny pearls procedurally aligned along comfort shoulders
        for (let i = 0; i < 28; i++) {
          const theta = Math.PI * 0.18 + (i / 27) * Math.PI * 0.64;
          const leftPearl = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), metalMat);
          leftPearl.position.set(Math.cos(theta) * 1.08, Math.sin(theta) * 1.08, 0.042);
          bandMesh.add(leftPearl);

          const rightPearl = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), metalMat);
          rightPearl.position.set(Math.cos(theta) * 1.08, Math.sin(theta) * 1.08, -0.042);
          bandMesh.add(rightPearl);
        }

        addVintageSetting(ringModelGroup, metalMat, 1.34, 0.58);

        const centerGem = new THREE.Mesh(generateDiamondGeometry('oval'), gemMat);
        centerGem.scale.setScalar(0.58);
        centerGem.position.set(0, 1.34, 0.0);
        centerGem.rotation.set(0, 0, 0);
        ringModelGroup.add(centerGem);
        gemMeshList.push(centerGem);

      } else if (ringDef.id === 'twisted_infinity') {
        // Spiral double braided rope band (generates its own band content)
        bandMesh = createTwistedInfinityBandGroup(metalMat, gemMat, gemMeshList);
        ringModelGroup.add(bandMesh);

        addSolitaireBasket(ringModelGroup, metalMat, 1.34, 0.58);

        const centerGem = new THREE.Mesh(generateDiamondGeometry('solitaire'), gemMat);
        centerGem.scale.setScalar(0.58);
        centerGem.position.set(0, 1.34, 0.0);
        centerGem.rotation.set(0, 0, 0);
        ringModelGroup.add(centerGem);
        gemMeshList.push(centerGem);

      } else if (ringDef.id === 'double_halo') {
        // Sapphire Ring: split-shank band
        bandMesh = createSplitShankBandGroup(metalMat);
        ringModelGroup.add(bandMesh);

        addSapphireDoubleHaloSetting(ringModelGroup, metalMat, gemMat, gemMeshList, 1.34, 0.58);

        const centerGem = new THREE.Mesh(generateDiamondGeometry('solitaire'), gemMat);
        centerGem.scale.setScalar(0.58 * 0.72);
        centerGem.position.set(0, 1.35, 0.0);
        centerGem.rotation.set(0, 0, 0);
        ringModelGroup.add(centerGem);
        gemMeshList.push(centerGem);

      } else {
        // Amore Heart Rose Gold Ring
        const bandGeom = createClassicDomeBandGeometry();
        bandMesh = new THREE.Mesh(bandGeom, metalMat);
        bandMesh.rotation.x = Math.PI / 2;
        bandMesh.castShadow = true;
        ringModelGroup.add(bandMesh);

        // Flanking shoulder stones (20 micro stones)
        const microGemGeom = generateDiamondGeometry('flat');
        for (let i = 0; i < 10; i++) {
          const theta1 = 0.35 + (i / 10) * 0.75;
          const mx1 = Math.cos(theta1) * 1.05;
          const my1 = Math.sin(theta1) * 1.05;
          const sideGemL = new THREE.Mesh(microGemGeom, gemMat);
          sideGemL.scale.setScalar(0.04);
          sideGemL.position.set(mx1, my1, 0.0);
          bandMesh.add(sideGemL);
          gemMeshList.push(sideGemL);

          const theta2 = Math.PI - 0.35 - (i / 10) * 0.75;
          const mx2 = Math.cos(theta2) * 1.05;
          const my2 = Math.sin(theta2) * 1.05;
          const sideGemR = new THREE.Mesh(microGemGeom, gemMat);
          sideGemR.scale.setScalar(0.04);
          sideGemR.position.set(mx2, my2, 0.0);
          bandMesh.add(sideGemR);
          gemMeshList.push(sideGemR);
        }

        addRoseGoldHeartSetting(ringModelGroup, metalMat, 1.34, 0.58);

        const centerGem = new THREE.Mesh(generateDiamondGeometry('heart'), gemMat);
        centerGem.scale.setScalar(0.58);
        centerGem.position.set(0, 1.34, 0.0);
        centerGem.rotation.set(0, 0, 0);
        ringModelGroup.add(centerGem);
        gemMeshList.push(centerGem);
      }

      // Add elegant counter-orbit dust guidelines
      const orbits = new THREE.Group();
      orbits.position.set(0, 1.34, 0.0);
      ringModelGroup.add(orbits);
      const orbitGeometry = new THREE.TorusGeometry(0.85, 0.012, 8, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: ringDef.gemColor,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
      });
      const orb1 = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orb1.rotation.set(Math.PI / 6, Math.PI / 4, 0);
      orbits.add(orb1);

      const orb2 = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orb2.rotation.set(-Math.PI / 6, -Math.PI / 4, 0);
      orbits.add(orb2);

      ringTransforms.push({
        group: ringModelGroup,
        bandMesh,
        gemMeshList,
        pedestalBase: pedBaseMesh,
        pedestalHalo: pedHaloMesh,
        id: ringDef.id
      });
    });

    // --- Floating Particle Matrix ---
    const partCount = 450;
    const partGeom = new THREE.BufferGeometry();
    const partPositions = new Float32Array(partCount * 3);
    const partSpeeds = new Float32Array(partCount);
    const partRadii = new Float32Array(partCount);
    const partPhases = new Float32Array(partCount);

    for (let i = 0; i < partCount; i++) {
      const radius = 0.5 + Math.random() * 8.0;
      const angle = Math.random() * Math.PI * 2;
      partPositions[i * 3] = Math.cos(angle) * radius;
      partPositions[i * 3 + 1] = -2.5 + Math.random() * 6.5;
      partPositions[i * 3 + 2] = Math.sin(angle) * radius;

      partSpeeds[i] = 0.06 + Math.random() * 0.24;
      partRadii[i] = radius;
      partPhases[i] = Math.random() * Math.PI * 2;
    }
    partGeom.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));

    const drawCircleParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,249,238,1.0)');
      grad.addColorStop(0.35, 'rgba(229,195,132,0.85)');
      grad.addColorStop(0.70, 'rgba(184,138,68,0.15)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(canvas);
    };

    const partMat = new THREE.PointsMaterial({
      size: 0.15,
      map: drawCircleParticleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: '#e5c384',
    });
    const floatingParticles = new THREE.Points(partGeom, partMat);
    scene.add(floatingParticles);

    // Soft flooring shadows
    const floorGeom = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Dynamic Sparkles overlay ---
    const activeSparkleGeometry = new THREE.BufferGeometry();
    const activeSparkleVertices = new Float32Array(5 * 3);
    activeSparkleGeometry.setAttribute('position', new THREE.BufferAttribute(activeSparkleVertices, 3));

    const drawSparkleStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 64, 64);
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 24);
      grad.addColorStop(0, 'rgba(255,255,255,1.0)');
      grad.addColorStop(0.25, 'rgba(229,195,132,0.92)');
      grad.addColorStop(0.55, 'rgba(255,255,255,0.15)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(32, 32, 12, 0, Math.PI * 2); ctx.fill();

      // rays
      ctx.strokeStyle = 'rgba(255,250,235,0.85)';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(6, 32); ctx.lineTo(58, 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(32, 6); ctx.lineTo(32, 58); ctx.stroke();
      return new THREE.CanvasTexture(canvas);
    };

    const activeSparkleMaterial = new THREE.PointsMaterial({
      size: 0.42,
      map: drawSparkleStarTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkleSystem = new THREE.Points(activeSparkleGeometry, activeSparkleMaterial);
    scene.add(sparkleSystem);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- Interaction / Drag Loops ---
    let frameId: number;
    const tickClock = new THREE.Clock();

    let interpTargetX = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;
    let interpScroll = 0;
    let introTime = 0;
    let computedGlow = 0;

    let localRotationY = 0;
    let isDragging = false;
    let dragStart = { x: 0 };
    let dragRotStart = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStart.x = e.clientX;
      dragRotStart = localRotationY;
    };
    const handleTouchStart = (e: TouchEvent) => {
      isDragging = true;
      if (e.touches[0]) {
        dragStart.x = e.touches[0].clientX;
        dragRotStart = localRotationY;
      }
    };
    const handleMouseUpOrLeave = () => { isDragging = false; };
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.x;
      localRotationY = dragRotStart + dx * 0.012;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      const dx = e.touches[0].clientX - dragStart.x;
      localRotationY = dragRotStart + dx * 0.012;
    };

    const canvasElement = canvasRef.current;
    canvasElement.addEventListener('mousedown', handleMouseDown);
    canvasElement.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleMouseUpOrLeave);
    canvasElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvasElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUpOrLeave);

    const tick = () => {
      frameId = requestAnimationFrame(tick);

      const elapsed = tickClock.getElapsedTime();
      introTime += 0.016;

      const targetX = activeRingIndexRef.current * 6.0;
      interpTargetX += (targetX - interpTargetX) * 0.08;

      interpScroll += (scrollRef.current - interpScroll) * 0.06;
      smoothMouseX += (mouseX - smoothMouseX) * 0.04;
      smoothMouseY += (mouseY - smoothMouseY) * 0.04;

      targetGlowRef.current = hoverRef.current !== null ? 1.0 : 0.0;
      currentGlowRef.current += (targetGlowRef.current - currentGlowRef.current) * 0.1;
      computedGlow = currentGlowRef.current;

      // Introduces stages
      let currentIntroPhase: 'black' | 'particles' | 'reveal' | 'zoom' | 'brand' | 'ready' = 'black';
      if (introTime < 0.9) {
        currentIntroPhase = 'black';
      } else if (introTime >= 0.9 && introTime < 1.8) {
        currentIntroPhase = 'particles';
      } else if (introTime >= 1.8 && introTime < 3.2) {
        currentIntroPhase = 'reveal';
      } else if (introTime >= 3.2 && introTime < 4.4) {
        currentIntroPhase = 'zoom';
      } else if (introTime >= 4.4 && introTime < 5.4) {
        currentIntroPhase = 'brand';
      } else {
        currentIntroPhase = 'ready';
      }

      onIntroUpdate(currentIntroPhase);

      // Rotates showroom items
      ringTransforms.forEach((ring, i) => {
        const isSelected = i === activeRingIndexRef.current;
        const bounceOffset = isSelected ? 0.07 : 0.035;
        ring.group.position.y = 0.15 + Math.sin(elapsed * 1.5 + i) * bounceOffset;

        // Customization reactive update
        if (isSelected && isCustomizingRef.current) {
          const currentConfig = customizationRef.current;
          
          // Re-color components dynamically
          const customColor = currentConfig.metal === 'platinum' ? '#E8EDF4' : (currentConfig.metal === 'rosegold' ? '#DE997D' : '#ECC16E');
          
          ring.group.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
              child.material.color.set(customColor);
            }
          });
        }

        ring.group.rotation.x = 0.5236; // Lock elegant 30-degree editorial presentation tilt

        if (isSelected) {
          if (!isDragging) {
            localRotationY += 0.0035;
          }
          ring.group.rotation.y = localRotationY + smoothMouseX * 0.35;
          ring.group.rotation.z = Math.sin(elapsed * 0.5) * 0.015 + smoothMouseY * 0.10;
        } else {
          ring.group.rotation.y = elapsed * 0.08 + (i * 0.5);
          ring.group.rotation.z = Math.sin(elapsed * 0.4) * 0.008;
        }

        // Counter spin ambient rings
        const orbitsGroup = ring.group.children.find(child => child instanceof THREE.Group && child.name !== ring.id);
        if (orbitsGroup) {
          orbitsGroup.rotation.y = -elapsed * 0.4;
          orbitsGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.08;
        }

        const pulseOpacity = 0.2 + Math.abs(Math.sin(elapsed * 1.4 + i)) * 0.15;
        (ring.pedestalHalo.material as THREE.MeshBasicMaterial).opacity = isSelected ? (pulseOpacity + 0.15) : 0.18;
      });

      // Update spot targets dynamically over active ring
      spotTarget.position.set(interpTargetX, -0.75, 0.0);
      overheadSpot.position.set(interpTargetX, 3.2, 1.8);

      // Camera controller states
      if (currentIntroPhase === 'black') {
        camera.position.set(targetX, 4.5, 15.0);
        overheadSpot.intensity = 0;
        leftRimLight.intensity = 0;
        rightRimLight.intensity = 0;
        partMat.opacity = 0;
      } 
      else if (currentIntroPhase === 'particles') {
        camera.position.set(targetX, 3.5, 12.0);
        overheadSpot.intensity = 0.5;
        leftRimLight.intensity = 0.5;
        const pt = (introTime - 0.9) / 0.9;
        partMat.opacity = pt * 0.8;
      } 
      else if (currentIntroPhase === 'reveal') {
        const pt = (introTime - 1.8) / 1.4;
        overheadSpot.intensity = pt * 10.0;
        leftRimLight.intensity = pt * 4.0;
        rightRimLight.intensity = pt * 3.0;

        const rad = 12.0 - pt * 3.0;
        camera.position.x = targetX + Math.cos(pt * Math.PI * 0.3) * rad;
        camera.position.y = 1.8 - pt * 0.4;
        camera.position.z = Math.sin(pt * Math.PI * 0.3) * rad;
        partMat.opacity = 0.8 + Math.sin(elapsed * 2.0) * 0.1;
      } 
      else if (currentIntroPhase === 'zoom') {
        const pt = (introTime - 3.2) / 1.2;
        const ease = 1.0 - Math.pow(1.0 - pt, 3);

        camera.position.x = THREE.MathUtils.lerp(targetX + 3.0, targetX, ease);
        camera.position.y = THREE.MathUtils.lerp(1.5, 0.8, ease);
        camera.position.z = THREE.MathUtils.lerp(9.0, 5.2, ease);

        overheadSpot.intensity = 15.0;
        leftRimLight.intensity = 4.0;
        rightRimLight.intensity = 3.0;
      } 
      else {
        partMat.opacity = 0.85;
        overheadSpot.intensity = 15.0;

        if (interpScroll < 0.33) {
          const t = interpScroll / 0.33;
          const lookAltY = THREE.MathUtils.lerp(0.8, 0.4, t);
          const zoomRadius = THREE.MathUtils.lerp(5.5, 5.0, t);

          camera.position.x = interpTargetX + smoothMouseX * 0.65;
          camera.position.y = lookAltY + smoothMouseY * 0.45;
          camera.position.z = zoomRadius;
        } 
        else if (interpScroll >= 0.33 && interpScroll < 0.68) {
          const t = (interpScroll - 0.33) / 0.35;
          const arcEase = Math.sin((t * Math.PI) / 2);

          const orbitAngle = Math.PI / 2 + arcEase * (Math.PI * 0.8);
          const rad = 5.0 - Math.sin(t * Math.PI) * 0.35;

          camera.position.x = interpTargetX + Math.cos(orbitAngle) * rad + smoothMouseX * 0.35;
          camera.position.y = 0.5 + Math.cos(elapsed * 0.4) * 0.04 + smoothMouseY * 0.25;
          camera.position.z = Math.sin(orbitAngle) * rad;
        } 
        else {
          const t = (interpScroll - 0.68) / 0.32;
          const ease = Math.sin((t * Math.PI) / 2);

          camera.position.x = THREE.MathUtils.lerp(interpTargetX, interpTargetX, ease) + smoothMouseX * 0.15;
          camera.position.y = THREE.MathUtils.lerp(0.5, 0.58, ease) + Math.cos(elapsed * 0.3) * 0.015 + smoothMouseY * 0.08;
          camera.position.z = THREE.MathUtils.lerp(5.0, 4.8, ease);
        }
      }

      camera.lookAt(new THREE.Vector3(interpTargetX, 0.05 + interpScroll * 0.2, 0.0));

      // Twinkle sparks engine selection
      const activeTrans = ringTransforms[activeRingIndexRef.current];
      if (activeTrans && activeTrans.gemMeshList.length > 0) {
        const targetGem = activeTrans.gemMeshList[0];
        
        if (Math.random() < 0.15 && computedGlow > 0.05) {
          const vertPosArr = targetGem.geometry.attributes.position.array as Float32Array;
          const vertCount = vertPosArr.length / 3;
          const randomIdx = Math.floor(Math.random() * vertCount) * 3;
          
          if (randomIdx < vertPosArr.length) {
            const tempV = new THREE.Vector3(
              vertPosArr[randomIdx],
              vertPosArr[randomIdx + 1],
              vertPosArr[randomIdx + 2]
            );

            tempV.applyMatrix4(targetGem.matrixWorld);

            const sparklesStream = activeSparkleGeometry.attributes.position.array as Float32Array;
            const slot = Math.floor(Math.random() * 5) * 3;
            sparklesStream[slot] = tempV.x;
            sparklesStream[slot + 1] = tempV.y;
            sparklesStream[slot + 2] = tempV.z;
            
            activeSparkleGeometry.attributes.position.needsUpdate = true;
          }
        }
      }

      activeSparkleMaterial.opacity = computedGlow * (0.6 + Math.sin(elapsed * 18.0) * 0.4) * (currentIntroPhase === 'ready' ? 1.0 : 0.0);

      const positionsArray = floatingParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < partCount; i++) {
        const index = i * 3;
        const radius = partRadii[i];
        const phase = partPhases[i] + elapsed * partSpeeds[i];
        
        positionsArray[index] = Math.cos(phase) * radius * (1.0 + Math.sin(elapsed * 0.2) * 0.02);
        positionsArray[index + 2] = Math.sin(phase) * radius * (1.0 + Math.sin(elapsed * 0.2) * 0.02);
        
        positionsArray[index + 1] += 0.0055 * (1.0 + interpScroll * 1.5);
        if (positionsArray[index + 1] > 4.0) {
          positionsArray[index + 1] = -2.5;
        }
      }
      floatingParticles.geometry.attributes.position.needsUpdate = true;

      // Update gemstone shader values
      ringTransforms.forEach((ring) => {
        ring.gemMeshList.forEach((gemMesh) => {
          if (gemMesh.material instanceof THREE.ShaderMaterial) {
            gemMesh.material.uniforms.uTime.value = elapsed;
            gemMesh.material.uniforms.uScrollProgress.value = interpScroll;
            gemMesh.material.uniforms.uGlowIntensity.value = computedGlow;
          }
        });
      });

      renderer.render(scene, camera);
    };

    tick();

    // Raycast hover check
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const checkRaycastHover = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouseVector.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      
      const activeTrans = ringTransforms[activeRingIndexRef.current];
      if (!activeTrans) return;

      const targetItemsToHover: THREE.Object3D[] = [activeTrans.pedestalBase];
      if (activeTrans.bandMesh) {
         if (activeTrans.bandMesh instanceof THREE.Group) {
           targetItemsToHover.push(...activeTrans.bandMesh.children);
         } else {
           targetItemsToHover.push(activeTrans.bandMesh);
         }
      }
      targetItemsToHover.push(...activeTrans.gemMeshList);

      const intersects = raycaster.intersectObjects(targetItemsToHover);
      const isHoveringVal = intersects.length > 0;
      
      if (isHoveringVal && hoverRef.current === null) {
        hoverRef.current = activeRingIndexRef.current;
        onHoverStateChange(true);
      } else if (!isHoveringVal && hoverRef.current !== null) {
        hoverRef.current = null;
        onHoverStateChange(false);
      }
    };

    window.addEventListener('mousemove', checkRaycastHover);

    const handleViewportResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(() => handleViewportResize());
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', checkRaycastHover);
      canvasElement.removeEventListener('mousedown', handleMouseDown);
      canvasElement.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleMouseUpOrLeave);
      canvasElement.removeEventListener('touchstart', handleTouchStart);
      canvasElement.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUpOrLeave);

      floorGeom.dispose();
      floorMat.dispose();
      partGeom.dispose();
      partMat.dispose();
      activeSparkleGeometry.dispose();
      activeSparkleMaterial.dispose();
      pedestalsGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [onIntroUpdate, onHoverStateChange]);

  return (
    <div id="three-container" ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto">
      <canvas id="luxury-webgl-canvas" ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
    </div>
  );
}
