import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LastChallengeState = {
  lastChallengeId: string | null;
  lastTab: string | null;
  hasHydrated: boolean;
};

type LastChallengeActions = {
  setLastChallengeId: (id: string | null) => void;
  setLastTab: (tab: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
  reset: () => void;
};

export type LastChallengeStore = LastChallengeState & LastChallengeActions;

const initialState: LastChallengeState = {
  lastChallengeId: null,
  lastTab: null,
  hasHydrated: false,
};

export const useLastChallengeStore = create<LastChallengeStore>()(
  persist(
    set => ({
      ...initialState,
      setLastChallengeId: (lastChallengeId) => set({ lastChallengeId }),
      setLastTab: (lastTab) => set({ lastTab }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      reset: () => set(initialState),
    }),
    {
      name: 'last-challenge-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        lastChallengeId: state.lastChallengeId,
        lastTab: state.lastTab,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
