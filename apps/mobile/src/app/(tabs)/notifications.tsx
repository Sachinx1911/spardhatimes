import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { api, type ApiNotification } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  layout,
  radius,
  screenAccent,
  shadow,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

const A = screenAccent.home;

/**
 * सूचना.
 *
 * या grading, certificate आणि release यंत्रणा आधीच बनवतात — हा पडदा फक्त
 * वाचतो. उघडल्याबरोबर सगळ्या "वाचल्या" म्हणून खुणतो, म्हणजे घंटेवरचा आकडा
 * आपोआप शून्य होतो; प्रत्येक सूचना वेगळी टॅप करून वाचायला लावण्यापेक्षा हे
 * विद्यार्थ्याला अपेक्षित.
 */

/** सूचनेच्या प्रकारावरून चिन्ह आणि रंग. अनोळखी प्रकार सामान्य घंटा. */
function look(type: string): { icon: string; color: string; bg: string } {
  switch (type) {
    case 'certificate_generated':
      return { icon: 'badge-check', color: colors.warning, bg: colors.warningLight };
    case 'test_released':
    case 'quiz_published':
      return { icon: 'sparkles', color: colors.primary, bg: colors.primaryLight };
    case 'test_completed':
    case 'test_submitted':
      return { icon: 'document-text', color: colors.success, bg: colors.successLight };
    default:
      return { icon: 'notifications', color: colors.info, bg: colors.blueLight };
  }
}

/** "5 मिनिटांपूर्वी", "2 तासांपूर्वी", "3 दिवसांपूर्वी". */
function ago(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'आत्ताच';
  if (mins < 60) return `${mins} मिनिटांपूर्वी`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} तासांपूर्वी`;
  const days = Math.floor(hours / 24);
  return `${days} दिवसांपूर्वी`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi(() => api.notifications(), []);
  const items = data ?? [];

  // पडदा उघडल्यावर एकदाच सगळ्या वाचल्या म्हणून खुणतो. चूक आली तरी सोडून देतो —
  // यादी तर दिसतेच; आकडा पुढच्या वेळी जुळेल.
  useEffect(() => {
    api.markAllRead().catch(() => {});
  }, []);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="सूचना"
        background={A.primaryDark}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? <Loading label="सूचना उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyState icon="notifications" message="अजून एकही सूचना नाही." />
        ) : null}

        {items.map((n: ApiNotification) => {
          const l = look(n.type);
          return (
            <View key={n.id} style={[styles.row, !n.read && styles.rowUnread]}>
              <View style={[styles.icon, { backgroundColor: l.bg }]}>
                <Icon name={l.icon} size={20} color={l.color} />
              </View>
              <View style={styles.text}>
                <Text style={styles.title} numberOfLines={2}>
                  {n.title}
                </Text>
                <Text style={styles.message} numberOfLines={3}>
                  {n.message}
                </Text>
                <Text style={styles.time}>{ago(n.createdAt)}</Text>
              </View>
              {/* न वाचलेल्याला उजवीकडे ठिपका — कोणती नवीन ते एका नजरेत कळावं. */}
              {!n.read ? <View style={styles.dot} /> : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow.card,
  },
  // न वाचलेल्या ओळीला फिकट जांभळी छटा — वाचलेल्यांपासून वेगळी दिसते.
  rowUnread: { backgroundColor: colors.primaryLight },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: { ...componentType.cardTitle, color: colors.text },
  message: { ...typography.bodyS, color: colors.textSecondary },
  time: { ...componentType.smallLabel, color: colors.textLight, marginTop: spacing.xs },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
});
