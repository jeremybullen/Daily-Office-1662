import { LiturgySpeechSection, cleanScriptureHtml } from './speechEngine';
import { 
  openingSentences, 
  exhortation, 
  confession, 
  absolutionSubstitute, 
  lordsPrayer, 
  initialVersicles, 
  venite, 
  teDeum, 
  benediciteVerses, 
  benediciteRefrain, 
  magnificat, 
  cantateDomino, 
  benedictus, 
  jubilateDeo, 
  nuncDimittis, 
  deusMisereatur, 
  apostlesCreed, 
  athanasianCreed, 
  suffrages, 
  stChrysostom, 
  theGrace, 
  statePrayers 
} from '../content/liturgy-data';
import { DailyReadings } from './lectionary';
import { AppSettings, OfficeType } from '../types';
import { LITURGICAL_AUDIO_FILES, LITURGICAL_AUDIO_CANDIDATES, HYMN_AUDIO_CANDIDATES, OPENING_SENTENCE_AUDIO } from './liturgicalAudioManifest';

interface BuilderOptions {
  office: OfficeType;
  settings: AppSettings;
  readings: DailyReadings;
  sentenceIdx: number;
  useBenedicite: boolean;
  useAlternativeEveningCanticle1: boolean;
  useAlternativeCanticle2: boolean;
  isAthanasian: boolean;
  isAshWedOrGoodFri: boolean;
  hymnMode?: Record<string, boolean>;
}

// Helper to generate resilient ESV audio candidates:
// 1. Same-origin proxy route (server authenticated with developer secret API key)
// 2. Direct Crossway HearTheWord CDN endpoint (fallback for static or external hosting)
function buildEsvAudioCandidates(passage?: string): string[] {
  if (!passage || typeof passage !== 'string') return [];
  const cleanPassage = passage
    .replace(/Psalms\b/gi, 'Psalm')
    .replace(/:/g, ':')
    .replace(/\s*&\s*/g, '; ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanPassage) return [];

  // Check if book is Apocrypha (not in standard 66-book ESV audio)
  const bookNameMatch = cleanPassage.match(/^(\d?\s*[a-zA-Z\s]+?)\s+\d+/);
  const bookName = bookNameMatch ? bookNameMatch[1].trim().toLowerCase() : '';
  const apocryphaBooks = [
    '1 esdras', 'tobit', 'judith', 'wisdom', 'wisdom of solomon',
    'sirach', 'ecclesiasticus', 'baruch', '1 maccabees', '2 maccabees',
    'prayer of manasseh', 'prayer of manasses', '2 esdras'
  ];
  if (apocryphaBooks.includes(bookName)) {
    return [];
  }

  const proxyUrl = `/api/esv-audio?passage=${encodeURIComponent(cleanPassage)}`;
  const directCdnUrl = `https://audio.esv.org/hw/${encodeURIComponent(cleanPassage)}.mp3`;

  return [proxyUrl, directCdnUrl];
}

export function buildLiturgySpeechSections({
  office,
  settings,
  readings,
  sentenceIdx,
  useBenedicite,
  useAlternativeEveningCanticle1,
  useAlternativeCanticle2,
  isAthanasian,
  isAshWedOrGoodFri,
  hymnMode
}: BuilderOptions): LiturgySpeechSection[] {
  const sections: LiturgySpeechSection[] = [];

  const gloriaPatriCall = "Glory be to the Father, and to the Son : and to the Holy Ghost;";
  const gloriaPatriResponse = "As it was in the beginning, is now, and ever shall be : world without end. Amen.";

  // 1. Opening Sentence (User-provided BCP / KJV recordings)
  const sentence = openingSentences[sentenceIdx] || openingSentences[0];
  const specificSentenceAudio = OPENING_SENTENCE_AUDIO[sentenceIdx] || [];
  sections.push({
    id: 'tts-opening-sentence',
    title: 'The Opening Sentence',
    audioSrc: specificSentenceAudio[0] || LITURGICAL_AUDIO_FILES['tts-opening-sentence'],
    audioCandidates: [
      ...specificSentenceAudio,
      ...(LITURGICAL_AUDIO_CANDIDATES['tts-opening-sentence'] || [])
    ],
    parts: [{ text: sentence.text, role: 'call' }]
  });

  // 2. Exhortation
  sections.push({
    id: 'tts-exhortation',
    title: 'The Exhortation',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-exhortation'],
    parts: [{ text: exhortation.full, role: 'call' }]
  });

  // 3. A General Confession
  sections.push({
    id: 'tts-confession',
    title: 'A General Confession',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-confession'],
    parts: [{ text: confession, role: 'call' }]
  });

  // 4. The Collect for Pardon (including Amen)
  sections.push({
    id: 'tts-absolution',
    title: 'The Collect for Pardon',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-absolution'],
    audioCandidates: LITURGICAL_AUDIO_CANDIDATES['tts-absolution'] || [
      '/audio/Collect for Pardon.mp3',
      '/audio/Collect For Pardon.mp3'
    ],
    parts: [
      { text: absolutionSubstitute, role: 'call' },
      { text: 'Amen.', role: 'response' }
    ]
  });

  // 6. The Lord's Prayer
  sections.push({
    id: 'tts-lords-prayer-1',
    title: "The Lord's Prayer",
    audioSrc: LITURGICAL_AUDIO_FILES['tts-lords-prayer-1'],
    parts: [{ text: lordsPrayer, role: 'call' }]
  });

  // 7. The Versicles
  sections.push({
    id: 'tts-versicles',
    title: 'The Versicles',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-versicles'],
    parts: [
      { text: initialVersicles[0].v, role: 'call' },
      { text: initialVersicles[0].r, role: 'response' },
      { text: initialVersicles[1].v, role: 'call' },
      { text: initialVersicles[1].r, role: 'response' },
      { text: initialVersicles[2].v, role: 'call' },
      { text: initialVersicles[2].r, role: 'response' },
      { text: initialVersicles[3].v, role: 'call' },
      { text: initialVersicles[3].r, role: 'response' }
    ]
  });

  // 8. Venite (Morning only, unless Ash Wed / Good Fri)
  if (office === 'morning' && !isAshWedOrGoodFri) {
    const isVeniteHymn = !!hymnMode?.venite;
    const veniteCandidates = isVeniteHymn
      ? (HYMN_AUDIO_CANDIDATES['venite'] || ['/audio/184. Now with joyful exultation (Psalm 95).mp3'])
      : (LITURGICAL_AUDIO_CANDIDATES['tts-venite'] || ['/audio/Venite.mp3']);

    sections.push({
      id: 'tts-venite',
      title: isVeniteHymn ? 'Venite (Hymn: Psalm 95)' : 'Venite, exultemus Domino',
      isHymn: isVeniteHymn,
      audioSrc: veniteCandidates[0],
      audioCandidates: veniteCandidates,
      parts: [
        ...venite.map(verse => ({ text: verse, role: 'call' as const })),
        { text: gloriaPatriCall, role: 'call' },
        { text: gloriaPatriResponse, role: 'response' }
      ]
    });
  }

  // 9. The Psalms of the Day
  const esvCandidatesPsalms = buildEsvAudioCandidates(readings.psalms);
  sections.push({
    id: 'tts-psalms',
    title: 'The Psalms of the Day',
    isDynamic: true,
    audioSrc: esvCandidatesPsalms[0],
    audioCandidates: esvCandidatesPsalms,
    parts: [],
    getParts: () => {
      const container = document.getElementById('tts-psalms');
      const scriptureDiv = container?.querySelector('.scripture-text');
      if (scriptureDiv) {
        const text = cleanScriptureHtml(scriptureDiv.innerHTML);
        if (text) return [{ text, role: 'call' }];
      }
      return [];
    }
  });

  // 10. The First Lesson
  const esvCandidatesFirstLesson = buildEsvAudioCandidates(readings.firstLesson);
  sections.push({
    id: 'tts-first-lesson',
    title: 'The First Lesson',
    isDynamic: true,
    audioSrc: esvCandidatesFirstLesson[0],
    audioCandidates: esvCandidatesFirstLesson,
    parts: [],
    getParts: () => {
      const container = document.getElementById('tts-first-lesson');
      const scriptureDiv = container?.querySelector('.scripture-text');
      if (scriptureDiv) {
        const text = cleanScriptureHtml(scriptureDiv.innerHTML);
        if (text) return [{ text, role: 'call' }];
      }
      return [];
    }
  });

  // 11. First Canticle
  if (office === 'morning') {
    if (!useBenedicite) {
      const isTeDeumHymn = !!(hymnMode?.teDeum || hymnMode?.canticle1);
      const teDeumCandidates = isTeDeumHymn
        ? (HYMN_AUDIO_CANDIDATES['te-deum'] || ['/audio/Holy God, We Praise Your Name.mp3'])
        : (LITURGICAL_AUDIO_CANDIDATES['tts-te-deum'] || ['/audio/Te Deum.mp3']);

      sections.push({
        id: 'tts-canticle-1',
        title: isTeDeumHymn ? 'Holy God, We Praise Your Name (Te Deum)' : 'Te Deum Laudamus',
        isHymn: isTeDeumHymn,
        audioSrc: teDeumCandidates[0],
        audioCandidates: teDeumCandidates,
        parts: teDeum.map(verse => ({ text: verse, role: 'call' as const }))
      });
    } else {
      const benParts: { text: string; role: 'call' | 'response' }[] = [];
      for (let i = 0; i < benediciteVerses.length; i += 3) {
        const grp = benediciteVerses.slice(i, i + 3);
        grp.forEach(v => benParts.push({ text: v, role: 'call' }));
        benParts.push({ text: benediciteRefrain, role: 'response' });
      }
      benParts.push({ text: gloriaPatriCall, role: 'call' });
      benParts.push({ text: gloriaPatriResponse, role: 'response' });
      const isBenediciteHymn = !!hymnMode?.canticle1;
      const benediciteCandidates = isBenediciteHymn
        ? (HYMN_AUDIO_CANDIDATES['benedicite'] || ['/audio/All Creatures of Our God and King.mp3'])
        : (LITURGICAL_AUDIO_CANDIDATES['tts-benedicite'] || ['/audio/Benedicite.mp3']);
      sections.push({
        id: 'tts-canticle-1',
        title: isBenediciteHymn ? 'All Creatures of Our God and King (Benedicite)' : 'Benedicite, omnia opera',
        isHymn: isBenediciteHymn,
        audioSrc: benediciteCandidates[0],
        audioCandidates: benediciteCandidates,
        parts: benParts
      });
    }
  } else {
    // Evening Canticle 1
    if (!useAlternativeEveningCanticle1) {
      sections.push({
        id: 'tts-canticle-1',
        title: 'Magnificat',
        audioSrc: LITURGICAL_AUDIO_FILES['tts-magnificat'],
        audioCandidates: LITURGICAL_AUDIO_CANDIDATES['tts-magnificat'],
        parts: [
          ...magnificat.map(verse => ({ text: verse, role: 'call' as const })),
          { text: gloriaPatriCall, role: 'call' },
          { text: gloriaPatriResponse, role: 'response' }
        ]
      });
    } else {
      sections.push({
        id: 'tts-canticle-1',
        title: 'Cantate Domino',
        audioSrc: LITURGICAL_AUDIO_FILES['tts-cantate'],
        audioCandidates: LITURGICAL_AUDIO_CANDIDATES['tts-cantate'],
        parts: [
          ...cantateDomino.map(verse => ({ text: verse, role: 'call' as const })),
          { text: gloriaPatriCall, role: 'call' },
          { text: gloriaPatriResponse, role: 'response' }
        ]
      });
    }
  }

  // 12. Second Lesson
  const esvCandidatesSecondLesson = buildEsvAudioCandidates(readings.secondLesson);
  sections.push({
    id: 'tts-second-lesson',
    title: 'The Second Lesson',
    isDynamic: true,
    audioSrc: esvCandidatesSecondLesson[0],
    audioCandidates: esvCandidatesSecondLesson,
    parts: [],
    getParts: () => {
      const container = document.getElementById('tts-second-lesson');
      const scriptureDiv = container?.querySelector('.scripture-text');
      if (scriptureDiv) {
        const text = cleanScriptureHtml(scriptureDiv.innerHTML);
        if (text) return [{ text, role: 'call' }];
      }
      return [];
    }
  });

  // 13. Second Canticle
  if (office === 'morning') {
    if (!useAlternativeCanticle2) {
      const isBenedictusHymn = !!(hymnMode?.benedictus || hymnMode?.canticle2);
      const benedictusCandidates = isBenedictusHymn
        ? (HYMN_AUDIO_CANDIDATES['benedictus'] || ['/audio/Blest Be the God of Israel; First Methodist Houston, 11 27 22.mp3'])
        : (LITURGICAL_AUDIO_CANDIDATES['tts-benedictus'] || ['/audio/Benedictus.mp3']);

      sections.push({
        id: 'tts-canticle-2',
        title: isBenedictusHymn ? 'Blest Be the God of Israel (Benedictus)' : 'Benedictus',
        isHymn: isBenedictusHymn,
        audioSrc: benedictusCandidates[0],
        audioCandidates: benedictusCandidates,
        parts: [
          ...benedictus.map(verse => ({ text: verse, role: 'call' as const })),
          { text: gloriaPatriCall, role: 'call' },
          { text: gloriaPatriResponse, role: 'response' }
        ]
      });
    } else {
      const isJubilateHymn = !!hymnMode?.canticle2;
      const jubilateCandidates = isJubilateHymn
        ? (HYMN_AUDIO_CANDIDATES['jubilate'] || ['/audio/All People That on Earth Do Dwell.mp3'])
        : (LITURGICAL_AUDIO_CANDIDATES['tts-jubilate'] || ['/audio/spoken Jubilate Deo.mp3']);
      sections.push({
        id: 'tts-canticle-2',
        title: isJubilateHymn ? 'All People That on Earth Do Dwell (Psalm 100)' : 'Jubilate Deo',
        isHymn: isJubilateHymn,
        audioSrc: jubilateCandidates[0],
        audioCandidates: jubilateCandidates,
        parts: [
          ...jubilateDeo.map(verse => ({ text: verse, role: 'call' as const })),
          { text: gloriaPatriCall, role: 'call' },
          { text: gloriaPatriResponse, role: 'response' }
        ]
      });
    }
  } else {
    if (!useAlternativeCanticle2) {
      sections.push({
        id: 'tts-canticle-2',
        title: 'Nunc Dimittis',
        audioSrc: LITURGICAL_AUDIO_FILES['tts-nunc-dimittis'],
        audioCandidates: LITURGICAL_AUDIO_CANDIDATES['tts-nunc-dimittis'],
        parts: [
          ...nuncDimittis.map(verse => ({ text: verse, role: 'call' as const })),
          { text: gloriaPatriCall, role: 'call' },
          { text: gloriaPatriResponse, role: 'response' }
        ]
      });
    } else {
      sections.push({
        id: 'tts-canticle-2',
        title: 'Deus Misereatur',
        audioSrc: LITURGICAL_AUDIO_FILES['tts-deus-misereatur'],
        audioCandidates: LITURGICAL_AUDIO_CANDIDATES['tts-deus-misereatur'],
        parts: [
          ...deusMisereatur.map(verse => ({ text: verse, role: 'call' as const })),
          { text: gloriaPatriCall, role: 'call' },
          { text: gloriaPatriResponse, role: 'response' }
        ]
      });
    }
  }

  // 14. The Creed
  if (!isAthanasian) {
    sections.push({
      id: 'tts-creed',
      title: "The Apostles' Creed",
      audioSrc: LITURGICAL_AUDIO_FILES['tts-creed-apostles'],
      parts: [{ text: apostlesCreed, role: 'call' }]
    });
  } else {
    sections.push({
      id: 'tts-creed',
      title: 'The Creed of Saint Athanasius',
      audioSrc: LITURGICAL_AUDIO_FILES['tts-creed-athanasian'],
      parts: athanasianCreed.map(verse => ({ text: verse, role: 'call' as const }))
    });
  }

  // 15. The Lesser Litany
  sections.push({
    id: 'tts-lesser-litany',
    title: 'The Lesser Litany',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-lesser-litany'],
    parts: [
      { text: 'The Lord be with you.', role: 'call' },
      { text: 'And with thy spirit.', role: 'response' },
      { text: 'Let us pray.', role: 'call' },
      { text: 'Lord, have mercy upon us.', role: 'call' },
      { text: 'Christ, have mercy upon us.', role: 'response' },
      { text: 'Lord, have mercy upon us.', role: 'call' }
    ]
  });

  // 16. The Lord's Prayer 2
  sections.push({
    id: 'tts-lords-prayer-2',
    title: "The Lord's Prayer",
    audioSrc: LITURGICAL_AUDIO_FILES['tts-lords-prayer-2'],
    parts: [{ text: lordsPrayer, role: 'call' }]
  });

  // 17. The Suffrages
  sections.push({
    id: 'tts-suffrages',
    title: 'The Suffrages',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-suffrages'],
    parts: suffrages.flatMap(s => [
      { text: s.v, role: 'call' as const },
      { text: s.r, role: 'response' as const }
    ])
  });

  // 18. Collect of the Day
  if (readings.collect) {
    sections.push({
      id: 'tts-collect-day',
      title: 'The Collect of the Day',
      isDynamic: true,
      parts: [{ text: readings.collect, role: 'call' }]
    });
  }

  // 19. Second Collect (For Peace)
  const secondCollect = office === 'morning'
    ? "O God, who art the author of peace and lover of concord, in knowledge of whom standeth our eternal life, whose service is perfect freedom: Defend us thy humble servants in all assaults of our enemies; that we, surely trusting in thy defence, may not fear the power of any adversaries, through the might of Jesus Christ our Lord. Amen."
    : "O God, from whom all holy desires, all good counsels, and all just works do proceed: Give unto thy servants that peace which the world cannot give; that both our hearts may be set to obey thy commandments, and also that by thee we being defended from the fear of our enemies may pass our time in rest and quietness; through the merits of Jesus Christ our Saviour. Amen.";

  sections.push({
    id: 'tts-collect-second',
    title: 'The Second Collect',
    audioSrc: office === 'morning' ? LITURGICAL_AUDIO_FILES['tts-collect-peace-morning'] : LITURGICAL_AUDIO_FILES['tts-collect-peace-evening'],
    parts: [{ text: secondCollect, role: 'call' }]
  });

  // 20. Third Collect
  const thirdCollect = office === 'morning'
    ? "O Lord, our heavenly Father, Almighty and everlasting God, who hast safely brought us to the beginning of this day: Defend us in the same with thy mighty power; and grant that this day we fall into no sin, neither run into any kind of danger; but that all our doings may be ordered by thy governance, to do always that is righteous in thy sight; through Jesus Christ our Lord. Amen."
    : "Lighten our darkness, we beseech thee, O Lord; and by thy great mercy defend us from all perils and dangers of this night; for the love of thy only Son, our Saviour, Jesus Christ. Amen.";

  sections.push({
    id: 'tts-collect-third',
    title: 'The Third Collect',
    audioSrc: office === 'morning' ? LITURGICAL_AUDIO_FILES['tts-collect-grace-morning'] : LITURGICAL_AUDIO_FILES['tts-collect-aid-evening'],
    parts: [{ text: thirdCollect, role: 'call' }]
  });

  // 21. A Prayer for the President and all in Civil Authority
  sections.push({
    id: 'tts-prayer-president',
    title: 'A Prayer for the President',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-prayer-president'] || LITURGICAL_AUDIO_FILES['tts-state-prayers'],
    parts: [{ text: statePrayers.president, role: 'call' }]
  });

  // 22. A Prayer for the Clergy and People
  sections.push({
    id: 'tts-prayer-clergy',
    title: 'A Prayer for the Clergy and People',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-prayer-clergy'],
    parts: [{ text: statePrayers.clergyAndPeople, role: 'call' }]
  });

  // 22. Prayer of Saint Chrysostom
  sections.push({
    id: 'tts-st-chrysostom',
    title: 'A Prayer of Saint Chrysostom',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-st-chrysostom'],
    parts: [{ text: stChrysostom, role: 'call' }]
  });

  // 23. The Grace
  sections.push({
    id: 'tts-the-grace',
    title: 'The Grace',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-the-grace'],
    parts: [{ text: theGrace, role: 'call' }]
  });

  return sections;
}
