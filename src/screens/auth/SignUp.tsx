import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppleSignInButton, AuthLogo } from '../../components/auth';
import { CustomButton, Input } from '../../components/common';
import { SCREEN_NAMES } from '../../constants';
import { useAuth, useToast } from '../../hooks';
import { COLORS, FONTS } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation.type';
import { isAppleCancel, requestAppleCredential } from '../../utils';

export const SignUpScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { signUp, loading, signInWithApple } = useAuth();
  const { showToast } = useToast();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const isFormValid = useMemo(
    () =>
      firstName &&
      lastName &&
      email &&
      password &&
      confirmPassword &&
      agreeTerms,
    [firstName, lastName, email, password, confirmPassword, agreeTerms]
  );

  const handleSubmit = async () => {
    if (!isFormValid) {
      showToast('Please fill all fields and agree to terms', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const { data: user } = await signUp(firstName, lastName, email, password);

      if (!user.id) {
        showToast('Failed to get user information', 'error');
        return;
      }

      navigation.navigate(SCREEN_NAMES._AUTH.VERIFY_CODE, {
        email: user.email,
        type: 'account_activation',
      });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Something went wrong',
        'error'
      );
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await requestAppleCredential();

      if (credential) {
        await signInWithApple(
          credential.identityToken,
          credential.fullName,
          credential.email
        );
        navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
      } else {
        showToast('Apple Sign In failed', 'error');
      }
    } catch (err) {
      if (isAppleCancel(err)) {
        showToast('Sign in was cancelled', 'info');
      } else {
        showToast('Apple Sign In failed', 'error');
      }
    }
  };

  const handleSignInNavigation = () => {
    navigation.navigate(SCREEN_NAMES._AUTH.SIGN_IN as never);
  };

  const toggleTermsAgreement = () => {
    setAgreeTerms(!agreeTerms);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthLogo />

        <View style={styles.header}>
          <Text style={styles.title}>SIGN UP</Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Enter your first name ..."
            value={firstName}
            onChangeText={setFirstName}
            inputStyle={styles.input}
          />

          <Input
            placeholder="Enter your last name ..."
            value={lastName}
            onChangeText={setLastName}
            inputStyle={styles.input}
          />

          <Input
            placeholder="Enter your email ..."
            value={email}
            onChangeText={setEmail}
            inputStyle={styles.input}
          />

          <Input
            placeholder="Enter your password ..."
            value={password}
            onChangeText={setPassword}
            inputStyle={styles.input}
            secureTextEntry
          />

          <Input
            placeholder="Confirm your password ..."
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            inputStyle={styles.input}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={toggleTermsAgreement}
          >
            <View
              style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
            >
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <CustomButton
            text="Sign Up"
            onPress={handleSubmit}
            buttonStyle={styles.buttonStyle}
            textStyle={styles.buttonTextStyle}
            disabled={!isFormValid}
            loading={loading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          <AppleSignInButton onPress={handleAppleSignIn} />

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <CustomButton
              text="Sign In"
              onPress={handleSignInNavigation}
              variant="default"
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonTextStyle}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
    fontSize: 28,
  },
  form: {
    gap: 12,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray.mediumDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: FONTS.family.poppinsMedium,
    backgroundColor: COLORS.primary.white,
    fontSize: 14,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.gray.mediumDark,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary.green,
    borderColor: COLORS.primary.green,
  },
  checkmark: {
    color: COLORS.primary.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray.dark,
    fontFamily: FONTS.family.poppinsRegular,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary.blue,
    fontFamily: FONTS.family.poppinsMedium,
  },
  buttonStyle: {
    height: 48,
  },
  buttonTextStyle: {
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray.mediumDark,
  },
  dividerText: {
    marginHorizontal: 6,
    color: COLORS.gray.mediumDark,
    fontFamily: FONTS.family.poppinsMedium,
    fontSize: 12,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signInText: {
    color: COLORS.gray.mediumDark,
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
  },
  bottomSpacing: {
    height: 48,
  },
});
