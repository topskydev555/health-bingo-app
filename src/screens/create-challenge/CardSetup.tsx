import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  CustomButton,
  HostTutorialOverlay,
  LoadingCard,
} from '../../components/common';
import { BingoBoard } from '../../components/common/BingoBoard';
import { Footer, Header } from '../../components/create-challenge';
import { DashboardHeader } from '../../components/dashboard';
import { AddCustomCardModal } from '../../components/play-challenge';
import { SCREEN_NAMES } from '../../constants/screens';
import { useCards } from '../../hooks';
import { useCreateStore, useHostTutorialStore } from '../../store';
import { COLORS, FONTS } from '../../theme';
import { BingoCard } from '../../types';

export const CardSetup: React.FC = () => {
  const navigation = useNavigation();
  const { bingoCards, setBingoCards, cardSize, categoryId, plan } = useCreateStore();
  const { cards, loading } = useCards(categoryId as string);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  const {
    completedCardSetupTutorial,
    setCardSetupTutorialCompleted,
    hasHydrated,
  } = useHostTutorialStore();
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const boardContainerRef = useRef<View>(null);
  const firstCardRef = useRef<View>(null);
  const progressSectionRef = useRef<View>(null);
  const resetButtonRef = useRef<View>(null);

  useEffect(() => {
    if (cards && cards.length > 0) {
      setBingoCards(
        cards.map(card => ({
          ...card,
          count: 0,
          font_color: card.font_color || COLORS.primary.black,
          font_name: card.font_name || 'Poppins-Regular',
        }))
      );
    }
  }, [cards]);

  useEffect(() => {
    if (
      hasHydrated &&
      !completedCardSetupTutorial &&
      !loading &&
      cards &&
      cards.length > 0
    ) {
      setTimeout(() => {
        setShowTutorial(true);
      }, 500);
    }
  }, [hasHydrated, completedCardSetupTutorial, loading, cards]);

  const selectedCardsCount = useMemo(
    () => bingoCards.reduce((total, card) => total + card.count, 0),
    [bingoCards]
  );

  const handleClick = (cardId: number, _status?: string) => {
    if (selectedCardsCount >= cardSize) return;

    const selectedCard = bingoCards[cardId];
    selectedCard.count++;
    setBingoCards(prev =>
      prev.map(card => (card.id === selectedCard.id ? selectedCard : card))
    );
  };

  const handleReset = () => {
    setBingoCards(prev => prev.map(card => ({ ...card, count: 0 })));
  };

  const handleBack = () => {
    navigation.navigate(
      SCREEN_NAMES._CREATE_CHALLENGE.DEFINE_CHALLENGE as never
    );
  };

  const handleCancel = () => {
    navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
  };

  const handleAddCustomCard = (
    title: string,
    color: string,
    font_color: string,
    font_name: string,
    count: number
  ) => {
    const currentTotal = bingoCards.reduce((sum, card) => sum + card.count, 0);
    const availableSpots = cardSize - currentTotal;
    const cardCount = Math.max(0, Math.min(count, availableSpots));

    if (cardCount > 0) {
      const newCard: BingoCard = {
        id: 'custom-' + Date.now(),
        name: title,
        color: color,
        font_color: font_color,
        font_name: font_name,
        type: 'custom',
        count: cardCount,
      };
      setBingoCards(prev => [...prev, newCard]);
    }
  };

  const tutorialSteps = [
    {
      id: 'card-selection',
      title: 'Build your Bingo board your way',
      description:
        'Start with our default cards, or choose Custom Cards to create your own challenges.',
      measureTarget: (
        callback: (layout: {
          x: number;
          y: number;
          width: number;
          height: number;
        }) => void
      ) => {
        if (boardContainerRef.current) {
          boardContainerRef.current.measure(
            (
              _x: number,
              _y: number,
              width: number,
              height: number,
              pageX: number,
              pageY: number
            ) => {
              callback({ x: pageX, y: pageY, width, height });
            }
          );
        }
      },
      tooltipPosition: 'bottom' as const,
    },
    {
      id: 'add-cards',
      title: 'Tap to add cards',
      description:
        'Tap a card to add it to your board.\n\nWant the same card more than once? Just tap it again.',
      measureTarget: (
        callback: (layout: {
          x: number;
          y: number;
          width: number;
          height: number;
        }) => void
      ) => {
        if (firstCardRef.current) {
          firstCardRef.current.measure(
            (
              _x: number,
              _y: number,
              width: number,
              height: number,
              pageX: number,
              pageY: number
            ) => {
              callback({ x: pageX, y: pageY, width, height });
            }
          );
        }
      },
      tooltipPosition: 'right' as const,
    },
    {
      id: 'card-counter',
      title: "You're building your board",
      description:
        "This counter shows how many cards you've added.\n\nYour board is ready when it's full.",
      measureTarget: (
        callback: (layout: {
          x: number;
          y: number;
          width: number;
          height: number;
        }) => void
      ) => {
        if (progressSectionRef.current) {
          progressSectionRef.current.measure(
            (
              _x: number,
              _y: number,
              width: number,
              height: number,
              pageX: number,
              pageY: number
            ) => {
              callback({ x: pageX, y: pageY, width, height });
            }
          );
        }
      },
      tooltipPosition: 'bottom' as const,
    },
    {
      id: 'reset',
      title: 'Need a fresh start?',
      description: 'Tap Reset to clear your board and rebuild it anytime.',
      measureTarget: (
        callback: (layout: {
          x: number;
          y: number;
          width: number;
          height: number;
        }) => void
      ) => {
        if (resetButtonRef.current) {
          resetButtonRef.current.measure(
            (
              _x: number,
              _y: number,
              width: number,
              height: number,
              pageX: number,
              pageY: number
            ) => {
              callback({ x: pageX, y: pageY, width, height });
            }
          );
        }
      },
      tooltipPosition: 'top' as const,
    },
  ];

  const handleTutorialNext = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setCardSetupTutorialCompleted(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setCardSetupTutorialCompleted(true);
  };

  return (
    <>
      <DashboardHeader
        title="Create Challenge"
        action={
          <TouchableOpacity onPress={handleCancel}>
            <Text style={{ color: COLORS.primary.green, marginRight: 4 }}>
              Cancel
            </Text>
          </TouchableOpacity>
        }
        showProfileIcon={false}
      />
      <View style={styles.container}>
        <Header
          title="Week 1 Card Setup"
          step={2}
          totalSteps={3}
          onBack={handleBack}
          bgColor={COLORS.gray.veryLight}
        />
        {loading ? (
          <LoadingCard
            visible={loading}
            message="Loading Bingo Cards..."
            subMessage="Please wait a moment while we load the bingo cards for you"
          />
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <BingoBoard
                bingoCardsData={bingoCards}
                mode="setup"
                handleClick={handleClick}
                totalCount={cardSize}
                boardContainerRef={boardContainerRef}
                firstCardRef={firstCardRef}
                progressSectionRef={progressSectionRef}
              />
              {plan !== 'free' && (
                <CustomButton
                  text="Add Custom Task"
                  icon={
                    <MaterialIcons
                      name="add"
                      size={24}
                      color={COLORS.primary.white}
                    />
                  }
                  onPress={() => setShowAddCustomModal(true)}
                  variant="primary"
                  buttonStyle={styles.addCustomButton}
                  textStyle={styles.addCustomButtonText}
                />
              )}
            </ScrollView>

            <Footer>
              <View style={styles.buttonGroup}>
                <View ref={resetButtonRef} style={styles.resetButtonContainer}>
                  <TouchableOpacity
                    onPress={handleReset}
                    style={styles.resetButton}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="refresh"
                      size={18}
                      color={COLORS.gray.dark}
                      style={styles.resetIcon}
                    />
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
                <CustomButton
                  text="Next: Invite Players"
                  onPress={() =>
                    navigation.navigate(
                      SCREEN_NAMES._CREATE_CHALLENGE
                        .INVITE_PARTICIPANTS as never
                    )
                  }
                  disabled={selectedCardsCount !== cardSize}
                  buttonStyle={styles.nextButton}
                  textStyle={styles.nextButtonText}
                />
              </View>
            </Footer>
          </>
        )}
      </View>

      <AddCustomCardModal
        visible={showAddCustomModal}
        onClose={() => setShowAddCustomModal(false)}
        onSave={handleAddCustomCard}
      />

      <HostTutorialOverlay
        visible={showTutorial}
        steps={tutorialSteps}
        currentStep={tutorialStep}
        onNext={handleTutorialNext}
        onSkip={handleTutorialSkip}
        onComplete={handleTutorialComplete}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.white,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 12,
    color: 'black',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  resetButtonContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray.light,
  },
  resetIcon: {
    marginRight: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: FONTS.family.poppinsMedium,
    color: COLORS.gray.darker,
  },
  nextButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCustomButton: {
    backgroundColor: COLORS.primary.blue,
    height: 48,
    width: '80%',
  },
  addCustomButtonText: {
    fontSize: 16,
    color: COLORS.primary.white,
  },
});
