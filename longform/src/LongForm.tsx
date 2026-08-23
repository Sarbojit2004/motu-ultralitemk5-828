import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "./theme";
import { BEATS } from "./schedule";
import { Scene } from "./Scenes";
import { FontFaces } from "./components/Shell";
import { Mix } from "./Audio";

export const LongForm: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.paper }}>
    <FontFaces />
    {BEATS.map((b) => (
      <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames} name={`${b.chapter} · ${b.id}`}>
        <Scene b={b} />
      </Sequence>
    ))}
    <Mix />
  </AbsoluteFill>
);
