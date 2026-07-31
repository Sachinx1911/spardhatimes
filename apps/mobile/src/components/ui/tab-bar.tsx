// react-navigation हे वेगळं package म्हणून install केलेलं नाही — expo-router 57 ने ते
// आतमध्ये vendor केलं आहे आणि js-tabs मधून पुन्हा export केलं आहे.
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { colors, componentType, layout, radius, spacing } from '@/theme/tokens';

/**
 * Bottom navigation — design system sheet मधल्या मापांप्रमाणे: उंची 74dp,
 * icon 24dp, label 12, active #EF4444, निष्क्रिय #6B7280, खाली 3dp दांडी.
 *
 * **चार tabs:** Home · My Course · Free Test · Profile.
 *
 * Sheet मध्ये तिसरा "Chat Help" दाखवला आहे, पण **"Free Test" ठरलं आहे** — ते
 * sheet नंतर स्पष्ट सांगितलं गेलं. Chat ला schema मध्ये एकही model नाही;
 * Free Test मात्र आजच्या data वर चालतो (किंमत ० असलेल्या series).
 *
 * Expo चा `NativeTabs` वापरलेला नाही — तो OS चा tab bar दाखवतो, त्यात ही दांडी
 * आणि नेमकी उंची बसवता येत नाही. म्हणून `js-tabs` + हा custom renderer.
 */
const ICONS: Record<string, { on: string; off: string }> = {
  index: { on: 'home', off: 'home-outline' },
  tests: { on: 'school', off: 'school-outline' },
  'free-test': { on: 'sparkles', off: 'sparkles' },
  profile: { on: 'person-circle', off: 'person-circle-outline' },
};

const LABELS: Record<string, string> = {
  index: 'Home',
  // Route चं नाव `tests` तसंच ठेवलं — तेच पान, फक्त design मधलं नाव वेगळं.
  // Route बदलली असती तर प्रत्येक `router.push('/tests')` शोधून बदलावी लागली असती.
  tests: 'My Course',
  'free-test': 'Free Test',
  profile: 'Profile',
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, layout.safeAreaBottom) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icon = ICONS[route.name];
        if (!icon) return null;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="tab">
            <Icon
              name={focused ? icon.on : icon.off}
              size={layout.navIconSize}
              color={focused ? colors.primary : colors.navInactive}
            />
            <Text style={[styles.label, focused && styles.labelActive]}>{LABELS[route.name]}</Text>
            {/* Active tab खाली दांडी — sheet मध्ये तोच फरक दाखवतो. */}
            <View style={[styles.dot, focused && styles.dotActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    // 74dp ही bar ची स्वतःची उंची; safe area त्याखाली वेगळी जोडली जाते.
    height: layout.bottomNavHeight,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    ...componentType.navLabel,
    color: colors.navInactive,
  },
  labelActive: {
    color: colors.primary,
  },
  // Sheet: active tab खाली 3dp दांडी, ठिपका नाही.
  dot: {
    width: 28,
    height: layout.navIndicatorHeight,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
