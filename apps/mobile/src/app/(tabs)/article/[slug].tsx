import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  layout,
  radius,
  screenAccent,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * एक लेख.
 *
 * `slug` ने उघडतो, id ने नाही — तोच पत्ता पुढे website वर आणि share केलेल्या
 * दुव्यात वापरता येईल.
 *
 * Sheet प्रमाणे: गटाचा chip → शीर्षक → सारांश → तारीख/वाचनवेळ/वाचक →
 * चित्र → मजकूर → स्रोत → आवडलं/नाही + शेअर → मागील/पुढील लेख.
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

/** 12400 → "12.4K". हजारांच्या पुढेच लहान करतो. */
function shortCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
}

/**
 * मजकुराचे तुकडे.
 *
 * `body` हा साधा मजकूर आहे. Sheet मध्ये उपशीर्षकं आणि टिंबांची यादी दिसते,
 * म्हणून दोन सोपे संकेत पाळतो: `## ` ने सुरू होणारी ओळ = उपशीर्षक,
 * `- ` ने सुरू होणारी = यादीतला मुद्दा. बाकी सगळा परिच्छेद.
 *
 * पूर्ण Markdown लावला नाही — त्यासाठी वेगळी library लागते आणि admin ला
 * एवढ्या दोनच खुणा शिकवणं सोपं आहे.
 */
type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'para'; text: string };

function parseBody(body: string): Block[] {
  return body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line): Block => {
      if (line.startsWith('## ')) return { kind: 'heading', text: line.slice(3).trim() };
      if (line.startsWith('- ')) return { kind: 'bullet', text: line.slice(2).trim() };
      return { kind: 'para', text: line };
    });
}

export default function ArticleScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: a, loading, error, reload } = useApi(() => api.article(slug), [slug]);

  const [markChanged, setMarkChanged] = useState<boolean | null>(null);
  const [reaction, setReaction] = useState<{
    likes: number;
    dislikes: number;
    mine: 'LIKE' | 'DISLIKE' | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const bookmarked = markChanged ?? a?.bookmarked ?? false;
  const likes = reaction?.likes ?? a?.likes ?? 0;
  const dislikes = reaction?.dislikes ?? a?.dislikes ?? 0;
  const mine = reaction ? reaction.mine : (a?.myReaction ?? null);

  const toggleMark = async () => {
    if (!a || busy) return;
    setBusy(true);
    try {
      if (bookmarked) await api.removeArticleBookmark(a.id);
      else await api.addArticleBookmark(a.id);
      setMarkChanged(!bookmarked);
    } catch (err) {
      Alert.alert('खूण बदलता आली नाही', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const react = async (type: 'LIKE' | 'DISLIKE') => {
    if (!a) return;
    try {
      const res = await api.reactToArticle(a.id, type);
      setReaction({ likes: res.likes, dislikes: res.dislikes, mine: res.myReaction });
    } catch (err) {
      Alert.alert('नोंदवता आलं नाही', (err as Error).message);
    }
  };

  const share = () => {
    if (!a) return;
    Share.share({ message: `${a.title}\n\nस्पर्धा टाईम्स` }).catch(() => {});
  };

  if (loading) return <Loading label="लेख आणतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!a) return <ErrorState message="हा लेख सापडला नाही." />;

  const date = marathiDate(a.publishedAt);
  const blocks = parseBody(a.body);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="चालू घडामोडी"
        background={A.primaryDark}
        onBack={() => router.replace('/current-affairs')}
        onBookmark={toggleMark}
        bookmarked={bookmarked}
        onShare={share}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{a.categoryName}</Text>
        </View>

        <Text style={styles.title}>{a.title}</Text>
        {a.excerpt ? <Text style={styles.excerpt}>{a.excerpt}</Text> : null}

        {/* ── तारीख · वाचनवेळ · वाचक ── */}
        <View style={styles.metaRow}>
          {date ? (
            <>
              <View style={styles.meta}>
                <Icon name="calendar" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{date}</Text>
              </View>
              <View style={styles.metaDivider} />
            </>
          ) : null}
          <View style={styles.meta}>
            <Icon name="time" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{`${a.readMinutes} मिनिटे वाचन`}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.meta}>
            <Icon name="eye" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{`${shortCount(a.viewCount)} वाचक`}</Text>
          </View>
        </View>

        {a.imageUrl ? (
          <Image source={{ uri: a.imageUrl }} style={styles.hero} contentFit="cover" />
        ) : null}

        {/* ── मजकूर ── */}
        <View style={styles.article}>
          {blocks.map((b, i) =>
            b.kind === 'heading' ? (
              <Text key={i} style={styles.heading}>
                {b.text}
              </Text>
            ) : b.kind === 'bullet' ? (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{b.text}</Text>
              </View>
            ) : (
              <Text key={i} style={styles.para}>
                {b.text}
              </Text>
            )
          )}
        </View>

        {/* ── स्रोत ── */}
        {a.sourceName ? (
          <>
            <View style={styles.rule} />
            <View style={styles.sourceRow}>
              <Icon name="document-text" size={16} color={colors.textSecondary} />
              <Text style={styles.sourceLabel}>स्रोत: </Text>
              {a.sourceUrl ? (
                <Pressable onPress={() => Linking.openURL(a.sourceUrl!)}>
                  <Text style={styles.sourceLink}>{a.sourceName}</Text>
                </Pressable>
              ) : (
                <Text style={styles.sourceLink}>{a.sourceName}</Text>
              )}
            </View>
          </>
        ) : null}

        {/* ── पसंती आणि शेअर ── */}
        <View style={styles.actionBar}>
          <Pressable style={styles.reaction} onPress={() => react('LIKE')}>
            <Icon
              name="thumbs-up"
              size={20}
              color={mine === 'LIKE' ? A.primary : colors.textSecondary}
            />
            <Text style={[styles.reactionText, mine === 'LIKE' && styles.reactionOn]}>
              {likes}
            </Text>
          </Pressable>

          <View style={styles.actionDivider} />

          <Pressable style={styles.reaction} onPress={() => react('DISLIKE')}>
            <Icon
              name="thumbs-down"
              size={20}
              color={mine === 'DISLIKE' ? A.primary : colors.textSecondary}
            />
            <Text style={[styles.reactionText, mine === 'DISLIKE' && styles.reactionOn]}>
              {dislikes}
            </Text>
          </Pressable>

          <View style={styles.spacer} />

          <Pressable style={styles.shareButton} onPress={share}>
            <Icon name="share" size={16} color={colors.text} />
            <Text style={styles.shareText}>शेअर करा</Text>
          </Pressable>

          <Pressable style={styles.markButton} hitSlop={6} onPress={toggleMark}>
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={bookmarked ? A.primary : colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* ── मागील / पुढील ── */}
        <View style={styles.navRow}>
          {a.prev ? (
            <Pressable style={styles.navSide} onPress={() => router.replace(`/article/${a.prev!.slug}`)}>
              <Icon name="chevron-back" size={16} color={colors.text} />
              <Text style={styles.navText}>मागील लेख</Text>
            </Pressable>
          ) : (
            <View style={styles.navSide} />
          )}

          {a.next ? (
            <Pressable
              style={[styles.navSide, styles.navRight]}
              onPress={() => router.replace(`/article/${a.next!.slug}`)}>
              <Text style={styles.navText}>पुढील लेख</Text>
              <Icon name="chevron-forward" size={16} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.navSide} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  body: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },

  chip: {
    alignSelf: 'flex-start',
    backgroundColor: A.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  chipText: { ...componentType.smallLabel, ...strong.medium, color: A.primary },

  title: { ...typography.headingXL, ...strong.bold, color: colors.text },
  excerpt: { ...typography.bodyL, color: colors.textSecondary },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { ...componentType.smallLabel, color: colors.textSecondary },
  metaDivider: { width: 1, height: 14, backgroundColor: colors.border },

  hero: { width: '100%', aspectRatio: 16 / 10, borderRadius: radius.md },

  // ── मजकूर ──
  article: { gap: spacing.md },
  para: { ...typography.bodyL, color: colors.text },
  heading: {
    ...typography.titleL,
    ...strong.bold,
    color: A.primary,
    marginTop: spacing.sm,
  },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, paddingLeft: spacing.xs },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: A.primary,
    marginTop: spacing.sm,
  },
  bulletText: { flex: 1, ...typography.bodyL, color: colors.text },

  rule: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  sourceLabel: { ...componentType.cardDescription, color: colors.textSecondary },
  sourceLink: { ...componentType.cardDescription, ...strong.medium, color: A.primary },

  // ── पसंती ──
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reaction: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reactionText: { ...componentType.cardTitle, ...strong.medium, color: colors.text },
  reactionOn: { color: A.primary },
  actionDivider: { width: 1, height: 20, backgroundColor: colors.border },
  spacer: { flex: 1 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  shareText: { ...componentType.cardDescription, ...strong.medium, color: colors.text },
  markButton: { padding: spacing.xs },

  // ── मागील / पुढील ──
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navSide: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 24 },
  navRight: { justifyContent: 'flex-end' },
  navText: { ...componentType.cardDescription, ...strong.medium, color: colors.text },
});
