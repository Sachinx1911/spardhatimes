import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  gradients,
  layout,
  radius,
  screenAccent,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * एका अभ्यासक्रमाचे विषय.
 *
 * रंग या पडद्याचा स्वतःचा (जांभळा); खालची पट्टी नेहमीप्रमाणे बदलत नाही.
 *
 * मापं sheet मधून: header 56, वरचं कार्ड 112/r16, विषयाची ओळ 72/r12,
 * "सर्व पहा" 56, promo 72, गोल चिन्ह 40.
 */

const A = screenAccent.exam;

/** विषयाचं चिन्ह आणि रंग — PDF Notes प्रमाणेच, म्हणजे दोन्ही पडद्यांवर एकच दिसतो. */
const SUBJECT_LOOK: Record<string, { icon: string; color: string }> = {
  इतिहास: { icon: 'bank', color: colors.purple },
  History: { icon: 'bank', color: colors.purple },
  भूगोल: { icon: 'globe', color: colors.green },
  Geography: { icon: 'globe', color: colors.green },
  राज्यशास्त्र: { icon: 'bank', color: colors.orange },
  Polity: { icon: 'bank', color: colors.orange },
  अर्थशास्त्र: { icon: 'chart', color: colors.info },
  Economy: { icon: 'chart', color: colors.info },
  'विज्ञान व तंत्रज्ञान': { icon: 'atom', color: colors.danger },
  Science: { icon: 'atom', color: colors.danger },
  'चालू घडामोडी': { icon: 'star', color: colors.teal },
  'Current Affairs': { icon: 'star', color: colors.teal },
};

const lookFor = (name: string) =>
  SUBJECT_LOOK[name] ?? { icon: 'book', color: A.primary };

/** 390 → "6 तास 30 मिनिटे". शून्य म्हणजे ठरवलेलं नाही, तेव्हा काहीच नाही. */
function readableTime(minutes: number): string | null {
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} मिनिटे`;
  if (m === 0) return `${h} तास`;
  return `${h} तास ${m} मिनिटे`;
}

export default function SyllabusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, loading, error, reload } = useApi(() => api.syllabus(id), [id]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.root}>
      {/* ── वरची पट्टी ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={8} onPress={goBack}>
            <Icon name="arrow-back" size={24} color={colors.textInverse} />
          </Pressable>
          <Text style={styles.headerTitle}>Syllabus</Text>
          <Pressable hitSlop={8}>
            <Icon name="search" size={24} color={colors.textInverse} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing['3xl'] }]}
        showsVerticalScrollIndicator={false}>
        {loading ? <Loading label="अभ्यासक्रम उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}

        {data ? (
          <>
            {/* ── वरचं कार्ड ── */}
            <LinearGradient
              colors={gradients.heroPurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}>
              <View style={styles.heroIcon}>
                <Icon name="clipboard" size={24} color={A.primary} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle} numberOfLines={1}>
                  {data.title}
                </Text>
                {data.description ? (
                  <Text style={styles.heroSub} numberOfLines={2}>
                    {data.description}
                  </Text>
                ) : null}
              </View>
            </LinearGradient>

            {/* ── यादीचं शीर्षक ── */}
            <View style={styles.listHead}>
              <Text style={styles.listTitle}>
                Syllabus <Text style={styles.listCount}>({data.totalTopics} टॉपिक्स)</Text>
              </Text>
              <Pressable style={styles.filter}>
                <Icon name="filter" size={16} color={colors.text} />
                <Text style={styles.filterText}>फिल्टर</Text>
                <Icon name="chevron-down" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* ── विषय ── */}
            {data.sections.length > 0 ? (
              <View style={styles.list}>
                {data.sections.map((sec, i) => {
                  const look = lookFor(sec.subjectName);
                  const time = readableTime(sec.estimatedMinutes);
                  return (
                    <Pressable
                      key={sec.id}
                      style={[styles.row, i > 0 && styles.rowDivided]}
                      onPress={() => router.push(`/syllabus/section/${sec.id}`)}>
                      <View style={[styles.rowIcon, { backgroundColor: look.color }]}>
                        <Icon name={look.icon} size={24} color={colors.textInverse} />
                      </View>

                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {sec.subjectName}
                        </Text>
                        <View style={styles.rowMetaBox}>
                          <Text style={styles.rowMeta}>{sec.topicCount} टॉपिक्स</Text>
                          {/* वेळ ठरवली नसेल तर घड्याळही दाखवत नाही. */}
                          {time ? (
                            <>
                              <Icon name="time" size={13} color={colors.textSecondary} />
                              <Text style={styles.rowMeta}>{time}</Text>
                            </>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.rowButton}>
                        <Text style={styles.rowButtonText}>पहा</Text>
                        <Icon name="chevron-forward" size={16} color={A.primary} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>या अभ्यासक्रमात अजून विषय जोडलेले नाहीत.</Text>
              </View>
            )}

            {/* ── सगळं बघा ── */}
            <Pressable style={styles.allRow} onPress={() => router.push(`/exam/${data.examId}`)}>
              <Icon name="list" size={20} color={colors.textSecondary} />
              <Text style={styles.allText}>सर्व Syllabus पहा</Text>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* ── PDF ──
                Admin ने PDF जोडली असेल तरच. नसताना बटण दाखवलं तर ते दाबल्यावर
                काहीच होत नाही. */}
            {data.pdfUrl ? (
              <View style={styles.promo}>
                <View style={styles.promoIcon}>
                  <Icon name="document-text" size={22} color={A.primary} />
                </View>
                <View style={styles.promoText}>
                  <Text style={styles.promoTitle}>अभ्यासक्रम PDF डाउनलोड करा!</Text>
                  <Text style={styles.promoSub} numberOfLines={2}>
                    संपूर्ण अभ्यासक्रम एकाच PDF मध्ये डाउनलोड करा.
                  </Text>
                </View>
                <Pressable
                  style={styles.promoButton}
                  onPress={() => Linking.openURL(data.pdfUrl!)}>
                  <Icon name="download" size={18} color={colors.textInverse} />
                  <Text style={styles.promoButtonText}>PDF</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

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

  body: { paddingHorizontal: layout.cardPadding, paddingTop: spacing.lg },

  // ── वरचं कार्ड (112dp, r16) ──
  hero: {
    height: layout.heroBannerHeight,
    borderRadius: radius.lg,
    padding: layout.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: layout.iconCircle,
    height: layout.iconCircle,
    borderRadius: radius.full,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  heroTitle: {
    ...typography.titleL,
    ...strong.semibold,
    color: colors.text,
  },
  heroSub: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // ── यादीचं शीर्षक ──
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  listTitle: {
    ...typography.headingL,
    color: colors.text,
  },
  listCount: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: layout.categoryChipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterText: {
    ...componentType.smallLabel,
    color: colors.text,
  },

  // ── विषयाची ओळ (72dp) ──
  list: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    height: layout.syllabusSubjectRow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
  },
  rowDivided: { borderTopWidth: 1, borderTopColor: colors.border },
  rowIcon: {
    width: layout.iconCircle,
    height: layout.iconCircle,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: {
    ...componentType.rowTitle,
    color: colors.text,
  },
  rowMetaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  rowMeta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: layout.buttonHeightSmall,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: A.primary,
  },
  rowButtonText: {
    ...componentType.buttonSmall,
    color: A.primary,
  },

  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── सर्व पहा (56dp) ──
  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: layout.viewAllRowHeight,
    paddingHorizontal: layout.cardPadding,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  allText: {
    flex: 1,
    ...componentType.rowTitle,
    color: colors.text,
  },

  // ── PDF (72dp) ──
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.promoHeight,
    padding: layout.cardPadding,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: A.primaryLight,
  },
  promoIcon: {
    width: layout.iconCircle,
    height: layout.iconCircle,
    borderRadius: radius.full,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1 },
  promoTitle: {
    ...componentType.rowTitle,
    ...strong.semibold,
    color: A.primaryDark,
  },
  promoSub: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: layout.buttonHeightCompact,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: A.primary,
  },
  promoButtonText: {
    ...componentType.buttonSmall,
    color: colors.textInverse,
  },
});
