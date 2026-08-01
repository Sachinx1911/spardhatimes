import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState, Loading } from '@/components/ui/async-state';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  layout,
  radius,
  screenAccent,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * एका विषयाचे मुद्दे — अभ्यासक्रमातल्या "पहा" मागचा पडदा.
 *
 * याची स्वतंत्र design sheet आलेली नाही, म्हणून तीच भाषा वापरली आहे जी
 * Syllabus पडद्याची आहे: तोच header, तीच ओळींची उंची, तेच रंग. नवीन शैली
 * शोधली असती तर दोन पडदे एकाच प्रवाहात वेगळे दिसले असते.
 */

const A = screenAccent.exam;

/** 390 → "6 तास 30 मिनिटे". */
function readableTime(minutes: number): string | null {
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} मिनिटे`;
  if (m === 0) return `${h} तास`;
  return `${h} तास ${m} मिनिटे`;
}

export default function SyllabusSectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, loading, error, reload } = useApi(() => api.syllabusSection(id), [id]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const time = data ? readableTime(data.estimatedMinutes) : null;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={8} onPress={goBack}>
            <Icon name="arrow-back" size={24} color={colors.textInverse} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {data?.subjectName ?? '…'}
          </Text>
          <Pressable hitSlop={8}>
            <Icon name="search" size={24} color={colors.textInverse} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing['3xl'] }]}
        showsVerticalScrollIndicator={false}>
        {loading ? <Loading label="मुद्दे उघडतोय…" /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}

        {data ? (
          <>
            <Text style={styles.crumb} numberOfLines={1}>
              {data.syllabusTitle}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{data.topics.length} टॉपिक्स</Text>
              {time ? (
                <>
                  <Icon name="time" size={13} color={colors.textSecondary} />
                  <Text style={styles.meta}>{time}</Text>
                </>
              ) : null}
            </View>

            {data.topics.length > 0 ? (
              <View style={styles.list}>
                {data.topics.map((t, i) => (
                  <View key={t.id} style={[styles.row, i > 0 && styles.rowDivided]}>
                    {/* क्रमांक — अभ्यासक्रम क्रमाने वाचला जातो, म्हणून तो दिसणं उपयोगी. */}
                    <View style={styles.num}>
                      <Text style={styles.numText}>{i + 1}</Text>
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{t.title}</Text>
                      {t.note ? <Text style={styles.rowNote}>{t.note}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>या विषयात अजून मुद्दे जोडलेले नाहीत.</Text>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

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

  body: { paddingHorizontal: layout.cardPadding, paddingTop: spacing.lg },

  crumb: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  meta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },

  list: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: layout.cardPadding,
  },
  rowDivided: { borderTopWidth: 1, borderTopColor: colors.border },
  num: {
    width: layout.badgeHeight,
    height: layout.badgeHeight,
    borderRadius: radius.full,
    backgroundColor: A.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    ...componentType.smallLabel,
    ...strong.semibold,
    color: A.primary,
  },
  rowText: { flex: 1 },
  rowTitle: {
    ...componentType.rowTitle,
    color: colors.text,
  },
  rowNote: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
    marginTop: 2,
  },

  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
