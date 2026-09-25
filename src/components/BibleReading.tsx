import { useState, useEffect, ReactNode } from 'react';
import { Translation } from '../types';
import { Section } from './Section';
import { fetchPassages } from '../lib/bible-api';

interface Passage {
    reference: string;
    text: string;
}

interface BibleReadingProps {
    id?: string;
    title: string;
    rubric?: ReactNode;
    metadata?: ReactNode;
    passage: string;
    translation: Translation;
    onTitleClick?: () => void;
}

export function BibleReading({ id, title, rubric, metadata, passage, translation, onTitleClick }: BibleReadingProps) {
    const [passages, setPassages] = useState<Passage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchPassage() {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchPassages(passage, translation);
                
                if (isMounted) {
                    setPassages(data || []);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (passage) {
            fetchPassage();
        }

        return () => {
            isMounted = false;
        };
    }, [passage, translation]);

    return (
        <Section id={id} title={title} rubric={rubric} metadata={metadata} onTitleClick={onTitleClick}>
            {loading ? (
                <div className="flex items-center py-4">
                    <div className="animate-pulse flex space-x-2 opacity-50">
                        <div className="w-1.5 h-1.5 bg-[var(--text-color)] rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-[var(--text-color)] rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-[var(--text-color)] rounded-full"></div>
                    </div>
                </div>
            ) : error ? (
                <div>
                    <p className="text-red-500 font-semibold mb-2">Error loading reading:</p>
                    <p className="opacity-80">{error}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {passages.map((p, i) => (
                        <div key={i}>
                            {passages.length > 1 && (
                                <h4 className="font-bold text-lg mb-4 opacity-70">{p.reference}</h4>
                            )}
                            <div className="leading-normal scripture-text">
                                <span dangerouslySetInnerHTML={{ __html: p.text }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Section>
    );
}
