// Design tokens — MOTU UltraLite-mk5 & 828 reels (portrait, light ground).
//
// PROVENANCE (Section 0.2 / 8). Pulled directly from the approved MOTU AVB
// ecosystem reels branch rather than re-derived:
//   palette + type colours + accents ..... AVB reels/src/theme.ts COLORS
//   portrait caption-safe zone ........... AVB reels/src/theme.ts SAFE
//   transition timing .................... AVB reels/src/theme.ts TIMING
//   distributor relationship + contacts .. AVB reels/src/theme.ts BRAND
// The palette is identical to this project's own long-form, so all three
// deliverables share one visual identity.

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInSeconds: 178,
  get durationInFrames() {
    return Math.round(this.fps * this.durationInSeconds); // 5_340
  },
} as const;

export const COLORS = {
  paper: "#F6F8FA",
  paperLift: "#FDFEFE",
  paperEdge: "#EFF2F6",
  paperWell: "#E7EBF1",

  ink: "#0E1116",
  inkSoft: "#20272F",
  slate: "#48525F",
  slateDim: "#6B7684",

  motuBlue: "#0B5FD0",
  motuBlueSoft: "#3E86E8",
  signal: "#00845F",
  signalBright: "#00A67E",
  amber: "#B4610A",
  alert: "#B32218",

  line: "rgba(14,17,22,0.12)",
  lineStrong: "rgba(14,17,22,0.24)",
  shadow: "rgba(14,17,22,0.10)",
} as const;

export const RADII = { card: 26, plate: 18, chip: 999, sm: 12 } as const;

/**
 * CAPTION-SAFE ZONE — pulled verbatim from the AVB reels branch, not
 * re-derived. Text, logos and callouts stay clear of the top 180px and bottom
 * 220px, where platform UI (caption overlay, action rail, handle, progress bar)
 * sits. Background and ambient imagery may extend into those bands.
 */
export const SAFE = {
  top: 180,
  bottom: 220,
  marginX: 64,
  get contentTop() { return this.top; },
  get contentBottom() { return VIDEO.height - this.bottom; }, // 1700
  get contentH() { return VIDEO.height - this.top - this.bottom; }, // 1520
  get contentW() { return VIDEO.width - this.marginX * 2; }, // 952
} as const;

export const TIMING = { transition: 14, in: 12, hold: 8, out: 10 } as const;

export const BRAND = {
  name: "Shivansh Electronics",
  role: "Authorized Distributor of MOTU (Mark of the Unicorn, USA) Interfaces",
  region: "East and North East India",
  website: "www.shivanshelectronics.in",
  tagline: "Eastern India's Premier Audio Destination",
  youtube: "youtube.com/@shivanshelectronics-in",
  facebook: "facebook.com/@shivanshelectronics.in",
  instagram: "instagram.com/@shivanshelectronics.in",
} as const;

/** Market Operating Prices, as supplied. Stated distinctly per product, never
 *  blended, in EVERY reel — each stands alone (Section 5.2). */
export const PRICE = {
  ultralite: "Rs. 81,900",
  e828: "Rs. 1,28,000",
  note: "per unit · MOP, incl. GST",
  best: "Best price at www.shivanshelectronics.in",
} as const;

export const SPEC = {
  shared: {
    dac: "ESS Sabre32 Ultra",
    dacChip: "ES9026PRO",
    dynamicRange: "125 dB(A)",
    gain: "+74 dB",
    ein: "-129 dBu",
    mixer: "CueMix 5",
  },
  ul: {
    name: "MOTU UltraLite-mk5",
    role: "The Agile Hub",
    io: "18 in / 22 out",
    channels: "40 channels",
    host: "USB 2.0 High Speed",
    rtl: "2.4 ms",
    display: "White OLED",
    form: "Half-rack desktop",
  },
  e8: {
    name: "MOTU 828",
    role: "The Studio Anchor",
    io: "28 in / 32 out",
    channels: "60 channels",
    host: "USB 3.2 Gen 1 · 5 Gbps",
    rtl: "~2 ms",
    display: '3.9in RGB TFT',
    form: "1U 19in rackmount",
  },
} as const;

export const REEL_META = {
  1: { id: "Reel1", title: "The Agile Hub", product: "MOTU UltraLite-mk5",
       out: "motu-ultralite828-reel-1" },
  2: { id: "Reel2", title: "The Studio Anchor", product: "MOTU 828",
       out: "motu-ultralite828-reel-2" },
} as const;

export function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
