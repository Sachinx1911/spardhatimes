import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MetaPill } from '@/components/ui/meta-pill';
import { colors, radius, shadow, spacing, subjectColor, typography, strong } from '@/theme/tokens';
import type { Test } from '@/types';

/**
 * Home चे "Upcoming Tests", My Test Series चे "Upcoming Tests", आणि पुढे Mock Tests —
 * तिन्ही ठिकाणी हाच कार्ड. डावीकडे तारखेचा चौकोन, मधे नाव + meta, उजवीकडे कृती.
 */
export function TestCard({ test, onPress }: { test: Test; onPress?: () => void }) {
  const tint = subjectColor(test.categoryName);
  const date = test.releaseAt ? new Date(test.releaseAt) : null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.dateBox, { backgroundColor: tint + '18' }]}>
        <Text style={[styles.month, { color: tint }]}>
          {date ? date.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '--'}
        </Text>
        <Text style={styles.day}>{date ? date.getDate() : '--'}</Text>
        <Text style={styles.weekday}>
          {date ? date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase() : ''}
        </Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.titleRow}>
          <View style={[styles.categoryChip, { backgroundColor: tint + '18' }]}>
            <Text style={[styles.categoryText, { color: tint }]}>{test.categoryName}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {test.title}
        </Text>
        <View style={styles.pills}>
          <MetaPill icon="help-circle-outline" label={`${test.questionCount} Questions`} />
          <MetaPill icon="time-outline" label={`${test.durationMinutes} Min`} />
          <MetaPill icon="ribbon-outline" label={`${test.totalMarks} Marks`} />
        </View>
      </View>

      <View style={[styles.action, { backgroundColor: tint + '18' }]}>
        <Text style={[styles.actionText, { color: tint }]}>
          {test.attemptState === 'COMPLETED'
            ? 'View\nResult'
            : test.attemptState === 'IN_PROGRESS'
              ? 'Resume\nTest'
              : 'Start\nTest'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  dateBox: {
    width: 52,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  month: {
    ...typography.caption,
  },
  day: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  weekday: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  middle: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
  },
  categoryChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  categoryText: {
    ...typography.caption,
  },
  title: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.text,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  action: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    textAlign: 'center',
  },
});
