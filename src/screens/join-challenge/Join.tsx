import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CustomButton } from '../../components/common';
import { DashboardHeader } from '../../components/dashboard';
import { SCREEN_NAMES } from '../../constants';
import { useToast } from '../../hooks/useToast';
import {
  joinChallenge,
  rejectChallenge,
} from '../../services/challenge.service';
import { playLetsGoSound } from '../../services/sound.service';
import { COLORS, FONTS } from '../../theme';
import { RootStackParamList } from '../../types';

export const Join: React.FC = () => {
  const route = useRoute();
  const { challenge } = route.params as { challenge: any };
  const navigation = useNavigation();
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showToast } = useToast();

  const invitationCode = useMemo(() => {
    return challenge?.invitation_code || '';
  }, [challenge]);

  const handleJoin = async () => {
    try {
      playLetsGoSound();
      await joinChallenge(invitationCode);
      rootNavigation.navigate(SCREEN_NAMES.DASHBOARD as never);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Something went wrong',
        'error'
      );
    }
  };

  const handleBack = () => {
    navigation.navigate(SCREEN_NAMES._JOIN_CHALLENGE.INVITE_CODE as never);
  };

  const handleCancel = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(SCREEN_NAMES.DASHBOARD, {
        screen: SCREEN_NAMES._DASHBOARD.CHALLENGES_LIST,
      });
    }
  };

  const handleReject = async () => {
    try {
      await rejectChallenge(invitationCode);
      rootNavigation.navigate(SCREEN_NAMES.DASHBOARD as never);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Something went wrong',
        'error'
      );
    }
  };
  return (
    <>
      <DashboardHeader
        title="Join a Challenge"
        action={
          <CustomButton
            text="Cancel"
            variant="default"
            onPress={handleCancel}
          />
        }
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Let's Play Health Bingo</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {challenge?.title || 'Challenge Title'}
            </Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>
                {challenge?.plan?.toUpperCase() || 'FREE'}
              </Text>
            </View>
          </View>
          <Text style={styles.hosted}>
            Hosted by {challenge?.organizer?.first_name}{' '}
            {challenge?.organizer?.last_name}
          </Text>

          <View style={styles.row}>
            <Text style={styles.categoryText}>
              {challenge?.category?.name || 'Category'}
            </Text>
          </View>

          <Text style={styles.duration}>
            Duration: {challenge?.duration || 0} weeks
          </Text>
          <Text style={styles.cardSize}>
            Card Size: {challenge?.card_size || 0} tasks
          </Text>
          <Text style={styles.participants}>
            Players: {challenge?.participants?.length || 0}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            You'll join this challenge as a Player.
          </Text>
          <Text style={styles.infoText}>
            Get ready to play, stay accountable, and smash your weekly goals!
          </Text>
          <Text style={styles.infoText}>No payment required.</Text>
          {challenge?.custom_cards && challenge.custom_cards.length > 0 && (
            <Text style={styles.infoText}>
              Custom Cards: {challenge.custom_cards.length}
            </Text>
          )}
          {challenge?.default_cards && challenge.default_cards.length > 0 && (
            <Text style={styles.infoText}>
              Default Cards: {challenge.default_cards.length}
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            text="Let's Go!"
            onPress={handleJoin}
            buttonStyle={styles.joinButton}
            textStyle={styles.joinButtonText}
          />

          <CustomButton
            text="No Thanks"
            onPress={handleReject}
            buttonStyle={styles.rejectButton}
            textStyle={styles.rejectButtonText}
          />

          <CustomButton
            text="BACK"
            onPress={handleBack}
            buttonStyle={styles.backButton}
            textStyle={styles.backButtonText}
          />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.white,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 26,
    color: COLORS.primary.blue,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.gray.lightMedium,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 20,
    color: COLORS.text.primary,
  },
  freeBadge: {
    backgroundColor: COLORS.primary.green,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  freeBadgeText: {
    color: COLORS.primary.white,
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 12,
  },
  hosted: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  heart: {
    fontSize: 16,
    color: COLORS.primary.pink,
  },
  categoryText: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  duration: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  cardSize: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
    color: COLORS.text.primary,
    marginTop: 4,
  },
  participants: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
    color: COLORS.text.primary,
    marginTop: 4,
  },
  infoContainer: {
    marginTop: 12,
    gap: 6,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  infoText: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  buttonContainer: {
    gap: 16,
  },
  joinButton: {
    borderRadius: 10,
    height: 54,
  },
  joinButtonText: {
    color: COLORS.primary.white,
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 16,
  },
  rejectButton: {
    backgroundColor: COLORS.primary.red,
    borderRadius: 10,
    height: 54,
  },
  rejectButtonText: {
    color: COLORS.primary.white,
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 16,
  },
  backButton: {
    backgroundColor: COLORS.primary.white,
    borderRadius: 10,
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.primary.pink,
  },
  backButtonText: {
    textAlign: 'center',
    color: COLORS.primary.blue,
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 16,
    marginTop: 6,
  },
});
