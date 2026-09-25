// ─────────────────────────────────────────────────────────────────────────────
// THEME — the design system for the MOTU UltraLite-mk5 / 828 explainer.
//
// ONE FORMAT. This project renders a single 3840 x 2160 film. The 90-second 4K
// vertical reel for the same two products already exists as its own project at
// ../ultralite-828-reel, and the 1080p ten-minute long-form at ../longform;
// neither is touched from here.
//
// CARRIED OVER from the AVB series, the UltraLite reel and the M-Series films,
// by instruction — these two products are the fourth film in one house style:
//
//   * the type pairing — a heavy brush script carrying ONE key word, a black
//     geometric sans carrying the rest
//   * the three-tier caption lockup, split at that key word
//   * TYPE_OPACITY: the whole typographic layer at 64%, applied once
//   * legibility bought back with a hard, tight shadow rather than a scrim
//   * gimbal camera language only
//   * NO PICTURE IS EVER SLICED, CROPPED TO A DIAGONAL, OR SHOWN IN PART —
//     enforced by src/components/Stage.ts and proved by scripts/framing.mjs
//
// WHAT CHANGES FOR THIS PRODUCT PAIR:
//
//   1. THE PALETTE IS SAMPLED OFF THE HARDWARE IN SITU rather than off a
//      product shot on a white background — the lit meter bars, the display
//      glow and the 48V legends, read out of the eight deployment clips in
//      public/broll. Nothing here is invented.
//
//   2. COLOUR MEANS WHICH IDEA, NOT WHICH MODEL. The research is explicit that
//      these two interfaces share an identical ESS Sabre32 converter tier, an
//      identical +74 dB preamplifier design and an identical CueMix 5
//      ecosystem, and differ in bandwidth, form factor and I/O scale. Giving
//      each model its own colour would argue the opposite of the film.
//
//   3. NO PRICING. Not a figure, not a currency, not a comparison, anywhere —
//      which is a change from the earlier ten-minute long-form in this
//      repository, and matches the AVB and M-Series films.
//
//   4. THE OUTRO IS THE ONLY BRANDED FRAME, ten seconds, carrying the
//      territory. Nothing branded appears before it.
// ─────────────────────────────────────────────────────────────────────────────

export type FormatId = "video";

export type Format = {
  id: FormatId;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  portrait: boolean;
  /** Where things that MUST be read are allowed to live. */
  safe: { left: number; right: number; top: number; bottom: number; w: number; h: number };
  type: {
    before: { size: number; track: number };
    script: { size: number; track: number };
    after: { size: number; track: number };
    chapter: { size: number; track: number };
    micro: { size: number; track: number };
    body: { size: number; track: number };
  };
  /** Where the photographic plate is centred, as a fraction of frame height. */
  plateY: number;
  /** How far past the frame width a bled plate hangs. Unused by the staged path. */
  overhang: number;
  /** The branded end screen, in seconds. The ONLY branded frames in the film. */
  outroSeconds: number;
};

const box = (left: number, right: number, top: number, bottom: number, W: number, H: number) => ({
  left, right, top, bottom, w: W - left - right, h: H - top - bottom,
});

// A 16:9 frame has no action rail and no caption block; the only reliable
// intrusion is the player's own control strip along the bottom.
const VIDEO_16_9: Format = {
  id: "video",
  width: 3840,
  height: 2160,
  fps: 30,
  durationInFrames: 0, // DERIVED — see films.ts; nothing here is typed by hand
  portrait: false,
  safe: box(220, 220, 150, 210, 3840, 2160),
  type: {
    before: { size: 60, track: 4.8 },
    script: { size: 212, track: -2 },
    after: { size: 86, track: 2.0 },
    chapter: { size: 38, track: 5.2 },
    micro: { size: 26, track: 2.6 },
    body: { size: 40, track: 1.2 },
  },
  plateY: 0.5,
  overhang: 1.10,
  outroSeconds: 10,
};

export const FORMATS: Record<FormatId, Format> = { video: VIDEO_16_9 };

/** One format, so this is a constant — kept as a function so the shared
 *  components that call it per frame need no edit. */
export const formatFor = (_width: number, _height: number): Format => VIDEO_16_9;

export const secAt = (fps: number) => (s: number) => Math.round(s * fps);

/** How opaque the caption lockup is over the picture. 0.64 = 36% transparent. */
export const TYPE_OPACITY = 0.64;

// ── Grounds ──────────────────────────────────────────────────────────────────
export const GROUND = {
  light: "#F0EEEA",
  lightLift: "#FAF9F7",
  lightSink: "#E2DFD9",
  lightLine: "rgba(20,22,26,0.13)",

  dark: "#08090B",
  darkLift: "#131518",
  darkSink: "#030304",
  darkLine: "rgba(255,255,255,0.10)",
} as const;

export const INK = {
  onLight: "#141820",
  onLightSoft: "#474C55",
  onLightDim: "#A2A6AD",
  onDark: "#F7F9FB",
  onDarkSoft: "#B4B9C0",
  onDarkDim: "#5B6068",
} as const;

// ── Accent: one hue per idea, every one sampled off the hardware ─────────────
// Sources, all read out of the deployment footage in public/broll:
//   standard  the lit meter bars on both units          #36E77F  clip 18, 17
//   agile     the UltraLite-mk5's display glow on a desk #446CBE  clip 11, 12
//   anchor    the 828's colour LCD in a control room     #3E7ACF  clip 15, 16
//   gain      the red of the 48V legends and meter tops  #C4484D  clip 11, 13
//   latency   the amber of a meter running hot           #FBBA57  clip 18, 16
//   choose    the chassis itself, near-black, cool lift
export type AccentKey =
  | "standard"  // the shared converter tier — what does NOT change
  | "agile"     // the UltraLite-mk5's environment: desk, backpack, stage
  | "anchor"    // the 828's environment: the rack, the control room
  | "gain"      // the preamps and what they are asked to do
  | "latency"   // CueMix 5, round trip, playability
  | "choose";   // the hook and the close

export const ACCENT: Record<AccentKey, { key: string; glow: string; label: string }> = {
  standard: { key: "#1B7A46", glow: "#36E77F", label: "ONE STANDARD" },
  agile:    { key: "#24407C", glow: "#6E9BE8", label: "THE AGILE HUB" },
  anchor:   { key: "#123E73", glow: "#4FA3F0", label: "THE STUDIO ANCHOR" },
  gain:     { key: "#8A2E33", glow: "#FF6E6E", label: "THE GAIN" },
  latency:  { key: "#8A5F13", glow: "#FBBA57", label: "PLAYABILITY" },
  choose:   { key: "#16181C", glow: "#EAF0F6", label: "TWO ENVIRONMENTS" },
};

// ── Type ─────────────────────────────────────────────────────────────────────
export const FONT = {
  script: "'ReelScript', 'Brush Script MT', cursive",
  display: "'ReelDisplay', 'Archivo Black', 'Helvetica Neue', Arial, sans-serif",
} as const;

// ── Contact — the end screen, and nowhere else ───────────────────────────────
export const CONTACT = {
  brand: "SHIVANSH ELECTRONICS",
  city: "KOLKATA",
  site: "www.shivanshelectronics.in",
  whatsapp: ["+91 98316 62458", "+91 89818 07755", "+91 91477 00677"],
  role: "Exclusive Distributor of MOTU (Mark of the Unicorn, USA)",
  role2: "for East and North-East India",
} as const;

// ── The two interfaces ───────────────────────────────────────────────────────
// Every count below is from the research brief in this repository, which drew
// on manufacturer documentation and teardowns. The detail most often got wrong:
// these two do NOT share one internal engine the way the AVB 16A, 848 and 10pre
// did. They share a converter tier, a preamp design and an ecosystem.
//
// `mic` is the count of front-panel combo microphone inputs, read off the panel
// renders themselves — two on each, which is part of why the preamp chapter is
// about what they share rather than about how many there are.
export const MODELS = [
  {
    name: "UltraLite-mk5", short: "ULTRALITE-MK5", role: "THE AGILE HUB",
    channels: 40, inputs: 18, outputs: 22, adat: 1, rack: "HALF-RACK DESKTOP",
    bus: "USB 2.0 HIGH SPEED", display: "WHITE OLED", mic: 2,
    inserts: false, wordClock: false, talkback: false,
  },
  {
    name: "828", short: "828", role: "THE STUDIO ANCHOR",
    channels: 60, inputs: 28, outputs: 32, adat: 2, rack: "1U 19-INCH RACK",
    bus: "USB 3.2 GEN 1", display: "480x128 COLOUR LCD", mic: 2,
    inserts: true, wordClock: true, talkback: true,
  },
] as const;

// ── The numbers the film is allowed to state ─────────────────────────────────
// Anything not in this table does not get said.
export const SPEC = {
  dac: "ESS Sabre32",
  dynamicRange: 125,        // dB, the shared converter tier
  lineInDynamic: 120,       // dB, the 828's line inputs (AKM AK5578 / AK5572)
  gain: 74,                 // dB of preamplifier gain, identical on both
  roundTrip: 2,             // ms, CueMix 5 hardware DSP monitoring
  mixer: "CueMix 5",
  agileChannels: 40,
  anchorChannels: 60,
  anchorBus: 5,             // Gbps, USB 3.2 Gen 1
  firstFireWire: 2001,      // the year the 828 line began
} as const;
