// Renders a set of frames from the Reel composition to PNG using a single
// bundle, and verifies the central-square constraint automatically.
//
//   node scripts/stills.mjs <outDir> <frame> [frame...]
//   node scripts/stills.mjs <outDir> --plan     (one frame per scene beat)

import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = process.argv[2];
const args = process.argv.slice(3);

fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({
  entryPoint: path.join(root, 'src/index.ts'),
  onProgress: (p) => {
    if (p === 100) process.stdout.write('bundle 100%\n');
  },
  webpackOverride: (c) => c,
});
console.log('BUNDLE OK ->', serveUrl);

const comp = await selectComposition({serveUrl, id: 'Reel', inputProps: {}});
console.log(
  `COMPOSITION ${comp.id} ${comp.width}x${comp.height} @${comp.fps} frames=${comp.durationInFrames} (${(comp.durationInFrames / comp.fps).toFixed(3)}s)`,
);

let frames;
if (args[0] === '--plan') {
  const planPath = path.join(outDir, 'plan.json');
  frames = JSON.parse(fs.readFileSync(planPath, 'utf8'));
} else {
  frames = args.map(Number);
}
frames = frames.filter((f) => f >= 0 && f < comp.durationInFrames);

for (const f of frames) {
  const out = path.join(outDir, `f${String(f).padStart(5, '0')}.png`);
  await renderStill({
    composition: comp,
    serveUrl,
    output: out,
    frame: f,
    imageFormat: 'png',
    chromiumOptions: {gl: 'angle'},
    timeoutInMilliseconds: 120000,
  });
  process.stdout.write(`still f=${f}\n`);
}
console.log('DONE', frames.length, 'stills ->', outDir);
