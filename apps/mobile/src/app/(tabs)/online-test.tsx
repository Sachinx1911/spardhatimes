import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { api, type ApiOnlineTest } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  gradients,
  layout,
  radius,
  screenAccent,
  shadow,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * ONLINE TEST — सुटे tests, मोफत आणि पैसे घेणारे.
 *
 * हा पडदा **series दाखवत नाही, tests दाखवतो.** दुकान (`/store`) series विकतं;
 * इथे विद्यार्थी थेट सोडवायला बसतो.
 *
 * रंग या पडद्याचा स्वतःचा (जांभळा), पण **खालची पट्टी नाही** — ती प्रत्येक
 * पडद्यावर दिसते, म्हणून तिचा रंग बदलत नाही.
 *
 * मापं sheet मधून: header 56, banner 128/r16, आकडे 80/r12, ओळ 72/r12,
 * चिन्ह 40, switcher 40 गोल, promo 64.
 */

const A = screenAccent.onlineTest;

type Tab = 'free' | 'paid';

export default function OnlineTestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('free');

  const { data, loading, error, reload } = useApi(() => api.onlineTests(), []);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const list = data ? (tab === 'free' ? data.free : data.paid) : [];

  return (
    <View style={styles.root}>
      {/* ── वरची पट्टी ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={8} onPress={goBack}>
            <Icon name="arrow-back" size={24} color={colors.textInverse} />
          </Pressable>

          <Text style={styles.headerTitle}>ONLINE TEST</Text>

          <Pressable hitSlop={8} style={styles.bell} onPress={() => router.push('/notifications')}>
            <Icon name="notifications" size={24} color={colors.textInverse} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing['3xl'] }]}
        showsVerticalScrollIndicator={false}>
        {/* ── वरचं कार्ड ── */}
        <LinearGradient
          colors={gradients.notesBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>नियमित सराव करा,</Text>
            <Text style={styles.bannerTitle}>
              <Text style={{ color: A.primary }}>यश</Text> निश्चित करा!
            </Text>
            <Text style={styles.bannerSub}>दररोज टेस्ट द्या आणि तुमची तयारी तपासा.</Text>
          </View>
          <View style={styles.bannerArt}>
            <Icon name="clipboard" size={48} color={A.primary} />
          </View>
        </LinearGradient>

        {loading ? <Loading label="टेस्ट उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}

        {data ? (
          <>
            {/* ── चार आकडे ── */}
            <View style={styles.stats}>
              <Stat
                icon="document-text"
                tint={A.primary}
                value={String(data.stats.availableTests)}
                label="उपलब्ध टेस्ट"
              />
              <Stat
                icon="checkmark-circle"
                tint={colors.success}
                value={String(data.stats.attemptedTests)}
                label="दिलेल्या टेस्ट"
              />
              <Stat
                icon="trophy"
                tint={colors.warning}
                value={`${data.stats.averageScore}%`}
                label="सरासरी गुण"
              />
              <Stat
                icon="stats-chart"
                tint={colors.info}
                // एकही test दिला नसेल तर क्रमांकच नाही — शून्य दाखवणं दिशाभूल.
                value={data.stats.overallRank === null ? '—' : String(data.stats.overallRank)}
                label="एकूण रँक"
              />
            </View>

            {/* ── मोफत / पैसे ── */}
            <View style={styles.switcher}>
              {(['free', 'paid'] as Tab[]).map((t) => {
                const on = tab === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    style={[styles.switch, on ? styles.switchOn : styles.switchOff]}>
                    <Text style={on ? styles.switchTextOn : styles.switchTextOff}>
                      {t === 'free' ? 'Free Test' : 'Paid Test'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ── यादीचं शीर्षक ── */}
            <View style={styles.listHead}>
              <Text style={styles.listTitle}>
                {tab === 'free' ? 'Free Test' : 'Paid Test'}{' '}
                <Text style={styles.listCount}>({list.length})</Text>
              </Text>
              <View style={styles.listTools}>
                <Pressable style={styles.tool}>
                  <Icon name="filter" size={16} color={colors.text} />
                  <Text style={styles.toolText}>फिल्टर</Text>
                </Pressable>
                <Pressable style={styles.tool}>
                  <Icon name="sort" size={16} color={colors.text} />
                  <Text style={styles.toolText}>नवीन ते जुने</Text>
                </Pressable>
              </View>
            </View>

            {/* ── tests ── */}
            {list.length > 0 ? (
              list.map((t) => <TestRow key={t.id} test={t} router={router} />)
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {tab === 'free'
                    ? 'अजून एकही मोफत टेस्ट नाही.'
                    : 'अजून एकही पैसे घेणारा टेस्ट नाही.'}
                </Text>
              </View>
            )}

            {/* ── खालचं promo ── */}
            <Pressable style={styles.promo} onPress={() => router.push('/store')}>
              <View style={styles.promoIcon}>
                <Icon name="star" size={20} color={colors.warning} />
              </View>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>प्रीमियम टेस्ट सीरीजसह तयारीला नवी दिशा</Text>
                <Text style={styles.promoSub}>प्रगत टेस्ट आणि सर्व परीक्षा पॅक मिळवा.</Text>
              </View>
              <View style={styles.promoButton}>
                <Text style={styles.promoButtonText}>पहा</Text>
                <Icon name="arrow-forward" size={14} color={colors.textInverse} />
              </View>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({
  icon,
  tint,
  value,
  label,
}: {
  icon: string;
  tint: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={24} color={tint} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function TestRow({
  test,
  router,
}: {
  test: ApiOnlineTest;
  router: ReturnType<typeof useRouter>;
}) {
  // पैसे घेणारा आणि घेतलेला नसेल तर सोडवता येत नाही — तिथे दुकानाकडे न्यायचं.
  const canStart = test.owned;

  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push(canStart ? `/quiz/${test.id}/attempt` : '/store')}>
      <View style={[styles.rowIcon, { backgroundColor: A.primaryLight }]}>
        <Icon name="clipboard" size={20} color={A.primary} />
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {test.title}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {`${test.questionCount} प्रश्न · ${test.marks} गुण · ${test.durationMinutes} मिनिटे`}
        </Text>
        {/* कोणीच सोडवला नसेल तर "दिलेलं: 0" लिहिण्यात अर्थ नाही. */}
        {test.attemptCount > 0 ? (
          <Text style={styles.rowMeta}>
            दिलेलं: {test.attemptCount.toLocaleString('en-IN')} विद्यार्थी
          </Text>
        ) : null}
      </View>

      <View style={styles.rowButton}>
        <Text style={styles.rowButtonText}>{canStart ? 'Start Test' : 'Buy'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // ── header ──
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
  bell: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs - 2,
    minWidth: layout.badgeSmall,
    height: layout.badgeSmall,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    ...componentType.badgeSmall,
    color: colors.textInverse,
  },

  body: { paddingHorizontal: layout.cardPadding, paddingTop: spacing.lg },

  // ── banner (128dp, r16) ──
  banner: {
    height: layout.testBannerHeight,
    borderRadius: radius.lg,
    padding: layout.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.card,
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    ...typography.titleL,
    ...strong.semibold,
    color: colors.text,
  },
  bannerSub: {
    ...typography.bodyS,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bannerArt: { width: layout.iconBoxLarge + spacing.lg, alignItems: 'center' },

  // ── चार आकडे (80dp, r12) ──
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  stat: {
    flex: 1,
    height: layout.statCardHeight,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  statValue: {
    ...componentType.statNumber,
    color: colors.text,
  },
  statLabel: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },

  // ── switcher (40dp, गोल) ──
  switcher: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  switch: {
    flex: 1,
    height: layout.switcherHeight,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  switchOn: { backgroundColor: A.primary, borderColor: A.primary },
  switchOff: { backgroundColor: colors.surface, borderColor: A.primary },
  switchTextOn: {
    ...componentType.buttonSmall,
    color: colors.textInverse,
  },
  switchTextOff: {
    ...componentType.buttonSmall,
    color: A.primary,
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
  listTools: { flexDirection: 'row', gap: spacing.sm },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: layout.chipHeight + spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toolText: {
    ...componentType.smallLabel,
    color: colors.text,
  },

  // ── test ची ओळ (72dp, r12) ──
  row: {
    minHeight: layout.testRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  rowIcon: {
    width: layout.iconBoxSmall,
    height: layout.iconBoxSmall,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: {
    ...componentType.rowTitle,
    color: colors.text,
  },
  rowMeta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  rowButton: {
    height: layout.buttonHeightSmall,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: A.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: colors.divider,
  },
  emptyText: {
    ...typography.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── promo (64dp) ──
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.testPromoHeight,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.warningLight,
  },
  promoIcon: {
    width: layout.iconBoxSmall,
    height: layout.iconBoxSmall,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1 },
  promoTitle: {
    ...componentType.rowTitle,
    color: colors.text,
  },
  promoSub: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: layout.buttonHeightSmall,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.danger,
  },
  promoButtonText: {
    ...componentType.buttonSmall,
    color: colors.textInverse,
  },
});
