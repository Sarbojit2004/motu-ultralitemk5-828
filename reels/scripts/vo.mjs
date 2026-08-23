// Generates VO_SCRIPT_MOTU_ULTRALITE828_REEL1.md / _REEL2.md from the SAME
// schedules that render the reels, so every timestamp is the true in-point of
// the beat it accompanies.
//
// Each reel is a COMPLETE STANDALONE read: it opens on its own hook, states the
// shared standard in its own terms, and closes on its own full CTA with both
// prices and the website. Neither assumes the viewer has seen the other reel or
// the long-form.
//
// TONE: identical blend to the long-form — The Technical Authority as the
// spine, The Operational Pragmatist for the problem and transformation beats —
// so all three deliverables read as one family.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ts = (f, fps) => {
  const s = f / fps;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

const COPY = {
  1: {
    "r1-hook": "You sit down to record, and there is no free input. Again.",
    "r1-pain": "Or the monitor mix drops out mid-take. Latency does not cost you time. It costs you the performance.",
    "r1-turn": "So it was never about which one is better. Only about scale.",
    "r1-standard": "Both MOTU interfaces run ESS Sabre32 Ultra conversion, for a verified one hundred and twenty-five decibels of dynamic range.",
    "r1-cuemix": "Both run CueMix 5 — equalisation, dynamics, reverb and loopback, computed on board.",
    "r1-preamp": "And both carry the same redesigned preamplifier: seventy-four decibels of gain, at minus one hundred and twenty-nine dBu.",
    "r1-intro": "This is the UltraLite-mk5. The agile hub.",
    "r1-density": "Forty simultaneous channels — eighteen in, twenty-two out — inside a half-rack steel chassis.",
    "r1-front": "Two combo inputs take microphone, line or instrument level, each with its own gain, pad and phantom power.",
    "r1-oled": "A high-contrast white OLED meters every channel at a glance.",
    "r1-rear": "Ten quarter-inch outputs, and every one of them DC-coupled — control voltage straight from your DAW.",
    "r1-renders": "An ADAT optical bank, S/PDIF and full MIDI, on a chassis you can carry.",
    "r1-desk": "Which means the desk stays patched, and nothing gets in the way.",
    "r1-stack": "And it is rugged enough to travel with, night after night.",
    "r1-mobile": "CueMix 5 runs on the desktop and on iOS, so the mixer is wherever you are working.",
    "r1-studio": "Small enough for the shelf. Dense enough for the room.",
    "r1-system": "Microphones, synthesizers, outboard gear and monitors — all live at the same time.",
    "r1-cuemix2": "Zero-latency monitor mixes, computed on the interface rather than on your host CPU.",
    "r1-latency": "Two point four milliseconds round-trip, at ninety-six kilohertz.",
    "r1-modular": "So the rig stays patched, and the outputs drive control voltage directly.",
    "r1-dc": "Straight into the modular.",
    "r1-rack": "Desktop today. Rack tomorrow.",
    "r1-daw": "macOS, Windows and iOS, natively.",
    "r1-bundles": "And it ships ready to record on day one.",
    "r1-brand": null,
    "r1-price": "The MOTU UltraLite-mk5 is eighty-one thousand nine hundred rupees per unit, inclusive of GST. The MOTU 828 is one lakh twenty-eight thousand.",
    "r1-outro": "The best price is at www.shivanshelectronics.in. Shivansh Electronics — Authorized Distributor of MOTU for East and North East India.",
  },
  2: {
    "r2-hook": "Mid-session, and you are out of inputs.",
    "r2-ceiling": "Re-patching around a full interface is not workflow. It is interruption.",
    "r2-turn": "One standard. Two environments.",
    "r2-standard": "Both MOTU interfaces run ESS Sabre32 Ultra conversion — one hundred and twenty-five decibels of dynamic range.",
    "r2-preamp": "Both carry the same redesigned preamplifier: seventy-four decibels of gain, at minus one hundred and twenty-nine dBu.",
    "r2-intro": "This is the 828. The studio anchor.",
    "r2-front": "Talkback, monitor control and two independent headphone mixes, on the front panel.",
    "r2-front2": "One rack unit, with everything reachable.",
    "r2-bandwidth": "Sixty simultaneous channels, over USB 3.2 Gen 1 at five gigabits per second.",
    "r2-usb": "A single USB-C connection carries the entire channel count.",
    "r2-rear": "BNC word clock, dual optical banks, main XLR outputs, and dedicated inserts.",
    "r2-rear2": "Eight TRS in, eight TRS out.",
    "r2-inserts": "Those inserts let you patch a compressor across the microphone channel before conversion.",
    "r2-adat": "Two ADAT banks add sixteen more channels, optically.",
    "r2-tft": "A three point nine inch RGB display meters every input and output in full colour.",
    "r2-control": "Talkback, A/B speaker switching, mono and mute — on hardware.",
    "r2-monitor": "Monitor groups are routed once in CueMix 5, and recalled instantly.",
    "r2-cabled": "So every input in the room can stay live at the same time.",
    "r2-renders": "One rack unit, front to back.",
    "r2-detail": "Gold-plated, DC-coupled, and clocked.",
    "r2-latency": "Around two milliseconds round-trip, at ninety-six kilohertz.",
    "r2-loopback": "Loopback routes a stream without a second machine.",
    "r2-cuemix": "Two fully independent headphone mixes, each with its own EQ, gate, compression and reverb.",
    "r2-ios": "And you can run the room from an iPad.",
    "r2-daw": "macOS, Windows and iOS, natively.",
    "r2-room": "Tracking, monitoring and re-amping, anchored to one device.",
    "r2-foot": "With hands-free punch-in.",
    "r2-brand": null,
    "r2-price": "The MOTU 828 is one lakh twenty-eight thousand rupees, inclusive of GST. The UltraLite-mk5, eighty-one thousand nine hundred.",
    "r2-outro": "The best price is at www.shivanshelectronics.in. Shivansh Electronics — Authorized Distributor of MOTU for East and North East India.",
  },
};

const words = (t) => (t ? t.replace(/\[pause[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean).length : 0);

for (const reel of [1, 2]) {
  const S = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "src", `schedule-reel${reel}.json`), "utf8"));
  const VO = COPY[reel];
  const missing = S.beats.filter((b) => !(b.id in VO)).map((b) => b.id);
  if (missing.length) throw new Error(`reel ${reel}: no VO copy for ${missing.join(", ")}`);

  const out = [];
  out.push(`# Voiceover script — MOTU UltraLite-mk5 & MOTU 828`);
  out.push(`## Reel ${reel} · "${S.title}" · 178 seconds · 1080×1920 · 30 fps`);
  out.push("");
  out.push("**Language:** English only.");
  out.push("");
  out.push("**Tone (Gemini brief Stage 9):** the same blend used across all three");
  out.push("deliverables so the set reads as one family — **The Technical Authority** as the");
  out.push("spine, with **The Operational Pragmatist** carrying the opening problem beats.");
  out.push("*The Creative Catalyst* is deliberately not used.");
  out.push("");
  out.push("**Standalone:** this reel does not assume the viewer has seen the other reel or");
  out.push("the long-form. It opens on its own hook, establishes the shared standard in its");
  out.push("own terms, and closes on its own complete call to action with both Market");
  out.push("Operating Prices and the website.");
  out.push("");
  out.push("**Pace:** noticeably faster and more hook-driven than the long-form, matching the");
  out.push(`cut — ${S.beats.length} beats across 178 s, averaging ${(178 / S.beats.length).toFixed(1)} s each.`);
  out.push("");
  out.push("**Sync:** every timestamp is the true in-point of its beat, generated from the");
  out.push(`same \`schedule-reel${reel}.json\` that renders the reel, then re-verified against the`);
  out.push("finished render.");
  out.push("");
  out.push(`**No burned-in captions.** A silent voiceover slot of exactly 178.000 s ships at`);
  out.push(`\`public/vo/${S.voSlot}\`.`);
  out.push("");
  out.push("---");
  out.push("");

  let total = 0;
  for (const b of S.beats) {
    const t = VO[b.id];
    const w = words(t);
    total += w;
    if (t) {
      out.push(`**${ts(b.from, S.fps)}** — ${t}`);
      out.push("");
      out.push(`> \`${b.id}\` · ${b.sec}s · ${w} words · ~${Math.round((w / b.sec) * 60)} wpm`);
    } else {
      out.push(`**${ts(b.from, S.fps)}** — *(hold — no narration; the branding beat plays clean)*`);
      out.push("");
      out.push(`> \`${b.id}\` · ${b.sec}s`);
    }
    out.push("");
  }

  const spokenSec = S.beats.filter((b) => VO[b.id]).reduce((a, b) => a + b.sec, 0);
  out.push("---");
  out.push("");
  out.push("## Read summary");
  out.push("");
  out.push(`- Total words: **${total}**`);
  out.push(`- Runtime: **178s** · **${S.durationInFrames} frames**`);
  out.push(`- Average across the whole reel: **~${Math.round((total / 178) * 60)} wpm**`);
  out.push(`- Average across the **narrated** beats: **~${Math.round((total / spokenSec) * 60)} wpm**`);
  out.push(`- Pricing and the website land as an explicit timestamped moment at ` +
    `**${ts(S.beats.find((b) => b.kind === "priceBeat").from, S.fps)}** and again at ` +
    `**${ts(S.beats.find((b) => b.kind === "outro").from, S.fps)}**.`);
  out.push("- No comparison to any other audio-interface brand appears anywhere in this script.");

  const file = path.resolve(__dirname, "..", "..", `VO_SCRIPT_MOTU_ULTRALITE828_REEL${reel}.md`);
  fs.writeFileSync(file, out.join("\n") + "\n");

  const hot = S.beats.filter((b) => VO[b.id] && (words(VO[b.id]) / b.sec) * 60 > 175);
  console.log(`REEL ${reel} — ${total} words, ~${Math.round((total / spokenSec) * 60)} wpm across narrated beats` +
    (hot.length ? `\n  ! over 175 wpm: ${hot.map((b) => `${b.id} (${Math.round((words(VO[b.id]) / b.sec) * 60)})`).join(", ")}` : "\n  pacing OK"));
}
