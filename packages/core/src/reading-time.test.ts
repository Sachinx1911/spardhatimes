import { describe, it, expect } from "vitest";

import { articleExcerpt, readingMinutes } from "./reading-time";

/** `n` शब्दांचा मजकूर. */
const words = (n: number) => Array.from({ length: n }, (_, i) => `शब्द${i}`).join(" ");

describe("readingMinutes", () => {
  it("रिकाम्या मजकुराला 1 मिनिट देतो, 0 नाही", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("   \n  ")).toBe(1);
  });

  it("फार छोट्या लेखाला सुद्धा किमान 1", () => {
    expect(readingMinutes("दोन शब्द")).toBe(1);
  });

  it("180 शब्द = 1 मिनिट", () => {
    expect(readingMinutes(words(180))).toBe(1);
  });

  it("540 शब्द = 3 मिनिटं", () => {
    expect(readingMinutes(words(540))).toBe(3);
  });

  it("जवळचा पूर्णांक घेतो, खाली कापत नाही", () => {
    // 450 / 180 = 2.5 → 3 (कमी अंदाज लावून हिरमोड होऊ नये).
    expect(readingMinutes(words(450))).toBe(3);
  });

  it("ओळी आणि अनेक मोकळ्या जागा शब्द म्हणून मोजत नाही", () => {
    expect(readingMinutes("एक\n\n  दोन   \t तीन")).toBe(1);
  });
});

describe("articleExcerpt", () => {
  it("admin ने सारांश दिला असेल तर तोच वापरतो", () => {
    expect(articleExcerpt("हाताने लिहिलेला सारांश", "पूर्ण मजकूर वेगळा आहे")).toBe(
      "हाताने लिहिलेला सारांश"
    );
  });

  it("सारांश रिकामा/मोकळ्या जागांचा असेल तर मजकुराकडे वळतो", () => {
    expect(articleExcerpt("   ", "मजकुराची सुरुवात")).toBe("मजकुराची सुरुवात");
    expect(articleExcerpt(null, "मजकुराची सुरुवात")).toBe("मजकुराची सुरुवात");
  });

  it("मर्यादेत बसणारा मजकूर जसाच तसा, शेवटी ठिपके नाहीत", () => {
    const short = "छोटा मजकूर";
    expect(articleExcerpt(null, short)).toBe(short);
  });

  it("लांब मजकूर शब्दाच्या मधोमध कापत नाही", () => {
    const out = articleExcerpt(null, words(100), 40);
    expect(out.endsWith("…")).toBe(true);
    // ठिपके काढल्यावर उरलेला भाग पूर्ण शब्दांचाच असावा.
    const body = out.slice(0, -1);
    expect(body.endsWith(" ")).toBe(false);
    expect(words(100).startsWith(body)).toBe(true);
  });

  it("मजकुरातल्या अनेक मोकळ्या जागा एकात आणतो", () => {
    expect(articleExcerpt(null, "एक\n\nदोन    तीन")).toBe("एक दोन तीन");
  });

  it("मोकळी जागाच नसलेला फार लांब शब्द असेल तर तिथेच कापतो", () => {
    const out = articleExcerpt(null, "अ".repeat(50), 10);
    expect(out).toBe(`${"अ".repeat(10)}…`);
  });
});
