import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, Loading } from '@/components/ui/async-state';
import { FilterChips, type FilterChip } from '@/components/ui/filter-chips';
import { MetaPill } from '@/components/ui/meta-pill';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { api, type ApiBookmark } from '@/lib/api';
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
 * **बुकमार्क** — खुणा करून ठेवलेले प्रश्न.
 *
 * हा tab नाही; Home वरच्या "बुकमार्क" tile मागे उघडतो. Tab bar गोठवलेला आहे
 * (पाच tabs, तोच क्रम) — म्हणून सहावा tab जोडलेला नाही.
 *
 * ## उत्तर लगेच दिसतं, लपवलेलं नाही
 *
 * हे प्रश्न विद्यार्थ्याने आधीच सोडवले आहेत आणि निकालाच्या पडद्यावर उत्तरासह
 * पाहिले आहेत — server सुद्धा फक्त तेवढेच देतो. म्हणून इथे "उत्तर दाखवा" असं
 * बटण ठेवण्यात अर्थ नाही; उजळणी करायला आलेल्याला ते लगेच दिसलं पाहिजे.
 */
export default function BookmarksScreen() {
  const router = useRouter();
  const [activeSubject, setActiveSubject] = useState('all');
  const [removing, setRemoving] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi(() => api.bookmarks(), []);
  const bookmarks = data ?? [];

  /**
   * Chips प्रत्यक्ष असलेल्या विषयांवरून — आधी ठरवलेली यादी वापरली असती तर
   * रिकाम्या विषयांचे chips दिसले असते आणि दाबल्यावर काहीच आलं नसतं.
   */
  const subjects = [...new Set(bookmarks.map((b) => b.subject))];
  const chips: FilterChip[] = [
    { key: 'all', label: 'सर्व', icon: 'grid-outline' },
    ...subjects.map((s) => ({ key: s, label: s })),
  ];

  /**
   * निवडलेला विषय यादीत उरला नसेल तर "सर्व" कडे परत.
   *
   * एका विषयाचा शेवटचा प्रश्न काढला की त्याचा chip आपोआप नाहीसा होतो, पण निवड
   * त्याच विषयावर राहते — मग खाली काहीच दिसत नाही आणि का दिसत नाही तेही कळत
   * नाही. `activeSubject` थेट वापरण्याऐवजी हे काढलेलं मूल्य वापरतो; state
   * बदलायला वेगळा effect लागत नाही.
   */
  const effectiveSubject =
    activeSubject !== 'all' && !subjects.includes(activeSubject) ? 'all' : activeSubject;

  const visible =
    effectiveSubject === 'all'
      ? bookmarks
      : bookmarks.filter((b) => b.subject === effectiveSubject);

  /**
   * खूण काढणे.
   *
   * काढल्यावर पूर्ण यादी पुन्हा मागवतो. आशावादी (optimistic) काढणं जास्त झटपट
   * वाटलं असतं, पण मग server ने नकार दिल्यास पडद्यावरचं आणि खरं वेगळं होतं —
   * उजळणीच्या यादीत ती फसवणूक परवडत नाही.
   */
  const remove = async (b: ApiBookmark) => {
    if (removing) return;
    setRemoving(b.questionId);
    try {
      await api.removeBookmark(b.questionId);
      reload();
    } catch (err) {
      Alert.alert('खूण काढता आली नाही', (err as Error).message);
    } finally {
      setRemoving(null);
    }
  };

  if (loading) return <Loading label="बुकमार्क आणतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <Screen>
      {/* ── शीर्षक ── */}
      <View style={styles.header}>
        {/* थेट या पत्त्यावर आलं तर इतिहासच नसतो आणि `back()` ला जागा नसते. */}
        <Pressable
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>बुकमार्क</Text>
          <Text style={styles.subtitle}>
            {bookmarks.length
              ? `${bookmarks.length} प्रश्न उजळणीसाठी साठवलेले`
              : 'उजळणीसाठी साठवलेले प्रश्न'}
          </Text>
        </View>
      </View>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          message={
            'अजून एकही प्रश्न खुणलेला नाही.\n\nTest सोडवल्यावर निकालाच्या पडद्यावर ' +
            'प्रत्येक प्रश्नापुढे खुणेचं चिन्ह असतं — तिथून साठवा.'
          }
        />
      ) : (
        <>
          <FilterChips chips={chips} active={effectiveSubject} onChange={setActiveSubject} />

          <View style={styles.list}>
            {visible.map((b) => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                removing={removing === b.questionId}
                onRemove={() => remove(b)}
              />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

/**
 * एका खुणलेल्या प्रश्नाचं कार्ड.
 *
 * `correctAnswer` एकापेक्षा जास्त असू शकतो (MULTIPLE_CHOICE ला "A,C"), म्हणून
 * एका अक्षराशी तुलना करत नाही — यादी करून तपासतो. नाहीतर बहु-पर्यायी प्रश्नात
 * फक्त पहिलं उत्तर बरोबर दिसलं असतं.
 */
function BookmarkCard({
  bookmark,
  removing,
  onRemove,
}: {
  bookmark: ApiBookmark;
  removing: boolean;
  onRemove: () => void;
}) {
  const correct = bookmark.correctAnswer.split(',').map((k) => k.trim());
  const tint = subjectColor(bookmark.subject);

  return (
    <View style={styles.card}>
      {/* ── वरची ओळ: विषय + खूण काढायचं बटण ── */}
      <View style={styles.cardTop}>
        <View style={[styles.subjectPill, { backgroundColor: `${tint}1A` }]}>
          <Text style={[styles.subjectText, { color: tint }]}>{bookmark.subject}</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={onRemove}
          disabled={removing}
          // काढताना अर्धपारदर्शक — दाबलं गेलं हे कळावं, पण कार्ड उडी मारू नये.
          style={removing ? styles.removingIcon : undefined}>
          <Ionicons name="bookmark" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <Text style={styles.questionText}>{bookmark.text}</Text>

      {/* ── पर्याय ── */}
      <View style={styles.options}>
        {bookmark.options.map((o) => {
          const isCorrect = correct.includes(o.key);
          return (
            <View key={o.key} style={[styles.option, isCorrect && styles.optionCorrect]}>
              <View style={[styles.optionKey, isCorrect && styles.optionKeyCorrect]}>
                <Text style={[styles.optionKeyText, isCorrect && styles.optionKeyTextCorrect]}>
                  {o.key}
                </Text>
              </View>
              <Text style={[styles.optionText, isCorrect && styles.optionTextCorrect]}>
                {o.text}
              </Text>
              {isCorrect ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              ) : null}
            </View>
          );
        })}
      </View>

      {/* ── खुलासा ── */}
      {bookmark.explanation ? (
        <View style={styles.explanation}>
          <Text style={styles.explanationLabel}>स्पष्टीकरण</Text>
          <Text style={styles.explanationText}>{bookmark.explanation}</Text>
        </View>
      ) : null}

      {/* ── कुठून आला ── */}
      <View style={styles.meta}>
        <MetaPill icon="document-text-outline" label={bookmark.testTitle} />
        {bookmark.seriesTitle ? <Tag label={bookmark.seriesTitle} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.headingXL,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },

  // ── यादी ──
  list: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  subjectPill: {
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
  },
  subjectText: {
    ...componentType.badge,
  },
  removingIcon: {
    opacity: 0.4,
  },
  questionText: {
    ...typography.bodyL,
    ...strong.semibold,
    color: colors.text,
  },

  // ── पर्याय ──
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionCorrect: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  optionKey: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionKeyCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  optionKeyText: {
    ...componentType.badge,
    color: colors.textSecondary,
  },
  optionKeyTextCorrect: {
    color: colors.textInverse,
  },
  optionText: {
    // पर्यायाचा मजकूर लांब असतो; `flex: 1` शिवाय तो कार्डाबाहेर जातो.
    flex: 1,
    ...typography.bodyM,
    color: colors.text,
  },
  optionTextCorrect: {
    ...strong.semibold,
  },

  // ── खुलासा ──
  explanation: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  explanationLabel: {
    ...componentType.badge,
    color: colors.primary,
  },
  explanationText: {
    ...typography.bodyM,
    color: colors.text,
  },

  // ── तळ ──
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
