import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterChips, type FilterChip } from '@/components/ui/filter-chips';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { TestCard } from '@/components/ui/test-card';
import { mySeries, testInProgress, todayProgress, upcomingTests } from '@/data/mock';
import { colors, radius, shadow, spacing, subjectColor, typography, strong } from '@/theme/tokens';

/**
 * Tests tab = **विद्यार्थ्याचं स्वतःचं.** घेतलेल्या series, अर्धवट राहिलेला test,
 * आजची प्रगती, आणि येणारे tests.
 *
 * Home tab हे दुकान आहे (नवीन series विकत घ्यायला) — इथे फक्त आधीच घेतलेलं दिसतं.
 */
export default function MyTestsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = Array.from(new Set(mySeries.map((s) => s.categoryName)));
  const chips: FilterChip[] = [
    { key: 'all', label: 'All' },
    ...categories.map((c) => ({ key: c, label: c })),
  ];

  const visibleSeries =
    activeCategory === 'all' ? mySeries : mySeries.filter((s) => s.categoryName === activeCategory);

  const studyHours = Math.floor(todayProgress.studyMinutes / 60);
  const studyMins = todayProgress.studyMinutes % 60;

  // स्थानिक const — नाहीतर खालच्या onPress मध्ये TypeScript ला `testInProgress`
  // null नाही हे लक्षात राहत नाही (import केलेल्या binding चं narrowing टिकत नाही).
  const inProgress = testInProgress;
  const answered = inProgress?.answeredCount ?? 0;
  const progressPct = inProgress
    ? Math.round((answered / inProgress.questionCount) * 100)
    : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>My Test Series</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>
      </View>

      <FilterChips chips={chips} active={activeCategory} onChange={setActiveCategory} />
      <View style={styles.gap} />

      {/* ── अर्धवट राहिलेला test ── */}
      {inProgress ? (
        <View style={styles.continueCard}>
          <View style={styles.continueTop}>
            <View style={styles.continueIcon}>
              <Ionicons name="document-text" size={20} color={colors.textInverse} />
            </View>
            <View style={styles.continueTitleBox}>
              <Text style={styles.continueLabel}>Continue Your Test</Text>
              <Text style={styles.continueTitle}>{inProgress.title}</Text>
            </View>
            <View style={styles.continueChip}>
              <Text style={styles.continueChipText}>In Progress</Text>
            </View>
          </View>

          <View style={styles.continueTrack}>
            <View style={[styles.continueFill, { width: `${progressPct}%` }]} />
          </View>

          <View style={styles.continueMeta}>
            <Text style={styles.continueMetaText}>
              <Text style={styles.continueMetaStrong}>{answered}</Text>
              {` / ${inProgress.questionCount} Questions`}
            </Text>
            <Text style={styles.continueMetaStrong}>{progressPct}%</Text>
          </View>

          <Pressable
            style={styles.continueButton}
            onPress={() => router.push(`/quiz/${inProgress.id}/attempt`)}>
            <Text style={styles.continueButtonText}>Continue Test</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
        </View>
      ) : null}

      {/* ── आजची प्रगती ── */}
      <SectionHeader title="Today's Progress" onViewAll={() => router.push('/analytics')} />
      <View style={styles.statGrid}>
        <StatCard
          icon="checkmark-circle"
          tint={colors.success}
          tintSoft={colors.successLight}
          label="Questions Solved"
          value={String(todayProgress.questionsSolved)}
          suffix={`/ ${todayProgress.questionsTarget}`}
          progress={todayProgress.questionsSolved / todayProgress.questionsTarget}
        />
        <StatCard
          icon="disc"
          tint={colors.primary}
          tintSoft={colors.primaryLight}
          label="Accuracy"
          value={String(todayProgress.accuracyPercent)}
          suffix="%"
          progress={todayProgress.accuracyPercent / 100}
        />
      </View>
      <View style={styles.statGrid}>
        <StatCard
          icon="time"
          tint={colors.primary}
          tintSoft={colors.primaryLight}
          label="Study Time"
          value={`${studyHours}h ${studyMins}m`}
        />
        <StatCard
          icon="trophy"
          tint={colors.warning}
          tintSoft={colors.warningLight}
          label="Current Rank"
          value={`#${todayProgress.rank}`}
          footnote={`Top ${todayProgress.rankTopPercent}%`}
        />
      </View>

      {/* ── घेतलेल्या series ── */}
      <View style={styles.gap} />
      <SectionHeader title="Active Test Series" />
      <View style={styles.list}>
        {visibleSeries.length > 0 ? (
          visibleSeries.map((s) => {
            const tint = subjectColor(s.categoryName);
            const done = s.completedTests / s.plannedTotalTests;
            return (
              <View key={s.id} style={styles.seriesCard}>
                <View style={styles.seriesTop}>
                  <View style={[styles.seriesIcon, { backgroundColor: tint + '18' }]}>
                    <Ionicons name="layers" size={20} color={tint} />
                  </View>
                  <View style={styles.seriesTextBox}>
                    <View style={[styles.categoryChip, { backgroundColor: tint + '18' }]}>
                      <Text style={[styles.categoryText, { color: tint }]}>{s.categoryName}</Text>
                    </View>
                    <Text style={styles.seriesTitle}>{s.title}</Text>
                    <Text style={styles.seriesMeta}>
                      {`${s.completedTests} Tests  •  ${s.plannedTotalTests} Total Tests`}
                    </Text>
                  </View>
                  <ProgressRing progress={done} size={58} color={tint} />
                </View>

                <View style={styles.seriesTrack}>
                  <View
                    style={[styles.seriesFill, { width: `${done * 100}%`, backgroundColor: tint }]}
                  />
                </View>

                <View style={styles.seriesFooter}>
                  <Text style={styles.seriesMeta}>
                    {`${s.completedTests} / ${s.plannedTotalTests} Tests Completed`}
                  </Text>
                  <Pressable style={styles.viewLink}>
                    <Text style={styles.viewLinkText}>View Series</Text>
                    <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.empty}>या विषयाची कुठलीही series घेतलेली नाही.</Text>
        )}
      </View>

      {/* ── येणारे tests ── */}
      <View style={styles.gap} />
      <SectionHeader title="Upcoming Tests" onViewAll={() => {}} />
      <View style={styles.list}>
        {upcomingTests.map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </View>

      {/* ── सूचना ── */}
      <View style={styles.gap} />
      <View style={styles.tip}>
        <Ionicons name="bulb-outline" size={18} color={colors.primary} />
        <Text style={styles.tipText}>
          <Text style={styles.tipStrong}>Pro Tip: </Text>
          Attempt previous tests to analyze your performance better.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingL,
    color: colors.text,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textInverse,
  },

  continueCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  continueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  continueIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueTitleBox: {
    flex: 1,
  },
  continueLabel: {
    ...typography.bodyS,
    color: 'rgba(255,255,255,0.85)',
  },
  continueTitle: {
    ...typography.bodyL, ...strong.semibold,
    fontSize: 18,
    color: colors.textInverse,
  },
  continueChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  continueChipText: {
    ...typography.caption,
    color: colors.textInverse,
  },
  continueTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  continueFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
  continueMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  continueMetaText: {
    ...typography.bodyS,
    color: 'rgba(255,255,255,0.85)',
  },
  continueMetaStrong: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.textInverse,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  continueButtonText: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.primary,
  },

  statGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  seriesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  seriesTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  seriesIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesTextBox: {
    flex: 1,
    gap: 2,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  categoryText: {
    ...typography.caption,
  },
  seriesTitle: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.text,
  },
  seriesMeta: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  seriesTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  seriesFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  seriesFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewLinkText: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.primary,
  },

  tip: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tipText: {
    flex: 1,
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  tipStrong: {
    fontWeight: '700',
    color: colors.text,
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
