import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { openingSentences, exhortation, confession, absolutionSubstitute, priestlyAbsolution, lordsPrayer, initialVersicles, suffrages, benediciteVerses, benediciteRefrain, teDeum, apostlesCreed, athanasianCreed, jubilateDeo, cantateDomino, deusMisereatur, stChrysostom, theGrace, statePrayers, generalThanksgiving } from '../content/liturgy-data';
import { isAshWednesdayOrGoodFriday } from '../utils/liturgyHelpers';
import { getReadingsForDate } from '../utils/lectionary';
import { Translation, CompletedData, OfficeType } from '../types';
import { BibleReading } from './BibleReading';
import { Section } from './Section';
import { SheetMusic } from './SheetMusic';
import { hymns } from '../content/hymn-data';
import { Check, Music } from 'lucide-react';

interface LiturgyProps {
    office: OfficeType;
    translation: Translation;
    selectedDate: Date;
    completedData: CompletedData;
    onToggleCompleted: () => void;
}


interface LiturgyProps {
    office: OfficeType;
    translation: Translation;
    selectedDate: Date;
    completedData: CompletedData;
    onToggleCompleted: () => void;
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
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

export function Liturgy({ office, translation, selectedDate, completedData, onToggleCompleted, settings, updateSettings }: LiturgyProps) {

    const [sentenceIdx, setSentenceIdx] = useState(0);
    const [shortPsalmIndex, setShortPsalmIndex] = useState(0);
    const [useBenedicite, setUseBenedicite] = useState(false);
    const [useAlternativeEveningCanticle1, setUseAlternativeEveningCanticle1] = useState(false);
    const [useAlternativeCanticle2, setUseAlternativeCanticle2] = useState(false);
    const [useAthanasianCreed, setUseAthanasianCreed] = useState(false);
    const [usePriestlyAbsolution, setUsePriestlyAbsolution] = useState(false);
    const [useAmericanStatePrayers, setUseAmericanStatePrayers] = useState(true);
    const [hymnMode, setHymnMode] = useState<Record<string, boolean>>({});
    
    const toggleHymn = (id: string, e: any) => {
        e.stopPropagation(); // prevent parent onClick
        setHymnMode(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const isAshWedOrGoodFri = isAshWednesdayOrGoodFriday(selectedDate);
    const isSunday = selectedDate.getDay() === 0;

    const modifiedSuffrages = suffrages;

    // Determine current section's completed status
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const isCompleted = completedData[dateKey]?.[office] ?? false;

    const readings = useMemo(() => getReadingsForDate(selectedDate, office), [office, selectedDate]);
    
    const allPsalms = useMemo(() => parsePsalms(readings.psalms), [readings.psalms]);
    const displayedPsalm = settings.useShortForm ? allPsalms[shortPsalmIndex % allPsalms.length] : readings.psalms;
    
    const handlePsalmClick = () => {
        if (settings.useShortForm) setShortPsalmIndex(prev => prev + 1);
    };
    
    const displayedLesson = settings.shortLessonPreference === 'OT' ? readings.firstLesson : readings.secondLesson;

    const handleNextSentence = () => setSentenceIdx(i => (i + 1) % openingSentences.length);

    
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
                {(readings.feastName || isSunday) && (
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                        <p className="rubric font-semibold text-sm tracking-widest uppercase">{readings.feastName || readings.liturgicalWeek}</p>
                    </div>
                )}
             </div>

             
             {/* Sentences */}
             <Section title="The Opening Sentence" rubric={openingSentences[sentenceIdx].citation} onTitleClick={handleNextSentence}>
                <div className="select-none">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={sentenceIdx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            {openingSentences[sentenceIdx].text}
                        </motion.p>
                    </AnimatePresence>
                </div>
             </Section>

             {/* Exhortation */}
             {!settings.useShortForm && (
                 <Section title="The Exhortation">
                     <p>{isSunday ? exhortation.full : exhortation.short}</p>
                 </Section>
             )}

             {/* Confession */}
             <Section 
                 title="A General Confession"
                 rubric="To be said of the whole Congregation after the Minister, all kneeling."
             >
                 <p>{confession}</p>
             </Section>

             {/* Absolution (Replaced) */}
             <Section 
                 title={usePriestlyAbsolution ? "The Absolution" : "The Collect for Pardon"}
                 rubric={usePriestlyAbsolution ? "To be pronounced by the Priest alone, standing; the people still kneeling." : "Substituted for the Absolution for private devotion."}
                 onTitleClick={() => setUsePriestlyAbsolution(!usePriestlyAbsolution)}
             >
                 <div className="select-none">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={usePriestlyAbsolution ? 'priestly' : 'substitute'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            {usePriestlyAbsolution ? priestlyAbsolution : absolutionSubstitute}
                        </motion.p>
                    </AnimatePresence>
                 </div>
             </Section>

             {/* Lord's Prayer */}
             <Section 
                 title="The Lord's Prayer"
                 rubric="Then the Minister shall kneel, and say the Lord's Prayer with an audible voice; the people also kneeling, and repeating it with him, both here, and wheresoever else it is used in Divine Service."
             >
                 <p>{lordsPrayer}</p>
             </Section>

             {/* Versicles */}
             <Section title="The Versicles">
                 <div className="space-y-4">
                     {initialVersicles.map((v, i) => (
                         <div key={i}>
                            <p className="text-opacity-90">{v.v}</p>
                            <p className="font-bold">{v.r}</p>
                         </div>
                     ))}
                 </div>
             </Section>

             {/* Venite (Morning only, unless Ash Wed/Good Fri) */}
             {office === 'morning' && !isAshWedOrGoodFri && !settings.useShortForm && (
                 <Section 
                     title="Venite, exultemus Domino" 
                     rubric="Psalm 95."
                     leftAction={
                         <button onClick={(e) => toggleHymn('venite', e)} className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full border border-black/10 dark:border-white/10">
                             <Music size={12} />
                             {hymnMode['venite'] ? "Prose Text" : "Hymn Version"}
                         </button>
                     }
                 >
                     {hymnMode['venite'] ? (
                         <SheetMusic imageUrl={hymns.venite.imageUrl} extraVerses={hymns.venite.extraVerses} />
                     ) : (
                         <div className="animate-in fade-in duration-500 space-y-1 leading-relaxed">
                            <p>O come, let us sing unto the Lord : let us heartily rejoice in the strength of our salvation.</p>
                            <p>Let us come before his presence with thanksgiving : and shew ourselves glad in him with Psalms.</p>
                            <p>For the Lord is a great God : and a great King above all gods.</p>
                            <p>In his hand are all the corners of the earth : and the strength of the hills is his also.</p>
                            <p>The sea is his, and he made it : and his hands prepared the dry land.</p>
                            <p>O come, let us worship, and fall down : and kneel before the Lord our Maker.</p>
                            <p>For he is the Lord our God : and we are the people of his pasture, and the sheep of his hand.</p>
                            <p>To day if ye will hear his voice, harden not your hearts : as in the provocation, and as in the day of temptation in the wilderness;</p>
                            <p>When your fathers tempted me : proved me, and saw my works.</p>
                            <p>Forty years long was I grieved with this generation, and said : It is a people that do err in their hearts, for they have not known my ways;</p>
                            <p>Unto whom I sware in my wrath : that they should not enter into my rest.</p>
                            <p className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</p>
                            <p className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</p>
                         </div>
                     )}
                 </Section>
             )}

             {/* Psalms */}
             {settings.useShortForm ? (
                 <BibleReading 
                     title="The Psalm" 
                     rubric={displayedPsalm}
                     passage={displayedPsalm} 
                     translation={translation}
                     onTitleClick={handlePsalmClick}
                 />
             ) : (
                 <BibleReading 
                     title="The Psalms of the Day" 
                     rubric={readings.psalms}
                     passage={readings.psalms} 
                     translation={translation} 
                 />
             )}
             {/* First Lesson (or Single Lesson) */}
             {settings.useShortForm ? (
                 <BibleReading 
                         title="The Lesson" 
                         rubric={displayedLesson}
                         passage={displayedLesson} 
                         translation={translation} 
                         onTitleClick={() => updateSettings({ shortLessonPreference: settings.shortLessonPreference === 'OT' ? 'NT' : 'OT' })}
                     />
             ) : (
                 <BibleReading 
                     title="The First Lesson" 
                     rubric={readings.firstLesson}
                     passage={readings.firstLesson} 
                     translation={translation} 
                 />
             )}
             
             {/* Canticle 1 */}
                     <Section 
                 title={office === 'morning' ? (useBenedicite ? "Benedicite, omnia opera" : "Te Deum Laudamus") : (useAlternativeEveningCanticle1 ? "Cantate Domino" : "Magnificat")}
                 rubric={office === 'morning' ? (useBenedicite ? "Song of the Three Children" : "An Ancient Hymn") : (useAlternativeEveningCanticle1 ? "Psalm 98." : "Luke 1.")}
                 onTitleClick={office === 'morning' ? () => setUseBenedicite(!useBenedicite) : () => setUseAlternativeEveningCanticle1(!useAlternativeEveningCanticle1)}
                 leftAction={
                     <button onClick={(e) => toggleHymn('canticle1', e)} className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full border border-black/10 dark:border-white/10">
                         <Music size={12} />
                         {hymnMode['canticle1'] ? "Prose Text" : "Hymn Version"}
                     </button>
                 }
             >
                 {hymnMode['canticle1'] ? (
                     <SheetMusic imageUrl={hymns[activeCanticle1].imageUrl} extraVerses={hymns[activeCanticle1].extraVerses} />
                 ) : office === 'morning' ? (
                     <div className="select-none">
                        {!useBenedicite ? (
                            <div className="animate-in fade-in duration-500">
                                <div className="space-y-1 leading-relaxed">
                                    {teDeum.map((verse, i) => <p key={i}>{verse}</p>)}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-500">
                                {benediciteGroups.map((group, i) => (
                                    <div key={i} className="mb-4 sm:mb-5">
                                        <div className="space-y-0.5 sm:space-y-1 mb-1.5">
                                            {group.map((v, j) => <p key={j} className="leading-relaxed">{v}</p>)}
                                        </div>
                                        <p className="font-bold opacity-90 leading-relaxed">{benediciteRefrain}</p>
                                    </div>
                                ))}
                                <div className="mt-5">
                                    <p className="leading-relaxed">Glory be to the Father, and to the Son : and to the Holy Ghost;</p>
                                    <p className="leading-relaxed font-bold mt-0.5">As it was in the beginning, is now, and ever shall be : world without end. Amen.</p>
                                </div>
                            </div>
                        )}
                     </div>
                 ) : (
                     <div className="select-none">
                         {!useAlternativeEveningCanticle1 ? (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-relaxed">
                                <p>My soul doth magnify the Lord : and my spirit hath rejoiced in God my Saviour.</p>
                                <p>For he hath regarded : the lowliness of his hand-maiden.</p>
                                <p>For behold, from henceforth : all generations shall call me blessed.</p>
                                <p>For he that is mighty hath magnified me : and holy is his Name.</p>
                                <p>And his mercy is on them that fear him : throughout all generations.</p>
                                <p>He hath shewed strength with his arm : he hath scattered the proud in the imagination of their hearts.</p>
                                <p>He hath put down the mighty from their seat : and hath exalted the humble and meek.</p>
                                <p>He hath filled the hungry with good things : and the rich he hath sent empty away.</p>
                                <p>He remembering his mercy hath holpen his servant Israel : as he promised to our forefathers, Abraham and his seed, for ever.</p>
                                <p className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</p>
                                <p className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</p>
                             </div>
                         ) : (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-relaxed">
                                 {cantateDomino.map((verse, i) => <p key={i}>{verse}</p>)}
                                 <p className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</p>
                                 <p className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</p>
                             </div>
                         )}
                     </div>
                 )}
             </Section>
             {/* Second Lesson and Canticle 2 */}
             {!settings.useShortForm && (
                 <>
                     <BibleReading 
                         title="The Second Lesson" 
                         rubric={readings.secondLesson}
                         passage={readings.secondLesson} 
                         translation={translation} 
                     />
                     <Section 
                 title={office === 'morning' ? (useAlternativeCanticle2 ? "Jubilate Deo" : "Benedictus") : (useAlternativeCanticle2 ? "Deus Misereatur" : "Nunc Dimittis")}
                 rubric={office === 'morning' ? (useAlternativeCanticle2 ? "Psalm 100." : "Luke 1:68.") : (useAlternativeCanticle2 ? "Psalm 67." : "Luke 2:29.")}
                 onTitleClick={() => setUseAlternativeCanticle2(!useAlternativeCanticle2)}
                 leftAction={
                     <button onClick={(e) => toggleHymn('canticle2', e)} className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full border border-black/10 dark:border-white/10">
                         <Music size={12} />
                         {hymnMode['canticle2'] ? "Prose Text" : "Hymn Version"}
                     </button>
                 }
             >
                 {hymnMode['canticle2'] ? (
                     <SheetMusic imageUrl={hymns[activeCanticle2].imageUrl} extraVerses={hymns[activeCanticle2].extraVerses} />
                 ) : (
                 <div className="select-none">
                     {office === 'morning' ? (
                         !useAlternativeCanticle2 ? (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-relaxed">
                                 <p>Blessed be the Lord God of Israel : for he hath visited, and redeemed his people;</p>
                                 <p>And hath raised up a mighty salvation for us : in the house of his servant David;</p>
                                 <p>As he spake by the mouth of his holy Prophets : which have been since the world began;</p>
                                 <p>That we should be saved from our enemies : and from the hands of all that hate us;</p>
                                 <p>To perform the mercy promised to our forefathers : and to remember his holy Covenant;</p>
                                 <p>To perform the oath which he sware to our forefather Abraham : that he would give us;</p>
                                 <p>That we being delivered out of the hands of our enemies : might serve him without fear;</p>
                                 <p>In holiness and righteousness before him : all the days of our life.</p>
                                 <p>And thou, Child, shalt be called the Prophet of the Highest : for thou shalt go before the face of the Lord to prepare his ways;</p>
                                 <p>To give knowledge of salvation unto his people : for the remission of their sins,</p>
                                 <p>Through the tender mercy of our God : whereby the day-spring from on high hath visited us;</p>
                                 <p>To give light to them that sit in darkness, and in the shadow of death : and to guide our feet into the way of peace.</p>
                                 <p className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</p>
                                 <p className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</p>
                             </div>
                         ) : (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-relaxed">
                                 {jubilateDeo.map((verse, i) => <p key={i}>{verse}</p>)}
                                 <p className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</p>
                                 <p className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</p>
                             </div>
                         )
                     ) : (
                         !useAlternativeCanticle2 ? (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-relaxed">
                                 <p>Lord, now lettest thou thy servant depart in peace : according to thy word.</p>
                                 <p>For mine eyes have seen : thy salvation,</p>
                                 <p>Which thou hast prepared : before the face of all people;</p>
                                 <p>To be a light to lighten the Gentiles : and to be the glory of thy people Israel.</p>
                                 <p className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</p>
                                 <p className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</p>
                             </div>
                         ) : (
                             <div className="animate-in fade-in duration-500 space-y-1 leading-relaxed">
                                 {deusMisereatur.map((verse, i) => <p key={i}>{verse}</p>)}
                                 <p className="mt-4">Glory be to the Father, and to the Son : and to the Holy Ghost;</p>
                                 <p className="font-bold">As it was in the beginning, is now, and ever shall be : world without end. Amen.</p>
                             </div>
                         )
                     )}
                 </div>
                 )}
             </Section>
                 </>
             )}
             {/* Creed */}
             <Section 
                 title={useAthanasianCreed ? "The Creed of Saint Athanasius" : "The Apostles' Creed"}
                 rubric={useAthanasianCreed ? "Quicunque vult." : ""}
                 onTitleClick={() => setUseAthanasianCreed(!useAthanasianCreed)}
             >
                 <div className="select-none">
                     {!useAthanasianCreed ? (
                         <div className="animate-in fade-in duration-500">
                             <p>{apostlesCreed}</p>
                         </div>
                     ) : (
                         <div className="animate-in fade-in duration-500 space-y-1 leading-relaxed">
                             {athanasianCreed.map((verse, i) => <p key={i}>{verse}</p>)}
                         </div>
                     )}
                 </div>
             </Section>

             {/* Lesser Litany */}
             <Section title="The Lesser Litany">
                 <div className="space-y-4">
                     <div>
                         <p>The Lord be with you.</p>
                         <p className="font-bold">And with thy spirit.</p>
                     </div>
                     <p className="rubric">Let us pray.</p>
                     <div>
                         <p>Lord, have mercy upon us.</p>
                         <p className="font-bold">Christ, have mercy upon us.</p>
                         <p>Lord, have mercy upon us.</p>
                     </div>
                 </div>
             </Section>
             
             {/* Lord's Prayer 2 */}
             {!settings.useShortForm && (
                 <Section 
                 title="The Lord's Prayer"
                 leftAction={
                     <button 
                         onClick={() => toggleHymnMode('lordsPrayer')}
                         className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full border border-black/10 dark:border-white/10"
                     >
                         <Music size={14} />
                         {hymnMode['lordsPrayer'] ? "Prose Text" : "Hymn Version"}
                     </button>
                 }
             >
                 {hymnMode['lordsPrayer'] ? (
                     <SheetMusic imageUrl={hymns.lordsPrayer.imageUrl} extraVerses={hymns.lordsPrayer.extraVerses} />
                 ) : (
                     <div className="animate-in fade-in duration-500">
                         <p>{lordsPrayer}</p>
                     </div>
                 )}
             </Section>
             )}

             {/* Suffrages */}
             <Section title="The Suffrages">
                 <div className="space-y-4">
                     {suffrages.map((v, i) => (
                         <div key={i}>
                            <p className="text-opacity-90">{v.v}</p>
                            <p className="font-bold">{v.r}</p>
                         </div>
                     ))}
                 </div>
             </Section>

             {/* Collects */}
             <Section title="The Collect of the Day" rubric={readings.feastName || readings.liturgicalWeek}>
                 <p>{readings.collect}</p>
             </Section>
                 
             <Section title="The Second Collect" rubric={office === 'morning' ? "For Peace." : "For Peace."}>
                 {office === 'morning' ? (
                     <p>O God, who art the author of peace and lover of concord, in knowledge of whom standeth our eternal life, whose service is perfect freedom: Defend us thy humble servants in all assaults of our enemies; that we, surely trusting in thy defence, may not fear the power of any adversaries, through the might of Jesus Christ our Lord. Amen.</p>
                 ) : (
                     <p>O God, from whom all holy desires, all good counsels, and all just works do proceed: Give unto thy servants that peace which the world cannot give; that both our hearts may be set to obey thy commandments, and also that by thee we being defended from the fear of our enemies may pass our time in rest and quietness; through the merits of Jesus Christ our Saviour. Amen.</p>
                 )}
             </Section>

             <Section title="The Third Collect" rubric={office === 'morning' ? "For Grace." : "For Aid against all Perils."}>
                 {office === 'morning' ? (
                     <p>O Lord, our heavenly Father, Almighty and everlasting God, who hast safely brought us to the beginning of this day: Defend us in the same with thy mighty power; and grant that this day we fall into no sin, neither run into any kind of danger; but that all our doings may be ordered by thy governance, to do always that is righteous in thy sight; through Jesus Christ our Lord. Amen.</p>
                 ) : (
                     <p>Lighten our darkness, we beseech thee, O Lord; and by thy great mercy defend us from all perils and dangers of this night; for the love of thy only Son, our Saviour, Jesus Christ. Amen.</p>
                 )}
             </Section>

             {/* State Prayers & Thanksgiving (Long Form) */}
             {!settings.useShortForm && (
                 <>

                     {useAmericanStatePrayers ? (
                         <Section 
                            title="A Prayer for the President and all in Civil Authority" 
                            onTitleClick={() => setUseAmericanStatePrayers(false)}
                         >
                             <div className="select-none animate-in fade-in duration-500">
                                 <p>{statePrayers.president}</p>
                             </div>
                         </Section>
                     ) : (
                         <>
                             <Section 
                                title="A Prayer for the King's Majesty"
                                onTitleClick={() => setUseAmericanStatePrayers(true)}
                             >
                                 <div className="select-none animate-in fade-in duration-500">
                                     <p>{statePrayers.kingsMajesty}</p>
                                 </div>
                             </Section>
                             
                             <Section 
                                title="A Prayer for the Royal Family"
                                onTitleClick={() => setUseAmericanStatePrayers(true)}
                             >
                                 <div className="select-none animate-in fade-in duration-500">
                                     <p>{statePrayers.royalFamily}</p>
                                 </div>
                             </Section>
                         </>
                     )}
                     
                     <Section title="A Prayer for the Clergy and People">
                         <p>{statePrayers.clergyAndPeople}</p>
                     </Section>
                     
                     <Section title="A General Thanksgiving" rubric="To be said by the Minister alone.">
                         <p>{generalThanksgiving}</p>
                     </Section>
                 </>
             )}

             {/* Prayer of St Chrysostom */}
             <Section title="A Prayer of Saint Chrysostom">
                 <p>{stChrysostom}</p>
             </Section>

             {/* The Grace */}
             <Section title="The Grace" rubric="2 Corinthians 13:14">
                 <p>{theGrace}</p>
             </Section>
             
             <div className="py-8 flex justify-center">
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
             </div>
             
             <div className="h-16"></div>
        </main>
    );
}
