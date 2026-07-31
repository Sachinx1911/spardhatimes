import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ErrorState, Loading } from '@/components/ui/async-state';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Screen } from '@/components/ui/screen';
import { api, type ApiResultAnswer } from '@/lib/api';
import { useSession } from '@/lib/session';
import { useApi } from '@/lib/use-api';
import { colors, radius, shadow, spacing, typography, strong } from '@/theme/tokens';

/**
 * निकाल.
 *
 * बरोबर उत्तरं आणि खुलासा **इथे** दाखवायचे — attempt screen वर नाहीत (तिथे दाखवले
 * तर test फुकट जातो). "Review Answers" प्रत्येक प्रश्नाचा खुलासा उघडेल.
 *
 * Mockup मधली "Unlock All Test Series / Go Premium" पट्टी वगळली आहे — subscription
 * नाही असं ठरलं आहे; विक्री per-series आहे.
 */
export default function ResultScreen() {
  const router = useRouter();
  const { user } = useSession();

  /**
   * URL मधला `id` हा **attempt चा** आहे, quiz चा नाही — submit झाल्यावर
   * `router.replace('/quiz/<attemptId>/result')` असं पाठवलं जातं. एकाच test चे
   * अनेक attempts असू शकतात, त्यामुळे निकाल attempt नेच ओळखावा लागतो.
   */
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: r, loading, error, reload } = useApi(() => api.attemptResult(id), [id]);

  /**
   * उजळणी सुरुवातीला बंद.
   *
   * निकालाचा पडदा उघडल्याबरोबर सगळे प्रश्न आणि उत्तरं दिसली तर वरचे आकडे —
   * गुण, टक्केवारी, विषयवार कामगिरी — खाली ढकलले जातात. आधी "मला किती मिळाले",
   * मग "कुठे चुकलं".
   */
  const [reviewing, setReviewing] = useState(false);

  /**
   * कोणते प्रश्न आधीच खुणलेले आहेत — या quiz चा **एकच** फेरा. प्रत्येक प्रश्नाला
   * वेगळी विनंती केली असती तर 100 प्रश्नांच्या test वर 100 फेऱ्या झाल्या असत्या.
   *
   * `quizId` निकाल आल्यावरच कळतो, म्हणून पहिल्या render ला तो नसतो. `useApi`
   * बिनशर्त चालतो, त्यामुळे रिकामा id पाठवला तर `/bookmarks/quiz/` वर 404 जातो —
   * निरुपयोगी फेरी. तोपर्यंत रिकामी यादी परत करतो; id आला की deps बदलून खरी
   * विनंती जाते.
   */
  const { data: markedList } = useApi(
    () => (r?.quizId ? api.bookmarkedInQuiz(r.quizId) : Promise.resolve<string[]>([])),
    [r?.quizId]
  );

  /**
   * Server ची यादी स्थानिक state मध्ये **उतरवलेली नाही.**
   *
   * तसं केलं असतं तर "यादी आली की state भर" असा effect लागला असता, आणि तो
   * cascading renders करतो (eslint `react-hooks/set-state-in-effect` तेच सांगतो).
   * त्याऐवजी इथे फक्त *या* पडद्यावर केलेले बदल ठेवतो आणि खरी अवस्था दोन्ही
   * मिळून काढतो — बदल असेल तर तो, नाहीतर server काय म्हणतो ते.
   */
  const [changed, setChanged] = useState<Map<string, boolean>>(new Map());
  const [toggling, setToggling] = useState<string | null>(null);

  const isMarked = (questionId: string) =>
    changed.get(questionId) ?? (markedList?.includes(questionId) ?? false);

  const toggleBookmark = async (questionId: string) => {
    if (toggling) return;
    setToggling(questionId);
    const was = isMarked(questionId);
    try {
      if (was) await api.removeBookmark(questionId);
      else await api.addBookmark(questionId);

      setChanged((prev) => new Map(prev).set(questionId, !was));
    } catch (err) {
      // Server ने नकार दिला तर चिन्ह बदलत नाही — पडद्यावरचं आणि खरं वेगळं होऊ
      // देण्यापेक्षा स्पष्ट संदेश बरा.
      Alert.alert('खूण बदलता आली नाही', (err as Error).message);
    } finally {
      setToggling(null);
    }
  };

  // Test सोडवून झाल्यावर इथे `replace` ने येतो — म्हणजे मागे जायला इतिहासच नसतो
  // आणि सरळ `back()` केलं तर "GO_BACK was not handled" अशी चूक येते. इतिहास असेल
  // तरच मागे, नाहीतर My Tests वर.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/tests'));

  if (loading) return <Loading label="निकाल आणतोय…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!r) return <ErrorState message="हा निकाल सापडला नाही." />;

  const mins = Math.floor(r.timeTakenSeconds / 60);
  const secs = r.timeTakenSeconds % 60;
  const totalMins = Math.round(r.durationSeconds / 60);
  const firstName = user?.name?.split(' ')[0] ?? 'विद्यार्थी';

  return (
    <Screen>
      {/* ── वरची पट्टी ── */}
      <View style={styles.topBar}>
        <Pressable hitSlop={8} onPress={goBack}>
          <Icon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.screenTitle}>Test Result</Text>
        <Pressable hitSlop={8} style={styles.topAction}>
          <Icon name="download-outline" size={18} color={colors.text} />
          <Text style={styles.topActionText}>Download</Text>
        </Pressable>
        <Pressable hitSlop={8} style={styles.topAction}>
          <Icon name="share-social-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      {/* ── कोणता test ── */}
      <View style={styles.testCard}>
        <View style={styles.testIcon}>
          <Icon name="clipboard" size={22} color={colors.primary} />
        </View>
        <View style={styles.testTextBox}>
          <Text style={styles.testTitle}>{r.testTitle}</Text>
          {/* Mockup मध्ये इथे "#GK27124" असा सांकेतिक क्रमांक होता. API तो देत नाही
              आणि तो विद्यार्थ्याच्या कामाचाही नाही — म्हणून फक्त तारीख.
              टिप्पणी `<Text>` च्या **बाहेर** ठेवली आहे: आत ठेवली तर तिच्यामुळे
              Text ला दोन children जातात आणि React "unique key" ची तक्रार करतो. */}
          <Text style={styles.testMeta}>
            {new Date(r.submittedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <View style={styles.completedChip}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>
        <Text style={styles.trophy}>🏆</Text>
      </View>

      {/* ── गुण ── */}
      <Card style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreRingBox}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <ProgressRing
              progress={r.percentage / 100}
              size={104}
              thickness={9}
              color={colors.success}
              label={`${r.percentage}%`}
              sublabel={`${r.score} / ${r.totalMarks}`}
            />
          </View>

          <View style={styles.scoreTextBox}>
            <Text style={styles.congrats}>{`Great Job, ${firstName}! 🎉`}</Text>
            {/* हा test सोडवणारा हा पहिलाच असेल तर percentile निघत नाही — तेव्हा
                "null% of test takers" दाखवण्यापेक्षा गुण सांगायचे. */}
            <Text style={styles.congratsNote}>
              {r.percentile === null
                ? `तुम्ही ${r.totalMarks} पैकी ${r.score} गुण मिळवले.`
                : `You have scored better than ${Math.round(r.percentile)}% of test takers.`}
            </Text>
          </View>
        </View>

        <View style={styles.breakdown}>
          <Breakdown
            icon="checkmark-circle"
            tint={colors.success}
            soft={colors.successLight}
            label="Correct"
            value={r.correct}
            total={r.correct + r.incorrect + r.unattempted}
          />
          <Breakdown
            icon="close-circle"
            tint={colors.error}
            soft={colors.errorLight}
            label="Incorrect"
            value={r.incorrect}
            total={r.correct + r.incorrect + r.unattempted}
          />
          <Breakdown
            icon="remove-circle"
            tint={colors.warning}
            soft={colors.warningLight}
            label="Unattempted"
            value={r.unattempted}
            total={r.correct + r.incorrect + r.unattempted}
          />
          <Breakdown
            icon="time"
            tint={colors.primary}
            soft={colors.primaryLight}
            label="Time Taken"
            valueText={`${mins}m ${secs}s`}
            note={`of ${totalMins}m`}
          />
        </View>
      </Card>

      {/* Design मध्ये इथे "Section / Subject Wise Performance" चा तक्ता होता — तो
          काढला आहे (ठरलेलं). विषयवार कामगिरी एका test पुरती बघण्यापेक्षा सगळ्या
          tests मिळून बघणं उपयोगी, आणि ती जागा Analytics ची. API अजून `subjects`
          देतो — तो तिथे वापरायचा आहे, म्हणून backend मधून काढलेला नाही. */}

      {/* ── वेळ आणि कल ── */}
      <View style={styles.gap} />
      <View style={styles.chartsRow}>
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Time Analysis</Text>
          <View style={styles.timeRingBox}>
            <ProgressRing
              progress={r.timeTakenSeconds / r.durationSeconds}
              size={92}
              thickness={9}
              color={colors.primary}
              label={`${mins}m`}
              sublabel={`${secs}s`}
            />
          </View>
          <Text style={styles.chartNote}>{`वापरलेला वेळ — एकूण ${totalMins} मिनिटांपैकी`}</Text>
        </Card>

        {/* Design मध्ये इथे "Accuracy Trend" चा आलेख होता — मागच्या पाच tests
            मधली कामगिरी. तो एका attempt च्या निकालातून काढता येत नाही; त्यासाठी
            विद्यार्थ्याच्या सगळ्या attempts चा endpoint लागेल, जो Analytics
            (टप्पा D) मध्ये येईल. तोपर्यंत रिकामं कार्ड दाखवण्यापेक्षा वगळलं आहे. */}
      </View>

      {/* ── कृती ── */}
      <View style={styles.gap} />
      <View style={styles.actions}>
        <Pressable style={styles.outlineAction} onPress={() => setReviewing((v) => !v)}>
          <Icon
            name={reviewing ? 'chevron-up' : 'reader-outline'}
            size={16}
            color={colors.primary}
          />
          <Text style={styles.outlineActionText}>
            {reviewing ? 'उजळणी बंद करा' : 'Review Answers'}
          </Text>
        </Pressable>
        <Pressable style={styles.primaryAction}>
          <Icon name="refresh" size={16} color={colors.textInverse} />
          <Text style={styles.primaryActionText}>Re-attempt Test</Text>
        </Pressable>
      </View>

      {/* ── उजळणी ── */}
      {reviewing ? (
        <View style={styles.review}>
          {r.answers.map((a, i) => (
            <ReviewRow
              key={a.questionId}
              index={i + 1}
              answer={a}
              bookmarked={isMarked(a.questionId)}
              busy={toggling === a.questionId}
              onToggle={() => toggleBookmark(a.questionId)}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

/**
 * उजळणीतली एक ओळ — प्रश्न, चारही पर्याय, आणि खुलासा.
 *
 * `correctAnswer` बहु-पर्यायी प्रश्नात "A,C" असतो, म्हणून एका अक्षराशी तुलना करत
 * नाही. विद्यार्थ्याच्या उत्तरालाही तेच लागू.
 */
function ReviewRow({
  index,
  answer,
  bookmarked,
  busy,
  onToggle,
}: {
  index: number;
  answer: ApiResultAnswer;
  bookmarked: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  const correct = answer.correctAnswer.split(',').map((k) => k.trim());
  const chosen = (answer.chosenOption ?? '').split(',').map((k) => k.trim()).filter(Boolean);

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={styles.reviewNumberRow}>
          <Text style={styles.reviewNumber}>{`प्रश्न ${index}`}</Text>
          {/* न सोडवलेला प्रश्न "चूक" म्हणून दाखवणं दिशाभूल करणारं — तिसरी अवस्था. */}
          <View
            style={[
              styles.reviewChip,
              chosen.length === 0
                ? styles.reviewChipSkipped
                : answer.isCorrect
                  ? styles.reviewChipCorrect
                  : styles.reviewChipWrong,
            ]}>
            <Text
              style={[
                styles.reviewChipText,
                chosen.length === 0
                  ? styles.reviewChipTextSkipped
                  : answer.isCorrect
                    ? styles.reviewChipTextCorrect
                    : styles.reviewChipTextWrong,
              ]}>
              {chosen.length === 0 ? 'सोडवला नाही' : answer.isCorrect ? 'बरोबर' : 'चूक'}
            </Text>
          </View>
        </View>
        <Pressable
          hitSlop={8}
          onPress={onToggle}
          disabled={busy}
          style={busy ? styles.reviewBusy : undefined}>
          <Icon
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <Text style={styles.reviewQuestion}>{answer.text}</Text>

      <View style={styles.reviewOptions}>
        {answer.options.map((o) => {
          const isCorrect = correct.includes(o.key);
          const isChosen = chosen.includes(o.key);
          return (
            <View
              key={o.key}
              style={[
                styles.reviewOption,
                isCorrect && styles.reviewOptionCorrect,
                // चुकीचं निवडलेलं उत्तर लाल — बरोबरचं हिरवं तसंच राहतं, म्हणजे
                // "मी काय दिलं" आणि "बरोबर काय" दोन्ही एकाच नजरेत दिसतं.
                !isCorrect && isChosen && styles.reviewOptionWrong,
              ]}>
              <Text style={styles.reviewOptionKey}>{o.key}</Text>
              <Text style={styles.reviewOptionText}>{o.text}</Text>
              {isCorrect ? (
                <Icon name="checkmark-circle" size={16} color={colors.success} />
              ) : isChosen ? (
                <Icon name="close-circle" size={16} color={colors.danger} />
              ) : null}
            </View>
          );
        })}
      </View>

      {answer.explanation ? (
        <View style={styles.reviewExplanation}>
          <Text style={styles.reviewExplanationLabel}>स्पष्टीकरण</Text>
          <Text style={styles.reviewExplanationText}>{answer.explanation}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Breakdown({
  icon,
  tint,
  soft,
  label,
  value,
  total,
  valueText,
  note,
}: {
  icon: string;
  tint: string;
  soft: string;
  label: string;
  value?: number;
  total?: number;
  valueText?: string;
  note?: string;
}) {
  const pct = value !== undefined && total ? Math.round((value / total) * 100) : null;
  return (
    <View style={[styles.breakdownBox, { backgroundColor: soft }]}>
      <View style={styles.breakdownTop}>
        <Icon name={icon} size={14} color={tint} />
        <Text style={styles.breakdownLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.breakdownValue}>{valueText ?? value}</Text>
      <Text style={styles.breakdownNote}>{note ?? (pct !== null ? `${pct}%` : '')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  screenTitle: {
    flex: 1,
    ...typography.titleL,
    color: colors.text,
  },
  topAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  topActionText: {
    ...typography.bodyS,
    color: colors.text,
  },

  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  testIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testTextBox: {
    flex: 1,
    gap: spacing.xs,
  },
  testTitle: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.text,
  },
  testMeta: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  completedChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  completedText: {
    ...typography.caption,
    color: colors.success,
  },
  trophy: {
    fontSize: 30,
  },

  scoreCard: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scoreRingBox: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreLabel: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  scoreTextBox: {
    flex: 1,
    gap: spacing.xs,
  },
  congrats: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.success,
  },
  congratsNote: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },

  breakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  breakdownBox: {
    // दोन ओळींत चार चौकोन — मधलं अंतर वजा करून थोडी कमी रुंदी.
    width: '47.5%',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  breakdownTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breakdownLabel: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
  },
  breakdownValue: {
    ...typography.headingL,
    fontSize: 22,
    color: colors.text,
  },
  breakdownNote: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.textSecondary,
  },

  chartsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chartCard: {
    flex: 1,
    gap: spacing.md,
    alignItems: 'center',
  },
  chartTitle: {
    ...typography.bodyL, ...strong.semibold,
    color: colors.text,
    alignSelf: 'flex-start',
  },
  timeRingBox: {
    alignItems: 'center',
  },
  chartNote: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  outlineAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  outlineActionText: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.primary,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  primaryActionText: {
    ...typography.bodyS,
    fontWeight: '600',
    color: colors.textInverse,
  },

  gap: {
    height: spacing.lg,
  },

  // ── उजळणी ──
  review: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    // प्रश्न क्रमांक + अवस्थेचा chip मिळून bookmark चिन्हाला ढकलू नयेत.
    flex: 1,
  },
  reviewNumber: {
    ...typography.bodyS,
    ...strong.semibold,
    color: colors.textSecondary,
  },
  reviewChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  reviewChipCorrect: {
    backgroundColor: colors.successLight,
  },
  reviewChipWrong: {
    backgroundColor: colors.dangerLight,
  },
  reviewChipSkipped: {
    backgroundColor: colors.background,
  },
  reviewChipText: {
    ...typography.caption,
    ...strong.medium,
  },
  reviewChipTextCorrect: {
    color: colors.success,
  },
  reviewChipTextWrong: {
    color: colors.danger,
  },
  reviewChipTextSkipped: {
    color: colors.textSecondary,
  },
  reviewBusy: {
    opacity: 0.4,
  },
  reviewQuestion: {
    ...typography.bodyL,
    ...strong.semibold,
    color: colors.text,
  },
  reviewOptions: {
    gap: spacing.sm,
  },
  reviewOption: {
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
  reviewOptionCorrect: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  reviewOptionWrong: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  reviewOptionKey: {
    ...typography.bodyM,
    ...strong.semibold,
    color: colors.textSecondary,
    // चारही ओळींतली अक्षरं एकाच रेषेत यावीत म्हणून ठरलेली रुंदी.
    width: 16,
  },
  reviewOptionText: {
    // पर्यायाचा मजकूर लांब असतो; याशिवाय तो कार्डाबाहेर जातो.
    flex: 1,
    ...typography.bodyM,
    color: colors.text,
  },
  reviewExplanation: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  reviewExplanationLabel: {
    ...typography.caption,
    ...strong.semibold,
    color: colors.primary,
  },
  reviewExplanationText: {
    ...typography.bodyM,
    color: colors.text,
  },
});
