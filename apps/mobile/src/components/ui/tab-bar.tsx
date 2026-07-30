import { Ionicons } from '@expo/vector-icons';
// react-navigation हे वेगळं package म्हणून install केलेलं नाही — expo-router 57 ने ते
// आतमध्ये vendor केलं आहे आणि js-tabs मधून पुन्हा export केलं आहे.
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, componentType, layout, radius, spacing } from '@/theme/tokens';

/**
 * Bottom navigation — design sheets मधल्या मापांप्रमाणे: उंची 56dp, icon 24dp,
 * label 11sp, active रंग #4F46E5.
 *
 * **सपाट आहे, मधला उंचावलेला button नाही.** आधीच्या mockups मध्ये "Tests" गोलात
 * उचललेला दिसत होता, पण तिन्ही नवीन design sheets मध्ये पाचही tabs सारखेच सपाट
 * आहेत — active फक्त रंगाने आणि खालच्या ठिपक्याने ओळखू येतो.
 *
 * Expo चा `NativeTabs` वापरलेला नाही — तो OS चा tab bar दाखवतो, त्यात हा active
 * ठिपका आणि नेमकी 56dp उंची बसवता येत नाही. म्हणून `js-tabs` + हा custom renderer.
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
            <Ionicons
              name={focused ? icon.on : icon.off}
              size={layout.navIconSize}
              color={focused ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.label, focused && styles.labelActive]}>{LABELS[route.name]}</Text>
            {/* Active tab खाली लहान ठिपका — sheets मध्ये तोच फरक दाखवतो. */}
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
    // 56dp ही bar ची स्वतःची उंची; safe area त्याखाली वेगळी जोडली जाते.
    height: layout.bottomNavHeight,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    ...componentType.navLabel,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
