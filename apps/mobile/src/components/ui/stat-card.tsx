import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '@/theme/tokens';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  /** Icon चा रंग; त्याचीच फिकट छटा चौकोनाची पार्श्वभूमी बनते. */
  tint: string;
  tintSoft: string;
  label: string;
  /** मोठा आकडा — "32", "68", "1h 45m". */
  value: string;
  /** आकड्यापुढचं लहान अक्षर — "/ 100", "%". */
  suffix?: string;
  /** 0-1. दिलं तर खाली पातळ progress bar येतो. */
  progress?: number;
  /** Progress ऐवजी खाली दाखवायचा मजकूर — "Top 12%". */
  footnote?: string;
}

/**
 * Home च्या "Today's Progress" मधलं चौकोनी कार्ड. Analytics आणि Profile मध्येही
 * तेच वापरलं आहे — म्हणून चारही ठिकाणी आकडे सारखेच दिसतात.
 */
export function StatCard({
  icon,
  tint,
  tintSoft,
  label,
  value,
  suffix,
  progress,
  footnote,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: tintSoft }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>

      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>

      {progress !== undefined ? (
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              // 0-1 च्या बाहेरचं मूल्य आल्यास bar कार्डाबाहेर जाऊ नये.
              { width: `${Math.min(Math.max(progress, 0), 1) * 100}%`, backgroundColor: tint },
            ]}
          />
        </View>
      ) : footnote ? (
        <Text style={[styles.footnote, { color: tint }]}>{footnote}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  value: {
    ...typography.stat,
    color: colors.text,
  },
  suffix: {
    ...typography.caption,
    color: colors.textMuted,
  },
  track: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  footnote: {
    ...typography.micro,
  },
});
