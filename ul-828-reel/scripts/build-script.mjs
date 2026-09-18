#!/usr/bin/env node
// Generates the two read-aloud scripts the client records:
//   ../VO_SCRIPT_AVB_REEL_90S.md   and   ../VO_SCRIPT_AVB_FILM_5MIN.md
// Every timestamp is DERIVED from src/script.ts, never typed by hand, so the
// printed script and the on-screen captions can never disagree.
// Run: node --experimental-strip-types scripts/build-script.mjs
import { writeFileSync } from "node:fs";
import { REEL_TL, FILM_TL, REEL_WPM, FILM_WPM, SEGMENT_GAP } from "../src/script.ts";

const ts = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const tsp = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(1).padStart(4, "0")}`;

const TITLES = {
  hook: "HOOK — 4 rooms, 4 problems, 1 question",
  platform: "THE PLATFORM — what all 3 share under the front panel",
  s16a: "MOTU 16A — THE MATRIX: 16 line in, 16 line out, no preamps",
  s848: "MOTU 848 — THE COMMAND CENTRE: 4 preamps, talkback, A/B/C",
  s10pre: "MOTU 10pre — THE SOURCE: 10 preamps, 8 rear + 2 front",
  sswitch: "MOTU AVB SWITCH — THE NETWORK: 1 cable, 1 clock",
  software: "CUEMIX PRO — 1 software for all 3",
  close: "CLOSE — choose by the front panel",
};
const NOTES = {
  hook: "Flat and even. Four short statements of a problem, then a real question — ask it the way you would ask a customer across the counter, then stop.",
  platform: "Plain and unhurried. The numbers are the credibility of everything that follows; read each one clean and leave the beat after it.",
  s16a: "Practical tone. 'No preamps' is not a limitation — say it like the point it is. The modular synth line is the one moment of colour.",
  s848: "Same register. The list of rooms at the end (desk, podcast, Atmos) should sound like examples, not a climax. 'Same box.' lands the section.",
  s10pre: "Slightly more forward — this section is about capacity. Read the instrument list evenly; it is a count, not a build-up.",
  sswitch: "This is the answer to the hook. Keep it calm: the cable does the work, the voice does not need to. Give 'No snake. No hum. No dropouts.' three equal pieces.",
  software: "Conversational. You are describing a screen you use every day.",
  close: "Slow down a little. The buying rule is the sentence to leave with. The distributor line is a plain statement of fact — do not sell it.",
};
const NUMBERS = `**Numbers, said aloud.** \`125 dB\` = "one twenty-five dee-bee". \`Minus 129 dBu\` = "minus one twenty-nine dee-bee-you".
\`2 ms\` = "two milliseconds". \`74 dB\` = "seventy-four dee-bee". \`48 volts\` = "forty-eight volts". \`20 dB pad\` = "twenty dee-bee pad".
\`7.1.4\` = "seven one four". \`CAT-6\` = "cat six". \`802.1AS\` is never spoken. \`Sabre32\` = "sabre thirty-two". \`USB4\` = "you-ess-bee four".
\`16A\` = "sixteen A". \`848\` = "eight forty-eight". \`10pre\` = "ten pre". \`A, B, C\` = "A B C". \`44.1 to 192 kHz\` = "forty-four point one to one ninety-two kilohertz".
\`1 cable\` = "one cable" — numerals on screen are always read as ordinary words.`;

const build = ({ name, file, tl, runtime, canvasNote, voPath, outroNote, WPM }) => {
  const words = tl.words;
  const spoken = tl.total - tl.segments.reduce((a, s) => a + (s.hold ?? 0), 0);
  let md = `# ${name}
## SPEECH SCRIPT FOR CLIENT RECORDING

**Client:** Shivansh Electronics, Kolkata — exclusive distributor of MOTU (Mark of the Unicorn, USA) for East & North East India
**Deliverable:** \`avb-series-film\` — ${canvasNote}
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
selling with the voice. The hook is carried by the structure — four problems, one
question, and an answer that arrives in instalments — so a flat, clear,
unhurried read is the correct read.

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
checked against the supplied panel photography (connector counts read off the
rear and front plates) and MOTU's published specifications for the 2025-generation
16A, 848 and 10pre and the AVB Switch. Two corrections to earlier material in this
repository, both verified on the photographs:

| Claim | Verified as |
|---|---|
| 10pre preamp split | **8 on the rear panel, 2 on the front** (with inserts on channels 1–2) |
| 848 preamp location | the 4 combo inputs are on the **rear** panel; the front carries their gain, pad and 48 V controls |

No pricing is spoken or shown anywhere. No other manufacturer is named, compared
to, or implied.
`;
  writeFileSync(file, md);
  console.log(`${file}: ${words} words, narration ${tsp(tl.segments[0].speakAt)}–${tsp(tl.total)}, ${(words / (spoken / 60)).toFixed(1)} wpm effective`);
};

build({
  name: "MOTU AVB SERIES — 90-SECOND VERTICAL REEL",
  file: "../VO_SCRIPT_AVB_REEL_90S.md",
  tl: REEL_TL,
  runtime: 90,
  canvasNote: "90.000 s / 2160 × 3840 (9:16, 4K portrait) / 30 fps",
  voPath: "avb-series-film/public/audio/vo-reel.wav",
  WPM: REEL_WPM,
  outroNote: "There is no narration over it.",
});
build({
  name: "MOTU AVB SERIES — 5-MINUTE FILM",
  file: "../VO_SCRIPT_AVB_FILM_5MIN.md",
  tl: FILM_TL,
  runtime: 300,
  canvasNote: "300.000 s / 3840 × 2160 (16:9, 4K landscape) / 30 fps",
  voPath: "avb-series-film/public/audio/vo-film.wav",
  WPM: FILM_WPM,
  outroNote: "The distributor line is the last thing spoken, just before it.",
});
