import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { colors, layout, radius, shadow, spacing, strong, typography } from '@/theme/tokens';
import { discountPercent, rupees, type TestSeries } from '@/types';

/**
 * दुकानातलं Test Series कार्ड — design system मधली दोन रूपं:
 *
 * - `featured`: 280×235, आडव्या पट्टीत, वर रंगीत आवरण
 * - `popular`: उंची 150, उभ्या यादीत, डावीकडे लहान आवरण + उजवीकडे Buy Now
 *
 * Cart नाही — "Buy Now" थेट त्या series चा checkout उघडतो (ठरलेलं).
 */
export function SeriesCard({
  series,
  variant = 'popular',
  onPress,
  onBuy,
}: {
  series: TestSeries;
  variant?: 'featured' | 'popular';
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
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {series.title}
          </Text>
          <Text style={styles.featuredSubtitle} numberOfLines={1}>
            {series.subtitle}
          </Text>

          <Text style={styles.featureText}>{`${series.plannedTotalTests} Tests`}</Text>
          <Text style={styles.featureText}>{series.language}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.featuredPrice}>{rupees(series.priceInPaise)}</Text>
            {series.mrpInPaise ? (
              <Text style={styles.mrp}>{rupees(series.mrpInPaise)}</Text>
            ) : null}
            {off ? <Text style={styles.off}>{off}% OFF</Text> : null}
          </View>

          <Pressable style={styles.detailsButton} onPress={onPress}>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.popular} onPress={onPress}>
      <View style={[styles.popularCover, { backgroundColor: cover }]}>
        <Text style={styles.popularCoverExam}>{series.examName}</Text>
        <Text style={styles.popularCoverLabel}>Test Series</Text>
      </View>

      <View style={styles.popularBody}>
        <View style={styles.popularTop}>
          <Text style={styles.title} numberOfLines={2}>
            {series.title}
          </Text>
          <View style={styles.priceColumn}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{rupees(series.priceInPaise)}</Text>
              {series.mrpInPaise ? (
                <Text style={styles.mrp}>{rupees(series.mrpInPaise)}</Text>
              ) : null}
            </View>
            {off ? <Text style={styles.offRight}>{off}% OFF</Text> : null}
          </View>
        </View>

        {series.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {series.description}
          </Text>
        ) : null}

        <View style={styles.popularFooter}>
          <View style={styles.tags}>
            <Tag label={`${series.plannedTotalTests} Tests`} />
            <Tag label={series.language} />
            <Tag label={`Valid for ${series.validityMonths} Months`} />
          </View>
          <Button label="Buy Now" onPress={onBuy} full={false} style={styles.buyButton} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ── featured ──
  featured: {
    // मापं design system मधून जशीच्या तशी. उंची निश्चित ठेवली आहे म्हणून
    // शेजारची कार्डं समान उंचीची दिसतात — नाहीतर लांब नावाचं कार्ड उंच होतं.
    width: layout.featuredCard.width,
    height: layout.featuredCard.height,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  featuredCover: {
    height: 80,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  coverExam: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  coverTitle: {
    ...typography.bodyL,
    ...strong.bold,
    color: colors.textInverse,
  },
  featuredBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  featuredTitle: {
    ...typography.bodyM,
    ...strong.semibold,
    color: colors.text,
  },
  featuredSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  featureText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  featuredPrice: {
    ...typography.bodyL,
    ...strong.bold,
    color: colors.text,
  },
  detailsButton: {
    marginTop: 'auto',
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    ...typography.caption,
    ...strong.semibold,
    color: colors.primary,
  },

  // ── popular ──
  popular: {
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: layout.popularCardHeight,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  popularCover: {
    width: 88,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  popularCoverExam: {
    ...typography.bodyL,
    ...strong.bold,
    color: colors.textInverse,
  },
  popularCoverLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  popularBody: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  popularTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  popularFooter: {
    gap: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  buyButton: {
    alignSelf: 'flex-end',
  },

  // ── दोन्हींत ──
  title: {
    flex: 1,
    ...typography.bodyL,
    ...strong.semibold,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  description: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    ...typography.titleL,
    color: colors.text,
  },
  mrp: {
    ...typography.bodyS,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  off: {
    ...typography.caption,
    ...strong.semibold,
    color: colors.success,
  },
  offRight: {
    ...typography.caption,
    ...strong.semibold,
    color: colors.success,
  },
});
