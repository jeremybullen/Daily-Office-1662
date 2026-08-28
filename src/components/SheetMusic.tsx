import { useEffect, useId } from 'react';
import abcjs from 'abcjs';

interface SheetMusicProps {
    abc: string;
    extraVerses: string[][];
}

export function SheetMusic({ abc, extraVerses }: SheetMusicProps) {
    const rawId = useId();
    // ABCJS needs a valid DOM id without colons
    const id = `abc-${rawId.replace(/:/g, '')}`;

    useEffect(() => {
        abcjs.renderAbc(id, abc, {
            responsive: 'resize',
            add_classes: true,
            paddingtop: 15,
            paddingbottom: 15,
            paddingright: 15,
            paddingleft: 15,
        });
    }, [abc, id]);

    return (
        <div className="animate-in fade-in duration-500">
            <div 
                id={id} 
                className="w-full bg-[#FCFBF8] text-black rounded shadow-sm border border-[var(--border-color)] overflow-x-auto mb-6"
            ></div>
            
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
