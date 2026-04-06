import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme';

type InputProps = {
  inputStyle?: ViewStyle;
  label?: string;
  labelStyle?: TextStyle;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  disabled?: boolean;
  secureTextEntry?: boolean;
  isValid?: boolean;
  showValidation?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  maxLength?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
};

export const Input: React.FC<InputProps> = ({
  inputStyle,
  placeholder,
  value,
  onChangeText,
  disabled,
  label,
  labelStyle,
  secureTextEntry,
  isValid,
  showValidation,
  keyboardType,
  maxLength,
  autoCapitalize = 'none',
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={() => setPasswordVisible(prev => !prev)}
          disabled={disabled}
        >
          <MaterialIcons
            name={passwordVisible ? 'visibility' : 'visibility-off'}
            size={20}
            color={COLORS.gray.mediumDark}
          />
        </TouchableOpacity>
      );
    }

    if (!showValidation || isValid === undefined) return null;

    return (
      <View style={styles.rightIcon}>
        <Text
          style={[
            styles.iconText,
            { color: isValid ? COLORS.primary.green : COLORS.primary.red },
          ]}
        >
          {isValid ? '✓' : '✗'}
        </Text>
      </View>
    );
  };

  return (
    <>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            inputStyle,
            (secureTextEntry || (showValidation && isValid !== undefined)) &&
              styles.inputWithIcon,
            showValidation &&
              isValid !== undefined && {
                borderColor: isValid
                  ? COLORS.primary.green
                  : COLORS.primary.red,
              },
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray.mediumDark}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !passwordVisible}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
        {renderRightIcon()}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  label: {
    marginBottom: 8,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
