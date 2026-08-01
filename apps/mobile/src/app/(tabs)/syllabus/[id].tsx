import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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
 * एका अभ्यासक्रमाचे विषय — क्रमांकित यादी, प्रत्येकावर PDF.
 *
 * Sheet प्रमाणे: header → अभ्यासक्रमाचं कार्ड → "विषयांची यादी" → आठ विषय →
 * "सर्व विषय पहा (N)".
 *
 * **आठच का:** design आठ दाखवते आणि खाली उघडायचं बटण ठेवते. मोठ्या
 * अभ्यासक्रमात वीस विषय एकदम दाखवले तर खालचं काहीच दिसत नाही आणि पडदा
 * नुसता लांब होतो.
 *
 * ⚠️ Sheet मध्ये "सर्व विषय पहा" नंतर **काहीच नाही**, म्हणून पूर्ण
 * अभ्यासक्रमाच्या PDF चं कार्ड इथून काढलं आहे. त्यामुळे `Syllabus.pdfUrl`
 * ला सध्या app मध्ये जागा उरलेली नाही — तो कुठे दाखवायचा हे ठरलं की जोडायचा.
 */

const A = screenAccent.syllabus;

/** सुरुवातीला किती विषय दाखवायचे — बाकीचे "सर्व विषय पहा" ने. */
const PREVIEW_COUNT = 8;

export default function SyllabusScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [expanded, setExpanded] = useState(false);

  const { data, loading, error, reload } = useApi(() => api.syllabus(id), [id]);

  if (loading) return <Loading label="अभ्यासक्रम उघडतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <ErrorState message="हा अभ्यासक्रम सापडला नाही." />;

  const all = data.sections;
  const shown = expanded ? all : all.slice(0, PREVIEW_COUNT);
  const hasMore = all.length > PREVIEW_COUNT;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={data.title}
        background={A.primaryDark}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/syllabus'))}
        onSearch={() => {}}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* ── अभ्यासक्रमाचं कार्ड ── */}
        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <Icon name="book" size={24} color={A.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {data.title}
            </Text>
            <Text style={styles.cardMeta}>{`एकूण ${all.length} विषय`}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>विषयांची यादी</Text>

        {all.length === 0 ? (
          <Text style={styles.empty}>या अभ्यासक्रमात अजून विषय टाकलेले नाहीत.</Text>
        ) : (
          <View style={styles.list}>
            {shown.map((sec, i) => (
              <Pressable
                key={sec.id}
                style={[styles.row, i === shown.length - 1 && styles.rowLast]}
                // Design मध्ये बाण नाही, पण ओळ दाबता येते — नाहीतर मुद्द्यांचा
                // पडदा कुठूनच उघडणार नाही.
                onPress={() => router.push(`/syllabus/section/${sec.id}`)}>
                <View style={styles.number}>
                  <Text style={styles.numberText}>{i + 1}</Text>
                </View>

                <Text style={styles.rowTitle} numberOfLines={1}>
                  {sec.subjectName}
                </Text>

                {/* PDF नसेल तर बटणच दाखवायचं नाही — दाबल्यावर काहीच न होणं
                    हे बटण नसण्यापेक्षा जास्त गोंधळात टाकतं. */}
                {sec.pdfUrl ? (
                  <Pressable
                    style={styles.pdfButton}
                    hitSlop={6}
                    onPress={() => Linking.openURL(sec.pdfUrl!)}>
                    <Icon name="download" size={18} color={A.primary} />
                    <Text style={styles.pdfText}>PDF</Text>
                  </Pressable>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}

        {/* ── सगळे विषय ── */}
        {hasMore ? (
          <Pressable style={styles.expand} onPress={() => setExpanded((v) => !v)}>
            <Text style={styles.expandText}>
              {expanded ? 'कमी दाखवा' : `सर्व विषय पहा (${all.length})`}
            </Text>
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={A.primary}
            />
          </Pressable>
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
    gap: spacing.md,
  },

  // ── वरचं कार्ड ──
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: A.primaryLight,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { ...typography.titleL, ...strong.semibold, color: colors.text },
  cardMeta: { ...componentType.cardDescription, color: colors.textSecondary },

  sectionTitle: { ...typography.headingL, ...strong.semibold, color: colors.text },

  // ── विषयांची यादी ──
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  number: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: A.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { ...componentType.smallLabel, ...strong.semibold, color: A.primary },
  rowTitle: { flex: 1, ...componentType.cardTitle, color: colors.text },
  pdfButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pdfText: { ...componentType.smallLabel, ...strong.medium, color: A.primary },

  // ── सगळे विषय ──
  expand: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: A.primaryLight,
    borderRadius: radius.md,
  },
  expandText: { ...componentType.cardTitle, ...strong.medium, color: A.primary },

  empty: {
    ...typography.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing['3xl'],
  },

});
