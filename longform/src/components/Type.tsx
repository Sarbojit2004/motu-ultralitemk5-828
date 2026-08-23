import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, hexA } from "../theme";
import { headline, subhead, spec, micro, editorial } from "../fonts";
import { EASE, ramp, countUp, group } from "../lib/anim";

/** Staggered rise-in used by every text element so beats feel authored.
 *  Stage 10: opacity fade or upward slide only — no bounce, no overshoot. */
export const Rise: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 22, children, style }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay, 20, EASE.out);
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)`, ...style }}>
      {children}
    </div>
  );
};

/** Small uppercase kicker with a leading accent rule. */
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  accent?: string;
  size?: number;
  delay?: number;
}> = ({ children, color = COLORS.slate, accent = COLORS.motuBlue, size = 26, delay = 0 }) => (
  <Rise delay={delay} y={12}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 46, height: 4, background: accent, borderRadius: 2 }} />
      <span style={{ ...micro(size, 700, "0.2em"), color }}>{children}</span>
    </div>
  </Rise>
);

/** Stage 10 Level 1. Section 8 floor: never below 96px here. */
export const Headline: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  delay?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 108, color = COLORS.ink, delay = 6, weight = 800, style }) => (
  <Rise delay={delay} y={28}>
    <div style={{ ...headline(size, weight), color, ...style }}>{children}</div>
  </Rise>
);

/** Stage 10 Level 2 — muted slate, contextual. */
export const Subhead: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  delay?: number;
  maxWidth?: number;
  weight?: number;
}> = ({ children, size = 40, color = COLORS.slate, delay = 16, maxWidth = 1180, weight = 500 }) => (
  <Rise delay={delay} y={18}>
    <div style={{ ...subhead(size, weight), color, maxWidth }}>{children}</div>
  </Rise>
);

/** Editorial serif statement — Problem and Transformation beats only. */
export const Editorial: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  delay?: number;
  maxWidth?: number;
}> = ({ children, size = 92, color = COLORS.ink, delay = 8, maxWidth = 1440 }) => (
  <Rise delay={delay} y={26}>
    <div style={{ ...editorial(size), color, maxWidth }}>{children}</div>
  </Rise>
);

/** Stage 10 specification callout on a light chip — hard engineering data. */
export const SpecChip: React.FC<{
  label: string;
  value: string;
  delay?: number;
  accent?: string;
  size?: number;
}> = ({ label, value, delay = 0, accent = COLORS.motuBlue, size = 44 }) => (
  <Rise delay={delay} y={16}>
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 8,
        padding: "20px 28px",
        background: COLORS.paperLift,
        border: `1px solid ${COLORS.line}`,
        borderLeft: `5px solid ${accent}`,
        borderRadius: 14,
        boxShadow: `0 2px 10px ${COLORS.shadow}`,
      }}
    >
      <span style={{ ...micro(20, 700, "0.18em"), color: COLORS.slate }}>{label}</span>
      <span style={{ ...spec(size, 800, "0.005em"), color: COLORS.ink, lineHeight: 1.05 }}>
        {value}
      </span>
    </div>
  </Rise>
);

/**
 * Stage 10's three-level lockup, made literal: a hero metric (Level 1, massive
 * heavy numeral), its context label (Level 2, medium weight, wider tracking),
 * and one line of narrative benefit (Level 3, light, used sparingly).
 */
export const MetricLockup: React.FC<{
  metric: string;
  context: string;
  narrative?: string;
  delay?: number;
  color?: string;
  size?: number;
  align?: "left" | "center";
}> = ({ metric, context, narrative, delay = 0, color = COLORS.ink, size = 170, align = "left" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: align === "center" ? "center" : "flex-start" }}>
    <Rise delay={delay} y={26}>
      <div style={{ ...spec(size, 800, "-0.02em"), color, lineHeight: 0.94 }}>{metric}</div>
    </Rise>
    <Rise delay={delay + 8} y={16}>
      <div style={{ ...micro(30, 600, "0.2em"), color: COLORS.slate }}>{context}</div>
    </Rise>
    {narrative ? (
      <Rise delay={delay + 15} y={12}>
        <div style={{ ...subhead(27, 400), color: COLORS.slateDim, maxWidth: 720, textAlign: align }}>
          {narrative}
        </div>
      </Rise>
    ) : null}
  </div>
);

/** Animated counter — Stage 10's "numbers build visual momentum". */
export const Counter: React.FC<{
  to: number;
  suffix?: string;
  prefix?: string;
  start?: number;
  len?: number;
  size?: number;
  color?: string;
}> = ({ to, suffix = "", prefix = "", start = 8, len = 46, size = 170, color = COLORS.ink }) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ ...spec(size, 800, "-0.02em"), color, lineHeight: 0.94 }}>
      {prefix}
      {group(countUp(frame, start, len, to))}
      {suffix}
    </span>
  );
};

/** Micro callout pointing at hardware via a thin vector line (Stage 10). */
export const MicroCallout: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  len?: number;
  side?: "left" | "right";
  delay?: number;
  color?: string;
}> = ({ children, x, y, len = 130, side = "right", delay = 0, color = COLORS.motuBlue }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay, 18, EASE.out);
  return (
    <div
      style={{
        position: "absolute", left: x, top: y,
        display: "flex",
        flexDirection: side === "right" ? "row" : "row-reverse",
        alignItems: "center", gap: 12,
        opacity: t,
      }}
    >
      <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <div style={{ width: len * t, height: 2, background: hexA(color, 0.65), flexShrink: 0 }} />
      <span
        style={{
          ...micro(21, 700, "0.12em"),
          color: COLORS.ink,
          background: hexA(COLORS.paperLift, 0.94),
          padding: "7px 13px", borderRadius: 8,
          border: `1px solid ${COLORS.line}`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    </div>
  );
};

/** Numbered row for problem/solution beats. */
export const PointRow: React.FC<{
  n: number;
  title: string;
  body?: string;
  delay?: number;
  accent?: string;
}> = ({ n, title, body, delay = 0, accent = COLORS.alert }) => (
  <Rise delay={delay} y={18}>
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div
        style={{
          ...spec(26, 800, "0"),
          color: "#FFFFFF", background: accent,
          width: 48, height: 48, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ ...subhead(38, 700), color: COLORS.ink }}>{title}</div>
        {body ? (
          <div style={{ ...subhead(29), color: COLORS.slate, maxWidth: 900 }}>{body}</div>
        ) : null}
      </div>
    </div>
  </Rise>
);

/** Chapter marker at the head of each of the six segments. */
export const ChapterMark: React.FC<{ n: string; title: string; delay?: number }> = ({
  n, title, delay = 0,
}) => (
  <Rise delay={delay} y={14}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
      <span style={{ ...spec(26, 800, "0.24em"), color: COLORS.motuBlue }}>{n}</span>
      <span style={{ ...micro(24, 700, "0.22em"), color: COLORS.slate }}>{title}</span>
    </div>
  </Rise>
);
