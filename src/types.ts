export type OfficeType = 'morning' | 'evening';
export type Translation = 'ESV';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  useShortForm: boolean;
  shortLessonPreference: 'OT' | 'NT';
}

export type CompletedData = Record<string, { morning?: boolean, evening?: boolean }>;
