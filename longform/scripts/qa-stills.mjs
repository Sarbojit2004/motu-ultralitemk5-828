// Renders one still per beat (Section 11 checkpoint 4) so every scene can be
// checked for text/logo/image overlap, off-frame clipping, contrast and
// branding treatment BEFORE committing to a full render.
//
// Uses one bundle for all stills rather than N CLI invocations.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const S = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "schedule.json"), "utf8"));
const OUT = process.env.QA_OUT ?? path.join(ROOT, "out", process.argv.includes("--resolve") ? "qa-resolve" : "qa");
fs.mkdirSync(OUT, { recursive: true });

const CHROME =
  process.env.REMOTION_BROWSER_EXECUTABLE ??
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

const args = process.argv.slice(2);
// --resolve samples the reveal/sweep beats LATE, where the camera move has
// resolved to the complete unit. This is the pass that proves the
// never-cropped rule (Section 11 checkpoint 6) rather than just checking layout.
const RESOLVE = args.includes("--resolve");
const only = args.filter((a) => !a.startsWith("--"));
const MOVING = new Set(["heroReveal", "heroMacro", "portSweep"]);

console.log("bundling…");
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "src", "index.ts"),
  onProgress: () => {},
});
const composition = await selectComposition({
  serveUrl,
  id: S.id,
  // This container ships Chromium and blocks Remotion's download host, so the
  // executable must be passed to selectComposition as well as renderStill.
  browserExecutable: fs.existsSync(CHROME) ? CHROME : undefined,
});
console.log(`bundle ready — ${composition.width}x${composition.height} @ ${composition.fps}fps`);

let beats = only.length ? S.beats.filter((b) => only.includes(b.id)) : S.beats;
if (RESOLVE) beats = beats.filter((b) => MOVING.has(b.kind));
let n = 0;
for (const b of beats) {
  // Sample at 62% through the beat: past the entrance animation, and for a
  // MacroReveal / PortSweep past the point where the move has resolved to the
  // complete uncropped unit — which is exactly what needs checking.
  const at = RESOLVE && MOVING.has(b.kind) ? 0.95 : 0.62;
  const frame = b.from + Math.round(b.durationInFrames * at);
  const file = path.join(OUT, `${String(b.chapter)}-${b.id}.png`);
  await renderStill({
    composition,
    serveUrl,
    output: file,
    frame,
    imageFormat: "png",
    browserExecutable: fs.existsSync(CHROME) ? CHROME : undefined,
    chromiumOptions: { gl: "swangle" },
  });
  n++;
  process.stdout.write(`\r  ${n}/${beats.length}  ${b.id.padEnd(20)}`);
}
console.log(`\ndone — ${n} stills in ${path.relative(ROOT, OUT)}`);
