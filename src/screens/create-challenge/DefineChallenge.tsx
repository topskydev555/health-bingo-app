import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  BoardLayout,
  CategorySelector,
  DurationSelector,
  StartingDaySelector,
  TitleInput,
} from '../../components/challenge';
import { CustomButton, LoadingCard } from '../../components/common';
import { Header } from '../../components/create-challenge/Header';
import { DashboardHeader } from '../../components/dashboard';
import { SCREEN_NAMES } from '../../constants/screens';
import { useCategories, usePlans } from '../../hooks';
import { ChallengeCategory, useCreateStore } from '../../store';
import { COLORS, FONTS } from '../../theme';

export const DefineChallenge: React.FC = () => {
  const {
    plan,
    title,
    setTitle,
    duration,
    setDuration,
    cardSize,
    setCardSize,
    categoryId,
    setCategoryId,
    startingDayOfWeek,
    setStartingDayOfWeek,
    startImmediately,
  } = useCreateStore();

  const navigation = useNavigation();
  const { getPlanById } = usePlans();
  const { categories, loading } = useCategories();

  const selectedCategory = categories?.find(c => c.id === categoryId);
  const showProUpgradeHint = plan !== 'pro' && selectedCategory?.is_premium;

  const handleTypeSelect = (typeId: string) => {
    setCategoryId(typeId);
  };

  const handleDurationChange = (duration: number) => {
    const maxWeeks = getPlanById(plan as string)?.maxWeek || 12;
    if (duration > maxWeeks) {
      setDuration(maxWeeks);
    } else if (duration < 1) {
      setDuration(1);
    } else {
      setDuration(duration);
    }
  };

  const handleLayoutSelect = (layoutId: number) => {
    setCardSize(layoutId);
  };

  const handleNext = () => {
    navigation.navigate(SCREEN_NAMES._CREATE_CHALLENGE.CARD_SETUP as never);
  };

  const handleBack = () => {
    navigation.navigate(SCREEN_NAMES._CREATE_CHALLENGE.CHOOSE_PLAN as never);
  };

  const handleCancel = () => {
    navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
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
      <Header
        title="Define Challenge"
        step={1}
        totalSteps={3}
        onBack={handleBack}
        bgColor={COLORS.gray.veryLight}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <CategorySelector
          categories={categories as ChallengeCategory[]}
          categoryId={categoryId as string}
          handleTypeSelect={handleTypeSelect}
        />

        {showProUpgradeHint && (
          <View style={styles.proHintContainer}>
            <Icon name="info-outline" size={16} color="#7C3AED" style={styles.proHintIcon} />
            <Text style={styles.proHintText}>
              Upgrade to Pro to unlock weight tracking, progress and extra badges.
            </Text>
          </View>
        )}

        <TitleInput title={title} isEditable={true} setTitle={setTitle} />

        <DurationSelector
          duration={duration}
          maxDuration={getPlanById(plan as string)?.maxWeek || 12}
          onChange={handleDurationChange}
        />

        <StartingDaySelector
          startingDayOfWeek={startingDayOfWeek}
          startImmediately={startImmediately}
          onChange={setStartingDayOfWeek}
        />

        <BoardLayout cardSize={cardSize} onPress={handleLayoutSelect} />

        <CustomButton
          text="Next: Create Week 1 Card"
          onPress={handleNext}
          buttonStyle={styles.nextButton}
          textStyle={styles.nextButtonText}
          disabled={
            title.length === 0 ||
            categoryId === null ||
            startingDayOfWeek === null
          }
        />
      </ScrollView>

      <LoadingCard
        visible={loading}
        message="Loading categories..."
        subMessage="Please wait a moment"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  nextButton: {
    height: 48,
  },
  nextButtonText: {
    fontSize: 14,
  },
  proHintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  proHintIcon: {
    marginTop: 1,
  },
  proHintText: {
    flex: 1,
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 13,
    color: '#7C3AED',
    lineHeight: 18,
  },
});
