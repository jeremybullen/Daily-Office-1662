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
}

export type LiturgyAudioSection = LiturgySpeechSection;

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
