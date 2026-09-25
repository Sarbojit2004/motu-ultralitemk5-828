import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { ACCENT, FONT, INK, MODELS, SPEC, formatFor, type AccentKey } from "../theme.ts";

// ─────────────────────────────────────────────────────────────────────────────
// THE DEMONSTRATIVES
//
// The AVB series and the UltraLite-mk5 / 828 films carried an animated layer
// over the picture that SHOWED the specification instead of only saying it —
// a dynamic-range arc, an I/O matrix, a gain swell, a signal path. Dropping it
// here left two films that were photographs with words on them, which is
// exactly what came back as the note.
//
// Every one of these is built the same way and to the same rules:
//
//   * driven by `p`, 0..1 through the shot, so it animates with the camera
//     rather than on a clock of its own
//   * drawn as SVG and plain boxes — NO filter: blur() and NO drop-shadow().
//     Both are full-surface convolutions and at 3840x2160 they cost more per
//     frame than everything else in the composition put together
//   * sized from the frame, so one component serves both formats
//   * stating only numbers that are in theme.ts SPEC, which were checked
//     against documentation before they were allowed into a caption
// ─────────────────────────────────────────────────────────────────────────────

type G = { accent: AccentKey; p: number };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** Staggered sub-progress: starts at `from`, finishes at `to`. */
const step = (p: number, from: number, to: number) => clamp01((p - from) / Math.max(0.0001, to - from));

/** The panel every demonstrative sits on — a tint, never a blur. */
const Panel: React.FC<{ children: React.ReactNode; w: number; S: number; glow: string; appear: number }> = ({
  children, w, S, glow, appear,
}) => (
  <div
    style={{
      width: w,
      padding: `${26 * S}px ${30 * S}px`,
      borderRadius: 18 * S,
      background: "linear-gradient(160deg, rgba(12,14,19,0.94), rgba(7,8,11,0.88))",
      border: `${Math.max(1, 2 * S)}px solid ${glow}66`,
      opacity: appear,
      transform: `translateY(${(1 - appear) * 26 * S}px)`,
      fontFamily: FONT.display,
    }}
  >
    {children}
  </div>
);

const Head: React.FC<{ t: string; S: number; glow: string }> = ({ t, S, glow }) => (
  <div style={{ fontSize: 26 * S, letterSpacing: 5 * S, color: glow, textTransform: "uppercase", marginBottom: 16 * S }}>
    {t}
  </div>
);

const useG = () => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const P = fmt.portrait;
  return { fmt, P, S: W / (P ? 2160 : 3840), W, H };
};

// ── 1. dynamic range ─────────────────────────────────────────────────────────
// The 120 dB the whole argument rests on, drawn as the distance between the
// quietest thing the converter can hear and the loudest it can hold.
export const DynamicRangeArc: React.FC<G> = ({ accent, p }) => {
  const { fmt, S } = useG();
  const acc = ACCENT[accent];
  const e = ease(step(p, 0.05, 0.75));
  const w = fmt.safe.w * (fmt.portrait ? 0.86 : 0.40);
  const bars = 26;

  return (
    <Panel w={w} S={S} glow={acc.glow} appear={step(p, 0, 0.12)}>
      <Head t="Dynamic range" S={S} glow={acc.glow} />
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5 * S, height: 132 * S }}>
        {Array.from({ length: bars }, (_, i) => {
          const at = i / (bars - 1);
          const on = e > at;
          const hgt = 0.16 + Math.pow(at, 1.5) * 0.84;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${hgt * 100}%`,
                borderRadius: 2 * S,
                background: on
                  ? `linear-gradient(180deg, ${acc.glow}, ${acc.key})`
                  : "rgba(255,255,255,0.10)",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 * S }}>
        <span style={{ fontSize: 22 * S, letterSpacing: 3 * S, color: INK.onDarkDim }}>NOISE FLOOR</span>
        <span style={{ fontSize: 22 * S, letterSpacing: 3 * S, color: INK.onDarkDim }}>FULL SCALE</span>
      </div>
      <div style={{ marginTop: 18 * S, display: "flex", alignItems: "baseline", gap: 12 * S }}>
        <span style={{ fontSize: 86 * S, color: INK.onDark, letterSpacing: -1 }}>
          {Math.round(e * SPEC.dynamicRange)}
        </span>
        <span style={{ fontSize: 34 * S, letterSpacing: 3 * S, color: acc.glow }}>dB</span>
        <span style={{ marginLeft: "auto", fontSize: 24 * S, letterSpacing: 3 * S, color: INK.onDarkSoft }}>
          {SPEC.dac}
        </span>
      </div>
    </Panel>
  );
};

// ── 2. the I/O matrix ────────────────────────────────────────────────────────
// Three models, three counts, filling in order — the one thing that differs.
export const IOMatrix: React.FC<G & { highlight?: number }> = ({ accent, p, highlight }) => {
  const { fmt, S } = useG();
  const acc = ACCENT[accent];
  const w = fmt.safe.w * (fmt.portrait ? 0.86 : 0.42);

  return (
    <Panel w={w} S={S} glow={acc.glow} appear={step(p, 0, 0.12)}>
      <Head t="Inputs / outputs" S={S} glow={acc.glow} />
      {MODELS.map((m, mi) => {
        const e = ease(step(p, 0.10 + mi * 0.14, 0.52 + mi * 0.14));
        const lit = highlight === undefined || highlight === m.inputs;
        return (
          <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 16 * S, marginBottom: 18 * S, opacity: lit ? 1 : 0.38 }}>
            <span style={{ width: 74 * S, fontSize: 36 * S, letterSpacing: 2 * S, color: lit ? INK.onDark : INK.onDarkDim }}>
              {m.short}
            </span>
            <div style={{ display: "flex", gap: 6 * S, flex: 1 }}>
              {Array.from({ length: 6 }, (_, i) => {
                const on = i < m.inputs && e > (i + 1) / 6 - 0.16;
                const isMic = i < m.mic;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 30 * S,
                      borderRadius: 5 * S,
                      background: on ? (isMic ? acc.glow : `${acc.glow}66`) : "rgba(255,255,255,0.08)",
                      border: i < m.inputs ? "none" : `${Math.max(1, 1.5 * S)}px dashed rgba(255,255,255,0.12)`,
                    }}
                  />
                );
              })}
            </div>
            <span style={{ width: 132 * S, textAlign: "right", fontSize: 24 * S, letterSpacing: 2 * S, color: INK.onDarkSoft }}>
              {m.inputs} IN · {m.outputs} OUT
            </span>
          </div>
        );
      })}
      <div style={{ marginTop: 6 * S, fontSize: 22 * S, letterSpacing: 3 * S, color: INK.onDarkDim }}>
        SOLID = MIC PREAMP · TINTED = LINE
      </div>
    </Panel>
  );
};

// ── 3. the gain on tap ───────────────────────────────────────────────────────
//
// This was an equivalent-input-noise demonstrative in the M-Series films, where
// a measured EIN figure existed. No EIN figure for the UltraLite-mk5 or the 828
// appears in the research brief in this repository, and a number nobody has
// verified is not going on screen — so it draws the figure that IS verified,
// and that both units share: seventy-four decibels of preamplifier gain.
export const NoiseFloor: React.FC<G> = ({ accent, p }) => {
  const { fmt, S } = useG();
  const acc = ACCENT[accent];
  const e = ease(step(p, 0.08, 0.7));
  const w = fmt.safe.w * (fmt.portrait ? 0.80 : 0.36);
  const v = interpolate(e, [0, 1], [0, SPEC.gain]);

  return (
    <Panel w={w} S={S} glow={acc.glow} appear={step(p, 0, 0.12)}>
      <Head t="Preamplifier gain, on both" S={S} glow={acc.glow} />
      <div style={{ position: "relative", height: 116 * S, borderRadius: 8 * S, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            height: `${interpolate(e, [0, 1], [7, 88])}%`,
            background: `linear-gradient(180deg, ${acc.glow}CC, ${acc.key}AA)`,
          }}
        />
        <div
          style={{
            position: "absolute", left: 0, right: 0,
            bottom: `${interpolate(e, [0, 1], [72, 7])}%`,
            height: Math.max(2, 3 * S), background: INK.onDark,
          }}
        />
      </div>
      <div style={{ marginTop: 18 * S, display: "flex", alignItems: "baseline", gap: 10 * S }}>
        <span style={{ fontSize: 74 * S, color: INK.onDark, letterSpacing: -1 }}>{v.toFixed(0)}</span>
        <span style={{ fontSize: 30 * S, letterSpacing: 3 * S, color: acc.glow }}>dB</span>
        <span style={{ marginLeft: "auto", fontSize: 23 * S, letterSpacing: 3 * S, color: INK.onDarkSoft }}>
          ALL THREE MODELS
        </span>
      </div>
    </Panel>
  );
};

// ── 4. the round trip ────────────────────────────────────────────────────────
// A dot going in, through the computer, and back out, with the figure counting
// up as it travels. The point of the shot is that the journey is short.
export const RoundTrip: React.FC<G> = ({ accent, p }) => {
  const { fmt, S } = useG();
  const acc = ACCENT[accent];
  const e = ease(step(p, 0.10, 0.80));
  const w = fmt.safe.w * (fmt.portrait ? 0.86 : 0.42);
  const nodes = ["IN", "CONVERTER", "COMPUTER", "CONVERTER", "OUT"];
  const travel = e * (nodes.length - 1);

  return (
    <Panel w={w} S={S} glow={acc.glow} appear={step(p, 0, 0.12)}>
      <Head t="Round trip" S={S} glow={acc.glow} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", height: 92 * S }}>
        <div style={{ position: "absolute", left: "8%", right: "8%", height: Math.max(2, 3 * S), background: "rgba(255,255,255,0.14)" }} />
        <div style={{ position: "absolute", left: "8%", width: `${e * 84}%`, height: Math.max(2, 3 * S), background: acc.glow }} />
        {nodes.map((n, i) => {
          const reached = travel >= i - 0.15;
          return (
            <div key={i} style={{ position: "relative", textAlign: "center", flex: 1 }}>
              <div
                style={{
                  width: (i === 2 ? 30 : 22) * S, height: (i === 2 ? 30 : 22) * S,
                  margin: "0 auto", borderRadius: 99,
                  background: reached ? acc.glow : "rgba(255,255,255,0.18)",
                }}
              />
              <div style={{ marginTop: 14 * S, fontSize: 19 * S, letterSpacing: 2 * S, color: reached ? INK.onDarkSoft : INK.onDarkDim }}>
                {n}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16 * S, display: "flex", alignItems: "baseline", gap: 10 * S }}>
        <span style={{ fontSize: 76 * S, color: INK.onDark, letterSpacing: -1 }}>{(e * SPEC.roundTrip).toFixed(1)}</span>
        <span style={{ fontSize: 30 * S, letterSpacing: 3 * S, color: acc.glow }}>ms</span>
        <span style={{ marginLeft: "auto", fontSize: 22 * S, letterSpacing: 2 * S, color: INK.onDarkSoft }}>
          24-BIT / 96 kHz · 32 SAMPLES
        </span>
      </div>
    </Panel>
  );
};

// ── 5. the monitoring path ───────────────────────────────────────────────────
// The MON button: the input goes straight to the outputs and the computer is
// not in the way. Drawn as the computer leg dimming while the direct leg lights.
export const MonitorPath: React.FC<G> = ({ accent, p }) => {
  const { fmt, S } = useG();
  const acc = ACCENT[accent];
  const e = ease(step(p, 0.12, 0.72));
  const w = fmt.safe.w * (fmt.portrait ? 0.86 : 0.40);
  const box = (label: string, on: boolean) => (
    <div
      style={{
        padding: `${12 * S}px ${18 * S}px`, borderRadius: 9 * S,
        border: `${Math.max(1, 2 * S)}px solid ${on ? acc.glow : "rgba(255,255,255,0.18)"}`,
        color: on ? INK.onDark : INK.onDarkDim, fontSize: 24 * S, letterSpacing: 2 * S,
        background: on ? `${acc.glow}1E` : "transparent",
      }}
    >
      {label}
    </div>
  );

  return (
    <Panel w={w} S={S} glow={acc.glow} appear={step(p, 0, 0.12)}>
      <Head t="Hardware monitoring" S={S} glow={acc.glow} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 * S }}>
        {box("INPUT", true)}
        <div style={{ flex: 1, position: "relative", height: 70 * S }}>
          {/* the long way round, dimming */}
          <div style={{ position: "absolute", top: 6 * S, left: 0, right: 0, height: Math.max(2, 2.5 * S), background: `rgba(255,255,255,${0.22 - e * 0.16})` }} />
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", fontSize: 17 * S, letterSpacing: 2 * S, color: `rgba(255,255,255,${0.42 - e * 0.28})`, marginTop: -18 * S }}>
            VIA COMPUTER
          </div>
          {/* straight through, lighting */}
          <div style={{ position: "absolute", bottom: 10 * S, left: 0, width: `${e * 100}%`, height: Math.max(3, 4 * S), background: acc.glow }} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", fontSize: 19 * S, letterSpacing: 2 * S, color: acc.glow, marginBottom: -22 * S, opacity: e }}>
            DIRECT
          </div>
        </div>
        {box("OUTPUT", e > 0.9)}
      </div>
      <div style={{ marginTop: 34 * S, fontSize: 23 * S, letterSpacing: 3 * S, color: INK.onDarkSoft }}>
        ONE BUTTON · NO DELAY TO HEAR YOURSELF
      </div>
    </Panel>
  );
};

// ── 6. the range ladder ──────────────────────────────────────────────────────
// The films' whole argument in one graphic: the engine row is identical and
// only the count row grows.
export const RangeLadder: React.FC<G> = ({ accent, p }) => {
  const { fmt, S } = useG();
  const acc = ACCENT[accent];
  const w = fmt.safe.w * (fmt.portrait ? 0.90 : 0.46);
  const shared = [`${SPEC.dac}`, `${SPEC.dynamicRange} dB`, `+${SPEC.gain} dB`, `${SPEC.roundTrip} ms`];

  return (
    <Panel w={w} S={S} glow={acc.glow} appear={step(p, 0, 0.12)}>
      <Head t="Same engine · three sizes" S={S} glow={acc.glow} />
      <div style={{ display: "flex", gap: 10 * S, marginBottom: 20 * S }}>
        {shared.map((t, i) => (
          <div
            key={t}
            style={{
              flex: 1, textAlign: "center", padding: `${12 * S}px 0`, borderRadius: 8 * S,
              background: `${acc.glow}1A`, border: `${Math.max(1, 1.5 * S)}px solid ${acc.glow}44`,
              fontSize: 22 * S, letterSpacing: 1.5 * S, color: INK.onDark,
              opacity: step(p, 0.08 + i * 0.06, 0.30 + i * 0.06),
            }}
          >
            {t}
          </div>
        ))}
      </div>
      {MODELS.map((m, mi) => {
        const e = ease(step(p, 0.34 + mi * 0.13, 0.72 + mi * 0.13));
        return (
          <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 14 * S, marginBottom: 14 * S }}>
            <span style={{ width: 70 * S, fontSize: 34 * S, color: INK.onDark }}>{m.short}</span>
            <div style={{ flex: 1, height: 26 * S, borderRadius: 6 * S, background: "rgba(255,255,255,0.07)" }}>
              <div style={{ width: `${(m.inputs / 6) * 100 * e}%`, height: "100%", borderRadius: 6 * S, background: acc.glow }} />
            </div>
            <span style={{ width: 118 * S, textAlign: "right", fontSize: 23 * S, letterSpacing: 2 * S, color: INK.onDarkSoft }}>
              {m.mic} PREAMP{m.mic > 1 ? "S" : ""}
            </span>
          </div>
        );
      })}
    </Panel>
  );
};

export type GraphicKind =
  | "dynamicRange" | "ioMatrix" | "noiseFloor" | "roundTrip" | "monitorPath" | "rangeLadder";

export const Graphic: React.FC<G & { kind: GraphicKind }> = ({ kind, ...g }) => {
  switch (kind) {
    case "dynamicRange": return <DynamicRangeArc {...g} />;
    case "ioMatrix":     return <IOMatrix {...g} />;
    case "noiseFloor":   return <NoiseFloor {...g} />;
    case "roundTrip":    return <RoundTrip {...g} />;
    case "monitorPath":  return <MonitorPath {...g} />;
    case "rangeLadder":  return <RangeLadder {...g} />;
  }
};
