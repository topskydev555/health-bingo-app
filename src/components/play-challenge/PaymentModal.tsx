import { usePaymentSheet } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { usePlans, useToast } from '../../hooks';
import {
  confirmPayment,
  getClientSecret,
  payWithPromoCode,
  validatePromoCode,
} from '../../services';
import { useChallengesStore } from '../../store';
import { COLORS, FONTS } from '../../theme';
import { CustomButton, Modal } from '../common';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
}) => {
  const { selectedChallenge, fetchChallenges, selectChallenge } =
    useChallengesStore();
  const { getPlanById } = usePlans();
  const { showToast } = useToast();
  const {
    initPaymentSheet,
    presentPaymentSheet,
    loading: paymentLoading,
  } = usePaymentSheet();

  const [promoCode, setPromoCode] = useState('');
  const [isValidatePromoCode, setIsValidatePromoCode] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const planDetails = getPlanById(selectedChallenge?.plan || '');

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      return;
    }

    try {
      setIsValidatingPromo(true);
      const result = await validatePromoCode(promoCode);

      if (result.success) {
        setIsValidatePromoCode(true);
      } else {
        setIsValidatePromoCode(false);
        showToast('Invalid promo code', 'error');
      }
    } catch (error) {
      setIsValidatePromoCode(false);
      showToast('Failed to validate promo code', 'error');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const initializePaymentSheet = async (client_secret: string) => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Health Bingo',
      paymentIntentClientSecret: client_secret,
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
      showToast(
        `Failed to initialize payment: ${error.message || error.code}`,
        'error'
      );
      return false;
    }

    return true;
  };

  const handlePayNow = async () => {
    if (!selectedChallenge) return;

    if (isValidatePromoCode) {
      if (!promoCode.trim()) {
        showToast('Please enter a promo code', 'error');
        return;
      }

      setIsProcessingPayment(true);
      try {
        const result = await payWithPromoCode(selectedChallenge.id, promoCode);

        if (result.success) {
          showToast('Payment successful!', 'success');
          await fetchChallenges();
          selectChallenge(selectedChallenge.id);
          onPaymentSuccess();
          setPromoCode('');
          setIsValidatePromoCode(false);
        } else {
          showToast(result.error || 'Payment failed', 'error');
        }
      } catch (error) {
        showToast('An error occurred during payment', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      setIsProcessingPayment(true);

      try {
        const clientSecret = await getClientSecret(
          selectedChallenge.payment_intent_id as string
        );

        if (!clientSecret) {
          showToast('Payment information not available', 'error');
          setIsProcessingPayment(false);
          return;
        }

        const isInitialized = await initializePaymentSheet(clientSecret);

        if (!isInitialized) {
          setIsProcessingPayment(false);
          return;
        }

        const { error } = await presentPaymentSheet();

        if (error) {
          if (error.code !== 'Canceled') {
            showToast(
              `Payment failed: ${error.message || error.code
              }. Please try again.`,
              'error'
            );
          }
          setIsProcessingPayment(false);
          return;
        }

        try {
          if (selectedChallenge?.payment_intent_id) {
            const confirmResult = await confirmPayment(
              selectedChallenge.id,
              selectedChallenge.payment_intent_id
            );

            if (confirmResult.success) {
              showToast('Payment successful!', 'success');
              await fetchChallenges();
              selectChallenge(selectedChallenge.id);
              onPaymentSuccess();
            } else {
              showToast(
                'Payment processed but failed to update status. Please contact support.',
                'info'
              );
            }
          } else {
            showToast('Payment successful!', 'success');
            await fetchChallenges();
            selectChallenge(selectedChallenge.id);
            onPaymentSuccess();
          }
        } catch (confirmError) {
          showToast(
            'Payment processed but failed to update status. Please contact support.',
            'info'
          );
        }
      } catch (error) {
        showToast('An error occurred during payment', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  const handleClose = () => {
    setPromoCode('');
    setIsValidatePromoCode(false);
    onClose();
  };

  if (!selectedChallenge) return null;

  return (
    <Modal visible={visible} onClose={handleClose} widthPercentage={90}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.modalTitle}>Payment</Text>

        <View style={styles.planContainerPayment}>
          <Text style={styles.planNameText}>{planDetails?.name || 'Plan'}</Text>
          <View style={styles.priceContainer}>
            {isValidatePromoCode ? (
              <>
                <Text style={styles.originalPrice}>
                  $
                  {planDetails?.price
                    ? (planDetails.price / 100).toFixed(2)
                    : '0.00'}{' '}
                  USD
                </Text>
                <Text style={styles.discountedPrice}>$0.00 USD</Text>
              </>
            ) : (
              <Text style={styles.planPrice}>
                $
                {planDetails?.price
                  ? (planDetails.price / 100).toFixed(2)
                  : '0.00'}{' '}
                USD
              </Text>
            )}
          </View>
        </View>

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

        <View style={styles.modalButtonGroup}>
          <CustomButton
            text={isValidatePromoCode ? 'Apply Promo & Pay' : 'Pay Now'}
            onPress={handlePayNow}
            variant="primary"
            buttonStyle={styles.payButton}
            loading={isProcessingPayment || paymentLoading}
          />
          <CustomButton
            text="Cancel"
            onPress={handleClose}
            variant="outline"
            buttonStyle={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  planContainerPayment: {
    backgroundColor: '#E8F5E8',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planNameText: {
    fontSize: 18,
    fontFamily: FONTS.family.poppinsBold,
    color: '#166534',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountedPrice: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  promoContainer: {
    marginBottom: 24,
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
    backgroundColor: COLORS.primary.white,
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
  modalButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  payButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
});
