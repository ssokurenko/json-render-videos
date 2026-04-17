import { Composition } from "remotion";
import { Renderer, type TimelineSpec } from "@json-render/remotion";

interface TimelineProps {
  spec: TimelineSpec;
}

const Timeline = ({ spec }: TimelineProps) => <Renderer spec={spec} />;

export const RemotionRoot = () => (
  <Composition
    id="timeline"
    component={Timeline as any}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ spec: {} as TimelineSpec }}
    calculateMetadata={async ({ props }) => {
      const { spec } = props as TimelineProps;
      if (!spec?.composition) {
        return {
          durationInFrames: 300,
          fps: 30,
          width: 1920,
          height: 1080,
        };
      }
      return {
        durationInFrames: spec.composition.durationInFrames,
        fps: spec.composition.fps,
        width: spec.composition.width,
        height: spec.composition.height,
      };
    }}
  />
);
