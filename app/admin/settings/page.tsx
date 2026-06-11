import React from "react";
import { getAllSettings } from "@/lib/settings";
import { SettingsManager } from "@/components/admin/SettingsManager";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();
  return <SettingsManager initial={settings} />;
}
