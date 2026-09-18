import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { ACCENT, FONT, INK, type ProductKey } from "../theme.ts";

// ─────────────────────────────────────────────────────────────────────────────
// DEMONSTRATIVES — the graphics that EXPLAIN rather than decorate.
//
// Three of the four products are the same 1U chassis. So every graphic here
// does one job — make the DIFFERENCE visible: the channel ladder (16 line, 4+8,
// 10 mic), the meters for the numbers a viewer cannot picture, a latency trace,
// and a network graph for the section whose subject is a cable, not a box.
//
// Everything is transforms, gradients and solid fills. No blur, no drop-shadow
// filter — see Transitions.tsx for why that matters at 4K.
//
// Every size below is at reel scale; the caller passes `s` (Canvas.scale).
// ─────────────────────────────────────────────────────────────────────────────

const HARD = (px: number) => `0 ${px}px ${px * 2.2}px rgba(0,0,0,0.92), 0 0 ${px}px rgba(0,0,0,0.78)`;
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

// ── Progress ─────────────────────────────────────────────────────────────────
export const ProgressRule: React.FC<{ p: number; product: ProductKey }> = ({ p, product }) => {
  const accent = ACCENT[product];
  return (
    <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.20)", borderRadius: 3 }}>
      <div style={{ position: "absolute", inset: 0, width: `${Math.min(1, Math.max(0, p)) * 100}%`, background: accent.glow, borderRadius: 3, boxShadow: `0 0 24px ${accent.glow}` }} />
    </div>
  );
};

// ── Product tag ──────────────────────────────────────────────────────────────
/** The persistent identifier of which of four boxes is on screen. Not branding. */
export const ProductTag: React.FC<{ product: ProductKey; intro: number; s?: number }> = ({ product, intro, s = 1 }) => {
  const accent = ACCENT[product];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 22 * s, opacity: intro, transform: `translateX(${interpolate(intro, [0, 1], [-34, 0])}px)` }}>
      <div style={{ width: 12 * s, height: 62 * s, background: accent.glow, boxShadow: `0 0 26px ${accent.glow}` }} />
      <div style={{ fontFamily: FONT.display, fontSize: 66 * s, letterSpacing: 7 * s, color: accent.glow, textShadow: HARD(4 * s), whiteSpace: "nowrap" }}>
        {accent.short}
      </div>
      <div style={{ fontFamily: FONT.display, fontSize: 30 * s, letterSpacing: 4 * s, color: INK.onDarkSoft, textShadow: HARD(3 * s), marginLeft: 10 * s, whiteSpace: "nowrap" }}>
        {accent.tag}
      </div>
    </div>
  );
};

// ── Chapter title (film holds) ───────────────────────────────────────────────
export const ChapterTitle: React.FC<{ product: ProductKey; title: string; sub: string; f: number; s?: number }> = ({ product, title, sub, f, s = 1 }) => {
  const { fps } = useVideoConfig();
  const accent = ACCENT[product];
  const a = spring({ frame: f, fps, config: { damping: 200, mass: 0.6 }, durationInFrames: 18 });
  const b = spring({ frame: f - 8, fps, config: { damping: 200, mass: 0.6 }, durationInFrames: 18 });
  const rule = spring({ frame: f - 4, fps, config: { damping: 200, mass: 0.7 }, durationInFrames: 24 });
  return (
    <div style={{ fontFamily: FONT.display }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26 * s, opacity: a, transform: `translateY(${interpolate(a, [0, 1], [24, 0])}px)` }}>
        <div style={{ width: interpolate(rule, [0, 1], [0, 140 * s]), height: 8 * s, background: accent.glow, boxShadow: `0 0 26px ${accent.glow}` }} />
        <div style={{ fontSize: 46 * s, letterSpacing: 9 * s, color: accent.glow, textShadow: HARD(3 * s), whiteSpace: "nowrap" }}>{sub}</div>
      </div>
      <div style={{ fontSize: 150 * s, letterSpacing: 2 * s, lineHeight: 1.02, color: INK.onDark, textShadow: HARD(5 * s), marginTop: 22 * s, opacity: b, transform: `translateY(${interpolate(b, [0, 1], [34, 0])}px)`, whiteSpace: "nowrap" }}>
        {title}
      </div>
    </div>
  );
};

// ── The I/O ladder ───────────────────────────────────────────────────────────
export type IoSpec = { mic: number; in: number; out: number; phones: number; label: string };

/**
 * Counts read off this repository's own material, never from memory: the combo
 * inputs off the front elevations (`ul-front-elev`, `e8-front-elev`), the
 * channel totals off the I/O row of the comparison table in src/lib/copy.ts.
 *
 * Both units carry the SAME 2 combo preamplifiers, and that is the whole point
 * this graphic exists to make visible — `mic` is 2 in both rows, so the only
 * thing that changes between the two products is how far the bars run.
 */
export const IO: Record<"pul" | "p828", IoSpec> = {
  pul: { mic: 2, in: 18, out: 22, phones: 1, label: "18 IN · 22 OUT" },
  p828: { mic: 2, in: 28, out: 32, phones: 2, label: "28 IN · 32 OUT" },
};
/** The widest row in the set — the 828's 32 outputs — sets the scale for both,
 *  so the UltraLite-mk5's rows read as shorter rather than as differently drawn. */
const SLOTS = 32;

const Slot: React.FC<{ lit: number; accent: string; width: number; height: number; filled: boolean; kind: "mic" | "line" | "none"; s: number }> = ({ lit, accent, width, height, filled, kind, s }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 7 * s,
      border: `${2.5 * s}px solid ${filled ? accent : "rgba(255,255,255,0.45)"}`,
      background: filled
        ? kind === "mic"
          ? `linear-gradient(180deg, ${accent}F0 0%, ${accent}99 100%)`
          : `linear-gradient(180deg, ${accent}A6 0%, ${accent}55 100%)`
        : "rgba(255,255,255,0.10)",
      boxShadow: filled ? `0 0 ${18 * lit}px ${accent}` : "none",
      opacity: lit,
      transform: `translateY(${interpolate(lit, [0, 1], [16, 0])}px) scale(${interpolate(lit, [0, 1], [0.82, 1])})`,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      paddingBottom: 5 * s,
    }}
  >
    {filled && kind === "mic" ? <div style={{ width: 8 * s, height: 8 * s, borderRadius: 4 * s, background: "#06070A" }} /> : null}
  </div>
);

const Row: React.FC<{
  tag: string; count: number; mic: number; accent: string; f: number; width: number; s: number; delay: number;
}> = ({ tag, count, mic, accent, f, width, s, delay }) => {
  const { fps } = useVideoConfig();
  const gap = 5 * s;
  const tagW = 92 * s;
  const slotW = (width - tagW - gap * SLOTS) / SLOTS;
  const litFor = (i: number) => spring({ frame: f - delay - i * 1.1, fps, config: { damping: 200, mass: 0.35 }, durationInFrames: 9 });
  const tagIn = spring({ frame: f - delay, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 12 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      <div style={{ width: tagW, fontSize: 34 * s, letterSpacing: 4 * s, color: INK.onDarkSoft, textShadow: HARD(3 * s), opacity: tagIn }}>{tag}</div>
      {Array.from({ length: SLOTS }).map((_, i) => {
        const filled = i < count;
        const kind = i < mic ? "mic" : filled ? "line" : "none";
        return <Slot key={i} lit={filled ? litFor(i) : tagIn * 0.45} accent={accent} width={slotW} height={54 * s} filled={filled} kind={kind} s={s} />;
      })}
    </div>
  );
};

/**
 * Two rows of 32 slots — inputs above, outputs below — filled to the product's
 * real channel counts, with the 2 combo preamplifiers drawn solid with an XLR
 * dot at the head of the input row. Read side by side across the two acts it
 * says the thing the narration says: the heads are identical, the tails are not.
 */
export const IoLadder: React.FC<{ product: "pul" | "p828"; f: number; width: number; s?: number }> = ({ product, f, width, s = 1 }) => {
  const { fps } = useVideoConfig();
  const accent = ACCENT[product];
  const spec = IO[product];
  const head = spring({ frame: f, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 14 });
  const foot = spring({ frame: f - 44, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 16 });
  const sweep = spring({ frame: f - 10, fps, config: { damping: 200, mass: 0.4 }, durationInFrames: 30 });
  const shownIn = Math.round(spec.in * sweep);

  return (
    <div style={{ width, fontFamily: FONT.display }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", opacity: head, transform: `translateY(${interpolate(head, [0, 1], [18, 0])}px)`, marginBottom: 14 * s }}>
        <div style={{ fontSize: 36 * s, letterSpacing: 5 * s, color: INK.onDark, textShadow: HARD(3 * s) }}>SIMULTANEOUS CHANNELS</div>
        <div style={{ fontSize: 92 * s, lineHeight: 0.9, color: accent.glow, letterSpacing: -1, textShadow: HARD(4 * s), fontVariantNumeric: "tabular-nums" }}>
          {shownIn}
          <span style={{ fontSize: 44 * s, letterSpacing: 3 * s, color: INK.onDarkSoft }}> × {spec.out}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 * s }}>
        <Row tag="IN" count={spec.in} mic={spec.mic} accent={accent.glow} f={f} width={width} s={s} delay={10} />
        <Row tag="OUT" count={spec.out} mic={0} accent={accent.glow} f={f} width={width} s={s} delay={26} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 * s, marginTop: 18 * s, opacity: foot, transform: `translateX(${interpolate(foot, [0, 1], [-24, 0])}px)`, flexWrap: "wrap" }}>
        <div style={{ fontSize: 32 * s, letterSpacing: 4.4 * s, color: accent.glow, textShadow: HARD(3 * s) }}>{spec.mic} COMBO PREAMP{spec.mic > 1 ? "S" : ""}</div>
        <div style={{ width: 8 * s, height: 8 * s, borderRadius: 4 * s, background: "rgba(255,255,255,0.4)" }} />
        <div style={{ fontSize: 32 * s, letterSpacing: 4.4 * s, color: INK.onDarkSoft, textShadow: HARD(3 * s) }}>{spec.label}</div>
        <div style={{ width: 8 * s, height: 8 * s, borderRadius: 4 * s, background: "rgba(255,255,255,0.4)" }} />
        <div style={{ fontSize: 32 * s, letterSpacing: 4.4 * s, color: INK.onDarkSoft, textShadow: HARD(3 * s) }}>{spec.phones} HEADPHONE{spec.phones > 1 ? "S" : ""}</div>
      </div>
    </div>
  );
};

// ── Spec chips ───────────────────────────────────────────────────────────────
export const SpecChips: React.FC<{ items: string[]; product: ProductKey; f: number; width: number; s?: number; delay?: number }> = ({ items, product, f, width, s = 1, delay = 46 }) => {
  const { fps } = useVideoConfig();
  const accent = ACCENT[product];
  return (
    <div style={{ width, display: "flex", flexWrap: "wrap", gap: 14 * s, fontFamily: FONT.display }}>
      {items.map((it, i) => {
        const p = spring({ frame: f - delay - i * 8, fps, config: { damping: 200, mass: 0.45 }, durationInFrames: 14 });
        return (
          <div
            key={it}
            style={{
              fontSize: 36 * s,
              letterSpacing: 3 * s,
              color: INK.onDark,
              padding: `${12 * s}px ${24 * s}px`,
              border: `${3 * s}px solid ${accent.glow}99`,
              borderRadius: 999,
              background: "rgba(8,8,10,0.34)",
              textShadow: HARD(3 * s),
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {it}
          </div>
        );
      })}
    </div>
  );
};

// ── Scale meter ──────────────────────────────────────────────────────────────
export const ScaleMeter: React.FC<{
  title: string; value: number; min: number; max: number; unit: string; product: ProductKey; f: number; width: number; fillFrom?: "min" | "value"; s?: number;
}> = ({ title, value, min, max, unit, product, f, width, fillFrom = "min", s = 1 }) => {
  const { fps } = useVideoConfig();
  const accent = ACCENT[product];
  const head = spring({ frame: f, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 12 });
  const sweep = ease(Math.min(1, Math.max(0, (f - 6) / 26)));
  const shown = min + (value - min) * sweep;
  const pct = ((shown - min) / (max - min)) * 100;
  const dec = Math.abs(value) < 10 ? 1 : 0;
  return (
    <div style={{ width, fontFamily: FONT.display, opacity: head }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 * s }}>
        <div style={{ fontSize: 36 * s, letterSpacing: 5 * s, color: INK.onDark, textShadow: HARD(3 * s) }}>{title}</div>
        <div style={{ fontSize: 96 * s, lineHeight: 0.9, color: accent.glow, textShadow: HARD(4 * s), fontVariantNumeric: "tabular-nums" }}>
          {shown.toFixed(dec)}
          <span style={{ fontSize: 44 * s, letterSpacing: 3 * s, marginLeft: 14 * s, color: INK.onDarkSoft }}>{unit}</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 66 * s, borderRadius: 12 * s, background: "rgba(255,255,255,0.13)", border: `${3 * s}px solid rgba(255,255,255,0.42)`, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", top: 0, bottom: 0,
            left: fillFrom === "min" ? 0 : `${pct}%`,
            width: fillFrom === "min" ? `${pct}%` : `${100 - pct}%`,
            background: `linear-gradient(90deg, ${accent.key} 0%, ${accent.glow} 100%)`,
            boxShadow: `0 0 30px ${accent.glow}`,
          }}
        />
        {fillFrom === "value" ? <div style={{ position: "absolute", left: `${pct}%`, top: -6, bottom: -6, width: 7 * s, marginLeft: -3 * s, background: "#FFF6E9", boxShadow: "0 0 26px rgba(255,246,233,0.9)" }} /> : null}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${(i / 14) * 100}%`, top: 0, bottom: 0, width: 2, background: "rgba(0,0,0,0.35)" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 * s }}>
        <div style={{ fontSize: 28 * s, letterSpacing: 3 * s, color: INK.onDarkDim, textShadow: HARD(2) }}>{min}</div>
        <div style={{ fontSize: 28 * s, letterSpacing: 3 * s, color: INK.onDarkDim, textShadow: HARD(2) }}>{max}</div>
      </div>
    </div>
  );
};

// ── Latency trace ────────────────────────────────────────────────────────────
export const LatencyTrace: React.FC<{ product: ProductKey; f: number; width: number; s?: number; value?: string }> = ({ product, f, width, s = 1, value = "<2" }) => {
  const { fps } = useVideoConfig();
  const accent = ACCENT[product];
  const head = spring({ frame: f, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 12 });
  const t = (f % 36) / 36;
  const x = ease(t);
  const Node: React.FC<{ label: string; at: number }> = ({ label, at }) => (
    <div style={{ position: "absolute", left: `${at}%`, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
      <div style={{ width: 26 * s, height: 26 * s, borderRadius: 13 * s, border: `${4 * s}px solid ${accent.glow}`, background: "rgba(8,8,10,0.6)", margin: `0 auto ${12 * s}px` }} />
      <div style={{ fontSize: 28 * s, letterSpacing: 3 * s, color: INK.onDarkSoft, textShadow: HARD(2), whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
  return (
    <div style={{ width, fontFamily: FONT.display, opacity: head }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 * s }}>
        <div style={{ fontSize: 36 * s, letterSpacing: 5 * s, color: INK.onDark, textShadow: HARD(3 * s) }}>ROUND TRIP · 96 kHz</div>
        <div style={{ fontSize: 96 * s, lineHeight: 0.9, color: accent.glow, textShadow: HARD(4 * s), fontVariantNumeric: "tabular-nums" }}>
          {value}
          <span style={{ fontSize: 44 * s, letterSpacing: 3 * s, marginLeft: 14 * s, color: INK.onDarkSoft }}>ms</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 100 * s }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 11 * s, height: 4 * s, background: "rgba(255,255,255,0.30)" }} />
        <div style={{ position: "absolute", left: `${x * 100}%`, top: 0, width: 26 * s, height: 26 * s, marginLeft: -13 * s, borderRadius: 13 * s, background: accent.glow, boxShadow: `0 0 34px ${accent.glow}`, opacity: interpolate(t, [0, 0.06, 0.94, 1], [0, 1, 1, 0]) }} />
        <Node label="IN" at={0} />
        <Node label="DSP · THUNDERBOLT 4" at={50} />
        <Node label="OUT" at={100} />
      </div>
    </div>
  );
};

// ── Comparison ladder — the closing argument ─────────────────────────────────
/**
 * The two products side by side on one scale, each as an IN row over an OUT
 * row. Nothing here is a score: the columns are ordered by nothing, the accents
 * are equal in weight, and the identical 2-preamplifier head of each input row
 * is drawn solid in both so the eye lands on it before it lands on the length.
 */
export const LadderCompare: React.FC<{ f: number; width: number; s?: number }> = ({ f, width, s = 1 }) => {
  const { fps } = useVideoConfig();
  const keys = ["pul", "p828"] as const;
  const colGap = 34 * s;
  const colW = (width - colGap) / 2;
  const cellGap = 3 * s;
  const cellW = (colW - cellGap * (SLOTS - 1)) / SLOTS;
  const head = spring({ frame: f, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 14 });
  const CellRow: React.FC<{ count: number; mic: number; accent: string; ci: number; rowI: number }> = ({ count, mic, accent, ci, rowI }) => (
    <div style={{ display: "flex", gap: cellGap }}>
      {Array.from({ length: SLOTS }).map((_, i) => {
        const filled = i < count;
        const lit = spring({ frame: f - 18 - ci * 10 - rowI * 8 - i * 0.8, fps, config: { damping: 200, mass: 0.35 }, durationInFrames: 10 });
        const isMic = i < mic;
        return (
          <div
            key={i}
            style={{
              width: cellW, height: 44 * s, borderRadius: 6 * s,
              border: `${2.5 * s}px solid ${filled ? accent : "rgba(255,255,255,0.35)"}`,
              background: filled ? (isMic ? `${accent}EE` : `${accent}88`) : "rgba(255,255,255,0.08)",
              boxShadow: filled ? `0 0 ${14 * lit}px ${accent}` : "none",
              opacity: filled ? lit : head * 0.6,
              transform: `scaleY(${filled ? interpolate(lit, [0, 1], [0.3, 1]) : 1})`,
            }}
          />
        );
      })}
    </div>
  );
  return (
    <div style={{ width, fontFamily: FONT.display }}>
      <div style={{ fontSize: 36 * s, letterSpacing: 5 * s, color: INK.onDark, textShadow: HARD(3 * s), marginBottom: 20 * s, opacity: head, transform: `translateY(${interpolate(head, [0, 1], [18, 0])}px)` }}>
        SAME HEAD · DIFFERENT TAIL
      </div>
      <div style={{ display: "flex", gap: colGap }}>
        {keys.map((k, ci) => {
          const accent = ACCENT[k];
          const spec = IO[k];
          const colIn = spring({ frame: f - 8 - ci * 10, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 16 });
          return (
            <div key={k} style={{ width: colW, opacity: colIn, transform: `translateY(${interpolate(colIn, [0, 1], [30, 0])}px)` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 * s, marginBottom: 12 * s, flexWrap: "wrap" }}>
                <div style={{ fontSize: 46 * s, letterSpacing: 3 * s, color: accent.glow, textShadow: HARD(3 * s) }}>{accent.short}</div>
                <div style={{ fontSize: 30 * s, color: INK.onDarkSoft, textShadow: HARD(2), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {spec.mic} PREAMP{spec.mic > 1 ? "S" : ""} · {spec.label}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 * s }}>
                <CellRow count={spec.in} mic={spec.mic} accent={accent.glow} ci={ci} rowI={0} />
                <CellRow count={spec.out} mic={0} accent={accent.glow} ci={ci} rowI={1} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
