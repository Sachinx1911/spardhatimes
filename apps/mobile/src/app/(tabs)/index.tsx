import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState, Loading } from '@/components/ui/async-state';
import { HomeCarousel } from '@/components/ui/home-carousel';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { discountPercent, rupees } from '@/types';
import {
  colors,
  componentType,
  layout,
  radius,
  shadow,
  spacing,
  strong,
  subjectColor,
  typography,
} from '@/theme/tokens';

/**
 * Home = **dashboard**.
 *
 * आधी Home हे दुकान होतं. नवीन design मध्ये दुकान `/store` वर हलवलं आणि इथे
 * विद्यार्थ्याचा आढावा आला: नाव, चालू series, आठ शॉर्टकट, आणि चार आकडे.
 *
 * Design मध्ये bottom nav वेगळा (My Courses · Downloads · Live) दिसतो, पण तो
 * **मुद्दाम बदललेला नाही** — `Home · Learn · Tests · Analytics · Profile` हा
 * क्रम गोठवलेला आहे, बघा `docs/UI_DESIGN_STANDARD.md`.
 *
 * मजकूर मराठी-प्रथम, खाली इंग्रजी — design प्रमाणे. विद्यार्थी मराठी माध्यमाचे
 * आहेत, पण "Test Series" सारखे शब्द इंग्रजीतच ओळखले जातात.
 */

interface Tile {
  mr: string;
  en: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  /** पान नसेल तर `null` — tile दिसतो पण निष्क्रिय. */
  href: string | null;
}

const TILES: Tile[] = [
  { mr: 'माझी परीक्षा', en: 'My Test Series', icon: 'school', tint: colors.primary, href: '/tests' },
  { mr: 'टेस्ट सिरीज खरेदी', en: 'Buy Test Series', icon: 'bag-handle', tint: colors.success, href: '/store' },
  { mr: 'सर्व टेस्ट सिरीज', en: 'All Test Series', icon: 'clipboard', tint: colors.warning, href: '/store' },
  { mr: 'टेस्ट घ्या', en: 'Start Test', icon: 'aperture', tint: colors.error, href: '/tests' },
  { mr: 'बुकमार्क', en: 'Bookmarks', icon: 'bookmark', tint: colors.error, href: '/bookmarks' },
  { mr: 'चालू घडामोडी', en: 'Current Affairs', icon: 'newspaper', tint: colors.accentViolet, href: '/current-affairs' },
  // हे दोन अजून बांधलेले नाहीत, म्हणून निष्क्रिय — दाबल्यावर रिकामं पान उघडणं
  // फसवं ठरेल.
  //
  // `परिणाम विश्लेषण` → Analytics tab अजून सांगाडाच आहे (`analytics.tsx`), आणि
  // `tests.tsx` मधले आकडे `mock.ts` मधून येतात. तो खऱ्या data वर आल्यावर हा
  // tile `/analytics` कडे वळवायचा.
  //
  // `अभ्यास साहित्य` → लेख साठवायला schema मध्ये model नाही.
  { mr: 'परिणाम विश्लेषण', en: 'Performance', icon: 'stats-chart', tint: colors.primary, href: null },
  { mr: 'अभ्यास साहित्य', en: 'Study Material', icon: 'book', tint: colors.accentSky, href: null },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi(() => api.dashboard(), []);

  if (loading) return <Loading label="उघडतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const firstName = data.name?.split(' ')[0] ?? 'विद्यार्थी';
  const { stats } = data;

  return (
    <Screen>
      {/* ── शीर्षक ── */}
      <View style={styles.header}>
        <Pressable hitSlop={8}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.brandBox}>
          <Text style={styles.brand}>Spardha Times</Text>
          <Text style={styles.tagline}>Your Success, Our Mission</Text>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* ── अभिवादन ── */}
      <View style={styles.greetRow}>
        <View style={styles.greetText}>
          <Text style={styles.hello}>{`नमस्कार, ${firstName} 👋`}</Text>
          <Text style={styles.helloNote}>चला, आजचा अभ्यास सुरू करूया!</Text>
        </View>
        {/* परीक्षा schema मध्ये नाही — घेतलेल्या series वरून काढली आहे.
            एकाहून जास्त परीक्षा असतील तर काहीच दाखवत नाही. */}
        {data.examName ? (
          <View style={styles.examChip}>
            <Ionicons name="locate-outline" size={14} color={colors.primary} />
            <Text style={styles.examChipText}>{`${data.examName} Aspirant`}</Text>
          </View>
        ) : null}
      </View>

      {/* ── सरकती पट्टी: जाहिराती + ताजे tests ── */}
      <HomeCarousel
        banners={data.banners}
        latestTests={data.latestTests}
        onOpenTest={(id) => router.push(`/quiz/${id}/attempt`)}
      />

      {/* ── चालू series ── */}
      <SectionHeader title="चालू असलेल्या टेस्ट सिरीज" onViewAll={() => router.push('/tests')} />
      {data.activeSeries.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.activeRow}>
          {data.activeSeries.map((s) => {
            const off = discountPercent(s);
            return (
              <Pressable key={s.id} style={styles.activeCard} onPress={() => router.push('/tests')}>
                <View style={styles.activeTop}>
                  <View style={[styles.activeIcon, { backgroundColor: subjectColor(s.categoryName) }]}>
                    <Ionicons name="school" size={18} color={colors.textInverse} />
                  </View>
                  <Text style={styles.activeTitle} numberOfLines={2}>
                    {s.title}
                  </Text>
                </View>
                <Text style={styles.activeMeta} numberOfLines={1}>
                  {s.examName ?? s.categoryName}
                </Text>
                <Text style={styles.activeMeta}>{`${s.totalTests} टेस्ट`}</Text>

                {s.priceInPaise > 0 ? (
                  <View style={styles.activePriceRow}>
                    <Text style={styles.activePrice}>{rupees(s.priceInPaise)}</Text>
                    {s.mrpInPaise ? (
                      <Text style={styles.activeMrp}>{rupees(s.mrpInPaise)}</Text>
                    ) : null}
                    {off ? <Text style={styles.activeOff}>{off}% OFF</Text> : null}
                  </View>
                ) : (
                  <Text style={styles.activeFree}>मोफत</Text>
                )}

                <Pressable style={styles.activeButton} onPress={() => router.push('/tests')}>
                  <Text style={styles.activeButtonText}>View Series</Text>
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <Pressable style={styles.noSeries} onPress={() => router.push('/store')}>
          <Ionicons name="bag-handle-outline" size={20} color={colors.primary} />
          <Text style={styles.noSeriesText}>अजून एकही test series घेतलेली नाही — बघा</Text>
        </Pressable>
      )}

      {/* ── शॉर्टकट ── */}
      <View style={styles.gap} />
      <View style={styles.tileGrid}>
        {TILES.map((t) => {
          const disabled = t.href === null;
          return (
            <Pressable
              key={t.en}
              style={[styles.tile, disabled && styles.tileDisabled]}
              disabled={disabled}
              onPress={() => t.href && router.push(t.href as never)}>
              <View style={[styles.tileIcon, { backgroundColor: t.tint + '1A' }]}>
                <Ionicons name={t.icon} size={22} color={t.tint} />
              </View>
              {/* "टेस्ट सिरीज खरेदी" सारखी नावं एका ओळीत बसत नाहीत — दोन ओळी
                  दिल्या म्हणजे कापली जात नाहीत. */}
              <Text style={styles.tileMr} numberOfLines={2}>
                {t.mr}
              </Text>
              <Text style={styles.tileEn} numberOfLines={2}>
                {disabled ? 'लवकरच' : t.en}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── आकडे ── */}
      <View style={styles.gap} />
      <View style={styles.statGrid}>
        <Stat
          icon="clipboard-outline"
          tint={colors.primary}
          value={String(stats.todaysTests).padStart(2, '0')}
          mr="आजच्या टेस्ट"
          en="Today's Tests"
        />
        <Stat
          icon="checkbox-outline"
          tint={colors.success}
          value={String(stats.testsAttempted)}
          mr="टेस्ट दिलेल्या"
          en="Tests Attempted"
        />
        <Stat
          icon="trophy-outline"
          tint={colors.warning}
          value={`${stats.averageScore}%`}
          mr="सरासरी स्कोर"
          en="Average Score"
        />
        <Stat
          icon="calendar-outline"
          tint="#0EA5E9"
          // मुदत नसेल तर "आजीवन" — रिकामी जागा किंवा खोटी तारीख दाखवण्यापेक्षा बरं.
          value={
            stats.validTill
              ? new Date(stats.validTill).toLocaleDateString('mr-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'आजीवन'
          }
          mr="सदस्यत्व वैध"
          en="Valid Till"
        />
      </View>
    </Screen>
  );
}

function Stat({
  icon,
  tint,
  value,
  mr,
  en,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  value: string;
  mr: string;
  en: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={tint} />
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statMr} numberOfLines={1}>
        {mr}
      </Text>
      <Text style={styles.statEn} numberOfLines={1}>
        {en}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── शीर्षक ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.headerHeight - spacing['2xl'],
  },
  brandBox: { flex: 1 },
  brand: {
    ...typography.titleL,
    ...strong.bold,
    color: colors.text,
  },
  tagline: {
    ...componentType.smallLabel,
    color: colors.primary,
  },

  // ── अभिवादन ──
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  greetText: { flex: 1 },
  hello: {
    ...typography.headingL,
    ...strong.bold,
    color: colors.text,
  },
  helloNote: {
    ...typography.bodyM,
    color: colors.textSecondary,
  },
  examChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  examChipText: {
    ...componentType.smallLabel,
    ...strong.semibold,
    color: colors.primary,
  },


  // ── चालू series ──
  bleed: {
    marginHorizontal: -layout.screenPadding,
  },
  activeRow: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeCard: {
    width: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadow.card,
  },
  activeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activeIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTitle: {
    ...componentType.cardTitle,
    color: colors.text,
    flex: 1,
  },
  activeMeta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  activePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  activePrice: {
    ...typography.bodyL,
    ...strong.bold,
    color: colors.text,
  },
  activeMrp: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  activeOff: {
    ...componentType.smallLabel,
    ...strong.semibold,
    color: colors.success,
  },
  activeFree: {
    ...typography.bodyL,
    ...strong.bold,
    color: colors.success,
    marginTop: spacing.xs,
  },
  activeButton: {
    marginTop: spacing.sm,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButtonText: {
    ...componentType.smallLabel,
    ...strong.semibold,
    color: colors.primary,
  },
  noSeries: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  noSeriesText: {
    ...typography.bodyM,
    color: colors.textSecondary,
    flex: 1,
  },

  // ── शॉर्टकट ──
  gap: { height: spacing.xl },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    // चार प्रति ओळ. गणित तंतोतंत बसवलं (22.37%) तर गोलाई मुळे बेरीज 100% च्या
    // वर जाते आणि चौथा tile खाली उडी मारतो — म्हणून थोडी सैल जागा ठेवली आहे.
    width: '22%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadow.card,
  },
  tileDisabled: {
    opacity: 0.5,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileMr: {
    fontSize: 10,
    lineHeight: 13,
    ...strong.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  tileEn: {
    fontSize: 9,
    lineHeight: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── आकडे ──
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
    ...shadow.card,
  },
  statValue: {
    ...typography.titleL,
    ...strong.bold,
    color: colors.text,
  },
  statMr: {
    ...componentType.smallLabel,
    color: colors.text,
  },
  statEn: {
    fontSize: 10,
    lineHeight: 13,
    color: colors.textSecondary,
  },
});
