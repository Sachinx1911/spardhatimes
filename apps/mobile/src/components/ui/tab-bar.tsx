import { Ionicons } from '@expo/vector-icons';
// react-navigation हे वेगळं package म्हणून install केलेलं नाही — expo-router 57 ने ते
// आतमध्ये vendor केलं आहे आणि js-tabs मधून पुन्हा export केलं आहे.
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadow, spacing, typography } from '@/theme/tokens';

/**
 * Mockups मधला bottom tab bar.
 *
 * Expo चा `NativeTabs` वापरलेला नाही — तो OS चा native tab bar दाखवतो आणि मधला
 * उंचावलेला "Tests" गोल button त्यात बसत नाही. म्हणून `js-tabs` + हा custom renderer.
 *
 * Mockups मध्ये tab bar तीन वेगवेगळ्या क्रमाने दिसतो (कुठे Live Classes, कुठे Learn;
 * कुठे Profile च्या जागी avatar). इथे एकच क्रम ठरवला आहे — तोच सगळीकडे वापरायचा.
 */
const ICONS: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }> = {
  index: { on: 'home', off: 'home-outline' },
  learn: { on: 'book', off: 'book-outline' },
  tests: { on: 'clipboard', off: 'clipboard-outline' },
  analytics: { on: 'stats-chart', off: 'stats-chart-outline' },
  profile: { on: 'person', off: 'person-outline' },
};

const LABELS: Record<string, string> = {
  index: 'Home',
  learn: 'Learn',
  tests: 'Tests',
  analytics: 'Analytics',
  profile: 'Profile',
};

/** मधला tab उंचावलेला असतो — mockups मध्ये तो नेहमी Tests आहे. */
const RAISED = 'tests';

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icon = ICONS[route.name];
        if (!icon) return null;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (route.name === RAISED) {
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="tab">
              <View style={styles.raisedSlot}>
                <View style={styles.raised}>
                  <Ionicons name={icon.on} size={22} color={colors.textInverse} />
                </View>
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{LABELS[route.name]}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="tab">
            <Ionicons
              name={focused ? icon.on : icon.off}
              size={22}
              color={focused ? colors.primary : colors.textFaint}
            />
            <Text style={[styles.label, focused && styles.labelActive]}>{LABELS[route.name]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    ...shadow.raised,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  // गोल button इतर tabs च्या icon एवढीच (22px) जागा घेतो, म्हणून सगळ्या tabs चे
  // labels एका रेषेत राहतात.
  raisedSlot: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raised: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // वर उचलून bar च्या काठाबाहेर काढतो — negative margin ने layout ची उंची बदलली
    // असती आणि label गोलात घुसला असता.
    transform: [{ translateY: -14 }],
    ...shadow.card,
  },
  label: {
    ...typography.micro,
    color: colors.textFaint,
  },
  labelActive: {
    color: colors.primary,
  },
});
