// ─────────────────────────────────────────────────────────────────────────────
// THE SPEECH SCRIPT — single source of truth for the film.
//
// One file produces the timestamped read-aloud script and every on-screen
// caption, so the voice and the picture cannot drift apart.
//
// PACING CARRIED OVER EXACTLY from the AVB series and the UltraLite-mk5 / 828
// films, by instruction: 165 words per minute written, a 0.4 s breath between
// segments, a 0.2 s beat after a caption that closes a thought. That lands at
// roughly 154 wpm effective, which is the rate those films were cut to.
//
// WHAT THIS FILM ARGUES. The research brief in this repository is unusually
// careful on one point, and the whole script rests on it: the UltraLite-mk5
// and the 828 do NOT share one internal engine the way the AVB 16A, 848 and
// 10pre genuinely did. They are two architectures that share a converter tier,
// a preamplifier design and an ecosystem, and differ in bandwidth, form factor
// and how much you can point at them.
//
// So the film refuses the good-versus-better framing. It says: the thing that
// decides how a take sounds is identical in both, and what you are choosing
// between is a desk and a rack. That is the honest reading of the
// specification, and it is also the more useful thing for someone deciding.
//
// EVERY NUMBER SPOKEN HERE IS IN theme.ts:SPEC and was checked against dealer
// and trade documentation first. Anything not in that table is not said.
//
// NO COMPETITOR is named, alluded to or implied. Where the writing contrasts,
// it contrasts with an outcome — a take you cannot use — never with another
// manufacturer.
//
// NO PRICING. Not a figure, not a currency, not a comparison, by instruction.
// This is a deliberate change from the earlier ten-minute long-form in this
// repository, which timestamped a pricing moment at 09:18.
//
// NO BRANDING in any caption. Shivansh Electronics and MOTU appear only on the
// end screen, for ten seconds.
// ─────────────────────────────────────────────────────────────────────────────

import type { AccentKey } from "./theme.ts";

/** Words per minute the scripts are written to. */
export const WPM = 165;
/** Gap held after each segment so the reader can breathe and the edit can cut. */
export const SEGMENT_GAP = 0.4;
/** Extra beat after a caption that ends a thought. */
export const BEAT = 0.2;

export type Caption = {
  /** The phrase, exactly as spoken and exactly as captioned on screen. */
  t: string;
  /** The word the script face carries — the term the sentence turns on. */
  e: string;
  /** How many words this really is when read aloud (numerals and model names expand). */
  sw?: number;
  /** Hold an extra beat after this caption. */
  beat?: boolean;
};

export type Segment = {
  id: string;
  accent: AccentKey;
  /** The chapter name, carried by the standing ProductRule in both films. */
  chapter: string;
  /**
   * The one-line claim this chapter actually makes, striped under its name.
   * The chapter name alone does not differentiate anything — "THE GAIN" could
   * be any chapter of any film. The claim is what tells a viewer landing on a
   * random frame what is being argued.
   */
  spec?: string;
  captions: Caption[];
};

// ═════════════════════════════════════════════════════════════════════════════
// THE 90-SECOND VERTICAL REEL
//
// A reel is watched in a feed with a thumb hovering, so it opens inside a
// failure rather than on a product. "The take was right, the recording wasn't"
// is a thing that has happened to everyone who would buy one of these, and it
// is the only sentence in the film that needs no explaining.
// ═════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
// THE FIVE-MINUTE LANDSCAPE EXPLAINER
//
// Seven chapters. The first is a room, not a product. The second settles what
// does NOT change between the two interfaces, because every later comparison
// depends on the viewer already believing it. Then one chapter each for the
// two environments, one for the preamplifiers they share, one for what makes
// a monitor mix playable, and a close that hands the decision back.
// ═════════════════════════════════════════════════════════════════════════════

export const VIDEO_SEGMENTS: Segment[] = [
  {
    id: "bottleneck",
    accent: "choose",
    chapter: "THE BOTTLENECK",
    spec: "WHEN THE SESSION STOPS FOR A CABLE",
    captions: [
      { t: "Nobody runs out of ideas at two in the morning.", e: "ideas", sw: 10 },
      { t: "They run out of inputs.", e: "inputs", beat: true },
      { t: "The synth is patched. The drum machine is patched.", e: "patched" },
      { t: "The preamp you bought last year is patched.", e: "last year" },
      { t: "And the thing you want to record right now", e: "right now" },
      { t: "has nowhere to go.", e: "nowhere", beat: true },
      { t: "So you unplug something that was working,", e: "unplug" },
      { t: "and you lose ten minutes,", e: "ten minutes", sw: 5 },
      { t: "and you lose the thing you were about to play.", e: "about to play", beat: true },
      { t: "It happens tracking a kit, when the overheads", e: "a kit" },
      { t: "and the room mics and the kick all want a channel at once.", e: "at once", sw: 13 },
      { t: "It happens re-amping, when the send and the return", e: "re-amping" },
      { t: "both need somewhere to be.", e: "somewhere", beat: true },
      { t: "That is not a taste problem.", e: "taste" },
      { t: "It is a channel-count problem.", e: "channel-count", beat: true },
    ],
  },
  {
    id: "standard",
    accent: "standard",
    chapter: "ONE STANDARD",
    spec: "THE SAME CONVERTER IN BOTH BOXES",
    captions: [
      { t: "There are two interfaces in this film.", e: "two", sw: 7 },
      { t: "Before the differences, the part that is identical.", e: "identical", beat: true },
      { t: "The same ESS Sabre32 converter tier sits in both,", e: "Sabre32", sw: 10 },
      { t: "rated at one hundred and twenty-five decibels of dynamic range.", e: "dynamic range", sw: 11 },
      { t: "The same preamplifier design sits in both.", e: "preamplifier" },
      { t: "The same CueMix 5 mixer runs both.", e: "CueMix 5", sw: 7, beat: true },
      { t: "So nothing in the rest of this film", e: "nothing" },
      { t: "is a claim that one of them sounds better.", e: "sounds better", beat: true },
      { t: "The part that decides how a take sounds", e: "decides" },
      { t: "is the part they already share.", e: "already share", beat: true },
    ],
  },
  {
    id: "agile",
    accent: "agile",
    chapter: "THE AGILE HUB",
    spec: "ULTRALITE-MK5 · 40 CHANNELS, HALF A RACK",
    captions: [
      { t: "The UltraLite-mk5 is half a rack wide.", e: "half a rack", sw: 9 },
      { t: "It carries forty simultaneous channels.", e: "forty", beat: true },
      { t: "Eighteen inputs. Twenty-two outputs.", e: "Eighteen", sw: 5 },
      { t: "One bank of ADAT optical for when that is not enough.", e: "ADAT", sw: 12 },
      { t: "A white OLED meter you can read across a room.", e: "OLED", sw: 10 },
      { t: "Outputs that are DC-coupled,", e: "DC-coupled", sw: 6 },
      { t: "which is what a modular rig needs to take control voltage.", e: "control voltage", sw: 11, beat: true },
      { t: "It runs over USB 2.0 on a single USB-C cable,", e: "a single cable", sw: 12 },
      { t: "on a desk, in a backpack, on a stage,", e: "a backpack" },
      { t: "out of a case that has been thrown in a van.", e: "thrown", beat: true },
      { t: "The chassis is steel, not moulded plastic,", e: "steel" },
      { t: "which is the difference between a unit that tours", e: "tours" },
      { t: "and a unit you replace after a tour.", e: "replace", beat: true },
    ],
  },
  {
    id: "anchor",
    accent: "anchor",
    chapter: "THE STUDIO ANCHOR",
    spec: "828 · 60 CHANNELS OVER USB 3.2",
    captions: [
      { t: "The 828 has been the middle of rooms since two thousand and one,", e: "since", sw: 15 },
      { t: "when it was the first FireWire interface anybody could buy.", e: "the first", sw: 10, beat: true },
      { t: "This one is a rack unit tall.", e: "a rack unit", sw: 7 },
      { t: "It carries sixty simultaneous channels", e: "sixty" },
      { t: "over USB 3.2 at five gigabits a second.", e: "five gigabits", sw: 10, beat: true },
      { t: "Twenty-eight inputs. Thirty-two outputs.", e: "Twenty-eight", sw: 6 },
      { t: "Two banks of ADAT, not one.", e: "Two banks", sw: 7 },
      { t: "Send and return inserts on the microphone channels,", e: "inserts", sw: 9 },
      { t: "so your compressor sits in the path", e: "your compressor" },
      { t: "instead of sitting in a plug-in after the fact.", e: "after the fact", beat: true },
      { t: "Word clock on BNC, for a room with more than one converter in it.", e: "Word clock", sw: 15 },
      { t: "A talkback microphone in the front panel.", e: "talkback", sw: 8 },
      { t: "Two monitor pairs you can switch between,", e: "Two monitor pairs", sw: 8 },
      { t: "and two headphone mixes that are genuinely separate,", e: "genuinely separate", sw: 9 },
      { t: "so the player and the engineer stop negotiating.", e: "stop negotiating", beat: true },
    ],
  },
  {
    id: "gain",
    accent: "gain",
    chapter: "THE GAIN",
    spec: "SEVENTY-FOUR DECIBELS, ON BOTH",
    captions: [
      { t: "Both units give you seventy-four decibels of preamplifier gain.", e: "seventy-four", sw: 11 },
      { t: "Not one of them more than the other.", e: "Not one", beat: true },
      { t: "That number matters in one specific place:", e: "one specific place" },
      { t: "a ribbon microphone in front of something quiet.", e: "a ribbon" },
      { t: "A voice at a metre. A room at the far end of a room.", e: "a metre", sw: 14, beat: true },
      { t: "With seventy-four decibels you open it up", e: "open it up", sw: 8 },
      { t: "and the noise floor does not come up with it,", e: "noise floor" },
      { t: "so you are not deciding between a quiet take", e: "deciding" },
      { t: "and a usable one.", e: "usable", beat: true },
      { t: "It is also the gain you would otherwise go and buy", e: "otherwise" },
      { t: "as a separate box, and find a channel for,", e: "a separate box" },
      { t: "and a power socket for, and a place to put.", e: "a place to put", beat: true },
    ],
  },
  {
    id: "latency",
    accent: "latency",
    chapter: "PLAYABILITY",
    spec: "CUEMIX 5 · A TWO-MILLISECOND ROUND TRIP",
    captions: [
      { t: "A singer does not describe latency as milliseconds.", e: "milliseconds", sw: 9 },
      { t: "They describe it as not being able to sing.", e: "not being able", beat: true },
      { t: "CueMix 5 does the monitor mix in hardware,", e: "in hardware", sw: 9 },
      { t: "inside the interface, before the computer is involved.", e: "before" },
      { t: "A round trip of about two milliseconds.", e: "two milliseconds", sw: 8, beat: true },
      { t: "Which means the headphone mix does not move", e: "does not move" },
      { t: "when you raise the buffer to get through a heavy session,", e: "the buffer", sw: 12 },
      { t: "and the same routing sends a clean loopback to a stream", e: "loopback", sw: 11 },
      { t: "without a second machine in the room.", e: "a second machine", beat: true },
      { t: "The take stops being a negotiation with the computer", e: "a negotiation" },
      { t: "and goes back to being a performance.", e: "a performance", beat: true },
    ],
  },
  {
    id: "numbers",
    accent: "standard",
    chapter: "THE NUMBERS",
    spec: "EVERY FIGURE FROM THE DOCUMENTATION",
    captions: [
      { t: "All of that in one place.", e: "one place", beat: true },
      { t: "One hundred and twenty-five decibels of dynamic range,", e: "twenty-five", sw: 10 },
      { t: "from the converter tier both of them use.", e: "both", beat: true },
      { t: "Seventy-four decibels of preamplifier gain, on either box.", e: "Seventy-four", sw: 10 },
      { t: "A round trip of about two milliseconds through CueMix 5.", e: "two milliseconds", sw: 12, beat: true },
      { t: "Forty channels over USB 2.0 in half a rack.", e: "Forty channels", sw: 11 },
      { t: "Sixty channels over USB 3.2 in one rack unit.", e: "Sixty channels", sw: 12, beat: true },
      { t: "Two of those numbers are the same in both.", e: "the same" },
      { t: "The other two are the whole decision.", e: "the whole decision", beat: true },
    ],
  },
  {
    id: "choose",
    accent: "choose",
    chapter: "TWO ENVIRONMENTS",
    spec: "CHOOSE THE ROOM, NOT THE TIER",
    captions: [
      { t: "So the question was never which one is better.", e: "never", beat: true },
      { t: "It is where the thing is going to live.", e: "where" },
      { t: "On a desk that has to be clear by dinner,", e: "a desk" },
      { t: "in a bag that goes to the gig,", e: "a bag" },
      { t: "forty channels, half a rack, no mains lead.", e: "forty channels", sw: 9, beat: true },
      { t: "Or bolted into a rack that never moves,", e: "bolted" },
      { t: "with outboard in the inserts, clock out to the room,", e: "clock out", sw: 10 },
      { t: "sixty channels and a talkback key.", e: "sixty channels", sw: 7, beat: true },
      { t: "Same converter. Same preamps. Same mixer.", e: "Same converter", sw: 6 },
      { t: "Two rooms.", e: "Two rooms", beat: true },
    ],
  },
];

export const spokenWords = (c: Caption): number =>
  c.sw ?? c.t.trim().split(/\s+/).filter(Boolean).length;

export type TimedCaption = Caption & { start: number; end: number; i: number };

export type TimedSegment = Omit<Segment, "captions"> & {
  start: number;
  end: number;
  words: number;
  captions: TimedCaption[];
};

export const buildTimeline = (
  segments: Segment[],
): { segments: TimedSegment[]; total: number; words: number } => {
  let t = 0;
  let words = 0;
  const out = segments.map((seg) => {
    const start = t;
    let segWords = 0;
    const captions = seg.captions.map((c, i) => {
      const w = spokenWords(c);
      segWords += w;
      const dur = (w / WPM) * 60 + (c.beat ? BEAT : 0);
      const cap: TimedCaption = { ...c, i, start: t, end: t + dur };
      t += dur;
      return cap;
    });
    words += segWords;
    const end = t;
    t += SEGMENT_GAP;
    return { ...seg, start, end, words: segWords, captions };
  });
  return { segments: out, total: t - SEGMENT_GAP, words };
};
