import { AppleButton } from '@invertase/react-native-apple-authentication';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS, FONTS } from '../../theme';

interface AppleSignInButtonProps {
  onPress: () => void;
}

// iOS renders Apple's official native button (required styling per Guideline 4.8).
// Android has no native button, so we render an HIG-compliant black button that
// drives the web-OAuth flow.
export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onPress,
}) => {
  if (Platform.OS === 'ios') {
    return (
      <AppleButton
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        cornerRadius={24}
        style={styles.iosButton}
        onPress={onPress}
      />
    );
  }

  return (
    <TouchableOpacity
      style={styles.androidButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <FontAwesome
        name="apple"
        size={18}
        color={COLORS.primary.white}
        style={styles.androidIcon}
      />
      <Text style={styles.androidText}>Sign in with Apple</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iosButton: {
    width: '100%',
    height: 48,
    marginBottom: 16,
  },
  androidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.black,
    borderRadius: 999,
    height: 48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  androidIcon: {
    marginRight: 10,
    marginTop: -2,
  },
  androidText: {
    color: COLORS.primary.white,
    fontFamily: FONTS.family.poppinsMedium,
    fontSize: 14,
  },
});
