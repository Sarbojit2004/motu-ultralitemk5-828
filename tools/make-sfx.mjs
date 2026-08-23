// ─────────────────────────────────────────────────────────────────────────────
// TRANSITION-SFX PALETTE — MOTU UltraLite-mk5 / 828
//
// Section 10 Layer 2 requires the AVB reference palette to be inventoried FIRST
// and reused wherever a moment genuinely calls for the same sound, with fresh
// synthesis only where the existing set does not cover something this project
// needs. That audit produced:
//
//   REUSED DIRECTLY from the AVB repository (public/audio/sfx):
//     encoder-click   aluminium encoder detent — both units have gain encoders;
//                     also carries spec counters and UI ticks
//     talkback-click  the 828 has a front-panel TALK key (images 40 / 52 / 65)
//     data-stream     4 s seamless HF shimmer — the USB transfer texture under
//                     channel-count and I/O-matrix beats
//     avb-ping        a pitched D6 confirmation tone, not AVB-specific in
//                     character; repurposed as the clock-lock ping
//                     ("48k INT LOCK" on the OLED, Word Clock lock on the 828)
//
//   NOT REUSED:
//     rj45-snap       specifically an Ethernet latch. Neither the UltraLite-mk5
//                     nor the 828 has an Ethernet or AVB port, so firing it here
//                     would be dishonest to the hardware.
//
//   NEWLY SYNTHESIZED HERE (same method, same character rules):
//     trs-seat        a 1/4" TRS plug seating in a jack — what the Perfect Patch
//                     beat and every LINE OUT / DC-coupled beat actually needs
//     xlr-lock        an XLR latch engaging — the mic-preamp beats
//     usbc-seat       a USB-C connector seating — the host-connectivity beats
//                     that separate the two products
//
// Character rules carried from the reference: evoke tactile hardware and
// invisible data transfer without competing with the music bed. NO large
// cinematic low-frequency whooshes — every new element is band-limited above
// ~150 Hz so it sits in the gaps of the bed rather than under it.
// ─────────────────────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FFMPEG = process.env.FFMPEG_PATH ?? "/usr/bin/ffmpeg";
const AVB_SFX = path.resolve(
  ROOT, "..",
  "high-end-video-motu-avb-series-16a-848-10pre-avb-switch-shivansh-electronics-kolkata",
  "public", "audio", "sfx"
);

export const SR = 48000;
const TAU = Math.PI * 2;

let _s = 0x2f6e2b1;
const rnd = () => {
  _s ^= _s << 13; _s >>>= 0;
  _s ^= _s >> 17;
  _s ^= _s << 5; _s >>>= 0;
  return (_s / 0xffffffff) * 2 - 1;
};
const seed = (v) => { _s = v >>> 0; };

export function writeWav(file, L, R = L) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, L[i]));
    const r = Math.max(-1, Math.min(1, R[i]));
    buf.writeInt16LE((l * 32767) | 0, o);
    buf.writeInt16LE((r * 32767) | 0, o + 2);
    o += 4;
  }
  fs.writeFileSync(file, buf);
  return n / SR;
}

/** Damped resonator: rings at `f` with 60 dB decay in `decay` seconds. */
function resonate(buf, f, decay, amp, startSample, excite) {
  const w = TAU * f / SR;
  const r = Math.exp(-6.9078 / (decay * SR));
  const c1 = 2 * r * Math.cos(w);
  const c2 = -r * r;
  let y1 = 0, y2 = 0;
  for (let i = startSample; i < buf.length; i++) {
    const y = excite(i - startSample) + c1 * y1 + c2 * y2;
    y2 = y1; y1 = y;
    buf[i] += y * amp;
  }
}
function onePoleHP(buf, fc) {
  const a = Math.exp((-TAU * fc) / SR);
  let px = 0, py = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    py = a * (py + x - px); px = x;
    buf[i] = py;
  }
}
function onePoleLP(buf, fc) {
  const a = Math.exp((-TAU * fc) / SR);
  let y = 0;
  for (let i = 0; i < buf.length; i++) { y = a * y + (1 - a) * buf[i]; buf[i] = y; }
}
function normalize(buf, peak) {
  let m = 0;
  for (let i = 0; i < buf.length; i++) m = Math.max(m, Math.abs(buf[i]));
  if (m < 1e-9) return;
  const g = peak / m;
  for (let i = 0; i < buf.length; i++) buf[i] *= g;
}
function fadeOut(buf, secs) {
  const n = Math.min(buf.length, (secs * SR) | 0);
  for (let i = 0; i < n; i++) buf[buf.length - 1 - i] *= i / n;
}
const alloc = (secs) => new Float32Array(Math.ceil(secs * SR));
const burst = (decaySec) => {
  const k = 1 / (decaySec * SR);
  return (i) => rnd() * Math.exp(-i * k * 6.9078);
};

// ═════════════════════════════════════════════════════════════════════════════
// TRS SEAT — a 1/4" plug sliding into a jack and seating home.
// Three stages: sleeve friction as the plug enters, the contact rings passing,
// then a firm metallic seat. Brighter and rounder than a plastic latch.
// ═════════════════════════════════════════════════════════════════════════════
function trsSeat() {
  seed(3301);
  const b = alloc(0.20);
  // (a) sleeve friction — quiet, broadband, as the barrel slides in
  const fr = Math.round(0.030 * SR);
  for (let i = 0; i < fr; i++) {
    const t = i / fr;
    b[i] += rnd() * 0.085 * Math.sin(Math.PI * t);
  }
  // (b) contact ring passing the detent — small, mid, 34 ms in
  const d1 = Math.round(0.034 * SR);
  resonate(b, 1900, 0.014, 0.26, d1, burst(0.0018));
  resonate(b, 3800, 0.008, 0.14, d1, burst(0.0012));
  // (c) seat home — the definite one, 58 ms in
  const d2 = Math.round(0.058 * SR);
  resonate(b, 2240, 0.030, 0.60, d2, burst(0.0021));
  resonate(b, 4550, 0.017, 0.33, d2, burst(0.0014));
  resonate(b, 6200, 0.010, 0.17, d2, burst(0.0009));
  // sleeve body so it reads as a metal barrel, held above 150 Hz
  resonate(b, 450, 0.024, 0.15, d2, burst(0.0034));
  onePoleHP(b, 210);
  normalize(b, 0.84);
  fadeOut(b, 0.03);
  return b;
}

// ═════════════════════════════════════════════════════════════════════════════
// XLR LOCK — a 3-pin connector mating and its latch engaging.
// Heavier than the TRS: a dull shell mate first, then a positive latch snap.
// ═════════════════════════════════════════════════════════════════════════════
function xlrLock() {
  seed(6607);
  const b = alloc(0.26);
  // (a) shell mating — dull, wide, the two housings meeting
  resonate(b, 900, 0.026, 0.40, 0, burst(0.0036));
  resonate(b, 1750, 0.015, 0.20, 0, burst(0.0024));
  resonate(b, 265, 0.030, 0.15, 0, burst(0.0042));
  // (b) latch snap — bright and decisive, 62 ms later
  const d = Math.round(0.062 * SR);
  resonate(b, 2600, 0.028, 0.62, d, burst(0.0020));
  resonate(b, 5200, 0.015, 0.32, d, burst(0.0013));
  resonate(b, 7900, 0.008, 0.15, d, burst(0.0008));
  onePoleHP(b, 215);
  normalize(b, 0.87);
  fadeOut(b, 0.04);
  return b;
}

// ═════════════════════════════════════════════════════════════════════════════
// USB-C SEAT — a small, precise, high detent. Deliberately the quietest and
// shortest cue in the palette: it punctuates rather than announces.
// ═════════════════════════════════════════════════════════════════════════════
function usbcSeat() {
  seed(8821);
  const b = alloc(0.075);
  resonate(b, 3400, 0.011, 0.50, 0, burst(0.0011));
  resonate(b, 6800, 0.006, 0.26, 0, burst(0.0008));
  resonate(b, 9500, 0.004, 0.12, 0, burst(0.0006));
  resonate(b, 820, 0.008, 0.08, 0, burst(0.0016));
  onePoleHP(b, 400);
  onePoleLP(b, 14000);
  normalize(b, 0.70);
  fadeOut(b, 0.018);
  return b;
}

const NEW = { "trs-seat": trsSeat, "xlr-lock": xlrLock, "usbc-seat": usbcSeat };
const REUSED = ["encoder-click", "talkback-click", "data-stream", "avb-ping"];

const targets = process.argv.slice(2);
if (!targets.length) targets.push("longform", "reels");

const report = [];

// ── reuse: copy the AVB-produced cues verbatim ───────────────────────────────
if (!fs.existsSync(AVB_SFX)) {
  throw new Error(
    `AVB reference SFX not found at ${AVB_SFX}. Section 10 requires reusing the ` +
    `existing palette; attach the AVB repository before running setup.`
  );
}
for (const name of REUSED) {
  const src = path.join(AVB_SFX, `${name}.wav`);
  if (!fs.existsSync(src)) throw new Error(`missing reused cue: ${src}`);
  for (const t of targets) {
    const dir = path.join(ROOT, t, "public", "audio", "sfx");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, path.join(dir, `${name}.wav`));
  }
  report.push({ name, origin: "reused (AVB)" });
}

// ── synthesize the three this project genuinely needs ────────────────────────
for (const [name, fn] of Object.entries(NEW)) {
  const mono = fn();
  const off = 12; // tiny Haas offset so clicks are not dead-centre
  const R = new Float32Array(mono.length);
  for (let i = 0; i < mono.length; i++) R[i] = mono[Math.max(0, i - off)] * 0.94;
  for (const t of targets) {
    const dir = path.join(ROOT, t, "public", "audio", "sfx");
    fs.mkdirSync(dir, { recursive: true });
    writeWav(path.join(dir, `${name}.wav`), mono, R);
  }
  report.push({ name, origin: "synthesized (new)", dur: (mono.length / SR).toFixed(3) });
}

console.log("Transition-SFX palette:");
for (const r of report) {
  console.log(`  ${r.name.padEnd(15)} ${r.origin.padEnd(19)}${r.dur ? r.dur + "s" : ""}`);
}

// ── validate every file decodes ──────────────────────────────────────────────
let ok = 0;
const dir0 = path.join(ROOT, targets[0], "public", "audio", "sfx");
const all = [...REUSED, ...Object.keys(NEW)];
for (const name of all) {
  const f = path.join(dir0, `${name}.wav`);
  const out = execFileSync(FFMPEG, ["-v", "error", "-i", f, "-f", "null", "-"],
    { stdio: ["ignore", "pipe", "pipe"] }).toString();
  if (out.trim() === "") ok++; else console.error(`  ! ${name}: ${out.trim()}`);
}
console.log(`\nvalidated: ${ok}/${all.length} decode cleanly`);
if (ok !== all.length) process.exit(1);
