import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../theme';
import { CustomButton } from '../common';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

interface Props {
  mode: 'ongoing' | 'archived';
  handleJoinChallenge: () => void;
  handleHostChallenge: () => void;
}

export const EmptyChallenges: React.FC<Props> = ({
  mode,
  handleJoinChallenge,
  handleHostChallenge,
}) => {
  return (
    <View style={styles.container}>
      {mode === 'ongoing' ? (
        <>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/dashboard/image.png')}
              style={styles.image}
            />
          </View>

          <View style={styles.transitionIcon}>
            <Image
              source={require('../../assets/images/dashboard/mark.png')}
              style={styles.smallIcon}
            />
          </View>

          <View style={[styles.textContainer, { backgroundColor: '#7Ed957' }]}>
            <Text style={styles.headline}>
              You haven't joined any challenges yet.
            </Text>

            <View style={styles.buttonRow}>
              <CustomButton
                text="Join a Challenge"
                buttonStyle={styles.button}
                textStyle={styles.buttonText}
                onPress={handleJoinChallenge}
              />
              <CustomButton
                text="Host a Challenge"
                variant="outline"
                buttonStyle={[styles.button, styles.outlineButton]}
                textStyle={[styles.buttonText, styles.outlineButtonText]}
                onPress={handleHostChallenge}
              />
            </View>
          </View>
        </>
      ) : (
        <View style={styles.archivedContainer}>
          <Text style={styles.archivedTitle}>No Completed Challenges</Text>
          <Text style={styles.archivedSubtitle}>
            Your completed challenges will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  imageContainer: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  transitionIcon: {
    position: 'absolute',
    top: DEVICE_HEIGHT * 0.4 - 25,
    borderRadius: 12,
    zIndex: 1,
    alignSelf: 'center',
  },
  smallIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  headline: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: FONTS.family.poppinsRegular,
    paddingHorizontal: 30,
    color: COLORS.primary.blue,
  },
  buttonRow: {
    width: DEVICE_WIDTH * 0.88,
    gap: 14,
  },
  button: {
    height: 50,
  },
  buttonText: {
    color: COLORS.primary.white,
    fontSize: 16,
    fontFamily: FONTS.family.poppinsMedium,
    textTransform: 'uppercase',
  },
  outlineButton: {
    backgroundColor: COLORS.primary.white,
    borderWidth: 1,
    borderColor: COLORS.primary.green,
  },
  outlineButtonText: {
    color: COLORS.primary.green,
  },
  archivedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  archivedTitle: {
    fontSize: FONTS.size['2xl'],
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
    marginBottom: 8,
    textAlign: 'center',
  },
  archivedSubtitle: {
    fontSize: FONTS.size.lg,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.gray.dark,
    textAlign: 'center',
  },
});
