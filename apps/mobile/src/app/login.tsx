import { Text } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { typography } from '@/theme/tokens';

export default function LoginScreen() {
  return (
    <Screen scroll={false}>
      <Text style={typography.h1}>Login</Text>
    </Screen>
  );
}
