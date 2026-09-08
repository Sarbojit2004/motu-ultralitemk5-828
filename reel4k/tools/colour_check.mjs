/** Render the ColourProbe for a set of product images. */
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const slugs = process.argv.slice(2);
fs.mkdirSync('out/colour', {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
for (const slug of slugs) {
  const composition = await selectComposition({serveUrl, id: 'ColourProbe', inputProps: {slug}});
  await renderStill({
    composition, serveUrl, inputProps: {slug},
    output: path.resolve('out/colour', `${slug}.png`),
    frame: 0, imageFormat: 'png',
    chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 180000,
  });
  console.log('probed', slug);
}
