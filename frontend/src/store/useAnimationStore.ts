import { create } from 'zustand';

type BackgroundType = 'none' | 'coins' | 'embers';

interface AnimationState {
  coinsEnabled: boolean;
  embersEnabled: boolean;
  peopleAnimationEnabled: boolean;
  toggleCoins: () => void;
  toggleEmbers: () => void;
  togglePeopleAnimation: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  coinsEnabled: true,
  embersEnabled: false,
  peopleAnimationEnabled: false,
  toggleCoins: () =>
    set((state) => {
      const next = !state.coinsEnabled;
      return {
        coinsEnabled: next,
        embersEnabled: next ? false : state.embersEnabled,
        peopleAnimationEnabled: next ? false : state.peopleAnimationEnabled,
      };
    }),
  toggleEmbers: () =>
    set((state) => {
      const next = !state.embersEnabled;
      return {
        embersEnabled: next,
        coinsEnabled: next ? false : state.coinsEnabled,
        peopleAnimationEnabled: next ? false : state.peopleAnimationEnabled,
      };
    }),
  togglePeopleAnimation: () =>
    set((state) => {
      const next = !state.peopleAnimationEnabled;
      return {
        peopleAnimationEnabled: next,
        coinsEnabled: next ? false : state.coinsEnabled,
        embersEnabled: next ? false : state.embersEnabled,
      };
    }),
}));
