import { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause } from 'lucide-react';
import { P } from './GlossaryText';

export interface SheetMusicProps {
    title?: string;
    imageUrl: string | string[];
    audioUrl?: string;
    extraVerses?: string[][];
}

export function SheetMusic({ title, imageUrl, audioUrl, extraVerses }: SheetMusicProps) {
    const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const getSafeSrc = (src: string) => {
        try {
            return encodeURI(decodeURI(src));
        } catch {
            return src;
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
                console.error("Hymn audio play error:", err);
                setIsPlaying(false);
            });
        }
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    return (
        <div className="animate-in fade-in duration-500">
            {/* Hymn Header with Audio Player if available */}
            {audioUrl && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Volume2 size={16} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                                Hymn Audio
                            </div>
                            {title && (
                                <div className="text-xs text-amber-800/80 dark:text-amber-300/80 font-serif italic">
                                    {title}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <audio 
                            ref={audioRef} 
                            src={getSafeSrc(audioUrl)} 
                            preload="none"
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                        />
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors cursor-pointer"
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                            {isPlaying ? "Pause Hymn" : "Play Hymn"}
                        </button>
                    </div>
                </div>
            )}

            {/* Sheet Music Images Container */}
            <div className="w-full flex flex-col items-center justify-center gap-4 my-6">
                {images.length > 0 && images[0] ? (
                    images.map((img, i) => (
                        <img key={i} src={getSafeSrc(img)} alt={`Hymn sheet music page ${i + 1}`} className="w-full max-w-2xl object-contain mix-blend-multiply dark:mix-blend-screen dark:invert dark:contrast-150 dark:brightness-150" />
                    ))
                ) : (
                    <div className="p-8 text-center opacity-60 italic">
                        <P>Sheet music image not yet uploaded.</P>
                        <P className="text-sm mt-2">Add image to the public/hymns folder.</P>
                    </div>
                )}
            </div>

            {/* Extra Metrical Verses */}
            {extraVerses && extraVerses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-6">
                    {extraVerses.map((verse, i) => (
                        <div key={i} className="space-y-1">
                            {verse.map((line, j) => (
                                <P key={j} className="leading-normal opacity-90">{line}</P>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
