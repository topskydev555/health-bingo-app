import { usePaymentSheet } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useToast } from '../../hooks';

import {
  confirmChallengeUpgrade,
  upgradeChallengeToPro,
} from '../../services/challenge.service';
import { useChallengesStore } from '../../store';
import { COLORS, FONTS } from '../../theme';
import { CustomButton, Modal } from '../common';

interface UpgradeToProModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export const UpgradeToProModal: React.FC<UpgradeToProModalProps> = ({
  visible,
  onClose,
  onUpgradeSuccess,
}) => {
  const { selectedChallenge, fetchChallenges, selectChallenge } =
    useChallengesStore();
  const { showToast } = useToast();
  const {
    initPaymentSheet,
    presentPaymentSheet,
    loading: paymentLoading,
  } = usePaymentSheet();

  const [isProcessing, setIsProcessing] = useState(false);

  const initializePaymentSheet = async (clientSecret: string) => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Health Bingo',
      paymentIntentClientSecret: clientSecret,
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: { name: 'Plan Upgrade' },
      applePay: { merchantCountryCode: 'AU' },
      googlePay: {
        merchantCountryCode: 'AU',
        testEnv: __DEV__,
        currencyCode: 'usd',
      },
    });

    if (error) {
      showToast(`Failed to initialise payment: ${error.message || error.code}`, 'error');
      return false;
    }
    return true;
  };

  const handleUpgrade = async () => {
    if (!selectedChallenge) return;

    setIsProcessing(true);
    try {
      const { payment_intent_id, client_secret } = await upgradeChallengeToPro(
        selectedChallenge.id
      );

      const isInitialized = await initializePaymentSheet(client_secret);
      if (!isInitialized) {
        setIsProcessing(false);
        return;
      }

      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== 'Canceled') {
          showToast(`Payment failed: ${error.message || error.code}`, 'error');
        }
        setIsProcessing(false);
        return;
      }

      const result = await confirmChallengeUpgrade(
        selectedChallenge.id,
        payment_intent_id
      );

      if (result.success) {
        showToast('Upgraded to Pro!', 'success');
        await fetchChallenges();
        selectChallenge(selectedChallenge.id);
        onUpgradeSuccess();
      } else {
        showToast(result.error || 'Upgrade confirmation failed', 'error');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      onClose();
      showToast('An error occurred during upgrade', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedChallenge) return null;

  const features = [
    { icon: 'people', text: 'Up to 20 players, 16-week max' },
    { icon: 'monitor-weight', text: 'Weight tracking & % progress' },
    { icon: 'military-tech', text: 'Weight loss badges' },
  ];

  return (
    <Modal visible={visible} onClose={onClose} widthPercentage={90}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Icon name="workspace-premium" size={32} color={COLORS.primary.blue} />
        </View>
        <Text style={styles.title}>Upgrade to Pro</Text>
        <Text style={styles.subtitle}>Unlock the full weight loss experience</Text>
      </View>

      {/* Price card */}
      <View style={styles.priceCard}>
        <View>
          <Text style={styles.planName}>Pro Plan</Text>
          <Text style={styles.planSub}>Best for weight loss challenges</Text>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceAmount}>$10</Text>
          <Text style={styles.priceCurrency}>USD</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featureList}>
        {features.map(({ icon, text }) => (
          <View key={text} style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Icon name={icon} size={16} color={COLORS.primary.blue} />
            </View>
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.note}>
        Pay only the $10.00 difference from your current Premium plan.
      </Text>

      {/* Buttons */}
      <CustomButton
        text="Upgrade Now"
        onPress={handleUpgrade}
        variant="primary"
        buttonStyle={styles.upgradeButton}
        loading={isProcessing || paymentLoading}
      />
      <TouchableOpacity onPress={onClose} style={styles.cancelLink}>
        <Text style={styles.cancelText}>Maybe later</Text>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  priceCard: {
    backgroundColor: COLORS.gray.light,
    borderColor: COLORS.gray.lightMedium,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
  },
  planSub: {
    fontSize: 12,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.gray.mediumDark,
    fontStyle: 'italic',
    marginTop: 2,
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 26,
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
    lineHeight: 30,
  },
  priceCurrency: {
    fontSize: 11,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.gray.mediumDark,
  },
  featureList: {
    marginBottom: 16,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.text.primary,
    flex: 1,
  },
  note: {
    fontSize: 12,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.text.secondary,
    marginBottom: 20,
    lineHeight: 17,
    textAlign: 'center',
  },
  upgradeButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary.blue,
    marginBottom: 4,
  },
  cancelLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: FONTS.family.poppinsMedium,
    color: COLORS.text.secondary,
  },
});
