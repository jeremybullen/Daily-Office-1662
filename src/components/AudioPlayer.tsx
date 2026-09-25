import { useState, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, Users, User, SlidersHorizontal, RotateCcw, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioPlayerProps {
  isOpen: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentSectionTitle: string;
  currentRole: 'call' | 'response' | null;
  currentSectionIndex: number;
  totalSections: number;
  rate: number;
  hasDistinctVoices: boolean;
  availableVoices: SpeechSynthesisVoice[];
  ministerVoiceUri: string;
  peopleVoiceUri: string;
  onSelectMinisterVoice: (uri: string) => void;
  onSelectPeopleVoice: (uri: string) => void;
  onResetVoices: () => void;
  onPreviewVoice: (role: 'call' | 'response', uri?: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onChangeRate: (newRate: number) => void;
  onClose: () => void;
}

export function AudioPlayer({
  isOpen,
  isPlaying,
  isPaused,
  currentSectionTitle,
  currentRole,
  currentSectionIndex,
  totalSections,
  rate,
  hasDistinctVoices,
  availableVoices,
  ministerVoiceUri,
  peopleVoiceUri,
  onSelectMinisterVoice,
  onSelectPeopleVoice,
  onResetVoices,
  onPreviewVoice,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onChangeRate,
  onClose
}: AudioPlayerProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Group voices for easy browsing: English first, then others
  const { englishVoices, otherVoices } = useMemo(() => {
    const english: SpeechSynthesisVoice[] = [];
    const others: SpeechSynthesisVoice[] = [];
    for (const v of availableVoices) {
      if (v.lang.toLowerCase().startsWith('en')) {
        english.push(v);
      } else {
        others.push(v);
      }
    }
    // Sort British voices first within English, then alphabetical
    english.sort((a, b) => {
      const aGb = a.lang.toLowerCase().includes('gb') || a.name.toLowerCase().includes('uk') ? -1 : 1;
      const bGb = b.lang.toLowerCase().includes('gb') || b.name.toLowerCase().includes('uk') ? -1 : 1;
      if (aGb !== bGb) return aGb - bGb;
      return a.name.localeCompare(b.name);
    });
    return { englishVoices: english, otherVoices: others };
  }, [availableVoices]);

  if (!isOpen) return null;

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75];
    let bestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < speeds.length; i++) {
      const diff = Math.abs(speeds[i] - rate);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = i;
      }
    }
    const nextIndex = (bestIdx + 1) % speeds.length;
    onChangeRate(speeds[nextIndex]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg bg-[var(--bg-color)]/95 backdrop-blur-md border border-black/15 dark:border-white/15 shadow-2xl rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 select-none"
      >
        <div className="flex flex-col gap-2.5">
          {/* Top metadata row */}
          <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isPlaying && !isPaused ? 'bg-amber-500 animate-pulse' : 'bg-black/30 dark:bg-white/30'}`} />
              <span className="font-serif font-semibold text-sm truncate opacity-90">
                {currentSectionTitle || 'Daily Office Audio'}
              </span>
              <span className="text-[11px] opacity-50 shrink-0 font-serif">
                ({currentSectionIndex + 1}/{totalSections})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Call vs Response voice indicator */}
              {currentRole && (
                <div className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium tracking-wide transition-colors ${
                  currentRole === 'response'
                    ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                }`}>
                  {currentRole === 'response' ? (
                    <>
                      <Users size={11} />
                      <span>People</span>
                    </>
                  ) : (
                    <>
                      <User size={11} />
                      <span>Minister</span>
                    </>
                  )}
                </div>
              )}

              {/* Close / Dismiss */}
              <button
                type="button"
                onClick={() => {
                  onStop();
                  onClose();
                }}
                title="Stop and close"
                className="w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Voice Settings Accordion Panel */}
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-black/10 dark:border-white/10 pb-3 mb-1 text-xs"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5 font-medium opacity-80">
                    <SlidersHorizontal size={13} />
                    <span>Voice Selection</span>
                  </div>
                  <button
                    type="button"
                    onClick={onResetVoices}
                    title="Reset to recommended auto-detected voices"
                    className="flex items-center gap-1 text-[11px] opacity-60 hover:opacity-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Reset to Auto</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Minister Voice */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold flex items-center gap-1 opacity-75">
                      <User size={11} className="text-amber-600 dark:text-amber-400" />
                      <span>Minister (Call)</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <select
                        value={ministerVoiceUri}
                        onChange={(e) => onSelectMinisterVoice(e.target.value)}
                        className="w-full text-xs py-1 px-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 focus:outline-hidden focus:ring-1 focus:ring-amber-500 truncate"
                      >
                        {englishVoices.length > 0 && (
                          <optgroup label="English Voices">
                            {englishVoices.map((v) => (
                              <option key={v.voiceURI} value={v.voiceURI}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {otherVoices.length > 0 && (
                          <optgroup label="Other Installed Voices">
                            {otherVoices.map((v) => (
                              <option key={v.voiceURI} value={v.voiceURI}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => onPreviewVoice('call', ministerVoiceUri)}
                        title="Preview Minister voice"
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 opacity-70 hover:opacity-100"
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* People Voice */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold flex items-center gap-1 opacity-75">
                      <Users size={11} className="text-sky-600 dark:text-sky-400" />
                      <span>People (Response)</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <select
                        value={peopleVoiceUri}
                        onChange={(e) => onSelectPeopleVoice(e.target.value)}
                        className="w-full text-xs py-1 px-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 focus:outline-hidden focus:ring-1 focus:ring-amber-500 truncate"
                      >
                        {englishVoices.length > 0 && (
                          <optgroup label="English Voices">
                            {englishVoices.map((v) => (
                              <option key={v.voiceURI} value={v.voiceURI}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {otherVoices.length > 0 && (
                          <optgroup label="Other Installed Voices">
                            {otherVoices.map((v) => (
                              <option key={v.voiceURI} value={v.voiceURI}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => onPreviewVoice('response', peopleVoiceUri)}
                        title="Preview People voice"
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 opacity-70 hover:opacity-100"
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Speed Controls Row in Drawer */}
                <div className="pt-2 mt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold opacity-75">Reading Speed</span>
                    <span className="text-[11px] font-mono font-medium opacity-90">{rate.toFixed(2).replace(/\.?0+$/, '')}x</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0.75, 1.0, 1.25, 1.5, 1.75].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => onChangeRate(spd)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all ${
                          Math.abs(spd - rate) < 0.05
                            ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-black font-semibold shadow-xs'
                            : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {spd === 0.75 ? '0.75x' : spd === 1.0 ? '1.0x' : `${spd}x`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] opacity-60 pt-2 flex items-center justify-between">
                  <span>
                    {hasDistinctVoices
                      ? '✓ Two distinct voice actors active'
                      : 'ℹ Modulating pitch for Call vs Response (single voice detected)'}
                  </span>
                  <span>1662 Phonetics & Colon Pausing active</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom control row */}
          <div className="flex items-center justify-between pt-0.5">
            {/* Speed toggle */}
            <button
              type="button"
              onClick={cycleSpeed}
              title="Click to cycle speed (0.75x, 1.0x, 1.25x, 1.5x, 1.75x)"
              className="px-2.5 py-1 text-[11px] font-semibold tracking-wider rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 opacity-80 hover:opacity-100 transition-colors cursor-pointer"
            >
              {rate.toFixed(2).replace(/\.?0+$/, '')}x
            </button>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrev}
                disabled={currentSectionIndex === 0}
                title="Previous section"
                className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <SkipBack size={16} />
              </button>

              <button
                type="button"
                onClick={isPlaying && !isPaused ? onPause : onPlay}
                title={isPlaying && !isPaused ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-md transition-all active:scale-95"
              >
                {isPlaying && !isPaused ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={currentSectionIndex >= totalSections - 1}
                title="Next section"
                className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* Voice Settings Toggle Button */}
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              title={settingsOpen ? "Hide voice settings" : "Change voices for Minister & People"}
              className={`text-[11px] px-2 py-1 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                settingsOpen 
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30'
                  : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 opacity-80 hover:opacity-100'
              }`}
            >
              <SlidersHorizontal size={12} />
              <span className="hidden sm:inline">Voices</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
