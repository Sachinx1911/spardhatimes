import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  layout,
  radius,
  screenAccent,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * एका परीक्षेचा पडदा.
 *
 * Design "MPSC" दाखवते, पण पडदा **कुठल्याही परीक्षेचा** आहे — Home वरची MPSC
 * आणि TCS|IBPS दोन्ही tiles इथेच येतात, फक्त वेगळ्या `id` सह. MPSC-पुरता
 * बांधला असता तर दुसऱ्या परीक्षेसाठी तोच पडदा पुन्हा लिहावा लागला असता.
 *
 * रंग या पडद्याचा स्वतःचा (जांभळा); खालची पट्टी नेहमीप्रमाणे बदलत नाही.
 *
 * मापं sheet मधून: header 56, वैशिष्ट्य कार्ड 72/r16, ओळ 64, अभ्यासक्रमाची
 * ओळ 56, चिन्ह 40/24.
 */

const A = screenAccent.exam;

/** यादीतल्या ओळींना आळीपाळीने रंग — sheet मध्ये त्या वेगवेगळ्या रंगाच्या आहेत. */
const ROW_TINTS = [colors.info, colors.success, colors.purple, colors.orange];

export default function ExamScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, loading, error, reload } = useApi(() => api.examDetail(id), [id]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.root}>
      {/* ── वरची पट्टी ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={8} onPress={goBack}>
            <Icon name="menu" size={24} color={colors.textInverse} />
          </Pressable>

          <Text style={styles.headerTitle}>{data?.name ?? '…'}</Text>

          <Pressable hitSlop={8} style={styles.bell}>
            <Icon name="notifications" size={24} color={colors.textInverse} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing['3xl'] }]}
        showsVerticalScrollIndicator={false}>
        {loading ? <Loading label="उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}

        {data ? (
          <>
            {/* ── मोठं शीर्षक + पट्टी ── */}
            <Text style={styles.sectionTitle}>{data.name} साठी तुमचे संपूर्ण अध्ययन</Text>
            <View style={styles.indicator}>
              <View style={[styles.bar, styles.barOn]} />
              <View style={styles.bar} />
            </View>

            {/* ── test series ── */}
            <View style={styles.card}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Icon name="clipboard" size={22} color={A.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{data.name} TEST</Text>
                  <Text style={styles.featureSub} numberOfLines={1}>
                    सर्व प्रकारचे टेस्ट सोडवा आणि तयारी तपासा.
                  </Text>
                </View>
                <Pressable style={styles.viewAll} onPress={() => router.push('/store')}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Icon name="chevron-forward" size={16} color={A.primary} />
                </Pressable>
              </View>

              {data.series.length > 0 ? (
                data.series.map((s, i) => (
                  <Pressable
                    key={s.id}
                    style={[styles.row, i > 0 && styles.rowDivided]}
                    onPress={() => router.push(s.owned ? '/tests' : '/store')}>
                    <View
                      style={[
                        styles.rowIcon,
                        { backgroundColor: ROW_TINTS[i % ROW_TINTS.length] },
                      ]}>
                      <Icon name="clipboard" size={20} color={colors.textInverse} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {s.title}
                      </Text>
                      <Text style={styles.rowMeta}>एकूण टेस्ट: {s.totalTests}</Text>
                    </View>
                    <Icon name="chevron-forward" size={24} color={colors.textSecondary} />
                  </Pressable>
                ))
              ) : (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    या परीक्षेसाठी अजून एकही test series नाही.
                  </Text>
                </View>
              )}
            </View>

            {/* ── अभ्यासक्रम ──
                Design मध्ये इथे विषयांची यादी आहे, पण schema मध्ये syllabus चं
                model नाही. रचना ठेवली आहे; मजकूर model आल्यावर भरेल. */}
            <View style={styles.syllabus}>
              <View style={styles.syllabusHead}>
                <View style={styles.syllabusIcon}>
                  <Icon name="book" size={22} color={colors.success} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.syllabusTitle}>{data.name} अभ्यासक्रम</Text>
                  <Text style={styles.featureSub} numberOfLines={1}>
                    अधिकृत अभ्यासक्रमानुसार तयारी करा.
                  </Text>
                </View>
              </View>

              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  अभ्यासक्रम अजून जोडलेला नाही.
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  // ── header ──
  header: { backgroundColor: A.primaryDark },
  headerRow: {
    height: layout.screenHeaderHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: layout.cardPadding,
  },
  headerTitle: {
    flex: 1,
    ...componentType.screenHeaderTitle,
    color: colors.textInverse,
  },
  bell: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs - 2,
    minWidth: layout.badgeSmall,
    height: layout.badgeSmall,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: { ...componentType.badgeSmall, color: colors.textInverse },

  body: { paddingHorizontal: layout.cardPadding, paddingTop: spacing.lg },

  // ── मोठं शीर्षक ──
  sectionTitle: {
    ...typography.titleL,
    ...strong.semibold,
    color: colors.text,
  },
  indicator: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  bar: {
    width: layout.indicatorWidth,
    height: layout.indicatorHeight,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  barOn: { width: layout.indicatorActiveWidth, backgroundColor: A.primary },

  // ── कार्ड ──
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
  },

  // ── वैशिष्ट्य पट्टी (72dp) ──
  feature: {
    height: layout.featureCardHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
    backgroundColor: A.primaryLight,
  },
  featureIcon: {
    width: layout.iconBoxSmall,
    height: layout.iconBoxSmall,
    borderRadius: radius.md,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: {
    ...typography.bodyL,
    ...strong.semibold,
    color: A.primary,
  },
  featureSub: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  viewAllText: {
    ...componentType.buttonSmall,
    color: A.primary,
  },

  // ── यादीतली ओळ (64dp) ──
  row: {
    height: layout.categoryRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
    backgroundColor: colors.surface,
  },
  rowDivided: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowIcon: {
    width: layout.iconBoxSmall,
    height: layout.iconBoxSmall,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: {
    ...componentType.rowTitle,
    color: colors.text,
  },
  rowMeta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },

  // ── अभ्यासक्रम ──
  syllabus: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.syllabusBg,
    overflow: 'hidden',
  },
  syllabusHead: {
    height: layout.featureCardHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
  },
  syllabusIcon: {
    width: layout.iconBoxSmall,
    height: layout.iconBoxSmall,
    borderRadius: radius.md,
    backgroundColor: colors.syllabusBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syllabusTitle: {
    ...typography.bodyL,
    ...strong.semibold,
    color: colors.syllabusText,
  },

  empty: {
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  emptyText: {
    ...typography.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
