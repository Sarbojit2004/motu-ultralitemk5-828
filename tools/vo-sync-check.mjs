// VOICEOVER SYNC CHECK (Section 9 / Section 11 checkpoint 8).
//
// The scripts are generated FROM the schedules, so sync is by construction —
// but the standing requirement is to verify it explicitly against the FINISHED
// render rather than trust the generator. This parses the timestamps back out
// of the committed markdown and checks each one against:
//   * the beat it claims to accompany, in the schedule, and
//   * the actual duration and frame count of the rendered MP4.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TARGETS = [
  { name: "Long-form 598 s",
    script: "VO_SCRIPT_MOTU_ULTRALITE828_LONGFORM_598S.md",
    schedule: "longform/src/schedule.json",
    video: "longform/out/motu-ultralite828-longform.mp4" },
  { name: 'Reel 1 "The Agile Hub"',
    script: "VO_SCRIPT_MOTU_ULTRALITE828_REEL1.md",
    schedule: "reels/src/schedule-reel1.json",
    video: "reels/out/motu-ultralite828-reel-1.mp4" },
  { name: 'Reel 2 "The Studio Anchor"',
    script: "VO_SCRIPT_MOTU_ULTRALITE828_REEL2.md",
    schedule: "reels/src/schedule-reel2.json",
    video: "reels/out/motu-ultralite828-reel-2.mp4" },
];

let fail = 0;
for (const t of TARGETS) {
  const S = JSON.parse(fs.readFileSync(path.join(ROOT, t.schedule), "utf8"));
  const md = fs.readFileSync(path.join(ROOT, t.script), "utf8");
  const byId = new Map(S.beats.map((b) => [b.id, b]));

  // each entry is "**MM:SS** — line" followed by "> `beat-id` · Ns"
  const re = /\*\*(\d{2}):(\d{2})\*\*[^\n]*\n\n> `([a-z0-9-]+)` · (\d+)s/g;
  const rows = [...md.matchAll(re)];

  let bad = 0;
  for (const [, mm, ss, id, sec] of rows) {
    const b = byId.get(id);
    if (!b) { console.log(`  ! ${t.name}: script references unknown beat ${id}`); bad++; continue; }
    const claimed = Number(mm) * 60 + Number(ss);
    const actual = Math.floor(b.from / S.fps);
    if (claimed !== actual) {
      console.log(`  ! ${t.name}: ${id} script says ${mm}:${ss}, beat starts at ${actual}s`);
      bad++;
    }
    if (Number(sec) !== b.sec) {
      console.log(`  ! ${t.name}: ${id} script says ${sec}s, beat is ${b.sec}s`);
      bad++;
    }
  }
  const covered = rows.length === S.beats.length;
  if (!covered) {
    console.log(`  ! ${t.name}: script has ${rows.length} entries, schedule has ${S.beats.length} beats`);
    bad++;
  }

  // against the finished render
  const vp = path.join(ROOT, t.video);
  let vid = "not rendered yet";
  if (fs.existsSync(vp)) {
    const dur = parseFloat(execFileSync("/usr/bin/ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vp]).toString().trim());
    const frames = execFileSync("/usr/bin/ffprobe",
      ["-v", "error", "-select_streams", "v:0", "-count_frames",
       "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", vp]).toString().trim().replace(/,$/, "");
    const okF = Number(frames) === S.durationInFrames;
    const okD = Math.abs(dur - S.durationInSeconds) < 0.2;
    if (!okF || !okD) { bad++; }
    vid = `${frames} frames (need ${S.durationInFrames}) ${okF ? "OK" : "MISMATCH"}, ` +
          `${dur.toFixed(2)}s ${okD ? "OK" : "MISMATCH"}`;
  } else {
    bad++;
  }

  console.log(`${bad === 0 ? "OK  " : "FAIL"} ${t.name.padEnd(26)} ${rows.length} timestamped lines vs ${S.beats.length} beats · render: ${vid}`);
  fail += bad;
}

console.log(fail === 0
  ? "\nOK — every voiceover timestamp lands on the beat it accompanies, and every render is frame-exact."
  : `\n${fail} sync problem(s)`);
process.exit(fail ? 1 : 0);
