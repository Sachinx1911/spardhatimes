import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import {
  colors,
  componentType,
  gradients,
  layout,
  marathi,
  radius,
  spacing,
  typography,
} from '@/theme/tokens';

/**
 * बाजूने उघडणारा menu.
 *
 * खालच्या पट्टीत आता चारच tabs आहेत (Home · My Course · Free Test · Profile).
 * आधी Learn, Analytics आणि Current Affairs हे tabs होते; ते काढल्यावर **Analytics
 * आणि Bookmarks ला एकही मार्ग उरत नव्हता** — मुख्य पानावरच्या tiles मध्ये ते
 * नाहीत. पानं अस्तित्वात असून पोहोचता येत नाही ही सर्वात वाईट अवस्था, म्हणून
 * हा menu.
 *
 * `Modal` वापरला आहे, वेगळी navigation library नाही — एका overlay साठी पूर्ण
 * drawer navigator जोडणं जड झालं असतं.
 */

interface Item {
  label: string;
  note: string;
  icon: string;
  href: string;
}

const ITEMS: Item[] = [
  { label: 'अभ्यास साहित्य', note: 'नोट्स, व्हिडिओ, PYQ', icon: 'book', href: '/learn' },
  { label: 'चालू घडामोडी', note: 'रोजच्या घडामोडी', icon: 'newspaper', href: '/current-affairs' },
  { label: 'प्रगती', note: 'तुमचं विश्लेषण', icon: 'stats-chart', href: '/analytics' },
  { label: 'बुकमार्क', note: 'जतन केलेलं', icon: 'bookmark', href: '/bookmarks' },
  { label: 'टेस्ट सिरीज खरेदी', note: 'सगळ्या सिरीज', icon: 'bag-handle', href: '/store' },
];

export function Drawer({
  open,
  onClose,
  name,
}: {
  open: boolean;
  onClose: () => void;
  name?: string | null;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const go = (href: string) => {
    onClose();
    router.push(href as never);
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      {/* बाजूला दाबलं की बंद — मागे जाण्याचं बटण नसलेल्या फोनवर हाच मार्ग. */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={gradients.appBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.head, { paddingTop: insets.top + spacing.xl }]}>
            <View style={styles.avatar}>
              <Icon name="person" size={26} color={colors.textInverse} />
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {name || 'विद्यार्थी'}
            </Text>
            <Text style={styles.tagline}>Your Success, Our Mission</Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.list}>
            {ITEMS.map((it) => (
              <Pressable key={it.href} style={styles.item} onPress={() => go(it.href)}>
                <View style={styles.itemIcon}>
                  <Icon name={it.icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemLabel}>{it.label}</Text>
                  <Text style={styles.itemNote}>{it.note}</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flexDirection: 'row',
  },
  panel: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderTopRightRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: 'hidden',
  },

  head: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.titleL,
    ...marathi.semibold,
    color: colors.textInverse,
  },
  tagline: {
    ...componentType.smallLabel,
    color: 'rgba(255,255,255,0.85)',
  },

  list: { padding: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1 },
  itemLabel: {
    ...componentType.cardTitle,
    ...marathi.semibold,
    color: colors.text,
  },
  itemNote: {
    ...componentType.smallLabel,
    ...marathi.regular,
    color: colors.textSecondary,
  },
});
