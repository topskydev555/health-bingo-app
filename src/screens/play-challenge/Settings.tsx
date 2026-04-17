import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { CustomButton, LoadingCard } from '../../components/common';
import {
  ChallengeDetailsView,
  EditChallengeForm,
  PaymentModal,
  UpgradeToProModal,
} from '../../components/play-challenge';
import { useCategories, usePlans } from '../../hooks';
import { updateChallenge } from '../../services';
import { useChallengesStore } from '../../store';
import { COLORS } from '../../theme';
import { Challenge } from '../../types/challenge.type';

export const SettingsScreen: React.FC = () => {
  const { selectedChallenge, selectChallenge, setActiveChallenges } =
    useChallengesStore();
  const { categories } = useCategories();
  const { getPlanById } = usePlans();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formData, setFormData] = useState({
    title: selectedChallenge?.title || '',
    plan: selectedChallenge?.plan || '',
    cardSize: selectedChallenge?.card_size || 16,
    duration: selectedChallenge?.duration || 12,
    startingDayOfWeek: selectedChallenge?.starting_day_of_week || null,
  });

  const isOrganizer = selectedChallenge?.is_organizer;
  const isFinished = selectedChallenge?.status === 'finish' || selectedChallenge?.status === 'finishing';
  const category = categories?.find(
    cat => cat.id === selectedChallenge?.category_id
  );

  useEffect(() => {
    if (selectedChallenge) {
      setFormData({
        title: selectedChallenge.title,
        plan: selectedChallenge.plan,
        cardSize: selectedChallenge.card_size,
        duration: selectedChallenge.duration,
        startingDayOfWeek: selectedChallenge.starting_day_of_week || null,
      });
    }
  }, [selectedChallenge]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await updateChallenge(selectedChallenge?.id as string, {
        ...(formData.title !== selectedChallenge?.title && {
          title: formData.title,
        }),
        ...(formData.plan !== selectedChallenge?.plan && {
          plan: formData.plan,
        }),
        ...(formData.cardSize !== selectedChallenge?.card_size && {
          card_size: formData.cardSize,
        }),
        ...(formData.duration !== selectedChallenge?.duration && {
          duration: formData.duration,
        }),
        ...(formData.startingDayOfWeek !==
          selectedChallenge?.starting_day_of_week && {
          starting_day_of_week: formData.startingDayOfWeek,
        }),
      });

      setActiveChallenges((prev: Challenge[]) => {
        return prev.map((challenge: Challenge) =>
          challenge.id === selectedChallenge?.id
            ? { ...challenge, ...response }
            : challenge
        );
      });

      selectChallenge(selectedChallenge?.id as string);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update challenge settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: selectedChallenge?.title || '',
      plan: selectedChallenge?.plan || '',
      cardSize: selectedChallenge?.card_size || 16,
      duration: selectedChallenge?.duration || 12,
      startingDayOfWeek: selectedChallenge?.starting_day_of_week || null,
    });
    setIsEditing(false);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
  };

  if (!selectedChallenge) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <>
            <EditChallengeForm
              formData={formData}
              categoryName={category?.name}
              onTitleChange={value =>
                setFormData(prev => ({ ...prev, title: value }))
              }
              onPlanChange={value =>
                setFormData(prev => ({ ...prev, plan: value }))
              }
              onCardSizeChange={value =>
                setFormData(prev => ({ ...prev, cardSize: value }))
              }
              onDurationChange={increment => {
                const maxWeeks = getPlanById(formData.plan)?.maxWeek || 12;
                if (increment) {
                  setFormData(prev => ({
                    ...prev,
                    duration: Math.min(prev.duration + 1, maxWeeks),
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    duration: Math.max(prev.duration - 1, 1),
                  }));
                }
              }}
              onStartingDayChange={day =>
                setFormData(prev => ({ ...prev, startingDayOfWeek: day }))
              }
            />

            <View style={styles.buttonGroup}>
              <CustomButton
                text="Cancel"
                onPress={handleCancel}
                variant="outline"
                buttonStyle={styles.cancelButton}
              />
              <CustomButton
                text="Save Changes"
                onPress={handleSave}
                variant="primary"
                buttonStyle={styles.saveButton}
                loading={loading}
              />
            </View>
          </>
        ) : (
          <>
            <ChallengeDetailsView
              challenge={selectedChallenge}
              categoryName={category?.name}
            />

            {isOrganizer && !isFinished && (
              <View style={styles.buttonGroup}>
                {selectedChallenge?.status === 'unpaid' ? (
                  <>
                    <CustomButton
                      text="Make Payment"
                      onPress={() => setShowPaymentModal(true)}
                      variant="primary"
                      buttonStyle={styles.payButton}
                    />
                    <CustomButton
                      text="Edit Settings"
                      onPress={() => setIsEditing(true)}
                      variant="outline"
                      buttonStyle={styles.editButton}
                    />
                  </>
                ) : (
                  <>
                    {selectedChallenge?.plan === 'premium' && (
                      <CustomButton
                        text="Upgrade to Pro"
                        onPress={() => setShowUpgradeModal(true)}
                        variant="primary"
                        buttonStyle={styles.upgradeButton}
                      />
                    )}
                    <CustomButton
                      text="Edit Settings"
                      onPress={() => setIsEditing(true)}
                      variant={selectedChallenge?.plan === 'premium' ? 'outline' : 'primary'}
                      buttonStyle={styles.editButton}
                    />
                  </>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <LoadingCard
        visible={loading}
        message="Updating challenge settings..."
        subMessage="Please wait a moment"
      />

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <UpgradeToProModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={() => setShowUpgradeModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray.light,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  upgradeButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary.blue,
  },
  payButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
});
