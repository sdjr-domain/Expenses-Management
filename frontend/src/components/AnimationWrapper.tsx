import React from 'react';
import { useAnimationStore } from '../store/useAnimationStore';
import CoinGlide from './CoinGlide';
import EmberBackground from './EmberBackground';

interface AnimationWrapperProps {
  children: React.ReactNode;
}

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({ children }) => {
  const { coinsEnabled, embersEnabled } = useAnimationStore();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {coinsEnabled && <CoinGlide />}
        {embersEnabled && <EmberBackground />}
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimationWrapper;
