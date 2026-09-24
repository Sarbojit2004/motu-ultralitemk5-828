import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ACCENT, CONTACT, FONT, GROUND, INK, formatFor } from "../theme.ts";
import { LINEUP_3Q, img } from "../assets.ts";
import { SiteIcon, WhatsAppIcon } from "./Icons.tsx";

// ─────────────────────────────────────────────────────────────────────────────
// THE END SCREEN
//
// Six seconds on the reel, ten on the explainer, and the ONLY place any brand
// mark appears in either film. That is the instruction, and it is also the
// right call: branding sprinkled through five minutes asks a viewer to ignore
// it fifty times; branding withheld to the end arrives once, on a viewer who
// has already chosen to watch to the end.
//
// Both supplied logos are dark artwork on a white rounded plate with
// transparent corners — so on a dark ground they read as two deliberate white
// badges rather than as clipped rectangles, and no cream card is needed to
// rescue them. Checked on the files rather than assumed.
//
// Product images are allowed here and nowhere else, so the three front panels
// run across the top: the last thing seen is the range itself.
// ─────────────────────────────────────────────────────────────────────────────

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT.choose;
  const P = fmt.portrait;
  const S = W / (P ? 2160 : 3840);           // one scale factor, both formats

  const at = (d: number, dur = 16) =>
    spring({ frame: f - d, fps, config: { damping: 200, mass: 0.6 }, durationInFrames: dur });

  // A slow continuous push, so the end screen is never a frozen JPEG.
  const push = interpolate(f, [0, fmt.outroSeconds * fps], [1, 1.035], { extrapolateRight: "clamp" });


  const logoW = P ? 1180 * S : 980 * S;

  return (
    <AbsoluteFill style={{ background: GROUND.dark, overflow: "hidden" }}>
      {/* the room the card sits in — a single soft pool of the shared accent */}
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(120% 90% at 50% 34%, ${acc.glow}1A 0%, ${acc.glow}0A 38%, transparent 72%)`,
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: fmt.safe.top,
            paddingBottom: fmt.safe.bottom * (P ? 0.55 : 1),
            gap: P ? 64 * S : 40 * S,
          }}
        >
          {/* ── the range, one last time ───────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: P ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              gap: P ? 26 * S : 64 * S,
              opacity: at(0),
              transform: `translateY(${(1 - at(0)) * 40 * S}px)`,
            }}
          >
            {LINEUP_3Q.map(({ slug, rel }, i) => (
              <Img
                key={slug}
                src={staticFile(img(slug).file)}
                style={{
                  width: (P ? 880 : 700) * S * rel,
                  height: "auto",
                  opacity: interpolate(at(4 + i * 3), [0, 1], [0, 0.94]),
                  filter: `saturate(1.04) drop-shadow(0 ${10 * S}px ${18 * S}px rgba(0,0,0,0.5))`,
                }}
              />
            ))}
          </div>

          {/* ── the hairline ───────────────────────────────────────────── */}
          <div
            style={{
              width: (P ? 1180 : 1560) * S * at(14),
              height: Math.max(2, 3 * S),
              background: `linear-gradient(90deg, transparent, ${acc.glow}66 22%, ${acc.glow}66 78%, transparent)`,
            }}
          />

          {/* ── the two marks ──────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: P ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              gap: P ? 36 * S : 84 * S,
            }}
          >
            {["shivansh-logo", "motu-logo"].map((slug, i) => (
              <Img
                key={slug}
                src={staticFile(img(slug).file)}
                style={{
                  width: logoW,
                  height: "auto",
                  opacity: at(18 + i * 5),
                  transform: `translateY(${(1 - at(18 + i * 5)) * 26 * S}px)`,
                }}
              />
            ))}
          </div>

          {/* ── the designation, verbatim ──────────────────────────────── */}
          <div
            style={{
              textAlign: "center",
              opacity: at(30),
              transform: `translateY(${(1 - at(30)) * 20 * S}px)`,
              maxWidth: fmt.safe.w,
            }}
          >
            <div
              style={{
                fontFamily: FONT.display,
                fontSize: (P ? 52 : 44) * S,
                letterSpacing: 1.2 * S,
                lineHeight: 1.34,
                color: INK.onDark,
                textShadow: `0 ${3 * S}px 0 rgba(0,0,0,0.55)`,
              }}
            >
              {CONTACT.role}
            </div>
            <div
              style={{
                fontFamily: FONT.display,
                fontSize: (P ? 52 : 44) * S,
                letterSpacing: 1.2 * S,
                lineHeight: 1.34,
                color: acc.glow,
                textShadow: `0 ${3 * S}px 0 rgba(0,0,0,0.55)`,
              }}
            >
              {CONTACT.role2}
            </div>
          </div>

          {/* ── how to reach them ──────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: P ? 26 * S : 20 * S,
              opacity: at(40),
              transform: `translateY(${(1 - at(40)) * 18 * S}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 * S }}>
              <SiteIcon size={(P ? 52 : 44) * S} color={acc.glow} />
              <span
                style={{
                  fontFamily: FONT.display,
                  fontSize: (P ? 56 : 48) * S,
                  letterSpacing: 1.6 * S,
                  color: INK.onDark,
                }}
              >
                {CONTACT.site}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: P ? "column" : "row",
                alignItems: "center",
                gap: P ? 16 * S : 44 * S,
              }}
            >
              {CONTACT.whatsapp.map((n, i) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12 * S,
                    opacity: at(46 + i * 4),
                  }}
                >
                  <WhatsAppIcon size={(P ? 46 : 38) * S} color="#25D366" />
                  <span
                    style={{
                      fontFamily: FONT.display,
                      fontSize: (P ? 50 : 42) * S,
                      letterSpacing: 1.4 * S,
                      color: INK.onDarkSoft,
                    }}
                  >
                    {n}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                fontFamily: FONT.display,
                fontSize: (P ? 34 : 28) * S,
                letterSpacing: 6 * S,
                color: INK.onDarkDim,
                marginTop: 8 * S,
              }}
            >
              {CONTACT.city}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
