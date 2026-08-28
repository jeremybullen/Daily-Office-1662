export type FontSize = 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl';
export type OfficeType = 'morning' | 'evening';
export type Theme = 'light' | 'dark';
export type Translation = 'KJV' | 'ESV';

export interface AppSettings {
  theme: Theme;
  fontSize: FontSize;
  translation: Translation;
}

export type CompletedData = Record<string, { morning?: boolean, evening?: boolean }>;
