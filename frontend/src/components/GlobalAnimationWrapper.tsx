import React from 'react';
import { useAnimationStore } from '../store/useAnimationStore';
import { Button } from './Button';
import { Skiper39 } from './ui/skiper-ui/skiper39';
import EmberBackground from './EmberBackground';

interface GlobalAnimationWrapperProps {
  children: React.ReactNode;
}

export const GlobalAnimationWrapper: React.FC<GlobalAnimationWrapperProps> = ({ children }) => {
  const {
    peopleAnimationEnabled,
    togglePeopleAnimation,
    embersEnabled,
    toggleEmbers
  } = useAnimationStore();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Ember Background */}
      {embersEnabled && <EmberBackground />}

      {/* People Animation Background - Bottom 20% */}
      {peopleAnimationEnabled && (
        <div className="fixed bottom-0 left-0 w-full h-[20vh] z-0 pointer-events-none">
          <Skiper39 />
        </div>
      )}

      {/* Toggle Buttons - Fixed position so they're always visible */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <Button
          variant={peopleAnimationEnabled ? "primary" : "ghost"}
          onClick={togglePeopleAnimation}
          className="text-[10px] h-7 px-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          People: {peopleAnimationEnabled ? 'ON' : 'OFF'}
        </Button>
        <Button
          variant={embersEnabled ? "primary" : "ghost"}
          onClick={toggleEmbers}
          className="text-[10px] h-7 px-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          Embers: {embersEnabled ? 'ON' : 'OFF'}
        </Button>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
