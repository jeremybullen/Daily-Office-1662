import { P } from './GlossaryText';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { openingSentences, exhortation, confession, absolutionSubstitute, lordsPrayer, initialVersicles, suffrages, benediciteVerses, benediciteRefrain, teDeum, apostlesCreed, athanasianCreed, jubilateDeo, cantateDomino, deusMisereatur, stChrysostom, theGrace, statePrayers } from '../content/liturgy-data';
import { isAshWednesdayOrGoodFriday, isAthanasianCreedDay } from '../utils/liturgyHelpers';
import { getReadingsForDate } from '../utils/lectionary';
import { Translation, CompletedData, OfficeType, AppSettings } from '../types';
import { BibleReading } from './BibleReading';
import { Section } from './Section';
import { SheetMusic } from './SheetMusic';
import { hymns } from '../content/hymn-data';
import { Check, Music, Info, Volume2 } from 'lucide-react';
import { buildLiturgySpeechSections } from '../utils/liturgySpeechBuilder';
import { useLiturgicalSpeech } from '../hooks/useLiturgicalSpeech';
import { AudioPlayer } from './AudioPlayer';
import { DropCapText, VersiclePair } from './LiturgicalTypography';

interface LiturgyProps {
    office: OfficeType;
    translation: Translation;
    selectedDate: Date;
    completedData: CompletedData;
    onToggleCompleted: () => void;
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    onOpenAbout?: () => void;
    onAudioStateChange?: (state: { 
        isPlaying: boolean; 
        isOpen: boolean; 
        serviceMode: 'spoken' | 'music';
        toggle: () => void;
        playSpoken: () => void;
        playMusic: () => void;
    }) => void;
}


function parsePsalms(str: string) {
    if (str.startsWith('Psalms ')) str = str.replace('Psalms ', '');
    if (str.startsWith('Psalm ')) str = str.replace('Psalm ', '');
    if (str.includes(':')) return ['Psalm ' + str];
    if (str.includes('-')) {
        const parts = str.split('-');
        const start = parseInt(parts[0]);
        const end = parseInt(parts[1]);
        const arr = [];
        for (let i = start; i <= end; i++) arr.push('Psalm ' + i);
        return arr;
    }
    if (str.includes(',')) return str.split(',').map(s => 'Psalm ' + s.trim());
    return ['Psalm ' + str];
}

export function Liturgy({ office, translation, selectedDate, completedData, onToggleCompleted, settings, updateSettings, onOpenAbout, onAudioStateChange }: LiturgyProps) {

    const [sentenceIdx, setSentenceIdx] = useState(() => Math.floor(Math.random() * openingSentences.length));
    const [useBenedicite, setUseBenedicite] = useState(() => Math.random() < 0.5);
    const [useAlternativeEveningCanticle1, setUseAlternativeEveningCanticle1] = useState(() => Math.random() < 0.5);
    const [useAlternativeCanticle2, setUseAlternativeCanticle2] = useState(() => Math.random() < 0.5);
    const [hymnMode, setHymnMode] = useState<Record<string, boolean>>({});
    const [serviceAudioMode, setServiceAudioMode] = useState<'spoken' | 'music'>('spoken');
    const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
    
    const isAthanasian = office === 'morning' && isAthanasianCreedDay(selectedDate);
    
    const toggleHymn = (id: string, e?: any) => {
        if (e && e.stopPropagation) e.stopPropagation(); // prevent parent onClick
        setHymnMode(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const isAshWedOrGoodFri = isAshWednesdayOrGoodFriday(selectedDate);
    const isSunday = selectedDate.getDay() === 0;

    const modifiedSuffrages = suffrages;

    // Determine current section's completed status
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const isCompleted = completedData[dateKey]?.[office] ?? false;

    const readings = useMemo(() => getReadingsForDate(selectedDate, office), [office, selectedDate]);
    
    const [useFirstAlt, setUseFirstAlt] = useState(false);
    const [useSecondAlt, setUseSecondAlt] = useState(false);

    const speechSections = useMemo(() => {
        return buildLiturgySpeechSections({
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
        });
    }, [
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
    ]);

    const speech = useLiturgicalSpeech({ sections: speechSections });

    const handlePlaySpoken = useCallback(() => {
        setServiceAudioMode('spoken');
        setHymnMode({
            venite: false,
            canticle1: false,
            canticle2: false
        });
        setIsAudioPlayerOpen(true);
        setTimeout(() => {
            speech.play();
        }, 40);
    }, [speech]);

    const handlePlayMusic = useCallback(() => {
        setServiceAudioMode('music');
        setHymnMode({
            venite: true,
            canticle1: true,
            canticle2: true
        });
        setIsAudioPlayerOpen(true);
        setTimeout(() => {
            speech.play();
        }, 40);
    }, [speech]);

    const handleToggleServiceMode = useCallback(() => {
        if (serviceAudioMode === 'music') {
            handlePlaySpoken();
        } else {
            handlePlayMusic();
        }
    }, [serviceAudioMode, handlePlaySpoken, handlePlayMusic]);

    // Sync audio state to parent / header
    useEffect(() => {
        if (onAudioStateChange) {
            onAudioStateChange({
                isPlaying: speech.isPlaying && !speech.isPaused,
                isOpen: isAudioPlayerOpen,
                serviceMode: serviceAudioMode,
                toggle: () => {
                    if (!isAudioPlayerOpen) {
                        setIsAudioPlayerOpen(true);
                        speech.play();
                    } else if (speech.isPlaying && !speech.isPaused) {
                        speech.pause();
                    } else {
                        speech.play();
                    }
                },
                playSpoken: handlePlaySpoken,
                playMusic: handlePlayMusic
            });
        }
    }, [speech.isPlaying, speech.isPaused, isAudioPlayerOpen, serviceAudioMode, onAudioStateChange, speech.play, speech.pause, handlePlaySpoken, handlePlayMusic]);

    // Stop speech and pick a random opening sentence and canticles when office or date changes
    useEffect(() => {
        speech.stop();
        setIsAudioPlayerOpen(false);
        setSentenceIdx(prev => {
            const count = openingSentences.length;
            if (count <= 1) return 0;
            let next = Math.floor(Math.random() * count);
            if (next === prev) next = (next + 1) % count;
            return next;
        });
        // Randomly select between the canticles like the opening sentences
        setUseBenedicite(Math.random() < 0.5);
        setUseAlternativeEveningCanticle1(Math.random() < 0.5);
        setUseAlternativeCanticle2(Math.random() < 0.5);
    }, [office, selectedDate]);

    const getHighlightClass = (sectionId: string, baseClass: string = '') => {
        const isCurrent = speech.isPlaying && speech.currentSectionId === sectionId;
        return `${baseClass} transition-all duration-300 ${isCurrent ? 'bg-amber-500/[0.04] p-3 -mx-3 rounded-2xl ring-1 ring-amber-500/20' : ''}`;
    };

    useEffect(() => {
        setUseFirstAlt(false);
        setUseSecondAlt(false);
    }, [office, selectedDate]);

    const activeFirstLesson = useFirstAlt && readings.firstLessonAlt ? readings.firstLessonAlt : readings.firstLesson;
    const activeSecondLesson = useSecondAlt && readings.secondLessonAlt ? readings.secondLessonAlt : readings.secondLesson;

    const handleNextSentence = () => {
        setSentenceIdx(prev => {
            const count = openingSentences.length;
            if (count <= 1) return 0;
            let next = Math.floor(Math.random() * count);
            if (next === prev) next = (next + 1) % count;
            return next;
        });
    };

    
    const activeCanticle1 = office === 'morning' ? (useBenedicite ? 'benedicite' : 'teDeum') : (useAlternativeEveningCanticle1 ? 'cantate' : 'magnificat');
    const activeCanticle2 = office === 'morning' ? (useAlternativeCanticle2 ? 'jubilate' : 'benedictus') : (useAlternativeCanticle2 ? 'deusMisereatur' : 'nuncDimittis');

    // Group benedicite into stanzas of 3
    const benediciteGroups = [];
    for (let i = 0; i < benediciteVerses.length; i += 3) {
        benediciteGroups.push(benediciteVerses.slice(i, i + 3));
    }

    return (
        
        <main className="w-full max-w-[900px] mx-auto px-6 pt-24 sm:pt-32 pb-32">
             <div className="mb-16 md:mb-24 text-center">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">The Order for {office === 'morning' ? 'Morning' : 'Evening'} Prayer</h1>
                <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="font-semibold opacity-70 text-sm sm:text-base tracking-widest uppercase font-serif">
                        {readings.dayTitle || readings.liturgicalWeek}
                    </p>
                    {readings.commemoration && readings.commemoration !== readings.dayTitle && (
                        <p className="rubric font-serif italic text-sm sm:text-base">
                            {readings.commemoration}
                        </p>
                    )}
                </div>
             </div>

             
             {/* Sentences */}
             <Section id="tts-opening-sentence" className={getHighlightClass('tts-opening-sentence')} title="The Opening Sentence" metadata={openingSentences[sentenceIdx].citation} onTitleClick={handleNextSentence}>
                <div className="select-none">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={sentenceIdx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DropCapText text={openingSentences[sentenceIdx].text} />
                        </motion.p>
                    </AnimatePresence>
                </div>
             </Section>

             {/* Exhortation */}
             <Section id="tts-exhortation" className={getHighlightClass('tts-exhortation')} title="The Exhortation">
                 <P className="liturgical-prose"><DropCapText text={exhortation.full} /></P>
             </Section>

             {/* Confession */}
             <Section 
                 id="tts-confession"
                 className={getHighlightClass('tts-confession')}
                 title="A General Confession"
                 rubric="of the whole Congregation after the Minister, all kneeling."
             >
                 <P className="liturgical-prose"><DropCapText text={confession} /></P>
             </Section>

             {/* Collect for Pardon & Amen */}
             <div id="tts-absolution" className={`mb-12 md:mb-16 scroll-mt-24 ${getHighlightClass('tts-absolution')}`}>
                 {/* The Collect for Pardon */}
                 <div className="flex flex-col md:flex-row gap-2 md:gap-12 mb-6 md:mb-8">
                     <div className="md:w-1/4 md:text-right md:shrink-0 md:pt-1.5 mb-4 md:mb-0">
                         <h3 className="font-semibold text-xs md:text-sm uppercase tracking-widest opacity-80 mb-2">
                             The Collect for Pardon
                         </h3>
                         <div className="rubric text-sm space-y-2 opacity-90">
                             The Minister or person saying the Service shall read the Collect for Pardon, that person and the people still kneeling.
                         </div>
                     </div>
                     <div className="md:w-3/4 flex-1">
                         <P className="liturgical-prose"><DropCapText text={absolutionSubstitute} /></P>
                     </div>
                 </div>

                 {/* Amen Rubric and Response */}
                 <div className="flex flex-col md:flex-row gap-2 md:gap-12">
                     <div className="md:w-1/4 md:text-right md:shrink-0 md:pt-1.5 mb-4 md:mb-0">
                         <div className="rubric text-sm space-y-2 opacity-90">
                             The people shall answer here, and at the end of all other prayers,
                         </div>
                     </div>
                     <div className="md:w-3/4 flex-1">
                         <P className="font-bold">Amen.</P>
                     </div>
                 </div>
             </div>

             {/* Lord's Prayer */}
             <Section 
                 id="tts-lords-prayer-1"
                 className={getHighlightClass('tts-lords-prayer-1')}
                 title="The Lord's Prayer"
                 rubric="Then the Minister shall kneel, and say the Lord's Prayer with an audible voice; the people also kneeling, and repeating it with him, both here, and wheresoever else it is used in Divine Service."
             >
                 <P className="liturgical-prose"><DropCapText text={lordsPrayer} /></P>
             </Section>

             {/* Versicles & Gloria Patri */}
             <div id="tts-versicles" className={`mb-12 md:mb-16 scroll-mt-24 ${getHighlightClass('tts-versicles')}`}>
                 {/* First Part: The Versicles */}
                 <div className="flex flex-col md:flex-row gap-2 md:gap-12 mb-6 md:mb-8">
                     <div className="md:w-1/4 md:text-right md:shrink-0 md:pt-1.5 mb-4 md:mb-0">
                         <h3 className="font-semibold text-xs md:text-sm uppercase tracking-widest opacity-80 mb-2">
                             The Versicles
                         </h3>
                     </div>
                     <div className="md:w-3/4 flex-1">
                         <div className="space-y-3">
                             {initialVersicles.slice(0, 2).map((v, i) => (
                                 <VersiclePair key={i} v={v.v} r={v.r} />
                             ))}
                         </div>
                     </div>
                 </div>

                 {/* Second Part: Standing Rubric & Gloria Patri */}
                 <div className="flex flex-col md:flex-row gap-2 md:gap-12">
                     <div className="md:w-1/4 md:text-right md:shrink-0 md:pt-1.5 mb-4 md:mb-0">
                         <div className="rubric text-sm space-y-2 opacity-90">
                             Here, all standing up.
                         </div>
                     </div>
                     <div className="md:w-3/4 flex-1">
                         <div className="space-y-3">
                             {initialVersicles.slice(2).map((v, i) => (
                                 <VersiclePair key={i} v={v.v} r={v.r} />
                             ))}
                         </div>
                     </div>
                 </div>
             </div>

             {/* Venite (Morning only, unless Ash Wed/Good Fri) */}
             {office === 'morning' && !isAshWedOrGoodFri && (
                 <Section 
                     id="tts-venite"
                     className={getHighlightClass('tts-venite')}
                     title="Venite, exultemus Domino" 
                     metadata="Psalm 95."
                     leftAction={
                         <button onClick={(e) => toggleHymn('venite', e)} className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full border border-black/10 dark:border-white/10">
                             <Music size={12} />
                             {hymnMode['venite'] ? "Prose Text" : "Hymn Version"}
                         </button>
                     }
                 >
                     {hymnMode['venite'] ? (
                         <SheetMusic title={hymns.venite.title} imageUrl={hymns.venite.imageUrl} audioUrl={hymns.venite.audioUrl} extraVerses={hymns.venite.extraVerses} />
                     ) : (
                         <div className="animate-in fade-in duration-500 space-y-1 leading-normal">
                            <P><DropCapText text="O come, let us sing unto the Lord : let us heartily rejoice in the strength of our salvation." /></P>
                            <P>Let us come before his presence with thanksgiving : and shew ourselves glad in him with Psalms.</P>
                            <P>For the Lord is a great God : and a great King above all gods.</P>
                            <P>In his hand are all the corners of the earth : and the strength of the hills is his also.</P>
                            <P>The sea is his, and he made it : and his hands prepared the dry land.</P>
                            <P>O come, let us worship, and fall down : and kneel before the Lord our Maker.</P>
                            <P>For he is the Lord our God : and we are the people of his pasture, and the sheep of his hand.</P>
                            <P>To day if ye will hear his voice, harden not your hearts : as in the provocation, and as in the day of temptation in the wilderness;</P>
                            <P>When your fathers tempted me : proved me, and saw my works.</P>
                            <P>Forty years long was I grieved with this generation, and said : It is a people that do err in their hearts, for they have not known my ways;</P>
                            <P>Unto whom I sware in my wrath : that they should not enter into my rest.</P>
                            <P className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</P>
                            <P className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</P>
                         </div>
                     )}
                 </Section>
             )}

             {/* Psalms */}
             <BibleReading 
                 id="tts-psalms"
                 title="The Psalms of the Day" 
                 metadata={readings.psalms}
                 passage={readings.psalms} 
                 translation={translation} 
             />

             {/* First Lesson */}
             <BibleReading 
                 id="tts-first-lesson"
                 title="The First Lesson" 
                 metadata={readings.firstLessonAlt ? `${activeFirstLesson} (or: ${useFirstAlt ? readings.firstLesson : readings.firstLessonAlt})` : activeFirstLesson}
                 passage={activeFirstLesson} 
                 translation={translation} 
                 onTitleClick={readings.firstLessonAlt ? () => setUseFirstAlt(prev => !prev) : undefined}
             />
             
             {/* Canticle 1 */}
             <Section 
                 id="tts-canticle-1"
                 className={getHighlightClass('tts-canticle-1')}
                 title={office === 'morning' ? (useBenedicite ? "Benedicite, omnia opera" : "Te Deum Laudamus") : (useAlternativeEveningCanticle1 ? "Cantate Domino" : "Magnificat")}
                 metadata={office === 'morning' ? (useBenedicite ? "Song of the Three Children (or: Te Deum)" : "An Ancient Hymn (or: Benedicite)") : (useAlternativeEveningCanticle1 ? "Psalm 98. (or: Magnificat)" : "Luke 1. (or: Cantate Domino)")}
                 onTitleClick={office === 'morning' ? () => setUseBenedicite(!useBenedicite) : () => setUseAlternativeEveningCanticle1(!useAlternativeEveningCanticle1)}
                 leftAction={
                     <button onClick={(e) => toggleHymn('canticle1', e)} className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full border border-black/10 dark:border-white/10">
                         <Music size={12} />
                         {hymnMode['canticle1'] ? "Prose Text" : "Hymn Version"}
                     </button>
                 }
             >
                 {hymnMode['canticle1'] ? (
                     <SheetMusic title={hymns[activeCanticle1]?.title} imageUrl={hymns[activeCanticle1].imageUrl} audioUrl={hymns[activeCanticle1]?.audioUrl} extraVerses={hymns[activeCanticle1].extraVerses} />
                 ) : office === 'morning' ? (
                     <div className="select-none">
                        {!useBenedicite ? (
                            <div className="animate-in fade-in duration-500">
                                <div className="space-y-1 leading-normal">
                                    {teDeum.map((verse, i) => <P key={i}>{i === 0 ? <DropCapText text={verse} /> : verse}</P>)}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-500">
                                {benediciteGroups.map((group, i) => (
                                    <div key={i} className="mb-4 sm:mb-5">
                                        <div className="space-y-0.5 sm:space-y-1 mb-1.5">
                                            {group.map((v, j) => <P key={j} className="leading-normal">{i === 0 && j === 0 ? <DropCapText text={v} /> : v}</P>)}
                                        </div>
                                        <P className="font-bold opacity-90 leading-normal">{benediciteRefrain}</P>
                                    </div>
                                ))}
                                <div className="mt-5">
                                    <P className="leading-normal">Glory be to the Father, and to the Son : and to the Holy Ghost;</P>
                                    <P className="leading-normal font-bold mt-0.5">As it was in the beginning, is now, and ever shall be : world without end. Amen.</P>
                                </div>
                            </div>
                        )}
                     </div>
                 ) : (
                     <div className="select-none">
                         {!useAlternativeEveningCanticle1 ? (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-normal">
                                <P><DropCapText text="My soul doth magnify the Lord : and my spirit hath rejoiced in God my Saviour." /></P>
                                <P>For he hath regarded : the lowliness of his hand-maiden.</P>
                                <P>For behold, from henceforth : all generations shall call me blessed.</P>
                                <P>For he that is mighty hath magnified me : and holy is his Name.</P>
                                <P>And his mercy is on them that fear him : throughout all generations.</P>
                                <P>He hath shewed strength with his arm : he hath scattered the proud in the imagination of their hearts.</P>
                                <P>He hath put down the mighty from their seat : and hath exalted the humble and meek.</P>
                                <P>He hath filled the hungry with good things : and the rich he hath sent empty away.</P>
                                <P>He remembering his mercy hath holpen his servant Israel : as he promised to our forefathers, Abraham and his seed, for ever.</P>
                                <P className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</P>
                                <P className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</P>
                             </div>
                         ) : (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-normal">
                                 {cantateDomino.map((verse, i) => <P key={i}>{i === 0 ? <DropCapText text={verse} /> : verse}</P>)}
                                 <P className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</P>
                                 <P className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</P>
                             </div>
                         )}
                     </div>
                 )}
             </Section>
             {/* Second Lesson and Canticle 2 */}
             <BibleReading 
                 title="The Second Lesson" 
                 metadata={readings.secondLessonAlt ? `${activeSecondLesson} (or: ${useSecondAlt ? readings.secondLesson : readings.secondLessonAlt})` : activeSecondLesson}
                 passage={activeSecondLesson} 
                 translation={translation} 
                 onTitleClick={readings.secondLessonAlt ? () => setUseSecondAlt(prev => !prev) : undefined}
             />
             <Section 
                 title={office === 'morning' ? (useAlternativeCanticle2 ? "Jubilate Deo" : "Benedictus") : (useAlternativeCanticle2 ? "Deus Misereatur" : "Nunc Dimittis")}
                 metadata={office === 'morning' ? (useAlternativeCanticle2 ? "Psalm 100. (or: Benedictus)" : "Luke 1:68. (or: Jubilate Deo)") : (useAlternativeCanticle2 ? "Psalm 67. (or: Nunc Dimittis)" : "Luke 2:29. (or: Deus Misereatur)")}
                 onTitleClick={() => setUseAlternativeCanticle2(!useAlternativeCanticle2)}
                 leftAction={
                     <button onClick={(e) => toggleHymn('canticle2', e)} className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full border border-black/10 dark:border-white/10">
                         <Music size={12} />
                         {hymnMode['canticle2'] ? "Prose Text" : "Hymn Version"}
                     </button>
                 }
             >
                 {hymnMode['canticle2'] ? (
                     <SheetMusic title={hymns[activeCanticle2]?.title} imageUrl={hymns[activeCanticle2].imageUrl} audioUrl={hymns[activeCanticle2]?.audioUrl} extraVerses={hymns[activeCanticle2].extraVerses} />
                 ) : (
                 <div className="select-none">
                     {office === 'morning' ? (
                         !useAlternativeCanticle2 ? (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-normal">
                                 <P><DropCapText text="Blessed be the Lord God of Israel : for he hath visited, and redeemed his people;" /></P>
                                 <P>And hath raised up a mighty salvation for us : in the house of his servant David;</P>
                                 <P>As he spake by the mouth of his holy Prophets : which have been since the world began;</P>
                                 <P>That we should be saved from our enemies : and from the hands of all that hate us;</P>
                                 <P>To perform the mercy promised to our forefathers : and to remember his holy Covenant;</P>
                                 <P>To perform the oath which he sware to our forefather Abraham : that he would give us;</P>
                                 <P>That we being delivered out of the hands of our enemies : might serve him without fear;</P>
                                 <P>In holiness and righteousness before him : all the days of our life.</P>
                                 <P>And thou, Child, shalt be called the Prophet of the Highest : for thou shalt go before the face of the Lord to prepare his ways;</P>
                                 <P>To give knowledge of salvation unto his people : for the remission of their sins,</P>
                                 <P>Through the tender mercy of our God : whereby the day-spring from on high hath visited us;</P>
                                 <P>To give light to them that sit in darkness, and in the shadow of death : and to guide our feet into the way of peace.</P>
                                 <P className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</P>
                                 <P className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</P>
                             </div>
                         ) : (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-normal">
                                 {jubilateDeo.map((verse, i) => <P key={i}>{i === 0 ? <DropCapText text={verse} /> : verse}</P>)}
                                 <P className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</P>
                                 <P className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</P>
                             </div>
                         )
                     ) : (
                         !useAlternativeCanticle2 ? (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-normal">
                                 <P><DropCapText text="Lord, now lettest thou thy servant depart in peace : according to thy word." /></P>
                                 <P>For mine eyes have seen : thy salvation,</P>
                                 <P>Which thou hast prepared : before the face of all people;</P>
                                 <P>To be a light to lighten the Gentiles : and to be the glory of thy people Israel.</P>
                                 <P className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</P>
                                 <P className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</P>
                             </div>
                         ) : (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-normal">
                                 {deusMisereatur.map((verse, i) => <P key={i}>{i === 0 ? <DropCapText text={verse} /> : verse}</P>)}
                                 <P className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</P>
                                 <P className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</P>
                             </div>
                         )
                     )}
                 </div>
                 )}
             </Section>

             {/* Creed */}
             <Section 
                 title={isAthanasian ? "The Creed of Saint Athanasius" : "The Apostles' Creed"}
                 metadata={isAthanasian ? "Quicunque vult." : ""}
                 rubric={isAthanasian ? "sung or said at Morning Prayer, instead of the Apostles' Creed, by the Minister and people standing." : "by the Minister and the people, standing."}
             >
                 <div className="select-none">
                     {!isAthanasian ? (
                         <div className="animate-in fade-in duration-500">
                             <P className="liturgical-prose"><DropCapText text={apostlesCreed} /></P>
                         </div>
                     ) : (
                         <div className="animate-in fade-in duration-500 space-y-1 leading-normal">
                             {athanasianCreed.map((verse, i) => <P key={i}>{i === 0 ? <DropCapText text={verse} /> : verse}</P>)}
                         </div>
                     )}
                 </div>
             </Section>

             {/* Lesser Litany */}
             <Section title="The Lesser Litany">
                 <div className="space-y-4">
                     <VersiclePair v="The Lord be with you." r="And with thy spirit." />
                     <P className="rubric">Let us pray.</P>
                     <div className="space-y-1">
                         <P className="flex items-baseline gap-2.5">
                             <span className="rubric select-none font-serif text-[0.95em] shrink-0 font-normal">Priest.</span>
                             <span className="flex-1">Lord, have mercy upon us.</span>
                         </P>
                         <P className="font-bold flex items-baseline gap-2.5">
                             <span className="rubric select-none font-serif text-[0.95em] shrink-0 font-normal">Answer.</span>
                             <span className="flex-1">Christ, have mercy upon us.</span>
                         </P>
                         <P className="flex items-baseline gap-2.5">
                             <span className="rubric select-none font-serif text-[0.95em] shrink-0 font-normal">Priest.</span>
                             <span className="flex-1">Lord, have mercy upon us.</span>
                         </P>
                     </div>
                 </div>
             </Section>
             
             {/* Lord's Prayer 2 */}
             <Section title="The Lord's Prayer">
                 <div className="animate-in fade-in duration-500">
                     <P className="liturgical-prose"><DropCapText text={lordsPrayer} /></P>
                 </div>
             </Section>

             {/* Suffrages */}
             <Section id="tts-suffrages" className={getHighlightClass('tts-suffrages')} title="The Suffrages">
                 <div className="space-y-3">
                     {suffrages.map((v, i) => (
                         <VersiclePair key={i} v={v.v} r={v.r} />
                     ))}
                 </div>
             </Section>

             {/* Collects */}
             <Section id="tts-collect-day" className={getHighlightClass('tts-collect-day')} title="The Collect of the Day" metadata={readings.feastName || readings.liturgicalWeek}>
                 <P className="liturgical-prose"><DropCapText text={readings.collect} /></P>
             </Section>
                 
             <Section id="tts-collect-second" className={getHighlightClass('tts-collect-second')} title="The Second Collect" metadata={office === 'morning' ? "For Peace." : "For Peace."}>
                 {office === 'morning' ? (
                     <P className="liturgical-prose"><DropCapText text="O God, who art the author of peace and lover of concord, in knowledge of whom standeth our eternal life, whose service is perfect freedom: Defend us thy humble servants in all assaults of our enemies; that we, surely trusting in thy defence, may not fear the power of any adversaries, through the might of Jesus Christ our Lord. Amen." /></P>
                 ) : (
                     <P className="liturgical-prose"><DropCapText text="O God, from whom all holy desires, all good counsels, and all just works do proceed: Give unto thy servants that peace which the world cannot give; that both our hearts may be set to obey thy commandments, and also that by thee we being defended from the fear of our enemies may pass our time in rest and quietness; through the merits of Jesus Christ our Saviour. Amen." /></P>
                 )}
             </Section>

             <Section id="tts-collect-third" className={getHighlightClass('tts-collect-third')} title="The Third Collect" metadata={office === 'morning' ? "For Grace." : "For Aid against all Perils."}>
                 {office === 'morning' ? (
                     <P className="liturgical-prose"><DropCapText text="O Lord, our heavenly Father, Almighty and everlasting God, who hast safely brought us to the beginning of this day: Defend us in the same with thy mighty power; and grant that this day we fall into no sin, neither run into any kind of danger; but that all our doings may be ordered by thy governance, to do always that is righteous in thy sight; through Jesus Christ our Lord. Amen." /></P>
                 ) : (
                     <P className="liturgical-prose"><DropCapText text="Lighten our darkness, we beseech thee, O Lord; and by thy great mercy defend us from all perils and dangers of this night; for the love of thy only Son, our Saviour, Jesus Christ. Amen." /></P>
                 )}
             </Section>

             {/* State Prayers */}
             <Section id="tts-prayer-president" className={getHighlightClass('tts-prayer-president')} title="A Prayer for the President and all in Civil Authority">
                 <P className="liturgical-prose"><DropCapText text={statePrayers.president} /></P>
             </Section>
                     
             <Section id="tts-prayer-clergy" className={getHighlightClass('tts-prayer-clergy')} title="A Prayer for the Clergy and People">
                 <P className="liturgical-prose"><DropCapText text={statePrayers.clergyAndPeople} /></P>
             </Section>

             {/* Prayer of St Chrysostom */}
             <Section id="tts-st-chrysostom" className={getHighlightClass('tts-st-chrysostom')} title="A Prayer of Saint Chrysostom">
                 <P className="liturgical-prose"><DropCapText text={stChrysostom} /></P>
             </Section>

             {/* The Grace */}
             <Section id="tts-the-grace" className={getHighlightClass('tts-the-grace')} title="The Grace" metadata="2 Corinthians 13:14">
                 <P className="liturgical-prose"><DropCapText text={theGrace} /></P>
             </Section>
             
             <div className="text-center my-12 md:my-16 select-none">
                 <div className="liturgical-fleuron text-base mb-3 opacity-75">❦  ✠  ❦</div>
                 <p className="font-serif italic text-base md:text-lg opacity-85">
                     Here endeth the Order of {office === 'morning' ? 'Morning' : 'Evening'} Prayer throughout the Year.
                 </p>
             </div>
             
             <div className="py-8 flex flex-col items-center gap-3">
                 <button
                     onClick={onToggleCompleted}
                     className={`
                         flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300
                         ${isCompleted 
                             ? 'bg-black text-white dark:bg-white dark:text-black scale-105' 
                             : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
                         }
                     `}
                 >
                     <Check size={18} className={`transition-transform duration-300 ${isCompleted ? 'scale-100 opacity-100' : 'scale-75 opacity-50'}`} />
                     {isCompleted ? 'Office Completed' : 'Mark as Completed'}
                 </button>

                 {onOpenAbout && (
                     <button
                         type="button"
                         onClick={onOpenAbout}
                         className="text-xs opacity-65 hover:opacity-100 transition-opacity flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                     >
                         <Info size={13} />
                         <span>About</span>
                     </button>
                 )}
             </div>
             
             {/* Audio Floating Controller */}
             <AudioPlayer
                 isOpen={isAudioPlayerOpen}
                 isPlaying={speech.isPlaying}
                 isPaused={speech.isPaused}
                 isCurrentHymn={speech.isCurrentHymn}
                 serviceMode={serviceAudioMode}
                 onToggleServiceMode={handleToggleServiceMode}
                 onSelectSpoken={handlePlaySpoken}
                 onSelectHymns={handlePlayMusic}
                 currentSectionTitle={speech.currentSectionTitle}
                 currentSectionIndex={speech.currentSectionIndex}
                 totalSections={speech.totalSections}
                 rate={speech.rate}
                 onPlay={speech.play}
                 onPause={speech.pause}
                 onStop={speech.stop}
                 onNext={speech.nextSection}
                 onPrev={speech.prevSection}
                 onChangeRate={speech.changeRate}
                 onClose={() => setIsAudioPlayerOpen(false)}
             />

             <div className="h-16"></div>
        </main>
    );
}
