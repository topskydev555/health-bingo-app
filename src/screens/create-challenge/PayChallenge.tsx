import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CustomButton } from '../../components/common';
import { DashboardHeader } from '../../components/dashboard';
import { SCREEN_NAMES } from '../../constants/screens';
import { usePlans, useToast } from '../../hooks';
import {
  confirmPayment,
  payWithPromoCode,
  validatePromoCode,
} from '../../services';
import { COLORS, FONTS } from '../../theme';
import { CreateChallengeStackParamList } from '../../types/navigation.type';

type ChallengePublishedRouteProp = RouteProp<
  CreateChallengeStackParamList,
  typeof SCREEN_NAMES._CREATE_CHALLENGE.PAY_CHALLENGE
>;

export const PayChallenge: React.FC = () => {
  const route = useRoute<ChallengePublishedRouteProp>();
  const { challenge } = route.params;
  const { showToast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [isValidatePromoCode, setIsValidatePromoCode] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet, loading } = usePaymentSheet();
  const { getPlanById } = usePlans();

  const planDetails = getPlanById(challenge.plan as string);

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      return;
    }

    try {
      const result = await validatePromoCode(promoCode);

      if (result.success) {
        setIsValidatePromoCode(true);
      } else {
        setIsValidatePromoCode(false);
      }
    } catch (error) {
      setIsValidatePromoCode(false);
      console.error('Error validating promo code:', error);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const initializePaymentSheet = async () => {
    if (!challenge?.client_secret) {
      showToast('Payment information not available', 'error');
      return false;
    }

    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Health Bingo',
      paymentIntentClientSecret: challenge.client_secret,
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: 'Challenge Payment',
      },
      applePay: {
        merchantCountryCode: 'AU',
      },
      googlePay: {
        merchantCountryCode: 'AU',
        testEnv: __DEV__,
        currencyCode: 'usd',
      },
    });

    if (error) {
      console.log('Payment sheet initialization error:', error);
      showToast(
        `Failed to initialize payment: ${error.message || error.code}`,
        'error'
      );
      return false;
    }

    console.log('Payment sheet initialized successfully');
    return true;
  };

  const handlePayNow = async () => {
    if (isValidatePromoCode) {
      // Pay with promo code
      if (!promoCode.trim()) {
        showToast('Please enter a promo code', 'error');
        return;
      }

      setIsProcessingPayment(true);
      try {
        const result = await payWithPromoCode(challenge.id, promoCode);

        if (result.success) {
          showToast(`Payment successful!`, 'success');
          navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
        } else {
          showToast(result.error || 'Payment failed', 'error');
        }
      } catch (error) {
        showToast('An error occurred during payment', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      // Pay with Stripe
      setIsProcessingPayment(true);

      try {
        const isInitialized = await initializePaymentSheet();

        if (!isInitialized) {
          console.log('Payment sheet initialization failed');
          return;
        }

        const { error } = await presentPaymentSheet();

        if (error) {
          console.log('Stripe Payment Error:', error);
          if (error.code !== 'Canceled') {
            showToast(
              `Payment failed: ${error.message || error.code
              }. Please try again.`,
              'error'
            );
          }
        } else {
          // Payment succeeded, confirm with backend
          try {
            if (challenge?.payment_intent_id) {
              const confirmResult = await confirmPayment(
                challenge.id,
                challenge.payment_intent_id
              );

              if (confirmResult.success) {
                showToast('Payment successful!', 'success');
                navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
              } else {
                showToast(
                  'Payment processed but failed to update status. Please contact support.',
                  'info'
                );
              }
            } else {
              showToast('Payment successful!', 'success');
              navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
            }
          } catch (confirmError) {
            showToast(
              'Payment processed but failed to update status. Please contact support.',
              'info'
            );
          }
        }
      } catch (error) {
        showToast('An error occurred during payment', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  return (
    <>
      <DashboardHeader title="Challenge Published" showProfileIcon={false} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Details */}
        <View style={styles.planContainer}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{planDetails?.name || 'Plan'}</Text>
            <View style={styles.priceContainer}>
              {isValidatePromoCode ? (
                <>
                  <Text style={styles.originalPrice}>
                    ${((planDetails?.price ?? 0) / 100).toFixed(2)} USD
                  </Text>
                  <Text style={styles.discountedPrice}>$0.00 USD</Text>
                </>
              ) : (
                <Text style={styles.planPrice}>
                  ${((planDetails?.price ?? 0) / 100).toFixed(2)} USD
                </Text>
              )}
            </View>
          </View>

          <View style={styles.featuresContainer}>
            {planDetails?.features?.map((feature, index) => (
              <Text key={index} style={styles.featureText}>
                • {feature}
              </Text>
            ))}
          </View>
        </View>

        {/* Promo Code Section */}
        {challenge?.status === 'unpaid' && (
          <View style={styles.promoContainer}>
            <Text style={styles.promoTitle}>Have a promo code?</Text>
            <View style={styles.promoInputContainer}>
              <TextInput
                placeholder="Enter promo code"
                value={promoCode}
                onChangeText={setPromoCode}
                style={styles.promoInput}
              />
              <CustomButton
                onPress={handleValidatePromo}
                disabled={isValidatingPromo || !promoCode.trim()}
                loading={isValidatingPromo}
                variant={isValidatePromoCode ? 'primary' : 'outline'}
                buttonStyle={styles.validateButton}
                icon={
                  !isValidatingPromo ? (
                    <Icon
                      name={isValidatePromoCode ? 'check-circle' : 'check'}
                      size={20}
                      color={isValidatePromoCode ? '#FFFFFF' : '#22C55E'}
                    />
                  ) : undefined
                }
              />
            </View>
          </View>
        )}

        {/* Payment Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {challenge?.status === 'unpaid' ? (
              <CustomButton
                text={isValidatePromoCode ? 'Apply Promo & Pay' : 'Pay Now'}
                onPress={handlePayNow}
                variant="primary"
                buttonStyle={styles.button}
                textStyle={styles.buttonText}
                loading={isProcessingPayment || loading}
              />
            ) : (
              <CustomButton
                text="Start Challenge"
                onPress={() =>
                  navigation.navigate(SCREEN_NAMES.DASHBOARD as never)
                }
                variant="primary"
                buttonStyle={styles.button}
                textStyle={{
                  ...styles.buttonText,
                  color: COLORS.primary.white,
                }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  planContainer: {
    backgroundColor: '#E8F5E8',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 22,
    fontFamily: FONTS.family.poppinsBold,
    fontWeight: 'bold',
    color: '#166534',
    textAlign: 'left',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  planPrice: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: FONTS.family.poppinsRegular,
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountedPrice: {
    color: '#22C55E',
    fontSize: 16,
    fontFamily: FONTS.family.poppinsBold,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: 10,
  },
  featureRow: {
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'left',
    lineHeight: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'left',
    lineHeight: 20,
  },
  promoContainer: {
    marginBottom: 32,
  },
  promoTitle: {
    fontSize: 16,
    fontFamily: FONTS.family.poppinsMedium,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray.lightMedium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: FONTS.family.poppinsRegular,
  },
  validateButton: {
    width: 56,
    height: 48,
    minWidth: 56,
    maxWidth: 56,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 8,
    flexShrink: 0,
    flexGrow: 0,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: FONTS.family.poppinsBold,
  },
});
