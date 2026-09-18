// ─────────────────────────────────────────────────────────────────────────────
// THEME — MOTU UltraLite-mk5 & MOTU 828, 90 s 4K vertical reel.
//
// The typographic system is carried over from the MOTU AVB Series reel: a brush
// script face carrying the one word each sentence turns on, a black geometric
// sans carrying the rest, the whole typographic layer at 64% opacity sitting ON
// the picture with a hard drop shadow instead of a scrim, a universal safe box,
// and no brand marks until the end screen.
//
// What is NOT carried over is the accent set. The AVB films invented a fresh
// four-hue set precisely so the films would not look like re-edits of one
// another — but these two products already have an identity in THIS repository,
// fixed by the 598 s long-form and the 178 s reel pair: the UltraLite-mk5 is
// cool teal, the 828 is warm amber, CueMix 5 is purple. A viewer who has seen
// those pieces reads the colour before the caption, so the reel inherits them
// rather than teaching a second vocabulary for the same two boxes.
//
// One canvas only. This deliverable is the vertical reel; there is no landscape
// sibling, so Canvas carries a single member and the type scale is 1 throughout.
// ─────────────────────────────────────────────────────────────────────────────

export type Canvas = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  /** Text-safe box — imagery ignores it and runs to every edge. */
  safe: { left: number; right: number; top: number; bottom: number };
  /** Type scale multiplier. 1 = the reel's native scale. */
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
  // The intersection of Instagram Reels', YouTube Shorts' and TikTok's
  // overlays on a 9:16 frame — one master, safe on all three.
  safe: { left: 132, right: 268, top: 300, bottom: 720 },
  scale: 1,
  portrait: true,
};

export const safeW = (c: Canvas) => c.width - c.safe.left - c.safe.right;
export const safeH = (c: Canvas) => c.height - c.safe.top - c.safe.bottom;

/** How opaque the caption lockup is over the picture. 0.64 = 36% transparent. */
export const TYPE_OPACITY = 0.64;

// ── Grounds ──────────────────────────────────────────────────────────────────
// Darker and cooler than the AVB set: this repository's established ground is a
// near-black blue (#04060A / #070B11), and the reel sits inside that world.
export const GROUND = {
  light: "#EEF2F7",
  lightLift: "#F8FAFD",
  lightSink: "#DDE4ED",
  dark: "#04060A",
  darkLift: "#0D131C",
  darkSink: "#010204",
} as const;

export const INK = {
  onLight: "#0B1119",
  onLightSoft: "#42505F",
  onLightDim: "#97A3B2",
  onDark: "#F4F8FD",
  onDarkSoft: "#C3D0E0",
  onDarkDim: "#5B6B7D",
} as const;

// ── Per-product accent ───────────────────────────────────────────────────────
// Two products, two hues, each held for its whole segment. They are NOT a
// hierarchy: the reel's whole argument is that neither unit is a step toward
// the other, so the two accents are equal in weight and chroma — one cool, one
// warm — rather than a light and a dark of the same hue.
export type ProductKey = "pul" | "p828" | "shared";

export const ACCENT: Record<
  ProductKey,
  { key: string; glow: string; name: string; short: string; tag: string }
> = {
  // UltraLite-mk5 — the Agile Hub. Cool teal: light, portable, fresh.
  pul: {
    key: "#0B5F63",
    glow: "#2FD4C8",
    name: "MOTU UltraLite-mk5",
    short: "ULTRALITE-MK5",
    tag: "2 PREAMPS · 18 × 22 · HALF-RACK",
  },
  // 828 — the Studio Anchor. Warm amber: bigger, rack-mounted, room-filling.
  p828: {
    key: "#7A3308",
    glow: "#FF8A3D",
    name: "MOTU 828",
    short: "828",
    tag: "2 PREAMPS · 28 × 32 · 1U RACK",
  },
  // The hook, the shared-platform section and the close belong to neither unit.
  shared: {
    key: "#123C86",
    glow: "#3D8BFF",
    name: "MOTU",
    short: "MOTU",
    tag: "ULTRALITE-MK5 · 828",
  },
};

/** CueMix 5 is the one deliberate commonality, and it carries its own hue —
 *  the purple of the badge art — wherever the software is on screen. */
export const CUEMIX = { key: "#4B2270", glow: "#B36BE8" } as const;

// ── Type ─────────────────────────────────────────────────────────────────────
export const FONT = {
  script: "'ReelScript', 'Brush Script MT', cursive",
  display: "'ReelDisplay', 'Archivo Black', 'Helvetica Neue', Arial, sans-serif",
} as const;

/** Sizes at reel scale (2160 wide). */
export const TYPE = {
  before: { size: 92, track: 5.6 },
  script: { size: 348, track: -2 },
  after: { size: 128, track: 2.2 },
  chapter: { size: 46, track: 6.0 },
  micro: { size: 30, track: 3.0 },
} as const;

// ── Contact — outro only ─────────────────────────────────────────────────────
// The wording is this repository's, not the AVB repository's: here Shivansh
// Electronics is stated as the AUTHORIZED distributor, and the region is
// written "East and North East India".
export const CONTACT = {
  brand: "SHIVANSH ELECTRONICS",
  city: "KOLKATA",
  site: "www.shivanshelectronics.in",
  whatsapp: ["+91 98316 62458", "+91 89818 07755", "+91 91477 00677"],
  role: "Authorized Distributor of MOTU (Mark of the Unicorn, USA)",
  region: "for East and North East India",
} as const;

// ── Pricing — outro only ─────────────────────────────────────────────────────
// Market Operating Price per unit, inclusive of GST, as published in this
// repository's deliverables README. Never spoken in the narration, never shown
// anywhere but the end screen.
export const PRICING: { short: string; price: string }[] = [
  { short: "ULTRALITE-MK5", price: "Rs. 81,900" },
  { short: "828", price: "Rs. 1,28,000" },
];
