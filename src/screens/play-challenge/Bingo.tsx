import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BingoBoard,
  BingoCardFullModal,
  BingoCompletionConfirmationModal,
  BoardSavedConfirmationModal,
  CelebrationModal,
  CountdownTimer,
  HostTutorialOverlay,
  LoadingCard,
  WelcomeModal,
} from '../../components/common';
import {
  AddCustomCardModal,
  BoardReadyBanner,
  SetupModeActions,
  WeekTabBar,
} from '../../components/play-challenge';
import {
  useBingoData,
  useBingoProgress,
  useBoardSetup,
  useWhatsNextTutorial,
} from '../../hooks';
import { createProgress } from '../../services';
import { playLetsGoSound } from '../../services/sound.service';
import { useChallengesStore, useHostTutorialStore } from '../../store';
import { COLORS, FONTS } from '../../theme';
import { getNextOccurrenceOfDay, getWeekStartDate } from '../../utils/date.utils';

interface BingoScreenProps {
  invitePlayersTabRef?: React.RefObject<
    React.ElementRef<typeof TouchableOpacity>
  >;
  chatTabRef?: React.RefObject<React.ElementRef<typeof TouchableOpacity>>;
}

export const BingoScreen: React.FC<BingoScreenProps> = ({
  invitePlayersTabRef,
  chatTabRef,
}) => {
  const { selectedChallenge } = useChallengesStore();
  const { setWhatsNextTutorialCompleted } = useHostTutorialStore();
  const isFinished = selectedChallenge?.status === 'finish' || selectedChallenge?.status === 'finishing';
  const isFocused = useIsFocused();
  const weekTabBarRef = useRef<View>(null);

  const [selectedWeek, setSelectedWeek] = useState<number>(
    selectedChallenge?.current_week || 1
  );
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  const availableWeeks = useMemo(() => {
    return Array.from(
      { length: selectedChallenge?.duration || 12 },
      (_, index) => index + 1
    );
  }, [selectedChallenge?.duration]);

  const isSetupMode = useMemo(() => {
    return Boolean(
      selectedChallenge?.is_organizer &&
        selectedWeek > (selectedChallenge?.current_week || 0)
    );
  }, [
    selectedChallenge?.is_organizer,
    selectedChallenge?.current_week,
    selectedWeek,
  ]);

  const {
    loading,
    bingoCardsData,
    setBingoCardsData,
    showWelcomeModal,
    setShowWelcomeModal,
    refreshData,
    refreshDataSilent,
    currentWeekStatus,
  } = useBingoData({ selectedWeek, isSetupMode });

  const {
    saving,
    showBoardSavedModal,
    setShowBoardSavedModal,
    boardSavedWeek,
    setBoardSavedWeek,
    boardStatus,
    handleSaveTaskSetup,
    handleResetTaskSetup,
    handleAddCustomCard,
    shouldShowTutorial,
  } = useBoardSetup({
    selectedWeek,
    bingoCardsData,
    setBingoCardsData,
    refreshData,
    refreshDataSilent,
  });

  const {
    handleClick,
    showConfirmationModal,
    setShowConfirmationModal,
    showCelebrationModal,
    setShowCelebrationModal,
    showCardFullModal,
    setShowCardFullModal,
    handleConfirmCompletion,
    handleCancelCompletion,
  } = useBingoProgress({
    bingoCardsData,
    setBingoCardsData,
    isSetupMode,
    selectedWeek,
    currentWeek: selectedChallenge?.current_week || 1,
  });

  const allCardsCompleted = useMemo(() => {
    return (
      !isSetupMode &&
      bingoCardsData.length > 0 &&
      bingoCardsData.every(card => card.status === 'check')
    );
  }, [isSetupMode, bingoCardsData]);

  const isWaitingForNextWeek = useMemo(() => {
    if (!allCardsCompleted || !selectedChallenge) return false;
    const currentWeek = selectedChallenge.current_week || 1;
    const totalWeeks = selectedChallenge.duration || 12;
    return currentWeek < totalWeeks && selectedWeek === currentWeek;
  }, [allCardsCompleted, selectedChallenge, selectedWeek]);

  const isFinishedWeek = useMemo(() => {
    if (!selectedChallenge || isSetupMode) return false;
    const currentWeek = selectedChallenge.current_week || 1;
    return selectedWeek < currentWeek;
  }, [selectedChallenge, selectedWeek, isSetupMode]);

  const weekStartDate = useMemo(() => {
    if (!selectedChallenge?.starting_day_of_week) return null;
    const currentWeek = selectedChallenge.current_week || 0;
    return getWeekStartDate(
      selectedChallenge.starting_day_of_week,
      selectedWeek,
      currentWeek
    );
  }, [
    selectedChallenge?.starting_day_of_week,
    selectedChallenge?.current_week,
    selectedWeek,
  ]);

  // The next occurrence of starting_day_of_week = when the current week ends.
  // Computed whenever we're on the current active week (not just after completion).
  const weekEndDate = useMemo(() => {
    const currentWeek = selectedChallenge?.current_week || 1;
    const totalWeeks = selectedChallenge?.duration || 12;
    if (
      !selectedChallenge?.starting_day_of_week ||
      isSetupMode ||
      selectedWeek !== currentWeek ||
      currentWeek >= totalWeeks
    ) return null;
    return getNextOccurrenceOfDay(selectedChallenge.starting_day_of_week);
  }, [
    selectedChallenge?.starting_day_of_week,
    selectedChallenge?.current_week,
    selectedChallenge?.duration,
    isSetupMode,
    selectedWeek,
  ]);

  const shouldShowTutorialValue = shouldShowTutorial();
  const {
    showTutorial,
    setShowTutorial,
    tutorialStep,
    tutorialSteps,
    handleNext: handleTutorialNext,
  } = useWhatsNextTutorial({
    weekTabBarRef,
    invitePlayersTabRef,
    chatTabRef,
    shouldShow: shouldShowTutorialValue,
  });

  useEffect(() => {
    setShowCelebrationModal(false);
    setShowConfirmationModal(false);
    setBoardSavedWeek(null);
  }, [selectedWeek, selectedChallenge?.id, setShowConfirmationModal]);

  useEffect(() => {
    if (
      shouldShowTutorialValue &&
      isFocused &&
      selectedChallenge?.is_organizer
    ) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    shouldShowTutorialValue,
    isFocused,
    selectedChallenge?.is_organizer,
    setShowTutorial,
  ]);

  const handleLetsGo = async () => {
    try {
      playLetsGoSound();
      await createProgress(selectedChallenge?.id as string);
      setShowWelcomeModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setWhatsNextTutorialCompleted(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setWhatsNextTutorialCompleted(true);
  };

  return (
    <View style={styles.container}>
      <WeekTabBar
        ref={weekTabBarRef}
        weeks={availableWeeks}
        currentWeek={selectedChallenge?.current_week || 1}
        selectedWeek={selectedWeek}
        selectWeek={setSelectedWeek}
        isOrganizer={selectedChallenge?.is_organizer || false}
      />

      <View style={styles.scrollWrapper}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isSetupMode && currentWeekStatus === 'ready' && (
            <BoardReadyBanner
              weekNumber={selectedWeek}
              startDate={weekStartDate}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.text}>
              {isSetupMode
                ? 'Setup Week ' + selectedWeek + ' Tasks'
                : "Let's Play Health Bingo"}
            </Text>
          </View>
          <BingoBoard
            bingoCardsData={bingoCardsData}
            mode={isSetupMode ? 'setup' : 'play'}
            handleClick={handleClick}
            totalCount={selectedChallenge?.card_size || 24}
            allCardsChecked={allCardsCompleted}
            onAllCardsCheckedClick={() => {
              setShowCelebrationModal(true);
            }}
            disabled={isFinishedWeek || isFinished}
          />
          {!isWaitingForNextWeek && !allCardsCompleted && weekEndDate && (
            <View style={styles.weekEndCountdown}>
              <Text style={styles.weekEndLabel}>Time left this week:</Text>
              <CountdownTimer targetDate={weekEndDate} variant="large" />
            </View>
          )}
          {isWaitingForNextWeek && weekEndDate && (
            <View style={styles.nextWeekCountdown}>
              <Text style={styles.nextWeekTitle}>
                🎉 Week {selectedWeek} Complete!
              </Text>
              <Text style={styles.nextWeekSubtitle}>Next week starts in:</Text>
              <CountdownTimer targetDate={weekEndDate} variant="large" />
            </View>
          )}
          {isSetupMode && !isFinished && (
            <SetupModeActions
              onAddCustom={() => setShowAddCustomModal(true)}
              onReset={handleResetTaskSetup}
              onSave={handleSaveTaskSetup}
              saving={saving}
            />
          )}
        </ScrollView>

        <WelcomeModal
          visible={showWelcomeModal}
          onClose={() => {}}
          onLetsGo={handleLetsGo}
          title="Welcome aboard!"
          subtitle="A new week, a fresh start - let's go!"
          buttonText="LET'S GO"
        />
      </View>

      <BingoCompletionConfirmationModal
        visible={showConfirmationModal}
        onConfirm={handleConfirmCompletion}
        onCancel={handleCancelCompletion}
      />

      <CelebrationModal
        visible={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
      />

      <AddCustomCardModal
        visible={showAddCustomModal}
        onClose={() => setShowAddCustomModal(false)}
        onSave={handleAddCustomCard}
      />

      <BingoCardFullModal
        visible={showCardFullModal}
        onSave={() => {
          setShowCardFullModal(false);
          handleSaveTaskSetup();
        }}
        onCancel={() => setShowCardFullModal(false)}
      />

      <BoardSavedConfirmationModal
        visible={showBoardSavedModal}
        onClose={() => setShowBoardSavedModal(false)}
        weekNumber={boardSavedWeek || selectedWeek}
        startDate={weekStartDate}
        status={boardStatus}
      />

      <HostTutorialOverlay
        visible={showTutorial}
        steps={tutorialSteps}
        currentStep={tutorialStep}
        onNext={handleTutorialNext}
        onSkip={handleTutorialSkip}
        onComplete={handleTutorialComplete}
      />

      <LoadingCard
        visible={loading}
        message={
          isSetupMode ? 'Loading bingo cards...' : 'Fetching progress...'
        }
        subMessage="Please wait a moment"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.blue,
  },
  scrollWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  text: {
    fontSize: 18,
    color: COLORS.primary.white,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 20,
  },
  nextWeekCountdown: {
    marginTop: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: COLORS.primary.green + '15',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary.green + '30',
    alignItems: 'center',
  },
  nextWeekTitle: {
    fontSize: 20,
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.white,
    marginBottom: 8,
  },
  nextWeekSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.primary.white,
    marginBottom: 12,
    opacity: 0.9,
  },
  weekEndCountdown: {
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary.white + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary.white + '30',
    alignItems: 'center',
  },
  weekEndLabel: {
    fontSize: 13,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.primary.white,
    marginBottom: 6,
    opacity: 0.85,
  },
});
