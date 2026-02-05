import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { boardLayoutOptions } from '../../constants';
import { COLORS, FONTS } from '../../theme';

interface Props {
  cardSize: number;
  onPress: (layout: number) => void;
}

export const BoardLayout: React.FC<Props> = ({ cardSize, onPress }) => {
  return (
    <View>
      <Text style={styles.title}>Bingo Board Layout</Text>
      <Text style={styles.description}>
        Choose your weekly task count - more tasks, more challenge!
      </Text>
      <View style={styles.layoutContainer}>
        {boardLayoutOptions.map(layout => {
          const isSelected = layout.id === cardSize;
          return (
            <TouchableOpacity
              key={layout.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onPress(layout.id)}
            >
              <Text
                style={[styles.sizeText, isSelected && styles.sizeTextSelected]}
              >
                {layout.size}
              </Text>
              <Text
                style={[
                  styles.taskCountText,
                  isSelected && styles.taskCountTextSelected,
                ]}
              >
                ({layout.taskCount} tasks)
              </Text>
              <Image
                source={require('../../assets/images/create-challenge/layout-card.png')}
                style={styles.layoutImage}
              />
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
  layoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 0.85,
    backgroundColor: COLORS.primary.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.gray.lightMedium,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cardSelected: {
    borderColor: COLORS.primary.green,
    backgroundColor: COLORS.primary.blue,
  },
  sizeText: {
    fontFamily: FONTS.family.poppinsMedium,
    fontSize: 24,
    color: COLORS.primary.blue,
    marginBottom: 4,
  },
  sizeTextSelected: {
    color: COLORS.primary.white,
  },
  taskCountText: {
    fontFamily: FONTS.family.poppinsRegular,
    fontSize: 12,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  taskCountTextSelected: {
    color: COLORS.primary.white,
  },
  layoutImage: {
    width: 25,
    height: 25,
  },
});
