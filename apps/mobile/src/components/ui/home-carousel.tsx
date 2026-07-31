import { useState } from 'react';
import {
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import type { ApiDashboard } from '@/lib/api';
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
 * Home वरची सरकती पट्टी — **दोन पानं**: जाहिराती, आणि ताजे tests.
 *
 * एकाच जागी दोन वेगळी कामं आहेत: जाहिरात विकते, ताजे tests अभ्यासाकडे नेतात.
 * दोन्ही वेगवेगळ्या पट्ट्यांत ठेवल्या असत्या तर Home खूप लांब झालं असतं आणि
 * शॉर्टकट खाली ढकलले गेले असते.
 *
 * एकही जाहिरात नसेल तर पहिलं पान app च्या स्वतःच्या मजकुराने भरतं — रिकामी
 * चौकट किंवा तुटकी प्रतिमा दाखवण्यापेक्षा बरं.
 */
export function HomeCarousel({
  banners,
  latestTests,
  onOpenTest,
}: {
  banners: ApiDashboard['banners'];
  latestTests: ApiDashboard['latestTests'];
  onOpenTest: (id: string) => void;
}) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  // पट्टी screen च्या काठापर्यंत जाते, म्हणून पानाची रुंदी पूर्ण screen एवढी.
  const pageWidth = width;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (next !== page) setPage(next);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.bleed}>
        {/* ── पान १: जाहिराती ── */}
        <View style={[styles.page, { width: pageWidth }]}>
          {banners.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.adRow}>
              {banners.map((b) => (
                <Pressable
                  key={b.id}
                  disabled={!b.linkUrl}
                  onPress={() => b.linkUrl && Linking.openURL(b.linkUrl)}
                  style={[styles.ad, { width: pageWidth - layout.screenPadding * 2 }]}>
                  <Image source={{ uri: b.imageUrl }} style={styles.adImage} resizeMode="cover" />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <FallbackBanner />
          )}
        </View>

        {/* ── पान २: ताजे tests ── */}
        <View style={[styles.page, { width: pageWidth }]}>
          <View style={styles.testsCard}>
            <View style={styles.testsHead}>
              <Icon name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.testsTitle}>ताजे टेस्ट</Text>
            </View>

            {latestTests.length > 0 ? (
              latestTests.slice(0, 2).map((t) => (
                <Pressable key={t.id} style={styles.testRow} onPress={() => onOpenTest(t.id)}>
                  <View style={styles.testIcon}>
                    <Icon name="document-text" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.testText}>
                    <Text style={styles.testName} numberOfLines={1}>
                      {t.title}
                    </Text>
                    <Text style={styles.testMeta} numberOfLines={1}>
                      {`${t.questionCount} प्रश्न · ${t.durationMinutes} मिनिटं`}
                      {t.seriesTitle ? ` · ${t.seriesTitle}` : ''}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
                </Pressable>
              ))
            ) : (
              <Text style={styles.testsEmpty}>
                अजून एकही test उघडलेला नाही. नवीन आला की इथे दिसेल.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.dot, page === i && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

/**
 * एकही जाहिरात नसताना दिसणारी पट्टी.
 *
 * Design मध्ये इथे तयार poster आहे; तो admin ने Banners मधून टाकला की हा
 * भाग आपोआप बाजूला होतो.
 */
function FallbackBanner() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fbKicker}>SPARDHA TIMES</Text>
      <Text style={styles.fbTitle}>महाराष्ट्रातील</Text>
      <Text style={styles.fbTitleAccent}>सर्वोत्कृष्ट अभ्यासक्रम!</Text>
      <View style={styles.fbPill}>
        <Text style={styles.fbPillText}>परीक्षेसाठी तयार… स्पर्धा टाईम्स सोबत!</Text>
      </View>
      <View style={styles.fbPoints}>
        {['संपूर्ण पॅटर्न नुसार प्रश्न', 'सविस्तर स्पष्टीकरणासहित', 'लेटेस्ट चालू घडामोडी', 'टॉपिक वाईज टेस्ट'].map(
          (p) => (
            <View key={p} style={styles.fbPoint}>
              <Icon name="checkmark-circle" size={13} color={colors.primary} />
              <Text style={styles.fbPointText} numberOfLines={1}>
                {p}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  bleed: { marginHorizontal: -layout.screenPadding },
  page: { paddingHorizontal: layout.screenPadding },

  // ── जाहिराती ──
  adRow: { gap: spacing.md },
  ad: {
    height: layout.carouselHeight,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
  },
  adImage: { width: '100%', height: '100%' },

  // ── ताजे tests ──
  testsCard: {
    // दोन्ही पानं एकाच आडव्या ScrollView मध्ये आहेत, म्हणून ती **सर्वात उंच
    // पानाएवढी** ताणली जातात. उंची निश्चित नसेल तर जाहिरातीखाली मोठी मोकळी
    // जागा उरते. म्हणून दोन्हींना तीच उंची.
    height: layout.carouselHeight,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
  testsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  testsTitle: {
    ...typography.titleL,
    ...strong.semibold,
    color: colors.text,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  testIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testText: { flex: 1 },
  testName: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  testMeta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  testsEmpty: {
    ...typography.bodyM,
    color: colors.textSecondary,
    paddingVertical: spacing.lg,
  },

  // ── ठिपके ──
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
  dotOn: {
    width: 18,
    backgroundColor: colors.primary,
  },

  // ── जाहिरात नसताना ──
  fallback: {
    height: layout.carouselHeight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  fbKicker: {
    ...componentType.smallLabel,
    ...strong.bold,
    color: colors.error,
    letterSpacing: 1,
  },
  fbTitle: {
    ...typography.titleL,
    ...strong.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  fbTitleAccent: {
    ...typography.headingL,
    ...strong.bold,
    color: colors.error,
  },
  fbPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  fbPillText: {
    ...componentType.smallLabel,
    ...strong.semibold,
    color: colors.textInverse,
  },
  fbPoints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    rowGap: spacing.sm,
  },
  fbPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: '50%',
    paddingRight: spacing.sm,
  },
  fbPointText: {
    ...componentType.smallLabel,
    color: colors.text,
    flex: 1,
  },
});
