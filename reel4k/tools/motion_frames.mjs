/**
 * Render three frames inside every shot (22%, 50%, 78% of its body) at quarter
 * scale, for the Section 3 self-check: if a shot's photography, type or
 * backdrop is at the same place at all three, that shot is a static card and
 * has to be rebuilt.
 */
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const outDir = process.argv[3];
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'MotuCameraReel'});

let i = 0;
const total = plan.reduce((a, s) => a + s.frames.length, 0);
for (const shot of plan) {
  for (const frame of shot.frames) {
    await renderStill({
      composition, serveUrl,
      output: path.join(outDir, `${shot.id}__${frame}.png`),
      frame, scale: 0.25, imageFormat: 'png',
      chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 180000,
    });
    process.stdout.write(`${++i}/${total}\r`);
  }
}
console.log(`\n${total} frames -> ${outDir}`);
