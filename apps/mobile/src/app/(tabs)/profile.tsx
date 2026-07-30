import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { useSession } from '@/lib/session';
import {
  colors,
  componentType,
  layout,
  radius,
  shadow,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * Profile — खातं आणि app ची सेटिंग्ज.
 *
 * नाव, फोन आणि email **session मधून** येतात, नकली data मधून नाहीत — `/auth/me`
 * हे तिन्ही आधीच देतो, त्यामुळे यासाठी वेगळा endpoint लागत नाही.
 *
 * यादीतले दुवे अजून कुठेही नेत नाहीत; त्या screens पुढच्या टप्प्यात.
 */

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  note: string;
  /** उजवीकडे बाणाआधी दाखवायचं मूल्य (उदा. Language = English). */
  value?: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const { user, logout } = useSession();

  const account: MenuItem[] = [
    {
      icon: 'person-outline',
      tint: colors.primary,
      title: 'Personal Information',
      note: 'View and update your personal details',
    },
    {
      icon: 'lock-closed-outline',
      tint: colors.primary,
      title: 'Change Password',
      note: 'Update your account password',
    },
    {
      icon: 'shield-outline',
      tint: colors.primary,
      title: 'Privacy & Security',
      note: 'Manage your privacy and security',
    },
    {
      icon: 'globe-outline',
      tint: colors.primary,
      title: 'Language',
      note: 'Choose your preferred language',
      value: 'English',
    },
  ];

  const support: MenuItem[] = [
    {
      icon: 'headset-outline',
      tint: colors.success,
      title: 'Help & Support',
      note: 'Get help and resolve your queries',
    },
    {
      icon: 'star-outline',
      tint: colors.warning,
      title: 'Rate Us',
      note: 'Share your experience with us',
    },
    {
      icon: 'share-social-outline',
      tint: colors.primary,
      title: 'Share App',
      note: 'Invite your friends to use the app',
    },
    {
      icon: 'information-circle-outline',
      tint: colors.danger,
      title: 'About Us',
      note: 'Learn more about Spardha Times',
    },
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <Ionicons name="settings-outline" size={layout.navIconSize} color={colors.text} />
          <View>
            <Ionicons name="notifications-outline" size={layout.navIconSize} color={colors.text} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── ओळख ── */}
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={44} color={colors.primary} />
        </View>
        <View style={styles.identityText}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name ?? 'विद्यार्थी'}
            </Text>
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </View>
          {user?.phone ? <Text style={styles.contact}>+91 {user.phone}</Text> : null}
          {user?.email ? (
            <Text style={styles.contact} numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}
        </View>
      </View>

      <MenuGroup title="Account" items={account} />
      <MenuGroup title="App & Support" items={support} />

      <Pressable style={styles.logout} onPress={() => void logout()}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </Screen>
  );
}

function MenuGroup({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.group}>
        {items.map((item, i) => (
          <Fragment key={item.title}>
            {/* पहिल्या ओळीवर वरची रेषा नको — ती कार्डाच्या काठाशी दुहेरी दिसते. */}
            {i > 0 ? <View style={styles.divider} /> : null}
            <MenuRow item={item} />
          </Fragment>
        ))}
      </View>
    </>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <Pressable style={styles.row} onPress={item.onPress}>
      {/* रंगाच्या शेवटी 1A = 10% अपारदर्शकता — प्रत्येक छटेसाठी वेगळा token
          ठेवण्यापेक्षा हे icon च्या रंगाशी नेहमी जुळतं. */}
      <View style={[styles.rowIcon, { backgroundColor: `${item.tint}1A` }]}>
        <Ionicons name={item.icon} size={20} color={item.tint} />
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        {/* दोन ओळी — 360dp मध्ये icon आणि बाण वजा जाता "View and update your
            personal details" एका ओळीत बसत नाही, आणि अर्धं वाक्य निरुपयोगी आहे. */}
        <Text style={styles.rowNote} numberOfLines={2}>
          {item.note}
        </Text>
      </View>

      {item.value ? (
        <View style={styles.valueChip}>
          <Text style={styles.valueText}>{item.value}</Text>
        </View>
      ) : null}

      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.headerHeight,
  },
  screenTitle: {
    ...typography.headingXL,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: componentType.badge.fontFamily,
    color: colors.textInverse,
  },

  // ── ओळख ──
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.headingL,
    color: colors.text,
    flexShrink: 1,
  },
  contact: {
    ...typography.bodyM,
    color: colors.textSecondary,
  },

  // ── यादी ──
  groupTitle: {
    ...typography.titleL,
    color: colors.text,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    // Icon च्या रुंदीएवढं आत — रेषा मजकुराखालून सुरू होते, design प्रमाणे.
    marginLeft: spacing.lg + 44 + spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...componentType.cardTitle,
    color: colors.text,
  },
  rowNote: {
    ...componentType.cardDescription,
    color: colors.textSecondary,
  },
  valueChip: {
    height: layout.chipHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  valueText: {
    ...componentType.badge,
    color: colors.primary,
  },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    marginTop: spacing['2xl'],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    ...componentType.buttonText,
    ...strong.semibold,
    color: colors.danger,
  },
});
