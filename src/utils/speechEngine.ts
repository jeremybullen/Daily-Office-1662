// Liturgical Audio Sections Interface

export interface SpeechPart {
  text: string;
  role: 'call' | 'response';
}

export interface LiturgySpeechSection {
  id: string;
  title: string;
  audioSrc?: string;
  audioCandidates?: string[];
  parts?: SpeechPart[];
  getParts?: () => SpeechPart[];
  isDynamic?: boolean;
  isHymn?: boolean;
  isApocrypha?: boolean;
  passage?: string;
}

export type LiturgyAudioSection = LiturgySpeechSection;

export function isHymnAudio(path?: string): boolean {
  if (!path) return false;
  const lower = path.toLowerCase();
  return (
    lower.includes('hymn') ||
    lower.includes('now with joyful exultation') ||
    lower.includes('holy god, we praise') ||
    lower.includes('blest be the god of israel') ||
    lower.includes('all creatures of our god and king') ||
    lower.includes('all people that on earth do dwell') ||
    lower.includes('/hymns/')
  );
}

export function cleanScriptureHtml(html: string): string {
  if (!html) return '';
  let cleaned = html.replace(/<sup[^>]*>.*?<\/sup>/gi, '');
  cleaned = cleaned.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*footnote[^"]*"[^>]*>.*?<\/div>/gi, '');
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*footnote[^"]*"[^>]*>.*?<\/span>/gi, '');
  cleaned = cleaned.replace(/\[\d+\]|\(\d+\)/g, '');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}
