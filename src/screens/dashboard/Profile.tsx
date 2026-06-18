import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { CustomButton } from '../../components/common';
import { ProfileIcon } from '../../components/common/ProfileIcon';
import {
  CountrySelector,
  DashboardHeader,
  ProfileInput,
  TimezoneSelector,
} from '../../components/dashboard';
import { SCREEN_NAMES } from '../../constants';
import { useAuth, useUser } from '../../hooks';
import { COLORS, FONTS } from '../../theme';

type ProfileMode = 'setup' | 'view' | 'edit';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    user,
    firstName,
    lastName,
    displayName,
    timezone,
    country,
    uploadAvatar,
    removeAvatar,
    setFirstName,
    setLastName,
    setDisplayName,
    setTimezone,
    setCountry,
    saveProfile,
  } = useUser();

  const { deleteAccount } = useAuth();

  const [mode, setMode] = useState<ProfileMode>('view');

  useEffect(() => {
    if (user && (!user.displayName || !user.country || !user.timezone)) {
      setMode('setup');
    } else {
      setMode('view');
    }
  }, []);

  const goToDashboard = () => {
    navigation.navigate(SCREEN_NAMES._DASHBOARD.CHALLENGES_LIST as never);
  };

  const handleSave = async () => {
    await saveProfile();
    if (mode === 'edit') {
      setMode('view');
    } else {
      navigation.navigate(SCREEN_NAMES._DASHBOARD.CHALLENGES_LIST as never);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              navigation.navigate(SCREEN_NAMES.AUTH as never);
            } catch (error) {
              Alert.alert(
                'Unable to delete account',
                error instanceof Error
                  ? error.message
                  : 'Something went wrong. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleRemoveImage = async () => {
    if (!user?.image) {
      return;
    }
    try {
      await removeAvatar();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to remove image';
      console.log(message);
    }
  };

  return (
    <View style={styles.wrapper}>
      {mode !== 'setup' && (
        <DashboardHeader
          title="Profile"
          action={
            <TouchableOpacity onPress={goToDashboard}>
              <Text style={{ color: COLORS.primary.green, marginRight: 4 }}>
                Dashboard
              </Text>
            </TouchableOpacity>
          }
        />
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePictureWrapper}>
            <ProfileIcon
              image={user?.image}
              initialsText={
                (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')
              }
              size={100}
              editable={mode !== 'view'}
              onUpload={async (imageUri: string) => {
                await uploadAvatar(imageUri);
              }}
            />
            {mode !== 'view' && user?.image ? (
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={handleRemoveImage}
              >
                <MaterialIcons
                  name="delete"
                  size={20}
                  color={COLORS.primary.red}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {mode === 'setup'
              ? 'Profile set up'
              : `${user?.firstName} ${user?.lastName}`}
          </Text>

          {mode !== 'setup' && (
            <Text style={styles.subTitle}>{user?.email}</Text>
          )}
        </View>

        {mode !== 'setup' && (
          <>
            <ProfileInput
              mode={mode}
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <ProfileInput
              mode={mode}
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
          </>
        )}

        <ProfileInput
          mode={mode !== 'view' ? 'edit' : 'view'}
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <CountrySelector
          mode={mode !== 'view' ? 'edit' : 'view'}
          countryCode={country}
          onSelect={setCountry}
        />

        <TimezoneSelector
          mode={mode !== 'view' ? 'edit' : 'view'}
          timezone={timezone}
          onSelect={setTimezone}
        />

        <View style={styles.buttonContainer}>
          {mode === 'view' && (
            <CustomButton
              text="Edit"
              onPress={() => setMode('edit')}
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonTextStyle}
            />
          )}
          {mode === 'edit' && (
            <>
              <CustomButton
                text="Cancel"
                onPress={() => setMode('view')}
                buttonStyle={styles.shortbuttonStyle}
                textStyle={styles.buttonTextStyle}
              />
              <CustomButton
                text="Save"
                onPress={handleSave}
                buttonStyle={styles.shortbuttonStyle}
                textStyle={styles.buttonTextStyle}
              />
            </>
          )}
          {mode === 'setup' && (
            <CustomButton
              text="Save"
              onPress={handleSave}
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonTextStyle}
            />
          )}
        </View>

        {mode === 'view' && (
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.primary.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.white,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePictureWrapper: {
    position: 'relative',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary.white,
    borderRadius: 16,
    padding: 6,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: FONTS.size['2xl'],
    color: COLORS.primary.blue,
    textAlign: 'center',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonStyle: {
    height: 48,
    width: '100%',
  },
  shortbuttonStyle: {
    height: 48,
    width: '48%',
  },
  buttonTextStyle: {
    fontSize: FONTS.size.base,
  },
  deleteAccountButton: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteAccountText: {
    color: COLORS.primary.red,
    fontFamily: FONTS.family.poppinsMedium,
    fontSize: FONTS.size.base,
  },
});
