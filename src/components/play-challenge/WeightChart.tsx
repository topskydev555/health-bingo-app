import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

interface WeightEntry {
  week: number;
  weight: number;
  loss: number;
}

interface WeightChartProps {
  weightHistory: WeightEntry[];
}

const CHART_HEIGHT = 140;
const CHART_PADDING = 24;
const LINE_WIDTH = 2;
const POINT_SIZE = 8;

export const WeightChart: React.FC<WeightChartProps> = ({ weightHistory }) => {
  if (weightHistory.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartLabel}>No weight data yet</Text>
      </View>
    );
  }

  const chartWidth = Dimensions.get('window').width - 80;
  const innerWidth = chartWidth - CHART_PADDING * 2;
  const innerHeight = CHART_HEIGHT - CHART_PADDING * 2;

  const maxWeight = Math.max(...weightHistory.map(entry => entry.weight));
  const minWeight = Math.min(...weightHistory.map(entry => entry.weight));
  const range = maxWeight - minWeight || 1;
  const pointCount = weightHistory.length;

  const getPoint = (index: number) => {
    const entry = weightHistory[index];
    const x =
      CHART_PADDING +
      (index / Math.max(1, pointCount - 1)) * innerWidth;
    const y =
      CHART_PADDING +
      innerHeight -
      ((entry.weight - minWeight) / range) * innerHeight;
    return { x, y, weight: entry.weight };
  };

  const points = weightHistory.map((_, i) => getPoint(i));
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return (
    <View style={styles.chartContainer}>
      <View style={[styles.chart, { width: chartWidth, height: CHART_HEIGHT }]}>
        {pointCount > 1 &&
          points.slice(0, -1).map((point, index) => {
            const next = points[index + 1];
            const dx = next.x - point.x;
            const dy = next.y - point.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const centerX = (point.x + next.x) / 2;
            const centerY = (point.y + next.y) / 2;

            return (
              <View
                key={index}
                style={[
                  styles.lineSegment,
                  {
                    width: length,
                    left: centerX - length / 2,
                    top: centerY - LINE_WIDTH / 2,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}
        {points.map((point, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.dataPoint,
              {
                left: point.x - POINT_SIZE / 2,
                top: point.y - POINT_SIZE / 2,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.labelsRow}>
        <Text style={styles.pointLabel}>{firstPoint.weight} kg</Text>
        <Text style={styles.pointLabel}>{lastPoint.weight} kg</Text>
      </View>
      <Text style={styles.chartLabel}>Shows a chart as weight changes</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: COLORS.gray.veryLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray.lightMedium,
  },
  chart: {
    position: 'relative',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray.lightMedium,
    borderRadius: 8,
    backgroundColor: COLORS.primary.white,
  },
  lineSegment: {
    position: 'absolute',
    height: LINE_WIDTH,
    backgroundColor: COLORS.bingo.sky,
    borderRadius: LINE_WIDTH / 2,
  },
  dataPoint: {
    position: 'absolute',
    width: POINT_SIZE,
    height: POINT_SIZE,
    borderRadius: POINT_SIZE / 2,
    backgroundColor: COLORS.bingo.sky,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  pointLabel: {
    fontSize: 12,
    color: COLORS.gray.veryDark,
    fontWeight: '600',
  },
  chartLabel: {
    fontSize: 12,
    color: COLORS.primary.pink,
    fontStyle: 'italic',
  },
});
