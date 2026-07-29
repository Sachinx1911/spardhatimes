import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

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
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.caption,
    color: colors.primary,
  },
});
