import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FilterChips, type FilterChip } from '@/components/ui/filter-chips';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SeriesCard } from '@/components/ui/series-card';
import { exams, featuredSeries, popularSeries } from '@/data/mock';
import { colors, radius, shadow, spacing, typography } from '@/theme/tokens';

/**
 * Home = **Test Series चं दुकान.**
 *
 * ठरलेलं: विद्यार्थी इथूनच सगळं बघतो आणि test series विकत घेतो. त्याचे स्वतःचे
 * चालू tests आणि प्रगती **Tests tab** मध्ये आहेत — इथे नाहीत.
 *
 * Cart नाही: "Buy Now" थेट त्या series चा Razorpay checkout उघडेल (बाहेरच्या
 * browser मध्ये — Play Billing चा 15% वाचवण्यासाठी).
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

  const visibleFeatured =
    activeExam === 'all'
      ? featuredSeries
      : featuredSeries.filter((s) => s.examName === exams.find((e) => e.id === activeExam)?.name);

  const visiblePopular =
    activeExam === 'all'
      ? popularSeries
      : popularSeries.filter((s) => s.examName === exams.find((e) => e.id === activeExam)?.name);

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
          <Ionicons name="search" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* ── जाहिरात पट्टी ── */}
      <View style={styles.hero}>
        <View style={styles.heroChip}>
          <Ionicons name="ribbon-outline" size={12} color={colors.purple} />
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
              <Ionicons name={e.icon as never} size={18} color={colors.primary} />
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
            <Ionicons name={h.icon} size={16} color={colors.primary} />
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
          visiblePopular.map((s) => <SeriesCard key={s.id} series={s} variant="row" />)
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
      <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
      <Text style={styles.heroPointText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },

  hero: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
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
    marginBottom: spacing.sm,
  },
  heroChipText: {
    ...typography.micro,
    color: colors.purple,
  },
  heroTitle: {
    ...typography.h1,
    fontSize: 22,
    color: colors.text,
  },
  heroTitleAccent: {
    color: colors.purple,
  },
  heroPoints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  heroPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroPointText: {
    ...typography.micro,
    fontWeight: '500',
    color: colors.textMuted,
  },

  featuredRow: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },

  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  examTile: {
    // दोन ओळीत बसावेत म्हणून अर्ध्यापेक्षा किंचित कमी रुंदी (मधलं अंतर वजा).
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  examIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examTextBox: {
    flex: 1,
  },
  examName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  examCount: {
    ...typography.micro,
    fontWeight: '400',
    color: colors.textFaint,
  },

  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  highlight: {
    width: '47%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  highlightText: {
    flex: 1,
  },
  highlightTitle: {
    ...typography.micro,
    color: colors.text,
  },
  highlightNote: {
    fontSize: 10,
    color: colors.textFaint,
  },

  list: {
    gap: spacing.md,
  },
  gap: {
    height: spacing.xl,
  },
  empty: {
    ...typography.caption,
    color: colors.textMuted,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
