import {C, DEPTH} from '../lib/theme';
import {ShotSpec} from './Shot';
import {compose} from './layouts';
import {pushIn, pullBack, drift2, crane, dolly, dollyDiag, orbit, slamIn} from '../camera/Camera';

/**
 * MOTU ULTRALITE-MK5 MOVEMENT - beats 12..68 (5.37s - 30.44s)
 *
 * Tone (master brief S8): portable, personal, immediate. Guitar, iPad, a desk
 * that turns into a studio, gear that travels. Deliberately not the 828's
 * language of racks, rooms and routing.
 *
 * The track drops on beat 36, which is the gear-change here: `ul-drop` slams in
 * on that transient and the second half runs harder than the first.
 *
 * All 22 remaining UltraLite images are covered: ul_03p, ul_02p, ul_03j,
 * ul_12j, ul_09p, ul_04j, ul_06p, ul_06j, ul_07j, ul_09j, ul_07p, ul_01j,
 * ul_08p, ul_01p, ul_02j, ul_13j, ul_08j, ul_04p, ul_05p, ul_05j, ul_10j,
 * ul_14j. (ul_11j appears in the cold open.)
 */
export const ULTRALITE: ShotSpec[] = [
  // ---- beat 12: the reveal the cold open lands on -----------------------
  {
    id: 'ul-reveal',
    beats: 4,
    lead: 0.8,
    lag: 0.9,
    // Racks out from tight on the front panel to the whole instrument.
    move: pullBack({focus: [-0.55, 0.18], amp: 1.15, z0: 1.48, z1: 1.02}),
    flash: 0.85,
    body: compose({
      seed: 'ul1',
      plates: [{slug: 'ul_03p', cx: 1090, cy: 2360, w: 2010, rot: -1.2, from: 'z', to: 'l'}],
      scraps: [
        {cx: 1040, cy: 2420, w: 1780, h: 900, color: C.motuBlue, rot: -3, from: 'b', opacity: 0.14},
        {cx: 1660, cy: 1360, w: 980, h: 300, color: C.red, rot: -6, from: 'r', inAt: 0.35},
      ],
      type: [
        {text: 'ULTRALITE', y: 830, size: 430, align: 'center', from: 'l', to: 't', split: 'letter', stagger: 0.03, tracking: -0.03, width: 1560},
        {text: 'MK5', y: 1290, size: 300, align: 'center', font: 'heavy', slab: C.ink, color: C.paper, from: 'r', to: 'r', inAt: 0.42, width: 1460},
        {text: 'MOTU', y: 3180, x: 210, size: 150, font: 'label', color: C.inkSoft, tracking: 0.4, inAt: 0.7, from: 'b'},
      ],
      rules: [{x: 130, y: 3120, w: 700, h: 8, color: C.red, inAt: 0.6}],
    }),
  },
  {
    id: 'ul-gain',
    beats: 3,
    lead: 0.8,
    lag: 0.7,
    // Push straight in on the gain knobs at the left of the front panel.
    move: pushIn({focus: [-0.62, 0.05], amp: 1.2, z0: 1.05, z1: 1.42}),
    body: compose({
      seed: 'ul2',
      plates: [{slug: 'ul_02p', cx: 1080, cy: 2060, w: 2260, rot: 1.6, from: 'r', to: 'z', tear: 1.2, pad: 30}],
      scraps: [{cx: 470, cy: 1180, w: 1000, h: 340, color: C.teal, rot: 4, from: 'l'}],
      type: [{text: 'HANDS ON', y: 1060, size: 250, align: 'center', font: 'heavy', color: C.ink, from: 't', to: 'l', stagger: 0.06, width: 1460}],
      callouts: [
        {text: 'MIC GAIN', x: 300, y: 2660, size: 62, leader: 250, inAt: 0.5, rot: -2},
        {text: 'PAD  ·  48V', x: 1160, y: 2960, size: 54, leader: 190, inAt: 0.9, bg: C.red, color: C.paper, rot: 1.5},
      ],
    }),
  },
  {
    id: 'ul-guitar',
    beats: 3,
    lead: 0.7,
    lag: 0.8,
    move: drift2(1, {amp: 1.15, z0: 1.06, z1: 1.26, tilt: 1.1}),
    flash: 0.4,
    body: compose({
      seed: 'ul3',
      plates: [{slug: 'ul_03j', cx: 1130, cy: 2180, w: 2280, h: 1900, anchor: [0.52, 0.46], rot: -2.2, from: 'l', to: 'r', tear: 1.6, pad: 34}],
      scraps: [{cx: 1720, cy: 3260, w: 1200, h: 400, color: C.red, rot: -4, from: 'b'}],
      type: [
        {text: 'PLUG IN.', y: 900, size: 300, align: 'center', from: 'l', to: 't', stagger: 0.05, width: 1560},
        {text: 'PLAY OUT.', y: 1190, size: 300, align: 'center', color: C.red, from: 'r', to: 't', inAt: 0.25, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'ul-stage',
    beats: 3,
    lead: 0.9,
    lag: 0.8,
    // Two plates, two planes: the desk shot crawls, the rear panel races.
    move: dollyDiag(-1, {amp: 1.2, z0: 1.04, z1: 1.3, tilt: 1.2}),
    body: compose({
      seed: 'ul4',
      plates: [
        {slug: 'ul_12j', cx: 760, cy: 1620, w: 1560, h: 1240, anchor: [0.44, 0.55], rot: -4, depth: DEPTH.photoFar, from: 't', to: 'l', tear: 1.7, pad: 30},
        {slug: 'ul_09p', cx: 1300, cy: 2740, w: 1960, rot: 3.4, depth: DEPTH.photoNear, from: 'r', to: 'b', tear: 1.1, pad: 26, inAt: -0.1},
      ],
      scraps: [{cx: 1660, cy: 900, w: 900, h: 320, color: C.ink, rot: 6, from: 'r'}],
      type: [{text: 'STAGE READY', y: 2900, size: 260, align: 'center', font: 'heavy', color: C.ink, from: 'b', to: 'b', stagger: 0.06, width: 1460}],
      callouts: [{text: 'LINE OUT', x: 300, y: 3020, size: 54, leader: 210, inAt: 0.7, bg: C.motuBlueDeep, color: C.paper}],
    }),
  },
  {
    id: 'ul-lap',
    beats: 3,
    lead: 0.8,
    lag: 0.7,
    move: pushIn({focus: [0.3, 0.35], amp: 1.1, z0: 1.04, z1: 1.36}),
    body: compose({
      seed: 'ul5',
      plates: [{slug: 'ul_04j', cx: 1060, cy: 2260, w: 2320, h: 1780, anchor: [0.5, 0.52], rot: 1.8, from: 'b', to: 'z', tear: 1.5, pad: 32}],
      scraps: [{cx: 520, cy: 1220, w: 1180, h: 420, color: C.teal, rot: -5, from: 'l'}],
      type: [
        {text: 'DESK', y: 940, size: 380, align: 'center', from: 'l', to: 'l', split: 'letter', stagger: 0.03, width: 1560},
        {text: 'OR LAP', y: 1330, size: 250, align: 'center', font: 'cond', color: C.paper, slab: C.ink, from: 'r', to: 'r', inAt: 0.3, width: 1560},
      ],
    }),
  },
  {
    id: 'ul-travel',
    beats: 3,
    lead: 0.7,
    lag: 0.9,
    move: orbit(1, {amp: 1.15, z0: 1.03, z1: 1.28, tilt: 1.9}),
    flash: 0.35,
    body: compose({
      seed: 'ul6',
      plates: [{slug: 'ul_06p', cx: 1100, cy: 2280, w: 2120, rot: 2.4, from: 'r', to: 't'}],
      scraps: [{cx: 1080, cy: 2320, w: 1700, h: 820, color: C.amber, rot: 3, from: 'z', opacity: 0.2}],
      bands: [{cx: 1080, cy: 3060, w: 1560, h: 440, color: C.ink, rot: -4, from: 'l', inAt: 0.15}],
      type: [
        {text: 'BUILT TO', y: 900, size: 290, align: 'center', from: 't', to: 'l', stagger: 0.05, width: 1560},
        {text: 'TRAVEL', y: 2940, size: 300, align: 'center', color: C.paper, from: 'b', to: 'b', inAt: 0.3, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'ul-software',
    beats: 5,
    lead: 0.9,
    lag: 0.6,
    // Long lateral dolly across three software plates on three different planes.
    move: dolly(1, {amp: 1.25, z0: 1.16, z1: 1.0, tilt: 0.9}),
    body: compose({
      seed: 'ul7',
      plates: [
        {slug: 'ul_06j', cx: 420, cy: 1420, w: 1420, rot: -5, depth: DEPTH.photoFar, from: 'l', to: 'l', tear: 1.8, pad: 26},
        {slug: 'ul_07j', cx: 1480, cy: 2160, w: 1300, rot: 3.6, depth: DEPTH.photo, from: 'r', to: 'r', tear: 1.6, pad: 26, inAt: 0.2},
        {slug: 'ul_09j', cx: 760, cy: 3080, w: 1560, rot: -2.4, depth: DEPTH.photoNear, from: 'b', to: 'b', tear: 1.5, pad: 26, inAt: 0.45},
      ],
      scraps: [{cx: 1780, cy: 700, w: 1000, h: 360, color: C.red, rot: -6, from: 'r'}],
      type: [{text: 'SHAPE IT LIVE', y: 620, size: 235, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.06, width: 1460}],
      callouts: [{text: 'EQ  ·  GATE  ·  REVERB', x: 220, y: 3620, size: 52, leader: 240, inAt: 1.4, bg: C.motuBlueDeep, color: C.paper}],
    }),
  },

  // ---- beat 36: THE DROP ------------------------------------------------
  {
    id: 'ul-drop',
    beats: 4,
    lead: 0.5,
    lag: 1.0,
    move: slamIn({focus: [0.12, -0.16], amp: 1.2, z0: 1.48, z1: 1.04}),
    flash: 1,
    body: compose({
      seed: 'ul8',
      plates: [{slug: 'ul_07p', cx: 1080, cy: 2400, w: 2280, rot: -1.6, from: 'z', to: 'zo'}],
      bands: [
        {cx: 1080, cy: 1180, w: 2400, h: 640, color: C.red, rot: -2.4, from: 't'},
        {cx: 1080, cy: 3140, w: 2000, h: 420, color: C.ink, rot: 1.8, from: 'b', inAt: 0.2},
      ],
      type: [
        {text: 'MK5', y: 960, size: 560, align: 'center', color: C.paper, from: 'z', to: 'z', split: 'letter', stagger: 0.05, width: 1560},
        {text: 'SMALL BOX. BIG ROOM.', y: 3060, size: 118, font: 'label', align: 'center', color: C.paper, tracking: 0.2, inAt: 0.5, stagger: 0.04, width: 1820},
      ],
      stars: [{cx: 1830, cy: 1720, r: 200, color: C.ink, inAt: 0.35}],
    }),
  },
  {
    id: 'ul-hours',
    beats: 3,
    lead: 0.9,
    lag: 0.8,
    move: drift2(-1, {amp: 1.2, z0: 1.24, z1: 1.05, tilt: 1.3}),
    body: compose({
      seed: 'ul9',
      plates: [{slug: 'ul_01j', cx: 1120, cy: 2200, w: 2340, h: 1860, anchor: [0.48, 0.5], rot: 2, from: 'r', to: 'l', tear: 1.6, pad: 32}],
      scraps: [{cx: 480, cy: 3220, w: 1100, h: 380, color: C.teal, rot: 4, from: 'l'}],
      type: [{text: 'AFTER HOURS', y: 940, size: 300, align: 'center', from: 'l', to: 't', stagger: 0.055, width: 1560}],
    }),
  },
  {
    id: 'ul-meters',
    beats: 3,
    lead: 0.8,
    lag: 0.7,
    // Tight push onto the meter bridge at the right of the panel.
    move: pushIn({focus: [0.68, -0.02], amp: 1.25, z0: 1.06, z1: 1.44}),
    flash: 0.35,
    body: compose({
      seed: 'ul10',
      plates: [{slug: 'ul_08p', cx: 1080, cy: 2020, w: 2300, rot: -1.4, from: 'z', to: 'r', tear: 1.1, pad: 28}],
      scraps: [{cx: 1700, cy: 1500, w: 900, h: 320, color: C.teal, rot: -5, from: 'r'}],
      type: [{text: 'WATCH IT', y: 2900, size: 270, align: 'center', font: 'heavy', color: C.ink, from: 'b', to: 'b', stagger: 0.06, width: 1460}],
      callouts: [{text: 'METERS', x: 1180, y: 2560, size: 62, leader: 240, inAt: 0.55, bg: C.red, color: C.paper, rot: -1.5}],
    }),
  },
  {
    id: 'ul-cuemix',
    beats: 3,
    lead: 0.7,
    lag: 0.9,
    move: pushIn({focus: [-0.22, 0.28], amp: 1.05, z0: 1.02, z1: 1.34}),
    body: compose({
      seed: 'ul11',
      plates: [{slug: 'ul_01p', cx: 1120, cy: 2300, w: 1900, rot: 1.8, from: 'b', to: 'z'}],
      scraps: [{cx: 1080, cy: 2340, w: 1700, h: 1500, color: C.motuBlue, rot: -2, from: 'z', opacity: 0.12}],
      type: [
        {text: 'SEE', y: 880, size: 380, align: 'center', from: 'l', to: 'l', split: 'letter', stagger: 0.04, width: 1560},
        {text: 'THE MIX', y: 1250, size: 240, align: 'center', font: 'cond', slab: C.motuBlueDeep, color: C.paper, from: 'r', to: 'r', inAt: 0.28, width: 1560},
      ],
    }),
  },
  {
    id: 'ul-desk',
    beats: 4,
    lead: 0.9,
    lag: 0.8,
    move: crane(-1, {amp: 1.2, z0: 1.05, z1: 1.28}),
    flash: 0.4,
    body: compose({
      seed: 'ul12',
      plates: [{slug: 'ul_02j', cx: 1060, cy: 2320, w: 2400, h: 1820, anchor: [0.5, 0.48], rot: -1.8, from: 't', to: 'b', tear: 1.7, pad: 34}],
      scraps: [{cx: 1660, cy: 1120, w: 1100, h: 380, color: C.red, rot: -5, from: 'r'}],
      bands: [{cx: 1080, cy: 2900, w: 1760, h: 400, color: C.ink, rot: -2.4, from: 'b', inAt: 0.35}],
      type: [
        {text: 'ONE DESK.', y: 860, size: 290, align: 'center', from: 'l', to: 't', stagger: 0.05, width: 1560},
        {text: 'WHOLE STUDIO.', y: 2820, size: 250, align: 'center', color: C.paper, from: 'b', to: 'b', inAt: 0.4, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'ul-ipad',
    beats: 3,
    lead: 0.8,
    lag: 0.7,
    move: pushIn({focus: [0.18, 0.22], amp: 1.15, z0: 1.04, z1: 1.44}),
    body: compose({
      seed: 'ul13',
      plates: [{slug: 'ul_13j', cx: 1100, cy: 2200, w: 2280, h: 1720, anchor: [0.5, 0.5], rot: 2.4, from: 'r', to: 'z', tear: 1.5, pad: 30}],
      scraps: [{cx: 460, cy: 1140, w: 1060, h: 360, color: C.teal, rot: 5, from: 'l'}],
      type: [{text: 'TOUCH THE MIX', y: 1000, size: 250, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 'l', stagger: 0.055, width: 1460}],
    }),
  },
  {
    id: 'ul-rack',
    beats: 4,
    lead: 0.9,
    lag: 0.7,
    move: dolly(-1, {amp: 1.3, z0: 1.14, z1: 1.0, tilt: 1.0}),
    body: compose({
      seed: 'ul14',
      plates: [
        {slug: 'ul_08j', cx: 1740, cy: 1500, w: 1420, rot: 4, depth: DEPTH.photoFar, from: 'r', to: 'r', tear: 1.7, pad: 26},
        {slug: 'ul_04p', cx: 700, cy: 2320, w: 1560, rot: -3, depth: DEPTH.photo, from: 'l', to: 'l', inAt: 0.15},
        {slug: 'ul_05p', cx: 1500, cy: 3120, w: 1500, rot: 2.6, depth: DEPTH.photoNear, from: 'b', to: 'b', inAt: 0.4},
      ],
      scraps: [{cx: 340, cy: 1420, w: 900, h: 320, color: C.ink, rot: -6, from: 'l'}],
      type: [{text: 'RACK IT OR PACK IT', y: 760, size: 215, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
    }),
  },
  {
    id: 'ul-room',
    beats: 3,
    lead: 0.8,
    lag: 0.8,
    move: drift2(1, {amp: 1.25, z0: 1.05, z1: 1.26, tilt: 1.2}),
    flash: 0.4,
    body: compose({
      seed: 'ul15',
      plates: [{slug: 'ul_05j', cx: 1080, cy: 2280, w: 2360, h: 1880, anchor: [0.5, 0.5], rot: -2, from: 'l', to: 'r', tear: 1.6, pad: 32}],
      scraps: [{cx: 1700, cy: 3260, w: 1120, h: 400, color: C.amber, rot: -4, from: 'b'}],
      type: [{text: 'MAKE ROOM', y: 940, size: 320, align: 'center', from: 'r', to: 't', stagger: 0.055, width: 1560}],
    }),
  },
  {
    id: 'ul-connect',
    beats: 5,
    lead: 0.8,
    lag: 1.0,
    move: dollyDiag(1, {amp: 1.3, z0: 1.02, z1: 1.3, tilt: 1.1}),
    body: compose({
      seed: 'ul16',
      plates: [
        {slug: 'ul_14j', cx: 900, cy: 1620, w: 1860, rot: -2.6, depth: DEPTH.photoFar, from: 't', to: 'l', tear: 1.5, pad: 30},
        {slug: 'ul_10j', cx: 1260, cy: 2900, w: 1700, rot: 3, depth: DEPTH.photoNear, from: 'b', to: 'r', tear: 1.5, pad: 30, inAt: 0.35},
      ],
      scraps: [{cx: 1740, cy: 640, w: 980, h: 340, color: C.red, rot: -6, from: 'r'}],
      type: [{text: 'EVERYTHING CONNECTS', y: 560, size: 195, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
      callouts: [{text: 'LOW LATENCY', x: 240, y: 3560, size: 54, leader: 230, inAt: 1.6, bg: C.ink, color: C.paper}],
    }),
  },
];
