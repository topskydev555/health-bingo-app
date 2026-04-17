import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SCREEN_NAMES } from '../../constants/screens';
import { useAuth } from '../../hooks';
import { useChallengesStore } from '../../store';
import { COLORS, FONTS } from '../../theme';
import { Challenge } from '../../types/challenge.type';
import { CustomButton } from '../common';
import { Sidebar } from './Sidebar';

type Props = {
  title: string;
};

export const Header: React.FC<Props> = ({ title }) => {
  const navigation = useNavigation();
  const { selectChallenge, selectedChallenge } = useChallengesStore();
  const [showSidebar, setShowSidebar] = useState(false);

  const { logout } = useAuth();

  const isProPlan = selectedChallenge?.plan === 'pro';

  const handleHomePress = () => {
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

  const handleSwitchChallenge = (challenge: Challenge) => {
    selectChallenge(challenge.id);
    setShowSidebar(false);
    navigation.navigate(SCREEN_NAMES.PLAY_CHALLENGE as never);
  };

  const handleProfile = () => {
    setShowSidebar(false);
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(SCREEN_NAMES.DASHBOARD, {
        screen: SCREEN_NAMES._DASHBOARD.PROFILE,
      });
    }
  };

  const handleLogout = async () => {
    await logout();

    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(SCREEN_NAMES.AUTH);
    }

    setShowSidebar(false);
    // Handle logout logic
  };

  const handleGoToDashboard = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(SCREEN_NAMES.DASHBOARD, {
        screen: SCREEN_NAMES._DASHBOARD.CHALLENGES_LIST,
      });
    }
  };

  const handleGoToInputWeight = () => {
    navigation.navigate(SCREEN_NAMES._PLAY_CHALLENGE.WEIGH_IN as never);
  };

  return (
    <View style={styles.container}>
      <CustomButton
        onPress={handleHomePress}
        variant="default"
        buttonStyle={styles.iconButton}
        icon={<Icon name="menu" size={24} color={COLORS.primary.blue} />}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {isProPlan && (
        <CustomButton
          onPress={handleGoToInputWeight}
          variant="default"
          buttonStyle={styles.iconButton}
          icon={
            <Image
              source={require('../../assets/images/play-challenge/input-weight.png')}
              style={styles.weightIcon}
              resizeMode="contain"
            />
          }
        />
      )}

      <Sidebar
        visible={showSidebar}
        onClose={handleCloseSidebar}
        onSwitchChallenge={handleSwitchChallenge}
        onProfile={handleProfile}
        onLogout={handleLogout}
        onGoToDashboard={handleGoToDashboard}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    zIndex: 1000,
  },
  iconButton: {
    width: 48,
    height: 48,
    padding: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
    textAlign: 'center',
  },
  weightIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primary.blue,
  },
});
