import React from "react";
import { Img, useCurrentFrame } from "remotion";
import { COLORS, BRAND, PRICE, hexA } from "../theme";
import { LOGO } from "../assets";
import { micro, subhead, spec } from "../fonts";
import { EASE, ramp } from "../lib/anim";
import { Rise } from "./Type";

/**
 * LOGO TREATMENT — unchanged from the AVB reference and absolute.
 *
 * Both supplied files are drawn EXACTLY as given, directly on the video, with
 * NO box, card, plate or panel behind them and no alpha keying. Each carries
 * its own opaque white rounded-rect ground; the page is held in a near-white
 * range so that ground reads as continuous with the video rather than as
 * artwork sitting on a plate.
 */
export const Logo: React.FC<{
  which: "shivansh" | "motu";
  height: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ which, height, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay, 18, EASE.out);
  return (
    <Img
      src={which === "shivansh" ? LOGO.shivansh() : LOGO.motu()}
      style={{
        height,
        width: "auto",
        objectFit: "contain",
        opacity: t,
        transform: `translateY(${(1 - t) * 10}px)`,
        ...style,
      }}
    />
  );
};

/** Corner lockup: Shivansh logo + the website, the most-repeated pairing. */
export const CornerBrand: React.FC<{
  delay?: number;
  logoH?: number;
  corner?: "tl" | "tr" | "bl" | "br";
  marginX: number;
  marginY: number;
}> = ({ delay = 0, logoH = 56, corner = "tr", marginX, marginY }) => {
  const vert = corner[0] === "t" ? { top: marginY } : { bottom: marginY };
  const horz = corner[1] === "l" ? { left: marginX } : { right: marginX };
  const alignItems = corner[1] === "l" ? "flex-start" : "flex-end";
  return (
    <div
      style={{
        position: "absolute", ...vert, ...horz,
        display: "flex", flexDirection: "column", alignItems, gap: 8,
      }}
    >
      <Logo which="shivansh" height={logoH} delay={delay} />
      <Rise delay={delay + 6} y={8}>
        <div style={{ ...micro(20, 700, "0.14em"), color: COLORS.motuBlue }}>
          {BRAND.website}
        </div>
      </Rise>
    </div>
  );
};

/** Lower-third: logo, website and the confirmed territory line. */
export const LowerThird: React.FC<{
  delay?: number;
  marginX: number;
  marginY: number;
  logoH?: number;
}> = ({ delay = 0, marginX, marginY, logoH = 74 }) => (
  <div
    style={{
      position: "absolute", left: marginX, bottom: marginY,
      display: "flex", alignItems: "center", gap: 26,
    }}
  >
    <Logo which="shivansh" height={logoH} delay={delay} />
    <div style={{ width: 2, height: logoH * 0.72, background: COLORS.line }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <Rise delay={delay + 5} y={10}>
        <div style={{ ...spec(30, 800, "0.02em"), color: COLORS.motuBlue }}>{BRAND.website}</div>
      </Rise>
      <Rise delay={delay + 10} y={8}>
        <div style={{ ...micro(19, 600, "0.16em"), color: COLORS.slate }}>{BRAND.region}</div>
      </Rise>
    </div>
  </div>
);

/** Full branding beat: both logos, the distributor role, website and socials. */
export const BrandBeat: React.FC<{
  delay?: number;
  showMotu?: boolean;
  showSocials?: boolean;
  compact?: boolean;
}> = ({ delay = 0, showMotu = true, showSocials = false, compact = false }) => (
  <div
    style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: compact ? 20 : 30, width: "100%", height: "100%",
    }}
  >
    <Logo which="shivansh" height={compact ? 118 : 156} delay={delay} />
    <Rise delay={delay + 8} y={14}>
      <div style={{ ...subhead(compact ? 27 : 33, 600), color: COLORS.inkSoft, textAlign: "center", maxWidth: 1360 }}>
        {BRAND.role}
      </div>
    </Rise>
    <Rise delay={delay + 13} y={12}>
      <div style={{ ...micro(compact ? 21 : 25, 700, "0.2em"), color: COLORS.slate }}>
        {BRAND.region}
      </div>
    </Rise>
    <Rise delay={delay + 18} y={14}>
      <div style={{ ...spec(compact ? 42 : 54, 800, "0.01em"), color: COLORS.motuBlue }}>
        {BRAND.website}
      </div>
    </Rise>
    {showSocials ? <Socials delay={delay + 24} /> : null}
    {showMotu ? (
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 4 }}>
        <Rise delay={delay + 28} y={10}>
          <div style={{ ...micro(17, 700, "0.2em"), color: COLORS.slateDim }}>
            Authorized Distributor of
          </div>
        </Rise>
        <Logo which="motu" height={compact ? 44 : 56} delay={delay + 30} />
      </div>
    ) : null}
  </div>
);

/** The three social channels to be highlighted, as supplied. */
export const Socials: React.FC<{ delay?: number; size?: number; gap?: number; column?: boolean }> = ({
  delay = 0, size = 23, gap = 34, column = false,
}) => {
  const items: [string, string][] = [
    ["YouTube", BRAND.youtube],
    ["Facebook", BRAND.facebook],
    ["Instagram", BRAND.instagram],
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: column ? "column" : "row",
        gap: column ? 12 : gap,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: column ? "flex-start" : "center",
      }}
    >
      {items.map(([k, v], i) => (
        <Rise key={k} delay={delay + i * 4} y={10}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ ...micro(size * 0.78, 700, "0.18em"), color: COLORS.slateDim }}>{k}</span>
            <span style={{ ...subhead(size, 600), color: COLORS.inkSoft }}>{v}</span>
          </div>
        </Rise>
      ))}
    </div>
  );
};

/**
 * Price lockup. The two Market Operating Prices are always stated DISTINCTLY,
 * one per product, never blended into a range (Section 2 Fact 3) — and always
 * alongside the website, which carries the best price.
 */
export const PriceLockup: React.FC<{ delay?: number; size?: number; stacked?: boolean }> = ({
  delay = 0, size = 62, stacked = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        gap: stacked ? 20 : 56,
        alignItems: stacked ? "stretch" : "flex-start",
      }}
    >
      {([
        ["MOTU UltraLite-mk5", PRICE.ultralite, COLORS.motuBlue],
        ["MOTU 828", PRICE.e828, COLORS.signal],
      ] as const).map(([name, price, accent], i) => (
        <Rise key={name} delay={delay + i * 7} y={18}>
          <div
            style={{
              display: "flex", flexDirection: "column", gap: 9,
              padding: "22px 34px",
              background: COLORS.paperLift,
              border: `1px solid ${COLORS.line}`,
              borderLeft: `6px solid ${accent}`,
              borderRadius: 16,
              boxShadow: `0 3px 14px ${COLORS.shadow}`,
              minWidth: stacked ? 0 : 440,
            }}
          >
            <span style={{ ...micro(20, 700, "0.16em"), color: COLORS.slate }}>{name}</span>
            <span style={{ ...spec(size, 800, "-0.005em"), color: COLORS.ink, lineHeight: 1.02 }}>
              {price}
            </span>
            <span style={{ ...micro(16, 600, "0.13em"), color: COLORS.slateDim }}>{PRICE.note}</span>
          </div>
        </Rise>
      ))}
    </div>
    <Rise delay={delay + 16} y={12}>
      <div
        style={{
          ...subhead(26, 600),
          color: COLORS.inkSoft,
          background: hexA(COLORS.signalBright, 0.09),
          border: `1px solid ${hexA(COLORS.signal, 0.3)}`,
          padding: "10px 22px", borderRadius: 999,
        }}
      >
        {PRICE.best}
      </div>
    </Rise>
  </div>
);
