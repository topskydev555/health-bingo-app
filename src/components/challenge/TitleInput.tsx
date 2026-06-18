import { StyleSheet, Text, TextInputProps, View } from 'react-native';
import { COLORS, FONTS } from '../../theme';
import { Input } from '../common';

interface Props {
  title: string;
  isEditable: boolean;
  setTitle: (value: string) => void;
  onFocus?: TextInputProps['onFocus'];
}

export const TitleInput: React.FC<Props> = ({
  title,
  isEditable,
  setTitle,
  onFocus,
}) => {
  return (
    <View>
      <Text style={styles.title}>Name Your Challenge</Text>
      <Text style={styles.description}>
        Make it fun or inspiring - the group will see this!
      </Text>
      <Input
        placeholder="Eg: Body Reset, Lose A few, Eat Well"
        value={title}
        onChangeText={setTitle}
        inputStyle={styles.inputStyle}
        disabled={!isEditable}
        onFocus={onFocus}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
    fontSize: 18,
    fontWeight: FONTS.weight.bold,
    marginBottom: 16,
  },
  description: {
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  inputStyle: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray.mediumDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FONTS.family.poppinsMedium,
    backgroundColor: COLORS.primary.white,
    fontSize: 14,
  },
});
