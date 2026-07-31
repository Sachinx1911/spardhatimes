// react-navigation हे वेगळं package म्हणून install केलेलं नाही — expo-router 57 ने ते
// आतमध्ये vendor केलं आहे आणि js-tabs मधून पुन्हा export केलं आहे.
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { colors, componentType, layout, radius, spacing } from '@/theme/tokens';

/**
 * Bottom navigation — design sheets मधल्या मापांप्रमाणे: उंची 56dp, icon 24dp,
 * label 11sp, active रंग `colors.primary`.
 *
 * **चार tabs** (ठरलं 2026-08-01, मुख्य पानाच्या design बरोबर). आधी पाच होते —
 * `Home · Learn · Tests · Analytics · Profile` — आणि ते गोठवलेले होते. मुख्य पान
 * आता tiles वर उभं आहे, म्हणून Learn आणि Analytics ला स्वतःचा tab लागत नाही;
 * ते tiles आणि drawer मधून उघडतात. तपशील: `docs/UI_DESIGN_STANDARD.md` §६.
 *
 * ⚠️ Tab bar प्रत्येक screen वर दिसतो, म्हणून तो **एका design sheet मागे बदलायचा
 * नाही**. बदलायचा असेल तर तो स्वतंत्र, जाणीवपूर्वक निर्णय — आणि दोन्ही वेळा तो
 * तसाच घेतला गेला आहे.
 *
 * **सपाट आहे, मधला उंचावलेला button नाही.** Active फक्त रंगाने आणि खालच्या
 * ठिपक्याने ओळखू येतो.
 *
 * Expo चा `NativeTabs` वापरलेला नाही — तो OS चा tab bar दाखवतो, त्यात हा active
 * ठिपका आणि नेमकी 56dp उंची बसवता येत नाही. म्हणून `js-tabs` + हा custom renderer.
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
  // Design मध्ये active tab खाली **लहान दांडी** आहे, ठिपका नाही.
  dot: {
    width: 28,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
