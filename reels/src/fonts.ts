// Type system pulled from the AVB reference (Section 8 — "do not invent a new
// font system"), cross-referenced against Gemini brief Stage 10.
//
// ARCHIVO (technical grotesque) carries the weight: uppercase tracked
// headlines, spec callouts with tabular numerals, micro-callouts — MOTU's
// identity is engineering-precise. FRAUNCES (editorial serif) is held back for
// the two genuinely editorial moments: the Problem chapter and the
// Transformation beat.
//
// Both ship as variable fonts, self-hosted under public/fonts so the render is
// hermetic (see tools/fetch-fonts.mjs).
import type React from "react";
import { staticFile } from "remotion";

export const DISPLAY = "Fraunces";
export const LABEL = "Archivo";

export const FONT_FACE_CSS = `
@font-face {
  font-family: 'Archivo';
  src: url('${staticFile("fonts/archivo-var.woff2")}') format('woff2');
  font-weight: 100 900; font-style: normal; font-display: block;
}
@font-face {
  font-family: 'Fraunces';
  src: url('${staticFile("fonts/fraunces-var.woff2")}') format('woff2');
  font-weight: 100 900; font-style: normal; font-display: block;
}
`;

export async function loadFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const probes = [
    "400 32px Archivo", "500 32px Archivo", "600 32px Archivo",
    "700 32px Archivo", "800 32px Archivo", "900 32px Archivo",
    "400 32px Fraunces", "500 32px Fraunces", "600 32px Fraunces",
  ];
  await Promise.all(probes.map((p) => (document as Document).fonts.load(p)));
  await (document as Document).fonts.ready;
}

/** Stage 10 Level 1 — the hook. Bold, dominant, uppercase tracking. */
export const headline = (size: number, weight = 800): React.CSSProperties => ({
  fontFamily: LABEL,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 1.02,
  letterSpacing: "-0.015em",
  textTransform: "uppercase",
});

/** Stage 10 Level 2 — the context. Medium weight, muted slate, never competing. */
export const subhead = (size: number, weight = 500): React.CSSProperties => ({
  fontFamily: LABEL,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 1.28,
  letterSpacing: "0.002em",
});

/**
 * Stage 10 specification callout — distinctly tracked, tabular numerals so
 * animated counters do not reflow as digits change.
 */
export const spec = (size: number, weight = 700, tracking = "0.10em"): React.CSSProperties => ({
  fontFamily: LABEL,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: tracking,
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum" 1',
});

/** Stage 10 Level 3 — the narrative. Small, highly legible, used sparingly. */
export const micro = (size: number, weight = 600, tracking = "0.16em"): React.CSSProperties => ({
  fontFamily: LABEL,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: tracking,
  textTransform: "uppercase",
});

/** Editorial serif — Problem and Transformation beats only. */
export const editorial = (size: number, weight = 600): React.CSSProperties => ({
  fontFamily: DISPLAY,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 1.06,
  letterSpacing: "-0.02em",
});
