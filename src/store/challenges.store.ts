import { create } from 'zustand';
import { fetchAllChallenges } from '../services/challenge.service';
import { Challenge } from '../types/challenge.type';

type ChallengesState = {
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  selectedChallenge: Challenge | null;
  loading: boolean;
  error?: string;
};

type ChallengesActions = {
  setActiveChallenges: (
    activeChallenges: Challenge[] | ((prev: Challenge[]) => Challenge[])
  ) => void;
  setCompletedChallenges: (completedChallenges: Challenge[]) => void;
  setLoading: (loading: boolean) => void;
  selectChallenge: (challengeId: string) => void;
  fetchChallenges: (silent?: boolean) => void;
  reset: () => void;
};

type ChallengesStore = ChallengesState & ChallengesActions;

const initialState: ChallengesState = {
  activeChallenges: [],
  completedChallenges: [],
  loading: false,
  error: undefined,
  selectedChallenge: null,
};

export const useChallengesStore = create<ChallengesStore>(set => ({
  ...initialState,
  setActiveChallenges: (
    activeChallenges: Challenge[] | ((prev: Challenge[]) => Challenge[])
  ) =>
    set(state => ({
      activeChallenges:
        typeof activeChallenges === 'function'
          ? activeChallenges(state.activeChallenges)
          : activeChallenges,
    })),
  setCompletedChallenges: (completedChallenges: Challenge[]) =>
    set({ completedChallenges }),
  setLoading: (loading: boolean) => set({ loading }),
  selectChallenge: (challengeId: string) => {
    set(state => ({
      selectedChallenge:
        state.activeChallenges.find(
          (challenge: Challenge) => challenge.id === challengeId
        ) ||
        state.completedChallenges.find(
          (challenge: Challenge) => challenge.id === challengeId
        ) ||
        null,
    }));
  },
  fetchChallenges: async (silent = false) => {
    if (!silent) {
      set({ loading: true });
    }
    try {
      const challenges = await fetchAllChallenges();
      const activeChallenges = challenges.filter(
        (challenge: Challenge) =>
          challenge.status === 'active' ||
          challenge.status === 'pending' ||
          challenge.status === 'unpaid' ||
          challenge.status === 'inactive'
      );
      const completedChallenges = challenges.filter(
        (challenge: Challenge) =>
          challenge.status === 'finish' ||
          challenge.status === 'finishing'
      );

      set(state => {
        const updatedState: Partial<ChallengesState> = {
          activeChallenges,
          completedChallenges,
        };

        if (state.selectedChallenge) {
          const updatedChallenge =
            activeChallenges.find(
              (challenge: Challenge) =>
                challenge.id === state.selectedChallenge?.id
            ) ||
            completedChallenges.find(
              (challenge: Challenge) =>
                challenge.id === state.selectedChallenge?.id
            );

          if (updatedChallenge) {
            updatedState.selectedChallenge = updatedChallenge;
          } else {
            updatedState.selectedChallenge = null;
          }
        }

        return updatedState;
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch challenges',
      });
    } finally {
      if (!silent) {
        set({ loading: false });
      }
    }
  },
  reset: () => set(initialState),
}));
