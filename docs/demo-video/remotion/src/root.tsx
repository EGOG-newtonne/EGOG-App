import {Composition} from "remotion";

import {EGOGDemo} from "./video";

export const Root = () => (
  <Composition
    id="EGOGDemo"
    component={EGOGDemo}
    durationInFrames={3450}
    fps={30}
    width={1920}
    height={1080}
  />
);
