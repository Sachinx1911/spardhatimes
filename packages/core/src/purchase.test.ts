import { describe, it, expect } from "vitest";

import { accessExpiryFor, discountPercent, isAccessLive } from "./purchase";

const NOW = new Date("2026-07-31T12:00:00Z");

describe("accessExpiryFor", () => {
  it("0 महिने = कायमस्वरूपी (null)", () => {
    expect(accessExpiryFor(0, NOW)).toBeNull();
  });

  it("ऋण आकडा सुद्धा कायमस्वरूपी — चुकून आला तरी मुदत भूतकाळात जाऊ नये", () => {
    expect(accessExpiryFor(-3, NOW)).toBeNull();
  });

  it("6 महिने पुढे नेतो", () => {
    expect(accessExpiryFor(6, NOW)?.toISOString()).toBe("2027-01-31T12:00:00.000Z");
  });

  it("12 महिने = पुढचं वर्ष, तीच तारीख", () => {
    expect(accessExpiryFor(12, NOW)?.toISOString()).toBe("2027-07-31T12:00:00.000Z");
  });

  it("महिन्यात तारीख नसेल तर पुढे ढकलतो, मागे नाही", () => {
    // 31 जानेवारी + 1 महिना → फेब्रुवारीत 31 नाही, म्हणून 3 मार्च.
    // विद्यार्थ्याच्या बाजूने जास्त, कमी नाही.
    const jan31 = new Date("2026-01-31T00:00:00Z");
    const out = accessExpiryFor(1, jan31)!;
    expect(out.getTime()).toBeGreaterThan(new Date("2026-02-28T00:00:00Z").getTime());
  });

  it("दिलेली तारीख बदलत नाही (mutate करत नाही)", () => {
    const from = new Date("2026-07-31T12:00:00Z");
    const before = from.getTime();
    accessExpiryFor(6, from);
    expect(from.getTime()).toBe(before);
  });
});

describe("isAccessLive", () => {
  it("null = कायमस्वरूपी, नेहमी चालू", () => {
    expect(isAccessLive(null, NOW)).toBe(true);
  });

  it("पुढची तारीख = चालू", () => {
    expect(isAccessLive(new Date("2026-08-01T00:00:00Z"), NOW)).toBe(true);
  });

  it("मागची तारीख = संपली", () => {
    expect(isAccessLive(new Date("2026-07-30T00:00:00Z"), NOW)).toBe(false);
  });

  it("नेमका तोच क्षण = संपली (सीमेवर उदार नाही)", () => {
    expect(isAccessLive(new Date(NOW), NOW)).toBe(false);
  });
});

describe("discountPercent", () => {
  it("MRP नसेल तर सवलत नाही", () => {
    expect(discountPercent(79900, null)).toBeNull();
  });

  it("MRP किंमतीएवढा असेल तर सवलत नाही", () => {
    expect(discountPercent(79900, 79900)).toBeNull();
  });

  it("MRP किंमतीपेक्षा कमी असेल तर सवलत नाही (चुकीचा data)", () => {
    expect(discountPercent(79900, 50000)).toBeNull();
  });

  it("₹799 वर ₹1199 चा MRP = 33%", () => {
    expect(discountPercent(79900, 119900)).toBe(33);
  });

  it("₹499 वर ₹799 चा MRP = 37%", () => {
    expect(discountPercent(49900, 79900)).toBe(37);
  });

  it("खाली पूर्णांक घेतो, फुगवत नाही", () => {
    // 100 पैकी 34 सुटले = 34%; 33.9 ला 34 केलं असतं तर फुगलं असतं.
        expect(discountPercent(66, 100)).toBe(34);
    expect(discountPercent(67, 100)).toBe(33);
  });

  it("मोफत series वर पूर्ण सवलत", () => {
    expect(discountPercent(0, 119900)).toBe(100);
  });
});
