import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, SAFE, BRAND, PRICE, hexA } from "./theme";
import { subhead, micro, spec } from "./fonts";
import { inOut } from "./lib/anim";
import type { Beat } from "./schedule";
import { Ground, Frame, EdgeFade } from "./components/Shell";
import { Plate, MacroReveal, PortSweep, Drift, Montage, Clip, Scrim, Gimbal } from "./components/Media";
import { Eyebrow, Headline, Subhead, Editorial, MetricLockup, ChapterMark, Rise } from "./components/Type";
import { IOMatrix, GainSwell, Rule } from "./components/Graphics";
import { CornerBrand, LowerThird, BrandBeat, Logo, PriceLockup, Socials } from "./components/Brand";

/**
 * PORTRAIT LAYOUTS.
 *
 * These are not the landscape scenes rescaled. A 1080x1920 frame with a
 * 952x1520 safe area is a fundamentally different composition problem: the
 * long-form's side-by-side rows become vertical stacks, type runs larger
 * relative to the frame so it holds up at a glance on a phone, and montages run
 * one or two columns rather than three.
 *
 * Everything critical stays inside the AVB caption-safe zone (top 180 / bottom
 * 220 / marginX 64), pulled verbatim from the approved reels branch.
 */

const MX = SAFE.marginX;

/** Bottom gutter left clear for absolutely-positioned branding. */
const reserve = (b: Beat): number => (b.brand === "lower" ? 132 : 74);

const accentOf = (b: Beat): string =>
  b.accent === "signal" ? COLORS.signal
  : b.accent === "amber" ? COLORS.amber
  : b.accent === "alert" ? COLORS.alert
  : COLORS.motuBlue;

const Branding: React.FC<{ b: Beat }> = ({ b }) => {
  if (b.brand === "corner") return <CornerBrand marginX={MX} marginY={SAFE.top - 96} delay={8} logoH={62} />;
  if (b.brand === "lower") return <LowerThird marginX={MX} marginY={SAFE.bottom - 96} delay={8} logoH={72} />;
  return null;
};

const ChapterTag: React.FC<{ b: Beat }> = ({ b }) => (
  <div style={{ position: "absolute", left: MX, bottom: SAFE.bottom - 52 }}>
    <ChapterMark n={`0${b.chapter}`} title={b.chapterTitle} delay={10} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */

const ClipHero: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Clip idx={b.clip!} trim={b.trim} rate={b.rate} grade={b.grade} />
    {/* Portrait puts type in the lower third, so the scrim rises from the
        bottom rather than sweeping in from the side. */}
    <Scrim from="bottom" strength={0.95} />
    <EdgeFade side="top" h={SAFE.top + 40} strength={1} />
    <EdgeFade side="bottom" h={SAFE.bottom + 30} strength={1} />
    <Frame style={{ justifyContent: "flex-end", gap: 22 }} reserveBottom={reserve(b)}>
      {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
      {b.editorial ? <Editorial delay={10} size={82} maxWidth={SAFE.contentW}>{b.editorial}</Editorial> : null}
      {b.headline ? <Headline delay={10} size={72} style={{ maxWidth: SAFE.contentW }}>{b.headline}</Headline> : null}
      {b.sub ? <Subhead delay={20} size={38} maxWidth={SAFE.contentW}>{b.sub}</Subhead> : null}
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

/** The landscape split becomes a vertical stack: media on top, argument below. */
const ClipSplit: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 34 }} reserveBottom={reserve(b)}>
      <div
        style={{
          flex: "0 0 46%", borderRadius: 24, overflow: "hidden",
          boxShadow: `0 20px 46px ${hexA(COLORS.ink, 0.16)}`,
        }}
      >
        <Clip idx={b.clip!} trim={b.trim} rate={b.rate} grade={b.grade} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={8} size={72} style={{ maxWidth: SAFE.contentW }}>{b.headline}</Headline> : null}
        {b.body ? <Subhead delay={18} size={35} maxWidth={SAFE.contentW}>{b.body}</Subhead> : null}
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const Statement: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    {b.motu ? (
      <div style={{ position: "absolute", right: MX, top: SAFE.top - 90 }}>
        <Logo which="motu" height={50} delay={16} />
      </div>
    ) : null}
    <Frame style={{ justifyContent: "center", gap: 26 }} reserveBottom={reserve(b)}>
      {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
      {b.editorial ? <Editorial delay={10} size={96} maxWidth={SAFE.contentW}>{b.editorial}</Editorial> : null}
      {b.sub ? <Subhead delay={22} size={52} maxWidth={SAFE.contentW} weight={600}>{b.sub}</Subhead> : null}
      <Rise delay={32} y={12}><Rule w={160} /></Rise>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const HeroReveal: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 22 }} reserveBottom={reserve(b)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={8} size={78} style={{ maxWidth: SAFE.contentW }}>{b.headline}</Headline> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MacroReveal idx={b.img![0]} duration={b.durationInFrames}
                     fx={b.fx ?? 0.5} fy={b.fy ?? 0.5} macroScale={2.4} />
      </div>
      {b.sub ? <Subhead delay={26} size={32} maxWidth={SAFE.contentW}>{b.sub}</Subhead> : null}
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const HeroMacro: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 26 }} reserveBottom={reserve(b)}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MacroReveal idx={b.img![0]} duration={b.durationInFrames}
                     fx={b.fx ?? 0.5} fy={b.fy ?? 0.5} macroScale={2.2} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {b.eyebrow ? <Eyebrow delay={4} size={22} accent={accentOf(b)}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={8} size={70} style={{ maxWidth: SAFE.contentW }}>{b.headline}</Headline> : null}
        {b.sub ? <Subhead delay={20} size={32} maxWidth={SAFE.contentW}>{b.sub}</Subhead> : null}
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const HeroWide: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 22 }} reserveBottom={reserve(b)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={8} size={70} style={{ maxWidth: SAFE.contentW }}>{b.headline}</Headline> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Drift idx={b.img![0]} duration={b.durationInFrames} scaleFrom={1.0} scaleTo={1.045} />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const PortSweepScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 22 }} reserveBottom={reserve(b)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={8} size={70} style={{ maxWidth: SAFE.contentW }}>{b.headline}</Headline> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <PortSweep idx={b.img![0]} duration={b.durationInFrames} zoom={b.zoom ?? 2.4} />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const MontageScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 22 }} reserveBottom={reserve(b)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={8} size={64} style={{ maxWidth: SAFE.contentW }}>{b.headline}</Headline> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Montage items={(b.img ?? []).map((idx) => ({ idx }))}
                 duration={b.durationInFrames} cols={b.cols ?? 1} gap={18} />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const BadgeSpec: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ justifyContent: "center", gap: 40 }} reserveBottom={reserve(b)}>
      <div style={{ flex: "0 0 34%" }}>
        <Gimbal seed={3} amount={0.5}>
          <Plate idx={b.img![0]} style={{ width: "100%", height: "100%" }} />
        </Gimbal>
      </div>
      <MetricLockup metric={b.metric!} context={b.context!} narrative={b.narrative}
                    delay={10} size={132}
                    color={b.accent === "signal" ? COLORS.signal : COLORS.ink} />
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const MetricHero: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 26 }} reserveBottom={reserve(b)}>
      <MetricLockup metric={b.metric!} context={b.context!} narrative={b.narrative}
                    delay={6} size={148} />
      <div style={{ flex: 1, minHeight: 0 }}>
        <Drift idx={b.img![0]} duration={b.durationInFrames} scaleFrom={1.02} scaleTo={1.0} />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const IOMatrixScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 20 }} reserveBottom={reserve(b)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={8} size={104} style={{ maxWidth: SAFE.contentW }}>{b.headline}</Headline> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <IOMatrix duration={b.durationInFrames} width={SAFE.contentW} height={620}
                  ins={b.ins ?? 18} outs={b.outs ?? 22} delay={12} accent={accentOf(b)} />
      </div>
      {b.img?.length ? (
        <div style={{ height: 120 }}>
          <Plate idx={b.img[0]} style={{ width: "100%", height: "100%" }} />
        </div>
      ) : null}
      {b.sub ? <Subhead delay={26} size={32} maxWidth={SAFE.contentW}>{b.sub}</Subhead> : null}
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const GainSwellScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ gap: 24 }} reserveBottom={reserve(b)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {b.eyebrow ? <Eyebrow delay={4} size={22} accent={COLORS.amber}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={8} size={128}>{b.headline}</Headline> : null}
        {b.sub ? <Subhead delay={20} size={34} maxWidth={SAFE.contentW}>{b.sub}</Subhead> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <GainSwell duration={b.durationInFrames} width={SAFE.contentW} height={620} delay={10} />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const BrandBeatScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ justifyContent: "center" }}>
      <BrandBeat delay={6} showMotu={b.motu} showSocials={b.socials} compact />
    </Frame>
  </AbsoluteFill>
);

const PriceBeat: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ justifyContent: "center", alignItems: "center", gap: 32 }} reserveBottom={reserve(b)}>
      {b.eyebrow ? <Eyebrow delay={4} size={22}>{b.eyebrow}</Eyebrow> : null}
      <PriceLockup delay={10} size={62} stacked />
      <Rise delay={34} y={12}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Logo which="shivansh" height={72} delay={38} />
          <div style={{ ...spec(38, 800, "0.01em"), color: COLORS.motuBlue }}>{BRAND.website}</div>
        </div>
      </Rise>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const Outro: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ justifyContent: "center", alignItems: "center", gap: 22 }}>
      <Logo which="shivansh" height={120} delay={4} />
      <Rise delay={12} y={12}>
        <div style={{ ...micro(19, 700, "0.16em"), color: COLORS.slate, textAlign: "center", maxWidth: SAFE.contentW }}>
          {BRAND.role}
        </div>
      </Rise>
      <Rise delay={16} y={10}>
        <div style={{ ...micro(19, 700, "0.2em"), color: COLORS.slateDim }}>{BRAND.region}</div>
      </Rise>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 6 }}>
        {([["MOTU UltraLite-mk5", PRICE.ultralite, COLORS.motuBlue],
           ["MOTU 828", PRICE.e828, COLORS.signal]] as const).map(([n, p, a], i) => (
          <Rise key={n} delay={20 + i * 6} y={14}>
            <div
              style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16,
                padding: "16px 24px", background: COLORS.paperLift,
                border: `1px solid ${COLORS.line}`, borderLeft: `6px solid ${a}`, borderRadius: 14,
              }}
            >
              <span style={{ ...micro(18, 700, "0.13em"), color: COLORS.slate }}>{n}</span>
              <span style={{ ...spec(40, 800, "-0.005em"), color: COLORS.ink }}>{p}</span>
            </div>
          </Rise>
        ))}
      </div>
      <Rise delay={34} y={10}>
        <div style={{ ...micro(16, 600, "0.12em"), color: COLORS.slateDim }}>{PRICE.note}</div>
      </Rise>
      <Rise delay={38} y={12}>
        <div style={{ ...spec(50, 800, "0.01em"), color: COLORS.motuBlue }}>{BRAND.website}</div>
      </Rise>
      <Rise delay={42} y={10}>
        <div
          style={{
            ...subhead(23, 600), color: COLORS.inkSoft,
            background: hexA(COLORS.signalBright, 0.09),
            border: `1px solid ${hexA(COLORS.signal, 0.3)}`,
            padding: "9px 20px", borderRadius: 999, textAlign: "center",
          }}
        >
          {PRICE.best}
        </div>
      </Rise>
      {b.socials ? <Socials delay={48} size={21} column /> : null}
      {b.motu ? <Logo which="motu" height={52} delay={54} style={{ marginTop: 4 }} /> : null}
    </Frame>
  </AbsoluteFill>
);

/* ══════════════════════════════════════════════════════════════════════════ */

const KINDS: Record<string, React.FC<{ b: Beat }>> = {
  clipHero: ClipHero,
  clipSplit: ClipSplit,
  statement: Statement,
  heroReveal: HeroReveal,
  heroMacro: HeroMacro,
  heroWide: HeroWide,
  portSweep: PortSweepScene,
  montage: MontageScene,
  badgeSpec: BadgeSpec,
  metricHero: MetricHero,
  ioMatrix: IOMatrixScene,
  gainSwell: GainSwellScene,
  brandBeat: BrandBeatScene,
  priceBeat: PriceBeat,
  outro: Outro,
};

export const Scene: React.FC<{ b: Beat }> = ({ b }) => {
  const frame = useCurrentFrame();
  const C = KINDS[b.kind];
  if (!C) throw new Error(`unknown scene kind "${b.kind}" on beat ${b.id}`);
  // Portrait cuts faster than the long-form, so the crossfades are shorter —
  // the AVB reels TIMING values rather than the long-form ones.
  const o = inOut(frame, b.durationInFrames, 10, 9);
  const flat = b.kind === "brandBeat" || b.kind === "outro";
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Ground flat={flat}>
        <C b={b} />
        {b.kind !== "brandBeat" && b.kind !== "outro" && b.brand !== "lower"
          ? <ChapterTag b={b} /> : null}
      </Ground>
    </AbsoluteFill>
  );
};
