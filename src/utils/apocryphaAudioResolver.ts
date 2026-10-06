/**
 * Resolves public domain human audio streams from Internet Archive (LibriVox / public domain projects)
 * for the Apocrypha / Deuterocanonical books appointed in the 1662 Book of Common Prayer.
 */

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

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

export function resolveApocryphaAudioUrl(passage?: string): string | null {
  if (!passage || typeof passage !== 'string') return null;

  const match = passage.trim().match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+)/);
  if (!match) return null;

  const rawBook = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2], 10);
  if (isNaN(chapter) || chapter < 1) return null;

  // 1. Wisdom of Solomon (19 chapters, individual human audio MP3s)
  // Archive item: wisdom-of-solomon-audio-chapters-1-through-19
  if (rawBook === 'wisdom' || rawBook === 'wisdom of solomon') {
    if (chapter >= 1 && chapter <= 19) {
      return `https://archive.org/download/wisdom-of-solomon-audio-chapters-1-through-19/Wisdom%20of%20Solomon%20${pad2(chapter)}.mp3`;
    }
  }

  // 2. Ecclesiasticus / Wisdom of Sirach (51 chapters, individual human audio MP3s)
  // Archive item: ecclesiasticus-51
  if (rawBook === 'ecclesiasticus' || rawBook === 'sirach') {
    if (chapter >= 1 && chapter <= 51) {
      return `https://archive.org/download/ecclesiasticus-51/Ecclesiasticus%20${pad2(chapter)}.mp3`;
    }
  }

  // 3. Tobit (14 chapters, individual human audio MP3s from LibriVox KJV)
  // Archive item: tobit_kjv_1512_librivox
  if (rawBook === 'tobit') {
    if (chapter >= 1 && chapter <= 14) {
      return `https://archive.org/download/tobit_kjv_1512_librivox/tobit_${pad2(chapter)}_kjv.mp3`;
    }
  }

  // 4. Judith (16 chapters, 3 KJV parts from LibriVox)
  // Archive item: bookofjudith_2007_librivox
  if (rawBook === 'judith') {
    if (chapter >= 1 && chapter <= 5) {
      return `https://archive.org/download/bookofjudith_2007_librivox/bookofjudith_01_kjv.mp3`;
    } else if (chapter >= 6 && chapter <= 10) {
      return `https://archive.org/download/bookofjudith_2007_librivox/bookofjudith_02_kjv.mp3`;
    } else if (chapter >= 11 && chapter <= 16) {
      return `https://archive.org/download/bookofjudith_2007_librivox/bookofjudith_03_kjv.mp3`;
    }
  }

  // 5. Baruch (6 chapters, LibriVox parts)
  // Archive item: baruch_drv_0806_librivox
  if (rawBook === 'baruch') {
    if (chapter >= 1 && chapter <= 3) {
      return `https://archive.org/download/baruch_drv_0806_librivox/baruch_01-03_drb.mp3`;
    } else if (chapter >= 4 && chapter <= 6) {
      return `https://archive.org/download/baruch_drv_0806_librivox/baruch_04-06_drb.mp3`;
    }
  }

  // 6. 1 Maccabees
  if (rawBook === '1 maccabees') {
    if (chapter >= 1 && chapter <= 16) {
      return `https://archive.org/download/1maccabees_2005_librivox/1maccabees_${pad2(chapter)}_kjv_64kb.mp3`;
    }
  }

  // 7. 2 Maccabees
  if (rawBook === '2 maccabees') {
    if (chapter >= 1 && chapter <= 15) {
      return `https://archive.org/download/2maccabees_2005_librivox/2maccabees_${pad2(chapter)}_kjv_64kb.mp3`;
    }
  }

  return null;
}
