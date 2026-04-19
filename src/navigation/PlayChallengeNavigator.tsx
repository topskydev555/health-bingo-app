import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Footer, Header } from '../components/play-challenge';
import { SCREEN_NAMES } from '../constants/screens';
import { BingoScreen, ChatScreen, LeaderboardScreen, ParticipantManagementScreen, SettingsScreen, WeighInScreen } from '../screens/play-challenge';
import { useChallengesStore, useLastChallengeStore } from '../store';
import { ChallengeStackParamList } from '../types/navigation.type';

const Stack = createNativeStackNavigator<ChallengeStackParamList>();

export const LayoutWrapper = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { selectedChallenge } = useChallengesStore();
    const title = selectedChallenge?.title || 'Bingo';

    const invitePlayersTabRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);
    const chatTabRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);

    return (
      <View style={{ flex: 1 }}>
        <Header title={title} />
        <Component
          {...props}
          invitePlayersTabRef={invitePlayersTabRef}
          chatTabRef={chatTabRef}
        />
        <Footer
          currentRoute={props.route.name}
          invitePlayersTabRef={invitePlayersTabRef}
          chatTabRef={chatTabRef}
        />
      </View>
    );
  };
};

// Defined outside component so the component type reference is stable across re-renders.
// If defined inside, every render creates a new type and React unmounts/remounts the screen.
const WrappedBingo = LayoutWrapper(BingoScreen);
const WrappedChat = LayoutWrapper(ChatScreen);
const WrappedLeaderboard = LayoutWrapper(LeaderboardScreen);
const WrappedParticipantManagement = LayoutWrapper(ParticipantManagementScreen);
const WrappedSettings = LayoutWrapper(SettingsScreen);
const WrappedWeighIn = LayoutWrapper(WeighInScreen);

export const PlayChallengeNavigator = () => {
  // Narrow selector: only re-render when is_organizer changes, not on every store update
  const isOrganizer = useChallengesStore(state => state.selectedChallenge?.is_organizer ?? false);

  // Read once at mount via getState() — no store subscription needed since
  // initialRouteName is only consumed by React Navigation on first mount.
  // Guard against a persisted ParticipantManagement tab when the user is not an organizer.
  const initialRouteName = useRef(
    ((): keyof ChallengeStackParamList => {
      const { lastTab, lastTabChallengeId } = useLastChallengeStore.getState();
      const currentChallengeId = useChallengesStore.getState().selectedChallenge?.id;
      const isOrganizerAtMount = useChallengesStore.getState().selectedChallenge?.is_organizer ?? false;

      // Only restore the last tab if it was recorded for this specific challenge
      const tab = (lastTabChallengeId === currentChallengeId && lastTab)
        ? lastTab
        : SCREEN_NAMES._PLAY_CHALLENGE.BINGO;

      if (tab === SCREEN_NAMES._PLAY_CHALLENGE.PARTICIPANT_MANAGEMENT && !isOrganizerAtMount) {
        return SCREEN_NAMES._PLAY_CHALLENGE.BINGO;
      }
      return tab as keyof ChallengeStackParamList;
    })()
  ).current;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name={SCREEN_NAMES._PLAY_CHALLENGE.BINGO} component={WrappedBingo} />
      <Stack.Screen name={SCREEN_NAMES._PLAY_CHALLENGE.CHAT} component={WrappedChat} />
      <Stack.Screen name={SCREEN_NAMES._PLAY_CHALLENGE.LEADERBOARD} component={WrappedLeaderboard} />
      {isOrganizer && (
        <Stack.Screen
          name={SCREEN_NAMES._PLAY_CHALLENGE.PARTICIPANT_MANAGEMENT}
          component={WrappedParticipantManagement}
        />
      )}
      <Stack.Screen name={SCREEN_NAMES._PLAY_CHALLENGE.SETTINGS} component={WrappedSettings} />
      <Stack.Screen name={SCREEN_NAMES._PLAY_CHALLENGE.WEIGH_IN} component={WrappedWeighIn} />
    </Stack.Navigator>
  );
};

