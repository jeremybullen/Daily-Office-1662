import { useState, useEffect, ReactNode } from 'react';
import { Translation } from '../types';
import { Section } from './Section';

interface Passage {
    reference: string;
    text: string;
}

interface BibleReadingProps {
    title: string;
    rubric?: ReactNode;
    passage: string;
    translation: Translation;
}

export function BibleReading({ title, rubric, passage, translation }: BibleReadingProps) {
    const [passages, setPassages] = useState<Passage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchPassage() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/bible?passage=${encodeURIComponent(passage)}&translation=${translation}`);
                const data = await res.json();
                
                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch passage");
                }
                
                if (isMounted) {
                    setPassages(data.passages || []);
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
        <Section title={title} rubric={rubric}>
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
                            <div className="whitespace-pre-wrap leading-loose">
                                {p.text}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Section>
    );
}
