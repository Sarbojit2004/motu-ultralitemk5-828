import { staticFile } from "remotion";

// ─────────────────────────────────────────────────────────────────────────────
// THE TYPE PAIRING — carried over unchanged from the M-Series reel.
//
// A heavy brush script carries ONE word per caption; a black geometric sans
// carries the rest. The client supplied a BRITTANIC + LO-FLICKER specimen as an
// image rather than as font files, so the two roles are filled by the closest
// freely-licensable equivalents (Pacifico and Archivo Black). To swap the real
// faces in, drop them at public/fonts/script.ttf and public/fonts/display.ttf
// and re-render — every size below is relative and re-flows to whatever face
// is behind the role.
// ─────────────────────────────────────────────────────────────────────────────

export const SCRIPT = "ReelScript";
export const DISPLAY = "ReelDisplay";

export const FONT_FACE_CSS = `
@font-face {
  font-family: '${SCRIPT}';
  src: url('${staticFile("fonts/script.ttf")}') format('truetype');
  font-weight: 400; font-style: normal; font-display: block;
}
@font-face {
  font-family: '${DISPLAY}';
  src: url('${staticFile("fonts/display.ttf")}') format('truetype');
  font-weight: 400 900; font-style: normal; font-display: block;
}
`;
