// ─────────────────────────────────────────────────────────────────────────────
// THEME — MOTU UltraLite-mk5 + 828 reel. The same system as the AVB Series
// films (and, by instruction, the M-Series reel): a brush script carrying the
// one word each sentence turns on, a black geometric sans carrying the rest,
// the whole typographic layer at 64% opacity ON the picture with a hard drop
// shadow instead of a scrim, one universal safe box, no branding until the end
// screen. Only the per-product accents change — a new pair, so this reel never
// reads as a re-edit of the AVB or M-Series films beside it on the channel.
// ─────────────────────────────────────────────────────────────────────────────

export type Canvas = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  safe: { left: number; right: number; top: number; bottom: number };
  scale: number;
  portrait: boolean;
};

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

/** 90.000 s vertical reel, 2160 × 3840. */
export const REEL: Canvas = {
  width: 2160,
  height: 3840,
  fps: FPS,
  durationInFrames: 2700,
  safe: { left: 132, right: 268, top: 300, bottom: 720 },
  scale: 1,
  portrait: true,
};

export const safeW = (c: Canvas) => c.width - c.safe.left - c.safe.right;
export const safeH = (c: Canvas) => c.height - c.safe.top - c.safe.bottom;

/** How opaque the caption lockup is over the picture. 0.64 = 36% transparent. */
export const TYPE_OPACITY = 0.64;

export const GROUND = {
  light: "#F2EFE9",
  lightLift: "#FAF8F4",
  lightSink: "#E6E2D9",
  dark: "#08080B",
  darkLift: "#131318",
  darkSink: "#040405",
} as const;

export const INK = {
  onLight: "#16140F",
  onLightSoft: "#4A4740",
  onLightDim: "#A8A399",
  onDark: "#FBFAF7",
  onDarkSoft: "#B9B6AE",
  onDarkDim: "#5E5C57",
} as const;

// ── Per-product accent ───────────────────────────────────────────────────────
// Two products, two hues, each held for its whole segment. A different pair
// from the AVB films' coral/gold/emerald/blue and the M-Series amber/cyan/rose.
export type ProductKey = "pmk5" | "p828" | "shared";

export const ACCENT: Record<ProductKey, { key: string; glow: string; name: string; short: string; tag: string }> = {
  // UltraLite-mk5 — the half-rack that travels. Teal: the desk, the bag, the iPad.
  pmk5: { key: "#178C7E", glow: "#3DE0C0", name: "MOTU UltraLite-mk5", short: "UltraLite-mk5", tag: "18 IN · 22 OUT · HALF RACK" },
  // 828 — the full rack unit that anchors a room. Violet: the control room.
  p828: { key: "#7B3FC4", glow: "#C57CFF", name: "MOTU 828", short: "828", tag: "28 IN · 32 OUT · 1U RACK" },
  shared: { key: "#1E1B16", glow: "#FFF6E9", name: "MOTU UltraLite-mk5 + 828", short: "ULTRALITE-mk5 · 828", tag: "1 ENGINE · 2 SIZES" },
};

export const FONT = {
  script: "'ReelScript', 'Brush Script MT', cursive",
  display: "'ReelDisplay', 'Archivo Black', 'Helvetica Neue', Arial, sans-serif",
} as const;

export const TYPE = {
  before: { size: 92, track: 5.6 },
  script: { size: 348, track: -2 },
  after: { size: 128, track: 2.2 },
  chapter: { size: 46, track: 6.0 },
  micro: { size: 30, track: 3.0 },
} as const;

// ── Contact — outro only ─────────────────────────────────────────────────────
export const CONTACT = {
  brand: "SHIVANSH ELECTRONICS",
  city: "KOLKATA",
  site: "www.shivanshelectronics.in",
  whatsapp: ["+91 98316 62458", "+91 89818 07755", "+91 91477 00677"],
  role: "Exclusive Distributor of MOTU (Mark of the Unicorn, USA)",
  region: "for East & North East India",
} as const;
