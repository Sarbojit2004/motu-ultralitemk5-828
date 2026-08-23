import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, SAFE, hexA } from "../theme";
import { FONT_FACE_CSS } from "../fonts";

/**
 * The page every scene sits on. Light ground, whole runtime, no exceptions.
 *
 * `flat` uses the lifted near-white for full-frame branding beats, so nothing
 * shows an edge behind the supplied logo artwork.
 */
export const Ground: React.FC<{ flat?: boolean; children?: React.ReactNode }> = ({
  flat = false,
  children,
}) => (
  <AbsoluteFill
    style={{
      background: flat
        ? COLORS.paperLift
        : `radial-gradient(130% 110% at 50% 8%, ${COLORS.paperLift} 0%, ${COLORS.paper} 52%, ${COLORS.paperEdge} 100%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Injected once at composition root so every scene has the self-hosted faces. */
export const FontFaces: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: FONT_FACE_CSS }} />
);

/**
 * Content frame. Everything critical — text, logos, callouts — lives inside the
 * AVB caption-safe zone (top 180 / bottom 220 / marginX 64), clear of the
 * platform UI that overlays a portrait video. Ambient imagery may still bleed to
 * the true edge, which is why this is a padded overlay rather than a clipping
 * container.
 */
export const Frame: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  padX?: number;
  padTop?: number;
  padBottom?: number;
  /** Explicit, because AbsoluteFill already sets flex-direction: column —
   *  `display:flex` alone silently keeps the column axis. */
  row?: boolean;
  /** Extra bottom gutter so flow content can never collide with the
   *  absolutely-positioned chapter tag or lower-third branding. */
  reserveBottom?: number;
}> = ({ children, style, padX = SAFE.marginX, padTop = SAFE.top, padBottom = SAFE.bottom, row = false, reserveBottom = 0 }) => (
  <AbsoluteFill
    style={{
      paddingLeft: padX,
      paddingRight: padX,
      paddingTop: padTop,
      paddingBottom: padBottom + reserveBottom,
      display: "flex",
      flexDirection: row ? "row" : "column",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** A soft seam that keeps full-bleed media from ending on a hard rectangle. */
export const EdgeFade: React.FC<{
  side?: "bottom" | "top" | "both";
  h?: number;
  /** Opacity at the very edge. 1 makes the band read as the page itself, which
   *  is what lets the supplied logos sit over full-bleed media without ever
   *  needing a box or plate behind them (Section 7). */
  strength?: number;
}> = ({ side = "bottom", h = 130, strength = 0.95 }) => (
  <>
    {(side === "top" || side === "both") && (
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 0, height: h,
          background: `linear-gradient(180deg, ${hexA(COLORS.paper, strength)} 0%, ${hexA(COLORS.paper, strength * 0.72)} 46%, ${hexA(COLORS.paper, 0)} 100%)`,
          pointerEvents: "none",
        }}
      />
    )}
    {(side === "bottom" || side === "both") && (
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: h,
          background: `linear-gradient(0deg, ${hexA(COLORS.paper, strength)} 0%, ${hexA(COLORS.paper, strength * 0.72)} 46%, ${hexA(COLORS.paper, 0)} 100%)`,
          pointerEvents: "none",
        }}
      />
    )}
  </>
);
