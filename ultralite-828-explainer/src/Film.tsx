import React from "react";
import {
  AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { ACCENT, GROUND, INK, FONT, TYPE_OPACITY, formatFor } from "./theme.ts";
import { dimFor } from "./assets.ts";
import { filmFor } from "./films.ts";
import { Caption } from "./components/Caption.tsx";
import { TransitionIn, transitionFor } from "./components/Transitions.tsx";
import {
  BleedShot, ClipBleed, ClipRow, DetailZoom, MosaicBleed, PanelPlate, ProductPlate, StackBleed,
} from "./components/Staged.tsx";
import { Outro } from "./components/Outro.tsx";
import { FilmTimeline, ProductRule } from "./components/Chrome.tsx";
import { Graphic } from "./components/Graphics.tsx";
import { FONT_FACE_CSS } from "./fonts.ts";

// ─────────────────────────────────────────────────────────────────────────────
// THE FILM
//
// Three layers, in this order and no other:
//
//   1. PICTURE     one staged shot at a time, each arriving on its own
//                  transition. Full bleed, always — nothing letterboxed, no
//                  ground showing through, and no picture ever sliced.
//   2. TYPE        the caption lockup, and in the landscape film a chapter tag
//                  and a progress rule. The WHOLE layer is set to TYPE_OPACITY
//                  in one place, here, so no part of it can drift out of step
//                  with another.
//   3. SOUND       the mastered bed and the mastered transition layer, both at
//                  volume 1. They were levelled against each other in
//                  scripts/gen_audio.py; a multiplier here would undo that
//                  silently, which is exactly the bug that is hard to hear.
//
// The end screen is a Sequence of its own at the very end, outside the type
// layer, because it is the one place branding is allowed and it carries its own
// opacity.
// ─────────────────────────────────────────────────────────────────────────────

/** How present the demonstratives are. Deliberately above TYPE_OPACITY. */
const GRAPHIC_OPACITY = 0.88;
/** The longest a demonstrative holds before the picture moves on. */
const GRAPHIC_MAX_SECONDS = 4.5;

const Shot: React.FC<{ shot: ReturnType<typeof filmFor>["shots"][number]; fps: number }> = ({ shot, fps }) => {
  // The Sequence this sits inside has ALREADY rebased useCurrentFrame() to 0 at
  // the shot's first frame. Subtracting the absolute start frame again drove f
  // negative for the whole shot and clamped p to 0, which froze every camera
  // move — the push, the pull, the track, the orbit, the drift and the focus
  // ramp all stayed at their opening value. The films played as stills that
  // changed on a transition. This is the same mistake the caption layer had.
  const f = useCurrentFrame();
  const len = Math.max(1, Math.round((shot.end - shot.start) * fps));
  const p = Math.min(1, Math.max(0, f / len));
  const base = { accent: shot.accentKey, p, f, seed: shot.seed };

  switch (shot.kind) {
    case "clip":
      return <ClipBleed {...base} clip={shot.clip!} fromSeconds={shot.from} rate={shot.rate} />;
    case "cliprow":
      return <ClipRow {...base} clips={shot.clips!} />;
    case "plate":
      return <ProductPlate {...base} asset={shot.asset!} />;
    case "panel":
      return <PanelPlate {...base} asset={shot.asset!} />;
    case "detail":
      return (
        <DetailZoom
          {...base}
          asset={shot.regionAsset!}
          region={shot.region!.rect}
          dim={dimFor(shot.region!.name)}
        />
      );
    case "stack":
      return <StackBleed {...base} assets={shot.assets!} />;
    case "mosaic":
      return <MosaicBleed {...base} assets={shot.assets!} />;
    default:
      return <BleedShot {...base} asset={shot.asset!} />;
  }
};

export const Film: React.FC = () => {
  const { width: W, height: H, fps } = useVideoConfig();
  const fmt = formatFor(W, H);
  const film = filmFor(W, H);
  const frame = useCurrentFrame();
  const P = fmt.portrait;
  const S = W / (P ? 2160 : 3840);

  const speechEndF = Math.round(film.speechEnd * fps);

  // Which chapter are we in — only the landscape film shows it.
  const now = frame / fps;
  const seg = film.segments.find((s) => now >= s.start && now < s.end + 0.4) ?? film.segments[0];
  const acc = ACCENT[seg.accent];

  return (
    <AbsoluteFill style={{ background: GROUND.dark }}>
      <style>{FONT_FACE_CSS}</style>

      {/* ── 1. PICTURE ───────────────────────────────────────────────── */}
      <Sequence durationInFrames={speechEndF}>
        <AbsoluteFill>
          {film.shots.map((shot, i) => {
            const from = Math.round(shot.start * fps);
            const dur = Math.max(1, Math.round(shot.end * fps) - from);
            const kind = transitionFor(shot.seed, shot.boundary, i === 0);
            return (
              <Sequence key={i} from={from} durationInFrames={dur} layout="none">
                <TransitionInWrap kind={kind} accent={ACCENT[shot.accentKey].glow}>
                  <Shot shot={shot} fps={fps} />
                </TransitionInWrap>
              </Sequence>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* ── 1b. DEMONSTRATIVES — animated over the picture, on the shot's
             own clock, so a graphic draws itself while the voice is saying the
             number rather than beside it. Part of the type layer's opacity
             budget, so it is never brighter than the words. ─────────────── */}
      <Sequence durationInFrames={speechEndF}>
        {/* NO opacity on this AbsoluteFill. An opacity on a full-frame element
            makes Chromium rasterise a separate 2160x3840 surface and composite
            it EVERY frame, whether or not anything is drawn into it — and this
            layer is empty for two thirds of the film. Measured: it roughly
            quadrupled the render. The opacity now sits on the panel itself,
            which is a small box. */}
        <AbsoluteFill>
          {film.shots.filter((sh) => sh.graphic).map((sh, i) => {
            const from = Math.round(sh.start * fps);
            // Run to the end of the chapter, capped, so a graphic pinned to a
            // three-quarter-second caption still has room to draw and hold.
            const end = Math.min(sh.chapterEnd, sh.start + GRAPHIC_MAX_SECONDS);
            const dur = Math.max(Math.round(sh.end * fps) - from, Math.round(end * fps) - from);
            return (
              <Sequence key={`g-${i}`} from={from} durationInFrames={Math.max(1, dur)}>
                <GraphicSlot shot={sh} fps={fps} lengthFrames={Math.max(1, dur)} />
              </Sequence>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* ── 2. TYPE — the entire layer at 64%, set once ──────────────── */}
      <Sequence durationInFrames={speechEndF}>
        {/* No opacity here either, for the same reason as the graphics layer:
            a full-frame opacity is a full-frame rasterisation every frame. The
            children below never overlap each other, so carrying it on each of
            them is visually identical and one composite cheaper. */}
        <AbsoluteFill>
          {film.segments.map((s) =>
            s.captions.map((c) => {
              const from = Math.round(c.start * fps);
              const dur = Math.max(1, Math.round(c.end * fps) - from);
              return (
                <Sequence key={`${s.id}-${c.i}`} from={from} durationInFrames={dur}>
                  {/* A Sequence rebases useCurrentFrame() to 0, so the caption's
                      own clock starts at 0 too — passing the absolute frame here
                      drives every spring far negative and the whole lockup
                      renders at zero opacity. */}
                  <AbsoluteFill
                    style={{
                      opacity: TYPE_OPACITY,
                      paddingLeft: fmt.safe.left,
                      paddingRight: fmt.safe.right,
                      paddingBottom: fmt.safe.bottom,
                      paddingTop: fmt.safe.top,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                    }}
                  >
                    <Caption caption={c} startFrame={0} accent={s.accent} width={fmt.safe.w} />
                  </AbsoluteFill>
                </Sequence>
              );
            }),
          )}

          {/* The standing chrome, in BOTH formats. The earlier films carried
              this and its absence was the first thing noticed: a viewer landing
              on a random frame could not tell which chapter they were in, and a
              five-minute film gave no sense of how much was left. */}
          <ProductRule
            opacity={TYPE_OPACITY}
            accent={seg.accent}
            name={seg.chapter}
            spec={seg.spec}
            progress={Math.min(1, Math.max(0, (now - seg.start) / Math.max(0.001, seg.end - seg.start)))}
            f={frame - Math.round(seg.start * fps)}
          />
          <FilmTimeline
            opacity={TYPE_OPACITY}
            accent={seg.accent}
            progress={frame / speechEndF}
            marks={film.segments.slice(1).map((sg) => sg.start / film.speechEnd)}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ── the end screen ───────────────────────────────────────────── */}
      <Sequence from={speechEndF} durationInFrames={Math.round(film.outroSeconds * fps)}>
        <Outro />
      </Sequence>

      {/* ── 3. SOUND — both stems at unity ───────────────────────────── */}
      <Audio src={staticFile(film.bed)} volume={1} />
      <Audio src={staticFile(film.transitions)} volume={1} />
      <Audio src={staticFile(film.vo)} volume={1} />
    </AbsoluteFill>
  );
};

/** Places a demonstrative clear of the caption block, per format. */
const GraphicSlot: React.FC<{ shot: any; fps: number; lengthFrames: number }> = ({ shot, lengthFrames }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  // Draw over the first 70% and hold, rather than still drawing as it cuts.
  const p = Math.min(1, Math.max(0, f / (lengthFrames * 0.7)));
  const out = Math.min(1, Math.max(0, (lengthFrames - f) / 8));
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        // Portrait: above the caption block. Landscape: the right half, where
        // the captions never go.
        alignItems: fmt.portrait ? "center" : "flex-end",
        justifyContent: fmt.portrait ? "flex-start" : "center",
        paddingTop: fmt.portrait ? fmt.safe.top + H * 0.10 : 0,
        paddingRight: fmt.portrait ? 0 : fmt.safe.right,
        paddingBottom: fmt.portrait ? 0 : fmt.safe.bottom * 0.4,
      }}
    >
      {/* The opacity is here, on a content-sized box, rather than on the
          full-frame parent — see the note on the layer above. A demonstrative
          is information, not typography, so it sits above the caption layer's
          64%: at 64% over a photograph these panels cannot be read. */}
      <div style={{ opacity: GRAPHIC_OPACITY * out }}>
        <Graphic kind={shot.graphic} accent={shot.accentKey} p={p} />
      </div>
    </AbsoluteFill>
  );
};

/** Wraps a shot in its arrival move, reading the frame from the Sequence. */
const TransitionInWrap: React.FC<{ kind: any; accent: string; children: React.ReactNode }> = ({
  kind, accent, children,
}) => {
  const f = useCurrentFrame();
  return (
    <TransitionIn kind={kind} f={f} accent={accent}>
      {children}
    </TransitionIn>
  );
};
