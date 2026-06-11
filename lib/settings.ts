import db from "@/lib/db";

/**
 * Platform settings stored as key/value rows in the Setting model.
 * Each key has a default so the app works with an empty table.
 */
export const SETTING_DEFAULTS: Record<string, string> = {
  site_announcement: "",       // banner text shown on the public homepage; empty hides it
  registrations_open: "true",  // "false" blocks new student sign-ups
  leaderboard_size: "20",      // number of rows per leaderboard tab
};

export const SETTING_DESCRIPTIONS: Record<string, string> = {
  site_announcement: "Announcement banner shown at the top of the homepage. Leave empty to hide.",
  registrations_open: "Allow new students to register. Set to false to temporarily close sign-ups.",
  leaderboard_size: "How many top performers each leaderboard tab displays.",
};

export async function getSetting(key: string): Promise<string> {
  try {
    const row = await db.setting.findUnique({ where: { key } });
    return row?.value ?? SETTING_DEFAULTS[key] ?? "";
  } catch {
    return SETTING_DEFAULTS[key] ?? "";
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const values = { ...SETTING_DEFAULTS };
  try {
    const rows = await db.setting.findMany();
    for (const row of rows) {
      if (row.key in values) values[row.key] = row.value;
    }
  } catch (err) {
    console.error("Error loading settings:", err);
  }
  return values;
}
