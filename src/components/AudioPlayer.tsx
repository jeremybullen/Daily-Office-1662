import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, X, Music, Mic, Info, BookOpen } from 'lucide-react';

interface AudioPlayerProps {
  isOpen: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isCurrentHymn?: boolean;
  isCurrentApocrypha?: boolean;
  serviceMode?: 'spoken' | 'music';
  onToggleServiceMode?: () => void;
  onSelectSpoken?: () => void;
  onSelectHymns?: () => void;
  currentSectionTitle: string;
  currentSectionIndex: number;
  totalSections: number;
  rate: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onChangeRate: (rate: number) => void;
  onClose: () => void;
}

export function AudioPlayer({
  isOpen,
  isPlaying,
  isPaused,
  isCurrentHymn = false,
  isCurrentApocrypha = false,
  serviceMode = 'spoken',
  onToggleServiceMode,
  onSelectSpoken,
  onSelectHymns,
  currentSectionTitle,
  currentSectionIndex,
  totalSections,
  rate,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onChangeRate,
  onClose,
}: AudioPlayerProps) {
  if (!isOpen) return null;

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    let bestIdx = 0;
    let minDiff = 999;
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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md bg-[var(--bg-color)]/95 backdrop-blur-md border border-black/15 dark:border-white/15 shadow-2xl rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 select-none"
      >
        <div className="flex flex-col gap-2.5">
          {/* Top metadata row */}
          <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isPlaying && !isPaused ? 'bg-amber-500 animate-pulse' : 'bg-black/30 dark:bg-white/30'}`} />
              <span className="font-serif font-semibold text-sm truncate opacity-90">
                {currentSectionTitle || 'Daily Office'}
              </span>
              <span className="text-[11px] opacity-50 shrink-0 font-serif">
                ({currentSectionIndex + 1}/{totalSections})
              </span>
              {isCurrentHymn && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-200 font-medium shrink-0 flex items-center gap-1 border border-amber-500/20">
                  <Music size={10} />
                  Hymn
                </span>
              )}
              {isCurrentApocrypha && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-200 font-medium shrink-0 flex items-center gap-1 border border-amber-500/20">
                  <BookOpen size={10} />
                  Apocrypha
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onStop();
                onClose();
              }}
              title="Stop and close"
              className="w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {/* Integrated Notice for Apocryphal Readings */}
          {isCurrentApocrypha && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 dark:border-amber-400/25 text-amber-950 dark:text-amber-100 text-xs font-serif"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Info size={14} className="shrink-0 text-amber-700 dark:text-amber-300" />
                <span className="leading-tight">
                  <strong className="font-semibold">Apocrypha audio is not available.</strong> Paused to read. Click skip to proceed.
                </span>
              </div>
              <button
                type="button"
                onClick={onNext}
                title="Skip to next item"
                className="shrink-0 px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-sans text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <span>Skip</span>
                <SkipForward size={11} />
              </button>
            </motion.div>
          )}

          {/* Controls row */}
          <div className="flex items-center justify-between pt-0.5">
            {/* Speed toggle */}
            <button
              type="button"
              onClick={cycleSpeed}
              title="Click to cycle speed (1x, 1.25x, 1.5x, 2x)"
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
                onClick={() => {
                  if (isCurrentApocrypha) {
                    onNext();
                  } else if (isPlaying && !isPaused) {
                    onPause();
                  } else {
                    onPlay();
                  }
                }}
                title={isCurrentApocrypha ? "Skip to next item (Apocrypha audio is not available)" : isPlaying && !isPaused ? 'Pause' : 'Play'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
                  isCurrentApocrypha
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                }`}
              >
                {isCurrentApocrypha ? (
                  <SkipForward size={18} />
                ) : isPlaying && !isPaused ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} className="translate-x-0.5" />
                )}
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

            {/* Mode Segmented Control: Spoken vs Hymns */}
            {(onToggleServiceMode || onSelectSpoken || onSelectHymns) && (
              <div 
                role="radiogroup" 
                aria-label="Service Audio Mode"
                className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 text-[11px] font-medium tracking-tight shrink-0"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={serviceMode === 'spoken'}
                  onClick={() => {
                    if (serviceMode !== 'spoken') {
                      if (onSelectSpoken) onSelectSpoken();
                      else if (onToggleServiceMode) onToggleServiceMode();
                    }
                  }}
                  title="Spoken prose without hymns"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    serviceMode === 'spoken'
                      ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-xs font-semibold'
                      : 'opacity-65 hover:opacity-100 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Mic size={11} />
                  <span>Spoken</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={serviceMode === 'music'}
                  onClick={() => {
                    if (serviceMode !== 'music') {
                      if (onSelectHymns) onSelectHymns();
                      else if (onToggleServiceMode) onToggleServiceMode();
                    }
                  }}
                  title="Includes sung canticles and hymns"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    serviceMode === 'music'
                      ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-xs font-semibold'
                      : 'opacity-65 hover:opacity-100 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Music size={11} />
                  <span>Hymns</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
