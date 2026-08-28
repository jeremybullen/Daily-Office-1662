export interface SheetMusicProps {
    imageUrl: string | string[];
    extraVerses?: string[][];
}

export function SheetMusic({ imageUrl, extraVerses }: SheetMusicProps) {
    const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    
    return (
        <div className="animate-in fade-in duration-500">
            <div className="w-full bg-[#FCFBF8] text-black rounded shadow-sm border border-[var(--border-color)] overflow-hidden mb-6 flex flex-col items-center">
                {images.length > 0 && images[0] ? (
                    images.map((img, i) => (
                        <img key={i} src={img} alt={`Hymn sheet music page ${i + 1}`} className="w-full max-w-2xl object-contain mix-blend-multiply" />
                    ))
                ) : (
                    <div className="p-8 text-center opacity-60 italic">
                        <p>Sheet music image not yet uploaded.</p>
                        <p className="text-sm mt-2">Add image to the public/hymns folder.</p>
                    </div>
                )}
            </div>
            
            {extraVerses && extraVerses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-4">
                    {extraVerses.map((verse, i) => (
                        <div key={i} className="space-y-1">
                            {verse.map((line, j) => (
                                <p key={j} className="leading-relaxed opacity-90">{line}</p>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
