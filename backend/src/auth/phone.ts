/**
 * मोबाइल क्रमांक एकाच रूपात आणणे.
 *
 * विद्यार्थी "+91 98765 43210", "098765 43210", "9876543210" — असं काहीही टाइप
 * करतो. Database मध्ये **फक्त 10 आकडे** साठवायचे, नाहीतर तोच माणूस दोन वेगळ्या
 * रूपांत नोंदला जाईल आणि `phone` वरचा unique index निरुपयोगी ठरेल.
 *
 * इथे pure ठेवलं आहे म्हणून याचे tests database शिवाय चालतात.
 */
export function normalizePhone(raw: string): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '');

  // देशाचा code किंवा आघाडीचा शून्य गाळायचा.
  const local = digits.startsWith('91') && digits.length === 12
    ? digits.slice(2)
    : digits.startsWith('0') && digits.length === 11
      ? digits.slice(1)
      : digits;

  // भारतीय मोबाइल क्रमांक 6-9 नेच सुरू होतात आणि 10 आकडी असतात.
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return local;
}
