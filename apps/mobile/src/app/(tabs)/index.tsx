import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FilterChips, type FilterChip } from '@/components/ui/filter-chips';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SeriesCard } from '@/components/ui/series-card';
import { exams, featuredSeries, popularSeries } from '@/data/mock';
import { colors, layout, radius, shadow, spacing, strong, typography } from '@/theme/tokens';

/**
 * Home = **Test Series चं दुकान.**
 *
 * ठरलेलं: विद्यार्थी इथूनच सगळं बघतो आणि test series विकत घेतो. त्याचे स्वतःचे
 * चालू tests आणि प्रगती **Tests tab** मध्ये आहेत — इथे नाहीत.
 *
 * मापं design system च्या implementation guide मधून जशीच्या तशी: hero 170,
 * featured 280×235, exam card 171×82 (दोन प्रति ओळ), popular 150.
 */

const HIGHLIGHTS = [
  { icon: 'document-text-outline' as const, title: 'Latest Pattern', note: 'Based on new exam pattern' },
  { icon: 'bulb-outline' as const, title: 'Detailed Solutions', note: 'Question-wise explanations' },
  { icon: 'podium-outline' as const, title: 'All India Ranking', note: 'Compare your performance' },
  { icon: 'trending-up-outline' as const, title: 'Performance Analysis', note: 'Track your progress' },
];

export default function StoreScreen() {
  const [activeExam, setActiveExam] = useState('all');

  const chips: FilterChip[] = [
    { key: 'all', label: 'All Exams', icon: 'grid-outline' },
    ...exams.slice(0, 5).map((e) => ({ key: e.id, label: e.name })),
  ];

  const activeExamName = exams.find((e) => e.id === activeExam)?.name;
  const byExam = <T extends { examName: string }>(list: T[]) =>
    activeExam === 'all' ? list : list.filter((s) => s.examName === activeExamName);

  const visibleFeatured = byExam(featuredSeries);
  const visiblePopular = byExam(popularSeries);

  return (
    <Screen>
      {/* ── शीर्षक ── */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Test Series</Text>
          <Text style={styles.subtitle}>
            Practice more, score higher. Choose the best test series for you.
          </Text>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>
      </View>

      {/* ── जाहिरात पट्टी ── */}
      <View style={styles.hero}>
        <View style={styles.heroChip}>
          <Ionicons name="ribbon-outline" size={14} color={colors.primary} />
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
            <SeriesCard key={s.id} series={s} variant="featured" />
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
              <Ionicons name={e.icon as never} size={20} color={colors.primary} />
            </View>
            <View style={styles.examTextBox}>
              <Text style={styles.examName} numberOfLines={1}>
                {e.name}
              </Text>
              <Text style={styles.examCount}>{e.seriesCount} Test Series</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* ── वैशिष्ट्यं ── */}
      <View style={styles.gap} />
      <View style={styles.highlights}>
        {HIGHLIGHTS.map((h) => (
          <View key={h.title} style={styles.highlight}>
            <View style={styles.highlightIcon}>
              <Ionicons name={h.icon} size={16} color={colors.primary} />
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
          visiblePopular.map((s) => <SeriesCard key={s.id} series={s} variant="popular" />)
        ) : (
          <Text style={styles.empty}>या परीक्षेसाठी अजून series नाही.</Text>
        )}
      </View>
    </Screen>
  );
}

function HeroPoint({ label }: { label: string }) {
  return (
    <View style={styles.heroPoint}>
      <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
      <Text style={styles.heroPointText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    minHeight: layout.heroHeight,
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
    // 375 − 16×2 padding − 12 gap = 331 ≈ दोन कार्ड. निश्चित रुंदी दिली तर
    // रुंद फोनवर मधे मोकळी जागा राहते, म्हणून उरलेली जागा वाटून घेतो.
    flexGrow: 1,
    flexBasis: '46%',
    height: layout.examCard.height,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  examIcon: {
    width: 40,
    height: 40,
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
    ...typography.bodyM,
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
