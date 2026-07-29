import { describe, expect, it } from 'vitest';

import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('10 आकडी क्रमांक जसाच्या तसा ठेवतो', () => {
    expect(normalizePhone('9876543210')).toBe('9876543210');
  });

  it('देशाचा code गाळतो — कोणत्याही रूपात', () => {
    expect(normalizePhone('+919876543210')).toBe('9876543210');
    expect(normalizePhone('919876543210')).toBe('9876543210');
    expect(normalizePhone('+91 98765 43210')).toBe('9876543210');
    expect(normalizePhone('+91-98765-43210')).toBe('9876543210');
  });

  it('आघाडीचा शून्य गाळतो', () => {
    expect(normalizePhone('09876543210')).toBe('9876543210');
  });

  it('मोकळी जागा आणि डॅश गाळतो', () => {
    expect(normalizePhone('98765 43210')).toBe('9876543210');
    expect(normalizePhone('98765-43210')).toBe('9876543210');
  });

  // हेच खरं महत्त्वाचं: एकाच माणसाची वेगवेगळी रूपं एकाच ओळीवर आली पाहिजेत,
  // नाहीतर phone वरचा unique index फसतो आणि दोन खाती बनतात.
  it('एकाच क्रमांकाची सगळी रूपं एकच उत्तर देतात', () => {
    const forms = ['9876543210', '+919876543210', '09876543210', '+91 98765 43210', '91-9876543210'];
    const results = new Set(forms.map(normalizePhone));
    expect(results.size).toBe(1);
    expect([...results][0]).toBe('9876543210');
  });

  it('6-9 शिवाय सुरू होणारे क्रमांक नाकारतो', () => {
    expect(normalizePhone('1234567890')).toBeNull();
    expect(normalizePhone('5876543210')).toBeNull();
  });

  it('चुकीच्या लांबीचे क्रमांक नाकारतो', () => {
    expect(normalizePhone('98765432')).toBeNull();
    expect(normalizePhone('98765432101')).toBeNull();
  });

  it('रिकामं आणि कचरा नाकारतो', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('abcdefghij')).toBeNull();
    expect(normalizePhone(undefined as never)).toBeNull();
    expect(normalizePhone(null as never)).toBeNull();
  });
});
