import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, componentType, layout, radius, spacing, typography } from '@/theme/tokens';

/**
 * API कडून data येईपर्यंत आणि चुकल्यावर काय दाखवायचं.
 *
 * प्रत्येक screen मध्ये वेगळा spinner आणि वेगळं चुकीचं वाक्य लिहिलं तर तेच काम
 * दहा ठिकाणी दहा प्रकारे दिसतं. म्हणून हे दोन घटक सगळीकडे तेच.
 */

export function Loading({ label = 'आणतोय…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <View style={styles.icon}>
        <Icon name="cloud-offline-outline" size={28} color={colors.danger} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.retry} onPress={onRetry}>
          <Text style={styles.retryText}>पुन्हा प्रयत्न करा</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** यादी रिकामी असताना — चूक नाही, फक्त काहीच नाही. */
export function EmptyState({ icon = 'file-tray-outline', message }: {
  icon?: string;
  message: string;
}) {
  return (
    <View style={styles.center}>
      <View style={[styles.icon, { backgroundColor: colors.primaryLight }]}>
        <Icon name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['5xl'],
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    ...typography.bodyM,
    color: colors.textSecondary,
  },
  message: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  retry: {
    height: layout.buttonSecondaryHeight,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    ...componentType.cardDescription,
    color: colors.primary,
  },
});
