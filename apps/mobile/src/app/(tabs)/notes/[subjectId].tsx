import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  shadow,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * एका विषयाच्या PDF नोट्स — "इतिहास नोट्स".
 *
 * PDF Notes च्या पडद्यावरून विषय दाबल्यावर इथे येतो. डिझाइन sheet प्रमाणे:
 * वरती hero, मग गाळणी + क्रम, मग प्रत्येक file ची ओळ (पाने + तारीख +
 * डाउनलोड/पहा), आणि तळाशी "सर्व नोट्स डाउनलोड करा".
 */

const accent = screenAccent.pdfNotes;

/** "08 मे 2025" — डिझाइनमधलं मराठी स्वरूप. */
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

type SortOrder = 'newest' | 'oldest';

export default function SubjectNotesScreen() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const [order, setOrder] = useState<SortOrder>('newest');

  const { data, loading, error, reload } = useApi(
    () => api.materials({ type: 'NOTE', subjectId }),
    [subjectId]
  );

  const notes = useMemo(() => {
    const list = data ?? [];
    // API नव्याकडून जुन्याकडे देतो; "जुने ते नवीन" फक्त उलटा क्रम आहे, म्हणून
    // त्यासाठी पुन्हा server ला विचारण्याची गरज नाही.
    return order === 'newest' ? list : [...list].reverse();
  }, [data, order]);

  const subjectName = notes[0]?.subjectName ?? 'नोट्स';

  const open = (url: string) => Linking.openURL(url);

  if (loading) return <Loading label="नोट्स उघडतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={`${subjectName} नोट्स`}
        background={accent.primaryDark}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/pdf-notes'))}
        showBell
        badgeCount={3}
        onSearch={() => {}}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* ── वरचं कार्ड ── */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name="book" size={24} color={colors.textInverse} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {`${subjectName} अभ्यासक्रम`}
            </Text>
            <Text style={styles.heroCount}>{`एकूण ${notes.length} नोट्स`}</Text>
            <Text style={styles.heroNote}>
              {`${subjectName} विषयाच्या सर्व PDF नोट्स येथे उपलब्ध आहेत.`}
            </Text>
          </View>
        </View>

        {/* ── क्रम ── */}
        <View style={styles.controls}>
          <View style={styles.control}>
            <Text style={styles.controlText} numberOfLines={1}>
              {subjectName}
            </Text>
          </View>
          <Pressable
            style={styles.control}
            onPress={() => setOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}>
            <Icon name="funnel" size={20} color={colors.textSecondary} />
            <Text style={styles.controlText}>
              {order === 'newest' ? 'नवीन ते जुने' : 'जुने ते नवीन'}
            </Text>
          </Pressable>
        </View>

        {/* ── नोट्सची यादी ── */}
        {notes.length === 0 ? (
          <Text style={styles.empty}>या विषयाच्या नोट्स अजून टाकलेल्या नाहीत.</Text>
        ) : (
          <View style={styles.list}>
            {notes.map((n, i) => {
              const date = marathiDate(n.publishedAt);
              return (
                <Pressable
                  key={n.id}
                  style={[styles.row, i === notes.length - 1 && styles.rowLast]}
                  onPress={() => open(n.url)}>
                  <View style={styles.pdfIcon}>
                    <Text style={styles.pdfLabel}>PDF</Text>
                  </View>

                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle} numberOfLines={2}>
                      {n.title}
                    </Text>
                    <View style={styles.metaRow}>
                      {n.pageCount ? (
                        <View style={styles.meta}>
                          <Icon name="document-text" size={13} color={colors.textSecondary} />
                          <Text style={styles.metaText}>{`${n.pageCount} पाने`}</Text>
                        </View>
                      ) : null}
                      {date ? (
                        <View style={styles.meta}>
                          <Icon name="calendar" size={13} color={colors.textSecondary} />
                          <Text style={styles.metaText}>{date}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* डाउनलोड आणि पहा — दोन्ही तीच URL उघडतात. App मध्ये file
                      साठवण्याची सोय अजून नाही, म्हणून "डाउनलोड" browser कडे
                      सोपवतो; तो स्वतः जतन करू देतो. */}
                  <Pressable style={styles.action} hitSlop={6} onPress={() => open(n.url)}>
                    <Icon name="download" size={20} color={accent.primary} />
                    <Text style={styles.actionText}>डाउनलोड</Text>
                  </Pressable>
                  <Pressable style={styles.action} hitSlop={6} onPress={() => open(n.url)}>
                    <Icon name="eye" size={20} color={accent.primary} />
                    <Text style={styles.actionText}>पहा</Text>
                  </Pressable>

                  <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── सगळ्या नोट्स ── */}
        {notes.length > 0 ? (
          <View style={styles.promo}>
            <View style={styles.promoIcon}>
              <Icon name="download" size={20} color={accent.primary} />
            </View>
            <View style={styles.promoText}>
              <Text style={styles.promoTitle} numberOfLines={2}>
                {`संपूर्ण ${subjectName} नोट्स PDF डाउनलोड करा!`}
              </Text>
              <Text style={styles.promoNote} numberOfLines={1}>
                एकाच क्लिक मध्ये सर्व नोट्स डाउनलोड करा.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },

  // ── वरचं कार्ड ──
  hero: {
    minHeight: 120,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: accent.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, gap: 2 },
  heroTitle: { ...typography.titleL, ...strong.semibold, color: colors.text },
  heroCount: { ...componentType.cardDescription, ...strong.medium, color: colors.textSecondary },
  heroNote: { ...componentType.cardDescription, color: colors.textSecondary },

  // ── गाळणी ──
  controls: { flexDirection: 'row', gap: spacing.md },
  control: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  controlText: { ...componentType.cardDescription, ...strong.medium, color: colors.text },

  // ── यादी ──
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    // क्रियांच्या मधली फट कमी — नाहीतर 360dp वर शीर्षकाला जागाच उरत नाही
    // आणि प्रत्येक नाव अर्ध्यावर कापलं जातं.
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  pdfIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfLabel: { fontSize: 9, ...strong.bold, color: colors.danger },
  rowText: { flex: 1, gap: 2, minWidth: 0 },
  rowTitle: { ...componentType.listItemTitle, color: colors.text },
  metaRow: { flexDirection: 'row', gap: spacing.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { ...componentType.smallLabel, color: colors.textSecondary },
  action: { alignItems: 'center', gap: 2, width: 46 },
  actionText: { ...componentType.smallLabel, ...strong.medium, color: accent.primary },

  empty: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing['4xl'],
  },

  // ── तळाचं कार्ड ──
  promo: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: accent.primaryLight,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1, gap: 2 },
  promoTitle: { ...componentType.cardTitle, ...strong.semibold, color: accent.primary },
  promoNote: { ...componentType.smallLabel, color: colors.textSecondary },
});
