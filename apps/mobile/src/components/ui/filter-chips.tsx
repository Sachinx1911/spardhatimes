import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

export interface FilterChip {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * My Test Series आणि Current Affairs वरच्या आडव्या chips (All / GK / Maths ...).
 *
 * `ScrollView` आडवा ठेवला आहे — विषय वाढले तरी chips ओळीबाहेर जाऊन तुटत नाहीत.
 */
export function FilterChips({
  chips,
  active,
  onChange,
}: {
  chips: FilterChip[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {chips.map((chip) => {
        const selected = chip.key === active;
        return (
          <Pressable
            key={chip.key}
            onPress={() => onChange(chip.key)}
            style={[styles.chip, selected && styles.chipActive]}>
            {chip.icon ? (
              <Ionicons
                name={chip.icon}
                size={14}
                color={selected ? colors.textInverse : colors.textMuted}
              />
            ) : null}
            <Text style={[styles.label, selected && styles.labelActive]}>{chip.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.textInverse,
  },
});
