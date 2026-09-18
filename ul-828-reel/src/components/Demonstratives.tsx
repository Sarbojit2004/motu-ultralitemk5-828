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

// ── The channel ladder ───────────────────────────────────────────────────────
export type IoSpec = { mic: number; line: number; out: number; phones: number; label: string };

/** Counts read off the panel photography in the repository root. */
export const IO: Record<"pmk5" | "p828", IoSpec> = {
  pmk5: { mic: 2, line: 6, out: 10, phones: 1, label: "2 MIC + 6 LINE IN · 10 LINE OUT" },
  p828: { mic: 2, line: 8, out: 10, phones: 2, label: "2 MIC + 8 LINE IN · 10 LINE OUT" },
};
const SLOTS = 10;

const Slot: React.FC<{ lit: number; accent: string; width: number; filled: boolean; kind: "mic" | "line" | "none"; s: number }> = ({ lit, accent, width, filled, kind, s }) => (
  <div
    style={{
      width,
      height: 96 * s,
      borderRadius: 12 * s,
      border: `${3 * s}px solid ${filled ? accent : "rgba(255,255,255,0.5)"}`,
      background: filled
        ? kind === "mic"
          ? `linear-gradient(180deg, ${accent}F0 0%, ${accent}99 100%)`
          : `linear-gradient(180deg, ${accent}A6 0%, ${accent}55 100%)`
        : "rgba(255,255,255,0.10)",
      boxShadow: filled ? `0 0 ${24 * lit}px ${accent}` : "none",
      opacity: lit,
      transform: `translateY(${interpolate(lit, [0, 1], [22, 0])}px) scale(${interpolate(lit, [0, 1], [0.82, 1])})`,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      paddingBottom: 8 * s,
    }}
  >
    {filled && kind === "mic" ? <div style={{ width: 10 * s, height: 10 * s, borderRadius: 5 * s, background: "#0B0A08" }} /> : null}
  </div>
);

/**
 * Sixteen slots; the product lights its own. Mic channels are drawn solid with
 * an XLR dot, line channels lighter — so the 848's "4 + 8" and the 16A's
 * "16, none of them mics" are legible without reading.
 */
export const IoLadder: React.FC<{ product: "pmk5" | "p828"; f: number; width: number; s?: number }> = ({ product, f, width, s = 1 }) => {
  const { fps } = useVideoConfig();
  const accent = ACCENT[product];
  const spec = IO[product];
  const total = spec.mic + spec.line;
  const gap = 10 * s;
  const slotW = (width - gap * (SLOTS - 1)) / SLOTS;
  const litFor = (i: number) => spring({ frame: f - 10 - i * 2, fps, config: { damping: 200, mass: 0.4 }, durationInFrames: 10 });
  let counted = 0;
  for (let i = 0; i < total; i++) if (litFor(i) > 0.55) counted++;
  const head = spring({ frame: f, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 14 });
  const outIn = spring({ frame: f - 34, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 16 });

  return (
    <div style={{ width, fontFamily: FONT.display }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", opacity: head, transform: `translateY(${interpolate(head, [0, 1], [18, 0])}px)`, marginBottom: 14 * s }}>
        <div style={{ fontSize: 36 * s, letterSpacing: 5 * s, color: INK.onDark, textShadow: HARD(3 * s) }}>ANALOG INPUTS</div>
        <div style={{ fontSize: 92 * s, lineHeight: 0.9, color: accent.glow, letterSpacing: -1, textShadow: HARD(4 * s), fontVariantNumeric: "tabular-nums" }}>{counted}</div>
      </div>
      <div style={{ display: "flex", gap }}>
        {Array.from({ length: SLOTS }).map((_, i) => {
          const filled = i < total;
          const kind = i < spec.mic ? "mic" : filled ? "line" : "none";
          return <Slot key={i} lit={filled ? litFor(i) : head * 0.5} accent={accent.glow} width={slotW} filled={filled} kind={kind} s={s} />;
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 * s, marginTop: 18 * s, opacity: outIn, transform: `translateX(${interpolate(outIn, [0, 1], [-24, 0])}px)`, flexWrap: "wrap" }}>
        <div style={{ fontSize: 32 * s, letterSpacing: 4.4 * s, color: INK.onDarkSoft, textShadow: HARD(3 * s) }}>{spec.mic ? `${spec.mic} MIC` : "0 MIC"}</div>
        <div style={{ width: 8 * s, height: 8 * s, borderRadius: 4 * s, background: "rgba(255,255,255,0.4)" }} />
        <div style={{ fontSize: 32 * s, letterSpacing: 4.4 * s, color: INK.onDarkSoft, textShadow: HARD(3 * s) }}>{spec.line} LINE</div>
        <div style={{ width: 8 * s, height: 8 * s, borderRadius: 4 * s, background: "rgba(255,255,255,0.4)" }} />
        <div style={{ fontSize: 32 * s, letterSpacing: 4.4 * s, color: accent.glow, textShadow: HARD(3 * s) }}>{spec.out} LINE OUT</div>
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

// ── Network graph ────────────────────────────────────────────────────────────
/**
 * The switch in the middle; units attach one by one along lit cables, then a
 * clock pulse runs through all of them at once — the 802.1AS argument drawn.
 */
export const NetworkGraph: React.FC<{ f: number; width: number; s?: number; product?: ProductKey }> = ({ f, width, s = 1, product = "shared" }) => {
  const { fps } = useVideoConfig();
  const accent = ACCENT[product];
  const head = spring({ frame: f, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 14 });
  const nodes: { key: ProductKey; label: string; x: number }[] = [
    { key: "pmk5", label: "UltraLite-mk5 · DESK", x: 0.15 },
    { key: "p828", label: "828 · RACK", x: 0.5 },
    { key: "shared", label: "COMPUTER", x: 0.85 },
  ];
  const H = 250 * s;
  const cx = 0.5;
  const pulse = ((f % 48) / 48);
  return (
    <div style={{ width, height: H + 70 * s, position: "relative", fontFamily: FONT.display, opacity: head }}>
      {/* cables */}
      {nodes.map((n, i) => {
        const grow = spring({ frame: f - 12 - i * 9, fps, config: { damping: 200, mass: 0.6 }, durationInFrames: 18 });
        const x1 = cx * width, y1 = H * 0.22, x2 = n.x * width, y2 = H * 0.82;
        const len = Math.hypot(x2 - x1, y2 - y1);
        const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        const px = x1 + (x2 - x1) * pulse, py = y1 + (y2 - y1) * pulse;
        return (
          <React.Fragment key={n.key + i}>
            <div style={{ position: "absolute", left: x1, top: y1, width: len * grow, height: 6 * s, background: `linear-gradient(90deg, ${accent.glow} 0%, ${ACCENT[n.key].glow} 100%)`, transformOrigin: "0 50%", transform: `rotate(${ang}deg)`, boxShadow: `0 0 18px ${accent.glow}88`, borderRadius: 3 }} />
            {grow > 0.98 ? <div style={{ position: "absolute", left: px - 9 * s, top: py - 9 * s, width: 18 * s, height: 18 * s, borderRadius: 9 * s, background: "#FFF6E9", boxShadow: `0 0 26px ${accent.glow}`, opacity: interpolate(pulse, [0, 0.08, 0.92, 1], [0, 1, 1, 0]) }} /> : null}
          </React.Fragment>
        );
      })}
      {/* switch */}
      <div style={{ position: "absolute", left: cx * width - 150 * s, top: H * 0.22 - 44 * s, width: 300 * s, height: 88 * s, borderRadius: 16 * s, border: `${4 * s}px solid ${accent.glow}`, background: "rgba(8,8,12,0.7)", boxShadow: `0 0 34px ${accent.glow}66`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 * s }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const on = spring({ frame: f - 14 - i * 8, fps, config: { damping: 200 }, durationInFrames: 10 });
          return <div key={i} style={{ width: 26 * s, height: 30 * s, borderRadius: 4 * s, border: `${3 * s}px solid ${accent.glow}`, background: i < 4 ? `${accent.glow}${on > 0.5 ? "EE" : "22"}` : "transparent" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: cx * width, top: H * 0.22 - 100 * s, transform: "translateX(-50%)", fontSize: 30 * s, letterSpacing: 5 * s, color: accent.glow, textShadow: HARD(3 * s), whiteSpace: "nowrap" }}>5 AVB PORTS · IEEE 802.1AS</div>
      {/* units */}
      {nodes.map((n, i) => {
        const inn = spring({ frame: f - 22 - i * 9, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 14 });
        const acc = ACCENT[n.key];
        return (
          <div key={n.key + "u" + i} style={{ position: "absolute", left: n.x * width, top: H * 0.82, transform: `translate(-50%, -50%) scale(${interpolate(inn, [0, 1], [0.6, 1])})`, opacity: inn, textAlign: "center" }}>
            <div style={{ width: 150 * s, height: 46 * s, borderRadius: 8 * s, border: `${3 * s}px solid ${acc.glow}`, background: "rgba(8,8,12,0.75)", boxShadow: `0 0 22px ${acc.glow}66`, margin: "0 auto" }} />
            <div style={{ marginTop: 12 * s, fontSize: 26 * s, letterSpacing: 3.6 * s, color: acc.glow, textShadow: HARD(3 * s), whiteSpace: "nowrap" }}>{n.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ── Comparison ladder — the closing argument ─────────────────────────────────
export const LadderCompare: React.FC<{ f: number; width: number; s?: number }> = ({ f, width, s = 1 }) => {
  const { fps } = useVideoConfig();
  const keys = ["pmk5", "p828"] as const;
  const colGap = 26 * s;
  const colW = (width - colGap) / 2;
  const cellGap = 6 * s;
  const cellW = (colW - cellGap * 9) / 10;
  const head = spring({ frame: f, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 14 });
  return (
    <div style={{ width, fontFamily: FONT.display }}>
      <div style={{ fontSize: 36 * s, letterSpacing: 5 * s, color: INK.onDark, textShadow: HARD(3 * s), marginBottom: 20 * s, opacity: head, transform: `translateY(${interpolate(head, [0, 1], [18, 0])}px)` }}>
        CHOOSE THE ROOM
      </div>
      <div style={{ display: "flex", gap: colGap }}>
        {keys.map((k, ci) => {
          const accent = ACCENT[k];
          const spec = IO[k];
          const total = spec.mic + spec.line;
          const colIn = spring({ frame: f - 8 - ci * 10, fps, config: { damping: 200, mass: 0.5 }, durationInFrames: 16 });
          return (
            <div key={k} style={{ width: colW, opacity: colIn, transform: `translateY(${interpolate(colIn, [0, 1], [30, 0])}px)` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 * s, marginBottom: 12 * s }}>
                <div style={{ fontSize: 54 * s, letterSpacing: 4 * s, color: accent.glow, textShadow: HARD(3 * s) }}>{accent.short}</div>
                <div style={{ fontSize: 34 * s, color: INK.onDarkSoft, textShadow: HARD(2), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {spec.mic ? `${spec.mic} MIC` : "0 MIC"} · {spec.line} LINE
                </div>
              </div>
              <div style={{ display: "flex", gap: cellGap }}>
                {Array.from({ length: 10 }).map((_, i) => {
                  const filled = i < total;
                  const lit = spring({ frame: f - 18 - ci * 10 - i * 2, fps, config: { damping: 200, mass: 0.35 }, durationInFrames: 10 });
                  const mic = i < spec.mic;
                  return (
                    <div
                      key={i}
                      style={{
                        width: cellW, height: 70 * s, borderRadius: 8 * s,
                        border: `${3 * s}px solid ${filled ? accent.glow : "rgba(255,255,255,0.4)"}`,
                        background: filled ? (mic ? `${accent.glow}EE` : `${accent.glow}88`) : "rgba(255,255,255,0.08)",
                        boxShadow: filled ? `0 0 ${18 * lit}px ${accent.glow}` : "none",
                        opacity: filled ? lit : colIn * 0.7,
                        transform: `scaleY(${filled ? interpolate(lit, [0, 1], [0.3, 1]) : 1})`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
