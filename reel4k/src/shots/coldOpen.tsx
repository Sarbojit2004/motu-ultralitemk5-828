import {C} from '../lib/theme';
import {ShotSpec} from './Shot';
import {compose} from './layouts';
import {pushIn, pullBack, drift2, dollyDiag} from '../camera/Camera';
import {LogoLockup} from '../elements/Brand';

/**
 * COLD OPEN - beats 0..12 (0.00s - 5.37s)
 *
 * Identity before product name: four hard fragment crops pulled from both
 * products' photography, each carrying one word of a single line, then the two
 * logos, landing on the first full UltraLite composition that opens the next
 * movement (master brief S5).
 *
 * Images covered here: e828_21j, ul_11j, e828_09j, e828_01j.
 */
export const COLD_OPEN: ShotSpec[] = [
  {
    id: 'co-nothing',
    beats: 2,
    lead: 0,
    lag: 0.7,
    move: pushIn({focus: [0.35, -0.2], amp: 1.15, z0: 1.06, z1: 1.4}),
    flash: 0.55,
    body: compose({
      seed: 'co1',
      plates: [{
        slug: 'e828_21j', cx: 1040, cy: 2020, w: 2680, h: 2500,
        anchor: [0.48, 0.52], rot: -1.6, from: 'z', to: 'l', tear: 1.1, pad: 26,
      }],
      scraps: [{cx: 1720, cy: 780, w: 900, h: 300, color: C.red, rot: -7, from: 'r'}],
      bands: [{cx: 1080, cy: 810, w: 2300, h: 500, color: C.ink, rot: -2.2, from: 't'}],
      type: [{
        text: 'NOTHING', y: 630, size: 400, align: 'center', from: 'b', to: 'l', color: C.paper,
        split: 'letter', stagger: 0.035, tracking: -0.03,
      }],
    }),
  },
  {
    id: 'co-gets',
    beats: 2,
    lead: 0.7,
    lag: 0.7,
    move: drift2(-1, {amp: 1.3, z0: 1.24, z1: 1.06, tilt: 1.2}),
    flash: 0.5,
    body: compose({
      seed: 'co2',
      plates: [{
        slug: 'ul_11j', cx: 1180, cy: 2260, w: 2560, h: 2100,
        anchor: [0.5, 0.5], rot: 2.2, from: 'r', to: 't', tear: 1.4, pad: 30,
      }],
      bands: [{cx: 1080, cy: 3040, w: 1900, h: 540, color: C.ink, rot: 3.4, from: 'l'}],
      type: [{
        text: 'GETS', y: 2860, size: 460, align: 'center', from: 'l', to: 'r',
        split: 'letter', stagger: 0.04, color: C.paper,
      }],
    }),
  },
  {
    id: 'co-lost',
    beats: 2,
    lead: 0.7,
    lag: 0.7,
    move: pullBack({focus: [-0.4, 0.3], amp: 1.2, z0: 1.34, z1: 1.08}),
    flash: 0.5,
    body: compose({
      seed: 'co3',
      plates: [{
        slug: 'e828_09j', cx: 1000, cy: 1980, w: 2400, h: 2280,
        anchor: [0.5, 0.5], rot: -2.6, from: 'z', to: 'b', tear: 1.6, pad: 28,
      }],
      scraps: [{cx: 1640, cy: 2900, w: 980, h: 420, color: C.teal, rot: -5, from: 'b'}],
      bands: [{cx: 1080, cy: 820, w: 2000, h: 560, color: C.red, rot: 2.4, from: 't'}],
      type: [{
        text: 'LOST', y: 620, size: 500, align: 'center', from: 't', to: 'z',
        split: 'letter', stagger: 0.045, color: C.ink,
      }],
    }),
  },
  {
    id: 'co-room',
    beats: 2,
    lead: 0.7,
    lag: 0.9,
    move: dollyDiag(1, {amp: 1.25, z0: 1.34, z1: 1.05, tilt: 1.4}),
    flash: 0.45,
    body: compose({
      seed: 'co4',
      plates: [{
        slug: 'e828_01j', cx: 1120, cy: 2140, w: 2500, h: 1900,
        anchor: [0.46, 0.5], rot: 1.4, from: 'b', to: 'r', tear: 1.3, pad: 26,
      }],
      type: [
        {text: 'IN THE ROOM', y: 1230, size: 230, align: 'center', font: 'heavy', slab: C.ink, color: C.paper, from: 'l', to: 'l', stagger: 0.07, width: 1460},
        {text: 'THAT MATTERS', y: 3080, x: 300, size: 200, font: 'cond', color: C.ink, from: 'r', to: 'r', stagger: 0.07},
      ],
      stars: [{cx: 1830, cy: 3420, r: 175, color: C.red, inAt: 0.5}],
    }),
  },
  {
    id: 'co-brand',
    beats: 4,
    lead: 0.9,
    lag: 0.8,
    move: dollyDiag(1, {amp: 0.85, z0: 1.02, z1: 1.22, tilt: 1.2}),
    flash: 0.7,
    body: (ctx) => (
      <>
        {compose({
          seed: 'co5',
          plates: [],
          scraps: [
            {cx: 1080, cy: 1900, w: 2000, h: 1500, color: C.paperDeep, rot: -2.2, from: 't', opacity: 0.9},
            {cx: 1080, cy: 2620, w: 1560, h: 560, color: C.motuBlue, rot: 2, from: 'b', opacity: 0.16},
            {cx: 1740, cy: 900, w: 1000, h: 340, color: C.red, rot: -7, from: 'r', inAt: 0.3},
            {cx: 420, cy: 3120, w: 1080, h: 380, color: C.ink, rot: 5, from: 'l', inAt: 0.5},
            {cx: 1620, cy: 3320, w: 900, h: 300, color: C.teal, rot: -4, from: 'b', inAt: 0.7},
          ],
          stars: [{cx: 380, cy: 780, r: 150, color: C.ink, inAt: 0.55}],
          rules: [{x: 470, y: 2860, w: 1220, h: 10, color: C.red, inAt: 0.8}],
        })(ctx)}
        <LogoLockup ctx={ctx} cy={1860} scale={1.34} inAt={0.05} outAt={ctx.dur + 0.2} />
      </>
    ),
  },
];
