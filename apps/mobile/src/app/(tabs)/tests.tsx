import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterChips, type FilterChip } from '@/components/ui/filter-chips';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import {
  myProgress,
  mySeries,
  performanceSummary,
  seriesTests,
  testInProgress,
} from '@/data/mock';
import {
  colors,
  componentType,
  layout,
  radius,
  shadow,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';
import type { SeriesTestRow, SeriesTestStatus } from '@/types';

/**
 * "My Test Series" — विद्यार्थ्याचं स्वतःचं. Design sheet मधला क्रम:
 * banner (170) → Continue कार्ड (150) → घेतलेल्या series (test rows सह) →
 * Performance Analytics (170) → My Progress (120).
 *
 * Home tab हे दुकान आहे (नवीन series विकत घ्यायला) — इथे फक्त आधीच घेतलेलं दिसतं.
 */

/** प्रत्येक स्थितीचा रंग एकाच ठिकाणी — chip आणि गुण दोन्हीसाठी तोच. */
const STATUS: Record<SeriesTestStatus, { label: string; fg: string; bg: string }> = {
  COMPLETED: { label: 'Completed', fg: colors.success, bg: colors.successLight },
  IN_PROGRESS: { label: 'In Progress', fg: colors.warning, bg: colors.warningLight },
  NOT_ATTEMPTED: { label: 'Not Attempted', fg: colors.textSecondary, bg: colors.background },
};

export default function MyTestSeriesScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = Array.from(new Set(mySeries.map((s) => s.categoryName)));
  const chips: FilterChip[] = [
    { key: 'all', label: 'All' },
    ...categories.map((c) => ({ key: c, label: c })),
  ];

  const visibleSeries =
    activeCategory === 'all' ? mySeries : mySeries.filter((s) => s.categoryName === activeCategory);

  // `testInProgress` हा union मध्ये `null` सुद्धा आहे. एका स्थानिक चलात घेतल्याने
  // TypeScript ला खात्री पटते की JSX मधल्या closure मध्येही तो null नाही.
  const current = testInProgress;
  const answered = current?.answeredCount ?? 0;
  const donePercent = current ? Math.round((answered / current.questionCount) * 100) : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Test Series</Text>
        <View style={styles.headerActions}>
          <Ionicons name="search" size={layout.navIconSize} color={colors.text} />
          <View>
            <Ionicons name="notifications-outline" size={layout.navIconSize} color={colors.text} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </View>
      </View>

      <FilterChips chips={chips} active={activeCategory} onChange={setActiveCategory} />

      {/* ── banner ── */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Practice More.{'\n'}Score Higher.</Text>
        <Text style={styles.bannerNote}>High quality tests designed as per latest pattern.</Text>
        <Pressable style={styles.bannerButton} onPress={() => router.push('/')}>
          <Text style={styles.bannerButtonText}>Explore Test Series</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* ── अर्धवट राहिलेला test ── */}
      {current ? (
        <View style={styles.continueCard}>
          <View style={styles.continueTop}>
            <View style={styles.continueIcon}>
              <Ionicons name="document-text" size={layout.cardIconSize} color={colors.primary} />
            </View>
            <View style={styles.continueHeadText}>
              <Text style={styles.continueLabel}>Continue Your Test</Text>
              <Text style={styles.continueTitle} numberOfLines={1}>
                {current.title}
              </Text>
            </View>
          </View>

          <View style={styles.continueMetaRow}>
            <Text style={styles.continueMeta}>
              {answered} / {current.questionCount} Questions Completed
            </Text>
            <Text style={styles.continuePercent}>{donePercent}%</Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${donePercent}%` }]} />
          </View>

          <Pressable
            style={styles.resumeButton}
            onPress={() => router.push(`/quiz/${current.id}/attempt`)}>
            <Text style={styles.resumeButtonText}>Resume Test</Text>
          </Pressable>
        </View>
      ) : null}

      {/* ── घेतलेल्या series ── */}
      <View style={styles.gap} />
      <SectionHeader title="Enrolled Test Series" onViewAll={() => {}} />

      {visibleSeries.map((series) => (
        <View key={series.id} style={styles.seriesCard}>
          <View style={styles.seriesHead}>
            <View style={styles.seriesLogo}>
              <Ionicons name="library" size={layout.cardIconSize} color={colors.textInverse} />
            </View>
            <View style={styles.seriesHeadText}>
              <Text style={styles.seriesTitle} numberOfLines={1}>
                {series.title}
              </Text>
              <Text style={styles.seriesSubtitle}>Complete Test Series</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>Active</Text>
            </View>
          </View>

          {(seriesTests[series.id] ?? []).map((row) => (
            <TestRow key={row.id} row={row} onPress={() => router.push(`/quiz/${row.id}/attempt`)} />
          ))}

          <Pressable style={styles.viewAllTests} onPress={() => {}}>
            <Text style={styles.viewAllTestsText}>View All Tests</Text>
          </Pressable>
        </View>
      ))}

      {/* ── कामगिरीचा सारांश ── */}
      <View style={styles.gap} />
      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHead}>
          <View style={styles.analyticsIcon}>
            <Ionicons name="stats-chart" size={layout.cardIconSize} color={colors.success} />
          </View>
          <View style={styles.analyticsHeadText}>
            <Text style={styles.analyticsTitle}>Your Performance Analytics</Text>
            <Text style={styles.analyticsNote}>Track your performance and improve</Text>
          </View>
          <Pressable onPress={() => router.push('/analytics')}>
            <Text style={styles.link}>View Report</Text>
          </Pressable>
        </View>

        <View style={styles.analyticsRow}>
          <Metric icon="clipboard-outline" label="Tests Taken" value={`${performanceSummary.testsTaken}`} tint={colors.primary} />
          <Metric icon="ribbon-outline" label="Average Score" value={`${performanceSummary.averageScorePercent}%`} tint={colors.success} />
          <Metric icon="star-outline" label="Highest Score" value={`${performanceSummary.highestScorePercent}%`} tint={colors.warning} />
          <Metric icon="disc-outline" label="Accuracy" value={`${performanceSummary.accuracyPercent}%`} tint={colors.danger} />
        </View>
      </View>

      {/* ── माझी प्रगती ── */}
      <View style={styles.gap} />
      <SectionHeader title="My Progress" onViewAll={() => router.push('/analytics')} />
      <View style={styles.progressRow}>
        <View style={styles.progressCard}>
          <View style={[styles.progressIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="clipboard" size={20} color={colors.primary} />
          </View>
          <Text style={styles.progressLabel}>Tests Completed</Text>
          <Text style={styles.progressValue}>
            {myProgress.testsCompleted} / {myProgress.testsTotal}
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                { width: `${(myProgress.testsCompleted / myProgress.testsTotal) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={[styles.progressIcon, { backgroundColor: colors.successLight }]}>
            <Ionicons name="disc" size={20} color={colors.success} />
          </View>
          <Text style={styles.progressLabel}>Overall Score</Text>
          <Text style={styles.progressValue}>{myProgress.overallScorePercent}%</Text>
          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                { width: `${myProgress.overallScorePercent}%`, backgroundColor: colors.success },
              ]}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

/** Series कार्डातली एक test ओळ — 01 / नाव / मापं / स्थिती. */
function TestRow({ row, onPress }: { row: SeriesTestRow; onPress: () => void }) {
  const status = STATUS[row.status];

  return (
    <Pressable style={styles.testRow} onPress={onPress}>
      <Text style={styles.testOrder}>{String(row.order).padStart(2, '0')}</Text>

      <View style={styles.testBody}>
        <Text style={styles.testTitle} numberOfLines={1}>
          {row.title}
        </Text>
        <View style={styles.testMetaRow}>
          <TestMeta text={`${row.questionCount} Qs`} />
          <TestMeta text={`${row.totalMarks} Marks`} />
          <TestMeta text={`${row.durationMinutes} Mins`} />
        </View>
      </View>

      <View style={styles.testRight}>
        <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
        </View>
        {row.scorePercent !== undefined ? (
          <Text style={styles.testScore}>Score {row.scorePercent}%</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * Design मध्ये प्रत्येक मापाच्या आधी icon आहे, पण 360dp मध्ये icon + मजकूर +
 * स्थितीचा chip एका ओळीत बसत नाहीत — meta दुसऱ्या ओळीवर उडी मारत होतं. Icon
 * काढून नुसता मजकूर ठेवला की तिन्ही मापं एका ओळीत राहतात, आणि तेच design चा हेतू आहे.
 */
function TestMeta({ text }: { icon?: keyof typeof Ionicons.glyphMap; text: string }) {
  // एक ओळ बंधनकारक — नाहीतर "Not Attempted" सारख्या रुंद chip शेजारी "100 Qs" चं
  // "100" आणि "Qs" दोन ओळींत तुटतं.
  return (
    <Text style={styles.testMetaText} numberOfLines={1}>
      {text}
    </Text>
  );
}

function Metric({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View style={styles.metric}>
      {/* रंगाच्या शेवटी 1A = 10% अपारदर्शकता — प्रत्येक tint साठी वेगळा फिकट
          रंग tokens मध्ये ठेवण्यापेक्षा हे थेट आणि नेहमी जुळणारं आहे. */}
      <View style={[styles.metricIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      {/* "Average Score" / "Highest Score" एका ओळीत बसत नाहीत — चार stats 360dp
          मध्ये वाटल्यावर प्रत्येकाला ~72dp मिळतात. दोन ओळी दिल्या की पूर्ण दिसतात. */}
      <Text style={styles.metricLabel} numberOfLines={2}>
        {label}
      </Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.headerHeight,
  },
  screenTitle: {
    ...typography.headingXL,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: componentType.badge.fontFamily,
    color: colors.textInverse,
  },

  // ── banner ──
  banner: {
    minHeight: 170,
    backgroundColor: colors.primary,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  bannerTitle: {
    ...typography.headingL,
    color: colors.textInverse,
  },
  bannerNote: {
    ...typography.bodyM,
    color: 'rgba(255,255,255,0.85)',
  },
  bannerButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: layout.buttonHeight,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  bannerButtonText: {
    ...componentType.buttonText,
    color: colors.primary,
  },

  // ── continue ──
  continueCard: {
    minHeight: 150,
    // Design मधला फिकट निळा — तो surface पेक्षा वेगळा दिसावा म्हणून. Palette मध्ये
    // नाही, पण banner च्या जांभळ्याशी जुळणारा सर्वात फिकट indigo आहे.
    backgroundColor: '#EEF2FF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  continueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  continueIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueHeadText: {
    flex: 1,
    gap: 2,
  },
  continueLabel: {
    ...componentType.cardDescription,
    ...strong.semibold,
    color: colors.primary,
  },
  continueTitle: {
    ...typography.titleL,
    color: colors.text,
  },
  continueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  continueMeta: {
    ...componentType.cardDescription,
    color: colors.textSecondary,
  },
  continuePercent: {
    ...componentType.cardDescription,
    ...strong.semibold,
    color: colors.primary,
  },
  resumeButton: {
    height: layout.buttonSecondaryHeight,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  resumeButtonText: {
    ...componentType.cardDescription,
    ...strong.semibold,
    color: colors.textInverse,
  },

  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  // ── series कार्ड ──
  seriesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadow.card,
  },
  seriesHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  seriesLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesHeadText: {
    flex: 1,
    gap: 2,
  },
  seriesTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  seriesSubtitle: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },

  // ── test ओळ ──
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  testOrder: {
    ...componentType.cardTitle,
    color: colors.border,
  },
  testBody: {
    flex: 1,
    gap: spacing.xs,
  },
  testTitle: {
    ...typography.bodyM,
    ...strong.semibold,
    color: colors.text,
  },
  testMetaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  testMetaText: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  testRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  testScore: {
    ...componentType.smallLabel,
    ...strong.semibold,
    color: colors.text,
  },
  statusChip: {
    height: layout.chipHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.chip,
  },
  statusText: {
    ...componentType.badge,
  },
  viewAllTests: {
    height: layout.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllTestsText: {
    ...componentType.buttonText,
    color: colors.primary,
  },

  // ── analytics ──
  analyticsCard: {
    minHeight: 170,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow.card,
  },
  analyticsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  analyticsIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsHeadText: {
    flex: 1,
    gap: 2,
  },
  analyticsTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  analyticsNote: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  link: {
    ...componentType.cardDescription,
    ...strong.semibold,
    color: colors.primary,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metricValue: {
    ...typography.titleL,
    color: colors.text,
  },

  // ── my progress ──
  progressRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  progressCard: {
    flex: 1,
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
  progressIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  progressValue: {
    ...typography.headingL,
    color: colors.text,
  },

  gap: {
    height: spacing['3xl'],
  },
});
