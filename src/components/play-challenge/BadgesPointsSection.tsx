import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AWARDS } from '../../constants';
import { COLORS, FONTS } from '../../theme';

interface BadgesPointsSectionProps {
  isWeightLossChallenge?: boolean;
}

export const BadgesPointsSection: React.FC<BadgesPointsSectionProps> = ({
  isWeightLossChallenge = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const filteredAwards = AWARDS.filter(award => {
    if (!isWeightLossChallenge) {
      return !award.name.toLowerCase().includes('weight');
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Icon name="emoji-events" size={24} color={COLORS.primary.gold} />
          <Text style={styles.headerTitle}>Badges & Points</Text>
        </View>
        <Icon
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={COLORS.gray.mediumDark}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {filteredAwards.map(award => (
            <View key={award.name} style={styles.badgeRow}>
              <View style={styles.badgeLeft}>
                <Icon name={award.icon} size={24} color={award.color} />
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{award.name}</Text>
                  <Text style={styles.badgeDescription}>{award.description}</Text>
                </View>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{award.points} pt{award.points > 1 ? 's' : ''}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.gray.veryLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: FONTS.size.base,
    fontFamily: FONTS.family.poppinsSemiBold,
    color: COLORS.primary.black,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.light,
  },
  badgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  badgeInfo: {
    flex: 1,
    gap: 4,
  },
  badgeName: {
    fontSize: FONTS.size.sm,
    fontFamily: FONTS.family.poppinsSemiBold,
    color: COLORS.primary.black,
  },
  badgeDescription: {
    fontSize: FONTS.size.xs,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.gray.mediumDark,
    lineHeight: 16,
  },
  pointsBadge: {
    backgroundColor: COLORS.primary.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: FONTS.size.xs,
    fontFamily: FONTS.family.poppinsSemiBold,
    color: COLORS.primary.white,
  },
});
