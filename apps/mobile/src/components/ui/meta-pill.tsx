import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, radius, spacing, typography } from '@/theme/tokens';

/**
 * "100 Questions", "90 Min", "100 Marks" — test कार्डांवरचे लहान करडे pills.
 */
export function MetaPill({
  icon,
  label,
}: {
  icon?: string;
  label: string;
}) {
  return (
    <View style={styles.pill}>
      {icon ? <Icon name={icon} size={12} color={colors.textSecondary} /> : null}
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
