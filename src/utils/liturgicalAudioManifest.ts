/**
 * Manifest of pre-recorded audio files for invariant 1662 Book of Common Prayer sections.
 * 
 * In Hybrid Mode:
 * - If an audio file exists at the specified URL/path, the hybrid player plays the recording.
 * - If the audio file is not found (or fails to load), the player transparently falls back to Speech Synthesis.
 * - Changing sections (Psalms of the Day, First Lesson, Second Lesson, and Collect of the Day)
 *   are marked dynamic and always use dynamic Speech Synthesis.
 */

export interface LiturgicalAudioMap {
  [sectionId: string]: string;
}

export const LITURGICAL_AUDIO_FILES: LiturgicalAudioMap = {
  // General & Penitential
  'tts-opening-sentence': '/audio/morning/opening-sentence.mp3',
  'tts-exhortation': '/audio/general/exhortation.mp3',
  'tts-confession': '/audio/general/confession.mp3',
  'tts-absolution': '/audio/general/absolution.mp3',
  'tts-absolution-amen': '/audio/general/amen.mp3',
  'tts-lords-prayer-1': '/audio/general/lords-prayer.mp3',
  'tts-lords-prayer-2': '/audio/general/lords-prayer.mp3',
  'tts-versicles': '/audio/general/versicles.mp3',

  // Canticles
  'tts-venite': '/audio/canticles/venite.mp3',
  'tts-te-deum': '/audio/canticles/te-deum.mp3',
  'tts-benedicite': '/audio/canticles/benedicite.mp3',
  'tts-benedictus': '/audio/canticles/benedictus.mp3',
  'tts-jubilate': '/audio/canticles/jubilate.mp3',
  'tts-magnificat': '/audio/canticles/magnificat.mp3',
  'tts-cantate': '/audio/canticles/cantate-domino.mp3',
  'tts-nunc-dimittis': '/audio/canticles/nunc-dimittis.mp3',
  'tts-deus-misereatur': '/audio/canticles/deus-misereatur.mp3',

  // Creeds
  'tts-creed-apostles': '/audio/creeds/apostles-creed.mp3',
  'tts-creed-athanasian': '/audio/creeds/athanasian-creed.mp3',

  // Prayers & Suffrages
  'tts-lesser-litany': '/audio/general/lesser-litany.mp3',
  'tts-suffrages': '/audio/general/suffrages.mp3',
  'tts-collect-peace-morning': '/audio/morning/collect-peace.mp3',
  'tts-collect-grace-morning': '/audio/morning/collect-grace.mp3',
  'tts-collect-peace-evening': '/audio/evening/collect-peace.mp3',
  'tts-collect-aid-evening': '/audio/evening/collect-aid.mp3',
  'tts-state-prayers-president': '/audio/state/prayer-president.mp3',
  'tts-state-prayers-king': '/audio/state/prayer-king.mp3',
  'tts-st-chrysostom': '/audio/general/st-chrysostom.mp3',
  'tts-the-grace': '/audio/general/the-grace.mp3',
};
