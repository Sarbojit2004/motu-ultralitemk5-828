// Renders frames from the LongForm composition to PNG, single bundle.
//   node scripts/lf_stills.mjs <outDir> <frame> [frame...]
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = process.argv[2];
const frames = process.argv.slice(3).map(Number);
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({
  entryPoint: path.join(root, 'src/index.ts'),
  onProgress: (p) => { if (p === 100) process.stdout.write('bundle 100%\n'); },
});
console.log('BUNDLE OK ->', serveUrl);

const comp = await selectComposition({serveUrl, id: 'LongForm', inputProps: {}});
console.log(`COMPOSITION ${comp.id} ${comp.width}x${comp.height} @${comp.fps} frames=${comp.durationInFrames} (${(comp.durationInFrames/comp.fps).toFixed(3)}s)`);

for (const fr of frames.filter((x) => x >= 0 && x < comp.durationInFrames)) {
  const out = path.join(outDir, `f${String(fr).padStart(5,'0')}.png`);
  await renderStill({composition: comp, serveUrl, output: out, frame: fr, imageFormat: 'png', chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 120000});
  process.stdout.write(`still f=${fr}\n`);
}
console.log('DONE', frames.length, 'stills ->', outDir);
