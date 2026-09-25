import { useState, useEffect, useRef, useCallback } from 'react';
import { LiturgySpeechSection, VoicePair, getVoices, pickLiturgicalVoices, splitSentences } from '../utils/speechEngine';

export type PlaybackMode = 'hybrid' | 'tts-only';
export type CurrentMediaType = 'recording' | 'tts' | null;

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
  const [currentMediaType, setCurrentMediaType] = useState<CurrentMediaType>(null);
  
  const [playbackMode, setPlaybackModeState] = useState<PlaybackMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bcp-playback-mode');
      if (saved === 'hybrid' || saved === 'tts-only') return saved;
    }
    return 'hybrid';
  });

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
    playbackMode: 'hybrid' as PlaybackMode,
    currentMediaType: null as CurrentMediaType,
    sections: [] as LiturgySpeechSection[],
    voicePair: { minister: null, people: null, isDistinct: false } as VoicePair
  });

  // Media refs
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ref with props and state
  stateRef.current.sections = sections;
  stateRef.current.rate = rate;
  stateRef.current.playbackMode = playbackMode;
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
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (stallTimerRef.current) {
        clearInterval(stallTimerRef.current);
      }
    };
  }, []);

  // Browser stall prevention interval for SpeechSynthesis
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

  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.onended = null;
      audioElementRef.current.onerror = null;
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
  }, []);

  // Main play routine for speech synthesis
  const speakCurrentWithTTS = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const { sectionIdx, partIdx, sentenceIdx, rate: currentRate, voicePair: currentVoices, sections: currentSections } = stateRef.current;

    if (sectionIdx >= currentSections.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentRole(null);
      setCurrentMediaType(null);
      stateRef.current.isPlaying = false;
      stateRef.current.isPaused = false;
      stateRef.current.currentMediaType = null;
      stopStallKeepAlive();
      return;
    }

    const currentSection = currentSections[sectionIdx];
    if (!currentSection) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentRole(null);
      setCurrentMediaType(null);
      return;
    }

    const parts = (currentSection.parts && currentSection.parts.length > 0)
      ? currentSection.parts
      : (currentSection.getParts ? currentSection.getParts() : []);

    if (!parts || parts.length === 0) {
      // Advance to next section
      const nextSec = sectionIdx + 1;
      stateRef.current.sectionIdx = nextSec;
      stateRef.current.partIdx = 0;
      stateRef.current.sentenceIdx = 0;
      setCurrentSectionIndex(nextSec);
      setCurrentPartIndex(0);
      setCurrentSentenceIndex(0);
      playSection(nextSec);
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
      playSection(nextSec);
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
      speakCurrentWithTTS();
      return;
    }

    const sentenceToSpeak = sentences[sentenceIdx];
    if (!sentenceToSpeak || sentenceToSpeak.trim().length === 0) {
      stateRef.current.sentenceIdx = sentenceIdx + 1;
      setCurrentSentenceIndex(sentenceIdx + 1);
      speakCurrentWithTTS();
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
    setCurrentMediaType('tts');
    stateRef.current.currentMediaType = 'tts';

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

    // Explicitly apply speed rate
    const effectiveRate = Math.max(0.5, Math.min(2.0, currentRate || 1.0));
    utterance.rate = effectiveRate;

    // Apply call vs response voices
    if (part.role === 'response') {
      if (currentVoices.people) {
        utterance.voice = currentVoices.people;
      }
      utterance.pitch = currentVoices.isDistinct ? 1.05 : 1.18;
    } else {
      if (currentVoices.minister) {
        utterance.voice = currentVoices.minister;
      }
      utterance.pitch = currentVoices.isDistinct ? 0.96 : 0.88;
    }

    utterance.onend = () => {
      if (currentUtteranceRef.current !== utterance) return;
      currentUtteranceRef.current = null;

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
        speakCurrentWithTTS();
      }, pauseDuration);
    };

    utterance.onerror = (e) => {
      if (currentUtteranceRef.current !== utterance) return;
      currentUtteranceRef.current = null;

      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('SpeechSynthesis error:', e);
      stateRef.current.sentenceIdx += 1;
      setCurrentSentenceIndex(stateRef.current.sentenceIdx);
      speakCurrentWithTTS();
    };

    startStallKeepAlive();
    window.speechSynthesis.speak(utterance);
  }, []);

  // Orchestrator: decides whether to play pre-recorded audio or use TTS
  const playSection = useCallback((sectionIdx: number) => {
    const { sections: currentSections, playbackMode: mode, rate: currentRate } = stateRef.current;

    if (sectionIdx >= currentSections.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentRole(null);
      setCurrentMediaType(null);
      stateRef.current.isPlaying = false;
      stateRef.current.isPaused = false;
      stateRef.current.currentMediaType = null;
      stopAudio();
      cancelSpeech();
      return;
    }

    const section = currentSections[sectionIdx];
    if (!section) return;

    // Scroll section into view
    if (section.id) {
      const el = document.getElementById(section.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Check if we should attempt pre-recorded audio:
    // Only in 'hybrid' mode, when audioSrc is present, and when NOT marked isDynamic (changing lessons/psalms)
    const shouldTryRecording = mode === 'hybrid' && Boolean(section.audioSrc) && !section.isDynamic;

    if (shouldTryRecording && section.audioSrc) {
      cancelSpeech();
      stopAudio();

      const audio = new Audio(section.audioSrc);
      audioElementRef.current = audio;
      audio.playbackRate = Math.max(0.5, Math.min(2.0, currentRate || 1.0));

      setCurrentMediaType('recording');
      stateRef.current.currentMediaType = 'recording';
      setCurrentRole(null);

      audio.onended = () => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
        const nextIdx = sectionIdx + 1;
        stateRef.current.sectionIdx = nextIdx;
        stateRef.current.partIdx = 0;
        stateRef.current.sentenceIdx = 0;
        setCurrentSectionIndex(nextIdx);
        setCurrentPartIndex(0);
        setCurrentSentenceIndex(0);
        playSection(nextIdx);
      };

      // Fallback: if audio file not found (404) or cannot be loaded, transparently fallback to TTS!
      audio.onerror = () => {
        console.info(`[Hybrid Audio] Recording not found at ${section.audioSrc}; falling back smoothly to Speech Synthesis.`);
        stopAudio();
        speakCurrentWithTTS();
      };

      audio.play().catch(() => {
        // Autoplay rejection or network failure: fall back smoothly to TTS
        stopAudio();
        speakCurrentWithTTS();
      });
    } else {
      // Dynamic section (Psalms, Lessons, Collect of Day) or 'tts-only' mode
      stopAudio();
      speakCurrentWithTTS();
    }
  }, [cancelSpeech, stopAudio, speakCurrentWithTTS]);

  const play = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      stateRef.current.isPaused = false;
      stateRef.current.isPlaying = true;

      if (stateRef.current.currentMediaType === 'recording' && audioElementRef.current) {
        audioElementRef.current.play().catch(() => {
          playSection(stateRef.current.sectionIdx);
        });
      } else {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          playSection(stateRef.current.sectionIdx);
        }
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
    stateRef.current.isPaused = true;

    if (stateRef.current.currentMediaType === 'recording' && audioElementRef.current) {
      audioElementRef.current.pause();
    } else {
      cancelSpeech();
    }
  }, [cancelSpeech]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSectionIndex(0);
    setCurrentPartIndex(0);
    setCurrentSentenceIndex(0);
    setCurrentRole(null);
    setCurrentMediaType(null);
    stateRef.current.isPlaying = false;
    stateRef.current.isPaused = false;
    stateRef.current.sectionIdx = 0;
    stateRef.current.partIdx = 0;
    stateRef.current.sentenceIdx = 0;
    stateRef.current.currentMediaType = null;
    stopAudio();
    cancelSpeech();
  }, [cancelSpeech, stopAudio]);

  const nextSection = useCallback(() => {
    const nextIdx = Math.min(stateRef.current.sectionIdx + 1, stateRef.current.sections.length - 1);
    stopAudio();
    cancelSpeech();
    stateRef.current.sectionIdx = nextIdx;
    stateRef.current.partIdx = 0;
    stateRef.current.sentenceIdx = 0;
    setCurrentSectionIndex(nextIdx);
    setCurrentPartIndex(0);
    setCurrentSentenceIndex(0);

    if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
      playSection(nextIdx);
    }
  }, [cancelSpeech, stopAudio, playSection]);

  const prevSection = useCallback(() => {
    const prevIdx = Math.max(stateRef.current.sectionIdx - 1, 0);
    stopAudio();
    cancelSpeech();
    stateRef.current.sectionIdx = prevIdx;
    stateRef.current.partIdx = 0;
    stateRef.current.sentenceIdx = 0;
    setCurrentSectionIndex(prevIdx);
    setCurrentPartIndex(0);
    setCurrentSentenceIndex(0);

    if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
      playSection(prevIdx);
    }
  }, [cancelSpeech, stopAudio, playSection]);

  const jumpToSection = useCallback((idx: number) => {
    if (idx < 0 || idx >= stateRef.current.sections.length) return;
    stopAudio();
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
    playSection(idx);
  }, [cancelSpeech, stopAudio, playSection]);

  const changeRate = useCallback((newRate: number) => {
    const clamped = Math.max(0.5, Math.min(2.0, Number(newRate.toFixed(2))));
    setRate(clamped);
    stateRef.current.rate = clamped;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcp-tts-rate', String(clamped));
    }

    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = clamped;
    }

    // If currently playing TTS, restart current sentence with new rate after brief delay
    if (stateRef.current.isPlaying && !stateRef.current.isPaused && stateRef.current.currentMediaType === 'tts') {
      cancelSpeech();
      setTimeout(() => {
        if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
          speakCurrentWithTTS();
        }
      }, 50);
    }
  }, [cancelSpeech, speakCurrentWithTTS]);

  const setPlaybackMode = useCallback((mode: PlaybackMode) => {
    setPlaybackModeState(mode);
    stateRef.current.playbackMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcp-playback-mode', mode);
    }
    // If currently playing, seamlessly switch mode for current section
    if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
      stopAudio();
      cancelSpeech();
      setTimeout(() => {
        playSection(stateRef.current.sectionIdx);
      }, 50);
    }
  }, [stopAudio, cancelSpeech, playSection]);

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
    currentMediaType,
    playbackMode,
    setPlaybackMode,
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
