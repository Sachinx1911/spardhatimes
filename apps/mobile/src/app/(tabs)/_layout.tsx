import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/ui/tab-bar';

/**
 * क्रम इथेच ठरतो आणि तोच tab-bar.tsx मधल्या ICONS/LABELS शी जुळतो.
 * (`expo-router` मधून थेट `Tabs` घेणं SDK 57 मध्ये deprecated आहे — `js-tabs` वापरा.)
 *
 * ## खालचे routes `(tabs)` मध्ये आहेत पण tab **नाहीत**
 *
 * हे पडदे Home वरच्या tiles मागे उघडतात. आधी ते `(tabs)` च्या बाहेर होते, पण मग
 * त्यांच्यावर खालचा menu दिसत नव्हता — आणि तो app मध्ये सगळीकडे दिसला पाहिजे.
 *
 * आत आणल्यावरही सहावा tab तयार होत नाही, कारण `TabBar` फक्त `ICONS` मध्ये नाव
 * असलेले routes काढतो (`if (!icon) return null`). म्हणून गोठवलेले पाचच tabs
 * दिसतात आणि हे पडदे त्यांच्यासह उघडतात.
 *
 * `(tabs)` हा कंसातला गट आहे, त्यामुळे पत्ते बदललेले नाहीत — `/current-affairs`
 * तोच राहतो.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="tests" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="profile" />

      {/* tab bar मध्ये दिसणारे नाहीत — वरचं टिप्पण पाहा. */}
      <Tabs.Screen name="current-affairs" />
      <Tabs.Screen name="bookmarks" />
      <Tabs.Screen name="article/[slug]" />
    </Tabs>
  );
}
