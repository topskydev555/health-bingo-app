import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SCREEN_NAMES } from '../../constants';
import { useAuth } from '../../hooks';
import { COLORS, FONTS } from '../../theme';
import { Dropdown } from '../common/Dropdown';
import { ProfileIcon } from '../common/ProfileIcon';

interface DashboardHeaderProps {
  title?: string;
  action?: React.ReactNode;
  showProfileIcon?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = 'Dashboard',
  action,
  showProfileIcon = true,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleProfileSettings = () => {
    const parent = navigation.getParent<NavigationProp<ParamListBase>>();
    if (parent) {
      parent.navigate(SCREEN_NAMES.DASHBOARD, {
        screen: SCREEN_NAMES._DASHBOARD.PROFILE,
      });
    } else {
      navigation.navigate(SCREEN_NAMES._DASHBOARD.PROFILE as never);
    }
  };

  const handleLogout = () => {
    logout();
    navigation.navigate(SCREEN_NAMES.AUTH as never);
  };

  const dropdownItems = [
    {
      label: 'Profile',
      onPress: handleProfileSettings,
    },
    {
      label: 'Logout',
      onPress: handleLogout,
      destructive: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.rightSection}>
          {action}
          {showProfileIcon && (
            <Dropdown
              trigger={
                <ProfileIcon
                  image={user?.image}
                  initialsText={
                    (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')
                  }
                  size={40}
                />
              }
              items={dropdownItems}
              visible={dropdownVisible}
              onToggle={() => setDropdownVisible(!dropdownVisible)}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary.white,
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.light,
    shadowColor: COLORS.primary.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
