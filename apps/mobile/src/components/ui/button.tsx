import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, layout, radius, shadow, spacing, strong, typography } from '@/theme/tokens';

type Variant = 'primary' | 'outline' | 'secondary' | 'success';

/**
 * Design system मधली चारही button रूपं. उंची नेहमी 44 — spec मध्ये तेच दिलं आहे,
 * आणि तेच बोटाला सहज लागणारं किमान माप आहे.
 */
export function Button({
  label,
  variant = 'primary',
  onPress,
  style,
  full = true,
}: {
  label: string;
  variant?: Variant;
  onPress?: () => void;
  style?: ViewStyle;
  /** false दिलं तर मजकुरापुरता रुंद (उदा. "Buy Now"). */
  full?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        !full && styles.auto,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}>
      <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
  },
  auto: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.85,
  },

  primary: {
    backgroundColor: colors.primary,
    ...shadow.button,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  success: {
    backgroundColor: colors.success,
  },

  label: {
    ...typography.bodyM,
    ...strong.semibold,
  },
});

const labelStyles: Record<Variant, { color: string }> = {
  primary: { color: colors.textInverse },
  outline: { color: colors.primary },
  secondary: { color: colors.primary },
  success: { color: colors.textInverse },
};
