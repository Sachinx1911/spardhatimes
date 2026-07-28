import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme/tokens';

/**
 * पांढरा card — mockups मधली जवळपास प्रत्येक गोष्ट यात बसते.
 * रंग/radius/सावली इथेच एकदा ठरतात म्हणून screens मध्ये पुन्हा लिहायचे नाहीत.
 */
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
});
