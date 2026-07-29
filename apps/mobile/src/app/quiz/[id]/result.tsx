import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Screen } from '@/components/ui/screen';
import { student, testResult } from '@/data/mock';
import { colors, radius, shadow, spacing, subjectColor, typography, strong } from '@/theme/tokens';

/**
 * निकाल.
 *
 * बरोबर उत्तरं आणि खुलासा **इथे** दाखवायचे — attempt screen वर नाहीत (तिथे दाखवले
 * तर test फुकट जातो). "Review Answers" प्रत्येक प्रश्नाचा खुलासा उघडेल.
 *
 * Mockup मधली "Unlock All Test Series / Go Premium" पट्टी वगळली आहे — subscription
 * नाही असं ठरलं आहे; विक्री per-series आहे.
 */
export default function ResultScreen() {
  const router = useRouter();
  const r = testResult;

  // Test सोडवून झाल्यावर इथे `replace` ने येतो — म्हणजे मागे जायला इतिहासच नसतो
  // आणि सरळ `back()` केलं तर "GO_BACK was not handled" अशी चूक येते. इतिहास असेल
  // तरच मागे, नाहीतर My Tests वर.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/tests'));

  const mins = Math.floor(r.timeTakenSeconds / 60);
  const secs = r.timeTakenSeconds % 60;
  const totalMins = Math.round(r.durationSeconds / 60);

  return (
    <Screen>
      {/* ── वरची पट्टी ── */}
      <View style={styles.topBar}>
        <Pressable hitSlop={8} onPress={goBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.screenTitle}>Test Result</Text>
        <Pressable hitSlop={8} style={styles.topAction}>
          <Ionicons name="download-outline" size={18} color={colors.text} />
          <Text style={styles.topActionText}>Download</Text>
        </Pressable>
        <Pressable hitSlop={8} style={styles.topAction}>
          <Ionicons name="share-social-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      {/* ── कोणता test ── */}
      <View style={styles.testCard}>
        <View style={styles.testIcon}>
          <Ionicons name="clipboard" size={22} color={colors.primary} />
        </View>
        <View style={styles.testTextBox}>
          <Text style={styles.testTitle}>{r.testTitle}</Text>
          <Text style={styles.testMeta}>
            {`${r.code} • ${new Date(r.submittedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}`}
          </Text>
          <View style={styles.completedChip}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>
        <Text style={styles.trophy}>🏆</Text>
      </View>

      {/* ── गुण ── */}
      <Card style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreRingBox}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <ProgressRing
              progress={r.percentage / 100}
              size={104}
              thickness={9}
              color={colors.success}
              label={`${r.percentage}%`}
              sublabel={`${r.score} / ${r.totalMarks}`}
            />
          </View>

          <View style={styles.scoreTextBox}>
            <Text style={styles.congrats}>{`Great Job, ${student.name.split(' ')[0]}! 🎉`}</Text>
            <Text style={styles.congratsNote}>
              {`You have scored better than ${r.percentile}% of test takers.`}
            </Text>
          </View>
        </View>

        <View style={styles.breakdown}>
          <Breakdown
            icon="checkmark-circle"
            tint={colors.success}
            soft={colors.successLight}
            label="Correct"
            value={r.correct}
            total={r.correct + r.incorrect + r.unattempted}
          />
          <Breakdown
            icon="close-circle"
            tint={colors.error}
            soft={colors.errorLight}
            label="Incorrect"
            value={r.incorrect}
            total={r.correct + r.incorrect + r.unattempted}
          />
          <Breakdown
            icon="remove-circle"
            tint={colors.warning}
            soft={colors.warningLight}
            label="Unattempted"
            value={r.unattempted}
            total={r.correct + r.incorrect + r.unattempted}
          />
          <Breakdown
            icon="time"
            tint={colors.primary}
            soft={colors.primaryLight}
            label="Time Taken"
            valueText={`${mins}m ${secs}s`}
            note={`of ${totalMins}m`}
          />
        </View>
      </Card>

      {/* ── विषयवार ── */}
      <View style={styles.gap} />
      <Card>
        <Text style={styles.sectionTitle}>Section / Subject Wise Performance</Text>
        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.thSubject]}>Subject</Text>
          <Text style={styles.th}>Score</Text>
          <Text style={styles.thAccuracy}>Accuracy</Text>
        </View>

        {r.subjects.map((s) => {
          const tint = subjectColor(s.subject);
          const acc = Math.round((s.correct / s.questionCount) * 100);
          return (
            <View key={s.subject} style={styles.tableRow}>
              <View style={styles.subjectCell}>
                <View style={[styles.subjectDot, { backgroundColor: tint }]} />
                <View style={styles.subjectTextBox}>
                  <Text style={styles.subjectName} numberOfLines={1}>
                    {s.subject}
                  </Text>
                  <Text style={styles.subjectCount}>{`${s.questionCount} Questions`}</Text>
                </View>
              </View>

              <Text style={styles.scoreCell}>{`${s.score} / ${s.maxScore}`}</Text>

              <View style={styles.accuracyCell}>
                <View style={styles.accuracyTrack}>
                  <View
                    style={[styles.accuracyFill, { width: `${acc}%`, backgroundColor: tint }]}
                  />
                </View>
                <Text style={styles.accuracyText}>{`${acc}%`}</Text>
              </View>
            </View>
          );
        })}
      </Card>

      {/* ── वेळ आणि कल ── */}
      <View style={styles.gap} />
      <View style={styles.chartsRow}>
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Time Analysis</Text>
          <View style={styles.timeRingBox}>
            <ProgressRing
              progress={r.timeTakenSeconds / r.durationSeconds}
              size={92}
              thickness={9}
              color={colors.primary}
              label={`${mins}m`}
              sublabel={`${secs}s`}
            />
          </View>
          <Text style={styles.chartNote}>{`वापरलेला वेळ — एकूण ${totalMins} मिनिटांपैकी`}</Text>
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Accuracy Trend</Text>
          <TrendLine points={r.trend.map((t) => t.percentage)} />
          <View style={styles.trendLabels}>
            <Text style={styles.chartNote}>{r.trend[0].label}</Text>
            <Text style={styles.chartNote}>{r.trend[r.trend.length - 1].label}</Text>
          </View>
        </Card>
      </View>

      {/* ── कृती ── */}
      <View style={styles.gap} />
      <View style={styles.actions}>
        <Pressable style={styles.outlineAction}>
          <Ionicons name="reader-outline" size={16} color={colors.primary} />
          <Text style={styles.outlineActionText}>Review Answers</Text>
        </Pressable>
        <Pressable style={styles.primaryAction}>
          <Ionicons name="refresh" size={16} color={colors.textInverse} />
          <Text style={styles.primaryActionText}>Re-attempt Test</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Breakdown({
  icon,
  tint,
  soft,
  label,
  value,
  total,
  valueText,
  note,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  soft: string;
  label: string;
  value?: number;
  total?: number;
  valueText?: string;
  note?: string;
}) {
  const pct = value !== undefined && total ? Math.round((value / total) * 100) : null;
  return (
    <View style={[styles.breakdownBox, { backgroundColor: soft }]}>
      <View style={styles.breakdownTop}>
        <Ionicons name={icon} size={14} color={tint} />
        <Text style={styles.breakdownLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.breakdownValue}>{valueText ?? value}</Text>
      <Text style={styles.breakdownNote}>{note ?? (pct !== null ? `${pct}%` : '')}</Text>
    </View>
  );
}

/** साधी रेषा — शेवटच्या काही tests चे टक्के. Chart library न वापरता SVG नेच. */
function TrendLine({ points }: { points: number[] }) {
  const W = 130;
  const H = 62;
  const max = 100;
  const step = points.length > 1 ? W / (points.length - 1) : W;
  const coords = points.map((p, i) => `${i * step},${H - (p / max) * H}`).join(' ');

  return (
    <Svg width={W} height={H}>
      <Polyline
        points={coords}
        fill="none"
        stroke={colors.success}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <Circle key={i} cx={i * step} cy={H - (p / max) * H} r={2.5} fill={colors.success} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  screenTitle: {
    flex: 1,
    ...typography.titleL,
    color: colors.text,
  },
  topAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  topActionText: {
    ...typography.bodyS,
    color: colors.text,
  },

  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  testIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testTextBox: {
    flex: 1,
    gap: spacing.xs,
  },
  testTitle: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.text,
  },
  testMeta: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  completedChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  completedText: {
    ...typography.caption,
    color: colors.success,
  },
  trophy: {
    fontSize: 30,
  },

  scoreCard: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scoreRingBox: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreLabel: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  scoreTextBox: {
    flex: 1,
    gap: spacing.xs,
  },
  congrats: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.success,
  },
  congratsNote: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },

  breakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  breakdownBox: {
    // दोन ओळींत चार चौकोन — मधलं अंतर वजा करून थोडी कमी रुंदी.
    width: '47.5%',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  breakdownTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breakdownLabel: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
  },
  breakdownValue: {
    ...typography.headingL,
    fontSize: 22,
    color: colors.text,
  },
  breakdownNote: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.textSecondary,
  },

  sectionTitle: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  th: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
    width: 62,
    textAlign: 'right',
  },
  thSubject: {
    flex: 1,
    width: undefined,
    textAlign: 'left',
  },
  thAccuracy: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
    width: 92,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  subjectCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  subjectTextBox: {
    flex: 1,
  },
  subjectName: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.text,
  },
  subjectCount: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  scoreCell: {
    width: 62,
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    // गुण आणि accuracy bar एकमेकांना चिकटू नयेत म्हणून.
    paddingRight: spacing.md,
  },
  accuracyCell: {
    width: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  accuracyTrack: {
    flex: 1,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  accuracyText: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 30,
    textAlign: 'right',
  },

  chartsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chartCard: {
    flex: 1,
    gap: spacing.md,
    alignItems: 'center',
  },
  chartTitle: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.text,
    alignSelf: 'flex-start',
  },
  timeRingBox: {
    alignItems: 'center',
  },
  chartNote: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  trendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  outlineAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  outlineActionText: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.primary,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  primaryActionText: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.textInverse,
  },

  gap: {
    height: spacing.lg,
  },
});
