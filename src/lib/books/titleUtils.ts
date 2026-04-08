/**
 * Strip volume/chapter suffixes added by Google Books / Open Library.
 * e.g. "One-Punch Man, Vol. 3"  → "One-Punch Man"
 *      "Death Note, Volume 1"   → "Death Note"
 *      "Attack on Titan #5"     → "Attack on Titan"
 *      "ワンパンマン 1"            → "ワンパンマン"
 */
export function cleanBookTitle(title: string): string {
  return title
    // ", Vol. 3" / ": Vol 3" / " Vol. 3" / "(Vol. 3)"
    .replace(/[\s,:(]+(?:Vol(?:ume)?\.?|Book|Part|Chapter|#)\s*\d+(?:\s*-\s*\d+)?\.?\)?\s*$/gi, "")
    // bare trailing number separated by space: "Title 1" → "Title"
    .replace(/\s+\d+\.?\s*$/, "")
    // trailing punctuation left over
    .replace(/[\s,;:\-]+$/, "")
    .trim();
}
