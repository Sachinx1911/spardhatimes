import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  marathi,
  radius,
  shadow,
  spacing,
  typography,
  useCardWidths,
} from '@/theme/tokens';

/**
 * मुख्य पान — design image प्रमाणे.
 *
 * रचना: पांढरी पट्टी (☰ · logo · घंटा), क्रीम जाहिरात कार्ड, आठ शॉर्टकट
 * दोन-दोन ओळीत.
 *
 * हे **दिशादर्शक पान आहे, दुकान नाही** — दुकान `/store` वर, विद्यार्थ्याच्या
 * स्वतःच्या series `My Course` मध्ये.
 */

interface Tile {
  title: string;
  icon: string;
  tint: string;
  /** पान नसेल तर `null`. */
  href: string | null;
}

const TILES: Tile[] = [
  {
    title: 'MPSC',
    icon: 'document-text',
    tint: colors.primary,
    href: '/store',
  },
  {
    title: 'ONLINE TEST',
    icon: 'clipboard',
    tint: colors.blue,
    href: '/tests',
  },
  {
    title: 'PDF NOTES',
    icon: 'file-tray',
    tint: colors.green,
    href: '/learn',
  },
  // ── हे तीन अजून बांधलेले नाहीत ──
  // अभ्यासक्रम, सरळसेवा आणि दैनिक quiz यांचं schema मध्ये एकही model नाही.
  // दाबल्यावर रिकामं पान उघडण्यापेक्षा "लवकरच" दाखवणं प्रामाणिक.
  {
    title: 'अभ्यासक्रम',
    icon: 'book',
    tint: colors.orange,
    href: null,
  },
  {
    title: 'चालू घडामोडी',
    icon: 'newspaper',
    tint: colors.purple,
    href: '/current-affairs',
  },
  {
    title: 'सरळसेवा',
    icon: 'people',
    tint: colors.teal,
    href: null,
  },
  {
    title: 'चालू घडामोडी Quiz',
    icon: 'bulb',
    tint: colors.orange,
    href: null,
  },
  {
    title: 'TCS | IBPS',
    icon: 'bank',
    tint: colors.pink,
    href: '/store',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { halfCardWidth } = useCardWidths();
  const { data, loading, error, reload } = useApi(() => api.dashboard(), []);

  return (
    <View style={styles.root}>
      {/* ── वरची पट्टी — पांढरी, मधोमध logo ── */}
      <View style={[styles.appBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable hitSlop={8}>
          <Icon name="menu" size={26} color={colors.text} />
        </Pressable>

        {/* Logo दोन ओळींत: लाल SPARDHA, गडद निळा TIMES — design प्रमाणे. */}
        <View style={styles.brandBox}>
          <Text style={styles.brandTop}>SPARDHA</Text>
          <Text style={styles.brandBottom}>TIMES</Text>
        </View>

        <Pressable hitSlop={8}>
          <Icon name="notifications" size={24} color={colors.text} />
          {/* आकडा अजून API मधून येत नाही — तो आल्यावर इथे जोडायचा. */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing['3xl'] }]}
        showsVerticalScrollIndicator={false}>
        {loading ? <Loading label="उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}

        {!loading && !error ? <Banner banners={data?.banners ?? []} /> : null}

        {/* ── आठ शॉर्टकट, दोन प्रति ओळ ── */}
        <View style={styles.grid}>
          {TILES.map((t) => {
            const off = t.href === null;
            return (
              <Pressable
                key={t.title}
                style={[styles.tile, { width: halfCardWidth }, off && styles.tileOff]}
                disabled={off}
                onPress={() => t.href && router.push(t.href as never)}>
                <View style={[styles.tileIcon, { backgroundColor: t.tint }]}>
                  <Icon name={t.icon} size={22} color={colors.textInverse} />
                </View>

                <View style={styles.tileText}>
                  {/* 154dp रुंद कार्डात "चालू घडामोडी Quiz" एका ओळीत मावत नाही,
                      म्हणून तीन ओळींपर्यंत मुभा — नाव कापण्यापेक्षा कार्ड थोडं
                      उंच बरं. बाकीची नावं दोनच ओळी घेतात. */}
                  <Text style={styles.tileTitle} numberOfLines={3}>
                    {t.title}
                  </Text>
                  {/* न बांधलेल्या tiles खाली एवढंच — फिकटपणा एकटा पुरेसा नाही. */}
                  {off ? <Text style={styles.tileNote}>लवकरच</Text> : null}
                </View>

                <Icon name="chevron-forward" size={14} color={colors.textSecondary} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * जाहिरातीचं कार्ड.
 *
 * Admin ने प्रतिमा टाकली असेल तर तीच पूर्ण दाखवतो — मजकूर प्रतिमेतच, असं ठरलं
 * आहे. एकही नसेल तर design मधला मजकूर app स्वतः दाखवतो, म्हणजे पान रिकामं
 * दिसत नाही.
 */
function Banner({ banners }: { banners: { id: string; imageUrl: string }[] }) {
  const { cardWidth } = useCardWidths();

  if (banners.length > 0) {
    return (
      <View>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {banners.map((b) => (
            <Image
              key={b.id}
              source={{ uri: b.imageUrl }}
              style={[styles.bannerImage, { width: cardWidth }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        <Dots count={banners.length} />
      </View>
    );
  }

  return (
    <View>
      <LinearGradient
        colors={gradients.banner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerCard}>
        <Text style={styles.bannerTitle}>स्वप्न तुमचे,</Text>
        <Text style={styles.bannerTitle}>
          <Text style={styles.bannerTitleAccent}>यश</Text> आमचे!
        </Text>
        <Text style={styles.bannerNote}>
          MPSC, TCS/IBPS, Railway आणि{'\n'}अनेक परीक्षांसाठी सर्वोत्तम तयारी.
        </Text>
        <Pressable style={styles.bannerCta}>
          <Text style={styles.bannerCtaText}>आजच सुरुवात करा</Text>
          <Icon name="arrow-forward" size={18} color={colors.textInverse} />
        </Pressable>
      </LinearGradient>
      <Dots count={1} />
    </View>
  );
}

function Dots({ count }: { count: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: Math.max(count, 1) }).map((_, i) => (
        <View key={i} style={[styles.dot, i === 0 && styles.dotOn]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  // ── वरची पट्टी ──
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  brandBox: { flex: 1, alignItems: 'center' },
  brandTop: {
    ...typography.titleL,
    color: colors.primary,
    letterSpacing: 1,
  },
  brandBottom: {
    ...typography.titleL,
    color: colors.navy,
    letterSpacing: 2,
    marginTop: -spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.sm,
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    ...componentType.smallLabel,
    color: colors.textInverse,
  },

  body: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
  },

  // ── जाहिरात ──
  bannerImage: {
    height: layout.carouselHeight,
    borderRadius: radius.card,
  },
  bannerCard: {
    borderRadius: radius.card,
    padding: layout.cardPadding,
    minHeight: layout.carouselHeight,
    justifyContent: 'center',
  },
  bannerTitle: {
    ...typography.headingL,
    ...marathi.bold,
    color: colors.text,
  },
  bannerTitleAccent: { color: colors.primary },
  bannerNote: {
    ...typography.bodyS,
    ...marathi.regular,
    color: colors.text,
    marginTop: spacing.sm,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  bannerCtaText: {
    ...componentType.buttonText,
    ...marathi.semibold,
    color: colors.textInverse,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotOn: {
    width: 20,
    backgroundColor: colors.primary,
  },

  // ── शॉर्टकट ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.homeTileHeight,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...shadow.card,
  },
  tileOff: { opacity: 0.45 },
  tileIcon: {
    width: layout.tileIconBox,
    height: layout.tileIconBox,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { flex: 1 },
  tileTitle: {
    // वर्णन काढल्याने जागा मोकळी झाली, म्हणून नाव sheet च्या Card Title च्या
    // जवळ नेता आलं. 18 अजूनही बसत नाही — "चालू घडामोडी Quiz" दोन ओळींत जातो.
    fontSize: 15,
    lineHeight: 20,
    ...marathi.semibold,
    color: colors.text,
  },
  tileNote: {
    fontSize: 11,
    lineHeight: 15,
    ...marathi.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
