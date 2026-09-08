/**
 * Render a set of frames from the reel in one pass.
 *
 * Bundles once and reuses the browser, which makes reviewing every shot's
 * composition cheap enough to do repeatedly during the design pass.
 *
 *   node tools/stills.mjs out/review 16 43 70 ...
 */
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [, , outDir, ...frameArgs] = process.argv;
const frames = frameArgs.map(Number);
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({
  entryPoint: path.resolve('src/index.ts'),
  publicDir: path.resolve('public'),
  onProgress: (p) => {
    if (p % 25 === 0) process.stdout.write(`bundle ${p}%\r`);
  },
});
console.log('\nbundled');

const composition = await selectComposition({serveUrl, id: 'MotuCameraReel'});
let i = 0;
for (const frame of frames) {
  await renderStill({
    composition,
    serveUrl,
    output: path.join(outDir, `f${String(frame).padStart(4,"0")}.jpg`),
    frame,
    imageFormat: 'jpeg',
    jpegQuality: 90,
    chromiumOptions: {gl: 'angle'},
    timeoutInMilliseconds: 180000,
  });
  i++;
  process.stdout.write(`still ${i}/${frames.length} (f${frame})   \r`);
}
console.log(`\ndone: ${frames.length} stills -> ${outDir}`);
