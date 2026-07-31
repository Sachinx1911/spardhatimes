import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState, Loading } from '@/components/ui/async-state';
import { HomeCarousel } from '@/components/ui/home-carousel';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
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
} from '@/theme/tokens';

/**
 * मुख्य पान — **दिशादर्शक, दुकान नाही.**
 *
 * वरती gradient पट्टी, मग सरकती जाहिरात, मग आठ मोठे शॉर्टकट. दुकान `/store` वर
 * आहे आणि विद्यार्थ्याच्या स्वतःच्या series `My Course` मध्ये.
 *
 * आधी इथे अभिवादन, चालू series आणि चार आकडे होते. नवीन design मध्ये ते नाहीत —
 * ते सगळं `My Course` आणि `Analytics` मध्ये आहेच, आणि इथे दोनदा दाखवण्यापेक्षा
 * मुख्य पान मोकळं ठेवलेलं बरं.
 *
 * मजकूर **मराठी-प्रथम**: मोठ्या अक्षरात मराठी, खाली बारीक ओळ. विद्यार्थी मराठी
 * माध्यमाचे आहेत, पण "PDF Notes", "TCS | IBPS" सारखी नावं इंग्रजीतच ओळखली जातात
 * म्हणून ती तशीच ठेवली आहेत.
 */

interface Tile {
  /** मोठं नाव — जे विद्यार्थी वाचतो. */
  title: string;
  /** खालची ओळ — काय मिळेल ते. */
  note: string;
  icon: string;
  tint: string;
  /** पान नसेल तर `null` — tile दिसतो पण निष्क्रिय, "लवकरच" म्हणून. */
  href: string | null;
}

const TILES: Tile[] = [
  {
    title: 'MPSC',
    note: 'अभ्यास साहित्य, टेस्ट आणि नोट्स',
    icon: 'document-text',
    tint: colors.danger,
    href: '/store',
  },
  {
    title: 'ONLINE TEST',
    note: 'टेस्ट द्या आणि तुमची तयारी तपासा',
    icon: 'clipboard',
    tint: colors.blue,
    href: '/tests',
  },
  {
    title: 'PDF NOTES',
    note: 'सर्व विषयांचे PDF नोट्स डाउनलोड करा',
    icon: 'file-tray',
    tint: colors.success,
    href: '/learn',
  },
  // ── खालचे तीन अजून बांधलेले नाहीत ──
  // schema मध्ये अभ्यासक्रम, सरळसेवा आणि दैनिक quiz यांचं एकही model नाही.
  // दाबल्यावर रिकामं पान उघडण्यापेक्षा "लवकरच" दाखवणं प्रामाणिक.
  {
    title: 'अभ्यासक्रम',
    note: 'परीक्षेनुसार संपूर्ण अभ्यासक्रम पहा',
    icon: 'book',
    tint: colors.warning,
    href: null,
  },
  {
    title: 'चालू घडामोडी',
    note: 'दैनिक, साप्ताहिक आणि मासिक अपडेट्स',
    icon: 'newspaper',
    tint: colors.accentViolet,
    href: '/current-affairs',
  },
  {
    title: 'सरळसेवा',
    note: 'महत्त्वाच्या सेवा आणि उपयुक्त लिंक',
    icon: 'globe',
    tint: colors.accentSky,
    href: null,
  },
  {
    title: 'चालू घडामोडी Quiz',
    note: 'चालू घडामोडींवर आधारित विविध खेळ',
    icon: 'bulb',
    tint: colors.warning,
    href: null,
  },
  {
    title: 'TCS | IBPS',
    note: 'बँकिंग आणि TCS परीक्षांची तयारी',
    icon: 'school',
    tint: colors.pink,
    href: '/store',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useApi(() => api.dashboard(), []);

  return (
    <View style={styles.root}>
      {/* ── gradient पट्टी ── */}
      <LinearGradient
        colors={gradients.appBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.appBar, { paddingTop: insets.top + spacing.md }]}>
        {/* ☰ design मध्ये आहे म्हणून जागा धरून ठेवली आहे, पण **त्यामागे अजून
            काही नाही** — menu ची design आल्यावर इथे जोडायचा. */}
        <Pressable hitSlop={8}>
          <Icon name="menu" size={26} color={colors.textInverse} />
        </Pressable>

        <View style={styles.brandBox}>
          <Text style={styles.brand}>SPARDHA TIMES</Text>
          <Text style={styles.tagline}>Your Success, Our Mission</Text>
        </View>

        <Pressable hitSlop={8}>
          <Icon name="notifications" size={24} color={colors.textInverse} />
          {/* न वाचलेल्यांचा आकडा अजून API मधून येत नाही — तो आल्यावर इथे. */}
        </Pressable>
      </LinearGradient>

      <Screen>
        {loading ? <Loading label="उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}

        {data ? (
          <HomeCarousel
            banners={data.banners}
            latestTests={data.latestTests}
            onOpenTest={(id) => router.push(`/quiz/${id}/attempt`)}
          />
        ) : null}

        {/* ── आठ शॉर्टकट ── */}
        <View style={styles.grid}>
          {TILES.map((t) => {
            const disabled = t.href === null;
            return (
              <Pressable
                key={t.title}
                style={[styles.tile, disabled && styles.tileOff]}
                disabled={disabled}
                onPress={() => t.href && router.push(t.href as never)}>
                <View style={[styles.tileIcon, { backgroundColor: t.tint }]}>
                  <Icon name={t.icon} size={22} color={colors.textInverse} />
                </View>

                <View style={styles.tileText}>
                  {/* अर्ध्या रुंदीच्या कार्डात "ONLINE TEST" एका ओळीत बसत नाही —
                      दोन ओळी दिल्या म्हणजे नाव कापलं जात नाही. */}
                  <Text style={styles.tileTitle} numberOfLines={2}>
                    {t.title}
                  </Text>
                  <Text style={styles.tileNote} numberOfLines={2}>
                    {disabled ? 'लवकरच येत आहे' : t.note}
                  </Text>
                </View>

                <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            );
          })}
        </View>
      </Screen>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
    // पट्टीचे खालचे कोपरे गोल — खालचा मजकूर तिच्यातून बाहेर येतोय असं वाटतं.
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  brandBox: { flex: 1, alignItems: 'center' },
  brand: {
    ...typography.titleL,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  tagline: {
    ...componentType.smallLabel,
    color: 'rgba(255,255,255,0.85)',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  tile: {
    width: layout.halfCardWidth,
    // सगळी कार्डं समान उंचीची — नाहीतर एका ओळीचं नाव असलेलं कार्ड बुटकं दिसतं.
    minHeight: layout.homeTileHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: layout.cardPadding,
    ...shadow.card,
  },
  // न बांधलेले फिकट — दाबता येत नाहीत हे दिसलं पाहिजे.
  tileOff: { opacity: 0.45 },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { flex: 1 },
  tileTitle: {
    ...componentType.badge,
    fontSize: 15,
    lineHeight: 20,
    ...marathi.semibold,
    color: colors.text,
  },
  tileNote: {
    ...componentType.smallLabel,
    ...marathi.regular,
    color: colors.textSecondary,
  },
});
