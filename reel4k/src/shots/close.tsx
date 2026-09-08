import {C, DEPTH} from '../lib/theme';
import {ShotSpec} from './Shot';
import {compose} from './layouts';
import {pullBack, drift2, dollyDiag, orbit, slamIn} from '../camera/Camera';
import {LogoLockup, ContactBlock} from '../elements/Brand';

/**
 * CLOSE - beats 184..202.6 (82.38s - 90.70s)
 *
 * Four one-beat callback fragments pulling from both products, a dual
 * composition that puts the two instruments in one frame, then the branding:
 * both logos, all three WhatsApp numbers and the website. The music resolves on
 * its own tail, which is where the reel ends.
 *
 * Every image here has already been seen; coverage is complete before this
 * point, so the close is free to recapitulate.
 */
export const CLOSE: ShotSpec[] = [
  {
    id: 'cl-f1',
    beats: 1,
    lead: 0.4,
    lag: 0.4,
    move: slamIn({focus: [-0.3, 0.2], amp: 1.1, z0: 1.34, z1: 1.12}),
    flash: 0.9,
    body: compose({
      seed: 'cl1',
      plates: [{slug: 'ul_07p', cx: 1080, cy: 2160, w: 2500, rot: -3, from: 'z', to: 'l'}],
      bands: [{cx: 1080, cy: 1150, w: 2300, h: 560, color: C.red, rot: -3, from: 't'}],
      type: [{text: 'ULTRALITE', y: 1000, size: 300, align: 'center', color: C.paper, from: 'z', to: 'z', split: 'letter', stagger: 0.02, width: 1560}],
    }),
  },
  {
    id: 'cl-f2',
    beats: 1,
    lead: 0.4,
    lag: 0.4,
    move: slamIn({focus: [0.3, -0.2], amp: 1.1, z0: 1.34, z1: 1.12}),
    flash: 0.9,
    body: compose({
      seed: 'cl2',
      plates: [{slug: 'e828_13p', cx: 1080, cy: 2260, w: 2600, rot: 2.4, from: 'z', to: 'r', tear: 1.2, pad: 28, card: true}],
      bands: [{cx: 1080, cy: 3210, w: 2300, h: 560, color: C.ink, rot: 2, from: 'b'}],
      type: [{text: '828', y: 3060, size: 340, align: 'center', color: C.paper, from: 'z', to: 'z', split: 'letter', stagger: 0.02, width: 1560}],
    }),
  },
  {
    id: 'cl-f3',
    beats: 1,
    lead: 0.4,
    lag: 0.4,
    move: drift2(1, {amp: 1.4, z0: 1.34, z1: 1.1, tilt: 1.6}),
    flash: 0.85,
    body: compose({
      seed: 'cl3',
      plates: [{slug: 'ul_03j', cx: 1080, cy: 2100, w: 2600, h: 2200, anchor: [0.52, 0.46], rot: -2, from: 'l', to: 'r', tear: 1.4, pad: 30}],
      bands: [{cx: 1080, cy: 1320, w: 1700, h: 560, color: C.paper, rot: -2.6, from: 'z'}],
      type: [{text: 'PLAY', y: 1180, size: 420, align: 'center', color: C.ink, from: 'z', to: 'z', split: 'letter', stagger: 0.02, width: 1560}],
    }),
  },
  {
    id: 'cl-f4',
    beats: 1,
    lead: 0.4,
    lag: 0.6,
    move: drift2(-1, {amp: 1.4, z0: 1.34, z1: 1.1, tilt: 1.6}),
    flash: 0.85,
    body: compose({
      seed: 'cl4',
      plates: [{slug: 'e828_28j', cx: 1080, cy: 2200, w: 2600, h: 2300, anchor: [0.5, 0.52], rot: 2, from: 'r', to: 'l', tear: 1.4, pad: 30}],
      bands: [{cx: 1080, cy: 1270, w: 1860, h: 500, color: C.paper, rot: 2.2, from: 'z'}],
      type: [{text: 'RECORD', y: 1140, size: 360, align: 'center', color: C.ink, from: 'z', to: 'z', split: 'letter', stagger: 0.02, width: 1560}],
    }),
  },
  {
    id: 'cl-both',
    beats: 4,
    lead: 0.7,
    lag: 0.9,
    // Two products, two planes: they part as the camera arcs between them.
    move: dollyDiag(-1, {amp: 1.15, z0: 1.02, z1: 1.24, tilt: 1.0}),
    flash: 1,
    body: compose({
      seed: 'cl5',
      plates: [
        {slug: 'ul_03p', cx: 820, cy: 1720, w: 1680, rot: -4, depth: DEPTH.photoFar, from: 'l', to: 'l'},
        {slug: 'e828_02p', cx: 1340, cy: 2740, w: 1860, rot: 3.2, depth: DEPTH.photoNear, from: 'r', to: 'r', inAt: 0.25},
      ],
      scraps: [{cx: 1080, cy: 2400, w: 1900, h: 1400, color: C.motuBlue, rot: 2, from: 'z', opacity: 0.1}],
      bands: [{cx: 1080, cy: 1060, w: 2300, h: 580, color: C.ink, rot: -2, from: 't'}],
      type: [
        {text: 'TWO WAYS TO WORK', y: 900, size: 210, font: 'heavy', align: 'center', color: C.paper, from: 't', to: 't', stagger: 0.05, width: 1460},
        {text: 'ULTRALITE-MK5  ·  828', y: 3060, size: 130, font: 'label', align: 'center', color: C.ink, tracking: 0.2, inAt: 0.7, stagger: 0.04, width: 1820},
      ],
      rules: [{x: 560, y: 3000, w: 1040, h: 8, color: C.red, inAt: 0.6}],
    }),
  },
  {
    id: 'cl-logos',
    beats: 4,
    lead: 0.8,
    lag: 0.8,
    move: orbit(1, {amp: 0.9, z0: 1.02, z1: 1.2, tilt: 1.5}),
    flash: 0.8,
    body: (ctx) => (
      <>
        {compose({
          seed: 'cl6',
          plates: [],
          scraps: [
            {cx: 1080, cy: 1980, w: 2060, h: 1560, color: C.paperDeep, rot: -1.6, from: 'z', opacity: 0.85},
            {cx: 1700, cy: 880, w: 1040, h: 350, color: C.red, rot: -6, from: 'r', inAt: 0.25},
            {cx: 400, cy: 3060, w: 1120, h: 390, color: C.ink, rot: 4.5, from: 'l', inAt: 0.5},
            {cx: 1660, cy: 3320, w: 940, h: 320, color: C.motuBlue, rot: -3, from: 'b', inAt: 0.7, opacity: 0.85},
          ],
          stars: [{cx: 340, cy: 800, r: 165, color: C.ink, inAt: 0.4}],
          rules: [{x: 470, y: 2760, w: 1220, h: 10, color: C.red, inAt: 0.8}],
        })(ctx)}
        <LogoLockup ctx={ctx} cy={1840} scale={1.44} inAt={0.05} outAt={ctx.dur + 0.4} />
      </>
    ),
  },
  {
    id: 'cl-contact',
    beats: 6.6,
    lead: 0.9,
    lag: 0,
    move: pullBack({focus: [0, -0.3], amp: 0.9, z0: 1.24, z1: 1.0}),
    flash: 0.55,
    body: (ctx) => (
      <>
        {compose({
          seed: 'cl7',
          plates: [],
          scraps: [{cx: 1080, cy: 2760, w: 2000, h: 1500, color: C.white, rot: 1.2, from: 'z', opacity: 0.55, inAt: 0.2}],
          rules: [{x: 630, y: 1620, w: 900, h: 10, color: C.red, inAt: 0.7}],
        })(ctx)}
        <LogoLockup ctx={ctx} cy={1080} scale={1.12} inAt={0.05} outAt={ctx.dur + 2} />
        <ContactBlock ctx={ctx} inAt={0.95} outAt={ctx.dur + 2} y={2160} />
      </>
    ),
  },
];
