import { Composition } from "remotion";
import { MainVideo, TOTAL_FRAMES } from "./MainVideo";
import { MainVideoEn, TOTAL_FRAMES_EN } from "./MainVideoEn";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="main-en"
      component={MainVideoEn}
      durationInFrames={TOTAL_FRAMES_EN}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
