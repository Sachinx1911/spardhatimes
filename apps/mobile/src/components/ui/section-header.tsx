import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

/**
 * "Today's Progress ........ View All" — mockups मध्ये हा pattern 12+ वेळा येतो.
 * `onViewAll` दिला नाही तर उजवीकडचा दुवा दिसत नाही.
 */
export function SectionHeader({
  title,
  actionLabel = 'View All',
  onViewAll,
}: {
  title: string;
  actionLabel?: string;
  onViewAll?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onViewAll ? (
        <Pressable onPress={onViewAll} hitSlop={8} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
});
