import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { Hook } from "./scenes/01_Hook";
import { Intro } from "./scenes/02_Intro";
import { Dashboard } from "./scenes/03_Dashboard";
import { Clients } from "./scenes/04_Clients";
import { NewProposal } from "./scenes/05_NewProposal";
import { Share } from "./scenes/06_Share";
import { Accept } from "./scenes/07_Accept";
import { CTA } from "./scenes/09_CTA";
import { colors } from "./theme";

// Scene durations in frames @ 30fps
const D = {
  hook: 180,
  intro: 120,
  dashboard: 330,
  clients: 240,
  newProposal: 330,
  share: 270,
  accept: 240,
  dashboard2: 210,
  cta: 210,
};
const T = 15; // transition frames

// Total = sum durations - (number of transitions) * T
const sceneDurations = Object.values(D);
export const TOTAL_FRAMES = sceneDurations.reduce((a, b) => a + b, 0) - (sceneDurations.length - 1) * T;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D.hook}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D.intro}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D.dashboard}>
          <Dashboard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D.clients}>
          <Clients />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D.newProposal}>
          <NewProposal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D.share}>
          <Share />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D.accept}>
          <Accept />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D.dashboard2}>
          <Dashboard updated />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D.cta}>
          <CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
