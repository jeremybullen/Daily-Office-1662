import { Play, Pause, SkipBack, SkipForward, X, Volume2, Users, User } from 'lucide-react';
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
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onChangeRate,
  onClose
}: AudioPlayerProps) {
  if (!isOpen) return null;

  const cycleSpeed = () => {
    const speeds = [0.85, 0.95, 1.05, 1.15];
    const currentIndex = speeds.findIndex(s => Math.abs(s - rate) < 0.04);
    const nextIndex = (currentIndex + 1) % speeds.length;
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
        <div className="flex flex-col gap-2">
          {/* Top metadata row */}
          <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="font-serif font-semibold text-sm truncate opacity-90">
                {currentSectionTitle || 'Daily Office Audio'}
              </span>
              <span className="text-[11px] opacity-50 shrink-0 font-serif">
                ({currentSectionIndex + 1}/{totalSections})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Voice indicator */}
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

          {/* Bottom control row */}
          <div className="flex items-center justify-between pt-0.5">
            {/* Speed toggle */}
            <button
              type="button"
              onClick={cycleSpeed}
              title="Change speech rate"
              className="px-2.5 py-1 text-[11px] font-semibold tracking-wider rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 opacity-80 hover:opacity-100 transition-colors"
            >
              {rate.toFixed(2).replace(/\.00$/, '')}x
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

            {/* Dual Voice Status Badge */}
            <div 
              title={hasDistinctVoices ? "Using two distinct OS voices for Call and Response" : "Using distinct pitches for Call and Response"} 
              className="text-[11px] opacity-60 font-serif flex items-center gap-1"
            >
              <Volume2 size={12} />
              <span className="hidden sm:inline">2 Voices</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
