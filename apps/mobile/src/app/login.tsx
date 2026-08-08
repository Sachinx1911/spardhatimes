import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import {
  colors,
  componentType,
  layout,
  radius,
  spacing,
  strong,
  typography,
} from '@/theme/tokens';

/**
 * Login — mobile + password.
 *
 * ठरलं आहे: विद्यार्थी **मोबाइल क्रमांक + password** ने आत येतात, OTP नाही.
 * यशस्वी झाल्यावर `SessionProvider` मधला `user` भरतो, आणि `_layout` चा gate
 * आपोआप tabs कडे नेतो — इथे स्वतः navigate करावं लागत नाही.
 */
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useSession();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    const p = phone.trim();
    if (p.length < 10) {
      setError('१० अंकी मोबाइल क्रमांक टाका.');
      return;
    }
    if (!password) {
      setError('Password टाका.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await login(p, password);
      // gate आपोआप tabs कडे नेतो; काही reason ने नाही नेलं तर हा fallback.
      router.replace('/');
    } catch (err) {
      // चुकीचा क्रमांक/password ला server स्पष्ट संदेश देतो; तोच दाखवतो.
      // API बंद असेल तर वेगळा — विद्यार्थ्याला "इंटरनेट बघा" कळावं.
      setError(
        err instanceof ApiError
          ? err.message
          : 'सर्व्हरशी संपर्क झाला नाही. इंटरनेट तपासा.'
      );
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + spacing['4xl'] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* ── ब्रँड ── */}
        <View style={styles.brand}>
          <Text style={styles.brandTop}>SPARDHA</Text>
          <Text style={styles.brandBottom}>TIMES</Text>
        </View>

        <Text style={styles.title}>पुन्हा स्वागत!</Text>
        <Text style={styles.subtitle}>तयारी सुरू ठेवण्यासाठी login करा.</Text>

        {/* ── मोबाइल ── */}
        <View style={styles.field}>
          <Icon name="person-circle" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="मोबाइल क्रमांक"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => {
              setPhone(t.replace(/[^0-9]/g, ''));
              setError(null);
            }}
            editable={!busy}
          />
        </View>

        {/* ── password ── */}
        <View style={styles.field}>
          <Icon name="lock-closed" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textLight}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError(null);
            }}
            editable={!busy}
            onSubmitEditing={submit}
            returnKeyType="go"
          />
          <Pressable hitSlop={8} onPress={() => setShowPass((v) => !v)}>
            <Icon
              name={showPass ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Icon name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── बटण ── */}
        <Pressable
          style={[styles.button, busy && styles.buttonBusy]}
          onPress={submit}
          disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Text style={styles.buttonText}>Login</Text>
              <Icon name="arrow-forward" size={18} color={colors.textInverse} />
            </>
          )}
        </Pressable>

        <Text style={styles.help}>
          खातं नाही? तुमच्या शिक्षक / संस्थेकडून मोबाइल क्रमांक नोंदवा.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },

  brand: { alignItems: 'center', marginBottom: spacing.xl },
  brandTop: {
    ...typography.headingXL,
    color: colors.primary,
    letterSpacing: 2,
  },
  brandBottom: {
    ...typography.titleL,
    ...strong.bold,
    color: colors.navy,
    letterSpacing: 6,
    marginTop: -spacing.xs,
  },

  title: { ...typography.headingL, ...strong.bold, color: colors.text },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginTop: -spacing.sm },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  input: { flex: 1, ...typography.bodyL, color: colors.text, paddingVertical: 0 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  errorText: { flex: 1, ...typography.bodyS, color: colors.error },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  buttonBusy: { opacity: 0.7 },
  buttonText: { ...componentType.buttonText, color: colors.textInverse },

  help: {
    ...typography.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
