import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { EmptyState, ErrorState, Loading } from '@/components/ui/async-state';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { api, type ApiAnalyticsSubject } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  radius,
  shadow,
  spacing,
  strong,
  subjectColor,
  typography,
} from '@/theme/tokens';

/**
 * कामगिरीचं विश्लेषण.
 *
 * इथला प्रत्येक आकडा विद्यार्थ्याच्या स्वतःच्या attempts मधून येतो. Design मध्ये
 * वर पाच tabs आहेत (Overview / Tests / Subjects / Time / Comparison), पण त्या
 * पाचांतला मजकूर एकाच पडद्यावर बसतो. Tabs मागे लपवला तर विद्यार्थ्याला आपला
 * कच्चा विषय शोधायला चार वेळा टॅप करावं लागेल — म्हणून एकच पडदा.
 */
export default function AnalyticsScreen() {
  const { data, loading, error, reload } = useApi(() => api.analytics(), []);

  if (loading) return <Loading label="विश्लेषण काढतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  if (data.testsAttempted === 0) {
    return (
      <Screen>
        <Text style={styles.title}>Analytics</Text>
        <EmptyState
          icon="bar-chart-outline"
          message="एकही test सोडवलेला नाही. पहिला test दिल्यावर इथे तुमची कामगिरी दिसेल."
        />
      </Screen>
    );
  }

  const trendValues = data.trend.map((t) => t.percentage);

  return (
    <Screen>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>तुमची प्रगती आणि सुधारणा</Text>

      {/* ── एकूण कामगिरी ── */}
      <View style={styles.hero}>
        <ProgressRing
          progress={data.averageScore / 100}
          size={96}
          thickness={8}
          color={colors.primary}
          label={`${data.averageScore}%`}
          sublabel="सरासरी"
        />
        <View style={styles.heroText}>
          {data.betterThanPercent !== null ? (
            <>
              <Text style={styles.heroLead}>तुम्ही</Text>
              <Text style={styles.heroBig}>{data.betterThanPercent}%</Text>
              <Text style={styles.heroLead}>विद्यार्थ्यांपेक्षा पुढे आहात</Text>
            </>
          ) : (
            // पहिलाच attempt — तुलना करायला दुसरं कोणीच नाही.
            <Text style={styles.heroLead}>
              अजून तुलना करता येत नाही. आणखी test दिल्यावर तुमचं स्थान कळेल.
            </Text>
          )}
        </View>
      </View>

      {/* ── चार आकडे ── */}
      <View style={styles.statRow}>
        <StatCard
          icon="document-text-outline"
          tint={colors.primary}
          tintSoft={colors.primaryLight}
          label="Tests Attempted"
          value={String(data.testsAttempted)}
        />
        <StatCard
          icon="trending-up-outline"
          tint={colors.success}
          tintSoft={colors.successLight}
          label="Best Score"
          value={String(data.bestScore)}
          suffix="%"
        />
      </View>
      <View style={styles.statRow}>
        <StatCard
          icon="time-outline"
          tint={colors.warning}
          tintSoft={colors.warningLight}
          label="Hours Studied"
          value={String(data.hoursStudied)}
          suffix="h"
        />
        <StatCard
          icon="ribbon-outline"
          tint={colors.error}
          tintSoft={colors.errorLight}
          label="Average Score"
          value={String(data.averageScore)}
          suffix="%"
        />
      </View>

      {/* ── कालानुरूप आलेख ── */}
      {data.trend.length >= 2 ? (
        <>
          <SectionHeader title="Performance Over Time" />
          <View style={styles.chartCard}>
            <TrendChart points={trendValues} />
            <View style={styles.chartFoot}>
              <Text style={styles.chartFootText}>{`शेवटचे ${data.trend.length} test`}</Text>
              <Text style={styles.chartFootText}>
                {`${Math.min(...trendValues)}% – ${Math.max(...trendValues)}%`}
              </Text>
            </View>
          </View>
        </>
      ) : null}

      {/* ── विषयानुसार ── */}
      <SectionHeader title="Subject Wise Performance" />
      <View style={styles.card}>
        {data.subjects.length > 0 ? (
          data.subjects.map((s) => <SubjectRow key={s.id} subject={s} />)
        ) : (
          // विषय नेमलेले नसतील तर हा भाग रिकामा दिसेल — तो का, ते सांगतो.
          <Text style={styles.noteText}>
            प्रश्नांना अजून विषय नेमलेले नाहीत, म्हणून विषयानुसार आकडे काढता येत नाहीत.
          </Text>
        )}
      </View>

      {/* ── बलस्थानं / सुधारायच्या जागा ── */}
      {data.strengths.length > 0 || data.weaknesses.length > 0 ? (
        <View style={styles.splitRow}>
          {data.strengths.length > 0 ? (
            <View style={[styles.card, styles.splitCard]}>
              <View style={styles.splitHead}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.splitTitle}>बलस्थानं</Text>
              </View>
              {data.strengths.map((s) => (
                <View key={s.id} style={styles.splitLine}>
                  <Text style={styles.splitName} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text style={[styles.splitPct, { color: colors.success }]}>
                    {s.accuracy}%
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {data.weaknesses.length > 0 ? (
            <View style={[styles.card, styles.splitCard]}>
              <View style={styles.splitHead}>
                <Ionicons name="alert-circle" size={16} color={colors.warning} />
                <Text style={styles.splitTitle}>सुधारायचं</Text>
              </View>
              {data.weaknesses.map((s) => (
                <View key={s.id} style={styles.splitLine}>
                  <Text style={styles.splitName} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text style={[styles.splitPct, { color: colors.warning }]}>
                    {s.accuracy}%
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

/** एका विषयाची ओळ — नाव, पट्टी, टक्केवारी. */
function SubjectRow({ subject }: { subject: ApiAnalyticsSubject }) {
  const tint = subjectColor(subject.name);
  return (
    <View style={styles.subjectRow}>
      <View style={styles.subjectTop}>
        <Text style={styles.subjectName} numberOfLines={1}>
          {subject.name}
        </Text>
        <Text style={[styles.subjectPct, { color: tint }]}>{subject.accuracy}%</Text>
      </View>
      <View style={styles.bar}>
        <View
          style={[styles.barFill, { width: `${subject.accuracy}%`, backgroundColor: tint }]}
        />
      </View>
      <Text style={styles.subjectMeta}>
        {`${subject.correct} / ${subject.questionCount} बरोबर`}
      </Text>
    </View>
  );
}

/**
 * साधा रेषा-आलेख.
 *
 * Chart library मुद्दाम टाळली — एका रेषेसाठी ती app मध्ये ओढण्यात अर्थ नाही.
 * `react-native-svg` आधीच result screen साठी आहे, तीच पुरेशी.
 */
function TrendChart({ points }: { points: number[] }) {
  const w = 300;
  const h = 90;
  const pad = 6;

  // Y अक्ष नेहमी 0-100 — नाहीतर 68% आणि 72% मधला फरक डोंगराएवढा दिसतो.
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const coords = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - (p / 100) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
      <Polyline
        points={coords}
        fill="none"
        stroke={colors.primary}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headingXL,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyM,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  heroText: { flex: 1 },
  heroLead: {
    ...typography.bodyM,
    color: colors.textSecondary,
  },
  heroBig: {
    ...typography.headingL,
    ...strong.bold,
    color: colors.primary,
  },

  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  chartFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  chartFootText: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },

  subjectRow: {
    paddingVertical: spacing.sm,
  },
  subjectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    ...componentType.cardTitle,
    color: colors.text,
    flex: 1,
  },
  subjectPct: {
    ...typography.bodyM,
    ...strong.bold,
  },
  bar: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  subjectMeta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  noteText: {
    ...typography.bodyM,
    color: colors.textSecondary,
  },

  splitRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  splitCard: {
    flex: 1,
    gap: spacing.sm,
  },
  splitHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  splitTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  splitLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  splitName: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
    flex: 1,
  },
  splitPct: {
    ...componentType.smallLabel,
    ...strong.semibold,
  },
});
