import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SCREEN_NAMES } from '../../constants/screens';
import { useUnreadMessages } from '../../hooks';
import { useChallengesStore, useLastChallengeStore } from '../../store';
import { COLORS } from '../../theme';
import { Badge } from '../common/Badge';

type FooterProps = {
  currentRoute: string;
  invitePlayersTabRef?: React.RefObject<
    React.ComponentRef<typeof TouchableOpacity> | null
  >;
  chatTabRef?: React.RefObject<React.ComponentRef<typeof TouchableOpacity> | null>;
};

export const Footer: React.FC<FooterProps> = ({
  currentRoute,
  invitePlayersTabRef,
  chatTabRef,
}) => {
  const navigation = useNavigation();
  const { selectedChallenge } = useChallengesStore();
  const { getUnreadCount } = useUnreadMessages();
  const { setLastTab } = useLastChallengeStore();

  const unreadCount = getUnreadCount(selectedChallenge?.id || '');

  const isOrganizer = Boolean(selectedChallenge?.is_organizer);

  const tabs = [
    {
      name: SCREEN_NAMES._PLAY_CHALLENGE.BINGO,
      icon: 'grid-view',
      label: 'Bingo',
    },
    { name: SCREEN_NAMES._PLAY_CHALLENGE.CHAT, icon: 'chat', label: 'Chat' },
    {
      name: SCREEN_NAMES._PLAY_CHALLENGE.LEADERBOARD,
      icon: 'leaderboard',
      label: 'Leaderboard',
    },
    isOrganizer
      ? {
          name: SCREEN_NAMES._PLAY_CHALLENGE.PARTICIPANT_MANAGEMENT,
          icon: 'group',
          label: 'Users',
        }
      : null,
    {
      name: SCREEN_NAMES._PLAY_CHALLENGE.SETTINGS,
      icon: 'settings',
      label: 'Settings',
    },
  ]
    .filter(Boolean)
    .map(tab => tab as { name: string; icon: string; label: string });

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isChatTab = tab.name === SCREEN_NAMES._PLAY_CHALLENGE.CHAT;
        const isInviteTab =
          tab.name === SCREEN_NAMES._PLAY_CHALLENGE.PARTICIPANT_MANAGEMENT;
        const tabRef = isInviteTab
          ? invitePlayersTabRef
          : isChatTab
          ? chatTabRef
          : undefined;
        return (
          <TouchableOpacity
            key={`${tab.name}-${index}`}
            ref={tabRef}
            style={styles.tab}
            onPress={() => {
              setLastTab(tab.name);
              navigation.navigate(tab.name as never);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={tab.icon}
                size={24}
                color={
                  currentRoute === tab.name
                    ? COLORS.primary.green
                    : COLORS.gray.veryDark
                }
              />
              {isChatTab && unreadCount > 0 && (
                <Badge count={unreadCount} style={styles.chatBadge} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
});

export default Footer;
