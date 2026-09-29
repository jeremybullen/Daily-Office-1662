import { useState, useEffect, useRef, useCallback } from 'react';
import { LiturgySpeechSection } from '../utils/speechEngine';
import { LITURGICAL_AUDIO_CANDIDATES } from '../utils/liturgicalAudioManifest';

interface UseLiturgicalSpeechProps {
  sections: LiturgySpeechSection[];
}

export function useLiturgicalSpeech({ sections }: UseLiturgicalSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const [rate, setRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bcp-audio-rate');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.5 && val <= 2.5) return val;
      }
    }
    return 1.0;
  });

  const stateRef = useRef({
    isPlaying: false,
    isPaused: false,
    sectionIdx: 0,
    rate: 1.0,
    sections: [] as LiturgySpeechSection[]
  });

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  stateRef.current.sections = sections;
  stateRef.current.rate = rate;

  const stopAudio = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.onended = null;
      audioElementRef.current.onerror = null;
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const scrollToSection = (id?: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const playSection = useCallback((sectionIdx: number) => {
    stopAudio();

    const currentSections = stateRef.current.sections;
    if (sectionIdx < 0 || sectionIdx >= currentSections.length) {
      setIsPlaying(false);
      setIsPaused(false);
      stateRef.current.isPlaying = false;
      stateRef.current.isPaused = false;
      return;
    }

    stateRef.current.sectionIdx = sectionIdx;
    setCurrentSectionIndex(sectionIdx);

    const section = currentSections[sectionIdx];
    if (!section) return;

    // Auto-scroll section into view
    scrollToSection(section.id);

    // Gather candidate audio URLs
    const candidateUrls: string[] = [];
    if (section.audioCandidates && section.audioCandidates.length > 0) {
      candidateUrls.push(...section.audioCandidates);
    } else if (section.audioSrc) {
      candidateUrls.push(section.audioSrc);
    } else if (section.id && LITURGICAL_AUDIO_CANDIDATES[section.id]) {
      candidateUrls.push(...LITURGICAL_AUDIO_CANDIDATES[section.id]);
    }

    const uniqueCandidates = Array.from(new Set(candidateUrls));

    const tryPlayCandidate = (candIdx: number) => {
      if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

      if (candIdx >= uniqueCandidates.length) {
        // No audio available for this section; pause briefly then advance to next section
        advanceTimeoutRef.current = setTimeout(() => {
          if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
          playSection(sectionIdx + 1);
        }, 500);
        return;
      }

      const candidatePath = uniqueCandidates[candIdx];
      const encodedPath = (candidatePath.startsWith('/api/') || candidatePath.startsWith('http'))
        ? candidatePath
        : encodeURI(candidatePath);

      const audio = new Audio(encodedPath);
      audio.preload = 'auto';
      audioElementRef.current = audio;
      audio.playbackRate = Math.max(0.5, Math.min(2.0, stateRef.current.rate || 1.0));

      audio.onended = () => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
        const nextIdx = sectionIdx + 1;
        playSection(nextIdx);
      };

      let isFailed = false;
      const failAndNext = (err?: any) => {
        if (isFailed) return;
        isFailed = true;
        console.warn(`[LiturgicalAudio] Candidate ${candIdx} failed (${candidatePath}):`, err);
        audio.onerror = null;
        audio.onended = null;
        tryPlayCandidate(candIdx + 1);
      };

      audio.onerror = failAndNext;
      audio.play().catch(failAndNext);
    };

    tryPlayCandidate(0);
  }, [stopAudio]);

  const play = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      stateRef.current.isPaused = false;
      stateRef.current.isPlaying = true;

      if (audioElementRef.current) {
        audioElementRef.current.play().catch(() => {
          playSection(stateRef.current.sectionIdx);
        });
      } else {
        playSection(stateRef.current.sectionIdx);
      }
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      stateRef.current.isPlaying = true;
      stateRef.current.isPaused = false;
      playSection(stateRef.current.sectionIdx);
    }
  }, [isPaused, playSection]);

  const pause = useCallback(() => {
    setIsPaused(true);
    setIsPlaying(false);
    stateRef.current.isPaused = true;
    stateRef.current.isPlaying = false;
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    stateRef.current.isPlaying = false;
    stateRef.current.isPaused = false;
    stateRef.current.sectionIdx = 0;
    setCurrentSectionIndex(0);
    stopAudio();
  }, [stopAudio]);

  const nextSection = useCallback(() => {
    const nextIdx = stateRef.current.sectionIdx + 1;
    if (nextIdx < sections.length) {
      if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
        playSection(nextIdx);
      } else {
        stateRef.current.sectionIdx = nextIdx;
        setCurrentSectionIndex(nextIdx);
        scrollToSection(sections[nextIdx]?.id);
      }
    }
  }, [sections, playSection]);

  const prevSection = useCallback(() => {
    const prevIdx = stateRef.current.sectionIdx - 1;
    if (prevIdx >= 0) {
      if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
        playSection(prevIdx);
      } else {
        stateRef.current.sectionIdx = prevIdx;
        setCurrentSectionIndex(prevIdx);
        scrollToSection(sections[prevIdx]?.id);
      }
    }
  }, [sections, playSection]);

  const changeRate = useCallback((newRate: number) => {
    setRate(newRate);
    stateRef.current.rate = newRate;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcp-audio-rate', newRate.toString());
    }
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = newRate;
    }
  }, []);

  const currentSection = sections[currentSectionIndex];

  return {
    isPlaying,
    isPaused,
    currentSectionIndex,
    currentSectionId: currentSection?.id,
    currentSectionTitle: currentSection?.title || '',
    totalSections: sections.length,
    rate,
    play,
    pause,
    stop,
    nextSection,
    prevSection,
    changeRate,
    playSection
  };
}
