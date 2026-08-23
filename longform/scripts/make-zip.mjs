// Packages a self-contained project zip: `npm install` then `npm run render`
// reproduces this exact render on a clean machine, with no dependency on the
// source repository, the AVB reference repo, or any network asset.
//
// Included: src/, scripts/, public/ (every real image, every de-watermarked
// clip, both logos, both self-hosted fonts, the built music bed, the built SFX
// timeline, the SFX palette and the silent VO slot), and the build config.
// Excluded: node_modules/ and out/.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const NAME = process.argv[2] ?? "motu-ultralite828-longform-project";
const OUT = path.resolve(ROOT, "..", `${NAME}.zip`);

const INCLUDE = [
  "src", "scripts", "public",
  "package.json", "package-lock.json", "tsconfig.json", "remotion.config.ts",
  "README.md", "BRANDING_CADENCE.md", "ASSET_COVERAGE.md",
].filter((p) => fs.existsSync(path.join(ROOT, p)));

fs.rmSync(OUT, { force: true });
execFileSync("zip", ["-r", "-q", "-9", OUT, ...INCLUDE,
  "-x", "node_modules/*", "-x", "out/*", "-x", "*.DS_Store"], { cwd: ROOT });

const mb = fs.statSync(OUT).size / 1024 / 1024;
const listing = execFileSync("unzip", ["-l", OUT]).toString().trim().split("\n");
console.log(`${path.basename(OUT)} — ${mb.toFixed(1)} MB, ${listing.length - 5} entries`);
console.log(`  includes: ${INCLUDE.join(", ")}`);
if (mb > 95) {
  console.log(`  ! ${mb.toFixed(1)} MB is close to GitHub's 100 MB per-file limit`);
}
