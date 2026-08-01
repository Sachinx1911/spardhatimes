import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { api, type ApiSyllabusListItem } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  layout,
  radius,
  screenAccent,
  shadow,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * अभ्यासक्रम — पहिला पडदा.
 *
 * Sheet प्रमाणे: header → hero → "परीक्षा निवडा" → प्रत्येक अभ्यासक्रमाची ओळ
 * (रंगीत चिन्ह + नाव + विषयांची संख्या + बाण).
 *
 * इथे "परीक्षा" म्हणजे `Exam` नव्हे तर `Syllabus` — "राज्य सेवा (MPSC)",
 * "गट ब (MPSC)" असे एका परीक्षेचे वेगवेगळे अभ्यासक्रम, आणि विद्यार्थी
 * त्यांच्यापैकी एक निवडतो.
 */

const A = screenAccent.syllabus;

/**
 * ओळीच्या चिन्हाचा रंग.
 *
 * अभ्यासक्रम admin बनवतो, म्हणून नावांची ठरलेली यादी ठेवता येत नाही. रंग
 * नावावरून काढतो — तोच अभ्यासक्रम नेहमी त्याच रंगाचा दिसतो, आणि मधला एक
 * काढला तरी बाकीच्यांचे रंग बदलत नाहीत (क्रमाने दिले असते तर बदलले असते).
 */
const ROW_COLORS = [A.primary, colors.green, colors.orange, colors.danger, colors.teal];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return ROW_COLORS[Math.abs(hash) % ROW_COLORS.length];
}

const ROW_ICONS = ['bank', 'learn', 'book', 'shield', 'document-text'] as const;

function iconFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 17 + name.charCodeAt(i)) | 0;
  return ROW_ICONS[Math.abs(hash) % ROW_ICONS.length];
}

export default function SyllabusListScreen() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi(() => api.syllabusList(), []);
  const syllabi = data ?? [];

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Syllabus"
        background={A.primaryDark}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSearch={() => {}}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* ── वरचं कार्ड ── */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>संपूर्ण अभ्यासक्रम</Text>
          <Text style={styles.heroTitleAccent}>एकाच ठिकाणी!</Text>
          <Text style={styles.heroNote}>तयारी करा स्मार्ट,</Text>
          <Text style={styles.heroNote}>यश मिळवा नक्की!</Text>
        </View>

        <Text style={styles.sectionTitle}>परीक्षा निवडा</Text>

        {loading ? <Loading label="अभ्यासक्रम उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && syllabi.length === 0 ? (
          <EmptyState icon="book" message="अजून एकही अभ्यासक्रम टाकलेला नाही." />
        ) : null}

        {syllabi.map((y: ApiSyllabusListItem) => {
          const tint = colorFor(y.title);
          return (
            <Pressable
              key={y.id}
              style={styles.row}
              onPress={() => router.push(`/syllabus/${y.id}`)}>
              <View style={[styles.rowIcon, { backgroundColor: tint }]}>
                <Icon name={iconFor(y.title)} size={24} color={colors.textInverse} />
              </View>

              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {y.title}
                </Text>
                <Text style={styles.rowMeta}>{`${y.subjectCount} विषय`}</Text>
              </View>

              <Icon name="chevron-forward" size={24} color={colors.textSecondary} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },

  hero: {
    backgroundColor: A.primaryLight,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  heroTitle: { ...typography.titleL, ...strong.bold, color: colors.text },
  heroTitleAccent: { ...typography.titleL, ...strong.bold, color: A.primary },
  heroNote: {
    ...componentType.cardDescription,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  sectionTitle: {
    ...typography.headingL,
    ...strong.semibold,
    color: colors.text,
    marginTop: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...componentType.cardTitle, ...strong.semibold, color: colors.text },
  rowMeta: { ...componentType.cardDescription, color: colors.textSecondary },
});
