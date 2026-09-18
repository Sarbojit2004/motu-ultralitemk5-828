#!/usr/bin/env node
// Generates the two read-aloud scripts the client records:
//   ../VO_SCRIPT_MOTU_ULTRALITE828_REEL_90S.md
// Every timestamp is DERIVED from src/script.ts, never typed by hand, so the
// printed script and the on-screen captions can never disagree.
// Run: node --experimental-strip-types scripts/build-script.mjs
import { writeFileSync } from "node:fs";
import { REEL_TL, REEL_WPM, SEGMENT_GAP } from "../src/script.ts";

const ts = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const tsp = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(1).padStart(4, "0")}`;

const TITLES = {
  hook: "HOOK — two rooms, then the three things that do not change",
  shared: "ONE STANDARD — the conversion, the preamp and the mixer both units share",
  sul: "MOTU UltraLite-mk5 — THE AGILE HUB: 18 × 22, half-rack, iPad, standalone",
  s828: "MOTU 828 — THE STUDIO ANCHOR: 28 × 32, 1U, monitoring, loopback",
  together: "THE BRIDGE — the same engine, twice",
  close: "CLOSE — the distributor line",
};
const NOTES = {
  hook: "Flat and even. Two statements of fact, then three two-word lines — land 'Same converters. Same preamps. Same mixer.' as three separate beats, not a list read at speed. 'Neither is a smaller version of the other.' is the thesis: slow, and stop after it.",
  shared: "Plain and unhurried. These four numbers are the credibility of everything that follows; read each one clean and leave the beat after it. 'So the choice is never quality. It is the room.' is the turn into the two acts.",
  sul: "Lighter, quicker, but never rushed — this section is about moving. 'Run it with no computer.' is a capability, not a boast.",
  s828: "Same register, a shade more settled. The middle list (display, talkback, headphones, inserts, loopback, optical) is a count, not a build-up. 'The same 2 preamps on the front.' must not sound like an apology — it is the point.",
  together: "Slow. Three short lines, a beat between each.",
  close: "Warm and unhurried. The distributor line is the last thing spoken before the end screen takes the frame.",
};
const NUMBERS = `**Numbers, said aloud.** \`828\` = "eight twenty-eight". \`UltraLite-mk5\` = "ultra-light em-kay-five".
\`18 in, 22 out\` = "eighteen in, twenty-two out". \`28 in, 32 out\` = "twenty-eight in, thirty-two out".
\`1U\` = "one you". \`125 dB\` = "one twenty-five dee-bee". \`74 dB\` = "seventy-four dee-bee".
\`Minus 129 dBu\` = "minus one twenty-nine dee-bee-you". \`Sabre32\` = "sabre thirty-two".
\`CueMix 5\` = "cue-mix five". \`2.4 ms\` = "two point four milliseconds". \`3.9 inch\` = "three point nine inch".
\`2 combo inputs\` = "two combo inputs". \`A and B\` = "A and B".
\`1 travels. 1 anchors.\` = "one travels, one anchors" — numerals on screen are always read as ordinary words.
`;

const build = ({ name, file, tl, runtime, canvasNote, voPath, outroNote, WPM }) => {
  const words = tl.words;
  const spoken = tl.total - tl.segments.reduce((a, s) => a + (s.hold ?? 0), 0);
  let md = `# ${name}
## SPEECH SCRIPT FOR CLIENT RECORDING

**Client:** Shivansh Electronics, Kolkata — authorized distributor of MOTU (Mark of the Unicorn, USA) for East and North East India
**Deliverable:** \`ultralite-828-reel\` — ${canvasNote}
**Voice:** to be recorded by the client. No AI or synthesised narration is used anywhere in this build.

---

## HOW TO USE THIS SCRIPT

Read it top to bottom in one take if you can. The film is cut to these
timestamps, so the closer your read sits to them, the less re-timing is needed.

| | |
|---|---|
| **Total script length** | **${words} words** |
| **Written speaking rate** | **${WPM} wpm** |
| **Effective rate while narrating** | **${(words / (spoken / 60)).toFixed(1)} wpm** — the difference is the beats and breaths below |
| **Narration runs** | **${tsp(tl.segments[0].speakAt)} – ${tsp(tl.total)}** |
| **Film runtime** | **${runtime.toFixed(3)} s** — the tail is the end screen |
| **Pause held between segments** | ${SEGMENT_GAP.toFixed(2)} s |

**On the two rates.** The script is *written* at ${WPM} wpm — that is how fast the
words come out while you are speaking a phrase. Across the read the average
drops to about ${(words / (spoken / 60)).toFixed(0)} wpm because of the deliberate silences: the beats after
each thought and the breath between segments. **Do not try to fill the pauses** —
they are where the picture changes and where the on-screen graphics land.

**On tone.** Written for a plain speaker. No superlatives, nothing that needs
selling with the voice, and no word anywhere that ranks one unit above the
other — the argument is that they are the same standard in two different rooms,
and a flat, clear, unhurried read is what carries it.

**Marks in the text.**

- \`▌\` a short beat — roughly a fifth of a second. End of a thought.
- \`▌▌\` the segment break — take a breath, the picture changes here.
- **Bold** words are the ones set in the script face on screen. Give them a
  little more weight in the read; the caption is timed to you.

${NUMBERS}

---

`;
  for (const seg of tl.segments) {
    md += `## ${ts(seg.speakAt)} – ${ts(seg.end)}  ·  ${TITLES[seg.id]}\n\n`;
    if (seg.hold) md += `> *Picture only from ${tsp(seg.start)} to ${tsp(seg.speakAt)} — the chapter title and B-roll. Say nothing until ${tsp(seg.speakAt)}.*\n>\n`;
    md += `> **${seg.words} words · ${(seg.end - seg.speakAt).toFixed(1)} s**\n>\n`;
    md += `> *Delivery:* ${NOTES[seg.id]}\n\n`;
    const body = seg.captions
      .map((c) => {
        let t = c.t;
        if (c.e && t.includes(c.e)) t = t.replace(c.e, `**${c.e}**`);
        return t + (c.beat ? " ▌" : "");
      })
      .join(" ");
    md += `${body} ▌▌\n\n`;
    md += `<details><summary>Line-by-line cue sheet (${seg.captions.length} caption lines)</summary>\n\n`;
    md += `| In | Line as spoken | Script-face word |\n|---|---|---|\n`;
    for (const c of seg.captions) md += `| \`${tsp(c.start)}\` | ${c.t} | ${c.e ? `**${c.e}**` : "—"} |\n`;
    md += `\n</details>\n\n---\n\n`;
  }
  md += `## ${ts(tl.total)} – ${ts(runtime)} · END SCREEN — nothing spoken

The last ${(runtime - tl.total - 0.6).toFixed(1)} seconds carry the end card. ${outroNote} It is the only place in
the film where any branding appears:

- Shivansh Electronics and MOTU logos, together
- *Exclusive Distributor of MOTU (Mark of the Unicorn, USA) for East & North East India*
- all 3 WhatsApp numbers, each with the WhatsApp mark
- www.shivanshelectronics.in

---

## AFTER YOU RECORD

Save the take as a single continuous WAV or MP3 and drop it in at:

\`\`\`
${voPath}
\`\`\`

A silent placeholder of exactly ${runtime.toFixed(3)} s already sits at that path, so
**nothing in the project needs to be edited** — replace the file, re-render, and
the voice is in the film.

---

## TECHNICAL ACCURACY

Every specification spoken here and every chip of extra text on screen was
checked against this repository's own material: connector counts read off the
front and rear elevations in \`public/img\`, channel counts off the comparison
table in \`src/lib/copy.ts\`. The one correction worth stating explicitly is the
preamplifier count, which it is easy to get wrong from memory:

| Claim | Verified as |
|---|---|
| UltraLite-mk5 front panel | **2** MIC/LINE/INSTRUMENT combo inputs, 1 headphone jack — read off \`ul-front-elev\` |
| 828 front panel | **2** MIC/LINE/INSTRUMENT combo inputs, 2 headphone jacks, A/B/MONO/TALK, 3.9 in RGB LCD — read off \`e8-front-elev\` |
| Preamp count | identical on both units; the script never implies otherwise |
| Channel counts | 18 × 22 (mk5) and 28 × 32 (828), from the I/O row of \`src/lib/copy.ts\` |

No pricing is spoken or shown anywhere. No other manufacturer is named, compared
to, or implied.
`;
  writeFileSync(file, md);
  console.log(`${file}: ${words} words, narration ${tsp(tl.segments[0].speakAt)}–${tsp(tl.total)}, ${(words / (spoken / 60)).toFixed(1)} wpm effective`);
};

build({
  name: "MOTU ULTRALITE-MK5 & 828 — 90-SECOND VERTICAL REEL",
  file: "../VO_SCRIPT_MOTU_ULTRALITE828_REEL_90S.md",
  tl: REEL_TL,
  runtime: 90,
  canvasNote: "90.000 s / 2160 × 3840 (9:16, 4K portrait) / 30 fps",
  voPath: "ultralite-828-reel/public/audio/vo-reel.wav",
  WPM: REEL_WPM,
  outroNote: "The distributor line is the last thing spoken, just before it.",
});
