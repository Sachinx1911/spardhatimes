import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ErrorState, Loading } from '@/components/ui/async-state';
import { Screen } from '@/components/ui/screen';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { colors, radius, spacing, strong, typography } from '@/theme/tokens';

/**
 * एक लेख.
 *
 * `slug` ने उघडतो, id ने नाही — तोच पत्ता पुढे website वर आणि share केलेल्या
 * दुव्यात वापरता येईल.
 */
export default function ArticleScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: a, loading, error, reload } = useApi(() => api.article(slug), [slug]);

  const [changed, setChanged] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const bookmarked = changed ?? a?.bookmarked ?? false;

  const toggle = async () => {
    if (!a || busy) return;
    setBusy(true);
    try {
      if (bookmarked) await api.removeArticleBookmark(a.id);
      else await api.addArticleBookmark(a.id);
      setChanged(!bookmarked);
    } catch (err) {
      Alert.alert('खूण बदलता आली नाही', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="लेख आणतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!a) return <ErrorState message="हा लेख सापडला नाही." />;

  const tint = a.categoryColor ?? colors.primary;
  const date = a.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <Screen>
      {/* ── वरची पट्टी ── */}
      <View style={styles.topBar}>
        <Pressable
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/current-affairs'))}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable hitSlop={8} onPress={toggle} disabled={busy} style={busy ? styles.busy : undefined}>
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={colors.primary}
            />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => {
              // रद्द केलं तर काहीच दाखवायचं नाही — ती चूक नाही.
              Share.share({ title: a.title, message: `${a.title}\n\n${a.excerpt}` }).catch(
                () => undefined
              );
            }}>
            <Icon name="share-social-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.tag, { backgroundColor: `${tint}1A` }]}>
        <Text style={[styles.tagText, { color: tint }]}>{a.categoryName}</Text>
      </View>

      <Text style={styles.title}>{a.title}</Text>
      <Text style={styles.meta}>{`${date}  •  ${a.readMinutes} min read`}</Text>

      {a.imageUrl ? (
        <Image source={{ uri: a.imageUrl }} style={styles.image} contentFit="cover" />
      ) : null}

      {/**
       * मजकूर परिच्छेदांत तोडतो.
       *
       * एकाच `Text` मध्ये टाकला असता तर रिकाम्या ओळी गिळल्या जातात आणि सगळा
       * लेख एक गठ्ठा दिसतो — लांब लेख तसा वाचता येत नाही.
       */}
      <View style={styles.body}>
        {a.body
          .split(/\n\s*\n/)
          .map((para) => para.trim())
          .filter(Boolean)
          .map((para, i) => (
            <Text key={i} style={styles.paragraph}>
              {para}
            </Text>
          ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  busy: {
    opacity: 0.4,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.caption,
    ...strong.medium,
  },
  title: {
    ...typography.headingL,
    color: colors.text,
  },
  meta: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.border,
  },
  body: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  paragraph: {
    ...typography.bodyL,
    color: colors.text,
  },
});
