import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { EmptyState, ErrorState, Loading } from '@/components/ui/async-state';
import { FilterChips, type FilterChip } from '@/components/ui/filter-chips';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SeriesCard } from '@/components/ui/series-card';
import { api, type ApiCatalogSeries } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { colors, layout, radius, shadow, spacing, strong, typography } from '@/theme/tokens';

/**
 * **Buy Test Series** — दुकान.
 *
 * हे आधी Home होतं. नवीन design मध्ये Home हा dashboard झाला, आणि दुकान
 * त्यातल्या "टेस्ट सिरीज खरेदी" tile मागे आलं.
 *
 * मापं design system च्या implementation guide मधून जशीच्या तशी.
 */

const HIGHLIGHTS = [
  { icon: 'document-text-outline' as const, title: 'Latest Pattern', note: 'Based on new exam pattern' },
  { icon: 'bulb-outline' as const, title: 'Detailed Solutions', note: 'Question-wise explanations' },
  { icon: 'podium-outline' as const, title: 'All India Ranking', note: 'Compare your performance' },
  { icon: 'trending-up-outline' as const, title: 'Performance Analysis', note: 'Track your progress' },
];

export default function StoreScreen() {
  const router = useRouter();
  const [activeExam, setActiveExam] = useState('all');

  const { data, loading, error, reload } = useApi(() => api.catalog(), []);
  const { data: examData } = useApi(() => api.exams(), []);
  const catalog = data ?? [];
  const exams = examData ?? [];

  /**
   * Chips परीक्षांवरून — दुकान परीक्षेनुसार मांडलेलं आहे, विषयानुसार नाही.
   * Admin नवीन परीक्षा बनवली की ती आपोआप इथे येते.
   */
  const chips: FilterChip[] = [
    { key: 'all', label: 'All Exams', icon: 'grid-outline' },
    ...exams.map((e) => ({ key: e.id, label: e.name })),
  ];

  const visible =
    activeExam === 'all' ? catalog : catalog.filter((s) => s.examId === activeExam);

  /**
   * Design मध्ये "Featured" आणि "Most Popular" अशा दोन याद्या आहेत, पण त्यांना
   * schema मध्ये आधार नाही — कुठलंही `featured` किंवा `popularity` field नाही.
   * तोपर्यंत पहिल्या तीन "Featured" आणि बाकीच्या "Most Popular" म्हणून दाखवतो.
   * खरं ठरवायचं असेल तर admin ला ते ठरवता यायला हवं — तो वेगळा निर्णय.
   */
  const visibleFeatured = visible.slice(0, 3);
  const visiblePopular = visible;

  /**
   * घेतलेली series उघडणं म्हणजे तिचे tests दाखवणं — ते My Tests मध्ये आहेत.
   * स्वतंत्र "series तपशील" screen अजून नाही; ती लागली तर वेगळी बांधायची.
   */
  const openSeries = (s: ApiCatalogSeries) => {
    if (s.owned) router.push('/tests');
  };

  const [buying, setBuying] = useState<string | null>(null);

  /**
   * "Buy Now".
   *
   * रक्कम पाठवत नाही — server किंमत स्वतः ठरवतो. मोफत series ला access लगेच
   * मिळतो, म्हणून यादी पुन्हा मागवली की तिथे "Start" दिसू लागतं.
   *
   * पैसे घ्यायच्या series चा gateway अजून जोडलेला नाही; तेव्हा server स्पष्ट
   * संदेश देतो आणि तोच विद्यार्थ्याला दाखवतो.
   */
  const buySeries = async (s: ApiCatalogSeries) => {
    if (buying) return;
    setBuying(s.id);
    try {
      await api.createOrder(s.id);
      reload();
    } catch (err) {
      Alert.alert(s.title, (err as Error).message);
    } finally {
      setBuying(null);
    }
  };

  return (
    <Screen>
      {/* ── शीर्षक ── */}
      <View style={styles.header}>
        {/* हा आता tab नाही, dashboard मधून उघडतो — म्हणून मागे जायचं बटण.
            इतिहास असेल तरच मागे; नाहीतर Home वर. थेट या पत्त्यावर आलं तर
            `back()` ला जागाच नसते आणि "GO_BACK was not handled" येतं. */}
        <Pressable
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Buy Test Series</Text>
          <Text style={styles.subtitle}>
            Choose the best test series for your exam preparation.
          </Text>
        </View>
        <Pressable hitSlop={8}>
          <Icon name="search-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable hitSlop={8}>
          <Icon name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>
      </View>

      {/* ── जाहिरात पट्टी ── */}
      <View style={styles.hero}>
        <View style={styles.heroChip}>
          <Icon name="ribbon-outline" size={14} color={colors.primary} />
          <Text style={styles.heroChipText}>Score Higher with Test Series</Text>
        </View>
        <Text style={styles.heroTitle}>Real Exam Experience.</Text>
        <Text style={[styles.heroTitle, styles.heroTitleAccent]}>Real Results.</Text>
        <View style={styles.heroPoints}>
          <HeroPoint label="Exam Pattern" />
          <HeroPoint label="Detailed Analysis" />
          <HeroPoint label="All India Ranking" />
        </View>
      </View>

      {/* ── परीक्षेनुसार गाळणी ── */}
      <FilterChips chips={chips} active={activeExam} onChange={setActiveExam} />
      <View style={styles.gap} />

      {loading ? <Loading label="दुकान उघडतोय…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error && catalog.length === 0 ? (
        <EmptyState icon="pricetag-outline" message="अजून एकही test series विक्रीसाठी नाही." />
      ) : null}

      {/* ── निवडक series ── */}
      <SectionHeader title="Featured Test Series" onViewAll={() => {}} />
      {visibleFeatured.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // पट्टी screen च्या काठापर्यंत जावी म्हणून बाहेर काढून, आत तेवढंच padding.
          style={styles.bleed}
          contentContainerStyle={styles.featuredRow}>
          {visibleFeatured.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              variant="featured"
              onPress={() => openSeries(s)}
              onBuy={() => buySeries(s)}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.empty}>या परीक्षेसाठी अजून series नाही.</Text>
      )}

      {/* ── परीक्षेनुसार ── */}
      <View style={styles.gap} />
      <SectionHeader title="Test Series by Exam" onViewAll={() => {}} />
      <View style={styles.examGrid}>
        {exams.map((e) => (
          <Pressable key={e.id} style={styles.examTile} onPress={() => setActiveExam(e.id)}>
            <View style={styles.examIcon}>
              {/* Admin ने चिन्ह दिलं नसेल तर सामान्य चिन्ह — रिकामी जागा नको. */}
              <Icon
                name={(e.icon ?? 'document-text-outline') as never}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.examTextBox}>
              <Text style={styles.examName} numberOfLines={1}>
                {e.name}
              </Text>
              <Text style={styles.examCount} numberOfLines={1}>
                {e.seriesCount} Test Series
              </Text>
            </View>
          </Pressable>
        ))}

        {/* परीक्षांची संख्या विषम असल्याने शेवटचं कार्ड एकटं पडून पूर्ण रुंदीचं होतं.
            Design मध्ये त्याच्या शेजारी "More Exams" आहे — तो जोडी पूर्ण करतो. */}
        <Pressable style={styles.examTile} onPress={() => {}}>
          <View style={styles.examIcon}>
            <Icon name="ellipsis-horizontal" size={20} color={colors.primary} />
          </View>
          <View style={styles.examTextBox}>
            <Text style={styles.examName} numberOfLines={1}>
              More Exams
            </Text>
            <Text style={styles.examCount} numberOfLines={1}>
              View All
            </Text>
          </View>
        </Pressable>
      </View>

      {/* ── वैशिष्ट्यं ── */}
      <View style={styles.gap} />
      <View style={styles.highlights}>
        {HIGHLIGHTS.map((h) => (
          <View key={h.title} style={styles.highlight}>
            <View style={styles.highlightIcon}>
              <Icon name={h.icon} size={16} color={colors.primary} />
            </View>
            <View style={styles.highlightText}>
              <Text style={styles.highlightTitle}>{h.title}</Text>
              <Text style={styles.highlightNote} numberOfLines={2}>
                {h.note}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── लोकप्रिय ── */}
      <View style={styles.gap} />
      <SectionHeader title="Most Popular Test Series" onViewAll={() => {}} />
      <View style={styles.list}>
        {visiblePopular.length > 0 ? (
          visiblePopular.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              variant="popular"
              onPress={() => openSeries(s)}
              onBuy={() => buySeries(s)}
            />
          ))
        ) : (
          <Text style={styles.empty}>या परीक्षेसाठी अजून series नाही.</Text>
        )}
      </View>

      {/* ── विश्वासाची पट्टी ──
          Design मध्ये इथे "7 Days Money Back Guarantee" अशी दुसरी पट्टीही आहे.
          ती **मुद्दाम टाकलेली नाही**: परतावा देण्याची कुठलीही सोय अजून बांधलेली
          नाही, आणि जे पाळता येत नाही ते वचन app मध्ये छापणं म्हणजे विद्यार्थ्याची
          फसवणूक. परताव्याची प्रक्रिया ठरली की ती पट्टी जोडायची. */}
      <View style={styles.gap} />
      <View style={styles.trustRow}>
        <View style={styles.trustIcon}>
          <Icon name="shield-checkmark" size={20} color={colors.primary} />
        </View>
        <View style={styles.trustText}>
          <Text style={styles.trustTitle}>100% Safe &amp; Secure Payments</Text>
          <Text style={styles.trustNote}>Instant Access · 24×7 Support</Text>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </Screen>
  );
}

function HeroPoint({ label }: { label: string }) {
  return (
    <View style={styles.heroPoint}>
      <Icon name="checkmark-circle" size={14} color={colors.primary} />
      <Text style={styles.heroPointText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginRight: spacing.md,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  trustIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: { flex: 1 },
  trustTitle: {
    ...typography.bodyM,
    ...strong.semibold,
    color: colors.text,
  },
  trustNote: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.headingL,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: typography.caption.fontFamily,
    color: colors.textInverse,
  },

  hero: {
    minHeight: layout.topBannerHeight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    padding: spacing.xl,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  heroChipText: {
    ...typography.caption,
    ...strong.semibold,
    color: colors.primary,
  },
  heroTitle: {
    ...typography.headingL,
    color: colors.text,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  heroPoints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  heroPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroPointText: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },

  bleed: {
    marginHorizontal: -layout.screenPadding,
  },
  featuredRow: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xs,
  },

  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  examTile: {
    // Sheet: 160×72, दोन प्रति ओळ. निश्चित रुंदी दिली तर रुंद फोनवर मधे मोकळी
    // जागा राहते, म्हणून उरलेली जागा वाटून घेतो — उंची मात्र sheet मधलीच.
    flexGrow: 1,
    flexBasis: '46%',
    height: layout.examCardHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  examIcon: {
    // 36 — 40 वर "Police Bharti" सारखी लांब नावं 160dp कार्डात कापली जात होती.
    // Poppins हा Inter पेक्षा रुंद आहे, त्यामुळे मजकुराला जास्त जागा हवी.
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examTextBox: {
    flex: 1,
    gap: 2,
  },
  examName: {
    ...typography.bodyS,
    ...strong.semibold,
    color: colors.text,
  },
  examCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  highlight: {
    flexGrow: 1,
    flexBasis: '44%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  highlightIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    flex: 1,
  },
  highlightTitle: {
    ...typography.caption,
    ...strong.semibold,
    color: colors.text,
  },
  highlightNote: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },

  list: {
    gap: spacing.md,
  },
  gap: {
    height: spacing.xl,
  },
  empty: {
    ...typography.bodyS,
    color: colors.textSecondary,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
