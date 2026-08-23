// Design tokens — MOTU UltraLite-mk5 & 828 long-form (598 s, landscape).
//
// PROVENANCE (Section 0.2 / 8). Every value below is pulled directly from the
// approved MOTU AVB ecosystem branches rather than re-derived:
//   palette + type colours + accents .... AVB longform/src/theme.ts COLORS
//   landscape edge padding ............... AVB longform/src/theme.ts SPACE
//   transition timing .................... AVB longform/src/theme.ts TIMING
//   distributor relationship + contacts .. AVB longform/src/theme.ts BRAND
// The AVB palette was itself re-derived for a light ground against MOTU's dark
// brushed-metal chassis and its display greens; it carries over unchanged here
// because both products share that same chassis language.

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInSeconds: 598,
  get durationInFrames() {
    return Math.round(this.fps * this.durationInSeconds); // 17_940
  },
} as const;

export const COLORS = {
  // Light ground — every scene, whole runtime, no exceptions.
  //
  // Held in a NEAR-WHITE range (0xEF..0xFD). Both supplied logos carry their own
  // opaque white rounded-rect ground with dark ink on top, so a page within ~4%
  // of white lets that ground read as continuous with the video and the logo
  // sits directly on the picture rather than on a plate.
  paper: "#F6F8FA",
  paperLift: "#FDFEFE",
  paperEdge: "#EFF2F6",
  paperWell: "#E7EBF1",

  // Type
  ink: "#0E1116",      // 17.9:1 on paper
  inkSoft: "#20272F",  // 12.6:1
  slate: "#48525F",    // 7.6:1 — Stage 10's "muted slate" subheadline
  slateDim: "#6B7684", // 4.6:1 — micro-labels only, never body

  // Accents
  motuBlue: "#0B5FD0",     // 6.2:1
  motuBlueSoft: "#3E86E8", // decorative strokes only
  signal: "#00845F",       // 4.8:1 — TFT / OLED meter green
  signalBright: "#00A67E", // glow/decorative
  amber: "#B4610A",        // 4.9:1 — animated spec counters
  alert: "#B32218",        // 6.1:1 — the Problem chapter only

  // Structure
  line: "rgba(14,17,22,0.12)",
  lineStrong: "rgba(14,17,22,0.24)",
  shadow: "rgba(14,17,22,0.10)",
} as const;

export const RADII = { card: 28, plate: 20, chip: 999, sm: 12 } as const;

/**
 * Landscape has no reserved caption band — the full frame is usable. `marginX`
 * / `marginY` are the inboard padding that keeps critical text and callouts
 * clear of downstream cropping or re-encode. Ambient imagery may still bleed to
 * the true edge.
 */
export const SPACE = {
  width: VIDEO.width,
  height: VIDEO.height,
  marginX: 56,
  marginY: 52,
  get contentW() {
    return this.width - this.marginX * 2; // 1808
  },
  get contentH() {
    return this.height - this.marginY * 2; // 976
  },
} as const;

export const TIMING = { transition: 24, in: 16, hold: 10, out: 14 } as const;

/** Confirmed distributor relationship + contact set (Section 2 Fact 4 / 7). */
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

/**
 * Market Operating Prices, as supplied. Stated distinctly per product and never
 * blended into a range (Section 2 Fact 3). The website carries the best price,
 * so every price beat names it in the same breath.
 */
export const PRICE = {
  ultralite: "Rs. 81,900",
  e828: "Rs. 1,28,000",
  note: "per unit · MOP, inclusive of GST",
  best: "Best price at www.shivanshelectronics.in",
} as const;

/** Verified specifications — Gemini brief Stage 8. Only VERIFIED figures reach the screen. */
export const SPEC = {
  shared: {
    dac: "ESS Sabre32 Ultra",
    dacChip: "ES9026PRO",
    dynamicRange: "125 dB(A)",
    gain: "+74 dB",
    ein: "-129 dBu",
    einNote: "A-weighted",
    gainStep: "1 dB increments",
    mixer: "CueMix 5",
    dsp: "EQ · Reverb · Dynamics · Loopback",
    dcCoupled: "DC-coupled TRS outputs",
    platforms: "macOS · Windows · iOS",
  },
  ul: {
    name: "MOTU UltraLite-mk5",
    role: "The Agile Hub",
    io: "18 in / 22 out",
    channels: "40 channels",
    host: "USB 2.0 High Speed",
    hostNote: "480 Mbps · USB-C",
    preamps: "2 × XLR/TRS combo",
    lineIO: "6 × TRS in / 10 × TRS out",
    optical: "1 × ADAT bank (8 ch)",
    digital: "S/PDIF (RCA) · MIDI I/O",
    phones: "1 × 1/4in stereo",
    rtl: "2.4 ms",
    rtlNote: "round-trip @ 96 kHz, 32-sample buffer",
    display: "White OLED",
    form: "Half-rack desktop",
    power: "External 15V DC",
  },
  e8: {
    name: "MOTU 828",
    role: "The Studio Anchor",
    io: "28 in / 32 out",
    channels: "60 channels",
    host: "USB 3.2 Gen 1",
    hostNote: "5 Gbps · USB-C",
    preamps: "2 × XLR/TRS combo",
    inserts: "Dedicated send / return inserts",
    adc: "AKM AK5578 / AK5572",
    lineIO: "8 × TRS in / 8 × TRS out · 2 × XLR main",
    optical: "2 × ADAT banks (16 ch)",
    digital: "S/PDIF · Word Clock I/O · Foot Switch",
    phones: "2 × 1/4in stereo, independent mixes",
    rtl: "~2 ms",
    rtlNote: "round-trip @ 96 kHz, 32-sample buffer",
    display: '3.9in 480×128 24-bit RGB TFT',
    form: "1U 19in rackmount",
    power: "Internal 100-240V auto-switching",
    control: "Talkback · A/B/C monitor select · dual phones",
  },
} as const;

export type ProductKey = "ul" | "e8";

export const PRODUCT_NAME: Record<ProductKey, string> = {
  ul: "MOTU UltraLite-mk5",
  e8: "MOTU 828",
};
export const PRODUCT_ROLE: Record<ProductKey, string> = {
  ul: "The Agile Hub",
  e8: "The Studio Anchor",
};
export const PRODUCT_PRICE: Record<ProductKey, string> = {
  ul: PRICE.ultralite,
  e8: PRICE.e828,
};

/** Utility — hex + alpha to rgba(). */
export function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16
  );
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
