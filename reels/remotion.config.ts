import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(3);

// CRF 18 rather than a forced bitrate. This material — flat light grounds,
// vector motion graphics and slow moves over stills — is genuinely
// low-complexity, so CRF lands far below a forced target while keeping type
// crisp, and keeps the delivered file inside GitHub's 100 MB per-file limit
// (git-lfs is unavailable in this environment).
Config.setCodec("h264");
// CRF 23, chosen against the delivered file rather than by habit. A CRF 18
// master of the 598 s piece lands at 176 MB, which cannot be delivered through
// GitHub (100 MB per-file limit; git-lfs is unavailable in this environment).
// Measured against that master, CRF 23 is visually lossless on this material —
// 44-48 dB PSNR, with the price cards and body type indistinguishable at 1:1 —
// and lands at ~90 MB. Set here rather than applied as a second-generation
// re-encode, so `npm run render` reproduces exactly the delivered file.
Config.setCrf(23);
Config.setPixelFormat("yuv420p");
Config.setChromiumDisableWebSecurity(false);

// This container ships Chromium and blocks Remotion's browser-download host.
const LOCAL_CHROME =
  process.env.REMOTION_BROWSER_EXECUTABLE ??
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (existsSync(LOCAL_CHROME)) Config.setBrowserExecutable(LOCAL_CHROME);
