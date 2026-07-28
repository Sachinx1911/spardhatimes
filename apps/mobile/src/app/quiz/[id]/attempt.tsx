import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { attemptQuestions, testInProgress } from '@/data/mock';
import { colors, radius, shadow, spacing, typography } from '@/theme/tokens';

/**
 * Test सोडवण्याची screen.
 *
 * ⚠️ **Mockup मध्ये प्रश्नाखाली Explanation दाखवलं आहे — इथे मुद्दाम नाही.**
 * Timer चालू असताना बरोबर उत्तराचा खुलासा दाखवला तर प्रत्येक विद्यार्थी पैकीच्या
 * पैकी गुण मिळवेल. खुलासा फक्त निकालाच्या "Review Answers" मध्ये. पुढे API सुद्धा
 * test सुरू असताना `correctAnswer`/`explanation` पाठवणार नाही.
 */

type Mark = 'answered' | 'review' | 'unanswered';

export default function AttemptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const questions = attemptQuestions;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState((testInProgress?.durationMinutes ?? 30) * 60);

  // सोपं घड्याळ — प्रत्येक सेकंदाला एक टिक. खरा attempt येईल तेव्हा हे server
  // वेळेशी जुळवावं लागेल, नाहीतर app बंद करून वेळ वाचवता येईल.
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const current = questions[index];
  const chosen = answers[current.id];

  const marks = useMemo<Mark[]>(
    () =>
      questions.map((q) =>
        review[q.id] ? 'review' : answers[q.id] ? 'answered' : 'unanswered'
      ),
    [questions, answers, review]
  );

  const answeredCount = marks.filter((m) => m === 'answered').length;
  const reviewCount = marks.filter((m) => m === 'review').length;
  const progress = (index + 1) / questions.length;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── वरची पट्टी ── */}
      <View style={styles.topBar}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.testTitle} numberOfLines={1}>
          {testInProgress?.title ?? 'Test'}
        </Text>
        <View style={styles.timer}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={styles.timerText}>{`${mm}:${ss}`}</Text>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* ── प्रगती ── */}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>
          {'Question '}
          <Text style={styles.progressStrong}>{index + 1}</Text>
          {` / ${questions.length}`}
        </Text>
        <Pressable
          style={styles.bookmark}
          hitSlop={8}
          onPress={() => setReview((r) => ({ ...r, [current.id]: !r[current.id] }))}>
          <Ionicons
            name={review[current.id] ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={review[current.id] ? colors.warning : colors.textMuted}
          />
          <Text style={styles.bookmarkText}>Bookmark</Text>
        </Pressable>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>

      {/* ── प्रश्न ── */}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{current.text}</Text>

          {current.options.map((opt) => {
            const selected = chosen === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => setAnswers((a) => ({ ...a, [current.id]: opt.key }))}>
                <View style={[styles.optionKey, selected && styles.optionKeySelected]}>
                  <Text style={[styles.optionKeyText, selected && styles.optionKeyTextSelected]}>
                    {opt.key}
                  </Text>
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {opt.text}
                </Text>
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected ? colors.primary : colors.border}
                />
              </Pressable>
            );
          })}

          {/* ── फिरण्याची बटणं ── */}
          <View style={styles.navRow}>
            <Pressable
              style={[styles.navButton, index === 0 && styles.navButtonDisabled]}
              disabled={index === 0}
              onPress={() => setIndex((i) => i - 1)}>
              <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
              <Text style={styles.navButtonText}>Previous</Text>
            </Pressable>

            <Pressable
              hitSlop={8}
              onPress={() =>
                setAnswers((a) => {
                  const next = { ...a };
                  delete next[current.id];
                  return next;
                })
              }>
              <Text style={styles.clearText}>Clear Answer</Text>
            </Pressable>

            <Pressable
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={() =>
                index === questions.length - 1
                  ? router.replace(`/quiz/${testInProgress?.id ?? 'x'}/result`)
                  : setIndex((i) => i + 1)
              }>
              <Text style={styles.navButtonPrimaryText}>
                {index === questions.length - 1 ? 'Finish' : 'Next'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textInverse} />
            </Pressable>
          </View>
        </View>

        {/* ── प्रश्नांची पट्टी ── */}
        <View style={styles.palette}>
          <Pressable style={styles.paletteHeader} onPress={() => setPaletteOpen((o) => !o)}>
            <View style={styles.paletteTitleBox}>
              <Ionicons name="grid-outline" size={16} color={colors.text} />
              <Text style={styles.paletteTitle}>Question Palette</Text>
            </View>
            <Ionicons
              name={paletteOpen ? 'chevron-down' : 'chevron-up'}
              size={16}
              color={colors.textMuted}
            />
          </Pressable>

          <View style={styles.legend}>
            <Legend color={colors.success} label="Answered" />
            <Legend color={colors.warning} label="Review" />
            <Legend color={colors.textFaint} label="Unanswered" />
          </View>

          {paletteOpen ? (
            <View style={styles.paletteGrid}>
              {questions.map((q, i) => {
                const mark = marks[i];
                const isCurrent = i === index;
                return (
                  <Pressable
                    key={q.id}
                    onPress={() => setIndex(i)}
                    style={[
                      styles.paletteCell,
                      mark === 'answered' && styles.cellAnswered,
                      mark === 'review' && styles.cellReview,
                      isCurrent && styles.cellCurrent,
                    ]}>
                    <Text
                      style={[
                        styles.paletteCellText,
                        mark === 'answered' && { color: colors.success },
                        mark === 'review' && { color: colors.warning },
                        isCurrent && { color: colors.primary },
                      ]}>
                      {i + 1}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* ── खालची पट्टी ── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Pressable style={styles.endButton} onPress={() => router.back()}>
          <Ionicons name="close" size={16} color={colors.danger} />
          <Text style={styles.endButtonText}>End Test</Text>
        </Pressable>

        <View style={styles.bottomMiddle}>
          <Text style={styles.bottomCount}>{`${answeredCount} Answered`}</Text>
          {reviewCount > 0 ? (
            <Text style={styles.bottomReview}>{`${reviewCount} Marked for Review`}</Text>
          ) : null}
        </View>

        <Pressable
          style={styles.submitButton}
          onPress={() => router.replace(`/quiz/${testInProgress?.id ?? 'x'}/result`)}>
          <Text style={styles.submitButtonText}>Submit Test</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  testTitle: {
    flex: 1,
    ...typography.h3,
    color: colors.text,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  timerText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  progressStrong: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  bookmark: {
    alignItems: 'center',
  },
  bookmarkText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  track: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },

  body: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'] * 2,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  questionText: {
    ...typography.h3,
    fontSize: 17,
    lineHeight: 25,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionKey: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionKeySelected: {
    backgroundColor: colors.primary,
  },
  optionKeyText: {
    ...typography.micro,
    color: colors.textMuted,
  },
  optionKeyTextSelected: {
    color: colors.textInverse,
  },
  optionText: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  navButtonPrimary: {
    backgroundColor: colors.primary,
  },
  navButtonPrimaryText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textInverse,
  },
  clearText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  palette: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  paletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paletteTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paletteTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  legendText: {
    ...typography.micro,
    fontWeight: '400',
    color: colors.textMuted,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  paletteCell: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cellAnswered: {
    backgroundColor: colors.successSoft,
  },
  cellReview: {
    backgroundColor: colors.warningSoft,
  },
  cellCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  paletteCellText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  endButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.danger,
  },
  bottomMiddle: {
    flex: 1,
    alignItems: 'center',
  },
  bottomCount: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  bottomReview: {
    ...typography.micro,
    fontWeight: '400',
    color: colors.warning,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  submitButtonText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
