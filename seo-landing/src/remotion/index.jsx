import { Composition } from 'remotion';
import { HeroComposition } from './HeroComposition';
import { FeaturesComposition, WorkflowComposition } from './FeaturesComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Hero"
        component={HeroComposition}
        durationInFrames={200}
        fps={30}
        width={1920}
        height={700}
      />
      <Composition
        id="Features"
        component={FeaturesComposition}
        durationInFrames={160}
        fps={30}
        width={1920}
        height={700}
      />
      <Composition
        id="Workflow"
        component={WorkflowComposition}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={600}
      />
    </>
  );
};
