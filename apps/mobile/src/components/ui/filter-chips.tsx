import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, layout, radius, spacing, strong, typography } from '@/theme/tokens';

export interface FilterChip {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * "All Exams / MPSC / UPSC ..." — आडवं scroll होणाऱ्या chips.
 * मापं design system मधून: उंची 40, आडवं padding 18, radius 20.
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
                size={16}
                color={selected ? colors.textInverse : colors.textSecondary}
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
    gap: spacing.sm,
    height: layout.chipHeight,
    paddingHorizontal: layout.chipPaddingH,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.bodyM,
    ...strong.semibold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textInverse,
  },
});
