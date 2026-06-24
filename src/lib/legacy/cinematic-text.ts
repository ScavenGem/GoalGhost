/** Strip em dashes from legacy unwrap copy (use commas instead). */
export function legacyDisplayText(text: string): string {
  return text
    .replace(/\u2014/g, ", ")
    .replace(/\s+-\s+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}