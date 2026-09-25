import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ACCENT, FONT, INK, formatFor, type AccentKey } from "../theme.ts";

// ─────────────────────────────────────────────────────────────────────────────
// THE CHROME — the standing layer that tells a viewer where they are.
//
// Carried over from the AVB series and the UltraLite-mk5 / 828 films, where it
// did real work and its absence here was immediately visible:
//
//   ProductRule    a persistent name plate, not a one-off title card. It holds
//                  for the whole chapter and carries THREE things: the chapter
//                  name, a spec stripe saying what this part of the argument
//                  actually claims, and a hairline that fills across the
//                  chapter so the viewer can feel its length.
//
//   FilmTimeline   the whole film as one track with a tick per chapter, so a
//                  viewer who joins late knows how much is left. On a
//                  five-minute piece this is the difference between watching
//                  and waiting.
//
// Both are part of the typographic layer and inherit TYPE_OPACITY from it —
// they are never brighter than the words they sit above.
// ─────────────────────────────────────────────────────────────────────────────

export const ProductRule: React.FC<{
  /** Carried here rather than on a full-frame parent — see Film.tsx. */
  opacity: number;
  accent: AccentKey;
  name: string;
  /** The one-line claim this chapter is actually making. */
  spec?: string;
  /** 0..1 through the chapter. */
  progress: number;
  /** Frames since the chapter began, for the entrance. */
  f: number;
}> = ({ opacity, accent, name, spec, progress, f }) => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const P = fmt.portrait;
  const S = W / (P ? 2160 : 3840);

  const intro = Math.min(1, Math.max(0, f / 16));
  const slide = interpolate(intro, [0, 1], [-70 * S, 0]);
  const shadow = `0 ${3 * S}px 0 rgba(0,0,0,0.62)`;

  return (
    <div
      style={{
        position: "absolute",
        left: fmt.safe.left,
        top: P ? fmt.safe.top * 0.52 : fmt.safe.top * 0.46,
        width: fmt.safe.w,
        opacity: intro * opacity,
        transform: `translateX(${slide}px)`,
        fontFamily: FONT.display,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 * S }}>
        {/* the accent tab — the hue that owns this whole chapter */}
        <div
          style={{
            width: 11 * S,
            height: (P ? 76 : 58) * S,
            borderRadius: 5 * S,
            background: acc.glow,
            transform: `scaleY(${interpolate(intro, [0, 1], [0.2, 1])})`,
          }}
        />
        <div>
          <div
            style={{
              fontSize: fmt.type.chapter.size,
              letterSpacing: fmt.type.chapter.track,
              color: INK.onDark,
              textTransform: "uppercase",
              textShadow: shadow,
            }}
          >
            {name}
          </div>
          {spec ? (
            <div
              style={{
                marginTop: 7 * S,
                fontSize: fmt.type.micro.size,
                letterSpacing: fmt.type.micro.track,
                color: acc.glow,
                textTransform: "uppercase",
                textShadow: shadow,
                opacity: Math.min(1, Math.max(0, (f - 8) / 14)),
              }}
            >
              {spec}
            </div>
          ) : null}
        </div>
      </div>

      {/* the chapter's own progress hairline */}
      <div
        style={{
          position: "relative",
          marginTop: 20 * S,
          height: 4 * S,
          width: (P ? 0.68 : 0.42) * fmt.safe.w,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 2 * S,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
            background: acc.glow,
            borderRadius: 2 * S,
          }}
        />
      </div>
    </div>
  );
};

/** The whole film as one track, with a tick where each chapter begins. */
export const FilmTimeline: React.FC<{
  /** Carried here rather than on a full-frame parent — see Film.tsx. */
  opacity: number;
  accent: AccentKey;
  /** 0..1 through the speech. */
  progress: number;
  /** Chapter start points as fractions of the speech, for the ticks. */
  marks: number[];
}> = ({ opacity, accent, progress, marks }) => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const P = fmt.portrait;
  const S = W / (P ? 2160 : 3840);
  const h = Math.max(3, 4 * S);

  return (
    <div
      style={{
        position: "absolute",
        left: fmt.safe.left,
        right: fmt.safe.right,
        bottom: fmt.safe.bottom * 0.42,
        height: h,
        opacity,
        background: "rgba(255,255,255,0.13)",
        borderRadius: h / 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: h,
          width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
          background: acc.glow,
          borderRadius: h / 2,
        }}
      />
      {marks.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${m * 100}%`,
            top: -h,
            width: Math.max(2, 2.5 * S),
            height: h * 3,
            background: m <= progress ? acc.glow : "rgba(255,255,255,0.3)",
          }}
        />
      ))}
      {/* the playhead */}
      <div
        style={{
          position: "absolute",
          left: `${Math.max(0, Math.min(1, progress)) * 100}%`,
          top: -h * 1.6,
          width: h * 2.2,
          height: h * 4.2,
          marginLeft: -h * 1.1,
          borderRadius: h,
          background: acc.glow,
        }}
      />
    </div>
  );
};
