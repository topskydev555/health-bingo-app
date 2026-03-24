import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, FONTS } from '../../theme';
import { getNextOccurrenceOfDay } from '../../utils/date.utils';
import { Badge } from '../common/Badge';
import { CountdownTimer } from '../common/CountdownTimer';
import { Label } from '../common/Label';
import { useChallengesStore } from '../../store/challenges.store';

type Props = {
  title: string;
  currentWeek: number;
  totalWeeks: number;
  progress: number; // 0..1
  status: 'active' | 'pending' | 'in_active' | 'finished' | 'unpaid' | 'finishing';
  categoryName?: string;
  startingDayOfWeek?: string;
  containerStyle?: ViewStyle;
  isOrganizer?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  unreadCount?: number;
};

export const ChallengeCard: React.FC<Props> = ({
  title,
  currentWeek,
  totalWeeks,
  progress,
  categoryName,
  startingDayOfWeek,
  containerStyle,
  isOrganizer,
  onPress,
  status,
  disabled,
  unreadCount = 0,
}) => {
  const percent = Math.max(0, Math.min(progress, 1));
  const { fetchChallenges } = useChallengesStore();

  const getStatusBadge = () => {
    if (status === 'active') {
      return <View style={[styles.statusBadge, styles.activeBadge]} />;
    } else if (status === 'pending') {
      return <View style={[styles.statusBadge, styles.pendingBadge]} />;
    } else if (status === 'unpaid') {
      return <View style={[styles.statusBadge, styles.unpaidBadge]} />;
    } else if (status === 'finishing') {
      return <View style={[styles.statusBadge, styles.finishingBadge]} />;
    }
    return null;
  };

  const formatDayName = (day: string | undefined): string => {
    if (!day) return 'Mon';
    const dayMap: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };
    return (
      dayMap[day.toLowerCase()] ||
      day.charAt(0).toUpperCase() + day.slice(1).substring(0, 2)
    );
  };

  const getStatusText = () => {
    if (status === 'pending' && startingDayOfWeek) {
      const startDate = getNextOccurrenceOfDay(startingDayOfWeek);
      return (
        <CountdownTimer
          targetDate={startDate}
          variant="compact"
          label="Starts in:"
          onComplete={() => {
            fetchChallenges(true);
          }}
        />
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        isOrganizer ? styles.organizerCard : styles.participantCard,
        containerStyle,
        disabled && { opacity: 0.5 },
      ]}
      disabled={disabled}
    >
      {unreadCount > 0 && (
        <Badge count={unreadCount} style={styles.unreadBadge} />
      )}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          {getStatusBadge()}
          <Text style={styles.title}>{title}</Text>
        </View>
        <Label
          text={status.toUpperCase()}
          labelStyle={styles.statusPill}
          textStyle={styles.statusText}
        />
      </View>

      <View style={styles.subRow}>
        {categoryName ? (
          <Text
            style={[
              styles.planText,
              { fontFamily: FONTS.family.poppinsMedium },
            ]}
          >
            {categoryName}
          </Text>
        ) : null}
      </View>

      <View style={styles.subRow}>
        <Text
          style={styles.planText}
        >{`Week ${currentWeek} of ${totalWeeks}`}</Text>
      </View>
      {status === 'pending' && getStatusText() && (
        <View style={styles.countdownRow}>{getStatusText()}</View>
      )}

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent * 100}%` }]} />
      </View>

      {status === 'finishing' && (
        <View style={styles.finishingBanner}>
          <Text style={styles.finishingBannerText}>
            Your {title} will move to Completed soon.
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray.lightMedium,
    padding: 14,
    marginVertical: 8,
    shadowColor: COLORS.primary.black,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  organizerCard: {
    backgroundColor: COLORS.primary.white,
  },
  participantCard: {
    backgroundColor: COLORS.gray.light,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontFamily: FONTS.family.poppinsBold,
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: COLORS.primary.green, // Deep blue
  },
  pendingBadge: {
    backgroundColor: '#FF8C00', // Vibrant orange
  },
  unpaidBadge: {
    backgroundColor: '#FF4444', // Red for unpaid
  },
  finishingBadge: {
    backgroundColor: '#9B59B6', // Purple for finishing
  },
  finishingBanner: {
    marginTop: 8,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  finishingBannerText: {
    fontSize: 11,
    fontFamily: FONTS.family.poppinsRegular,
    color: '#7B2D8B',
  },
  statusPill: {},
  statusText: { fontSize: 12 },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -2,
    zIndex: 10,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  planText: {
    fontFamily: FONTS.family.poppinsRegular,
    color: '#666666',
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.green,
  },
  countdownRow: {
    marginTop: 4,
    marginBottom: 4,
  },
});
