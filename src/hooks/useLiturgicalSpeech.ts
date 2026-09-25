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
  const [rate, setRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bcp-tts-rate');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.5 && val <= 2.5) return val;
      }
    }
    return 1.0;
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ministerVoiceUri, setMinisterVoiceUri] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('bcp-tts-minister-voice') : null) || '';
  });
  const [peopleVoiceUri, setPeopleVoiceUri] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('bcp-tts-people-voice') : null) || '';
  });
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
    rate: 1.0,
    sections: [] as LiturgySpeechSection[],
    voicePair: { minister: null, people: null, isDistinct: false } as VoicePair
  });

  // Keep references to prevent Chromium garbage collection of SpeechSynthesisUtterance
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
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
        setAvailableVoices(voices);
        const savedMinister = typeof window !== 'undefined' ? localStorage.getItem('bcp-tts-minister-voice') : null;
        const savedPeople = typeof window !== 'undefined' ? localStorage.getItem('bcp-tts-people-voice') : null;
        const pair = pickLiturgicalVoices(voices, savedMinister, savedPeople);
        setVoicePair(pair);
        stateRef.current.voicePair = pair;
        if (pair.minister) setMinisterVoiceUri(pair.minister.voiceURI);
        if (pair.people) setPeopleVoiceUri(pair.people.voiceURI);
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
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onend = null;
        currentUtteranceRef.current.onerror = null;
        currentUtteranceRef.current = null;
      }
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

    // Cancel any previous and null out callbacks to avoid race conditions
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onend = null;
        currentUtteranceRef.current.onerror = null;
        currentUtteranceRef.current = null;
      }
    }

    const utterance = new SpeechSynthesisUtterance(sentenceToSpeak);
    currentUtteranceRef.current = utterance;
    activeUtterancesRef.current.push(utterance);

    // Explicitly apply and clamp speed rate (standard range 0.5 to 2.0, default 1.0)
    const effectiveRate = Math.max(0.5, Math.min(2.0, stateRef.current.rate || 1.0));
    utterance.rate = effectiveRate;

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
      // If this utterance was superseded, do nothing
      if (currentUtteranceRef.current !== utterance) return;
      currentUtteranceRef.current = null;

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
      // If this utterance was superseded, do nothing
      if (currentUtteranceRef.current !== utterance) return;
      currentUtteranceRef.current = null;

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
    const clamped = Math.max(0.5, Math.min(2.0, Number(newRate.toFixed(2))));
    setRate(clamped);
    stateRef.current.rate = clamped;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcp-tts-rate', String(clamped));
    }
    // If currently playing, cancel and restart sentence with new rate after brief delay
    if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
      cancelSpeech();
      setTimeout(() => {
        if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
          speakCurrent();
        }
      }, 50);
    }
  }, [cancelSpeech, speakCurrent]);

  const setMinisterVoice = useCallback((uri: string) => {
    if (typeof window !== 'undefined') {
      if (uri) localStorage.setItem('bcp-tts-minister-voice', uri);
      else localStorage.removeItem('bcp-tts-minister-voice');
    }
    setMinisterVoiceUri(uri);
    const chosen = availableVoices.find(v => v.voiceURI === uri || v.name === uri) || null;
    setVoicePair(prev => {
      const minister = chosen || prev.minister;
      const next: VoicePair = {
        minister,
        people: prev.people,
        isDistinct: minister !== prev.people && minister !== null && prev.people !== null
      };
      stateRef.current.voicePair = next;
      return next;
    });
  }, [availableVoices]);

  const setPeopleVoice = useCallback((uri: string) => {
    if (typeof window !== 'undefined') {
      if (uri) localStorage.setItem('bcp-tts-people-voice', uri);
      else localStorage.removeItem('bcp-tts-people-voice');
    }
    setPeopleVoiceUri(uri);
    const chosen = availableVoices.find(v => v.voiceURI === uri || v.name === uri) || null;
    setVoicePair(prev => {
      const people = chosen || prev.people;
      const next: VoicePair = {
        minister: prev.minister,
        people,
        isDistinct: prev.minister !== people && prev.minister !== null && people !== null
      };
      stateRef.current.voicePair = next;
      return next;
    });
  }, [availableVoices]);

  const resetDefaultVoices = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bcp-tts-minister-voice');
      localStorage.removeItem('bcp-tts-people-voice');
    }
    const pair = pickLiturgicalVoices(availableVoices);
    setVoicePair(pair);
    stateRef.current.voicePair = pair;
    setMinisterVoiceUri(pair.minister?.voiceURI || '');
    setPeopleVoiceUri(pair.people?.voiceURI || '');
  }, [availableVoices]);

  const previewVoice = useCallback((role: 'call' | 'response', uri?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = role === 'call' ? 'The Lord be with you.' : 'And with thy spirit.';
    const utterance = new SpeechSynthesisUtterance(text);
    const targetVoice = uri 
      ? availableVoices.find(v => v.voiceURI === uri || v.name === uri) 
      : (role === 'call' ? voicePair.minister : voicePair.people);
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    utterance.rate = stateRef.current.rate;
    utterance.pitch = role === 'call' ? (voicePair.isDistinct ? 0.98 : 0.88) : (voicePair.isDistinct ? 1.04 : 1.18);
    window.speechSynthesis.speak(utterance);
  }, [availableVoices, voicePair]);

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
    availableVoices,
    ministerVoiceUri,
    peopleVoiceUri,
    setMinisterVoice,
    setPeopleVoice,
    resetDefaultVoices,
    previewVoice,
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
