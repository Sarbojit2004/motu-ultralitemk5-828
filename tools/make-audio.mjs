// ─────────────────────────────────────────────────────────────────────────────
// TWO-LAYER AUDIO PIPELINE (Section 10), built from a deliverable's own
// schedule.json so picture and sound can never drift apart.
//
// Produces, per deliverable:
//   1. music-bed.mp3    the SELECTED beds with per-chapter stem automation,
//                       spanning the exact runtime.
//   2. sfx-timeline.mp3 the transition SFX ONLY (music fully silent), each cue
//                       at the exact frame it fires in the finished video, as
//                       ONE continuous file spanning the full timeline. This is
//                       what lets loudness be raised later without losing sync.
//   3. a silent voiceover placeholder slot at the exact runtime.
//
// MUSIC SOURCE (confirmed, not assumed): this project's own repository supplies
// no music — its only audio is prior-build output, which is excluded. The
// source is therefore the AVB repository's sound-effects/, which holds FIVE
// instrumental tracks and 17 stems. Selection was made on actual waveform
// analysis (tempo, onset density, crest, band balance), not on filenames:
//
//   Mindscape     71.8bpm  4.38 onsets/s  59.8% mid  -> SIGNATURE: opens and
//                 closes every deliverable. The only mid-forward track, so it
//                 sits WITH narration instead of under it.
//   ETERNITY      0.03 onsets/s, crest 1.47          -> Problem/Pain. Effectively
//                 a sustained pad; almost no transients.
//   GIFTED        92.0% low, dyn 0.530               -> the UltraLite chapter.
//   DIABLO        107.7bpm, has a MELODY stem        -> the 828 chapter.
//   Black & Blue  1.38 onsets/s, crest 2.34          -> the Proof chapter.
//
// Deployment is the AVB-proven Path A / Path B blend, held identical across all
// three deliverables so the set reads as one family. Per-chapter scoring is not
// decoration: every track is shorter than the 598 s long-form, so drawing a
// fresh window from each chapter's own track is what keeps the bed from
// audibly looping.
// ─────────────────────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FFMPEG = process.env.FFMPEG_PATH ?? "/usr/bin/ffmpeg";
const MUSIC_SRC = path.resolve(
  ROOT, "..",
  "high-end-video-motu-avb-series-16a-848-10pre-avb-switch-shivansh-electronics-kolkata",
  "sound-effects"
);
const SR = 48000;

const TRACK_FILE = {
  "Mindscape": "ES_Mindscape - Lennon Hutton",
  "ETERNITY": "ES_ETERNITY - BLUE STEEL",
  "GIFTED": "ES_GIFTED (Instrumental Version) - Bhris Drip",
  "DIABLO": "ES_DIABLO - BLUE STEEL",
  "Black & Blue": "ES_Black & Blue (Instrumental Version) - Torii Wolf",
};
const stemPath = (track, stem) => {
  const base = TRACK_FILE[track];
  if (!base) throw new Error(`unknown track: ${track}`);
  const [head, tail] = base.split(" - ");
  return path.join(MUSIC_SRC, `${head} STEMS ${stem} - ${tail}.mp3`);
};

function decodeStereo(file) {
  const tmp = path.join(os.tmpdir(), `mx-${Math.random().toString(36).slice(2)}.raw`);
  execFileSync(FFMPEG, ["-i", file, "-ac", "2", "-ar", String(SR), "-f", "f32le", "-y", tmp],
    { stdio: ["ignore", "ignore", "pipe"] });
  const buf = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  const n = Math.floor(buf.length / 8);
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = buf.readFloatLE(i * 8); R[i] = buf.readFloatLE(i * 8 + 4); }
  return { L, R, n };
}

function readWav(file) {
  const b = fs.readFileSync(file);
  let off = 12, fmt = null;
  while (off + 8 <= b.length) {
    const id = b.toString("ascii", off, off + 4);
    const size = b.readUInt32LE(off + 4);
    if (id === "fmt ") fmt = { ch: b.readUInt16LE(off + 10), bits: b.readUInt16LE(off + 22) };
    if (id === "data") {
      const ch = fmt.ch, by = fmt.bits / 8, n = Math.floor(size / (ch * by));
      const L = new Float32Array(n), R = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const p = off + 8 + i * ch * by;
        L[i] = b.readInt16LE(p) / 32768;
        R[i] = ch > 1 ? b.readInt16LE(p + 2) / 32768 : L[i];
      }
      return { L, R, n };
    }
    off += 8 + size + (size % 2);
  }
  throw new Error(`no data chunk in ${file}`);
}

function writeWav(file, L, R) {
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
    buf.writeInt16LE((Math.max(-1, Math.min(1, L[i])) * 32767) | 0, o);
    buf.writeInt16LE((Math.max(-1, Math.min(1, R[i])) * 32767) | 0, o + 2);
    o += 4;
  }
  fs.writeFileSync(file, buf);
}
/** Bitrate is chosen per layer rather than blanket-320k: the whole project zip
 *  has to stay inside GitHub's 100 MB per-file limit (git-lfs is unavailable
 *  here), and these two layers have very different demands. The music bed is
 *  dense and carries the piece, so it stays high; the SFX timeline is sparse,
 *  quiet and band-limited above ~150 Hz, so it does not need the same. Both are
 *  re-encoded to AAC in the final mux regardless. */
/** The standalone deliverable, written LOSSLESSLY from the float mix.
 *
 *  Not a re-export of the embedded MP3 and not a Remotion round-trip: this is
 *  the same sample data the video embeds, before any lossy encoding, at the
 *  deliverable's exact runtime with every SFX cue at its final frame position.
 *  FLAC because a 598 s stereo WAV is 115 MB — past GitHub's per-file limit —
 *  and because it is lossless, which a WAV of the same audio would only match
 *  at four times the size. */
const toFlac = (wav, flac) => {
  execFileSync(FFMPEG, ["-i", wav, "-c:a", "flac", "-compression_level", "8", "-y", flac],
    { stdio: ["ignore", "ignore", "pipe"] });
};

const toMp3 = (wav, mp3, kbps) => {
  execFileSync(FFMPEG, ["-i", wav, "-codec:a", "libmp3lame", "-b:a", `${kbps}k`, "-ar", String(SR), "-y", mp3],
    { stdio: ["ignore", "ignore", "pipe"] });
  fs.unlinkSync(wav);
};

// ── build one deliverable ────────────────────────────────────────────────────
function build(proj, scheduleFile, outBase) {
  const S = JSON.parse(fs.readFileSync(scheduleFile, "utf8"));
  const FPS = S.fps;
  const TOTAL_SEC = S.durationInSeconds;
  const N = Math.round(TOTAL_SEC * SR);
  const pub = path.join(ROOT, proj, "public");
  // Reels write one bed and one SFX timeline PER REEL; the long-form writes one.
  const sfx_ = S.musicSuffix ?? "";
  const outDir = path.join(pub, "audio");
  const deliverDir = path.join(ROOT, proj, "out");
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(deliverDir, { recursive: true });
  fs.mkdirSync(path.join(pub, "vo"), { recursive: true });

  console.log(`\n━━ ${outBase} — ${TOTAL_SEC}s / ${S.durationInFrames}f ━━`);

  // ── 1. MUSIC BED ───────────────────────────────────────────────────────────
  const bedL = new Float32Array(N), bedR = new Float32Array(N);
  const XF = Math.round(1.6 * SR); // equal-power crossfade between sections

  // Per-section loudness matching. The five tracks differ enormously in level
  // and band balance (Mindscape is mid-forward and sits ~10 dB below ETERNITY's
  // low-heavy mix), so a single global normalise would make a whole chapter
  // sound like the bed had dropped out. Each section is measured and matched to
  // a common RMS reference BEFORE the global peak normalise.
  const SECTION_RMS = 0.085;
  const sections = [];

  for (const m of S.music) {
    const startS = Math.round(m.fromSec * SR);
    const endS = Math.min(N, Math.round(m.toSec * SR));
    const lenS = endS - startS;
    if (lenS <= 0) continue;
    const offS = Math.round((m.srcOffsetSec ?? 0) * SR);

    const secL = new Float32Array(lenS), secR = new Float32Array(lenS);
    for (const [stem, gain] of Object.entries(m.stems)) {
      const f = stemPath(m.track, stem);
      if (!fs.existsSync(f)) throw new Error(`missing stem: ${f}`);
      const src = decodeStereo(f);
      for (let i = 0; i < lenS; i++) {
        // wrap the source rather than run out; every window is reported below so
        // this is a safety net, not the normal path.
        const si = (offS + i) % src.n;
        secL[i] += src.L[si] * gain;
        secR[i] += src.R[si] * gain;
      }
      const need = offS + lenS;
      if (need > src.n) {
        console.log(`   ! ${m.track}/${stem}: window ${(need / SR).toFixed(1)}s exceeds source ` +
                    `${(src.n / SR).toFixed(1)}s — wrapped`);
      }
    }

    // measure this section, then match it to the common reference
    let acc = 0;
    for (let i = 0; i < lenS; i++) acc += secL[i] * secL[i] + secR[i] * secR[i];
    const secRms = Math.sqrt(acc / (2 * lenS)) || 1;
    const match = SECTION_RMS / secRms;
    sections.push({ ch: m.chapter, track: m.track, rms: secRms, match });

    for (let i = 0; i < lenS; i++) {
      let env = match;
      if (i < XF) env *= Math.sin((i / XF) * Math.PI * 0.5);
      const rem = lenS - i;
      if (rem < XF) env *= Math.sin((rem / XF) * Math.PI * 0.5);
      const d = startS + i;
      bedL[d] += secL[i] * env;
      bedR[d] += secR[i] * env;
    }
    console.log(`   ch${m.chapter} ${String(m.track).padEnd(13)} ` +
                `${String(Math.round(m.fromSec)).padStart(3)}s→${String(Math.round(m.toSec)).padStart(3)}s  ` +
                `stems=[${Object.keys(m.stems).join("+")}]`);
  }
  console.log("   loudness match:",
    sections.map((x) => `ch${x.ch} ${x.match.toFixed(2)}x`).join("  "));

  // Peak-safe delivery: the user raises loudness later to sit against the
  // recorded voiceover, so the bed ships with headroom rather than pushed.
  let pk = 0;
  for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(bedL[i]), Math.abs(bedR[i]));
  const g = pk > 0 ? 0.72 / pk : 1;
  for (let i = 0; i < N; i++) { bedL[i] *= g; bedR[i] *= g; }
  const fade = Math.round(1.2 * SR);
  for (let i = 0; i < fade; i++) {
    const k = i / fade;
    bedL[i] *= k; bedR[i] *= k;
    bedL[N - 1 - i] *= k; bedR[N - 1 - i] *= k;
  }
  const bw = path.join(outDir, `music-bed${sfx_}.wav`);
  writeWav(bw, bedL, bedR);
  toFlac(bw, path.join(deliverDir, `${outBase}-music-bed.flac`));
  toMp3(bw, path.join(outDir, `music-bed${sfx_}.mp3`), 256);
  console.log(`   music bed    : music-bed${sfx_}.mp3  (pre-normalise peak ${pk.toFixed(3)})`);

  // ── 2. SFX TIMELINE ────────────────────────────────────────────────────────
  const sfxL = new Float32Array(N), sfxR = new Float32Array(N);
  const cache = {};
  const load = (cue) => (cache[cue] ||= readWav(path.join(pub, "audio", "sfx", `${cue}.wav`)));

  let nCue = 0, nAmb = 0;
  for (const b of S.beats) {
    for (const [cue, atFrame, gain, rate = 1] of b.sfx ?? []) {
      const s = load(cue);
      // data-stream is a 4 s seamless loop, authored as an ambient texture:
      // it beds the whole beat rather than firing as a one-shot.
      if (cue === "data-stream") {
        const start = Math.round(((b.from + atFrame) / FPS) * SR);
        const end = Math.min(N, Math.round(((b.from + b.durationInFrames) / FPS) * SR));
        const ramp = Math.round(0.5 * SR);
        for (let d = start, i = 0; d < end; d++, i++) {
          let env = gain;
          if (i < ramp) env *= i / ramp;
          const rem = end - d;
          if (rem < ramp) env *= rem / ramp;
          const k = i % s.n;
          sfxL[d] += s.L[k] * env; sfxR[d] += s.R[k] * env;
        }
        nAmb++;
        continue;
      }
      const start = Math.round(((b.from + atFrame) / FPS) * SR);
      const len = Math.floor(s.n / rate);
      for (let i = 0; i < len; i++) {
        const d = start + i;
        if (d >= N) break;
        const sp = i * rate;
        const i0 = Math.floor(sp), fr = sp - i0, i1 = Math.min(i0 + 1, s.n - 1);
        sfxL[d] += (s.L[i0] * (1 - fr) + s.L[i1] * fr) * gain;
        sfxR[d] += (s.R[i0] * (1 - fr) + s.R[i1] * fr) * gain;
      }
      nCue++;
    }
  }

  let sp = 0;
  for (let i = 0; i < N; i++) sp = Math.max(sp, Math.abs(sfxL[i]), Math.abs(sfxR[i]));
  if (sp > 0.95) {
    const sg = 0.95 / sp;
    for (let i = 0; i < N; i++) { sfxL[i] *= sg; sfxR[i] *= sg; }
  }
  const sw = path.join(outDir, `sfx-timeline${sfx_}.wav`);
  writeWav(sw, sfxL, sfxR);
  toFlac(sw, path.join(deliverDir, `${outBase}-transition-sfx-timeline.flac`));
  toMp3(sw, path.join(outDir, `sfx-timeline${sfx_}.mp3`), 160);
  console.log(`   sfx timeline : sfx-timeline${sfx_}.mp3  cues=${nCue}  ambient=${nAmb}  peak=${sp.toFixed(3)}`);

  // ── 3. silent VO placeholder ───────────────────────────────────────────────
  const voName = S.voSlot ?? "voiceover.mp3";
  const vo = path.join(pub, "vo", voName);
  execFileSync(FFMPEG, ["-f", "lavfi", "-i", `anullsrc=r=${SR}:cl=stereo`, "-t", String(TOTAL_SEC),
    "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "32k", "-y", vo], { stdio: ["ignore", "ignore", "pipe"] });
  console.log(`   vo slot      : ${voName} (silent placeholder)`);

  // ── validate ───────────────────────────────────────────────────────────────
  for (const f of [path.join(outDir, `music-bed${sfx_}.mp3`), path.join(outDir, `sfx-timeline${sfx_}.mp3`), vo]) {
    const probe = execFileSync(FFMPEG, ["-v", "error", "-i", f, "-f", "null", "-"],
      { stdio: ["ignore", "pipe", "pipe"] }).toString();
    if (probe.trim()) throw new Error(`decode error in ${f}: ${probe}`);
    const dur = parseFloat(execFileSync("/usr/bin/ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
    if (Math.abs(dur - TOTAL_SEC) > 0.12) {
      throw new Error(`${path.basename(f)} is ${dur}s, expected ${TOTAL_SEC}s`);
    }
  }
  for (const f of [path.join(deliverDir, `${outBase}-music-bed.flac`),
                   path.join(deliverDir, `${outBase}-transition-sfx-timeline.flac`)]) {
    const dur = parseFloat(execFileSync("/usr/bin/ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
    if (Math.abs(dur - TOTAL_SEC) > 0.12) throw new Error(`${path.basename(f)} is ${dur}s, expected ${TOTAL_SEC}s`);
    console.log(`   deliverable  : ${path.basename(f)}  ${(fs.statSync(f).size / 1e6).toFixed(1)} MB  ${dur.toFixed(2)}s`);
  }
  console.log(`   validated    : embedded layers + both standalone deliverables, all at ${TOTAL_SEC}s`);
}

const which = process.argv[2] ?? "longform";
if (which === "longform") {
  build("longform", path.join(ROOT, "longform/src/schedule.json"), "motu-ultralite828-longform");
} else {
  for (const r of ["1", "2"]) {
    build("reels", path.join(ROOT, `reels/src/schedule-reel${r}.json`), `motu-ultralite828-reel-${r}`);
  }
}
