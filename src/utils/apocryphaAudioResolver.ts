/**
 * Helper to identify Apocrypha / Deuterocanonical books appointed in the 1662 Book of Common Prayer.
 * Note: Apocrypha lessons do not have audio.
 */

export function isApocryphaPassage(passage?: string): boolean {
  if (!passage || typeof passage !== 'string') return false;
  const match = passage.trim().match(/^(\d?\s*[a-zA-Z\s]+?)\s+\d+/);
  if (!match) return false;
  const bookName = match[1].trim().toLowerCase();
  const apocryphaBooks = [
    'tobit', 'judith', 'wisdom', 'wisdom of solomon',
    'sirach', 'ecclesiasticus', 'baruch', '1 maccabees', '2 maccabees',
    'prayer of manasseh', 'prayer of manasses', '1 esdras', '2 esdras'
  ];
  return apocryphaBooks.includes(bookName);
}
