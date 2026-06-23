import { AppleButton } from '@invertase/react-native-apple-authentication';
import React from 'react';
import { StyleSheet } from 'react-native';

interface AppleSignInButtonProps {
  onPress: () => void;
}

// Uses Apple's official button (required styling per Guideline 4.8 / HIG). Render
// only on iOS — Sign in with Apple is not available on Android.
export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onPress,
}) => {
  return (
    <AppleButton
      buttonStyle={AppleButton.Style.BLACK}
      buttonType={AppleButton.Type.SIGN_IN}
      style={styles.button}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    marginBottom: 16,
  },
});
