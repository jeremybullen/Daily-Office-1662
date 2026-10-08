/**
 * Manifest of pre-recorded audio files for invariant 1662 Book of Common Prayer sections.
 * 
 * Supports both direct `/public/audio/` filenames (e.g. `Confession.mp3`, `Exhortation.mp3`,
 * `Collect for Pardon.mp3`, `Lords Prayer.mp3`) and structured folder names.
 */

// Mapping of opening sentence indices to audio files
export const OPENING_SENTENCE_AUDIO: Record<number, string[]> = {
  0: [
    '/audio/Ezekiel 18:27.mp3',
    '/audio/Ezekiel 18.27.mp3',
    '/audio/Ezekiel 18-27.mp3',
    '/audio/sentences/ezekiel-18-27.mp3'
  ],
  1: [
    '/audio/Psalm 51:3.mp3',
    '/audio/Psalm 51.3.mp3',
    '/audio/Psalm 51-3.mp3',
    '/audio/sentences/psalm-51-3.mp3'
  ],
  2: [
    '/audio/Psalm 51:9.mp3',
    '/audio/Psalm 51.9.mp3',
    '/audio/Psalm 51-9.mp3',
    '/audio/sentences/psalm-51-9.mp3'
  ],
  3: [
    '/audio/Psalm 51:17.mp3',
    '/audio/Psalm 51.17.mp3',
    '/audio/Psalm 51-17.mp3',
    '/audio/sentences/psalm-51-17.mp3'
  ],
  4: [
    '/audio/Joel 2:13.mp3',
    '/audio/Joel 2.13.mp3',
    '/audio/Joel 2-13.mp3',
    '/audio/sentences/joel-2-13.mp3'
  ],
  5: [
    '/audio/Daniel 9:9-10.mp3',
    '/audio/Daniel 9.9-10.mp3',
    '/audio/Daniel 9-9-10.mp3',
    '/audio/sentences/daniel-9-9-10.mp3'
  ],
  6: [
    '/audio/Jeremiah 10:24; Psalm 6:1.mp3',
    '/audio/Jeremiah 10.24; Psalm 6.1.mp3',
    '/audio/Jeremiah 10:24.mp3',
    '/audio/sentences/jeremiah-10-24.mp3'
  ],
  7: [
    '/audio/Matthew 3:2.mp3',
    '/audio/St Matthew 3:2.mp3',
    '/audio/Matthew 3.2.mp3',
    '/audio/sentences/matthew-3-2.mp3'
  ],
  8: [
    '/audio/Luke 15:18-19.mp3',
    '/audio/St Luke 15:18-19.mp3',
    '/audio/Luke 15.18-19.mp3',
    '/audio/sentences/luke-15-18-19.mp3'
  ],
  9: [
    '/audio/Psalm 143:2.mp3',
    '/audio/Psalm 143.2.mp3',
    '/audio/Psalm 143-2.mp3',
    '/audio/sentences/psalm-143-2.mp3'
  ],
  10: [
    '/audio/1 John 1:8-9.mp3',
    '/audio/1 St John 1:8-9.mp3',
    '/audio/1 John 1.8-9.mp3',
    '/audio/sentences/1-john-1-8-9.mp3'
  ]
};

export const LITURGICAL_AUDIO_CANDIDATES: Record<string, string[]> = {
  // Opening Sentence
  'tts-opening-sentence': [
    '/audio/Ezekiel 18:27.mp3',
    '/audio/Opening Sentence.mp3',
    '/audio/Sentence.mp3',
    '/audio/opening-sentence.mp3',
    '/audio/morning/opening-sentence.mp3'
  ],

  // Exhortation
  'tts-exhortation': [
    '/audio/Exhortation.mp3',
    '/audio/The Exhortation.mp3',
    '/audio/exhortation.mp3',
    '/audio/general/exhortation.mp3'
  ],

  // Confession
  'tts-confession': [
    '/audio/Confession.mp3',
    '/audio/General Confession.mp3',
    '/audio/A General Confession.mp3',
    '/audio/confession.mp3',
    '/audio/general/confession.mp3'
  ],

  // Absolution / Collect for Pardon
  'tts-absolution': [
    '/audio/Collect for Pardon.mp3',
    '/audio/Collect For Pardon.mp3',
    '/audio/Absolution.mp3',
    '/audio/The Absolution.mp3',
    '/audio/absolution.mp3',
    '/audio/general/absolution.mp3',
    '/audio/general/collect-for-pardon.mp3'
  ],

  // Amen Response
  'tts-absolution-amen': [
    '/audio/Amen.mp3',
    '/audio/amen.mp3',
    '/audio/general/amen.mp3'
  ],

  // The Lord's Prayer (First and Second occurrences)
  'tts-lords-prayer-1': [
    '/audio/Lords Prayer.mp3',
    "/audio/Lord's Prayer.mp3",
    '/audio/The Lords Prayer.mp3',
    "/audio/The Lord's Prayer.mp3",
    "/audio/Lord's Prayer (Hymn).mp3",
    '/audio/Lords Prayer (Hymn).mp3',
    "/audio/hymns/Lord's Prayer.mp3",
    '/audio/hymns/Lords Prayer.mp3',
    '/audio/lords-prayer.mp3',
    '/audio/general/lords-prayer.mp3'
  ],
  'tts-lords-prayer-2': [
    '/audio/Lords Prayer.mp3',
    "/audio/Lord's Prayer.mp3",
    '/audio/The Lords Prayer.mp3',
    "/audio/The Lord's Prayer.mp3",
    "/audio/Lord's Prayer (Hymn).mp3",
    '/audio/Lords Prayer (Hymn).mp3',
    "/audio/hymns/Lord's Prayer.mp3",
    '/audio/hymns/Lords Prayer.mp3',
    '/audio/lords-prayer.mp3',
    '/audio/general/lords-prayer.mp3'
  ],

  // Versicles
  'tts-versicles': [
    '/audio/Versicles.mp3',
    '/audio/The Versicles.mp3',
    '/audio/versicles.mp3',
    '/audio/general/versicles.mp3'
  ],

  // Gloria Patri
  'tts-gloria-patri': [
    '/audio/Spoken Gloria Patri.mp3',
    '/audio/spoken%20Gloria%20Patri.mp3',
    '/audio/Gloria Patri.mp3',
    '/audio/Gloria%20Patri.mp3',
    '/audio/gloria-patri.mp3',
    '/audio/general/gloria-patri.mp3'
  ],

  // Canticles (Spoken defaults)
  'tts-venite': [
    '/audio/Venite.mp3',
    '/audio/venite.mp3',
    '/audio/canticles/venite.mp3'
  ],
  'tts-canticle-1': [
    '/audio/Te Deum.mp3',
    '/audio/Te Deum Laudamus.mp3',
    '/audio/Benedicite.mp3',
    '/audio/Magnificat.mp3',
    '/audio/Cantate Domino.mp3',
    '/audio/te-deum.mp3',
    '/audio/magnificat.mp3',
    '/audio/canticles/te-deum.mp3',
    '/audio/canticles/magnificat.mp3'
  ],
  'tts-canticle-2': [
    '/audio/Benedictus.mp3',
    '/audio/spoken Jubilate Deo.mp3',
    '/audio/spoken%20Jubilate%20Deo.mp3',
    '/audio/Jubilate Deo.mp3',
    '/audio/Jubilate.mp3',
    '/audio/Nunc Dimittis.mp3',
    '/audio/Deus Misereatur.mp3',
    '/audio/benedictus.mp3',
    '/audio/nunc-dimittis.mp3',
    '/audio/canticles/benedictus.mp3',
    '/audio/canticles/nunc-dimittis.mp3'
  ],
  'tts-te-deum': [
    '/audio/Te Deum.mp3',
    '/audio/Te Deum Laudamus.mp3',
    '/audio/te-deum.mp3',
    '/audio/canticles/te-deum.mp3'
  ],
  'tts-benedicite': [
    '/audio/Benedicite.mp3',
    '/audio/benedicite.mp3',
    '/audio/canticles/benedicite.mp3'
  ],
  'tts-benedictus': [
    '/audio/Benedictus.mp3',
    '/audio/benedictus.mp3',
    '/audio/canticles/benedictus.mp3'
  ],
  'tts-jubilate': [
    '/audio/spoken Jubilate Deo.mp3',
    '/audio/spoken%20Jubilate%20Deo.mp3',
    '/audio/Jubilate Deo.mp3',
    '/audio/Jubilate.mp3',
    '/audio/jubilate.mp3',
    '/audio/canticles/jubilate.mp3'
  ],
  'tts-magnificat': [
    '/audio/Magnificat.mp3',
    '/audio/Song of Mary.mp3',
    '/audio/magnificat.mp3',
    '/audio/canticles/magnificat.mp3'
  ],
  'tts-cantate': [
    '/audio/Cantate Domino.mp3',
    '/audio/Cantate.mp3',
    '/audio/Psalm 98.mp3',
    '/audio/cantate.mp3',
    '/audio/cantate-domino.mp3',
    '/audio/canticles/cantate-domino.mp3'
  ],
  'tts-nunc-dimittis': [
    '/audio/Nunc Dimittis.mp3',
    '/audio/Song of Simeon.mp3',
    '/audio/nunc-dimittis.mp3',
    '/audio/canticles/nunc-dimittis.mp3'
  ],
  'tts-deus-misereatur': [
    '/audio/Deus Misereatur.mp3',
    '/audio/Psalm 67.mp3',
    '/audio/deus-misereatur.mp3',
    '/audio/canticles/deus-misereatur.mp3'
  ],

  // Creeds
  'tts-creed': [
    '/audio/Apostles Creed.mp3',
    "/audio/Apostles' Creed.mp3",
    '/audio/The Apostles Creed.mp3',
    "/audio/The Apostles' Creed.mp3",
    '/audio/Creed.mp3',
    '/audio/apostles-creed.mp3',
    '/audio/creeds/apostles-creed.mp3',
    '/audio/Athanasian Creed.mp3',
    '/audio/athanasian-creed.mp3',
    '/audio/creeds/athanasian-creed.mp3'
  ],
  'tts-creed-apostles': [
    '/audio/Apostles Creed.mp3',
    "/audio/Apostles' Creed.mp3",
    '/audio/The Apostles Creed.mp3',
    "/audio/The Apostles' Creed.mp3",
    '/audio/Creed.mp3',
    '/audio/apostles-creed.mp3',
    '/audio/creeds/apostles-creed.mp3'
  ],
  'tts-creed-athanasian': [
    '/audio/Athanasian Creed.mp3',
    '/audio/The Athanasian Creed.mp3',
    '/audio/athanasian-creed.mp3',
    '/audio/creeds/athanasian-creed.mp3'
  ],

  // Lesser Litany & Suffrages
  'tts-lesser-litany': [
    '/audio/LesserLitany.mp3',
    '/audio/Lesser Litany.mp3',
    '/audio/The Lesser Litany.mp3',
    '/audio/lesser-litany.mp3',
    '/audio/general/lesser-litany.mp3'
  ],
  'tts-suffrages': [
    '/audio/Suffrages.mp3',
    '/audio/The Suffrages.mp3',
    '/audio/Preces.mp3',
    '/audio/suffrages.mp3',
    '/audio/general/suffrages.mp3'
  ],

  // Second Collect (Peace)
  'tts-collect-second': [
    '/audio/Collect for Peace.mp3',
    '/audio/Second Collect Peace.mp3',
    '/audio/Second Collect.mp3',
    '/audio/collect-peace.mp3',
    '/audio/morning/collect-peace.mp3',
    '/audio/Evening Collect for Peace.mp3',
    '/audio/Collect for Peace Evening.mp3',
    '/audio/collect-peace-evening.mp3',
    '/audio/evening/collect-peace.mp3'
  ],
  'tts-collect-peace-morning': [
    '/audio/Collect for Peace.mp3',
    '/audio/Second Collect Peace.mp3',
    '/audio/Second Collect.mp3',
    '/audio/collect-peace.mp3',
    '/audio/morning/collect-peace.mp3'
  ],
  'tts-collect-peace-evening': [
    '/audio/Evening Collect for Peace.mp3',
    '/audio/Collect for Peace Evening.mp3',
    '/audio/collect-peace-evening.mp3',
    '/audio/evening/collect-peace.mp3'
  ],

  // Third Collect (Grace / Aid)
  'tts-collect-third': [
    '/audio/Collect for Grace.mp3',
    '/audio/Third Collect Grace.mp3',
    '/audio/Third Collect.mp3',
    '/audio/collect-grace.mp3',
    '/audio/morning/collect-grace.mp3',
    '/audio/Collect for Aid.mp3',
    '/audio/Aid Against Perils.mp3',
    '/audio/Third Collect Aid.mp3',
    '/audio/collect-aid.mp3',
    '/audio/evening/collect-aid.mp3'
  ],
  'tts-collect-grace-morning': [
    '/audio/Collect for Grace.mp3',
    '/audio/Third Collect Grace.mp3',
    '/audio/Third Collect.mp3',
    '/audio/collect-grace.mp3',
    '/audio/morning/collect-grace.mp3'
  ],
  'tts-collect-aid-evening': [
    '/audio/Collect for Aid.mp3',
    '/audio/Aid Against Perils.mp3',
    '/audio/Third Collect Aid.mp3',
    '/audio/collect-aid.mp3',
    '/audio/evening/collect-aid.mp3'
  ],

  // State Prayers & Civil Authority
  'tts-prayer-president': [
    '/audio/Prayer for the President.mp3',
    '/audio/prayer-president.mp3',
    '/audio/State Prayers.mp3'
  ],
  'tts-prayer-clergy': [
    '/audio/Prayer for Clergy and People.mp3',
    '/audio/prayer-clergy-and-people.mp3',
    '/audio/prayer-clergy.mp3'
  ],
  'tts-state-prayers': [
    '/audio/Prayer for the President.mp3',
    '/audio/State Prayers.mp3',
    '/audio/Prayer for Clergy and People.mp3',
    '/audio/prayer-president.mp3'
  ],

  // Prayer of St. Chrysostom
  'tts-st-chrysostom': [
    '/audio/Prayer of Chrysostom.mp3',
    '/audio/Prayer of Saint Chrysostom.mp3',
    '/audio/Prayer of St Chrysostom.mp3',
    '/audio/Saint Chrysostom.mp3',
    '/audio/St Chrysostom.mp3',
    '/audio/st-chrysostom.mp3',
    '/audio/general/st-chrysostom.mp3'
  ],

  // The Grace
  'tts-the-grace': [
    '/audio/The Grace.mp3',
    '/audio/Grace.mp3',
    '/audio/the-grace.mp3',
    '/audio/general/the-grace.mp3'
  ]
};

export const HYMN_AUDIO_CANDIDATES: Record<string, string[]> = {
  'venite': [
    '/audio/184. Now with joyful exultation (Psalm 95).mp3',
    '/audio/Psalm-95.mp3',
    '/audio/Psalm 95.mp3',
    '/audio/Venite (Hymn).mp3'
  ],
  'te-deum': [
    '/audio/Holy God, We Praise Your Name.mp3',
    '/audio/Te Deum (Hymn).mp3'
  ],
  'benedicite': [
    '/audio/All Creatures of Our God and King.mp3',
    '/audio/Benedicite (Hymn).mp3'
  ],
  'benedictus': [
    '/audio/Blest Be the God of Israel; First Methodist Houston, 11 27 22.mp3',
    '/audio/Benedictus (Hymn).mp3'
  ],
  'jubilate': [
    '/audio/All People That on Earth Do Dwell.mp3',
    '/audio/Psalm 100.mp3',
    '/audio/Jubilate (Hymn).mp3'
  ],
  'magnificat': [
    '/audio/Song of Mary.mp3',
    '/audio/Magnificat (Hymn).mp3'
  ],
  'cantate': [
    '/audio/Cantate Domino (Hymn).mp3'
  ],
  'nunc-dimittis': [
    '/audio/Nunc Dimittis (Hymn).mp3'
  ],
  'deus-misereatur': [
    '/audio/Deus Misereatur (Hymn).mp3',
    '/audio/Psalm 67.mp3'
  ]
};

export const LITURGICAL_AUDIO_FILES: Record<string, string> = Object.fromEntries(
  Object.entries(LITURGICAL_AUDIO_CANDIDATES).map(([key, candidates]) => [key, candidates[0]])
);
