import { P } from './GlossaryText';

export interface SheetMusicProps {
    imageUrl: string | string[];
    extraVerses?: string[][];
}

export function SheetMusic({ imageUrl, extraVerses }: SheetMusicProps) {
    const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    const getSafeSrc = (src: string) => {
        try {
            return encodeURI(decodeURI(src));
        } catch {
            return src;
        }
    };
    
    return (
        <div className="animate-in fade-in duration-500">
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
