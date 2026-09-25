import { useState, useEffect, useRef, useCallback } from 'react';
import { LiturgySpeechSection, VoicePair, getVoices, pickLiturgicalVoices, splitSentences } from '../utils/speechEngine';

interface UseLiturgicalSpeechProps {
  sections: LiturgySpeechSection[];
}

export function useLiturgicalSpeech({ sections }: UseLiturgicalSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentRole, setCurrentRole] = useState<'call' | 'response' | null>(null);
  const [rate, setRate] = useState<number>(0.95);
  const [voicePair, setVoicePair] = useState<VoicePair>({
    minister: null,
    people: null,
    isDistinct: false
  });

  const stateRef = useRef({
    isPlaying: false,
    isPaused: false,
    sectionIdx: 0,
    partIdx: 0,
    sentenceIdx: 0,
    rate: 0.95,
    sections: [] as LiturgySpeechSection[],
    voicePair: { minister: null, people: null, isDistinct: false } as VoicePair
  });

  // Keep references to prevent Chromium garbage collection of SpeechSynthesisUtterance
  const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ref with props and state
  stateRef.current.sections = sections;
  stateRef.current.rate = rate;
  stateRef.current.voicePair = voicePair;

  // Load voices
  useEffect(() => {
    let isMounted = true;
    getVoices().then((voices) => {
      if (isMounted && voices.length > 0) {
        const pair = pickLiturgicalVoices(voices);
        setVoicePair(pair);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (stallTimerRef.current) {
        clearInterval(stallTimerRef.current);
      }
    };
  }, []);

  // Browser stall prevention interval
  const startStallKeepAlive = () => {
    if (stallTimerRef.current) clearInterval(stallTimerRef.current);
    stallTimerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 10000);
  };

  const stopStallKeepAlive = () => {
    if (stallTimerRef.current) {
      clearInterval(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  };

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtterancesRef.current = [];
    stopStallKeepAlive();
  }, []);

  const speakCurrent = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const { sectionIdx, partIdx, sentenceIdx, rate: currentRate, voicePair: currentVoices, sections: currentSections } = stateRef.current;

    if (sectionIdx >= currentSections.length) {
      // Completed all sections
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentRole(null);
      stateRef.current.isPlaying = false;
      stateRef.current.isPaused = false;
      stopStallKeepAlive();
      return;
    }

    const currentSection = currentSections[sectionIdx];
    if (!currentSection) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentRole(null);
      return;
    }

    const parts = (currentSection.parts && currentSection.parts.length > 0)
      ? currentSection.parts
      : (currentSection.getParts ? currentSection.getParts() : []);

    if (!parts || parts.length === 0) {
      // Move to next section
      stateRef.current.sectionIdx = sectionIdx + 1;
      stateRef.current.partIdx = 0;
      stateRef.current.sentenceIdx = 0;
      setCurrentSectionIndex(sectionIdx + 1);
      setCurrentPartIndex(0);
      setCurrentSentenceIndex(0);
      speakCurrent();
      return;
    }

    if (partIdx >= parts.length) {
      // Section finished, advance to next section
      const nextSec = sectionIdx + 1;
      stateRef.current.sectionIdx = nextSec;
      stateRef.current.partIdx = 0;
      stateRef.current.sentenceIdx = 0;
      setCurrentSectionIndex(nextSec);
      setCurrentPartIndex(0);
      setCurrentSentenceIndex(0);
      speakCurrent();
      return;
    }

    const part = parts[partIdx];
    const sentences = splitSentences(part.text);

    if (sentenceIdx >= sentences.length) {
      // Part finished, advance to next part
      const nextPart = partIdx + 1;
      stateRef.current.partIdx = nextPart;
      stateRef.current.sentenceIdx = 0;
      setCurrentPartIndex(nextPart);
      setCurrentSentenceIndex(0);
      speakCurrent();
      return;
    }

    const sentenceToSpeak = sentences[sentenceIdx];
    if (!sentenceToSpeak || sentenceToSpeak.trim().length === 0) {
      stateRef.current.sentenceIdx = sentenceIdx + 1;
      setCurrentSentenceIndex(sentenceIdx + 1);
      speakCurrent();
      return;
    }

    // Scroll section into view if it's the start of the section
    if (partIdx === 0 && sentenceIdx === 0 && currentSection.id) {
      const el = document.getElementById(currentSection.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    setCurrentRole(part.role);

    // Cancel any previous
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(sentenceToSpeak);
    activeUtterancesRef.current.push(utterance);

    utterance.rate = currentRate;

    // Apply call vs response voices
    if (part.role === 'response') {
      if (currentVoices.people) {
        utterance.voice = currentVoices.people;
      }
      // If voice is distinct, slight bright pitch; if same voice, higher pitch to distinguish
      utterance.pitch = currentVoices.isDistinct ? 1.05 : 1.18;
    } else {
      if (currentVoices.minister) {
        utterance.voice = currentVoices.minister;
      }
      // Reverent, dignified ministerial pitch
      utterance.pitch = currentVoices.isDistinct ? 0.96 : 0.88;
    }

    utterance.onend = () => {
      // Clean up reference
      const idx = activeUtterancesRef.current.indexOf(utterance);
      if (idx > -1) activeUtterancesRef.current.splice(idx, 1);

      if (!stateRef.current.isPlaying || stateRef.current.isPaused) {
        return;
      }

      // Small natural liturgical breath pause between verses/responses
      const pauseDuration = part.role === 'response' ? 250 : 150;
      setTimeout(() => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

        stateRef.current.sentenceIdx += 1;
        setCurrentSentenceIndex(stateRef.current.sentenceIdx);
        speakCurrent();
      }, pauseDuration);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('SpeechSynthesis error:', e);
      // Advance on error so playback does not stall
      stateRef.current.sentenceIdx += 1;
      setCurrentSentenceIndex(stateRef.current.sentenceIdx);
      speakCurrent();
    };

    startStallKeepAlive();
    window.speechSynthesis.speak(utterance);
  }, []);

  const play = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      stateRef.current.isPaused = false;
      stateRef.current.isPlaying = true;
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        speakCurrent();
      }
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      stateRef.current.isPlaying = true;
      stateRef.current.isPaused = false;
      speakCurrent();
    }
  }, [isPaused, speakCurrent]);

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setIsPaused(true);
    stateRef.current.isPaused = true;
    cancelSpeech();
  }, [cancelSpeech]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSectionIndex(0);
    setCurrentPartIndex(0);
    setCurrentSentenceIndex(0);
    setCurrentRole(null);
    stateRef.current.isPlaying = false;
    stateRef.current.isPaused = false;
    stateRef.current.sectionIdx = 0;
    stateRef.current.partIdx = 0;
    stateRef.current.sentenceIdx = 0;
    cancelSpeech();
  }, [cancelSpeech]);

  const nextSection = useCallback(() => {
    const nextIdx = Math.min(stateRef.current.sectionIdx + 1, stateRef.current.sections.length - 1);
    cancelSpeech();
    stateRef.current.sectionIdx = nextIdx;
    stateRef.current.partIdx = 0;
    stateRef.current.sentenceIdx = 0;
    setCurrentSectionIndex(nextIdx);
    setCurrentPartIndex(0);
    setCurrentSentenceIndex(0);

    if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
      speakCurrent();
    }
  }, [cancelSpeech, speakCurrent]);

  const prevSection = useCallback(() => {
    const prevIdx = Math.max(stateRef.current.sectionIdx - 1, 0);
    cancelSpeech();
    stateRef.current.sectionIdx = prevIdx;
    stateRef.current.partIdx = 0;
    stateRef.current.sentenceIdx = 0;
    setCurrentSectionIndex(prevIdx);
    setCurrentPartIndex(0);
    setCurrentSentenceIndex(0);

    if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
      speakCurrent();
    }
  }, [cancelSpeech, speakCurrent]);

  const jumpToSection = useCallback((idx: number) => {
    if (idx < 0 || idx >= stateRef.current.sections.length) return;
    cancelSpeech();
    stateRef.current.sectionIdx = idx;
    stateRef.current.partIdx = 0;
    stateRef.current.sentenceIdx = 0;
    setCurrentSectionIndex(idx);
    setCurrentPartIndex(0);
    setCurrentSentenceIndex(0);

    setIsPlaying(true);
    setIsPaused(false);
    stateRef.current.isPlaying = true;
    stateRef.current.isPaused = false;
    speakCurrent();
  }, [cancelSpeech, speakCurrent]);

  const changeRate = useCallback((newRate: number) => {
    setRate(newRate);
    stateRef.current.rate = newRate;
    // If currently playing, restart current sentence with new rate
    if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
      cancelSpeech();
      speakCurrent();
    }
  }, [cancelSpeech, speakCurrent]);

  const currentSection = sections[currentSectionIndex] || null;

  return {
    isPlaying,
    isPaused,
    currentSectionIndex,
    currentSectionTitle: currentSection?.title || '',
    currentSectionId: currentSection?.id || '',
    currentRole,
    rate,
    voices: voicePair,
    play,
    pause,
    stop,
    nextSection,
    prevSection,
    jumpToSection,
    changeRate,
    totalSections: sections.length
  };
}
