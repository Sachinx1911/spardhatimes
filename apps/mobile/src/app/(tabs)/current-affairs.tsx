import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import { EmptyState, ErrorState, Loading } from '@/components/ui/async-state';
import { FilterChips, type FilterChip } from '@/components/ui/filter-chips';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { api, type ApiArticleListItem } from '@/lib/api';
import { useApi } from '@/lib/use-api';
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

/**
 * **चालू घडामोडी** — design sheet प्रमाणे.
 *
 * हा tab नाही; Home वरच्या "चालू घडामोडी" tile मागे उघडतो. Tab bar गोठवलेला आहे
 * (पाच tabs, तोच क्रम), आणि sheet च्या तळाशी दिसणारा tab bar त्यामुळे दुर्लक्षित
 * केला आहे — design standard §६ मध्ये तसंच ठरलं आहे.
 *
 * Sheet मधले भाग, वरून खाली: chips → Top News carousel → Latest News →
 * Daily Quiz पट्टी → Important Categories.
 */

/** तारीख "18 July 2024" अशी — sheet मध्ये तोच आकार आहे. */
function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'long' })} ${d.getFullYear()}`;
}

export default function CurrentAffairsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [toggling, setToggling] = useState<string | null>(null);
  const [changed, setChanged] = useState<Map<string, boolean>>(new Map());

  const { data, loading, error, reload } = useApi(() => api.currentAffairs(), []);

  /**
   * गाळणी लागल्यावरच वेगळी विनंती.
   *
   * "सर्व" असताना पडद्याच्या पहिल्या फेरीतली `latest` यादी तशीच वापरतो — तीच
   * यादी पुन्हा मागवण्यात अर्थ नाही.
   */
  const { data: filtered, loading: filtering } = useApi(
    () =>
      activeCategory === 'all'
        ? Promise.resolve<ApiArticleListItem[] | null>(null)
        : api.articles(activeCategory),
    [activeCategory]
  );

  const categories = data?.categories ?? [];
  const topNews = data?.topNews ?? [];
  const latest = activeCategory === 'all' ? (data?.latest ?? []) : (filtered ?? []);

  /**
   * Chips इंग्रजीत — sheet मध्ये तसेच आहेत. `nameEn` नसेल तर मराठी नाव, म्हणजे
   * admin ने इंग्रजी नाव न दिलं तरी chip रिकामा दिसत नाही.
   */
  const chips: FilterChip[] = [
    { key: 'all', label: 'All' },
    ...categories.map((c) => ({ key: c.slug, label: c.nameEn ?? c.name })),
  ];

  const isMarked = (a: ApiArticleListItem) => changed.get(a.id) ?? a.bookmarked;

  const toggleBookmark = async (a: ApiArticleListItem) => {
    if (toggling) return;
    setToggling(a.id);
    const was = isMarked(a);
    try {
      if (was) await api.removeArticleBookmark(a.id);
      else await api.addArticleBookmark(a.id);
      setChanged((prev) => new Map(prev).set(a.id, !was));
    } catch (err) {
      Alert.alert('खूण बदलता आली नाही', (err as Error).message);
    } finally {
      setToggling(null);
    }
  };

  /**
   * लेख पाठवणे.
   *
   * App अजून प्रकाशित नाही, म्हणून खोल दुवा (deep link) देत नाही — शीर्षक आणि
   * सारांश पाठवतो. दुवा तयार झाल्यावर इथे तो जोडायचा.
   */
  const shareArticle = async (a: ApiArticleListItem) => {
    try {
      await Share.share({ title: a.title, message: `${a.title}\n\n${a.excerpt}` });
    } catch {
      // वापरकर्त्याने रद्द केलं — ही चूक नाही, काहीच दाखवायचं नाही.
    }
  };

  if (loading) return <Loading label="चालू घडामोडी आणतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <Screen>
      {/* ── वरची पट्टी ── */}
      <View style={styles.topBar}>
        <Pressable
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Icon name="menu" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.screenTitle}>Current Affairs</Text>
        <View style={styles.topIcons}>
          <Pressable hitSlop={8}>
            <Icon name="search-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={8}>
            <Icon name="funnel-outline" size={20} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={8}>
            <Icon name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* ── गटांचे chips ── */}
      <FilterChips chips={chips} active={activeCategory} onChange={setActiveCategory} />

      {/* ── Top News ── */}
      {topNews.length ? <TopNewsCarousel items={topNews} /> : null}

      {/* ── Latest News ── */}
      <View style={styles.gap} />
      <SectionHeader
        title="Latest News"
        onViewAll={latest.length > 4 ? () => setActiveCategory('all') : undefined}
      />

      {filtering ? (
        <Loading label="आणतोय…" />
      ) : latest.length === 0 ? (
        <EmptyState icon="newspaper-outline" message="या गटात अजून एकही लेख नाही." />
      ) : (
        <View style={styles.list}>
          {latest.map((a) => (
            <NewsRow
              key={a.id}
              article={a}
              bookmarked={isMarked(a)}
              busy={toggling === a.id}
              onOpen={() => router.push({ pathname: '/article/[slug]', params: { slug: a.slug } })}
              onBookmark={() => toggleBookmark(a)}
              onShare={() => shareArticle(a)}
            />
          ))}
        </View>
      )}

      {/* ── रोजचा quiz ── */}
      <View style={styles.gap} />
      <View style={styles.quizCard}>
        <View style={styles.quizIcon}>
          <Icon name="clipboard-outline" size={26} color={colors.primary} />
        </View>
        <View style={styles.quizText}>
          <Text style={styles.quizTitle}>Daily Current Affairs Quiz</Text>
          <Text style={styles.quizNote}>दररोज 10 प्रश्न सोडवा आणि आपली तयारी तपासा!</Text>
          <Pressable style={styles.quizButton} onPress={() => router.push('/tests')}>
            <Text style={styles.quizButtonText}>Start Quiz</Text>
            <Icon name="arrow-forward" size={14} color={colors.textInverse} />
          </Pressable>
        </View>
        <View style={styles.quizXp}>
          <Text style={styles.quizTrophy}>🏆</Text>
          <Text style={styles.quizXpText}>+ 10 XP</Text>
        </View>
      </View>

      {/* ── महत्त्वाचे गट ── */}
      <View style={styles.gap} />
      <SectionHeader title="Important Categories" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {categories.map((c) => {
          const tint = c.color ?? colors.primary;
          return (
            <Pressable key={c.id} style={styles.catCard} onPress={() => setActiveCategory(c.slug)}>
              <View style={[styles.catIcon, { backgroundColor: `${tint}1A` }]}>
                <Icon
                  name={(c.icon ?? 'newspaper') as string}
                  size={24}
                  color={tint}
                />
              </View>
              <Text style={[styles.catName, { color: tint }]} numberOfLines={2}>
                {c.name}
              </Text>
              <Text style={styles.catCount}>{`${c.articleCount} Articles`}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

/**
 * वरचं आडवं सरकणारं carousel.
 *
 * `pagingEnabled` मुळे एका वेळी एकच कार्ड थांबतं. खालचे ठिपके scroll च्या
 * जागेवरून काढले आहेत, वेगळा state ठेवलेला नाही.
 */
function TopNewsCarousel({ items }: { items: ApiArticleListItem[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const width = layout.cardWidth;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        {items.map((a) => (
          <Pressable
            key={a.id}
            style={[styles.hero, { width }]}
            onPress={() => router.push({ pathname: '/article/[slug]', params: { slug: a.slug } })}>
            {a.imageUrl ? (
              <Image source={{ uri: a.imageUrl }} style={styles.heroImage} contentFit="cover" />
            ) : null}
            {/* चित्रावर मजकूर वाचता यावा म्हणून गडद थर. चित्र नसेल तरी हाच थर
                पार्श्वभूमी बनतो, म्हणून कार्ड रिकामं दिसत नाही. */}
            <View style={styles.heroShade} />
            <View style={styles.heroContent}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>Top News</Text>
              </View>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {a.title}
              </Text>
              <Text style={styles.heroExcerpt} numberOfLines={2}>
                {a.excerpt}
              </Text>
              <Text style={styles.heroMeta}>
                {`${formatDate(a.publishedAt)}  •  ${a.readMinutes} min read`}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {items.map((a, i) => (
          <View key={a.id} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

/** Latest News मधली एक ओळ — थंबनेल, tag, शीर्षक, मापं, आणि दोन कृती. */
function NewsRow({
  article,
  bookmarked,
  busy,
  onOpen,
  onBookmark,
  onShare,
}: {
  article: ApiArticleListItem;
  bookmarked: boolean;
  busy: boolean;
  onOpen: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  const tint = article.categoryColor ?? colors.primary;

  return (
    <Pressable style={styles.row} onPress={onOpen}>
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.thumb} contentFit="cover" />
      ) : (
        // चित्र नसेल तर गटाच्या रंगातलं चिन्ह — रिकामा करडा चौकोन नको.
        <View style={[styles.thumb, styles.thumbEmpty, { backgroundColor: `${tint}1A` }]}>
          <Icon
            name={(article.categoryIcon ?? 'newspaper') as string}
            size={26}
            color={tint}
          />
        </View>
      )}

      <View style={styles.rowText}>
        <View style={[styles.rowTag, { backgroundColor: `${tint}1A` }]}>
          <Text style={[styles.rowTagText, { color: tint }]}>{article.categoryName}</Text>
        </View>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.rowMeta}>
          {`${formatDate(article.publishedAt)}  •  ${article.readMinutes} min read`}
        </Text>
      </View>

      <View style={styles.rowActions}>
        <Pressable hitSlop={8} onPress={onBookmark} disabled={busy} style={busy ? styles.busy : undefined}>
          <Icon
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={bookmarked ? colors.primary : colors.textSecondary}
          />
        </Pressable>
        <Pressable hitSlop={8} onPress={onShare}>
          <Icon name="share-social-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ── वरची पट्टी ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  screenTitle: {
    flex: 1,
    ...typography.headingL,
    color: colors.text,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    // सूचनांचा आकडा scale मधल्या सर्वात लहान (11) पेक्षा लहान हवा — design
    // standard §१० मध्ये हा अपवाद नोंदवलेला आहे.
    fontSize: 9,
    fontFamily: componentType.badge.fontFamily,
    color: colors.textInverse,
  },

  // ── Top News ──
  hero: {
    height: 260,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: colors.text,
    justifyContent: 'flex-end',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  heroContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroTagText: {
    ...componentType.badge,
    color: colors.textInverse,
  },
  heroTitle: {
    ...typography.headingL,
    color: colors.textInverse,
  },
  heroExcerpt: {
    ...typography.bodyM,
    color: colors.border,
  },
  heroMeta: {
    ...typography.bodyS,
    color: colors.border,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },

  // ── Latest News ──
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
  },
  thumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    // शीर्षक लांब असतं; याशिवाय ते कृतींच्या चिन्हांना ढकलतं.
    flex: 1,
    gap: spacing.xs,
  },
  rowTag: {
    alignSelf: 'flex-start',
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  rowTagText: {
    ...typography.caption,
    ...strong.medium,
  },
  rowTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  rowMeta: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  rowActions: {
    // उभे, sheet प्रमाणे — bookmark वर, share खाली.
    gap: spacing.lg,
    alignItems: 'center',
  },
  busy: {
    opacity: 0.4,
  },

  // ── रोजचा quiz ──
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  quizIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizText: {
    flex: 1,
    gap: spacing.xs,
  },
  quizTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  quizNote: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  quizButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: layout.buttonSecondaryHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  quizButtonText: {
    ...typography.bodyS,
    ...strong.semibold,
    color: colors.textInverse,
  },
  quizXp: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  quizTrophy: {
    fontSize: 30,
  },
  quizXpText: {
    ...typography.bodyS,
    ...strong.semibold,
    color: colors.success,
  },

  // ── महत्त्वाचे गट ──
  catRow: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  catCard: {
    width: 104,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...shadow.card,
  },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    ...typography.bodyS,
    ...strong.semibold,
    textAlign: 'center',
  },
  catCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  gap: {
    height: spacing['3xl'],
  },
});
