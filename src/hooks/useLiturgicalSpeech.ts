import { useState, useEffect, useRef, useCallback } from 'react';
import { LiturgySpeechSection, isHymnAudio } from '../utils/speechEngine';
import { LITURGICAL_AUDIO_CANDIDATES } from '../utils/liturgicalAudioManifest';

interface UseLiturgicalSpeechProps {
  sections: LiturgySpeechSection[];
  office?: 'morning' | 'evening';
  dayTitle?: string;
}

export function useLiturgicalSpeech({ sections, office = 'morning', dayTitle }: UseLiturgicalSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isCurrentHymn, setIsCurrentHymn] = useState(false);

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
    isCurrentHymn: false,
    sections: [] as LiturgySpeechSection[],
    office: 'morning' as 'morning' | 'evening',
    dayTitle: ''
  });

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const keepAliveOscRef = useRef<OscillatorNode | null>(null);
  const wakeLockSentinelRef = useRef<any>(null);

  // Keep stateRef in sync on every render
  stateRef.current.sections = sections;
  stateRef.current.rate = rate;
  stateRef.current.office = office;
  stateRef.current.dayTitle = dayTitle || '';

  // Single persistent HTMLAudioElement in DOM for mobile background audio continuity
  const getOrCreateAudioElement = useCallback((): HTMLAudioElement => {
    if (audioElementRef.current && document.body.contains(audioElementRef.current)) {
      return audioElementRef.current;
    }

    if (typeof document !== 'undefined') {
      let existing = document.getElementById('bcp-liturgical-audio') as HTMLAudioElement | null;
      if (!existing) {
        existing = document.createElement('audio');
        existing.id = 'bcp-liturgical-audio';
        existing.setAttribute('playsinline', 'true');
        existing.setAttribute('webkit-playsinline', 'true');
        existing.preload = 'auto';
        existing.style.position = 'fixed';
        existing.style.bottom = '-9999px';
        existing.style.left = '-9999px';
        existing.style.opacity = '0';
        existing.style.pointerEvents = 'none';
        document.body.appendChild(existing);
      }
      audioElementRef.current = existing;
      return existing;
    }

    const fallback = new Audio();
    audioElementRef.current = fallback;
    return fallback;
  }, []);

  // Web Audio keep-alive: keeps mobile CoreAudio session active when screen turns off
  const ensureKeepAlive = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!keepAliveOscRef.current && ctx.state === 'running') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.00001; // Inaudible, but keeps hardware active
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        keepAliveOscRef.current = osc;
      }
    } catch (e) {}
  }, []);

  const suspendKeepAlive = useCallback(() => {
    try {
      if (keepAliveOscRef.current) {
        keepAliveOscRef.current.stop();
        keepAliveOscRef.current.disconnect();
        keepAliveOscRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(() => {});
      }
    } catch (e) {}
  }, []);

  // Screen Wake Lock API
  const requestWakeLock = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockSentinelRef.current.addEventListener('release', () => {
          wakeLockSentinelRef.current = null;
        });
      }
    } catch (e) {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
        wakeLockSentinelRef.current = null;
      }
    } catch (e) {}
  }, []);

  // MediaSession metadata update
  const updateMediaSession = useCallback((section: LiturgySpeechSection) => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const albumTitle = stateRef.current.office === 'evening' ? 'Order for Evening Prayer' : 'Order for Morning Prayer';
      const meta = new (window as any).MediaMetadata({
        title: section.title || 'Daily Office',
        artist: '1662 Book of Common Prayer',
        album: albumTitle,
        artwork: [
          { src: '/hymns/Psalm-95.png', sizes: '512x512', type: 'image/png' },
          { src: '/hymns/te-deum.png', sizes: '512x512', type: 'image/png' },
          { src: '/hymns/Lord%27s%20Prayer.jpg', sizes: '685x990', type: 'image/jpeg' }
        ]
      });
      navigator.mediaSession.metadata = meta;
      navigator.mediaSession.playbackState = 'playing';
    } catch (e) {}
  }, []);

  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.onended = null;
      audioElementRef.current.onerror = null;
      audioElementRef.current.ontimeupdate = null;
      audioElementRef.current.pause();
    }
    releaseWakeLock();
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch (e) {}
    }
  }, [releaseWakeLock]);

  const scrollToSection = useCallback((id?: string) => {
    if (!id || typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const playSection = useCallback((sectionIdx: number) => {
    const currentSections = stateRef.current.sections;
    if (sectionIdx < 0 || sectionIdx >= currentSections.length) {
      setIsPlaying(false);
      setIsPaused(false);
      stateRef.current.isPlaying = false;
      stateRef.current.isPaused = false;
      stopAudio();
      suspendKeepAlive();
      return;
    }

    stateRef.current.sectionIdx = sectionIdx;
    setCurrentSectionIndex(sectionIdx);

    const section = currentSections[sectionIdx];
    if (!section) return;

    scrollToSection(section.id);
    updateMediaSession(section);
    requestWakeLock();
    ensureKeepAlive();

    const candidateUrls: string[] = [];
    if (section.audioCandidates && section.audioCandidates.length > 0) {
      candidateUrls.push(...section.audioCandidates);
    } else if (section.audioSrc) {
      candidateUrls.push(section.audioSrc);
    } else if (section.id && LITURGICAL_AUDIO_CANDIDATES[section.id]) {
      candidateUrls.push(...LITURGICAL_AUDIO_CANDIDATES[section.id]);
    }

    const uniqueCandidates = Array.from(new Set(candidateUrls));
    const audio = getOrCreateAudioElement();

    const tryPlayCandidate = (candIdx: number) => {
      if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;

      if (candIdx >= uniqueCandidates.length) {
        // Advance immediately to next section
        playSection(sectionIdx + 1);
        return;
      }

      const candidatePath = uniqueCandidates[candIdx];
      const encodedPath = (candidatePath.startsWith('/api/') || candidatePath.startsWith('http'))
        ? candidatePath
        : encodeURI(candidatePath);

      const isHymn = !!section.isHymn || isHymnAudio(candidatePath);
      stateRef.current.isCurrentHymn = isHymn;
      setIsCurrentHymn(isHymn);

      audio.onended = null;
      audio.onerror = null;
      audio.src = encodedPath;
      audio.currentTime = 0;
      audio.playbackRate = isHymn ? 1.0 : Math.max(0.5, Math.min(2.0, stateRef.current.rate || 1.0));

      audio.onended = () => {
        if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
        playSection(sectionIdx + 1);
      };

      audio.ontimeupdate = () => {
        if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && (navigator.mediaSession as any).setPositionState) {
          try {
            if (!isNaN(audio.duration) && audio.duration > 0) {
              (navigator.mediaSession as any).setPositionState({
                duration: audio.duration,
                playbackRate: audio.playbackRate,
                position: Math.min(audio.currentTime, audio.duration)
              });
            }
          } catch (e) {}
        }
      };

      let isFailed = false;
      const failAndNext = (err?: any) => {
        if (isFailed) return;
        isFailed = true;
        audio.onerror = null;
        audio.onended = null;
        tryPlayCandidate(candIdx + 1);
      };

      audio.onerror = failAndNext;
      audio.load();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(failAndNext);
      }
    };

    tryPlayCandidate(0);
  }, [getOrCreateAudioElement, updateMediaSession, requestWakeLock, ensureKeepAlive, stopAudio, suspendKeepAlive, scrollToSection]);

  const play = useCallback(() => {
    ensureKeepAlive();
    requestWakeLock();

    if (stateRef.current.isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      stateRef.current.isPaused = false;
      stateRef.current.isPlaying = true;

      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.playbackState = 'playing';
        } catch (e) {}
      }

      const audio = getOrCreateAudioElement();
      if (audio.src && !audio.ended && audio.currentTime > 0) {
        const p = audio.play();
        if (p !== undefined) {
          p.catch(() => {
            playSection(stateRef.current.sectionIdx);
          });
        }
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
  }, [ensureKeepAlive, requestWakeLock, getOrCreateAudioElement, playSection]);

  const pause = useCallback(() => {
    setIsPaused(true);
    setIsPlaying(false);
    stateRef.current.isPaused = true;
    stateRef.current.isPlaying = false;
    releaseWakeLock();

    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch (e) {}
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, [releaseWakeLock]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    stateRef.current.isPlaying = false;
    stateRef.current.isPaused = false;
    stateRef.current.sectionIdx = 0;
    setCurrentSectionIndex(0);
    stopAudio();
    suspendKeepAlive();
  }, [stopAudio, suspendKeepAlive]);

  const nextSection = useCallback(() => {
    const currentSections = stateRef.current.sections;
    const nextIdx = stateRef.current.sectionIdx + 1;
    if (nextIdx < currentSections.length) {
      if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
        playSection(nextIdx);
      } else {
        stateRef.current.sectionIdx = nextIdx;
        setCurrentSectionIndex(nextIdx);
        scrollToSection(currentSections[nextIdx]?.id);
      }
    }
  }, [playSection, scrollToSection]);

  const prevSection = useCallback(() => {
    const currentSections = stateRef.current.sections;
    const prevIdx = stateRef.current.sectionIdx - 1;
    if (prevIdx >= 0) {
      if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
        playSection(prevIdx);
      } else {
        stateRef.current.sectionIdx = prevIdx;
        setCurrentSectionIndex(prevIdx);
        scrollToSection(currentSections[prevIdx]?.id);
      }
    }
  }, [playSection, scrollToSection]);

  const changeRate = useCallback((newRate: number) => {
    setRate(newRate);
    stateRef.current.rate = newRate;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcp-audio-rate', newRate.toString());
    }
    if (audioElementRef.current) {
      if (!stateRef.current.isCurrentHymn) {
        audioElementRef.current.playbackRate = newRate;
      } else {
        audioElementRef.current.playbackRate = 1.0;
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    getOrCreateAudioElement();
    return () => {
      stopAudio();
      suspendKeepAlive();
    };
  }, [getOrCreateAudioElement, stopAudio, suspendKeepAlive]);

  // Register MediaSession action handlers once with stable refs
  const playRef = useRef(play);
  playRef.current = play;
  const pauseRef = useRef(pause);
  pauseRef.current = pause;
  const stopRef = useRef(stop);
  stopRef.current = stop;
  const prevRef = useRef(prevSection);
  prevRef.current = prevSection;
  const nextRef = useRef(nextSection);
  nextRef.current = nextSection;

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => playRef.current());
      navigator.mediaSession.setActionHandler('pause', () => pauseRef.current());
      navigator.mediaSession.setActionHandler('stop', () => stopRef.current());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevRef.current());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextRef.current());
    } catch (e) {}

    return () => {
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('stop', null);
          navigator.mediaSession.setActionHandler('previoustrack', null);
          navigator.mediaSession.setActionHandler('nexttrack', null);
        } catch (e) {}
      }
    };
  }, []);

  const currentSection = sections[currentSectionIndex];

  return {
    isPlaying,
    isPaused,
    isCurrentHymn,
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
