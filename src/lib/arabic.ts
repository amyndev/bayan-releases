/**
 * Normalizes Arabic text for flexible, diacritic-insensitive and letter-variant-insensitive search.
 * - Strips tashkeel (fatha, damma, kasra, tanween, sukoon, shaddah, etc.)
 * - Normalizes Alef variants (أ, إ, آ -> ا)
 * - Normalizes Taa Marbuta (ة -> ه)
 * - Normalizes Alef Maqsura (ى -> ي)
 */
export function normalizeArabic(text: string): string {
  if (!text) return ""

  return text
    // Remove Arabic diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Normalize Alef variants
    .replace(/[أإآ]/g, "ا")
    // Normalize Taa Marbuta
    .replace(/ة/g, "ه")
    // Normalize Alef Maqsura
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim()
}

/**
 * Checks if a string contains any Arabic characters.
 */
export function isArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
  return arabicRegex.test(text)
}
