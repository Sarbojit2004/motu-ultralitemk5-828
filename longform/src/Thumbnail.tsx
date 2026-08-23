import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { COLORS, SPACE, BRAND, PRICE, hexA } from "./theme";
import { headline, subhead, micro, spec } from "./fonts";
import { img, LOGO } from "./assets";
import { FontFaces } from "./components/Shell";

/**
 * Landscape thumbnail, 1920×1080.
 *
 * Both products appear complete and UNCROPPED (`object-fit: contain`), on the
 * same light ground as the video. Both logos are drawn directly on the page,
 * never boxed or plated. Both Market Operating Prices are stated distinctly,
 * one per product, alongside the website that carries the best price.
 */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.paper }}>
    <FontFaces />
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 100% at 50% 4%, ${COLORS.paperLift} 0%, ${COLORS.paper} 54%, ${COLORS.paperEdge} 100%)`,
      }}
    />

    {/* header — logos placed directly on the page */}
    <div
      style={{
        position: "absolute", left: SPACE.marginX, right: SPACE.marginX, top: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
    >
      <Img src={LOGO.shivansh()} style={{ height: 82, width: "auto", objectFit: "contain" }} />
      <Img src={LOGO.motu()} style={{ height: 58, width: "auto", objectFit: "contain" }} />
    </div>

    {/* headline */}
    <div style={{ position: "absolute", left: SPACE.marginX, right: SPACE.marginX, top: 152 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div style={{ width: 54, height: 5, background: COLORS.motuBlue, borderRadius: 3 }} />
        <span style={{ ...micro(25, 700, "0.22em"), color: COLORS.slate }}>
          The Architecture of Scale
        </span>
      </div>
      <div style={{ ...headline(78, 800), color: COLORS.ink, lineHeight: 1.0, maxWidth: 1500 }}>
        One standard. Two environments.
      </div>
    </div>

    {/* the two products, complete and uncropped */}
    <div
      style={{
        position: "absolute", left: SPACE.marginX, right: SPACE.marginX,
        top: 330, height: 520, display: "flex", gap: 46,
      }}
    >
      {([
        [14, "MOTU UltraLite-mk5", "The Agile Hub · 40 channels", PRICE.ultralite, COLORS.motuBlue],
        [25, "MOTU 828", "The Studio Anchor · 60 channels", PRICE.e828, COLORS.signal],
      ] as const).map(([idx, name, role, price, accent]) => (
        <div key={name} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              flex: 1, minHeight: 0, borderRadius: 22, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 18,
              background:
                `radial-gradient(120% 100% at 50% 32%, ${COLORS.paperLift} 0%, ${COLORS.paper} 52%, ${COLORS.paperEdge} 100%)`,
            }}
          >
            <Img
              src={img(idx)}
              style={{
                width: "100%", height: "100%",
                objectFit: "contain", // the complete unit, never cropped
                filter: `drop-shadow(0 20px 30px ${hexA(COLORS.ink, 0.18)})`,
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ ...micro(21, 800, "0.13em"), color: COLORS.ink }}>{name}</span>
              <span style={{ ...micro(16, 600, "0.12em"), color: COLORS.slate }}>{role}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ ...spec(42, 800, "-0.005em"), color: accent, lineHeight: 1 }}>{price}</span>
              <span style={{ ...micro(13, 600, "0.1em"), color: COLORS.slateDim }}>{PRICE.note}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* footer — website carries the best price */}
    <div
      style={{
        position: "absolute", left: SPACE.marginX, right: SPACE.marginX, bottom: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ ...spec(46, 800, "0.01em"), color: COLORS.motuBlue }}>{BRAND.website}</span>
        <span style={{ ...micro(17, 600, "0.14em"), color: COLORS.slate }}>
          {BRAND.role} · {BRAND.region}
        </span>
      </div>
      <div
        style={{
          ...subhead(23, 600), color: COLORS.inkSoft,
          background: hexA(COLORS.signalBright, 0.10),
          border: `1px solid ${hexA(COLORS.signal, 0.32)}`,
          padding: "11px 24px", borderRadius: 999, whiteSpace: "nowrap",
        }}
      >
        {PRICE.best}
      </div>
    </div>
  </AbsoluteFill>
);
