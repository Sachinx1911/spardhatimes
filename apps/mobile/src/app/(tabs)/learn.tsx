import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { EmptyState, ErrorState, Loading } from '@/components/ui/async-state';
import { FilterChips, type FilterChip } from '@/components/ui/filter-chips';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { api, type ApiLearnOverview, type ApiMaterial, type ApiMaterialType } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import {
  colors,
  componentType,
  radius,
  shadow,
  spacing,
  strong,
  subjectColor,
  typography,
} from '@/theme/tokens';

/**
 * अभ्यास साहित्य.
 *
 * Design मध्ये वर सहा tabs आहेत (Overview / Notes / Videos / Books / PYQs /
 * Shorts). इथे तेच chips म्हणून आहेत, कारण tabs मध्ये प्रत्येक प्रकार वेगळा
 * पडदा असता आणि विद्यार्थ्याला "गणिताचं काय आहे" हे बघायला सहा वेळा फिरावं
 * लागलं असतं. Chips ने प्रकार आणि विषय एकाच पडद्यावर गाळता येतात.
 *
 * **मागील वर्षांचे पेपर इथे नाहीत.** ते tests आहेत (`Quiz.type = PYQ`) —
 * वाचायचे नसून सोडवायचे — म्हणून त्यांचा आकडा दिसतो आणि टॅप केल्यावर Tests
 * कडे नेतो.
 */

const TYPE_CHIPS: { key: ApiMaterialType | 'all'; label: string }[] = [
  { key: 'all', label: 'सर्व' },
  { key: 'NOTE', label: 'Notes' },
  { key: 'VIDEO', label: 'Videos' },
  { key: 'BOOK', label: 'Books' },
  { key: 'SHORT', label: 'Shorts' },
];

const TYPE_ICON: Record<ApiMaterialType, string> = {
  NOTE: 'document-text',
  VIDEO: 'play-circle',
  BOOK: 'book',
  SHORT: 'flash',
};

export default function LearnScreen() {
  const [type, setType] = useState<ApiMaterialType | 'all'>('all');
  const [subjectId, setSubjectId] = useState('all');

  const overview = useApi(() => api.learn(), []);
  const list = useApi(
    () =>
      api.materials({
        type: type === 'all' ? undefined : type,
        subjectId: subjectId === 'all' ? undefined : subjectId,
      }),
    [type, subjectId]
  );

  if (overview.loading) return <Loading label="अभ्यास साहित्य उघडतोय…" />;
  if (overview.error) return <ErrorState message={overview.error} onRetry={overview.reload} />;
  if (!overview.data) return null;

  const { counts, subjects } = overview.data;
  const total = counts.notes + counts.videos + counts.books + counts.shorts;

  const subjectChips: FilterChip[] = [
    { key: 'all', label: 'सर्व विषय' },
    ...subjects.map((s) => ({ key: s.id, label: s.name })),
  ];

  return (
    <Screen>
      <Text style={styles.title}>Learn</Text>
      <Text style={styles.subtitle}>तयारीसाठी निवडक साहित्य</Text>

      {/* ── तयारीची पट्टी ── */}
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>तयारी जोरात करा 🚀</Text>
          <Text style={styles.heroNote}>
            परीक्षेसाठी निवडलेलं दर्जेदार साहित्य एकाच ठिकाणी.
          </Text>
        </View>
        <View style={styles.summary}>
          <Count label="Notes" value={counts.notes} />
          <Count label="Videos" value={counts.videos} />
          <Count label="Books" value={counts.books} />
          <Count label="PYQs" value={counts.pyqs} />
        </View>
      </View>

      {/* ── पुढे सुरू ठेवा ── */}
      {overview.data.continueLearning.length > 0 ? (
        <>
          <SectionHeader title="पुढे सुरू ठेवा" />
          <View style={styles.list}>
            {overview.data.continueLearning.map((c) => (
              <ContinueRow key={c.id} item={c} />
            ))}
          </View>
          <View style={styles.gapLg} />
        </>
      ) : null}

      {/* ── विषयानुसार प्रगती ── */}
      {subjects.length > 0 ? (
        <>
          <SectionHeader title="विषय" />
          <View style={styles.subjectGrid}>
            {subjects.map((s) => (
              <Pressable
                key={s.id}
                style={styles.subjectCard}
                onPress={() => setSubjectId(s.id)}>
                <Text style={styles.subjectName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.subjectMeta}>
                  {`${s.completedCount} / ${s.materialCount} पूर्ण`}
                </Text>
                <View style={styles.bar}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${s.percent}%`, backgroundColor: subjectColor(s.name) },
                    ]}
                  />
                </View>
              </Pressable>
            ))}
          </View>
          <View style={styles.gapLg} />
        </>
      ) : null}

      {total === 0 ? (
        <EmptyState
          icon="library-outline"
          message="अजून एकही साहित्य प्रकाशित झालेलं नाही. नवीन आलं की इथे दिसेल."
        />
      ) : (
        <>
          {/* ── गाळण्या ── */}
          <FilterChips
            chips={TYPE_CHIPS.map((c) => ({ key: c.key, label: c.label }))}
            active={type}
            onChange={(k) => setType(k as ApiMaterialType | 'all')}
          />
          {subjects.length > 0 ? (
            <>
              <View style={styles.gap} />
              <FilterChips chips={subjectChips} active={subjectId} onChange={setSubjectId} />
            </>
          ) : null}

          <SectionHeader title="साहित्य" />

          {list.loading ? (
            <Loading label="यादी आणतोय…" />
          ) : list.error ? (
            <ErrorState message={list.error} onRetry={list.reload} />
          ) : (list.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon="search-outline"
              message="या गाळणीत काहीच नाही. दुसरा प्रकार किंवा विषय निवडून बघा."
            />
          ) : (
            <View style={styles.list}>
              {list.data!.map((m) => (
                <MaterialRow key={m.id} material={m} />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.count}>
      <Text style={styles.countValue}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  );
}

/**
 * एका साहित्याची ओळ.
 *
 * दाबल्यावर दुवा **बाहेरच्या browser मध्ये** उघडतो. PDF आणि YouTube app मध्ये
 * दाखवण्यासाठी वेगळे viewers लागतील; तोपर्यंत बाहेर पाठवणं प्रामाणिक आहे —
 * आतच अर्धवट उघडून तुटण्यापेक्षा.
 */
/**
 * साहित्य उघडणे.
 *
 * उघडल्याची नोंद server ला पाठवतो, पण **तिची वाट बघत नाही** — नोंद ठेवणं हे
 * दुय्यम काम आहे; ते अडलं म्हणून दुवा उघडायचा थांबवणं चुकीचं ठरेल.
 *
 * टक्केवारीचा अंदाज लावत नाही: PDF/YouTube बाहेर उघडतो, त्यामुळे विद्यार्थी
 * किती वाचला हे app ला कळतच नाही. म्हणून फक्त "उघडलं" एवढंच (1%) नोंदवतो.
 * खरी टक्केवारी app मध्येच viewer आल्यावरच शक्य आहे.
 */
function openMaterial(id: string, url: string) {
  void api.saveMaterialProgress(id, 1).catch(() => {});
  void Linking.openURL(url);
}

/** "पुढे सुरू ठेवा" मधली ओळ — प्रगतीच्या पट्टीसह. */
function ContinueRow({ item }: { item: ApiLearnOverview['continueLearning'][number] }) {
  const tint = item.subjectName ? subjectColor(item.subjectName) : colors.primary;

  return (
    <Pressable style={styles.row} onPress={() => openMaterial(item.id, item.url)}>
      <View style={[styles.rowIcon, { backgroundColor: colors.primaryLight }]}>
        <Icon name={TYPE_ICON[item.type]} size={18} color={tint} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.bar}>
          <View
            style={[styles.barFill, { width: `${item.percent}%`, backgroundColor: tint }]}
          />
        </View>
        <Text style={styles.rowMeta}>{`${item.percent}% झालं`}</Text>
      </View>
      <Icon name="play-circle" size={20} color={colors.primary} />
    </Pressable>
  );
}

function MaterialRow({ material }: { material: ApiMaterial }) {
  const tint = material.subjectName ? subjectColor(material.subjectName) : colors.primary;

  const meta = [
    material.subjectName,
    material.durationSeconds ? `${Math.round(material.durationSeconds / 60)} मिनिटं` : null,
    material.pageCount ? `${material.pageCount} पानं` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable style={styles.row} onPress={() => openMaterial(material.id, material.url)}>
      <View style={[styles.rowIcon, { backgroundColor: colors.primaryLight }]}>
        <Icon name={TYPE_ICON[material.type]} size={18} color={tint} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {material.title}
        </Text>
        {material.description ? (
          <Text style={styles.rowDesc} numberOfLines={2}>
            {material.description}
          </Text>
        ) : null}
        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
      </View>
      <Icon name="open-outline" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headingXL,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyM,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  gap: { height: spacing.sm },
  gapLg: { height: spacing.lg },

  hero: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  heroText: { gap: spacing.xs },
  heroTitle: {
    ...typography.titleL,
    ...strong.bold,
    color: colors.text,
  },
  heroNote: {
    ...componentType.cardDescription,
    color: colors.textSecondary,
  },

  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  subjectCard: {
    // दोन प्रति ओळ: पूर्ण रुंदीतून मधली फट वजा करून निम्मं.
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadow.card,
  },
  subjectName: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  subjectMeta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
  bar: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },

  summary: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  count: { flex: 1, alignItems: 'center' },
  countValue: {
    ...typography.titleL,
    ...strong.bold,
    color: colors.primary,
  },
  countLabel: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },

  list: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  rowDesc: {
    ...componentType.cardDescription,
    color: colors.textSecondary,
  },
  rowMeta: {
    ...componentType.smallLabel,
    color: colors.textSecondary,
  },
});
