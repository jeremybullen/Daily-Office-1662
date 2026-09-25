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

export function splitSentences(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];

  // Split on sentence boundaries (., !, ?) while keeping the text natural
  const regex = /[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g;
  const matches = cleaned.match(regex);
  if (!matches) return [cleaned];
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

export function pickLiturgicalVoices(voices: SpeechSynthesisVoice[]): VoicePair {
  if (voices.length === 0) {
    return { minister: null, people: null, isDistinct: false };
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

  let minister: SpeechSynthesisVoice | null = null;
  let people: SpeechSynthesisVoice | null = null;

  // 1. Try to find a male voice for the Minister (ideally British)
  const poolToSearch = british.length > 0 ? british : candidatePool;
  minister = poolToSearch.find(v => maleNames.some(m => v.name.toLowerCase().includes(m))) || null;
  if (!minister && british.length > 0) {
    minister = candidatePool.find(v => maleNames.some(m => v.name.toLowerCase().includes(m))) || null;
  }
  if (!minister) {
    minister = poolToSearch[0] || candidatePool[0];
  }

  // 2. Try to find a distinct voice for the People / Responses
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

  return {
    minister,
    people,
    isDistinct: minister !== people
  };
}
