import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { api, type ApiArticleListItem } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  categoryColors,
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
 * चालू घडामोडी.
 *
 * Sheet मधले भाग, वरून खाली: header → गटांचे tabs → hero → "आजच्या
 * महत्त्वाच्या घडामोडी" (चित्रासह मोठ्या ओळी) → "मागील घडामोडी" (टिंब + नाव
 * + गट अशा बारीक ओळी) → "सर्व घडामोडी पहा".
 *
 * दोन याद्या वेगळ्या दिसतात हे मुद्दाम: आजच्या बातम्या वाचायला उद्युक्त
 * करायच्या आहेत, जुन्या फक्त शोधता याव्यात.
 */

const A = screenAccent.currentAffairs;

const MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर',
];

function marathiDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * गटाचा रंग. Admin ने दिला असेल तर तोच; नाहीतर नावावरून ठरवतो — क्रमाने
 * दिला असता तर एक गट काढल्यावर बाकीच्यांचे रंग बदलले असते.
 */
function categoryColor(a: ApiArticleListItem): string {
  if (a.categoryColor) return a.categoryColor;
  let hash = 0;
  for (let i = 0; i < a.categoryName.length; i++) {
    hash = (hash * 31 + a.categoryName.charCodeAt(i)) | 0;
  }
  return categoryColors[Math.abs(hash) % categoryColors.length];
}

export default function CurrentAffairsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [newestFirst, setNewestFirst] = useState(true);

  const { data, loading, error, reload } = useApi(() => api.currentAffairs(), []);
  const [changed, setChanged] = useState<Map<string, boolean>>(new Map());

  // API आधीच दोन याद्या देतो — तेच sheet चे दोन विभाग.
  const topNews = data?.topNews ?? [];
  const latest = data?.latest ?? [];
  const categories = data?.categories ?? [];

  const isMarked = (a: ApiArticleListItem) => changed.get(a.id) ?? a.bookmarked;

  const toggleBookmark = async (a: ApiArticleListItem) => {
    const next = !isMarked(a);
    // आधी पडद्यावर बदल, मग server — नाहीतर टिचकीनंतर काहीच घडत नाही असं वाटतं.
    setChanged((m) => new Map(m).set(a.id, next));
    try {
      if (next) await api.addArticleBookmark(a.id);
      else await api.removeArticleBookmark(a.id);
    } catch {
      setChanged((m) => new Map(m).set(a.id, !next));
    }
  };

  /** निवडलेल्या गटाने गाळणी — 'all' असेल तर सगळ्या. */
  const byCategory = (list: ApiArticleListItem[]) =>
    activeCategory === 'all' ? list : list.filter((a) => a.categoryId === activeCategory);

  const featured = useMemo(() => byCategory(topNews), [topNews, activeCategory]);
  const past = useMemo(() => {
    const rest = byCategory(latest);
    // API नव्याकडून जुन्याकडे देतो, म्हणून उलटा क्रम फक्त उलटवणं आहे.
    return newestFirst ? rest : [...rest].reverse();
  }, [latest, activeCategory, newestFirst]);

  if (loading) return <Loading label="घडामोडी उघडतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const tabs = [{ id: 'all', name: 'सर्व' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="चालू घडामोडी"
        background={A.primaryDark}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSearch={() => {}}
        showBell
        badgeCount={3}
      />

      {/* ── गटांचे tabs ── */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}>
          {tabs.map((c) => {
            const on = activeCategory === c.id;
            return (
              <Pressable key={c.id} style={styles.tab} onPress={() => setActiveCategory(c.id)}>
                <Text style={[styles.tabText, on && styles.tabTextOn]} numberOfLines={1}>
                  {c.name}
                </Text>
                <View style={[styles.tabBar, on && styles.tabBarOn]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* ── वरचं कार्ड ── */}
        <View style={styles.hero}>
          <Text style={styles.heroLine1}>दररोज अपडेट रहा,</Text>
          <Text style={styles.heroLine2}>परीक्षेत एक पाऊल पुढे रहा!</Text>
          <Text style={styles.heroNote}>
            महत्त्वाच्या चालू घडामोडी, विश्लेषण आणि सराव प्रश्न.
          </Text>
        </View>

        {/* ── आजच्या महत्त्वाच्या ── */}
        <Text style={styles.sectionTitle}>आजच्या महत्त्वाच्या घडामोडी</Text>

        {featured.length === 0 ? (
          <Text style={styles.empty}>आजसाठी अजून घडामोडी टाकलेल्या नाहीत.</Text>
        ) : (
          <View style={styles.card}>
            {featured.map((a, i) => {
              const tint = categoryColor(a);
              const date = marathiDate(a.publishedAt);
              return (
                <Pressable
                  key={a.id}
                  style={[styles.newsRow, i === featured.length - 1 && styles.rowLast]}
                  onPress={() => router.push(`/article/${a.slug}`)}>
                  {a.imageUrl ? (
                    <Image source={{ uri: a.imageUrl }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.thumbEmpty]}>
                      <Icon name="newspaper" size={20} color={colors.textSecondary} />
                    </View>
                  )}

                  <View style={styles.newsText}>
                    <View style={[styles.chip, { backgroundColor: `${tint}1A` }]}>
                      <Text style={[styles.chipText, { color: tint }]} numberOfLines={1}>
                        {a.categoryName}
                      </Text>
                    </View>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {a.title}
                    </Text>
                    {date ? (
                      <View style={styles.meta}>
                        <Icon name="calendar" size={12} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{date}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Pressable hitSlop={8} onPress={() => toggleBookmark(a)}>
                    <Icon
                      name={isMarked(a) ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={isMarked(a) ? A.primary : colors.textSecondary}
                    />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── मागील घडामोडी ── */}
        {past.length > 0 ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>मागील घडामोडी</Text>
              <Pressable style={styles.sortButton} onPress={() => setNewestFirst((v) => !v)}>
                <Icon name="funnel" size={16} color={colors.textSecondary} />
                <Text style={styles.sortText}>
                  {newestFirst ? 'नवीन ते जुने' : 'जुने ते नवीन'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              {past.map((a, i) => {
                const tint = categoryColor(a);
                return (
                  <Pressable
                    key={a.id}
                    style={[styles.pastRow, i === past.length - 1 && styles.rowLast]}
                    onPress={() => router.push(`/article/${a.slug}`)}>
                    <View style={[styles.bullet, { backgroundColor: A.primary }]} />

                    <Text style={styles.pastTitle} numberOfLines={1}>
                      {a.title}
                    </Text>

                    <View style={[styles.chipSmall, { backgroundColor: `${tint}1A` }]}>
                      <Text style={[styles.chipSmallText, { color: tint }]} numberOfLines={1}>
                        {a.categoryName}
                      </Text>
                    </View>

                    <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* ── सगळ्या ── */}
        <Pressable style={styles.allRow} onPress={() => setActiveCategory('all')}>
          <Icon name="list" size={20} color={colors.textSecondary} />
          <Text style={styles.allText}>सर्व घडामोडी पहा</Text>
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },

  // ── tabs (48dp, खाली रेषा) ──
  tabsWrap: { backgroundColor: colors.surface },
  tabs: { paddingHorizontal: spacing.xs },
  tab: { height: 48, paddingHorizontal: spacing.md, justifyContent: 'flex-end' },
  tabText: {
    flex: 1,
    ...componentType.cardDescription,
    ...strong.medium,
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
  tabTextOn: { color: A.primary },
  tabBar: { height: 3, backgroundColor: 'transparent', borderRadius: radius.full },
  tabBarOn: { backgroundColor: A.primary },

  // ── वरचं कार्ड ──
  hero: {
    minHeight: 112,
    backgroundColor: A.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heroLine1: { ...typography.titleL, ...strong.semibold, color: colors.text },
  heroLine2: { ...typography.titleL, ...strong.semibold, color: A.primary },
  heroNote: { ...componentType.cardDescription, color: colors.textSecondary },

  // ── विभागाचं शीर्षक ──
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: { flex: 1, ...typography.headingL, ...strong.semibold, color: colors.text },
  sortButton: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  sortText: { ...componentType.smallLabel, ...strong.medium, color: colors.text },

  // ── याद्या ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  rowLast: { borderBottomWidth: 0 },

  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.xs },
  thumbEmpty: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsText: { flex: 1, gap: spacing.xs, minWidth: 0 },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  chipText: { ...componentType.smallLabel, ...strong.medium },
  newsTitle: { ...componentType.cardTitle, ...strong.medium, color: colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { ...componentType.smallLabel, color: colors.textSecondary },

  pastRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bullet: { width: 8, height: 8, borderRadius: radius.full },
  pastTitle: { flex: 1, ...componentType.cardDescription, color: colors.text },
  chipSmall: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.xs },
  chipSmallText: { ...componentType.smallLabel, ...strong.medium },

  empty: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing['3xl'],
  },

  allRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  allText: { flex: 1, ...componentType.cardTitle, ...strong.medium, color: colors.text },
});
