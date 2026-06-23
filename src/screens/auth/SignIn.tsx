import {
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AppleSignInButton,
  AuthLogo,
  GoogleSignInButton,
} from '../../components/auth';
import { CustomButton, Input } from '../../components/common';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID, SCREEN_NAMES } from '../../constants';
import { useAuth, useToast } from '../../hooks';
import { COLORS, FONTS } from '../../theme';
import { AuthStackParamList } from '../../types';

export const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, loading, signInWithGoogle, signInWithApple, error } =
    useAuth();
  const { showToast } = useToast();

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
      hostedDomain: '',
      forceCodeForRefreshToken: false,
      accountName: '',
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const activated = await signIn(email, password);
      if (activated) {
        navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
      } else {
        navigation.navigate(SCREEN_NAMES._AUTH.VERIFY_CODE, {
          email,
          type: 'account_activation',
        });
      }
    } catch (err) {
      showToast(error ?? 'Failed to sign in', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        await signInWithGoogle(userInfo.data.idToken);
        navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        showToast('Sign in was cancelled', 'info');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showToast('Sign in is already in progress', 'info');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast('Play services not available', 'error');
      } else {
        showToast('Google Sign In failed', 'error');
      }
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const { identityToken, fullName, email } = appleAuthRequestResponse;

      if (identityToken) {
        await signInWithApple(identityToken, fullName, email);
        navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
      } else {
        showToast('Apple Sign In failed', 'error');
      }
    } catch (err: any) {
      if (err.code === appleAuth.Error.CANCELED) {
        showToast('Sign in was cancelled', 'info');
      } else {
        showToast('Apple Sign In failed', 'error');
      }
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate(SCREEN_NAMES._AUTH.FORGOT_PASSWORD);
  };

  const handleCreateAccount = () => {
    navigation.navigate(SCREEN_NAMES._AUTH.SIGN_UP);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthLogo />

        <View style={styles.header}>
          <Text style={styles.title}>SIGN IN</Text>
        </View>

        <View style={styles.form}>
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

          <View style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>
              Forgot your password?{' '}
            </Text>
            <CustomButton
              text="Reset it"
              onPress={handleForgotPassword}
              variant="default"
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonTextStyle}
            />
          </View>

          <CustomButton
            text="Sign In"
            onPress={handleSubmit}
            buttonStyle={styles.buttonStyle}
            textStyle={styles.buttonTextStyle}
            disabled={!email || !password}
            loading={loading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSignInButton
            onPress={handleGoogleSignIn}
            disabled={loading}
            loading={loading}
          />

          {Platform.OS === 'ios' && appleAuth.isSupported && (
            <AppleSignInButton onPress={handleAppleSignIn} />
          )}

          <View style={styles.createAccountContainer}>
            <Text style={styles.createAccountText}>
              Don't have an account?{' '}
            </Text>
            <CustomButton
              text="Create one"
              onPress={handleCreateAccount}
              variant="default"
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonTextStyle}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
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
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 4,
  },
  forgotPasswordText: {
    color: COLORS.gray.mediumDark,
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountText: {
    color: COLORS.gray.mediumDark,
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
  },
  buttonStyle: {
    height: 48,
  },
  buttonTextStyle: {
    fontSize: 14,
  },
  bottomSpacing: {
    height: 24,
  },
});
