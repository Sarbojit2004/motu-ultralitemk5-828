// Design tokens for the MOTU UltraLite-mk5 / 828 reel.
//
// The composition is 1080x1920 but ALL content is confined to a 1080x1080
// square starting at y=420. SQ is that square's coordinate contract — every
// scene lays out in 0..1080 on both axes and the Frame component clips it.

export const FPS = 30;
export const TOTAL_FRAMES = 5340; // 178.000s
export const CANVAS = {w: 1080, h: 1920};
export const SQ = {top: 420, size: 1080};

export const C = {
  void: '#04060A',
  bg: '#070B11',
  panel: '#0D131C',
  panelHi: '#141C28',
  line: '#22303F',
  ink: '#F4F8FD',
  inkSoft: '#C3D0E0',
  inkDim: '#8494A8',

  brand: '#3D8BFF', // shared / MOTU blue
  brandDeep: '#123C86',

  ul: '#2FD4C8', // UltraLite-mk5 — cool teal: light, portable, fresh
  ulDeep: '#0B5F63',
  e8: '#FF8A3D', // 828 — warm amber: bigger, rack, room-filling
  e8Deep: '#7A3308',

  cue: '#B36BE8', // CueMix 5 — purple, matching the badge art
  cueDeep: '#4B2270',

  gold: '#FFC24A', // pricing
  goldDeep: '#7A5410',
  good: '#3FDCA0',
} as const;

export const F = {
  display: '"BarlowCondensed", "Arial Narrow", sans-serif',
  ui: '"Inter", system-ui, sans-serif',
  mono: '"JetBrainsMono", ui-monospace, monospace',
} as const;

/** Scene table — single source of truth for timing. Durations sum to 5340. */
export type SceneId =
  | 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07' | 'S08' | 'S09'
  | 'S10' | 'S11' | 'S12' | 'S13' | 'S14' | 'S15' | 'S16' | 'S17' | 'S18'
  | 'S19' | 'S20' | 'S21' | 'S22' | 'S23' | 'S24' | 'S25' | 'S26' | 'S27';

export type Accent = 'brand' | 'ul' | 'e8' | 'cue' | 'gold';

export const SCENES: {id: SceneId; dur: number; accent: Accent}[] = [
  // ACT 0 — hook (420f / 14s)
  {id: 'S01', dur: 180, accent: 'brand'},
  {id: 'S02', dur: 240, accent: 'brand'},
  // ACT 1 — CueMix 5, the shared thread (600f / 20s)
  {id: 'S03', dur: 180, accent: 'cue'},
  {id: 'S04', dur: 180, accent: 'cue'},
  {id: 'S05', dur: 150, accent: 'cue'},
  {id: 'S06', dur: 90, accent: 'cue'},
  // ACT 2 — UltraLite-mk5 (1500f / 50s)
  {id: 'S07', dur: 180, accent: 'ul'},
  {id: 'S08', dur: 180, accent: 'ul'},
  {id: 'S09', dur: 210, accent: 'ul'},
  {id: 'S10', dur: 210, accent: 'ul'},
  {id: 'S11', dur: 180, accent: 'ul'},
  {id: 'S12', dur: 150, accent: 'ul'},
  {id: 'S13', dur: 150, accent: 'ul'},
  {id: 'S14', dur: 240, accent: 'ul'},
  // ACT 3 — 828 (1740f / 58s)
  {id: 'S15', dur: 180, accent: 'e8'},
  {id: 'S16', dur: 180, accent: 'e8'},
  {id: 'S17', dur: 210, accent: 'e8'},
  {id: 'S18', dur: 210, accent: 'e8'},
  {id: 'S19', dur: 240, accent: 'e8'},
  {id: 'S20', dur: 180, accent: 'e8'},
  {id: 'S21', dur: 180, accent: 'e8'},
  {id: 'S22', dur: 180, accent: 'e8'},
  {id: 'S23', dur: 180, accent: 'e8'},
  // ACT 4 — together (540f / 18s)
  {id: 'S24', dur: 270, accent: 'brand'},
  {id: 'S25', dur: 270, accent: 'brand'},
  // ACT 5 — price + CTA (540f / 18s)
  {id: 'S26', dur: 270, accent: 'gold'},
  {id: 'S27', dur: 270, accent: 'gold'},
];

export const sceneStart = (id: SceneId): number => {
  let f = 0;
  for (const s of SCENES) {
    if (s.id === id) return f;
    f += s.dur;
  }
  return f;
};

export const accentColor = (a: Accent): string =>
  ({brand: C.brand, ul: C.ul, e8: C.e8, cue: C.cue, gold: C.gold}[a]);

export const accentDeep = (a: Accent): string =>
  ({brand: C.brandDeep, ul: C.ulDeep, e8: C.e8Deep, cue: C.cueDeep, gold: C.goldDeep}[a]);
