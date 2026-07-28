import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';

interface ScreenProps {
  children: ReactNode;
  /** बहुतेक screens लांब आहेत; ज्यांना scroll नको (उदा. Login) त्यांनी false द्यावं. */
  scroll?: boolean;
  /** Screen ला स्वतःचं top spacing हवं नसेल तर (उदा. वर रंगीत header असेल तर). */
  padded?: boolean;
}

/**
 * प्रत्येक screen चा बाहेरचा थर: safe-area, background रंग, आणि tab bar मागे मजकूर
 * लपू नये म्हणून खाली मोकळी जागा.
 */
export function Screen({ children, scroll = true, padded = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = [
    padded && styles.padded,
    { paddingTop: insets.top + (padded ? spacing.md : 0) },
  ];

  if (!scroll) {
    return <View style={[styles.root, content]}>{children}</View>;
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[content, styles.scrollBottom]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  // Tab bar उंचावलेल्या button मुळे नेहमीपेक्षा जास्त जागा खातो.
  scrollBottom: {
    paddingBottom: spacing['3xl'] * 2,
  },
});
