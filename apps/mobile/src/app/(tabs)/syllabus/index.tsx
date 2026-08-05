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
 * ओळींचे रंग आणि चिन्हं — **यादीतल्या क्रमाने**, sheet प्रमाणे.
 *
 * आधी नावावरून काढत होतो, म्हणजे एकच अभ्यासक्रम नेहमी त्याच रंगाचा राहिला
 * असता. पण त्यामुळे शेजारच्या ओळी सहज एकाच रंगाच्या यायच्या — sheet मध्ये
 * पाच ओळी पाच वेगळ्या रंगांच्या आहेत, आणि तेच दिसायला हवं.
 *
 * क्रमाने दिल्याने एक अभ्यासक्रम काढला तर खालच्यांचे रंग सरकतात. इथे ते
 * चालतं: यादी लहान आहे, admin स्वतः ठरवतो, आणि रंग हा फक्त ओळखीचा आधार आहे —
 * त्यावर काही अवलंबून नाही.
 */
const ROW_LOOK = [
  { color: A.primary, icon: 'bank' },
  { color: colors.green, icon: 'learn' },
  { color: colors.orange, icon: 'book' },
  { color: colors.danger, icon: 'shield' },
  { color: colors.teal, icon: 'shield' },
] as const;

const lookAt = (i: number) => ROW_LOOK[i % ROW_LOOK.length];

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
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>संपूर्ण अभ्यासक्रम</Text>
            <Text style={styles.heroTitleAccent}>एकाच ठिकाणी!</Text>
            <Text style={styles.heroNote}>तयारी करा स्मार्ट,</Text>
            <Text style={styles.heroNote}>यश मिळवा नक्की!</Text>
          </View>

          {/* Sheet मध्ये इथे पुस्तकं, टोपी आणि रोपाचं चित्र आहे. ती प्रतिमा
              अजून मिळालेली नाही, म्हणून तेवढी जागा धरून त्याच अर्थाचं चिन्ह
              ठेवलं आहे — PNG आल्यावर फक्त हा भाग बदलेल, मापं तीच राहतील. */}
          <View style={styles.heroArt}>
            <Icon name="learn" size={56} color={A.primary} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>परीक्षा निवडा</Text>

        {loading ? <Loading label="अभ्यासक्रम उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && syllabi.length === 0 ? (
          <EmptyState icon="book" message="अजून एकही अभ्यासक्रम टाकलेला नाही." />
        ) : null}

        {syllabi.map((y: ApiSyllabusListItem, i: number) => {
          const look = lookAt(i);
          return (
            <Pressable
              key={y.id}
              style={styles.row}
              onPress={() => router.push(`/syllabus/${y.id}`)}>
              <View style={[styles.rowIcon, { backgroundColor: look.color }]}>
                <Icon name={look.icon} size={24} color={colors.textInverse} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: A.primaryLight,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  heroText: { flex: 1 },
  heroArt: { width: 88, alignItems: 'center', justifyContent: 'center' },
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
