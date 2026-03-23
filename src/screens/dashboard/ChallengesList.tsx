import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CustomButton, LoadingCard } from '../../components/common';
import {
  ChallengeCard,
  DashboardHeader,
  EmptyChallenges,
} from '../../components/dashboard';
import { SCREEN_NAMES } from '../../constants';
import { useUnreadMessages } from '../../hooks';
import { useChallengesStore } from '../../store';
import { COLORS, FONTS } from '../../theme';
import {
  DashboardStackParamList,
  RootStackParamList,
} from '../../types/navigation.type';

type NavigationProp = NativeStackNavigationProp<DashboardStackParamList>;

type TabType = 'ongoing' | 'archived';

export const ChallengesListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const {
    ongoingChallenges,
    archivedChallenges,
    loading,
    fetchChallenges,
    selectChallenge,
  } = useChallengesStore();
  const { unreadCounts } = useUnreadMessages();

  const navigation = useNavigation<NavigationProp>();
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const renderArchivedCard = (challenge: any, index: number) => {
    const progress =
      (challenge.current_week ?? 0) / Math.max(1, challenge.duration);

    return (
      <View key={challenge.id} style={styles.archivedCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.duration}>{challenge.duration} Weeks</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {challenge.is_organizer ? 'Hosted' : 'Joined'}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingCard
          visible={loading}
          message={`Loading ${activeTab} challenges...`}
          subMessage="Please wait a moment"
        />
      );
    }

    if (activeTab === 'ongoing') {
      if (ongoingChallenges.length === 0) {
        return (
          <EmptyChallenges
            mode="ongoing"
            handleJoinChallenge={() => {
              navigation.navigate(SCREEN_NAMES.JOIN_CHALLENGE as never);
            }}
            handleHostChallenge={() => {
              rootNavigation.navigate(SCREEN_NAMES.CREATE_CHALLENGE);
            }}
          />
        );
      }

      return (
        <View style={styles.listContainer}>
          <View style={styles.topButtons}>
            <CustomButton
              text="Join a Challenge"
              variant="primary"
              buttonStyle={styles.topBtn}
              textStyle={styles.topBtnText}
              onPress={() => {
                navigation.navigate(SCREEN_NAMES.JOIN_CHALLENGE as never);
              }}
            />
            <CustomButton
              text="Host a Challenge"
              onPress={() => {
                rootNavigation.navigate(SCREEN_NAMES.CREATE_CHALLENGE);
              }}
              buttonStyle={styles.topBtn}
              textStyle={styles.topBtnText}
              variant="outline"
            />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {ongoingChallenges.map(ch => (
              <ChallengeCard
                key={ch.id}
                title={ch.title}
                status={ch.status as never}
                currentWeek={ch.current_week ?? 1}
                totalWeeks={ch.duration}
                progress={(ch.current_week ?? 0) / Math.max(1, ch.duration)}
                startingDayOfWeek={ch.starting_day_of_week}
                isOrganizer={true}
                unreadCount={unreadCounts[ch.id] || 0}
                onPress={() => {
                  selectChallenge(ch.id);
                  rootNavigation.navigate(SCREEN_NAMES.PLAY_CHALLENGE);
                }}
                disabled={!ch.is_organizer && ch.status !== 'active'}
              />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (archivedChallenges.length === 0) {
      return (
        <EmptyChallenges
          mode="archived"
          handleJoinChallenge={() => {
            navigation.navigate(SCREEN_NAMES.JOIN_CHALLENGE as never);
          }}
          handleHostChallenge={() => {
            rootNavigation.navigate(SCREEN_NAMES.CREATE_CHALLENGE);
          }}
        />
      );
    }

    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {archivedChallenges.map((challenge, index) =>
          renderArchivedCard(challenge, index)
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.wrapper}>
      <DashboardHeader
        title={
          activeTab === 'ongoing' ? 'Active Challenges' : 'Completed Challenges'
        }
        action={
          <TouchableOpacity
            onPress={() =>
              setActiveTab(activeTab === 'ongoing' ? 'archived' : 'ongoing')
            }
          >
            <Text style={{ color: COLORS.primary.green, marginRight: 4 }}>
              {activeTab === 'ongoing' ? 'View Archived' : 'View Ongoing'}
            </Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.primary.white,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.gray.light,
  },
  activeTab: {
    backgroundColor: COLORS.primary.green,
  },
  tabText: {
    fontSize: FONTS.size.base,
    fontFamily: FONTS.family.poppinsMedium,
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.primary.white,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  topBtn: {
    paddingHorizontal: 12,
    height: 36,
    width: '48%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnText: {
    fontSize: 12,
    fontFamily: FONTS.family.poppinsMedium,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  archivedCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: FONTS.family.poppinsBold,
    color: '#333333',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    fontFamily: FONTS.family.poppinsRegular,
    color: '#666666',
  },
  statusBadge: {
    backgroundColor: '#7ED957',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.family.poppinsMedium,
    color: COLORS.primary.white,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7ED957',
    borderRadius: 4,
  },
  lockIcon: {
    fontSize: 16,
    color: '#FF69B4',
  },
});
