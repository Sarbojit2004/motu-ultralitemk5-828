import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, SPACE, BRAND, PRICE, hexA } from "./theme";
import { subhead, micro, spec } from "./fonts";
import { EASE, inOut, ramp } from "./lib/anim";
import type { Beat } from "./schedule";
import { Ground, Frame, EdgeFade } from "./components/Shell";
import {
  Plate, MacroReveal, PortSweep, Drift, Montage, Clip, Scrim, Gimbal,
} from "./components/Media";
import {
  Eyebrow, Headline, Subhead, Editorial, MetricLockup, ChapterMark, Rise,
} from "./components/Type";
import { ConversionWave, IOMatrix, GainSwell, Rule } from "./components/Graphics";
import { CornerBrand, LowerThird, BrandBeat, Logo, PriceLockup, Socials } from "./components/Brand";

const MX = SPACE.marginX;
const MY = SPACE.marginY;

/** Bottom gutter a scene must leave clear for its absolutely-positioned
 *  branding: a lower-third lockup is taller than a chapter tag. */
const reserve = (b: Beat): number => (b.brand === "lower" ? 116 : 68);

/** Headline width for top-aligned scenes. A corner brand lockup occupies the
 *  top-right, so a full-width headline would run underneath it. */
const headW = (b: Beat): number => (b.brand === "corner" ? 1370 : SPACE.contentW);

const accentOf = (b: Beat): string =>
  b.accent === "signal" ? COLORS.signal
  : b.accent === "amber" ? COLORS.amber
  : b.accent === "alert" ? COLORS.alert
  : COLORS.motuBlue;

/** Branding overlay for a beat, per its `brand` field. */
const Branding: React.FC<{ b: Beat }> = ({ b }) => {
  if (b.brand === "corner") return <CornerBrand marginX={MX} marginY={MY} delay={10} />;
  if (b.brand === "lower") return <LowerThird marginX={MX} marginY={MY} delay={10} />;
  return null;
};

/** MOTU mark, used at a noticeably lower frequency than Shivansh.
 *  Bottom-right: the top-left carries the eyebrow and the top-right the
 *  Shivansh corner lockup, so this is the only corner that is always free. */
const MotuMark: React.FC<{ delay?: number }> = ({ delay = 14 }) => (
  <div style={{ position: "absolute", right: MX, bottom: MY }}>
    <Logo which="motu" height={48} delay={delay} />
  </div>
);

const ChapterTag: React.FC<{ b: Beat }> = ({ b }) => (
  <div style={{ position: "absolute", left: MX, bottom: MY }}>
    <ChapterMark n={`0${b.chapter}`} title={b.chapterTitle} delay={12} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */

const ClipHero: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Clip idx={b.clip!} trim={b.trim} rate={b.rate} grade={b.grade} />
    <Scrim from="left" strength={0.93} />
    {/* Full-strength top/bottom bands: the supplied logos carry their own
        white ground, so branding must sit on the PAGE, never over video —
        otherwise that ground reads as a plate (Section 7). */}
    <EdgeFade side="top" h={205} strength={1} />
    <EdgeFade side="bottom" h={150} strength={1} />
    <Frame style={{ flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 1020 }}>
        {b.eyebrow ? <Eyebrow delay={6}>{b.eyebrow}</Eyebrow> : null}
        {b.editorial ? <Editorial delay={12} size={80} maxWidth={980}>{b.editorial}</Editorial> : null}
        {b.headline ? <Headline delay={12} size={96}>{b.headline}</Headline> : null}
        {b.sub ? <Subhead delay={24} size={34} maxWidth={860}>{b.sub}</Subhead> : null}
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const ClipSplit: React.FC<{ b: Beat }> = ({ b }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, 4, 24, EASE.out);
  return (
    <AbsoluteFill>
      <Frame row reserveBottom={reserve(b)} style={{ alignItems: "center", gap: 56 }}>
        <div style={{ flex: "0 0 46%", display: "flex", flexDirection: "column", gap: 24 }}>
          {b.eyebrow ? <Eyebrow delay={6}>{b.eyebrow}</Eyebrow> : null}
          {b.headline ? <Headline delay={10} size={82}>{b.headline}</Headline> : null}
          {b.body ? <Subhead delay={22} size={33} maxWidth={720}>{b.body}</Subhead> : null}
          {b.sub ? <Subhead delay={30} size={27} maxWidth={720}>{b.sub}</Subhead> : null}
        </div>
        <div
          style={{
            flex: 1, height: "82%", borderRadius: 26, overflow: "hidden",
            opacity: t, transform: `translateX(${(1 - t) * 26}px)`,
            boxShadow: `0 22px 54px ${hexA(COLORS.ink, 0.16)}`,
          }}
        >
          <Clip idx={b.clip!} trim={b.trim} rate={b.rate} grade={b.grade} />
        </div>
      </Frame>
      <Branding b={b} />
    </AbsoluteFill>
  );
};

const Statement: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    {b.brand === "beat" ? (
      <Frame style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 34 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center", textAlign: "center" }}>
          {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
          {b.editorial ? <Editorial delay={10} size={86} maxWidth={1480}>{b.editorial}</Editorial> : null}
          {b.sub ? <Subhead delay={24} size={40} maxWidth={1180}>{b.sub}</Subhead> : null}
        </div>
        <Rule delay={34} w={180} />
        <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 6 }}>
          <Logo which="shivansh" height={92} delay={40} />
          {b.motu ? <Logo which="motu" height={56} delay={46} /> : null}
        </div>
        <Rise delay={52} y={10}>
          <div style={{ ...spec(34, 800, "0.01em"), color: COLORS.motuBlue }}>{BRAND.website}</div>
        </Rise>
      </Frame>
    ) : (
      <Frame reserveBottom={reserve(b)} style={{ justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1440 }}>
          {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
          {b.editorial ? <Editorial delay={10} size={88}>{b.editorial}</Editorial> : null}
          {b.headline ? <Headline delay={10} size={104} style={{ maxWidth: headW(b) }}>{b.headline}</Headline> : null}
          {b.sub ? <Subhead delay={24} size={38}>{b.sub}</Subhead> : null}
        </div>
        <Branding b={b} />
      </Frame>
    )}
  </AbsoluteFill>
);

const ChapterOpen: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    {b.bedClip != null ? (
      <>
        <AbsoluteFill style={{ opacity: 0.24 }}>
          <Clip idx={b.bedClip} trim={b.bedTrim} rate={b.bedRate} grade="desat" />
        </AbsoluteFill>
        <Scrim from="full" strength={0.62} />
      </>
    ) : null}
    <Frame style={{ flexDirection: "column", justifyContent: "center", gap: 20 }}>
      {b.eyebrow ? <Eyebrow delay={4} size={28}>{b.eyebrow}</Eyebrow> : null}
      {b.headline ? <Headline delay={10} size={132}>{b.headline}</Headline> : null}
      {b.sub ? <Subhead delay={26} size={40} maxWidth={1280}>{b.sub}</Subhead> : null}
      <Rise delay={36} y={12}><Rule w={200} /></Rise>
    </Frame>
    {b.motu ? <div style={{ position: "absolute", right: MX, bottom: MY }}><Logo which="motu" height={54} delay={30} /></div> : null}
    <Branding b={b} />
  </AbsoluteFill>
);

const HeroReveal: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame reserveBottom={reserve(b)} style={{ gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={10} size={72} style={{ maxWidth: headW(b) }}>{b.headline}</Headline> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, marginTop: 6 }}>
        <MacroReveal
          idx={b.img![0]}
          duration={b.durationInFrames}
          fx={b.fx ?? 0.5}
          fy={b.fy ?? 0.5}
          macroScale={2.7}
        />
      </div>
      {b.sub ? <Subhead delay={30} size={30} maxWidth={1400}>{b.sub}</Subhead> : null}
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const HeroMacro: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame row reserveBottom={reserve(b)} style={{ alignItems: "center", gap: 52 }}>
      <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", gap: 20 }}>
        {b.eyebrow ? <Eyebrow delay={4} accent={accentOf(b)}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={10} size={70}>{b.headline}</Headline> : null}
        {b.sub ? <Subhead delay={24} size={29} maxWidth={640}>{b.sub}</Subhead> : null}
      </div>
      <div style={{ flex: 1, height: "80%" }}>
        <MacroReveal
          idx={b.img![0]}
          duration={b.durationInFrames}
          fx={b.fx ?? 0.5}
          fy={b.fy ?? 0.5}
          macroScale={2.4}
        />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const HeroWide: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame reserveBottom={reserve(b)} style={{ gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={10} size={76} style={{ maxWidth: headW(b) }}>{b.headline}</Headline> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Drift idx={b.img![0]} duration={b.durationInFrames} scaleFrom={1.0} scaleTo={1.045} />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const PortSweepScene: React.FC<{ b: Beat }> = ({ b }) => {
  const frame = useCurrentFrame();
  const revealed = frame > b.durationInFrames * 0.72;
  return (
    <AbsoluteFill>
      <Frame reserveBottom={reserve(b)} style={{ gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
          {b.headline ? <Headline delay={10} size={68} style={{ maxWidth: headW(b) }}>{b.headline}</Headline> : null}
        </div>
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <PortSweep idx={b.img![0]} duration={b.durationInFrames} zoom={b.zoom ?? 2.6} />
        </div>
        {/* Callouts land only once the sweep has resolved to the whole unit, so
            a label never points at something that is off-frame. */}
        <div style={{ height: 54, position: "relative" }}>
          {(b.callouts ?? []).map(([label, at], i) =>
            revealed ? (
              <div key={label} style={{ position: "absolute", left: `${at * 100}%`, top: 0, transform: "translateX(-50%)" }}>
                <Rise delay={Math.round(b.durationInFrames * 0.72) + i * 4} y={10}>
                  <span
                    style={{
                      ...micro(19, 700, "0.13em"),
                      color: COLORS.ink,
                      background: hexA(COLORS.paperLift, 0.95),
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 8, padding: "7px 13px", whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                </Rise>
              </div>
            ) : null
          )}
        </div>
      </Frame>
      <Branding b={b} />
    </AbsoluteFill>
  );
};

const MontageScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame reserveBottom={reserve(b)} style={{ gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={10} size={66} style={{ maxWidth: headW(b) }}>{b.headline}</Headline> : null}
        {b.sub ? <Subhead delay={22} size={27} maxWidth={1400}>{b.sub}</Subhead> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Montage
          items={(b.img ?? []).map((idx) => ({ idx }))}
          duration={b.durationInFrames}
          cols={b.cols}
        />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const Compare: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame reserveBottom={reserve(b)} style={{ gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
        {b.sub ? <Subhead delay={18} size={30} maxWidth={1400}>{b.sub}</Subhead> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 34 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <Gimbal seed={i * 5} amount={0.5}>
                <Plate idx={b.img![i]} style={{ width: "100%", height: "100%" }} />
              </Gimbal>
            </div>
            <Rise delay={16 + i * 6} y={10}>
              <div
                style={{
                  ...micro(21, 700, "0.15em"),
                  color: i === 0 ? COLORS.motuBlue : COLORS.signal,
                  textAlign: "center",
                }}
              >
                {i === 0 ? b.leftLabel : b.rightLabel}
              </div>
            </Rise>
          </div>
        ))}
      </div>
    </Frame>
    {b.motu ? <MotuMark delay={20} /> : null}
    <Branding b={b} />
  </AbsoluteFill>
);

const BadgeSpec: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame row reserveBottom={reserve(b)} style={{ alignItems: "center", gap: 60 }}>
      <div style={{ flex: "0 0 38%", height: "58%" }}>
        <Gimbal seed={3} amount={0.5}>
          <Plate idx={b.img![0]} style={{ width: "100%", height: "100%" }} />
        </Gimbal>
      </div>
      <div style={{ flex: 1 }}>
        <MetricLockup
          metric={b.metric!}
          context={b.context!}
          narrative={b.narrative}
          delay={10}
          color={b.accent === "signal" ? COLORS.signal : COLORS.ink}
          size={150}
        />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const MetricHero: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame reserveBottom={reserve(b)} style={{ gap: 18 }}>
      <MetricLockup
        metric={b.metric!}
        context={b.context!}
        narrative={b.narrative}
        delay={6}
        size={190}
      />
      <div style={{ flex: 1, minHeight: 0, marginTop: 4 }}>
        <Drift idx={b.img![0]} duration={b.durationInFrames} scaleFrom={1.02} scaleTo={1.0} />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const MetricPair: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame reserveBottom={reserve(b)} style={{ gap: 20 }}>
      {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", gap: 56 }}>
        {([b.left!, b.right!] as [string, string][]).map((pair, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <MetricLockup
              metric={pair[0]}
              context={pair[1]}
              delay={8 + i * 10}
              size={168}
              align="center"
              color={i === 0 ? COLORS.motuBlue : COLORS.signal}
            />
          </div>
        ))}
        {b.img?.length ? (
          <div style={{ flex: "0 0 22%", height: "48%" }}>
            <Gimbal seed={7} amount={0.45}>
              <Plate idx={b.img[0]} style={{ width: "100%", height: "100%" }} />
            </Gimbal>
          </div>
        ) : null}
      </div>
      {b.sub ? <Subhead delay={30} size={28} maxWidth={1500}>{b.sub}</Subhead> : null}
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const ConversionWaveScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    {b.bedClip != null ? (
      <>
        <AbsoluteFill style={{ opacity: 0.17 }}>
          <Clip idx={b.bedClip} trim={b.bedTrim} rate={b.bedRate} grade="desat" />
        </AbsoluteFill>
        <Scrim from="full" strength={0.7} />
      </>
    ) : null}
    <Frame reserveBottom={reserve(b)} style={{ gap: 14 }}>
      {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
      {b.headline ? <Headline delay={10} size={78} style={{ maxWidth: headW(b) }}>{b.headline}</Headline> : null}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <ConversionWave duration={b.durationInFrames} width={SPACE.contentW} height={520} delay={16} />
      </div>
      {b.sub ? <Subhead delay={34} size={30} maxWidth={1400}>{b.sub}</Subhead> : null}
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const IOMatrixScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame reserveBottom={reserve(b)} style={{ gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
          {b.headline ? <Headline delay={10} size={104} style={{ maxWidth: headW(b) }}>{b.headline}</Headline> : null}
        </div>
        {b.img?.length ? (
          <div style={{ flex: "0 0 34%", height: 150 }}>
            <Plate idx={b.img[0]} style={{ width: "100%", height: "100%" }} />
          </div>
        ) : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative", marginTop: 34 }}>
        <IOMatrix
          duration={b.durationInFrames}
          width={SPACE.contentW}
          height={430}
          ins={b.ins ?? 18}
          outs={b.outs ?? 22}
          delay={14}
          accent={accentOf(b)}
        />
      </div>
      {b.sub ? <Subhead delay={32} size={30} maxWidth={1500}>{b.sub}</Subhead> : null}
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const GainSwellScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame row reserveBottom={reserve(b)} style={{ alignItems: "center", paddingTop: 92, gap: 50 }}>
      <div style={{ flex: "0 0 46%", display: "flex", flexDirection: "column", gap: 22 }}>
        {b.eyebrow ? <Eyebrow delay={4} accent={COLORS.amber}>{b.eyebrow}</Eyebrow> : null}
        {b.headline ? <Headline delay={10} size={112} style={{ color: COLORS.ink }}>{b.headline}</Headline> : null}
        {b.sub ? <Subhead delay={26} size={31} maxWidth={720}>{b.sub}</Subhead> : null}
      </div>
      <div style={{ flex: 1, height: "88%", position: "relative" }}>
        <GainSwell duration={b.durationInFrames} width={860} height={780} delay={12} />
      </div>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const BrandBeatScene: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame>
      <BrandBeat delay={6} showMotu={b.motu} showSocials={b.socials} />
    </Frame>
  </AbsoluteFill>
);

const PriceBeat: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 34 }}>
      {b.eyebrow ? <Eyebrow delay={4}>{b.eyebrow}</Eyebrow> : null}
      <PriceLockup delay={12} />
      <Rise delay={40} y={12}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Logo which="shivansh" height={74} delay={44} />
          <div style={{ ...spec(34, 800, "0.01em"), color: COLORS.motuBlue }}>{BRAND.website}</div>
        </div>
      </Rise>
    </Frame>
    <Branding b={b} />
  </AbsoluteFill>
);

const ContactBeat: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 30 }}>
      <Logo which="shivansh" height={132} delay={6} />
      <Rise delay={14} y={12}>
        <div style={{ ...subhead(32, 600), color: COLORS.inkSoft, textAlign: "center", maxWidth: 1400 }}>
          {BRAND.role}
        </div>
      </Rise>
      <Rise delay={20} y={10}>
        <div style={{ ...micro(23, 700, "0.2em"), color: COLORS.slate }}>{BRAND.region}</div>
      </Rise>
      <Rise delay={26} y={12}>
        <div style={{ ...spec(56, 800, "0.01em"), color: COLORS.motuBlue }}>{BRAND.website}</div>
      </Rise>
      <Rise delay={32} y={10}>
        <div
          style={{
            ...subhead(25, 600), color: COLORS.inkSoft,
            background: hexA(COLORS.signalBright, 0.09),
            border: `1px solid ${hexA(COLORS.signal, 0.3)}`,
            padding: "10px 24px", borderRadius: 999,
          }}
        >
          {PRICE.best}
        </div>
      </Rise>
      <Socials delay={40} size={26} />
    </Frame>
  </AbsoluteFill>
);

const Outro: React.FC<{ b: Beat }> = ({ b }) => (
  <AbsoluteFill>
    <Frame style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
        <Logo which="shivansh" height={118} delay={4} />
        <div style={{ width: 2, height: 92, background: COLORS.line }} />
        <Logo which="motu" height={72} delay={10} />
      </div>
      <Rise delay={16} y={12}>
        <div style={{ ...micro(21, 700, "0.2em"), color: COLORS.slate, textAlign: "center" }}>
          {BRAND.role} · {BRAND.region}
        </div>
      </Rise>
      <div style={{ display: "flex", gap: 26, marginTop: 4 }}>
        {([["MOTU UltraLite-mk5", PRICE.ultralite, COLORS.motuBlue],
           ["MOTU 828", PRICE.e828, COLORS.signal]] as const).map(([n, p, a], i) => (
          <Rise key={n} delay={22 + i * 6} y={14}>
            <div
              style={{
                display: "flex", flexDirection: "column", gap: 6,
                padding: "16px 30px", background: COLORS.paperLift,
                border: `1px solid ${COLORS.line}`, borderLeft: `6px solid ${a}`,
                borderRadius: 14, minWidth: 400,
              }}
            >
              <span style={{ ...micro(18, 700, "0.15em"), color: COLORS.slate }}>{n}</span>
              <span style={{ ...spec(46, 800, "-0.005em"), color: COLORS.ink }}>{p}</span>
              <span style={{ ...micro(15, 600, "0.12em"), color: COLORS.slateDim }}>{PRICE.note}</span>
            </div>
          </Rise>
        ))}
      </div>
      <Rise delay={36} y={12}>
        <div style={{ ...spec(62, 800, "0.01em"), color: COLORS.motuBlue }}>{BRAND.website}</div>
      </Rise>
      <Rise delay={42} y={10}>
        <div style={{ ...subhead(24, 600), color: COLORS.inkSoft }}>{PRICE.best}</div>
      </Rise>
      {b.socials ? <Socials delay={48} size={23} /> : null}
    </Frame>
  </AbsoluteFill>
);

/* ══════════════════════════════════════════════════════════════════════════ */

const KINDS: Record<string, React.FC<{ b: Beat }>> = {
  clipHero: ClipHero,
  clipSplit: ClipSplit,
  statement: Statement,
  chapterOpen: ChapterOpen,
  heroReveal: HeroReveal,
  heroMacro: HeroMacro,
  heroWide: HeroWide,
  portSweep: PortSweepScene,
  montage: MontageScene,
  compare: Compare,
  badgeSpec: BadgeSpec,
  metricHero: MetricHero,
  metricPair: MetricPair,
  conversionWave: ConversionWaveScene,
  ioMatrix: IOMatrixScene,
  gainSwell: GainSwellScene,
  brandBeat: BrandBeatScene,
  priceBeat: PriceBeat,
  contactBeat: ContactBeat,
  outro: Outro,
};

/** One beat, faded in and out so no cut ever pops. */
export const Scene: React.FC<{ b: Beat }> = ({ b }) => {
  const frame = useCurrentFrame();
  const C = KINDS[b.kind];
  if (!C) throw new Error(`unknown scene kind "${b.kind}" on beat ${b.id}`);
  const o = inOut(frame, b.durationInFrames, 14, 12);
  const flat = b.kind === "brandBeat" || b.kind === "contactBeat" || b.kind === "outro";
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Ground flat={flat}>
        <C b={b} />
        {b.kind !== "chapterOpen" && b.kind !== "brandBeat" && b.kind !== "contactBeat"
          && b.kind !== "outro" && b.brand !== "lower" ? <ChapterTag b={b} /> : null}
      </Ground>
    </AbsoluteFill>
  );
};
