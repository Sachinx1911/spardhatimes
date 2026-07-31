import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Tag } from '@/components/ui/tag';
import {
  colors,
  componentType,
  layout,
  radius,
  shadow,
  spacing,
  strong,
  subjectColor,
  typography,
} from '@/theme/tokens';
import { type ApiCatalogSeries } from '@/lib/api';
import { discountPercent, rupees } from '@/types';

/**
 * दुकानातलं Test Series कार्ड — design sheets मधली तीन रूपं:
 *
 * - `featured`: 160 रुंद, आडव्या पट्टीत, वर रंगीत आवरण + "View Details"
 * - `popular`: पूर्ण रुंदी, डावीकडे आवरण, उजवीकडे मजकूर + Buy Now
 * - `buy`: "Buy Test Series" screen चं आडवं कार्ड — 72dp चिन्ह, 96×40 Buy button
 *
 * Cart नाही — "Buy Now" थेट त्या series चा checkout उघडतो (ठरलेलं).
 */
export function SeriesCard({
  series,
  variant = 'popular',
  onPress,
  onBuy,
}: {
  series: ApiCatalogSeries;
  variant?: 'featured' | 'popular' | 'buy';
  onPress?: () => void;
  onBuy?: () => void;
}) {
  const off = discountPercent(series);
  // Schema मध्ये कार्डाचा रंग नाही. Category च्या नावावरून ठरवतो, म्हणजे एकाच
  // परीक्षेची कार्डं नेहमी एकाच रंगाची दिसतात आणि यादी फिरवली तरी रंग उड्या मारत नाहीत.
  const cover = subjectColor(series.categoryName);

  if (variant === 'featured') {
    return (
      <Pressable style={styles.featured} onPress={onPress}>
        <View style={[styles.featuredCover, { backgroundColor: cover }]}>
          <Text style={styles.coverExam}>{series.categoryName}</Text>
          <Text style={styles.coverTitle} numberOfLines={2}>
            {series.title}
          </Text>
        </View>

        <View style={styles.featuredBody}>
          <Text style={styles.metaLine}>{`${series.plannedTotalTests} Tests`}</Text>
          <Text style={styles.metaLine}>{`Valid ${series.validityMonths} Months`}</Text>

          <View style={styles.featuredPriceRow}>
            {series.owned ? (
              <Text style={styles.ownedNote}>तुमच्याकडे आहे</Text>
            ) : (
              <>
                <Text style={styles.featuredPrice}>{rupees(series.priceInPaise)}</Text>
                {series.mrpInPaise ? (
                  <Text style={styles.mrpSmall}>{rupees(series.mrpInPaise)}</Text>
                ) : null}
                {off ? <Text style={styles.offSmall}>{off}% OFF</Text> : null}
              </>
            )}
          </View>

          <Pressable
            style={[styles.detailsButton, series.owned && styles.detailsButtonOwned]}
            onPress={onPress}>
            <Text
              style={[styles.detailsButtonText, series.owned && styles.detailsButtonTextOwned]}>
              {series.owned ? 'Start' : 'View Details'}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  // `buy` आणि `popular` दोन्ही आडवी कार्डं आहेत; फरक फक्त उंची आणि चिन्हाच्या
  // आकारात, म्हणून एकच रचना दोन मापांनी वापरली आहे.
  const isBuy = variant === 'buy';

  return (
    <Pressable style={[styles.row, isBuy && styles.rowBuy]} onPress={onPress}>
      <View
        style={[
          styles.rowCover,
          { backgroundColor: cover },
          isBuy && styles.rowCoverBuy,
        ]}
      >
        <Text style={styles.rowCoverExam} numberOfLines={2}>
          {series.categoryName}
        </Text>
        {!isBuy ? <Text style={styles.rowCoverLabel}>Test Series</Text> : null}
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {series.title}
        </Text>
        {series.description ? (
          <Text style={styles.rowDescription} numberOfLines={2}>
            {series.description}
          </Text>
        ) : null}

        <View style={styles.tags}>
          <Tag label={`${series.plannedTotalTests} Tests`} />
          <Tag label={`Valid for ${series.validityMonths} Months`} />
        </View>

        <View style={styles.rowFooter}>
          {/* घेतलेल्या series ची किंमत दाखवायची नाही — ती आधीच भरलेली आहे. */}
          {series.owned ? (
            <Text style={styles.ownedNote}>तुमच्याकडे आहे</Text>
          ) : (
            <View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{rupees(series.priceInPaise)}</Text>
                {series.mrpInPaise ? <Text style={styles.mrp}>{rupees(series.mrpInPaise)}</Text> : null}
              </View>
              {off ? <Text style={styles.off}>{off}% OFF</Text> : null}
            </View>
          )}

          {/* घेतलेल्या series वर "Buy Now" म्हणजे विद्यार्थ्याला दुसऱ्यांदा पैसे
              मागणं. तिथे थेट उघडायचं बटण. */}
          <Pressable
            style={[styles.buyButton, series.owned && styles.ownedButton]}
            onPress={series.owned ? onPress : onBuy}>
            <Text style={styles.buyButtonText}>{series.owned ? 'Start' : 'Buy Now'}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ── featured (आडवी पट्टी) ──
  featured: {
    // रुंदी sheet मधल्या अरुंद कार्डाएवढी (160dp). उंची निश्चित ठेवली आहे म्हणून
    // शेजारची कार्डं समान उंचीची दिसतात — नाहीतर लांब नावाचं कार्ड उंच होतं.
    width: 160,
    height: 235,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  featuredCover: {
    height: 88,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  coverExam: {
    ...componentType.smallLabel,
    color: 'rgba(255,255,255,0.85)',
  },
  coverTitle: {
    ...typography.bodyM,
    ...strong.bold,
    color: colors.textInverse,
  },
  featuredBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  featuredSubtitle: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  metaLine: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    // 160dp मध्ये किंमत + जुनी किंमत + सवलत — तिन्ही एका ओळीत बसतात, पण फट
    // 4 पेक्षा जास्त ठेवली तर "% OFF" खाली उडी मारतं.
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  offSmall: {
    ...componentType.smallLabel,
    ...strong.semibold,
    color: colors.success,
  },
  featuredPrice: {
    ...typography.bodyL,
    ...strong.bold,
    color: colors.text,
  },
  mrpSmall: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  detailsButton: {
    marginTop: 'auto',
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    ...componentType.smallLabel,
    ...strong.semibold,
    color: colors.primary,
  },
  detailsButtonOwned: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  detailsButtonTextOwned: {
    color: colors.textInverse,
  },
  /** घेतलेली series — किंमतीच्या जागी हेच दिसतं. */
  ownedNote: {
    ...componentType.cardDescription,
    ...strong.semibold,
    color: colors.success,
  },
  ownedButton: {
    backgroundColor: colors.success,
  },

  // ── आडवी कार्डं (popular / buy) ──
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  rowBuy: {
    // Sheet 112dp सांगते, पण त्यात शीर्षक + वर्णन + badges + किंमत बसत नाहीत.
    // म्हणून तेच किमान माप धरून कार्ड गरजेनुसार वाढू दिलं आहे — मजकूर कापण्यापेक्षा
    // कार्ड थोडं उंच होणं बरं.
    minHeight: layout.buySeriesCardHeight,
  },
  rowCover: {
    width: 80,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  rowCoverBuy: {
    width: layout.buySeriesIcon,
    height: layout.buySeriesIcon,
    alignItems: 'center',
  },
  rowCoverExam: {
    ...typography.bodyM,
    ...strong.bold,
    color: colors.textInverse,
  },
  rowCoverLabel: {
    ...componentType.smallLabel,
    color: 'rgba(255,255,255,0.8)',
  },
  rowBody: {
    flex: 1,
    gap: spacing.sm,
  },
  rowTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  rowDescription: {
    ...componentType.cardDescription,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    ...componentType.priceCurrent,
    color: colors.text,
  },
  mrp: {
    ...componentType.priceOld,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  off: {
    ...componentType.discount,
    color: colors.success,
  },
  buyButton: {
    width: layout.buyButton.width,
    height: layout.buyButton.height,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.button,
  },
  buyButtonText: {
    ...componentType.cardDescription,
    ...strong.semibold,
    color: colors.textInverse,
  },
});
