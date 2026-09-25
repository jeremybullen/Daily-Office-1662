// Liturgical Browser Speech Synthesis Engine

export interface SpeechPart {
  text: string;
  role: 'call' | 'response';
}

export interface LiturgySpeechSection {
  id: string;
  title: string;
  parts: SpeechPart[];
  getParts?: () => SpeechPart[];
  audioSrc?: string; // Optional path/URL to pre-recorded audio file
  audioCandidates?: string[]; // Optional fallback audio file candidates
  isDynamic?: boolean; // True for daily changing texts (Psalms, Lessons, Collect of Day) that require TTS
}

export interface VoicePair {
  minister: SpeechSynthesisVoice | null;
  people: SpeechSynthesisVoice | null;
  isDistinct: boolean;
}

export function cleanScriptureHtml(html: string): string {
  if (!html) return '';
  // Remove <sup> verse numbers and annotations
  let cleaned = html.replace(/<sup[^>]*>.*?<\/sup>/gi, '');
  // Remove any heading tags (h1-h6) or footnotes/titles
  cleaned = cleaned.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*footnote[^"]*"[^>]*>.*?<\/div>/gi, '');
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*footnote[^"]*"[^>]*>.*?<\/span>/gi, '');
  // Remove footnote brackets like [1], (1), etc.
  cleaned = cleaned.replace(/\[\d+\]|\(\d+\)/g, '');
  // Remove all other HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  // Clean up whitespace and punctuation
  return cleaned.replace(/\s+/g, ' ').trim();
}

export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '') // strip tags if any
    .replace(/&amp;/g, 'and')
    .replace(/&nbsp;/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Phonetic adaptations for 1662 Book of Common Prayer text.
 * Modern browser speech synthesizers mispronounce archaic Jacobean English words.
 * This runs only on the text fed to the synthesizer; the on-screen text remains authentic.
 */
export function applyLiturgicalPhonetics(text: string): string {
  if (!text) return '';
  return text
    // Archaic 'shew' variations -> show
    .replace(/\bSheweth\b/g, 'Showeth')
    .replace(/\bsheweth\b/g, 'showeth')
    .replace(/\bShewed\b/g, 'Showed')
    .replace(/\bshewed\b/g, 'showed')
    .replace(/\bShewing\b/g, 'Showing')
    .replace(/\bshewing\b/g, 'showing')
    .replace(/\bShews\b/g, 'Shows')
    .replace(/\bshews\b/g, 'shows')
    .replace(/\bShew\b/g, 'Show')
    .replace(/\bshew\b/g, 'show')
    // cloke -> cloak
    .replace(/\bCloke\b/g, 'Cloak')
    .replace(/\bcloke\b/g, 'cloak')
    .replace(/\bcloked\b/g, 'cloaked')
    .replace(/\bclokes\b/g, 'cloaks')
    // Jesu -> Jesus (ensures clear, dignified pronunciation across all engines)
    .replace(/\bChrist Jesu\b/g, 'Christ Jesus')
    .replace(/\bJesu Christ\b/g, 'Jesus Christ')
    .replace(/\bJesu\b/g, 'Jesus')
    // Sabaoth (Hebrew צבאות 'hosts' in Te Deum) -> Sab-ah-oath
    .replace(/\bSabaoth\b/gi, 'Sab-ah-oath')
    // Amen -> Ah-men (liturgical choral pronunciation rather than casual ay-men)
    .replace(/\bAmen\b/g, 'Ah-men')
    .replace(/\bAMEN\b/g, 'Ah-men')
    // vouchsafe -> vowch-safe
    .replace(/\bvouchsafe\b/gi, 'vowch-safe')
    .replace(/\bvouchsafed\b/gi, 'vowch-safed')
    // unfeignedly -> un-fay-ned-ly
    .replace(/\bunfeignedly\b/gi, 'un-fay-ned-ly')
    .replace(/\bunfeigned\b/gi, 'un-faynd');
}

export function splitSentences(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];
  const phonetic = applyLiturgicalPhonetics(cleaned);

  // Split on sentence boundaries (. ! ?) and liturgical half-verse pause marks (: ;)
  // We avoid splitting colons between digits (like chapter:verse)
  const regex = /[^.!?:]+[.!?]+(?:\s|$)|[^.!?:]+[:;]+(?:\s|$)|[^.!?:]+$/g;
  const matches = phonetic.match(regex);
  if (!matches) return [phonetic];
  return matches.map(s => s.trim()).filter(s => s.length > 0);
}

export async function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handler);

    // Timeout safety fallback
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 600);
  });
}

export function pickLiturgicalVoices(
  voices: SpeechSynthesisVoice[],
  customMinisterUri?: string | null,
  customPeopleUri?: string | null
): VoicePair {
  if (voices.length === 0) {
    return { minister: null, people: null, isDistinct: false };
  }

  // 1. Check if user has explicitly selected custom voices
  let minister: SpeechSynthesisVoice | null = null;
  let people: SpeechSynthesisVoice | null = null;

  if (customMinisterUri) {
    minister = voices.find(v => v.voiceURI === customMinisterUri || v.name === customMinisterUri) || null;
  }
  if (customPeopleUri) {
    people = voices.find(v => v.voiceURI === customPeopleUri || v.name === customPeopleUri) || null;
  }

  const english = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
  const candidatePool = english.length > 0 ? english : voices;

  // Prefer British English for 1662 Book of Common Prayer
  const british = candidatePool.filter(v => 
    v.lang.toLowerCase().includes('gb') || 
    v.name.toLowerCase().includes('united kingdom') || 
    v.name.toLowerCase().includes('british') ||
    v.name.toLowerCase().includes('english (uk)')
  );

  const maleNames = ['daniel', 'george', 'oliver', 'arthur', 'david', 'mark', 'james', 'guy', 'ryan', 'thomas', 'brian', 'aaron', 'richard', 'charles', 'male'];
  const femaleNames = ['serena', 'stephanie', 'martha', 'victoria', 'karen', 'samantha', 'moira', 'fiona', 'zira', 'hazel', 'susan', 'catherine', 'libby', 'sonia', 'jenny', 'aria', 'female'];

  // If minister not explicitly selected, auto-detect
  if (!minister) {
    const poolToSearch = british.length > 0 ? british : candidatePool;
    minister = poolToSearch.find(v => maleNames.some(m => v.name.toLowerCase().includes(m))) || null;
    if (!minister && british.length > 0) {
      minister = candidatePool.find(v => maleNames.some(m => v.name.toLowerCase().includes(m))) || null;
    }
    if (!minister) {
      minister = poolToSearch[0] || candidatePool[0];
    }
  }

  // If people not explicitly selected, auto-detect distinct voice
  if (!people) {
    const remaining = candidatePool.filter(v => v !== minister);
    const remainingBritish = british.filter(v => v !== minister);

    people = (remainingBritish.length > 0 ? remainingBritish : remaining).find(v => 
      femaleNames.some(f => v.name.toLowerCase().includes(f))
    ) || null;

    if (!people && remaining.length > 0) {
      people = remaining.find(v => femaleNames.some(f => v.name.toLowerCase().includes(f))) || null;
    }
    if (!people && remaining.length > 0) {
      people = remaining[0];
    }
    if (!people) {
      people = minister;
    }
  }

  return {
    minister,
    people,
    isDistinct: minister !== people && minister !== null && people !== null
  };
}
