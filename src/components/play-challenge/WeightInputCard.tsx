import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../../theme';

interface WeightInputCardProps {
  weekNumber: number;
  weight: string;
  measureExists: boolean;
  isSaving: boolean;
  disabled?: boolean;
  onWeightChange: (weight: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onSave: () => void;
}

export const WeightInputCard: React.FC<WeightInputCardProps> = ({
  weekNumber,
  weight,
  measureExists,
  isSaving,
  disabled = false,
  onWeightChange,
  onIncrement,
  onDecrement,
  onSave,
}) => {
  return (
    <View style={styles.weightCard}>
      <Text style={styles.weekTitle}>Week {weekNumber} Weight</Text>
      <Text style={styles.subtitle}>Enter your Week {weekNumber} Weight</Text>

      <View style={styles.weightInputContainer}>
        <TextInput
          style={[
            styles.weightInput,
            (measureExists || disabled) && styles.weightInputDisabled,
          ]}
          value={weight}
          onChangeText={onWeightChange}
          keyboardType="numeric"
          placeholder="0"
          selectTextOnFocus={true}
          returnKeyType="done"
          underlineColorAndroid="transparent"
          autoCorrect={false}
          autoCapitalize="none"
          multiline={false}
          numberOfLines={1}
          editable={!measureExists && !disabled}
        />
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={onIncrement}
            style={styles.controlButton}
            disabled={measureExists || disabled}
          >
            <Text
              style={[
                styles.controlText,
                (measureExists || disabled) && styles.controlTextDisabled,
              ]}
            >
              ▲
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDecrement}
            style={styles.controlButton}
            disabled={measureExists || disabled}
          >
            <Text
              style={[
                styles.controlText,
                (measureExists || disabled) && styles.controlTextDisabled,
              ]}
            >
              ▼
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.unitText}>kg</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          (isSaving || measureExists || disabled) && styles.saveButtonDisabled,
        ]}
        onPress={onSave}
        disabled={isSaving || measureExists || disabled}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>SAVE WEIGHT</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  weightCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  weekTitle: {
    fontSize: 18,
    fontFamily: FONTS.family.poppinsBold,
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    minWidth: 280,
    height: 70,
    justifyContent: 'space-between',
  },
  weightInput: {
    flex: 1,
    fontSize: 28,
    color: '#374151',
    textAlign: 'center',
    paddingHorizontal: 10,
    height: 50,
    lineHeight: 50,
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  controlsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  controlButton: {
    width: 20,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 12,
    color: '#6B7280',
  },
  unitText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: FONTS.family.poppinsMedium,
  },
  saveButton: {
    width: '100%',
    backgroundColor: COLORS.primary.green,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.family.poppinsBold,
    letterSpacing: 0.5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  weightInputDisabled: {
    opacity: 0.6,
  },
  controlTextDisabled: {
    opacity: 0.4,
  },
});
