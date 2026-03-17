import { Composition } from "remotion";
import { SpaceFacts } from "./SpaceFacts";
import React from "react";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SpaceFacts"
        component={SpaceFacts}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          hook: "The Sun is so big 1.3 million Earths could fit inside it",
          body: "Every second, the Sun converts 600 million tons of hydrogen into helium through nuclear fusion. That energy travels 93 million miles to reach us in just 8 minutes.",
          cta: "What space fact blew your mind the most?",
          title: "Mind Blowing Sun Facts",
          audioUrl: undefined,
        }}
      />
    </>
  );
};
