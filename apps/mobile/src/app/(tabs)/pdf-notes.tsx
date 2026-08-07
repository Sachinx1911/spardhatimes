import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  poppins,
  radius,
  screenAccent,
  shadow,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * PDF Notes — विषयानुसार टिपणांची यादी.
 *
 * ## रंग या पडद्याचा स्वतःचा
 *
 * `screenAccent.pdfNotes` — जांभळा. Home लाल आहे. प्रत्येक design sheet आपापला
 * primary देते आणि तोच वापरायचा असं ठरलं आहे.
 *
 * **पण खालची पट्टी नाही** — ती `colors.primary` वरच राहते. ती प्रत्येक पडद्यावर
 * दिसते; तिचा रंग पडदा बदलला की बदलला तर लुकलुकल्यासारखं दिसेल.
 *
 * मापं sheet मधून जशीच्या तशी: header 56, banner 140/r18, ओळ 76/r12,
 * चिन्हाची चौकट 48, promo 72/r16, बटण 44/r12.
 */

const A = screenAccent.pdfNotes;

/**
 * विषयाचं चिन्ह आणि रंग.
 *
 * Schema मध्ये विषयाला चिन्ह नाही, आणि admin ला प्रत्येक विषयासाठी ते निवडायला
 * लावणं म्हणजे विनाकारण काम. म्हणून नावावरून जुळवतो; न जुळल्यास सामान्य चिन्ह.
 */
const SUBJECT_LOOK: Record<string, { icon: string; color: string }> = {
  इतिहास: { icon: 'book', color: colors.purple },
  History: { icon: 'book', color: colors.purple },
  भूगोल: { icon: 'globe', color: colors.green },
  Geography: { icon: 'globe', color: colors.green },
  राज्यशास्त्र: { icon: 'building', color: colors.orange },
  Polity: { icon: 'building', color: colors.orange },
  अर्थशास्त्र: { icon: 'chart', color: colors.blue },
  Economy: { icon: 'chart', color: colors.blue },
  'विज्ञान व तंत्रज्ञान': { icon: 'atom', color: colors.danger },
  Science: { icon: 'atom', color: colors.danger },
  'चालू घडामोडी': { icon: 'star', color: colors.teal },
  'Current Affairs': { icon: 'star', color: colors.teal },
};

const lookFor = (name: string) =>
  SUBJECT_LOOK[name] ?? { icon: 'document-text', color: A.primary };

export default function PdfNotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useApi(() => api.notes(), []);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.root}>
      {/* ── वरची पट्टी ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={8} onPress={goBack}>
            <Icon name="arrow-back" size={24} color={colors.textInverse} />
          </Pressable>

          <Text style={styles.headerTitle}>PDF Notes</Text>

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
            <Text style={styles.bannerTitle}>अभ्यास करा स्मार्ट,</Text>
            <Text style={[styles.bannerTitle, { color: A.primary }]}>यश मिळवा नक्की!</Text>
            <Text style={styles.bannerSub}>सर्व विषयांची PDF नोट्स एकाच ठिकाणी.</Text>
          </View>
          <View style={styles.bannerArt}>
            <Icon name="document-text" size={56} color={A.primary} />
          </View>
        </LinearGradient>

        {loading ? <Loading label="नोट्स उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}

        {data ? (
          <>
            {/* ── यादीचं शीर्षक ── */}
            <View style={styles.listHead}>
              <Text style={styles.listTitle}>
                PDF Notes <Text style={styles.listCount}>({data.totalNotes} नोट्स)</Text>
              </Text>
              <Pressable style={styles.filter}>
                <Icon name="filter" size={16} color={colors.text} />
                <Text style={styles.filterText}>फिल्टर</Text>
                <Icon name="chevron-down" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* ── विषयांची यादी ── */}
            {data.subjects.length > 0 ? (
              <View style={styles.list}>
                {data.subjects.map((s) => {
                  const look = lookFor(s.name);
                  return (
                    <Pressable
                      key={s.id}
                      style={styles.row}
                      onPress={() => router.push(`/notes/${s.id}`)}>
                      <View style={[styles.rowIcon, { backgroundColor: look.color }]}>
                        <Icon name={look.icon} size={24} color={colors.textInverse} />
                      </View>

                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {s.name}
                        </Text>
                        <Text style={styles.rowCount}>{s.noteCount} नोट्स</Text>
                      </View>

                      <View style={styles.action}>
                        <Icon name="download" size={20} color={A.primary} />
                        <Text style={styles.actionText}>डाउनलोड</Text>
                      </View>
                      <View style={styles.action}>
                        <Icon name="eye" size={20} color={A.primary} />
                        <Text style={styles.actionText}>पहा</Text>
                      </View>

                      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  अजून एकही PDF नोट टाकलेली नाही. Admin मधून साहित्य जोडलं की इथे दिसेल.
                </Text>
              </View>
            )}

            {/* ── सगळं बघा ── */}
            <Pressable style={styles.allRow} onPress={() => router.push('/learn?type=NOTE')}>
              <Icon name="list" size={20} color={colors.text} />
              <Text style={styles.allText}>सर्व PDF नोट्स पहा</Text>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* ── खालचं promo ── */}
            <View style={styles.promo}>
              <View style={styles.promoIcon}>
                <Icon name="document-text" size={24} color={A.primary} />
              </View>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>अभ्यासक्रम PDF डाउनलोड करा!</Text>
                <Text style={styles.promoSub}>संपूर्ण अभ्यासक्रम एकाच PDF मध्ये डाउनलोड करा.</Text>
              </View>
              <Pressable style={styles.promoButton}>
                <Icon name="download" size={18} color={colors.textInverse} />
                <Text style={styles.promoButtonText} numberOfLines={1}>
                  डाउनलोड
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // ── header (56dp, primary dark) ──
  header: { backgroundColor: A.primaryDark },
  headerRow: {
    height: layout.screenHeaderHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
  },
  headerTitle: {
    flex: 1,
    ...componentType.screenHeaderTitle,
    color: colors.textInverse,
  },
  bell: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: layout.badgeSmall,
    height: layout.badgeSmall,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...componentType.badgeSmall,
    color: colors.textInverse,
  },

  body: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg },

  // ── banner (140dp, r18) ──
  banner: {
    height: layout.topBannerHeight,
    borderRadius: radius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.card,
  },
  bannerText: { flex: 1, gap: 2 },
  bannerTitle: {
    ...componentType.bannerHeading,
    color: colors.text,
  },
  bannerSub: {
    ...typography.bodyL,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bannerArt: { width: layout.bannerArtWidth, alignItems: 'center' },

  // ── यादीचं शीर्षक ──
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing['2xl'],
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
    ...typography.bodyS,
    ...strong.medium,
    color: colors.text,
  },

  // ── विषयाची ओळ (76dp, r12) ──
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  row: {
    height: layout.subjectRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowIcon: {
    width: layout.iconBoxLarge,
    height: layout.iconBoxLarge,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  rowCount: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  action: { alignItems: 'center', gap: 2 },
  actionText: {
    ...componentType.actionLabel,
    color: A.primary,
  },

  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    ...shadow.card,
  },
  emptyText: {
    ...typography.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── सगळं बघा ──
  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: layout.screenHeaderHeight,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadow.card,
  },
  allText: {
    flex: 1,
    ...typography.bodyL,
    ...strong.medium,
    color: colors.text,
  },

  // ── promo (72dp, r16) ──
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.promoHeight,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: A.primaryLight,
  },
  promoIcon: {
    width: layout.promoIconBox,
    height: layout.promoIconBox,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1 },
  promoTitle: {
    ...typography.bodyL,
    ...strong.semibold,
    color: colors.text,
  },
  promoSub: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  promoButton: {
    // रुंदी निश्चित (sheet: 96dp). नाहीतर बटण मजकुराची जागा खाऊन "अभ्यासक्रम
    // PDF डाउनलोड करा!" चार ओळींत चेपतं.
    width: layout.promoButtonWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: layout.buttonHeightCompact,
    borderRadius: radius.md,
    backgroundColor: A.primary,
  },
  promoButtonText: {
    ...componentType.actionLabel,
    fontFamily: poppins.semibold,
    color: colors.textInverse,
  },
});
