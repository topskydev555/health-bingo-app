import { COLORS } from '../theme';

export const AWARDS = [
  {
    name: 'Bingo Winner',
    icon: 'emoji-events',
    color: COLORS.primary.gold,
    points: 2,
    description: 'First person to complete Bingo for the week',
  },
  {
    name: 'Bingo Complete',
    icon: 'check-circle',
    color: COLORS.primary.green,
    points: 1,
    description: 'Completed the Bingo card that week',
  },
  {
    name: 'Weightloss Any',
    icon: 'scale',
    color: COLORS.gray.mediumDark,
    points: 1,
    description: 'Logged a weight loss (percentage-based)',
  },
  {
    name: 'Highest Weightloss',
    icon: 'star',
    color: COLORS.primary.gold,
    points: 2,
    description: 'Highest percentage weight loss for the week',
  },
  {
    name: 'Streak Points',
    icon: 'local-fire-department',
    color: COLORS.primary.red,
    points: 1,
    description: 'Earn a point for earning badges in 2 or more consecutive weeks',
  },
];
