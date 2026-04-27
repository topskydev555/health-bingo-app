import moment from 'moment-timezone';
import { create } from 'zustand';
import { BingoCard } from '../types';

export type Participant = {
  email: string;
  displayName?: string;
  image?: string;
};

const getSydneyTodayDayOfWeek = (): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[moment.tz('Australia/Sydney').day()];
};

type CreateState = {
  plan: string | null;
  title: string;
  isOrganizerParticipant?: boolean;
  duration: number;
  cardSize: number;
  categoryId: string | null;
  startingDayOfWeek: string | null;
  startImmediately: boolean;

  bingoCards: BingoCard[];

  participants: Participant[];

  loading: boolean;
  error?: string;
};

type CreateActions = {
  setPlan: (plan: string) => void;
  setTitle: (title: string) => void;
  setIsOrganizerParticipant: (isOrganizerParticipant: boolean) => void;
  setDuration: (duration: number) => void;
  setCardSize: (cardSize: number) => void;
  setCategoryId: (categoryId: string) => void;
  setStartingDayOfWeek: (startingDayOfWeek: string) => void;
  setBingoCards: (
    bingoCards: BingoCard[] | ((prev: BingoCard[]) => BingoCard[])
  ) => void;
  setParticipants: (
    participants: Participant[] | ((prev: Participant[]) => Participant[])
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  reset: () => void;
};

type CreateStore = CreateState & CreateActions;

const initialState: CreateState = {
  plan: null,
  title: '',
  isOrganizerParticipant: false,
  duration: 1,
  cardSize: 24,
  categoryId: null,
  startingDayOfWeek: getSydneyTodayDayOfWeek(),
  startImmediately: true,
  bingoCards: [],
  participants: [],
  loading: false,
  error: undefined,
};

export const useCreateStore = create<CreateStore>(set => ({
  ...initialState,
  setPlan: (plan: string) => set({ plan }),
  setTitle: (title: string) => set({ title }),
  setIsOrganizerParticipant: (isOrganizerParticipant: boolean) =>
    set({ isOrganizerParticipant }),
  setDuration: (duration: number) => set({ duration }),
  setCardSize: (cardSize: number) => set({ cardSize }),
  setCategoryId: (categoryId: string) => set({ categoryId }),
  setStartingDayOfWeek: (startingDayOfWeek: string) =>
    set({ startingDayOfWeek, startImmediately: startingDayOfWeek === getSydneyTodayDayOfWeek() }),
  setBingoCards: (
    bingoCards: BingoCard[] | ((prev: BingoCard[]) => BingoCard[])
  ) =>
    set(state => ({
      ...state,
      bingoCards:
        typeof bingoCards === 'function'
          ? bingoCards([...state.bingoCards])
          : [...bingoCards],
    })),
  setParticipants: (
    participants: Participant[] | ((prev: Participant[]) => Participant[])
  ) =>
    set(state => ({
      ...state,
      participants:
        typeof participants === 'function'
          ? participants([...state.participants])
          : [...participants],
    })),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string) => set({ error }),
  reset: () => set(initialState),
}));
