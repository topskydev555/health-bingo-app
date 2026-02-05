import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  playCardCheckSound,
  playTaskCompleteSound,
} from '../../services/sound.service';
import { COLORS } from '../../theme';
import { CustomButton } from './Button';

interface BingoCardProps {
  color: string;
  font_color: string;
  font_name: string;
  name: string;
  count: number;
  mode?: 'setup' | 'unmark' | 'mark' | 'check';
  handleClick?: (status?: string) => void;
  allCardsChecked?: boolean;
  onAllCardsCheckedClick?: () => void;
  disabled?: boolean;
}

export const BingoCard: React.FC<BingoCardProps> = ({
  color,
  font_color,
  font_name,
  name,
  count,
  mode,
  handleClick,
  allCardsChecked = false,
  onAllCardsCheckedClick,
  disabled = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mode === 'mark') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [mode, pulseAnim]);

  const CardWrapper = mode === 'setup' ? TouchableOpacity : Animated.View;
  const cardWrapperProps =
    mode === 'setup'
      ? {
          onPress: disabled
            ? undefined
            : handleClick
            ? () => handleClick()
            : undefined,
          activeOpacity: disabled ? 1 : 0.7,
          disabled: disabled,
        }
      : {
          style: [
            mode === 'mark' && {
              transform: [{ scale: pulseAnim }],
            },
          ],
        };

  const [showModal, setShowModal] = useState(false);

  const handleAction = (newStatus: string) => {
    handleClick?.(newStatus);
    setShowModal(false);
    if (newStatus === 'mark') {
      playTaskCompleteSound();
    } else if (newStatus === 'check') {
      playCardCheckSound();
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const renderContent = () => {
    switch (mode) {
      case 'setup':
        return (
          <>
            <Text
              style={[
                styles.text,
                { color: font_color, fontFamily: font_name },
              ]}
            >
              {name}
            </Text>

            <View
              style={[
                styles.badge,
                count > 0 ? styles.badgeActive : styles.badgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  count > 0 ? styles.badgeTextActive : styles.badgeTextInactive,
                ]}
              >
                {count}
              </Text>
            </View>
          </>
        );
      default:
        return (
          <>
            <Pressable
              style={styles.touchableArea}
              android_disableSound={true}
              disabled={disabled}
              onPress={() => {
                if (disabled) return;
                if (mode === 'unmark') {
                  handleClick?.('mark');
                  playTaskCompleteSound();
                } else if (mode === 'mark') {
                  handleClick?.('check');
                  playCardCheckSound();
                } else if (mode === 'check' && !allCardsChecked && !disabled) {
                  setShowModal(true);
                } else if (mode === 'check' && allCardsChecked) {
                  onAllCardsCheckedClick?.();
                }
              }}
              delayLongPress={500}
            >
              {mode === 'check' ? (
                <Image
                  source={require('../../assets/images/bingocard/mark.png')}
                  style={styles.markImage}
                />
              ) : (
                <Text style={[styles.text, { color: font_color }]}>{name}</Text>
              )}
            </Pressable>

            <Modal
              visible={showModal}
              transparent={true}
              animationType="fade"
              onRequestClose={handleCancel}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{name}</Text>
                  <View style={styles.modalButtons}>
                    <CustomButton
                      variant="default"
                      onPress={handleCancel}
                      buttonStyle={[styles.modalButton, styles.cancelButton]}
                      textStyle={[
                        styles.modalButtonText,
                        styles.cancelButtonText,
                      ]}
                      icon={
                        <MaterialIcons
                          name="close"
                          size={20}
                          color={COLORS.gray.darker}
                        />
                      }
                      text="Cancel"
                    />
                    <CustomButton
                      variant="default"
                      onPress={() => handleAction('unmark')}
                      buttonStyle={[styles.modalButton, styles.unmarkButton]}
                      textStyle={[
                        styles.modalButtonText,
                        styles.actionButtonText,
                      ]}
                      icon={
                        <MaterialIcons
                          name="undo"
                          size={20}
                          color={COLORS.primary.white}
                        />
                      }
                      text="Unmark"
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </>
        );
    }
  };

  return (
    <CardWrapper {...cardWrapperProps}>
        <View style={styles.cardWrapper}>
          <View
            style={[
              styles.container,
              {
                backgroundColor: mode === 'check' ? COLORS.primary.blue : color,
                opacity: disabled ? 0.5 : 1,
              },
              mode !== 'check' &&
                color === COLORS.primary.white &&
                styles.blackBorder,
              mode === 'mark' && styles.markedContainer,
              mode === 'check' && styles.checkedContainer,
            ]}
          >
            {renderContent()}
          </View>
        </View>
      </CardWrapper>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
  },
  container: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    position: 'relative',
    shadowColor: COLORS.primary.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markedContainer: {
    borderWidth: 4,
    borderColor: COLORS.primary.green,
    shadowColor: COLORS.primary.green,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  checkedContainer: {
    borderWidth: 0,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeActive: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.primary.green,
  },
  badgeInactive: {
    width: 18,
    height: 18,
    backgroundColor: COLORS.gray.lightMedium,
  },
  badgeText: {
    fontWeight: 'bold',
  },
  badgeTextActive: {
    color: COLORS.primary.white,
    fontSize: 12,
  },
  badgeTextInactive: {
    color: COLORS.gray.darker,
    fontSize: 10,
  },
  touchableArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: `${COLORS.primary.black}80`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.primary.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: COLORS.primary.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.blue,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    padding: 14,
  },
  cancelButton: {
    backgroundColor: COLORS.gray.light,
  },
  unmarkButton: {
    backgroundColor: COLORS.primary.blue,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: COLORS.primary.blue,
  },
  actionButtonText: {
    color: COLORS.primary.white,
  },
  blackBorder: {
    borderColor: COLORS.gray.mediumDark,
    borderWidth: 1,
  },
});
