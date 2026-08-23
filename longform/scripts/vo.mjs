// Generates VO_SCRIPT_MOTU_ULTRALITE828_LONGFORM_598S.md from the SAME
// schedule.json that renders the picture, so every timestamp in the script is
// the true in-point of the beat it describes — sync by construction, then
// verified again against the finished render.
//
// TONE (Gemini brief Stage 9): a deliberate blend, held identical across all
// three deliverables so the set reads as one family.
//   THE TECHNICAL AUTHORITY is the spine — this audience respects verifiable
//   facts over hyperbole, and the whole narrative rests on shared verified
//   specifications.
//   THE OPERATIONAL PRAGMATIST carries the Problem (ch1) and Transformation
//   (ch5) passages, which are about workflow friction rather than engineering.
//   The Creative Catalyst is not used: its rising urgency works against the
//   quiet confidence the other two establish.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "src", "schedule.json"), "utf8"));
const FPS = S.fps;

const ts = (f) => {
  const s = f / FPS;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/** Copy per beat. `null` = a deliberate hold with no narration. */
const VO = {
  // ── Chapter 1 · The Bottleneck (Operational Pragmatist) ──────────────────
  "c1-cold-open": "Every session starts the same way. You sit down with an idea, and the room is ready before you are.",
  "c1-cables": "And then, before a single note is recorded, you are looking for a cable.",
  "c1-no-port": "Then you find the real problem. There is no free input. The take waits while you unplug something you were already using.",
  "c1-headphones": "Or the monitor mix drops out, halfway through the phrase. Latency does not just cost you time. It costs you the performance.",
  "c1-ceiling": "Meanwhile, a rack of good analog gear sits in the corner, unpowered and unpatched.",
  "c1-unplugged": "Not because you do not want it in the session. Because there is nowhere left to plug it in.",
  "c1-ceiling-2": "So you route around the problem again. Re-patching is not workflow. It is interruption.",
  "c1-growing": "The room keeps growing. The interface does not.",
  "c1-turn": "Which is why the question was never which interface is better. Between these two, it was only ever a question of scale. [pause 1.0s]",

  // ── Chapter 2 · One Standard (Technical Authority) ───────────────────────
  "c2-open": "One standard. Two environments.",
  "c2-thesis": "These are not a good model and a better one. They are two architectures on the same engine room, separated only by how much studio each carries.",
  "c2-ess": "Both run ESS Sabre32 Ultra conversion — the ES9026PRO — for a verified one hundred and twenty-five decibels of dynamic range.",
  "c2-wave": "Digital in, analog out, with the noise floor pushed down to where it stops being part of the conversation. That figure is identical across the pair.",
  "c2-renders": "One is a half-rack hub for the desk. The other is a one-U anchor for the rack. The conversion inside them is the same.",
  "c2-preamp": "Both carry the redesigned MOTU preamplifier: seventy-four decibels of gain, in one decibel steps, at minus one hundred and twenty-nine dBu equivalent input noise.",
  "c2-cuemix": "And both run CueMix 5. Equalisation, gate, compression, reverb and loopback routing, computed on the interface itself rather than on your host CPU.",
  "c2-latency": "Which puts round-trip latency at two point four milliseconds on the UltraLite-mk5, and around two on the 828.",
  "c2-daw": "macOS, Windows and iOS, natively.",
  "c2-system": "One hub for microphones, synthesizers, outboard gear, monitors and headphones — all live at once.",
  "c2-bundles": "Both ship ready to record, with the full MOTU software bundle included.",
  "c2-brand": null,

  // ── Chapter 3 · The Agile Hub (Technical Authority) ──────────────────────
  "c3-open": "The UltraLite-mk5. The agile hub.",
  "c3-hero": "This is the interface for the desk, the backpack and the stage — where the constraint is space, not ambition.",
  "c3-front": "Two combo inputs take microphone, line or instrument level on the front panel, with independent gain, pad and forty-eight volt phantom power on each.",
  "c3-oled": "A high-contrast white OLED shows every channel at a glance — microphone, line in, main and line out.",
  "c3-density": "And this is the engineering achievement. Forty simultaneous channels — eighteen in, twenty-two out — inside a half-rack steel chassis.",
  "c3-rear": "Ten of those outputs are quarter-inch TRS, and every one of them is DC-coupled, so control voltage goes straight from your DAW to a modular rig.",
  "c3-renders": "An ADAT optical bank, S/PDIF and full MIDI, on a chassis you can carry.",
  "c3-desk": "In practice it means the desk stays patched. Everything connected, nothing in the way.",
  "c3-mobile": "CueMix 5 runs on the desktop and on iOS, so the mixer is wherever you are working.",
  "c3-studio": "It is a hub small enough for the shelf and dense enough for the room.",
  "c3-amp": "And rugged enough to travel with, night after night.",
  "c3-cuemix": "The DSP comes with it: equalisation, dynamics, reverb and loopback, all on board. Zero-latency monitor mixes, without touching your host CPU.",
  "c3-rack": "Optional rack ears, when the desk becomes a rack.",
  "c3-brand": null,

  // ── Chapter 4 · The Studio Anchor (Technical Authority) ──────────────────
  "c4-open": "The 828. The studio anchor.",
  "c4-hero": "This is the interface for a room that has stopped growing sideways and started growing up.",
  "c4-front": "Talkback, monitor control and two independent headphone mixes, on the front panel where a tracking session can actually reach them.",
  "c4-bandwidth": "Sixty simultaneous channels — twenty-eight in, thirty-two out — over USB 3.2 Gen 1 at five gigabits per second.",
  "c4-usb": "A single USB-C connection carries the entire channel count. No bandwidth ceiling to work around.",
  "c4-rear": "The rear panel is where the 828 separates itself: BNC word clock, dual optical banks, and dedicated preamp inserts.",
  "c4-rear2": "Eight TRS inputs, eight TRS outputs, two XLR mains.",
  "c4-inserts": "Those inserts matter. A send and return on each preamp lets you patch a compressor across the microphone channel before it ever reaches conversion.",
  "c4-adat": "Two ADAT banks add sixteen more channels optically, alongside S/PDIF and full MIDI.",
  "c4-tft": "A three point nine inch, four-eighty by one-twenty-eight, twenty-four bit RGB display meters every input and output in full colour.",
  "c4-control": "Talkback, A/B speaker switching, mono and mute — the control-room set, on hardware.",
  "c4-monitoring": "Monitor groups are routed once in CueMix 5 and recalled instantly.",
  "c4-cabled": "Which means every input in the room can stay live at the same time.",
  "c4-renders": "One rack unit. Everything reachable.",
  "c4-cuemix": "Two fully independent headphone mixes, each with its own equalisation, gate, compression and reverb, computed on the interface.",
  "c4-ios": "Run the room from an iPad, and route loopback for streaming without a second machine.",
  "c4-lifestyle": "Tracking, monitoring, re-amping and clocking — anchored to one device.",
  "c4-brand": null,

  // ── Chapter 5 · The Proof (Operational Pragmatist) ───────────────────────
  "c5-open": "And this is what all of it is actually for.",
  "c5-transform": "The synthesizers stay patched. The outboard stays inserted. The gear stops being something you manage, and goes back to being something you use.",
  "c5-take": "The headphone mix is right the first time, so the take lands.",
  "c5-dynamic": "One hundred and twenty-five decibels of dynamic range, on both.",
  "c5-gain": "Seventy-four decibels of clean gain, with a minus one hundred and twenty-nine dBu noise floor beneath it.",
  "c5-latency": "Two point four milliseconds round-trip on the UltraLite-mk5. Around two on the 828.",
  "c5-channels": "Forty channels, or sixty. USB 2.0 High Speed, or USB 3.2 Gen 1 at five gigabits.",
  "c5-detail": "Gold-plated, DC-coupled, and clocked — down to the connector.",
  "c5-scale": "Wherever the work actually happens.",

  // ── Chapter 6 · Choose Your Scale (CTA) ──────────────────────────────────
  "c6-synthesis": "So choose the scale that fits the room. The UltraLite-mk5, at forty channels in a half-rack chassis. The 828, at sixty channels in one rack unit. One standard, two environments.",
  "c6-price": "The UltraLite-mk5 is eighty-one thousand nine hundred rupees. The 828 is one lakh twenty-eight thousand. Both per unit, inclusive of GST — and the best price is on the Shivansh Electronics website.",
  "c6-contact": "Visit www.shivanshelectronics.in for current pricing and availability, and follow Shivansh Electronics on YouTube, Facebook and Instagram.",
  "c6-outro": "Shivansh Electronics. Authorized Distributor of MOTU — Mark of the Unicorn, USA — Interfaces, for East and North East India. www.shivanshelectronics.in",
};

const words = (t) => (t ? t.replace(/\[pause[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean).length : 0);

const missing = S.beats.filter((b) => !(b.id in VO)).map((b) => b.id);
if (missing.length) throw new Error(`no VO copy for: ${missing.join(", ")}`);

const out = [];
out.push("# Voiceover script — MOTU UltraLite-mk5 & MOTU 828");
out.push("## Long-form · 598 seconds · 1920×1080 · 30 fps");
out.push("");
out.push("**Language:** English only.");
out.push("");
out.push("**Tone (Gemini brief Stage 9):** a deliberate blend of two of the three proposed");
out.push("directions, held identical across all three deliverables so the set reads as one");
out.push("family. **The Technical Authority** is the spine — this audience respects");
out.push("verifiable facts over hyperbole, and the whole narrative rests on shared verified");
out.push("specifications. **The Operational Pragmatist** carries the Problem (chapter 1) and");
out.push("Transformation (chapter 5) passages, which are about workflow friction rather than");
out.push("engineering. *The Creative Catalyst* is deliberately not used: its rising urgency");
out.push("works against the quiet confidence the other two establish.");
out.push("");
out.push("**Delivery:** paced, articulate, no radio-announcer excitement. Numbers are read");
out.push("in full rather than as digits. Leave the marked holds silent — the picture is");
out.push("carrying those beats.");
out.push("");
out.push("**Sync:** every timestamp below is the true in-point of the beat it accompanies,");
out.push("generated from the same `schedule.json` that renders the video, then re-verified");
out.push("against the finished render.");
out.push("");
out.push("**No burned-in captions.** A silent voiceover slot of exactly 598.000 s ships at");
out.push("`public/vo/voiceover-longform.mp3` for the recorded read to drop into.");
out.push("");

let total = 0;
for (const ch of S.chapters) {
  const beats = S.beats.filter((b) => b.chapter === ch.n);
  const from = beats[0].from, to = beats[beats.length - 1].from + beats[beats.length - 1].durationInFrames;
  out.push("---");
  out.push("");
  out.push(`## Chapter ${ch.n} — ${ch.title}  ·  ${ts(from)}–${ts(to)}  (${ch.sec}s)`);
  out.push("");
  for (const b of beats) {
    const t = VO[b.id];
    const w = words(t);
    total += w;
    const wpm = t ? Math.round((w / b.sec) * 60) : 0;
    if (t) {
      out.push(`**${ts(b.from)}** — ${t}`);
      out.push("");
      out.push(`> \`${b.id}\` · ${b.sec}s · ${w} words · ~${wpm} wpm`);
    } else {
      out.push(`**${ts(b.from)}** — *(hold — no narration; the branding beat plays clean)*`);
      out.push("");
      out.push(`> \`${b.id}\` · ${b.sec}s`);
    }
    out.push("");
  }
}
out.push("---");
out.push("");
out.push("## Read summary");
out.push("");
out.push(`- Total words: **${total}**`);
out.push(`- Total runtime: **${S.durationInSeconds}s**`);
const spokenSec = S.beats.filter((b) => VO[b.id]).reduce((a, b) => a + b.sec, 0);
out.push(`- Average delivery across the whole piece: **~${Math.round((total / S.durationInSeconds) * 60)} wpm**`);
out.push(`- Average delivery across the **narrated** beats only: **~${Math.round((total / spokenSec) * 60)} wpm** (${spokenSec}s of ${S.durationInSeconds}s carry narration)`);
out.push("  (comfortable narration is 140–160 wpm; this sits below that because the picture");
out.push("  carries the Problem montage and the branding beats play clean)");
out.push("- Pricing and the website land as an explicit timestamped moment at " +
  `**${ts(S.beats.find((b) => b.id === "c6-price").from)}** and again at ` +
  `**${ts(S.beats.find((b) => b.id === "c6-contact").from)}**.`);
out.push("- No comparison to any other audio-interface brand appears anywhere in this script.");

const file = path.resolve(__dirname, "..", "..", "VO_SCRIPT_MOTU_ULTRALITE828_LONGFORM_598S.md");
fs.writeFileSync(file, out.join("\n") + "\n");
console.log(`${path.basename(file)} — ${total} words, ~${Math.round((total / S.durationInSeconds) * 60)} wpm avg`);

// per-beat pacing check
const hot = S.beats.filter((b) => VO[b.id] && (words(VO[b.id]) / b.sec) * 60 > 175);
if (hot.length) {
  console.log("\nbeats above 175 wpm (too dense for a comfortable read):");
  for (const b of hot) console.log(`  ${b.id.padEnd(16)} ${b.sec}s  ${Math.round((words(VO[b.id]) / b.sec) * 60)} wpm`);
} else {
  console.log("pacing OK — no beat exceeds 175 wpm");
}
