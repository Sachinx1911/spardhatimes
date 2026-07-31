import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { api, type ApiCatalogSeries } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  layout,
  marathi,
  radius,
  shadow,
  spacing,
  typography,
} from '@/theme/tokens';

/**
 * Free Test — **पैसे न भरता चाखून बघण्याची जागा.**
 *
 * नवीन विद्यार्थ्याला विकत घ्यायच्या आधी बघता आलं पाहिजे की प्रश्न कसे आहेत आणि
 * app कसा चालतो. म्हणून याला स्वतःचा tab.
 *
 * नवीन API लागत नाही: `/catalog` आधीच प्रत्येक series ची किंमत देतो, त्यामुळे
 * `priceInPaise === 0` एवढ्यानेच मोफत वेगळ्या करता येतात. Admin ने किंमत ० ठेवली
 * की ती series आपोआप इथे येते — वेगळी खूण करावी लागत नाही.
 */
export default function FreeTestScreen() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi(() => api.catalog(), []);
  const [claiming, setClaiming] = useState<string | null>(null);

  const free = (data ?? []).filter((s) => s.priceInPaise === 0);

  /**
   * मोफत series घेणे. Server तिथेच access देतो (order बनवत नाही), म्हणून यादी
   * पुन्हा मागवली की तिथे "सुरू करा" दिसू लागतं.
   */
  const claim = async (s: ApiCatalogSeries) => {
    if (claiming) return;
    setClaiming(s.id);
    try {
      await api.createOrder(s.id);
      reload();
    } catch (err) {
      Alert.alert(s.title, (err as Error).message);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.title}>मोफत टेस्ट</Text>
        <Text style={styles.subtitle}>
          पैसे न भरता सोडवा. प्रश्नांचा दर्जा आणि निकालाचं विश्लेषण आधी बघा.
        </Text>
      </View>

      {loading ? <Loading label="मोफत टेस्ट शोधतोय…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error && free.length === 0 ? (
        <EmptyState
          icon="bag-handle-outline"
          message="सध्या एकही मोफत टेस्ट सिरीज नाही. लवकरच येईल."
        />
      ) : null}

      {free.map((s) => (
        <View key={s.id} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.cardIcon}>
              <Icon name="school" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {s.title}
              </Text>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {`${s.examName ?? s.categoryName} · ${s.plannedTotalTests} टेस्ट`}
              </Text>
            </View>
            <View style={styles.freeTag}>
              <Text style={styles.freeTagText}>मोफत</Text>
            </View>
          </View>

          {s.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>
              {s.description}
            </Text>
          ) : null}

          <Pressable
            style={[styles.action, s.owned && styles.actionOwned]}
            disabled={claiming === s.id}
            onPress={() => (s.owned ? router.push('/tests') : claim(s))}>
            <Text style={[styles.actionText, s.owned && styles.actionTextOwned]}>
              {claiming === s.id ? 'थांबा…' : s.owned ? 'सुरू करा' : 'मोफत मिळवा'}
            </Text>
            <Icon
              name="chevron-forward"
              size={18}
              color={s.owned ? colors.primary : colors.textInverse}
            />
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { marginTop: spacing.lg, marginBottom: spacing.xl },
  title: {
    ...typography.headingXL,
    ...marathi.bold,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyM,
    ...marathi.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: layout.cardPadding,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  cardMeta: {
    ...componentType.smallLabel,
    ...marathi.regular,
    color: colors.textSecondary,
  },
  freeTag: {
    backgroundColor: colors.successLight,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  freeTagText: {
    ...componentType.badge,
    ...marathi.semibold,
    color: colors.success,
  },
  cardDesc: {
    ...componentType.cardDescription,
    ...marathi.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: layout.buttonHeight,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
    ...shadow.button,
  },
  // घेतलेल्या series ला भरीव बटण नको — ते "आता विकत घ्या" सारखं दिसतं.
  actionOwned: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    ...componentType.buttonText,
    ...marathi.semibold,
    color: colors.textInverse,
  },
  actionTextOwned: { color: colors.primary },
});
