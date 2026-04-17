import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PriceCard } from '../../components/create-challenge';
import { DashboardHeader } from '../../components/dashboard';
import { SCREEN_NAMES } from '../../constants';
import { usePlans } from '../../hooks';
import { useCardsStore, useCreateStore } from '../../store';
import { COLORS, FONTS } from '../../theme';

export const ChoosePlan: React.FC = () => {
  const navigation = useNavigation();
  const { setPlan, reset } = useCreateStore();
  const { setLoading: setCardsLoading } = useCardsStore();
  const { formatPrices } = usePlans();

  useEffect(() => {
    reset();
    setCardsLoading(false);
  }, [reset, setCardsLoading]);

  const handleCancel = () => {
    navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
  };

  return (
    <>
      <DashboardHeader
        title="Create Challenge"
        action={
          <TouchableOpacity onPress={handleCancel}>
            <Text style={{ color: COLORS.primary.green, marginRight: 4 }}>
              Cancel
            </Text>
          </TouchableOpacity>
        }
        showProfileIcon={false}
      />
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.priceCardsContainer}>
            <Text style={styles.title}>Choose how you want to play!</Text>
            {formatPrices?.map(plan => (
              <PriceCard
                key={plan.id}
                title={plan.name}
                description={plan.description}
                subtitle={plan.subtitle}
                price={plan.price / 100}
                features={plan.features}
                buttonText={plan.buttonText}
                bgColor={plan.bgColor}
                borderColor={plan.borderColor}
                titleColor={plan.titleColor}
                onPress={() => {
                  setPlan(plan.id);
                  navigation.navigate(
                    SCREEN_NAMES._CREATE_CHALLENGE.DEFINE_CHALLENGE as never
                  );
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.blue,
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  priceCardsContainer: {
    gap: 10,
  },
});
