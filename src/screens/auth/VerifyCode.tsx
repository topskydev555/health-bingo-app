import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthLogo } from '../../components/auth';
import { CustomButton, Input } from '../../components/common';
import { SCREEN_NAMES } from '../../constants';
import { useAuth, useToast } from '../../hooks';
import { COLORS, FONTS } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation.type';

type VerifyCodeScreenRouteProp = RouteProp<
  AuthStackParamList,
  typeof SCREEN_NAMES._AUTH.VERIFY_CODE
>;

export const VerifyCodeScreen: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { showToast } = useToast();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<VerifyCodeScreenRouteProp>();
  const { email, type, password } = route.params;
  const { verifyCode, sendVerificationCode } = useAuth();

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      showToast('Please enter verification code', 'error');
      return;
    }

    try {
      setVerifyLoading(true);
      await verifyCode(email, verificationCode, type, password);
      navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to verify email',
        'error'
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      await sendVerificationCode(email, type);
      showToast('Verification email sent successfully', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to resend email',
        'error'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigation.navigate(SCREEN_NAMES._AUTH.SIGN_IN as never);
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
          <Text style={styles.title}>VERIFY CODE</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.instructionText}>
            We've sent a verification code to your email. Please enter the code
            below to verify your account.
          </Text>

          <Input
            value={verificationCode}
            onChangeText={setVerificationCode}
            inputStyle={styles.input}
            keyboardType="default"
            maxLength={24}
            autoCapitalize="characters"
          />

          <CustomButton
            text="Verify Code"
            onPress={handleVerifyCode}
            buttonStyle={styles.buttonStyle}
            textStyle={styles.buttonTextStyle}
            disabled={!verificationCode}
            loading={verifyLoading}
          />

          <Text style={styles.subInstructionText}>
            Didn't receive the code? Check your spam folder or click the button
            below to resend.
          </Text>

          <CustomButton
            text="Resend Code"
            onPress={handleResendCode}
            variant="outline"
            buttonStyle={styles.buttonStyle}
            textStyle={styles.buttonTextStyle}
            loading={resendLoading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.backToSignInContainer}>
            <Text style={styles.backToSignInText}>Already verified? </Text>
            <CustomButton
              text="Sign In"
              onPress={handleBackToSignIn}
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
  instructionText: {
    fontSize: 16,
    color: COLORS.gray.dark,
    fontFamily: FONTS.family.poppinsRegular,
    lineHeight: 24,
    textAlign: 'center',
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
    textAlign: 'center',
    letterSpacing: 4,
  },
  buttonStyle: {
    height: 48,
  },
  buttonTextStyle: {
    fontSize: 14,
  },
  subInstructionText: {
    fontSize: 14,
    color: COLORS.gray.dark,
    fontFamily: FONTS.family.poppinsRegular,
    lineHeight: 20,
    textAlign: 'center',
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
  backToSignInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToSignInText: {
    color: COLORS.gray.mediumDark,
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 14,
  },
  bottomSpacing: {
    height: 24,
  },
});
