import {Layer} from '../camera/Camera';
import {DEPTH, C} from '../lib/theme';
import {WIDTH, HEIGHT} from '../lib/grid';
import {IMAGES} from '../data/images';
import {Plate} from '../elements/Plate';
import {Headline, Scrap, Callout, Star, Rule} from '../elements/Type';
import {ShotCtx} from './Shot';
import {mulberry32, hash} from '../lib/rng';

const CX = WIDTH / 2;

/** Natural height of a plate at a given width. */
export const nH = (slug: string, w: number) => (w * IMAGES[slug].h) / IMAGES[slug].w;

export type TypeSpec = {
  text: string;
  y: number;
  x?: number;
  size?: number;
  font?: 'display' | 'heavy' | 'cond' | 'label';
  color?: string;
  slab?: string;
  align?: 'left' | 'center' | 'right';
  rot?: number;
  inAt?: number;
  outAt?: number;
  stagger?: number;
  from?: 'l' | 'r' | 't' | 'b' | 'z' | 'zo' | 'none';
  to?: 'l' | 'r' | 't' | 'b' | 'z' | 'zo' | 'none';
  split?: 'word' | 'letter' | 'none';
  width?: number;
  tracking?: number;
};

const renderType = (ctx: ShotCtx, t: TypeSpec, i: number) => (
  <Headline
    key={`t${i}`}
    text={t.text}
    lb={ctx.lb}
    inAt={t.inAt ?? 0.08}
    outAt={t.outAt ?? ctx.dur - 0.06}
    x={t.x ?? (t.align === 'center' ? (WIDTH - (t.width ?? WIDTH)) / 2 : 190)}
    y={t.y}
    width={t.width ?? (t.align === 'center' ? WIDTH : undefined)}
    size={t.size ?? 210}
    font={t.font ?? 'display'}
    color={t.color ?? C.ink}
    slab={t.slab}
    align={t.align ?? 'left'}
    rot={t.rot ?? 0}
    stagger={t.stagger ?? 0.1}
    from={t.from ?? 'b'}
    to={t.to ?? 't'}
    split={t.split ?? 'word'}
    tracking={t.tracking}
  />
);

export type ScrapSpec = {
  cx: number; cy: number; w: number; h: number; color?: string; rot?: number;
  inAt?: number; outAt?: number; from?: 'l' | 'r' | 't' | 'b' | 'z'; opacity?: number;
};

const renderScraps = (ctx: ShotCtx, scraps: ScrapSpec[] | undefined, seedBase: string) =>
  (scraps ?? []).map((s, i) => (
    <Scrap
      key={`s${i}`}
      life={ctx.L(s.inAt ?? -0.15, s.outAt ?? ctx.dur + 0.1)}
      cx={s.cx} cy={s.cy} w={s.w} h={s.h}
      color={s.color ?? C.red}
      rot={s.rot ?? 0}
      from={s.from ?? 'l'}
      opacity={s.opacity}
      seed={`${seedBase}-scrap${i}`}
    />
  ));

export type PlateSpec = {
  slug: string;
  cx?: number; cy?: number; w: number; h?: number; rot?: number;
  depth?: number;
  inAt?: number; outAt?: number;
  from?: 'l' | 'r' | 't' | 'b' | 'z' | 'zo';
  to?: 'l' | 'r' | 't' | 'b' | 'z' | 'zo';
  anchor?: [number, number];
  fit?: 'cover' | 'contain';
  pad?: number;
  card?: boolean;
  tear?: number;
  shadow?: number;
};

export type CalloutSpec = {
  text: string; x: number; y: number; size?: number; leader?: number;
  leaderDir?: -1 | 1; rot?: number; inAt?: number; outAt?: number;
  color?: string; bg?: string; from?: 'l' | 'r' | 't' | 'b' | 'z';
};

/**
 * The single composition builder every shot in the reel goes through.
 *
 * Plates are grouped onto separate parallax planes by their `depth`, so a shot
 * with more than one picture always moves those pictures at different rates
 * relative to each other and to the backdrop and type (master brief S3.2). The
 * builder is heavily parameterised rather than templated: position, angle,
 * crop anchor, accent colour, type placement and per-component in/out beats are
 * all set per shot, which is what keeps fifty compositions from reading as one
 * layout repeated fifty times.
 */
export const compose = (o: {
  seed: string;
  plates: PlateSpec[];
  type?: TypeSpec[];
  scraps?: ScrapSpec[];
  /** Colour blocks that ride the TYPE plane. A headline set against a scrap
   *  would drift off it, because scraps sit on a slower plane by design - so
   *  anything a word must stay legible against belongs here instead. */
  bands?: ScrapSpec[];
  callouts?: CalloutSpec[];
  stars?: {cx: number; cy: number; r: number; color?: string; inAt?: number; outAt?: number}[];
  rules?: {x: number; y: number; w: number; h?: number; color?: string; rot?: number; inAt?: number; outAt?: number}[];
}) => (ctx: ShotCtx) => {
  const byDepth = new Map<number, PlateSpec[]>();
  for (const p of o.plates) {
    const d = p.depth ?? DEPTH.photo;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(p);
  }
  const depths = [...byDepth.keys()].sort((a, b) => a - b);
  const r = mulberry32(hash(o.seed));

  return (
    <>
      {(o.scraps?.length ?? 0) > 0 && (
        <Layer depth={DEPTH.scrap}>{renderScraps(ctx, o.scraps, o.seed)}</Layer>
      )}

      {depths.map((d) => (
        <Layer depth={d} key={`d${d}`}>
          {byDepth.get(d)!.map((p, i) => {
            const w = p.w;
            const h = p.h ?? nH(p.slug, w);
            return (
              <Plate
                key={`p${i}`}
                slug={p.slug}
                cx={p.cx ?? CX}
                cy={p.cy ?? HEIGHT * 0.54}
                w={w}
                h={h}
                rot={p.rot ?? 0}
                life={ctx.L(p.inAt ?? -0.35, p.outAt ?? ctx.dur + 0.25)}
                from={p.from ?? 'z'}
                to={p.to ?? 'zo'}
                anchor={p.anchor}
                fit={p.fit}
                pad={p.pad}
                card={p.card}
                tear={p.tear}
                shadow={p.shadow}
                ownZoom={0.035 + r() * 0.05}
              />
            );
          })}
        </Layer>
      ))}

      {(o.stars?.length ?? 0) > 0 && (
        <Layer depth={DEPTH.scrap + 0.3}>
          {o.stars!.map((s, i) => (
            <Star
              key={`st${i}`}
              life={ctx.L(s.inAt ?? 0.1, s.outAt ?? ctx.dur)}
              cx={s.cx} cy={s.cy} r={s.r} color={s.color ?? C.ink}
              seed={`${o.seed}-star${i}`}
            />
          ))}
        </Layer>
      )}

      {((o.type?.length ?? 0) > 0 || (o.rules?.length ?? 0) > 0 || (o.bands?.length ?? 0) > 0) && (
        <Layer depth={DEPTH.type}>
          {(o.bands ?? []).map((b, i) => (
            <Scrap
              key={`b${i}`}
              life={ctx.L(b.inAt ?? -0.2, b.outAt ?? ctx.dur + 0.15)}
              cx={b.cx} cy={b.cy} w={b.w} h={b.h}
              color={b.color ?? C.ink}
              rot={b.rot ?? 0}
              from={b.from ?? 't'}
              opacity={b.opacity}
              seed={`${o.seed}-band${i}`}
            />
          ))}
          {(o.rules ?? []).map((rl, i) => (
            <Rule
              key={`r${i}`}
              life={ctx.L(rl.inAt ?? 0.1, rl.outAt ?? ctx.dur)}
              x={rl.x} y={rl.y} w={rl.w} h={rl.h} color={rl.color} rot={rl.rot}
              seed={`${o.seed}-rule${i}`}
            />
          ))}
          {(o.type ?? []).map((t, i) => renderType(ctx, t, i))}
        </Layer>
      )}

      {(o.callouts?.length ?? 0) > 0 && (
        <Layer depth={DEPTH.callout}>
          {o.callouts!.map((c, i) => (
            <Callout
              key={`c${i}`}
              text={c.text}
              life={ctx.L(c.inAt ?? 0.3, c.outAt ?? ctx.dur - 0.05)}
              x={c.x} y={c.y} size={c.size} leader={c.leader}
              leaderDir={c.leaderDir} rot={c.rot} color={c.color} bg={c.bg}
              from={c.from ?? 'l'}
              seed={`${o.seed}-co${i}`}
            />
          ))}
        </Layer>
      )}
    </>
  );
};
