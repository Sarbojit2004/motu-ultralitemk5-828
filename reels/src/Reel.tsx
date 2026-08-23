import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "./theme";
import { REELS } from "./schedule";
import { Scene } from "./Scenes";
import { FontFaces } from "./components/Shell";
import { Mix } from "./Audio";

export const Reel: React.FC<{ reel: 1 | 2 }> = ({ reel }) => {
  const S = REELS[reel];
  return (
    <AbsoluteFill style={{ background: COLORS.paper }}>
      <FontFaces />
      {S.beats.map((b) => (
        <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames} name={b.id}>
          <Scene b={b} />
        </Sequence>
      ))}
      <Mix reel={reel} />
    </AbsoluteFill>
  );
};

export const Reel1: React.FC = () => <Reel reel={1} />;
export const Reel2: React.FC = () => <Reel reel={2} />;
