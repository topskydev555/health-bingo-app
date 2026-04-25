import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { getAllBingoCards, getBingoTasks, getProgress } from '../services';
import { playNewBoardSound } from '../services/sound.service';
import { useChallengesStore } from '../store';
import { COLORS } from '../theme';
import { BingoCard } from '../types';

interface UseBingoDataProps {
  selectedWeek: number;
  isSetupMode: boolean;
}

export const useBingoData = ({
  selectedWeek,
  isSetupMode,
}: UseBingoDataProps) => {
  const { selectedChallenge } = useChallengesStore();
  const currentWeek = selectedChallenge?.current_week ?? 1;
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [bingoCardsData, setBingoCardsData] = useState<BingoCard[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentWeekStatus, setCurrentWeekStatus] = useState<string | null>(
    null
  );

  const getData = useCallback(async (): Promise<void> => {
    if (!isFocused) {
      return;
    }

    try {
      setLoading(true);
      if (isSetupMode) {
        const { card_ids, status } = await getBingoTasks(
          selectedChallenge?.id as string,
          selectedWeek
        );
        setCurrentWeekStatus(status || null);
        if (
          status === 'not_ready' ||
          status === 'ready' ||
          status === undefined ||
          status === null
        ) {
          const cards = await getAllBingoCards(
            selectedChallenge?.category_id as string
          );
          const _cardData = cards.map((card: any) => {
            const count = card_ids?.length
              ? card_ids.filter((id: string) => id === card.id).length
              : 0;
            return {
              id: card.id,
              name: card.name,
              color: card.color,
              font_color: card.font_color || COLORS.primary.black,
              font_name: card.font_name || 'Poppins-Regular',
              type: card.type || 'default',
              count,
            };
          });
          setBingoCardsData(_cardData);
        }
      } else {
        const data = await getProgress(
          selectedChallenge?.id as string,
          selectedWeek
        );

        if (!data?.current_progress && selectedWeek === currentWeek) {
          setShowWelcomeModal(true);
        } else {
          const { current_progress, card_ids, bingoCards } = data;

          const _cardData = card_ids.map((id: string, index: number) => {
            const card = bingoCards.find((card: any) => card.id === id);
            const _progress = current_progress?.[index];

            return {
              _id: index.toString(),
              id: card?.id,
              name: card?.name,
              color: card?.color,
              font_color: card?.font_color || COLORS.primary.black,
              font_name: card?.font_name || 'Poppins-Regular',
              type: card?.type,
              status:
                _progress === 'mark' || _progress === 'unmark'
                  ? _progress
                  : Date.parse(_progress)
                    ? 'check'
                    : 'unmark',
            };
          });
          setBingoCardsData(_cardData);
          const isActiveCurrentWeek =
            selectedChallenge?.status === 'active' && selectedWeek === currentWeek;
          if (isActiveCurrentWeek) {
            playNewBoardSound();
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [selectedChallenge?.id, selectedWeek, isSetupMode, isFocused]);

  useEffect(() => {
    if (showWelcomeModal) {
      setShowWelcomeModal(false);
    }
  }, [selectedWeek]);

  useEffect(() => {
    if (!selectedChallenge || showWelcomeModal || !isFocused) {
      return;
    }
    getData();
  }, [
    getData,
    showWelcomeModal,
    selectedChallenge?.id,
    selectedWeek,
    isFocused,
  ]);

  const refreshDataSilent = useCallback(async () => {
    if (!isFocused) {
      return;
    }

    try {
      if (isSetupMode) {
        const { card_ids, status } = await getBingoTasks(
          selectedChallenge?.id as string,
          selectedWeek
        );
        if (
          status === 'not_ready' ||
          status === 'ready' ||
          status === undefined ||
          status === null
        ) {
          const cards = await getAllBingoCards(
            selectedChallenge?.category_id as string
          );
          const _cardData = cards.map((card: any) => {
            const count = card_ids?.length
              ? card_ids.filter((id: string) => id === card.id).length
              : 0;
            return {
              id: card.id,
              name: card.name,
              color: card.color,
              font_color: card.font_color || COLORS.primary.black,
              font_name: card.font_name || 'Poppins-Regular',
              type: card.type || 'default',
              count,
            };
          });
          setBingoCardsData(_cardData);
        }
        setCurrentWeekStatus(status || null);
        return status;
      } else {
        const data = await getProgress(
          selectedChallenge?.id as string,
          selectedWeek
        );

        if (!data?.current_progress && selectedWeek === currentWeek) {
          setShowWelcomeModal(true);
        } else {
          const { current_progress, card_ids, bingoCards } = data;

          const _cardData = card_ids.map((id: string, index: number) => {
            const card = bingoCards.find((card: any) => card.id === id);
            const _progress = current_progress?.[index];

            return {
              _id: index.toString(),
              id: card?.id,
              name: card?.name,
              color: card?.color,
              font_color: card?.font_color || COLORS.primary.black,
              font_name: card?.font_name || 'Poppins-Regular',
              type: card?.type,
              status:
                _progress === 'mark' || _progress === 'unmark'
                  ? _progress
                  : Date.parse(_progress)
                    ? 'check'
                    : 'unmark',
            };
          });
          setBingoCardsData(_cardData);
          const isActiveCurrentWeek =
            selectedChallenge?.status === 'active' && selectedWeek === currentWeek;
          if (isActiveCurrentWeek) {
            playNewBoardSound();
          }
        }
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }, [selectedChallenge?.id, selectedWeek, isSetupMode, isFocused]);

  return {
    loading,
    bingoCardsData,
    setBingoCardsData,
    showWelcomeModal,
    setShowWelcomeModal,
    refreshData: getData,
    refreshDataSilent,
    currentWeekStatus,
  };
};
