import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MetaPill } from '@/components/ui/meta-pill';
import { colors, radius, shadow, spacing, typography } from '@/theme/tokens';
import { discountPercent, rupees, type TestSeries } from '@/types';

/**
 * दुकानातलं Test Series कार्ड — दोन रूपं:
 *
 * - `featured`: रुंद रंगीत आवरण, वर आडवं scroll होणाऱ्या पट्टीत
 * - `row`: यादीतली ओळ, डावीकडे लहान आवरण + उजवीकडे किंमत आणि Buy Now
 *
 * Cart नाही — "Buy Now" थेट त्या series चा checkout उघडतो (ठरलेलं).
 */
export function SeriesCard({
  series,
  variant = 'row',
  onPress,
  onBuy,
}: {
  series: TestSeries;
  variant?: 'featured' | 'row';
  onPress?: () => void;
  onBuy?: () => void;
}) {
  const off = discountPercent(series);
  const cover = series.coverColor ?? colors.primary;

  if (variant === 'featured') {
    return (
      <Pressable style={styles.featured} onPress={onPress}>
        <View style={[styles.featuredCover, { backgroundColor: cover }]}>
          <Text style={styles.coverExam}>{series.examName}</Text>
          <Text style={styles.coverTitle} numberOfLines={2}>
            {series.title}
          </Text>
        </View>

        <View style={styles.featuredBody}>
          <Text style={styles.title} numberOfLines={1}>
            {series.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {series.subtitle}
          </Text>

          <View style={styles.pills}>
            <MetaPill icon="documents-outline" label={`${series.plannedTotalTests} Tests`} />
            <MetaPill icon="language-outline" label={series.language} />
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{rupees(series.priceInPaise)}</Text>
            {series.mrpInPaise ? (
              <Text style={styles.mrp}>{rupees(series.mrpInPaise)}</Text>
            ) : null}
            {off ? <Text style={styles.off}>{off}% OFF</Text> : null}
          </View>

          <Pressable style={styles.outlineButton} onPress={onPress}>
            <Text style={[styles.outlineButtonText, { color: cover }]}>View Details</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.rowCover, { backgroundColor: cover }]}>
        <Text style={styles.rowCoverExam}>{series.examName}</Text>
        <Text style={styles.rowCoverLabel} numberOfLines={3}>
          Test Series
        </Text>
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.title} numberOfLines={2}>
          {series.title}
        </Text>
        {series.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {series.description}
          </Text>
        ) : null}

        <View style={styles.pills}>
          <MetaPill label={`${series.plannedTotalTests} Tests`} />
          <MetaPill label={series.language} />
          <MetaPill label={`Valid for ${series.validityMonths} Months`} />
        </View>

        <View style={styles.rowFooter}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{rupees(series.priceInPaise)}</Text>
            {series.mrpInPaise ? (
              <Text style={styles.mrp}>{rupees(series.mrpInPaise)}</Text>
            ) : null}
          </View>
          <Pressable style={[styles.buyButton, { borderColor: cover }]} onPress={onBuy}>
            <Text style={[styles.buyButtonText, { color: cover }]}>Buy Now</Text>
          </Pressable>
        </View>
        {off ? <Text style={styles.offRight}>{off}% OFF</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featured: {
    // 240 pt — "English / Hindi" सारखा लांब pill दुसऱ्या ओळीवर जाऊ नये एवढी रुंदी.
    // कमी असेल तर pills मोडतात आणि शेजारच्या कार्डांची उंची असमान दिसते.
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  featuredCover: {
    height: 96,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  coverExam: {
    ...typography.micro,
    color: 'rgba(255,255,255,0.85)',
  },
  coverTitle: {
    ...typography.h3,
    color: colors.textInverse,
  },
  featuredBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  rowCover: {
    width: 86,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  rowCoverExam: {
    ...typography.bodyStrong,
    color: colors.textInverse,
  },
  rowCoverLabel: {
    ...typography.micro,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
  },
  rowBody: {
    flex: 1,
    gap: spacing.xs,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },

  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    ...typography.h3,
    fontSize: 17,
    color: colors.text,
  },
  mrp: {
    ...typography.caption,
    color: colors.textFaint,
    textDecorationLine: 'line-through',
  },
  off: {
    ...typography.micro,
    color: colors.success,
  },
  offRight: {
    ...typography.micro,
    color: colors.success,
    textAlign: 'right',
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  outlineButtonText: {
    ...typography.caption,
    fontWeight: '600',
  },
  buyButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buyButtonText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
