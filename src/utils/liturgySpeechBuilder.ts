import { LiturgySpeechSection, cleanScriptureHtml } from './speechEngine';
import { 
  openingSentences, 
  exhortation, 
  confession, 
  priestlyAbsolution, 
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
import { LITURGICAL_AUDIO_FILES } from './liturgicalAudioManifest';

interface BuilderOptions {
  office: OfficeType;
  settings: AppSettings;
  readings: DailyReadings;
  sentenceIdx: number;
  usePriestlyAbsolution: boolean;
  useBenedicite: boolean;
  useAlternativeEveningCanticle1: boolean;
  useAlternativeCanticle2: boolean;
  isAthanasian: boolean;
  useAmericanStatePrayers: boolean;
  isAshWedOrGoodFri: boolean;
}

export function buildLiturgySpeechSections({
  office,
  settings,
  readings,
  sentenceIdx,
  usePriestlyAbsolution,
  useBenedicite,
  useAlternativeEveningCanticle1,
  useAlternativeCanticle2,
  isAthanasian,
  useAmericanStatePrayers,
  isAshWedOrGoodFri
}: BuilderOptions): LiturgySpeechSection[] {
  const sections: LiturgySpeechSection[] = [];

  const gloriaPatriCall = "Glory be to the Father, and to the Son : and to the Holy Ghost;";
  const gloriaPatriResponse = "As it was in the beginning, is now, and ever shall be : world without end. Amen.";

  // 1. Opening Sentence
  const sentence = openingSentences[sentenceIdx] || openingSentences[0];
  sections.push({
    id: 'tts-opening-sentence',
    title: 'The Opening Sentence',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-opening-sentence'],
    parts: [{ text: sentence.text, role: 'call' }]
  });

  // 2. Exhortation (Full form only)
  if (!settings.useShortForm) {
    sections.push({
      id: 'tts-exhortation',
      title: 'The Exhortation',
      audioSrc: LITURGICAL_AUDIO_FILES['tts-exhortation'],
      parts: [{ text: exhortation.full, role: 'call' }]
    });
  }

  // 3. A General Confession
  sections.push({
    id: 'tts-confession',
    title: 'A General Confession',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-confession'],
    parts: [{ text: confession, role: 'call' }]
  });

  // 4. The Absolution (or Collect for Pardon)
  sections.push({
    id: 'tts-absolution',
    title: usePriestlyAbsolution ? 'The Absolution' : 'The Collect for Pardon',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-absolution'],
    parts: [
      { text: usePriestlyAbsolution ? priestlyAbsolution : absolutionSubstitute, role: 'call' }
    ]
  });

  // 5. Amen Response
  sections.push({
    id: 'tts-absolution-amen',
    title: 'The Response',
    audioSrc: LITURGICAL_AUDIO_FILES['tts-absolution-amen'],
    parts: [{ text: 'Amen.', role: 'response' }]
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

  // 8. Venite (Morning only, unless Ash Wed / Good Fri, and unless short form)
  if (office === 'morning' && !isAshWedOrGoodFri && !settings.useShortForm) {
    sections.push({
      id: 'tts-venite',
      title: 'Venite, exultemus Domino',
      audioSrc: LITURGICAL_AUDIO_FILES['tts-venite'],
      parts: [
        ...venite.map(verse => ({ text: verse, role: 'call' as const })),
        { text: gloriaPatriCall, role: 'call' },
        { text: gloriaPatriResponse, role: 'response' }
      ]
    });
  }

  // 9. The Psalms of the Day (dynamically reads from loaded scripture DOM)
  sections.push({
    id: 'tts-psalms',
    title: settings.useShortForm ? 'The Psalm' : 'The Psalms of the Day',
    isDynamic: true,
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
  sections.push({
    id: 'tts-first-lesson',
    title: settings.useShortForm ? 'The Lesson' : 'The First Lesson',
    isDynamic: true,
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
      sections.push({
        id: 'tts-canticle-1',
        title: 'Te Deum Laudamus',
        audioSrc: LITURGICAL_AUDIO_FILES['tts-te-deum'],
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
      sections.push({
        id: 'tts-canticle-1',
        title: 'Benedicite, omnia opera',
        audioSrc: LITURGICAL_AUDIO_FILES['tts-benedicite'],
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
        parts: [
          ...cantateDomino.map(verse => ({ text: verse, role: 'call' as const })),
          { text: gloriaPatriCall, role: 'call' },
          { text: gloriaPatriResponse, role: 'response' }
        ]
      });
    }
  }

  // 12. Second Lesson (Full form only)
  if (!settings.useShortForm) {
    sections.push({
      id: 'tts-second-lesson',
      title: 'The Second Lesson',
      isDynamic: true,
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
        sections.push({
          id: 'tts-canticle-2',
          title: 'Benedictus',
          audioSrc: LITURGICAL_AUDIO_FILES['tts-benedictus'],
          parts: [
            ...benedictus.map(verse => ({ text: verse, role: 'call' as const })),
            { text: gloriaPatriCall, role: 'call' },
            { text: gloriaPatriResponse, role: 'response' }
          ]
        });
      } else {
        sections.push({
          id: 'tts-canticle-2',
          title: 'Jubilate Deo',
          audioSrc: LITURGICAL_AUDIO_FILES['tts-jubilate'],
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
          parts: [
            ...deusMisereatur.map(verse => ({ text: verse, role: 'call' as const })),
            { text: gloriaPatriCall, role: 'call' },
            { text: gloriaPatriResponse, role: 'response' }
          ]
        });
      }
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

  // 16. The Lord's Prayer 2 (Full form only)
  if (!settings.useShortForm) {
    sections.push({
      id: 'tts-lords-prayer-2',
      title: "The Lord's Prayer",
      audioSrc: LITURGICAL_AUDIO_FILES['tts-lords-prayer-2'],
      parts: [{ text: lordsPrayer, role: 'call' }]
    });
  }

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

  // 21. State Prayers (Full form only)
  if (!settings.useShortForm) {
    if (useAmericanStatePrayers) {
      sections.push({
        id: 'tts-state-prayers',
        title: 'Prayer for Civil Authority',
        audioSrc: LITURGICAL_AUDIO_FILES['tts-state-prayers-president'],
        parts: [
          { text: statePrayers.president, role: 'call' },
          { text: statePrayers.clergyAndPeople, role: 'call' }
        ]
      });
    } else {
      sections.push({
        id: 'tts-state-prayers',
        title: 'State Prayers',
        audioSrc: LITURGICAL_AUDIO_FILES['tts-state-prayers-king'],
        parts: [
          { text: statePrayers.kingsMajesty, role: 'call' },
          { text: statePrayers.royalFamily, role: 'call' },
          { text: statePrayers.clergyAndPeople, role: 'call' }
        ]
      });
    }
  }

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
