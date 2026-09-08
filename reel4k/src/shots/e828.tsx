import {C, DEPTH} from '../lib/theme';
import {ShotSpec} from './Shot';
import {compose} from './layouts';
import {pushIn, pullBack, drift2, crane, dolly, dollyDiag, orbit} from '../camera/Camera';
import {BrandStrip} from '../elements/BrandStrip';

/**
 * MOTU 828 MOVEMENT - beats 68..184 (30.44s - 82.38s)
 *
 * Tone (master brief S8): the rack, the room, routing and monitoring. Where the
 * UltraLite movement is about carrying a studio, this one is about running one -
 * loopback, talkback, patching, stacking, a whole front end.
 *
 * The 828 has roughly twice the UltraLite's distinct-image count (43 vs 22), so
 * this movement gets both a longer allocation and a faster average cut rate,
 * with software, brand and diagram plates grouped into dollied multi-plate
 * walls rather than dropped from the coverage list (master brief S2, S5).
 *
 * All 43 remaining 828 images are covered here. (e828_21j, e828_09j and
 * e828_01j appear in the cold open.)
 */
export const E828: ShotSpec[] = [
  {
    id: 'e8-title',
    beats: 7,
    lead: 0.6,
    lag: 1.0,
    move: pullBack({focus: [0.5, -0.28], amp: 1.3, z0: 1.52, z1: 1.02}),
    flash: 1,
    body: compose({
      seed: 'e1',
      plates: [{slug: 'e828_02p', cx: 1080, cy: 2400, w: 2260, rot: 1.4, from: 'z', to: 'l'}],
      scraps: [
        {cx: 1080, cy: 2440, w: 1900, h: 780, color: C.motuBlue, rot: 2.6, from: 'b', opacity: 0.15},
        {cx: 1780, cy: 3220, w: 1000, h: 340, color: C.red, rot: -5, from: 'r', inAt: 0.8},
      ],
      bands: [{cx: 1080, cy: 1180, w: 2300, h: 800, color: C.ink, rot: -1.8, from: 't'}],
      type: [
        {text: 'MOTU', y: 830, size: 200, font: 'label', align: 'center', color: C.paper, tracking: 0.4, from: 't', to: 't', stagger: 0.05, width: 1820},
        {text: '828', y: 1035, size: 480, align: 'center', color: C.paper, from: 'z', to: 'z', split: 'letter', stagger: 0.06, inAt: 0.2, width: 1560},
        {text: 'RUN THE ROOM', y: 2900, size: 250, align: 'center', font: 'heavy', color: C.ink, from: 'l', to: 'b', inAt: 1.0, stagger: 0.06, width: 1460},
      ],
    }),
  },
  {
    id: 'e8-monitor',
    beats: 3,
    lead: 0.8,
    lag: 0.7,
    move: pushIn({focus: [-0.3, 0.08], amp: 1.0, z0: 1.05, z1: 1.34}),
    body: compose({
      seed: 'e2',
      plates: [{slug: 'e828_03j', cx: 1080, cy: 2080, w: 2020, rot: -2, from: 'r', to: 'z', tear: 1.3, pad: 28}],
      scraps: [{cx: 480, cy: 1140, w: 1020, h: 350, color: C.teal, rot: 4, from: 'l'}],
      type: [{text: 'READ THE ROOM', y: 1020, size: 230, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 'l', stagger: 0.055, width: 1460}],
      callouts: [{text: 'MONITOR', x: 1120, y: 2620, size: 60, leader: 240, inAt: 0.5, bg: C.ink, color: C.paper, rot: -1.5}],
    }),
  },
  {
    id: 'e8-wakes',
    beats: 4,
    lead: 0.9,
    lag: 0.8,
    move: crane(-1, {amp: 1.25, z0: 1.04, z1: 1.3}),
    flash: 0.4,
    body: compose({
      seed: 'e3',
      plates: [{slug: 'e828_28j', cx: 1090, cy: 2280, w: 2280, h: 1960, anchor: [0.5, 0.52], rot: 1.6, from: 'b', to: 't', tear: 1.7, pad: 34}],
      scraps: [{cx: 1700, cy: 1080, w: 1080, h: 380, color: C.red, rot: -5, from: 'r'}],
      bands: [{cx: 1080, cy: 2980, w: 1620, h: 400, color: C.ink, rot: 2.2, from: 'b', inAt: 0.3}],
      type: [
        {text: 'THE RACK', y: 850, size: 300, align: 'center', from: 'l', to: 't', stagger: 0.05, width: 1560},
        {text: 'WAKES UP', y: 2900, size: 280, align: 'center', color: C.paper, from: 'b', to: 'b', inAt: 0.4, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'e8-inputs',
    beats: 3,
    lead: 0.8,
    lag: 0.7,
    move: drift2(1, {amp: 1.2, z0: 1.06, z1: 1.24, tilt: 1.0}),
    body: compose({
      seed: 'e4',
      plates: [{slug: 'e828_05p', cx: 1060, cy: 2180, w: 2280, rot: -1.6, from: 'l', to: 'r'}],
      scraps: [{cx: 1080, cy: 2200, w: 1900, h: 700, color: C.amber, rot: 2, from: 'z', opacity: 0.18}],
      type: [{text: 'EVERY INPUT', y: 1080, size: 270, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.055, width: 1460}],
      callouts: [{text: 'MIC · LINE · INST', x: 280, y: 2900, size: 56, leader: 250, inAt: 0.5, bg: C.motuBlueDeep, color: C.paper}],
    }),
  },
  {
    id: 'e8-send',
    beats: 3,
    lead: 0.7,
    lag: 0.8,
    move: pushIn({focus: [0.55, -0.2], amp: 1.25, z0: 1.04, z1: 1.3}),
    body: compose({
      seed: 'e5',
      plates: [{slug: 'e828_22j', cx: 1080, cy: 2140, w: 1880, rot: 2.2, from: 'b', to: 'l', tear: 1.4, pad: 26}],
      scraps: [{cx: 520, cy: 3120, w: 1080, h: 380, color: C.ink, rot: -4, from: 'l'}],
      type: [{text: 'PATCH IT IN', y: 1080, size: 280, align: 'center', from: 'r', to: 't', stagger: 0.055, width: 1560}],
      callouts: [{text: 'SEND / RETURN', x: 300, y: 2960, size: 58, leader: 230, inAt: 0.55, bg: C.red, color: C.paper, rot: 1.5}],
    }),
  },
  {
    id: 'e8-mic',
    beats: 4,
    lead: 0.9,
    lag: 0.8,
    move: crane(1, {amp: 1.2, z0: 1.24, z1: 1.04}),
    body: compose({
      seed: 'e6',
      plates: [{slug: 'e828_25j', cx: 1070, cy: 2260, w: 2320, h: 1900, anchor: [0.46, 0.5], rot: -2.4, from: 't', to: 'b', tear: 1.6, pad: 32}],
      scraps: [{cx: 1720, cy: 3280, w: 1120, h: 400, color: C.teal, rot: -4, from: 'r'}],
      type: [{text: 'PUT A MIC ON IT', y: 900, size: 255, font: 'heavy', align: 'center', color: C.ink, from: 'l', to: 't', stagger: 0.05, width: 1460}],
    }),
  },
  {
    id: 'e8-loopback',
    beats: 4,
    lead: 0.9,
    lag: 0.6,
    move: dolly(1, {amp: 1.3, z0: 1.16, z1: 1.0, tilt: 0.9}),
    flash: 0.4,
    body: compose({
      seed: 'e7',
      plates: [
        {slug: 'e828_15j', cx: 560, cy: 1560, w: 1340, rot: -4.5, depth: DEPTH.photoFar, from: 'l', to: 'l', tear: 1.8, pad: 26},
        {slug: 'e828_02j', cx: 1560, cy: 2340, w: 1060, rot: 3.8, depth: DEPTH.photo, from: 'r', to: 'r', tear: 1.6, pad: 24, inAt: 0.2},
        {slug: 'e828_17j', cx: 780, cy: 3120, w: 1500, rot: -2.2, depth: DEPTH.photoNear, from: 'b', to: 'b', tear: 1.5, pad: 26, inAt: 0.42},
      ],
      scraps: [{cx: 1780, cy: 780, w: 1000, h: 350, color: C.red, rot: -6, from: 'r'}],
      type: [{text: 'LOOPBACK LIVES HERE', y: 640, size: 190, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
    }),
  },
  {
    id: 'e8-patch',
    beats: 5,
    lead: 0.8,
    lag: 0.9,
    move: drift2(-1, {amp: 1.35, z0: 1.3, z1: 1.04, tilt: 1.4}),
    body: compose({
      seed: 'e8',
      plates: [{slug: 'e828_13p', cx: 1100, cy: 2200, w: 2340, rot: 1.8, from: 'r', to: 'l', tear: 1.3, pad: 30, card: true}],
      scraps: [{cx: 420, cy: 3240, w: 1020, h: 360, color: C.red, rot: 5, from: 'l', inAt: 0.6}],
      bands: [{cx: 1080, cy: 1140, w: 2200, h: 620, color: C.ink, rot: -2, from: 't'}],
      type: [
        {text: 'PATCH THE', y: 880, size: 280, align: 'center', color: C.paper, from: 't', to: 't', stagger: 0.05, width: 1560},
        {text: 'WHOLE ROOM', y: 2920, size: 280, align: 'center', color: C.ink, from: 'b', to: 'b', inAt: 0.45, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'e8-optical',
    beats: 3,
    lead: 0.7,
    lag: 0.7,
    // Small source file: keep the push shallow so it never softens.
    move: drift2(-1, {amp: 1.0, z0: 1.04, z1: 1.18, tilt: 1.4}),
    body: compose({
      seed: 'e9',
      plates: [{slug: 'e828_04j', cx: 1090, cy: 2120, w: 1560, rot: -2.6, from: 'z', to: 'r', tear: 1.5, pad: 26}],
      scraps: [{cx: 1740, cy: 1200, w: 940, h: 340, color: C.teal, rot: -5, from: 'r'}],
      type: [{text: 'GO OPTICAL', y: 1100, size: 265, align: 'center', font: 'heavy', color: C.ink, from: 'l', to: 'l', stagger: 0.055, width: 1460}],
      callouts: [{text: 'OPTICAL', x: 340, y: 2900, size: 60, leader: 240, inAt: 0.5, bg: C.ink, color: C.paper}],
    }),
  },
  {
    id: 'e8-midi',
    beats: 3,
    lead: 0.8,
    lag: 0.8,
    move: drift2(1, {amp: 1.1, z0: 1.2, z1: 1.04, tilt: 1.1}),
    body: compose({
      seed: 'e10',
      plates: [{slug: 'e828_10j', cx: 1070, cy: 2160, w: 2060, rot: 2, from: 'l', to: 'r', tear: 1.4, pad: 28}],
      scraps: [{cx: 500, cy: 1160, w: 1060, h: 360, color: C.amber, rot: 4, from: 'l'}],
      type: [{text: 'STILL HAS MIDI', y: 1060, size: 235, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
      callouts: [{text: 'MIDI IN / OUT', x: 1080, y: 2900, size: 56, leader: 220, inAt: 0.55, bg: C.red, color: C.paper, rot: -1.5}],
    }),
  },
  {
    id: 'e8-amp',
    beats: 4,
    lead: 0.9,
    lag: 0.8,
    move: pushIn({focus: [-0.35, 0.22], amp: 1.15, z0: 1.03, z1: 1.36}),
    flash: 0.35,
    body: compose({
      seed: 'e11',
      plates: [{slug: 'e828_18j', cx: 1080, cy: 2260, w: 2340, h: 1960, anchor: [0.42, 0.5], rot: -1.8, from: 'b', to: 'z', tear: 1.7, pad: 34}],
      scraps: [{cx: 1700, cy: 1120, w: 1060, h: 380, color: C.red, rot: -5, from: 'r'}],
      bands: [{cx: 1080, cy: 2980, w: 1520, h: 400, color: C.ink, rot: -2, from: 'b', inAt: 0.3}],
      type: [
        {text: 'AMP IN', y: 860, size: 320, align: 'center', from: 'l', to: 't', stagger: 0.05, width: 1560},
        {text: 'THE ROOM', y: 2900, size: 290, align: 'center', color: C.paper, from: 'b', to: 'b', inAt: 0.4, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'e8-channels',
    beats: 4,
    lead: 0.9,
    lag: 0.6,
    move: dolly(-1, {amp: 1.3, z0: 1.14, z1: 1.0, tilt: 1.0}),
    body: compose({
      seed: 'e12',
      plates: [
        {slug: 'e828_12j', cx: 1660, cy: 1520, w: 1400, rot: 4.2, depth: DEPTH.photoFar, from: 'r', to: 'r', tear: 1.7, pad: 26},
        {slug: 'e828_13j', cx: 640, cy: 2320, w: 1440, rot: -3.4, depth: DEPTH.photo, from: 'l', to: 'l', tear: 1.6, pad: 26, inAt: 0.18},
        {slug: 'e828_16j', cx: 1440, cy: 3160, w: 1420, rot: 2.4, depth: DEPTH.photoNear, from: 'b', to: 'b', tear: 1.5, pad: 26, inAt: 0.4},
      ],
      scraps: [{cx: 380, cy: 1560, w: 1020, h: 350, color: C.red, rot: -6, from: 'l'}],
      type: [{text: 'SHAPE EVERY CHANNEL', y: 700, size: 185, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
    }),
  },
  {
    id: 'e8-rackspace',
    beats: 4,
    lead: 0.8,
    lag: 0.9,
    move: orbit(-1, {amp: 1.2, z0: 1.03, z1: 1.26, tilt: 2.0}),
    body: compose({
      seed: 'e13',
      plates: [{slug: 'e828_06p', cx: 1080, cy: 2280, w: 2300, rot: -2, from: 'l', to: 't'}],
      scraps: [{cx: 1080, cy: 2300, w: 1980, h: 760, color: C.motuBlue, rot: 2.4, from: 'z', opacity: 0.16}],
      bands: [{cx: 1080, cy: 1190, w: 1700, h: 420, color: C.ink, rot: -4, from: 'l'}],
      type: [
        {text: 'ONE RACK', y: 1090, size: 270, align: 'center', color: C.paper, from: 'l', to: 'l', stagger: 0.05, width: 1560},
        {text: 'SPACE', y: 2920, size: 330, align: 'center', color: C.ink, from: 'b', to: 'b', inAt: 0.4, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'e8-spdif',
    beats: 3,
    lead: 0.7,
    lag: 0.7,
    move: dollyDiag(1, {amp: 0.95, z0: 1.04, z1: 1.16, tilt: 1.3}),
    body: compose({
      seed: 'e14',
      plates: [{slug: 'e828_05j', cx: 1080, cy: 2160, w: 1420, rot: 2.6, from: 'z', to: 'b', tear: 1.6, pad: 24}],
      scraps: [{cx: 1700, cy: 3140, w: 980, h: 350, color: C.teal, rot: -4, from: 'r'}],
      type: [{text: 'CLOCK IT', y: 1120, size: 300, align: 'center', font: 'heavy', color: C.ink, from: 't', to: 'l', stagger: 0.055, width: 1460}],
      callouts: [{text: 'S/PDIF', x: 1180, y: 2760, size: 60, leader: 230, inAt: 0.5, bg: C.ink, color: C.paper, rot: 1.5}],
    }),
  },
  {
    id: 'e8-anywhere',
    beats: 4,
    lead: 0.9,
    lag: 0.8,
    move: pushIn({focus: [0.25, 0.3], amp: 0.9, z0: 1.03, z1: 1.24}),
    flash: 0.4,
    body: compose({
      seed: 'e15',
      plates: [{slug: 'e828_15p', cx: 1080, cy: 2260, w: 1780, rot: -2.2, from: 'r', to: 'z', tear: 1.5, pad: 28}],
      scraps: [{cx: 520, cy: 1180, w: 1100, h: 380, color: C.red, rot: 5, from: 'l'}],
      type: [
        {text: 'MIX FROM', y: 940, size: 290, align: 'center', from: 'l', to: 't', stagger: 0.05, width: 1560},
        {text: 'ANYWHERE', y: 2900, size: 300, align: 'center', color: C.ink, from: 'b', to: 'b', inAt: 0.4, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'e8-session',
    beats: 4,
    lead: 0.9,
    lag: 0.6,
    move: dollyDiag(1, {amp: 1.3, z0: 1.02, z1: 1.28, tilt: 1.2}),
    body: compose({
      seed: 'e16',
      plates: [
        {slug: 'e828_11p', cx: 700, cy: 1520, w: 1500, rot: -4, depth: DEPTH.photoFar, from: 't', to: 'l', tear: 1.8, pad: 26},
        {slug: 'e828_12p', cx: 1500, cy: 2440, w: 1500, rot: 3.2, depth: DEPTH.photo, from: 'r', to: 'r', tear: 1.6, pad: 26, inAt: 0.22},
        {slug: 'e828_29j', cx: 900, cy: 3260, w: 1720, rot: -2, depth: DEPTH.photoNear, from: 'b', to: 'b', tear: 1.4, pad: 24, inAt: 0.45},
      ],
      type: [{text: 'THE SESSION GROWS', y: 660, size: 200, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
    }),
  },
  {
    id: 'e8-front',
    beats: 4,
    lead: 0.8,
    lag: 0.8,
    move: drift2(1, {amp: 1.15, z0: 1.05, z1: 1.24, tilt: 1.0}),
    body: (ctx) => (
      <>
        {compose({
          seed: 'e17',
          plates: [{slug: 'e828_03p', cx: 1080, cy: 2180, w: 2320, rot: 1.2, from: 'l', to: 'r'}],
          scraps: [{cx: 1080, cy: 2200, w: 2000, h: 640, color: C.amber, rot: -2, from: 'z', opacity: 0.16}],
          type: [{text: 'STAY IN FRONT', y: 1080, size: 265, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.055, width: 1460}],
        })(ctx)}
        {/* Single, light mid-reel branding touch - deliberately a strip in the
            lower band rather than a beat of its own, so it costs the montage
            no time and never competes with a dense cut (master brief S7). */}
        <BrandStrip ctx={ctx} y={3320} inAt={0.7} outAt={ctx.dur + 0.2} />
      </>
    ),
  },
  {
    id: 'e8-levels',
    beats: 3,
    lead: 0.7,
    lag: 0.7,
    move: pushIn({focus: [0.55, 0.12], amp: 1.05, z0: 1.05, z1: 1.4}),
    body: compose({
      seed: 'e18',
      plates: [{slug: 'e828_07j', cx: 1080, cy: 2120, w: 2100, rot: -2.4, from: 'z', to: 'l', tear: 1.3, pad: 28}],
      scraps: [{cx: 480, cy: 3160, w: 1040, h: 360, color: C.ink, rot: 4, from: 'l'}],
      type: [{text: 'HOLD THE LEVEL', y: 1060, size: 230, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
      callouts: [{text: 'LEVELS', x: 1220, y: 2700, size: 60, leader: 230, inAt: 0.5, bg: C.red, color: C.paper}],
    }),
  },
  {
    id: 'e8-iron',
    beats: 3,
    lead: 0.8,
    lag: 0.7,
    move: drift2(-1, {amp: 1.2, z0: 1.22, z1: 1.04, tilt: 1.3}),
    body: compose({
      seed: 'e19',
      plates: [{slug: 'e828_11j', cx: 1080, cy: 2220, w: 2120, h: 1700, anchor: [0.5, 0.5], rot: 2.2, from: 'r', to: 'l', tear: 1.7, pad: 32}],
      scraps: [{cx: 1720, cy: 1120, w: 1000, h: 350, color: C.teal, rot: -5, from: 'r'}],
      bands: [{cx: 1080, cy: 3000, w: 1520, h: 400, color: C.ink, rot: 2.6, from: 'b'}],
      type: [{text: 'OLD IRON', y: 2920, color: C.paper, size: 330, align: 'center', from: 'b', to: 'b', stagger: 0.055, width: 1560}],
    }),
  },
  {
    id: 'e8-brain',
    beats: 3,
    lead: 0.7,
    lag: 0.8,
    move: dollyDiag(-1, {amp: 0.95, z0: 1.03, z1: 1.18, tilt: 1.5}),
    flash: 0.35,
    body: compose({
      seed: 'e20',
      plates: [{slug: 'e828_26j', cx: 1080, cy: 2240, w: 1500, rot: -3, from: 'b', to: 'z', tear: 1.6, pad: 24}],
      scraps: [{cx: 1080, cy: 2260, w: 1560, h: 760, color: C.motuBlue, rot: 3, from: 'z', opacity: 0.16}],
      type: [{text: 'NEW BRAIN', y: 1080, size: 330, align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.055, width: 1560}],
    }),
  },
  {
    id: 'e8-talk',
    beats: 4,
    lead: 0.9,
    lag: 0.6,
    move: dolly(1, {amp: 1.25, z0: 1.15, z1: 1.0, tilt: 0.9}),
    body: compose({
      seed: 'e21',
      plates: [
        {slug: 'e828_27j', cx: 620, cy: 1560, w: 1520, rot: -4, depth: DEPTH.photoFar, from: 'l', to: 'l', tear: 1.7, pad: 26},
        {slug: 'e828_14j', cx: 1520, cy: 2400, w: 1300, rot: 3.6, depth: DEPTH.photo, from: 'r', to: 'r', tear: 1.6, pad: 26, inAt: 0.2},
        {slug: 'e828_09p', cx: 780, cy: 3220, w: 1020, rot: -2, depth: DEPTH.photoNear, from: 'b', to: 'b', inAt: 0.45},
      ],
      scraps: [{cx: 1780, cy: 800, w: 1000, h: 350, color: C.red, rot: -6, from: 'r'}],
      type: [{text: 'TALK TO THE ROOM', y: 660, size: 205, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
      callouts: [{text: 'TALKBACK', x: 1300, y: 3620, size: 54, leader: 200, inAt: 1.3, bg: C.ink, color: C.paper}],
    }),
  },
  {
    id: 'e8-centre',
    beats: 5,
    lead: 0.8,
    lag: 0.9,
    move: pullBack({focus: [-0.45, 0.22], amp: 1.25, z0: 1.42, z1: 1.02}),
    flash: 0.5,
    body: compose({
      seed: 'e22',
      plates: [{slug: 'e828_01p', cx: 1080, cy: 2300, w: 2320, rot: -1.4, from: 'z', to: 'zo'}],
      scraps: [{cx: 1080, cy: 2320, w: 1960, h: 720, color: C.red, rot: -2.6, from: 'z', opacity: 0.14}],
      bands: [{cx: 1080, cy: 1150, w: 2260, h: 660, color: C.ink, rot: 2, from: 't'}],
      type: [
        {text: 'FRONT AND', y: 960, size: 270, align: 'center', color: C.paper, from: 't', to: 't', stagger: 0.05, width: 1560},
        {text: 'CENTRE', y: 2920, size: 360, align: 'center', color: C.ink, from: 'b', to: 'b', inAt: 0.45, split: 'letter', stagger: 0.04, width: 1560},
      ],
    }),
  },
  {
    id: 'e8-foot',
    beats: 3,
    lead: 0.7,
    lag: 0.7,
    move: orbit(1, {amp: 0.95, z0: 1.03, z1: 1.15, tilt: 2.2}),
    body: compose({
      seed: 'e23',
      plates: [{slug: 'e828_20j', cx: 1090, cy: 2220, w: 1280, rot: 3, from: 'r', to: 'b', tear: 1.6, pad: 24}],
      scraps: [{cx: 480, cy: 1180, w: 1020, h: 350, color: C.amber, rot: 4, from: 'l'}],
      type: [{text: 'HANDS FREE', y: 1100, size: 290, align: 'center', font: 'heavy', color: C.ink, from: 'l', to: 'l', stagger: 0.055, width: 1460}],
      callouts: [{text: 'FOOTSWITCH', x: 300, y: 2940, size: 56, leader: 240, inAt: 0.55, bg: C.motuBlueDeep, color: C.paper}],
    }),
  },
  {
    id: 'e8-mainout',
    beats: 3,
    lead: 0.8,
    lag: 0.8,
    move: drift2(1, {amp: 1.15, z0: 1.18, z1: 1.03, tilt: 1.1}),
    body: compose({
      seed: 'e24',
      plates: [{slug: 'e828_07p', cx: 1080, cy: 2180, w: 2280, rot: 1.6, from: 'l', to: 'r'}],
      scraps: [{cx: 1720, cy: 3160, w: 1040, h: 360, color: C.ink, rot: -4, from: 'r'}],
      type: [{text: 'ROUTE IT ALL', y: 1100, size: 270, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.055, width: 1460}],
      callouts: [{text: 'MAIN OUT', x: 320, y: 2820, size: 58, leader: 240, inAt: 0.5, bg: C.red, color: C.paper}],
    }),
  },
  {
    id: 'e8-deep',
    beats: 4,
    lead: 0.9,
    lag: 0.6,
    move: dolly(-1, {amp: 1.25, z0: 1.14, z1: 1.0, tilt: 1.0}),
    body: compose({
      seed: 'e25',
      plates: [
        {slug: 'e828_19j', cx: 1620, cy: 1540, w: 1420, rot: 4, depth: DEPTH.photoFar, from: 'r', to: 'r', tear: 1.7, pad: 26},
        {slug: 'e828_31j', cx: 660, cy: 2360, w: 1400, rot: -3.4, depth: DEPTH.photo, from: 'l', to: 'l', tear: 1.6, pad: 26, inAt: 0.2},
        {slug: 'e828_14p', cx: 1460, cy: 3180, w: 1240, rot: 2.4, depth: DEPTH.photoNear, from: 'b', to: 'b', tear: 1.5, pad: 24, inAt: 0.42},
      ],
      scraps: [{cx: 420, cy: 900, w: 1000, h: 350, color: C.teal, rot: -6, from: 'l'}],
      type: [{text: 'BUILT DEEP', y: 720, size: 280, align: 'center', font: 'heavy', color: C.ink, from: 't', to: 't', stagger: 0.055, width: 1460}],
    }),
  },
  {
    id: 'e8-frontend',
    beats: 4,
    lead: 0.9,
    lag: 0.8,
    move: crane(-1, {amp: 1.15, z0: 1.06, z1: 1.24}),
    flash: 0.4,
    body: compose({
      seed: 'e26',
      plates: [{slug: 'e828_30j', cx: 1080, cy: 2260, w: 1900, rot: -2, from: 'b', to: 't', tear: 1.6, pad: 28}],
      scraps: [{cx: 1700, cy: 1140, w: 1060, h: 380, color: C.red, rot: -5, from: 'r'}],
      type: [
        {text: 'THE WHOLE', y: 900, size: 280, align: 'center', from: 'l', to: 't', stagger: 0.05, width: 1560},
        {text: 'FRONT END', y: 2900, size: 290, align: 'center', color: C.ink, from: 'b', to: 'b', inAt: 0.4, stagger: 0.05, width: 1560},
      ],
    }),
  },
  {
    id: 'e8-stack',
    beats: 5,
    lead: 0.8,
    lag: 0.9,
    move: pushIn({focus: [0.05, -0.28], amp: 1.1, z0: 1.03, z1: 1.34}),
    body: compose({
      seed: 'e27',
      plates: [{slug: 'e828_06j', cx: 1080, cy: 2200, w: 2360, h: 1720, anchor: [0.5, 0.5], rot: 1.4, from: 'z', to: 'zo', tear: 1.5, pad: 30}],
      bands: [{cx: 1080, cy: 1130, w: 2200, h: 620, color: C.ink, rot: -2, from: 't'}],
      type: [
        {text: 'STACK THEM', y: 940, size: 290, align: 'center', color: C.paper, from: 't', to: 't', stagger: 0.05, width: 1560},
        {text: 'SCALE THE STUDIO', y: 3020, size: 145, font: 'label', align: 'center', color: C.ink, tracking: 0.22, inAt: 0.6, stagger: 0.04, width: 1820},
      ],
    }),
  },
  {
    id: 'e8-sounds',
    beats: 6,
    lead: 0.9,
    lag: 0.6,
    move: dolly(1, {amp: 1.45, z0: 1.18, z1: 0.98, tilt: 1.1}),
    body: compose({
      seed: 'e28',
      plates: [
        {slug: 'e828_10p', cx: 520, cy: 1500, w: 1360, rot: -4.5, depth: DEPTH.photoFar, from: 'l', to: 'l', tear: 1.8, pad: 24},
        {slug: 'e828_23j', cx: 1500, cy: 1980, w: 1000, rot: 3.5, depth: DEPTH.photo, from: 'r', to: 'r', tear: 1.6, pad: 22, inAt: 0.25},
        {slug: 'e828_24j', cx: 660, cy: 2740, w: 1000, rot: -2.8, depth: DEPTH.photoNear, from: 'b', to: 'b', tear: 1.6, pad: 22, inAt: 0.5},
        {slug: 'e828_08j', cx: 1560, cy: 3260, w: 1000, rot: 4.2, depth: DEPTH.photo, from: 'r', to: 'b', tear: 1.6, pad: 22, inAt: 0.75},
      ],
      scraps: [{cx: 1780, cy: 780, w: 1000, h: 350, color: C.amber, rot: -6, from: 'r'}],
      type: [{text: 'SOUNDS INCLUDED', y: 640, size: 215, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
    }),
  },
  {
    id: 'e8-ready',
    beats: 4,
    lead: 0.8,
    lag: 0.9,
    move: drift2(-1, {amp: 1.25, z0: 1.26, z1: 1.03, tilt: 1.3}),
    flash: 0.45,
    body: compose({
      seed: 'e29',
      plates: [{slug: 'e828_04p', cx: 1080, cy: 2160, w: 2340, rot: -1.2, from: 'r', to: 'l', tear: 1.1, pad: 26}],
      scraps: [
        {cx: 1080, cy: 2180, w: 2060, h: 560, color: C.motuBlue, rot: 2, from: 'z', opacity: 0.16},
        {cx: 460, cy: 3200, w: 1060, h: 370, color: C.red, rot: 4, from: 'l', inAt: 0.5},
      ],
      type: [{text: 'READY TO RECORD', y: 1060, size: 240, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
    }),
  },
  {
    id: 'e8-patchbay',
    beats: 3,
    lead: 0.7,
    lag: 1.0,
    move: pushIn({focus: [-0.5, 0.05], amp: 0.9, z0: 1.04, z1: 1.28}),
    body: compose({
      seed: 'e30',
      plates: [{slug: 'e828_08p', cx: 1080, cy: 2140, w: 2300, rot: 2, from: 'b', to: 'z', tear: 1.2, pad: 26}],
      scraps: [{cx: 1700, cy: 1620, w: 1000, h: 350, color: C.teal, rot: -5, from: 'r'}],
      type: [{text: 'THE BACK PANEL', y: 1080, size: 235, font: 'heavy', align: 'center', color: C.ink, from: 't', to: 't', stagger: 0.05, width: 1460}],
      callouts: [{text: 'PATCHBAY', x: 320, y: 2860, size: 58, leader: 240, inAt: 0.5, bg: C.red, color: C.paper}],
    }),
  },
];
