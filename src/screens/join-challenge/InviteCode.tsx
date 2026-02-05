import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CustomButton } from '../../components/common';
import { DashboardHeader } from '../../components/dashboard';
import { SCREEN_NAMES } from '../../constants';
import { useToast } from '../../hooks/useToast';
import { getChallengeByCode } from '../../services';
import { COLORS, FONTS } from '../../theme';

const DEVICE_HEIGHT = Dimensions.get('window').height;

export const InviteCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { showToast } = useToast();

  const handleEnterCode = async () => {
    try {
      setLoading(true);
      const challenge = await getChallengeByCode(code);

      (navigation as any).navigate(SCREEN_NAMES._JOIN_CHALLENGE.JOIN, {
        challenge,
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Something went wrong',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    navigation.navigate(SCREEN_NAMES._JOIN_CHALLENGE.SCAN_QR_CODE as never);
  };

  const handleCancel = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(SCREEN_NAMES.DASHBOARD, {
        screen: SCREEN_NAMES._DASHBOARD.CHALLENGES_LIST,
      });
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
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/dashboard/mark-simple.png')}
          style={styles.mark}
        />

        <Text style={styles.title}>Join a Challenge</Text>

        <Text style={styles.subtitle}>
          Enter the invite code or link you received.
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter code here"
            placeholderTextColor={COLORS.gray.mediumDark}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>

        <CustomButton
          text="Enter Code"
          onPress={handleEnterCode}
          buttonStyle={styles.joinButton}
          textStyle={styles.joinButtonText}
          loading={loading}
          disabled={code.length !== 8}
        />

        <CustomButton
          text="Can’t find your code? Scan QR instead."
          onPress={handleScanQR}
          buttonStyle={styles.hint}
          textStyle={styles.hintLink}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.blue,
    alignItems: 'center',
    paddingTop: DEVICE_HEIGHT * 0.08,
    paddingHorizontal: 20,
  },
  mark: {
    width: 300,
    height: 180,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 28,
    color: COLORS.primary.white,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
    color: COLORS.primary.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: COLORS.primary.white,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 0,
    height: 48,
  },
  input: {
    height: '100%',
    paddingVertical: 0,
    textAlignVertical: 'center',
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.text.primary,
    fontSize: 16,
  },
  joinButton: {
    marginTop: 48,
    width: '100%',
    height: 48,
  },
  joinButtonText: {
    color: COLORS.primary.white,
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  hint: {
    color: COLORS.primary.white,
    backgroundColor: 'transparent',
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 12,
    opacity: 0.9,
  },
  hintLink: {
    marginTop: 16,
    color: COLORS.primary.pink,
    fontFamily: FONTS.family.poppinsMedium,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
