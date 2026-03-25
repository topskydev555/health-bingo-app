import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import {
  WeightChart,
  WeightHistory,
  WeightInputCard,
} from '../../components/play-challenge';
import { useToast } from '../../hooks';
import {
  createMeasure,
  getCurrentWeekMeasures,
  getMeasureHistory,
} from '../../services';
import { useChallengesStore } from '../../store';
import { COLORS } from '../../theme';

interface WeightEntry {
  week: number;
  weight: number;
  loss: number;
}

interface MeasureData {
  week_number: number;
  value: number;
  createdAt?: string;
}

export const WeighInScreen: React.FC = () => {
  const { selectedChallenge } = useChallengesStore();
  const { showToast } = useToast();
  const isFinished = selectedChallenge?.status === 'finish' || selectedChallenge?.status === 'finishing';
  const [weight, setWeight] = useState('100');
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [measureExists, setMeasureExists] = useState(false);

  const handleIncrement = () => {
    const currentValue = parseFloat(weight) || 0;
    setWeight(String(currentValue + 1));
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(weight) || 0;
    if (currentValue > 0) {
      setWeight(String(currentValue - 1));
    }
  };

  const transformMeasuresToWeightHistory = (
    measures: MeasureData[]
  ): WeightEntry[] => {
    const sortedMeasures = [...measures].sort(
      (a, b) => a.week_number - b.week_number
    );

    return sortedMeasures.map((measure, index) => {
      const previousMeasure = index > 0 ? sortedMeasures[index - 1] : null;
      const previousWeight = previousMeasure?.value || measure.value;
      const loss =
        previousWeight > 0
          ? ((previousWeight - measure.value) / previousWeight) * 100
          : 0;

      return {
        week: measure.week_number,
        weight: measure.value,
        loss: Math.round(loss * 10) / 10,
      };
    });
  };

  useEffect(() => {
    const fetchWeightData = async () => {
      if (!selectedChallenge?.id) return;

      try {
        setIsLoading(true);
        const [historyResponse, currentResponse] = await Promise.all([
          getMeasureHistory(selectedChallenge.id),
          getCurrentWeekMeasures(selectedChallenge.id),
        ]);

        const historyData = transformMeasuresToWeightHistory(historyResponse);
        setWeightHistory(historyData);

        if (currentResponse && currentResponse.length > 0) {
          setWeight(String(currentResponse[0].value));
          setMeasureExists(true);
        } else {
          setMeasureExists(false);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('no bingo task')) {
          console.error('Failed to fetch weight data:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeightData();
  }, [selectedChallenge?.id]);

  const handleSave = async () => {
    if (!selectedChallenge?.id) return;

    const newWeight = parseFloat(weight);
    if (newWeight <= 0) {
      showToast('Please enter a valid weight', 'error');
      return;
    }

    try {
      setIsSaving(true);
      await createMeasure(selectedChallenge.id, 'weight', newWeight);

      const [updatedHistory, currentResponse] = await Promise.all([
        getMeasureHistory(selectedChallenge.id),
        getCurrentWeekMeasures(selectedChallenge.id),
      ]);

      const transformedHistory =
        transformMeasuresToWeightHistory(updatedHistory);
      setWeightHistory(transformedHistory);

      if (currentResponse && currentResponse.length > 0) {
        setWeight(String(currentResponse[0].value));
        setMeasureExists(true);
      }

      showToast('Weight saved successfully!', 'success');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Measure already exists')) {
        const [updatedHistory, currentResponse] = await Promise.all([
          getMeasureHistory(selectedChallenge.id),
          getCurrentWeekMeasures(selectedChallenge.id),
        ]);

        const transformedHistory =
          transformMeasuresToWeightHistory(updatedHistory);
        setWeightHistory(transformedHistory);

        if (currentResponse && currentResponse.length > 0) {
          setWeight(String(currentResponse[0].value));
          setMeasureExists(true);
        }

        showToast('Weight already saved for this week', 'info');
      } else if (errorMessage.includes('no bingo task')) {
        showToast('Weight logging opens when challenge starts.', 'error');
      } else {
        showToast('Failed to save weight. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.green} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WeightInputCard
          weekNumber={selectedChallenge?.current_week || 1}
          weight={weight}
          measureExists={measureExists}
          isSaving={isSaving}
          disabled={isFinished}
          onWeightChange={setWeight}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onSave={handleSave}
        />

        <WeightChart weightHistory={weightHistory} />

        <WeightHistory weightHistory={weightHistory} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
