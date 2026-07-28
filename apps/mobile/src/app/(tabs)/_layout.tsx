import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/ui/tab-bar';

/**
 * क्रम इथेच ठरतो आणि तोच tab-bar.tsx मधल्या ICONS/LABELS शी जुळतो.
 * (`expo-router` मधून थेट `Tabs` घेणं SDK 57 मध्ये deprecated आहे — `js-tabs` वापरा.)
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="tests" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
