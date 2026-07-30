import { StyleSheet, Text, View } from 'react-native';

import { colors, componentType, layout, radius, spacing } from '@/theme/tokens';

/**
 * "70 Tests", "Bilingual", "Valid for 12 Months" — series कार्डांवरचे फिकट tags.
 *
 * हे `MetaPill` पेक्षा वेगळे आहेत: MetaPill करडा असतो आणि test कार्डांवर मापं
 * दाखवतो; हा जांभळट असतो आणि series ची वैशिष्ट्यं दाखवतो. Design system मध्ये
 * दोन्ही वेगळे दिले आहेत.
 */
export function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    // Badge: उंची 24dp, आतली मोकळी जागा 4×10 — "Buy Test Series" sheet मधून.
    height: layout.badgeHeight,
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
  },
  text: {
    ...componentType.badge,
    color: colors.primary,
  },
});
