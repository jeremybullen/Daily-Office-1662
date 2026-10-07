/**
 * Utility to parse 1662 lectionary Psalm strings into individual psalm items.
 * Ensures each individual psalm is treated as a separate item with a singular title (e.g. "Psalm 35", not "Psalms 35").
 */

export interface IndividualPsalm {
  id: string;
  title: string;
  passage: string;
}

export function parseIndividualPsalms(raw?: string): IndividualPsalm[] {
  if (!raw || typeof raw !== 'string') return [];

  const clean = raw.trim();
  if (!clean) return [];

  // Portion of Psalm 119, e.g. "119:1-32" or "Psalm 119:1-32" or "Psalms 119:1-32"
  if (/119\s*:\s*\d+/i.test(clean)) {
    const match = clean.match(/119\s*:\s*(\d+)-(\d+)/i);
    if (match) {
      const start = match[1];
      const end = match[2];
      const title = `Psalm 119:${start}-${end}`;
      const passage = `Psalm 119:${start}-${end}`;
      const id = `tts-psalm-119-${start}-${end}`;
      return [{ id, title, passage }];
    }
  }

  // Range of psalms, e.g. "1-5", "Psalm 1-5", "Psalms 1-5", "35-36", "Psalms 35-36"
  const rangeMatch = clean.match(/^(?:Psalms?\.?\s*)?(\d+)\s*-\s*(\d+)$/i);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    if (!isNaN(start) && !isNaN(end) && end >= start && end - start <= 20) {
      const result: IndividualPsalm[] = [];
      for (let p = start; p <= end; p++) {
        result.push({
          id: `tts-psalm-${p}`,
          title: `Psalm ${p}`,
          passage: `Psalm ${p}`
        });
      }
      return result;
    }
  }

  // Lists separated by comma, ampersand, or semicolon: e.g. "Psalm 35 & 36", "35, 36"
  if (/[,;&]/.test(clean)) {
    const parts = clean.split(/[,;&]+/).map(s => s.trim()).filter(Boolean);
    const result: IndividualPsalm[] = [];
    for (const part of parts) {
      const sub = parseIndividualPsalms(part);
      result.push(...sub);
    }
    if (result.length > 0) return result;
  }

  // Single Psalm: e.g. "Psalm 18", "Psalms 18", "18", "Psalm 95:1-7"
  const singleMatch = clean.match(/^(?:Psalms?\.?\s*)?(\d+(?::\d+(?:-\d+)?)?)$/i);
  if (singleMatch) {
    const ref = singleMatch[1];
    return [{
      id: `tts-psalm-${ref.replace(/[:]/g, '-').replace(/[^a-z0-9-]/gi, '')}`,
      title: `Psalm ${ref}`,
      passage: `Psalm ${ref}`
    }];
  }

  // Fallback: Always ensure singular "Psalm" in title
  let singularTitle = clean.replace(/\bPsalms\b/gi, 'Psalm');
  if (!/^Psalm\b/i.test(singularTitle)) {
    singularTitle = `Psalm ${singularTitle}`;
  }
  const safeId = 'tts-psalm-' + singularTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return [{
    id: safeId,
    title: singularTitle,
    passage: singularTitle
  }];
}
