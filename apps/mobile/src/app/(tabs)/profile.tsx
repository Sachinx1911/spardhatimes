import { Text } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { typography } from '@/theme/tokens';

export default function ProfileScreen() {
  return (
    <Screen>
      <Text style={typography.headingL}>Profile</Text>
    </Screen>
  );
}
