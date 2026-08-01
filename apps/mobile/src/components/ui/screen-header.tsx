import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import {
  colors,
  componentType,
  layout,
  radius,
  spacing,
} from '@/theme/tokens';

/**
 * आतल्या पडद्यांची वरची पट्टी — 56dp, गडद पार्श्वभूमी, पांढरा मजकूर.
 *
 * हीच रचना PDF Notes, Syllabus, MPSC आणि विषय-नोट्स अशा प्रत्येक sheet मध्ये
 * तंतोतंत तीच आहे, फक्त शीर्षक आणि रंग बदलतो. म्हणून एकाच ठिकाणी — नाहीतर
 * एका पडद्यावर बदल केला आणि बाकीचे मागे राहिले असं होतं.
 *
 * `background` प्रत्येक पडदा स्वतःचा देतो, कारण **प्रत्येक screen चा स्वतःचा
 * रंग** असं ठरलं आहे (Home लाल, PDF Notes जांभळा).
 */
export function ScreenHeader({
  title,
  background,
  onBack,
  onMenu,
  onSearch,
  onShare,
  onBookmark,
  bookmarked = false,
  showBell = false,
  badgeCount,
}: {
  title: string;
  background: string;
  /** मागे जायचं बटण. `onMenu` दिला असेल तर हे वगळायचं. */
  onBack?: () => void;
  /** ☰ — मुख्य पडद्यांवर मागे जाण्याऐवजी हे येतं. */
  onMenu?: () => void;
  onSearch?: () => void;
  onShare?: () => void;
  /** खूण करायचं बटण. `bookmarked` ने भरलेलं की रिकामं ते ठरतं. */
  onBookmark?: () => void;
  bookmarked?: boolean;
  showBell?: boolean;
  badgeCount?: number;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: background, paddingTop: insets.top }]}>
      <View style={styles.row}>
        {onMenu ? (
          <Pressable hitSlop={8} onPress={onMenu}>
            <Icon name="menu" size={24} color={colors.textInverse} />
          </Pressable>
        ) : onBack ? (
          <Pressable hitSlop={8} onPress={onBack}>
            <Icon name="arrow-back" size={24} color={colors.textInverse} />
          </Pressable>
        ) : null}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {onSearch ? (
          <Pressable hitSlop={8} onPress={onSearch}>
            <Icon name="search" size={24} color={colors.textInverse} />
          </Pressable>
        ) : null}

        {onBookmark ? (
          <Pressable hitSlop={8} onPress={onBookmark}>
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={colors.textInverse}
            />
          </Pressable>
        ) : null}

        {onShare ? (
          <Pressable hitSlop={8} onPress={onShare}>
            <Icon name="share" size={24} color={colors.textInverse} />
          </Pressable>
        ) : null}

        {showBell ? (
          <Pressable hitSlop={8} style={styles.bell}>
            <Icon name="notifications" size={24} color={colors.textInverse} />
            {badgeCount && badgeCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {},
  row: {
    height: layout.screenHeaderHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
  },
  title: {
    flex: 1,
    ...componentType.screenHeaderTitle,
    color: colors.textInverse,
  },
  bell: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: layout.badgeSmall,
    height: layout.badgeSmall,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...componentType.badgeSmall,
    color: colors.textInverse,
  },
});
