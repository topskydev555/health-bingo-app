import moment from 'moment-timezone';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DEFAULT_TIMEZONE } from '../../constants';
import { COLORS, FONTS } from '../../theme';

interface Props {
  startingDayOfWeek: string | null;
  startImmediately: boolean;
  onChange: (day: string) => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

const getSydneyTodayDayOfWeek = (): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[moment.tz(DEFAULT_TIMEZONE).day()];
};

export const StartingDaySelector: React.FC<Props> = ({
  startingDayOfWeek,
  startImmediately,
  onChange,
}) => {
  const iconColor = startImmediately ? COLORS.primary.white : COLORS.primary.green;

  return (
    <View>
      <Text style={styles.title}>Starting Day</Text>
      <Text style={styles.description}>
        Choose when your challenge starts.
      </Text>

      {/* Start Immediately card */}
      <TouchableOpacity
        style={[styles.immediateButton, startImmediately && styles.immediateButtonSelected]}
        onPress={() => onChange(getSydneyTodayDayOfWeek())}
        activeOpacity={0.7}
      >
        <View style={styles.immediateRow}>
          <Icon name="bolt" size={20} color={iconColor} style={styles.immediateIcon} />
          <View>
            <Text style={[styles.immediateButtonText, startImmediately && styles.immediateButtonTextSelected]}>
              Start Immediately
            </Text>
            <Text style={[styles.immediateButtonSub, startImmediately && styles.immediateButtonSubSelected]}>
              Challenge begins today
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* OR divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Day-of-week cards */}
      <Text style={styles.sectionLabel}>Schedule for a day</Text>
      <View style={styles.daysContainer}>
        {DAYS_OF_WEEK.map(day => {
          const isSelected = !startImmediately && startingDayOfWeek === day.value;
          return (
            <TouchableOpacity
              key={day.value}
              style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
              onPress={() => onChange(day.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
    fontSize: 18,
    fontWeight: FONTS.weight.bold,
    marginBottom: 8,
  },
  description: {
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  immediateButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary.green,
    backgroundColor: COLORS.primary.white,
  },
  immediateButtonSelected: {
    backgroundColor: COLORS.primary.green,
  },
  immediateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  immediateIcon: {
    marginRight: 12,
  },
  immediateButtonText: {
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 15,
    color: COLORS.primary.green,
  },
  immediateButtonTextSelected: {
    color: COLORS.primary.white,
  },
  immediateButtonSub: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  immediateButtonSubSelected: {
    color: COLORS.primary.white,
    opacity: 0.85,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray.lightMedium,
  },
  dividerText: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 13,
    color: COLORS.text.secondary,
    marginHorizontal: 12,
  },
  sectionLabel: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray.lightMedium,
    backgroundColor: COLORS.primary.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary.blue,
    borderColor: COLORS.primary.blue,
  },
  dayButtonText: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 11,
    color: COLORS.text.primary,
  },
  dayButtonTextSelected: {
    color: COLORS.primary.white,
    fontFamily: FONTS.family.poppinsBold,
  },
});
