import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../../theme';

interface Props {
  startingDayOfWeek: string | null;
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

export const StartingDaySelector: React.FC<Props> = ({
  startingDayOfWeek,
  onChange,
}) => {
  return (
    <View>
      <Text style={styles.title}>Starting Day of Week</Text>
      <Text style={styles.description}>
        Choose which day of the week your challenge starts.
      </Text>
      <View style={styles.daysContainer}>
        {DAYS_OF_WEEK.map(day => {
          const isSelected = startingDayOfWeek === day.value;
          return (
            <TouchableOpacity
              key={day.value}
              style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
              onPress={() => onChange(day.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  isSelected && styles.dayButtonTextSelected,
                ]}
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
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 14,
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
    borderWidth: 2,
  },
  dayButtonText: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 11,
    color: COLORS.text.primary,
  },
  dayButtonTextSelected: {
    color: COLORS.primary.white,
    fontFamily: FONTS.family.poppinsMedium,
  },
});
