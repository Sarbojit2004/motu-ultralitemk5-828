import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { COLORS, SAFE, BRAND, PRICE, hexA } from "./theme";
import { headline, subhead, micro, spec } from "./fonts";
import { img, LOGO } from "./assets";
import { FontFaces } from "./components/Shell";

/**
 * Portrait thumbnail, 1080x1920 — one per reel.
 *
 * Features that reel's own primary product, drawn from its own coverage
 * portion, shown COMPLETE and UNCROPPED. Both logos sit directly on the page,
 * never boxed, and everything stays clear of the caption-safe zone. Both
 * Market Operating Prices are stated distinctly, with the reel's own product
 * leading, alongside the website that carries the best price.
 */
const CONF = {
  1: { idx: 14, name: "MOTU UltraLite-mk5", role: "The Agile Hub",
       spec: "40 channels · half-rack", price: PRICE.ultralite, accent: COLORS.motuBlue,
       other: ["MOTU 828", PRICE.e828] as const, headline: "Dense I/O.\nHalf-rack." },
  2: { idx: 25, name: "MOTU 828", role: "The Studio Anchor",
       spec: "60 channels · 1U rack", price: PRICE.e828, accent: COLORS.signal,
       other: ["MOTU UltraLite-mk5", PRICE.ultralite] as const, headline: "Sixty channels.\nOne rack unit." },
} as const;

export const Thumbnail: React.FC<{ reel: 1 | 2 }> = ({ reel }) => {
  const c = CONF[reel];
  return (
    <AbsoluteFill style={{ background: COLORS.paper }}>
      <FontFaces />
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 12%, ${COLORS.paperLift} 0%, ${COLORS.paper} 52%, ${COLORS.paperEdge} 100%)`,
        }}
      />

      {/* logos — directly on the page, inside the safe zone */}
      <div
        style={{
          position: "absolute", left: SAFE.marginX, right: SAFE.marginX, top: SAFE.top - 90,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Img src={LOGO.shivansh()} style={{ height: 76, width: "auto", objectFit: "contain" }} />
        <Img src={LOGO.motu()} style={{ height: 52, width: "auto", objectFit: "contain" }} />
      </div>

      {/* headline */}
      <div style={{ position: "absolute", left: SAFE.marginX, right: SAFE.marginX, top: SAFE.top + 34 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 46, height: 5, background: c.accent, borderRadius: 3 }} />
          <span style={{ ...micro(21, 700, "0.2em"), color: COLORS.slate }}>{c.role}</span>
        </div>
        <div style={{ ...headline(86, 800), color: COLORS.ink, lineHeight: 0.98, whiteSpace: "pre-line" }}>
          {c.headline}
        </div>
      </div>

      {/* the hero product, complete and uncropped.
          Sized to close the gap between the price block and the footer — the
          product should own the middle of the frame, not float in it. */}
      <div
        style={{
          position: "absolute", left: SAFE.marginX, right: SAFE.marginX, top: SAFE.top + 288, height: 772,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
          borderRadius: 26,
          background: `radial-gradient(120% 100% at 50% 34%, ${COLORS.paperLift} 0%, ${COLORS.paper} 52%, ${COLORS.paperEdge} 100%)`,
        }}
      >
        <Img
          src={img(c.idx)}
          style={{
            maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto",
            objectFit: "contain", // the complete unit, never cropped
            filter: `drop-shadow(0 22px 34px ${hexA(COLORS.ink, 0.20)})`,
          }}
        />
      </div>

      {/* prices — the reel's own product leads, both stated distinctly */}
      <div
        style={{
          position: "absolute", left: SAFE.marginX, right: SAFE.marginX, top: SAFE.top + 1096,
          display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        <div
          style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14,
            padding: "18px 26px", background: COLORS.paperLift,
            border: `1px solid ${COLORS.line}`, borderLeft: `7px solid ${c.accent}`, borderRadius: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ ...micro(19, 800, "0.12em"), color: COLORS.ink }}>{c.name}</span>
            <span style={{ ...micro(14, 600, "0.1em"), color: COLORS.slate }}>{c.spec}</span>
          </div>
          <span style={{ ...spec(46, 800, "-0.005em"), color: c.accent }}>{c.price}</span>
        </div>
        <div
          style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14,
            padding: "12px 26px",
            border: `1px solid ${COLORS.line}`, borderRadius: 14,
          }}
        >
          <span style={{ ...micro(16, 700, "0.12em"), color: COLORS.slate }}>{c.other[0]}</span>
          <span style={{ ...spec(28, 800, "0"), color: COLORS.slate }}>{c.other[1]}</span>
        </div>
        <span style={{ ...micro(14, 600, "0.1em"), color: COLORS.slateDim, textAlign: "center" }}>
          {PRICE.note}
        </span>
      </div>

      {/* footer */}
      <div
        style={{
          position: "absolute", left: SAFE.marginX, right: SAFE.marginX, bottom: SAFE.bottom - 86,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        }}
      >
        <span style={{ ...spec(42, 800, "0.01em"), color: COLORS.motuBlue }}>{BRAND.website}</span>
        <span
          style={{
            ...subhead(21, 600), color: COLORS.inkSoft,
            background: hexA(COLORS.signalBright, 0.10),
            border: `1px solid ${hexA(COLORS.signal, 0.32)}`,
            padding: "9px 20px", borderRadius: 999,
          }}
        >
          {PRICE.best}
        </span>
        <span style={{ ...micro(15, 600, "0.12em"), color: COLORS.slate, textAlign: "center" }}>
          {BRAND.role} · {BRAND.region}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const Thumbnail1: React.FC = () => <Thumbnail reel={1} />;
export const Thumbnail2: React.FC = () => <Thumbnail reel={2} />;
