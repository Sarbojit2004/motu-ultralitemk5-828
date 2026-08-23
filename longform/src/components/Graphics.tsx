import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, hexA } from "../theme";
import { EASE, mapClamp, ramp } from "../lib/anim";
import { micro } from "../fonts";

/**
 * STAGE 6 · CONVERSION WAVE — visualising the ESS Sabre32 conversion.
 * A jagged, multi-layered digital waveform enters from the left; as it crosses
 * a threshold at frame centre it becomes a single perfectly smooth, continuous
 * analog curve. Drawn on a canvas-free SVG path computed per frame.
 */
export const ConversionWave: React.FC<{
  duration: number;
  width: number;
  height: number;
  delay?: number;
}> = ({ duration, width, height, delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay, Math.max(24, duration * 0.35), EASE.inOut);
  const mid = width * 0.5;
  const cy = height * 0.5;
  const amp = height * 0.26;

  const N = 260;
  const digital: string[] = [];
  const analog: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * width;
    const ph = (i / N) * 14 + frame * 0.055;
    // stepped, multi-layered, deliberately jagged
    const steps = Math.round(Math.sin(ph) * 5) / 5;
    const jag = steps * amp + Math.sin(ph * 3.7) * amp * 0.22 + Math.sin(ph * 9.1) * amp * 0.09;
    // the smooth resolved wave
    const smooth = Math.sin(ph * 0.92) * amp * 0.86;
    digital.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${(cy + jag).toFixed(1)}`);
    analog.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${(cy + smooth).toFixed(1)}`);
  }

  // The threshold sweeps left→right; left of it is digital, right is analog.
  const cross = mapClamp(frame, [delay, delay + duration * 0.62], [0.06, 0.97], EASE.inOut) * width;

  return (
    <AbsoluteFill style={{ opacity: t }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="cw-left"><rect x="0" y="0" width={cross} height={height} /></clipPath>
          <clipPath id="cw-right"><rect x={cross} y="0" width={Math.max(0, width - cross)} height={height} /></clipPath>
          <linearGradient id="cw-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.signal} stopOpacity="0.25" />
            <stop offset="100%" stopColor={COLORS.signalBright} stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <g clipPath="url(#cw-left)">
          <path d={digital.join(" ")} fill="none" stroke={hexA(COLORS.motuBlue, 0.34)} strokeWidth={2} />
          <path d={digital.join(" ")} fill="none" stroke={COLORS.motuBlue} strokeWidth={3.4}
                transform={`translate(0,${-amp * 0.10})`} opacity={0.55} />
          <path d={digital.join(" ")} fill="none" stroke={hexA(COLORS.motuBlue, 0.22)} strokeWidth={2}
                transform={`translate(0,${amp * 0.12})`} />
        </g>
        <g clipPath="url(#cw-right)">
          <path d={analog.join(" ")} fill="none" stroke="url(#cw-glow)" strokeWidth={5}
                strokeLinecap="round" />
        </g>
        <line x1={cross} y1={cy - amp * 1.5} x2={cross} y2={cy + amp * 1.5}
              stroke={hexA(COLORS.ink, 0.16)} strokeWidth={2} strokeDasharray="7 9" />
        <circle cx={cross} cy={cy} r={7} fill={COLORS.signal} />
      </svg>
      <div style={{ position: "absolute", left: 0, top: cy + amp * 1.6, width: mid, textAlign: "center" }}>
        <span style={{ ...micro(19, 700, "0.2em"), color: COLORS.motuBlue }}>Digital</span>
      </div>
      <div style={{ position: "absolute", right: 0, top: cy + amp * 1.6, width: mid, textAlign: "center" }}>
        <span style={{ ...micro(19, 700, "0.2em"), color: COLORS.signal }}>Analog</span>
      </div>
    </AbsoluteFill>
  );
};

/**
 * STAGE 6 · I/O MATRIX — the CueMix 5 routing architecture.
 * A minimalist vector grid; discrete dots of light travel left (inputs) to
 * right (outputs) along glowing geometric paths, demonstrating frictionless
 * routing and zero-latency hardware mixing.
 */
export const IOMatrix: React.FC<{
  duration: number;
  width: number;
  height: number;
  ins: number;
  outs: number;
  delay?: number;
  accent?: string;
}> = ({ duration, width, height, ins, outs, delay = 0, accent = COLORS.motuBlue }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay, 26, EASE.out);
  const padY = height * 0.08;
  const usableH = height - padY * 2;
  const xa = width * 0.14;
  const xb = width * 0.86;

  const nodeY = (i: number, n: number) => padY + ((i + 0.5) / n) * usableH;
  const PATHS = 22;

  return (
    <AbsoluteFill style={{ opacity: t }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {/* the routing paths */}
        {Array.from({ length: PATHS }).map((_, k) => {
          const a = nodeY((k * 7) % ins, ins);
          const b = nodeY((k * 5 + 2) % outs, outs);
          const mx = width * 0.5;
          const d = `M${xa},${a} C${mx - 60},${a} ${mx + 60},${b} ${xb},${b}`;
          const on = ramp(frame, delay + 10 + k * 1.6, 22, EASE.out);
          return (
            <path key={k} d={d} fill="none"
                  stroke={hexA(accent, 0.16 + 0.10 * on)} strokeWidth={1.6}
                  strokeDasharray="1400" strokeDashoffset={1400 * (1 - on)} />
          );
        })}
        {/* travelling packets */}
        {Array.from({ length: PATHS }).map((_, k) => {
          const a = nodeY((k * 7) % ins, ins);
          const b = nodeY((k * 5 + 2) % outs, outs);
          const mx = width * 0.5;
          const speed = 0.010 + (k % 4) * 0.0021;
          const p = ((frame - delay) * speed + k * 0.137) % 1;
          if (frame < delay + 12) return null;
          // cubic bezier point
          const u = 1 - p;
          const x = u * u * u * xa + 3 * u * u * p * (mx - 60) + 3 * u * p * p * (mx + 60) + p * p * p * xb;
          const y = u * u * u * a + 3 * u * u * p * a + 3 * u * p * p * b + p * p * p * b;
          return <circle key={`p${k}`} cx={x} cy={y} r={3.4} fill={COLORS.signalBright}
                         opacity={0.42 + 0.5 * Math.sin(Math.PI * p)} />;
        })}
        {/* input / output nodes */}
        {Array.from({ length: ins }).map((_, i) => (
          <circle key={`i${i}`} cx={xa} cy={nodeY(i, ins)} r={4.6}
                  fill={accent} opacity={0.28 + 0.6 * ramp(frame, delay + i * 0.7, 16, EASE.out)} />
        ))}
        {Array.from({ length: outs }).map((_, i) => (
          <circle key={`o${i}`} cx={xb} cy={nodeY(i, outs)} r={4.6}
                  fill={COLORS.signal} opacity={0.28 + 0.6 * ramp(frame, delay + 8 + i * 0.7, 16, EASE.out)} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: xa - 120, top: padY - 44, width: 240, textAlign: "center" }}>
        <span style={{ ...micro(19, 700, "0.2em"), color: accent }}>{ins} In</span>
      </div>
      <div style={{ position: "absolute", left: xb - 120, top: padY - 44, width: 240, textAlign: "center" }}>
        <span style={{ ...micro(19, 700, "0.2em"), color: COLORS.signal }}>{outs} Out</span>
      </div>
    </AbsoluteFill>
  );
};

/**
 * STAGE 6 · GAIN SWELL — the +74 dB preamp.
 * A soft glowing bar expands upward from the floor, while a second, barely
 * visible line stays anchored at the very bottom for the -129 dBu noise floor.
 * The vast visual distance between them is the point.
 */
export const GainSwell: React.FC<{
  duration: number;
  width: number;
  height: number;
  delay?: number;
  gainLabel?: string;
  floorLabel?: string;
}> = ({ duration, width, height, delay = 0, gainLabel = "+74 dB", floorLabel = "-129 dBu EIN" }) => {
  const frame = useCurrentFrame();
  const grow = mapClamp(frame, [delay, delay + Math.max(30, duration * 0.55)], [0, 1], EASE.inOut);
  const barW = Math.min(width * 0.20, 220);
  const x = (width - barW) / 2;
  const floorY = height * 0.90;
  const topY = floorY - (floorY - height * 0.10) * grow;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="gs" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={COLORS.amber} stopOpacity="0.16" />
            <stop offset="55%" stopColor={COLORS.amber} stopOpacity="0.52" />
            <stop offset="100%" stopColor={COLORS.amber} stopOpacity="0.90" />
          </linearGradient>
        </defs>
        <rect x={x} y={topY} width={barW} height={Math.max(0, floorY - topY)}
              fill="url(#gs)" rx={10} />
        <rect x={x} y={topY - 3} width={barW} height={5} fill={COLORS.amber} rx={2.5}
              opacity={grow > 0.02 ? 1 : 0} />
        {/* the noise floor — deliberately almost nothing */}
        <rect x={x - 30} y={floorY - 1.2} width={barW + 60} height={2.4}
              fill={hexA(COLORS.ink, 0.30)} />
      </svg>
      <div style={{ position: "absolute", left: 0, top: Math.max(8, topY - 92), width, textAlign: "center", opacity: grow }}>
        <div style={{ ...micro(23, 700, "0.2em"), color: COLORS.amber }}>{gainLabel}</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: floorY + 16, width, textAlign: "center" }}>
        <div style={{ ...micro(19, 700, "0.18em"), color: COLORS.slateDim }}>{floorLabel}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Thin decorative rule used to separate stacked type blocks. */
export const Rule: React.FC<{ w?: number; color?: string; delay?: number }> = ({
  w = 120, color = COLORS.motuBlue, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay, 20, EASE.out);
  return <div style={{ width: w * t, height: 4, background: color, borderRadius: 2 }} />;
};
