// All on-screen copy in one place: brand strings, contact details, product specs.

export const BRAND = {
  dealer: 'SHIVANSH ELECTRONICS',
  distributor: 'AUTHORIZED DISTRIBUTOR OF MOTU',
  region: 'EAST & NORTH-EAST INDIA',
  motuFull: 'MARK OF THE UNICORN, USA',
} as const;

export const CONTACT = {
  web: 'www.shivanshelectronics.in',
  hub: 'linktr.ee/shivanshelectronics.in',
  ig: 'instagram.com/shivanshelectronics.in',
  fb: 'facebook.com/shivanshelectronics.in',
  li: 'linkedin.com/company/shivanshelectronics-in',
  th: 'threads.com/@shivanshelectronics.in',
  x: 'x.com/sarbo_shivansh',
  yt: 'youtube.com/@shivanshelectronics-in',
  waChannel: 'WhatsApp Community Channel',
  phones: ['+91 98316 62458', '+91 91477 00677', '+91 89818 07755'] as const,
  address: '3, Ramanath Das Road, Dhakuria, Tanu Pukur,\nGarfa, Kolkata, West Bengal 700031',
} as const;

export const PRICE = {
  ul: {label: 'MOTU UltraLite-mk5', value: '81,900', note: 'PER UNIT · INCLUDING GST'},
  e8: {label: 'MOTU 828', value: '1,20,000', note: 'PER UNIT · INCLUDING GST'},
} as const;

/** Comparison rows for the side-by-side scene. Deliberately shows where they diverge. */
export const COMPARE: {k: string; ul: string; e8: string; split: boolean}[] = [
  {k: 'I/O', ul: '18 × 22', e8: '28 × 32', split: true},
  {k: 'SIMULTANEOUS CH.', ul: '40', e8: '60', split: true},
  {k: 'FORM FACTOR', ul: 'HALF-RACK DESKTOP', e8: '1U FULL RACK', split: true},
  {k: 'POWER', ul: 'EXTERNAL PSU', e8: 'INTERNAL PSU', split: true},
  {k: 'OPTICAL', ul: '8 CH · 1 BANK', e8: '16 CH · 2 BANKS', split: true},
  {k: 'HEADPHONES', ul: '1 OUT', e8: '2 INDEPENDENT', split: true},
  {k: 'MAIN OUTS', ul: 'BALANCED TRS', e8: 'XLR', split: true},
  {k: 'INSERT LOOPS', ul: '—', e8: 'YES · 2 CHANNELS', split: true},
  {k: 'LOOPBACK', ul: '—', e8: 'YES', split: true},
  {k: 'TALKBACK / A-B', ul: '—', e8: 'YES', split: true},
  {k: 'FRONT DISPLAY', ul: 'LCD METERS', e8: '3.9" RGB LCD', split: true},
  {k: 'ROUND-TRIP LATENCY', ul: '2.4 ms', e8: '~2 ms', split: true},
  {k: 'CUEMIX 5 DSP', ul: 'YES', e8: 'YES', split: false},
  {k: 'ESS SABRE32', ul: 'YES', e8: 'YES', split: false},
  {k: 'UP TO 192 kHz', ul: 'YES', e8: 'YES', split: false},
];
