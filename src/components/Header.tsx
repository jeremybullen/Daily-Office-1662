import { useState } from 'react';
import { ChevronDown, Sun, Moon, Volume2, Mic, Music, Check } from 'lucide-react';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { getLiturgicalWeek } from '../utils/lectionary';
import { OfficeType, AppSettings, Theme } from '../types';
import { CalendarPicker } from './CalendarPicker';
import { AnimatePresence, motion } from 'motion/react';

interface HeaderProps {
  office: OfficeType;
  setOffice: (o: OfficeType) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  completedData: Record<string, { morning?: boolean, evening?: boolean }>;
  theme: Theme;
  toggleTheme: () => void;
  onOpenAbout?: () => void;
  onToggleAudio?: () => void;
  onPlaySpoken?: () => void;
  onPlayMusic?: () => void;
  audioMode?: 'spoken' | 'music';
  isAudioPlaying?: boolean;
  isAudioOpen?: boolean;
}

export function Header({ 
  office, 
  setOffice, 
  settings, 
  updateSettings, 
  selectedDate, 
  onSelectDate, 
  completedData,
  theme,
  toggleTheme,
  onToggleAudio,
  onPlaySpoken,
  onPlayMusic,
  audioMode = 'spoken',
  isAudioPlaying,
  isAudioOpen
}: HeaderProps) {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [listenMenuOpen, setListenMenuOpen] = useState(false);
  const isHidden = scrollDirection === 'down' && !isAtTop && !calendarOpen;

  const displayDate = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const litWeek = getLiturgicalWeek(selectedDate);

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-40 transition-transform duration-500 ease-in-out glass-header ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="relative min-w-0">
            <div 
              className="truncate pr-1 sm:pr-2 cursor-pointer flex items-center gap-1.5 sm:gap-2 select-none group"
              onClick={() => setCalendarOpen(!calendarOpen)}
            >
              <span className="font-semibold text-sm sm:text-base md:text-lg leading-tight truncate group-hover:opacity-80 transition-opacity">
                {displayDate}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 opacity-70 group-hover:opacity-100 shrink-0 ${calendarOpen ? 'rotate-180' : ''}`} />
            </div>
            
            <AnimatePresence>
              {calendarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 z-50"
                >
                  <CalendarPicker 
                    selectedDate={selectedDate} 
                    onSelectDate={onSelectDate} 
                    completedData={completedData} 
                    onClose={() => setCalendarOpen(false)} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Morning / Evening Switcher */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-full p-0.5 text-[11px] sm:text-xs">
              <button 
                type="button"
                onClick={() => setOffice('morning')}
                className={`px-2 sm:px-3 h-7 flex items-center justify-center rounded-full font-medium tracking-wide transition-all ${
                  office === 'morning' 
                    ? 'bg-white dark:bg-slate-800 text-[var(--text-color)] shadow-xs font-semibold' 
                    : 'opacity-65 hover:opacity-100'
                }`}
                title="Morning Prayer"
              >
                Morning
              </button>
              <button 
                type="button"
                onClick={() => setOffice('evening')}
                className={`px-2 sm:px-3 h-7 flex items-center justify-center rounded-full font-medium tracking-wide transition-all ${
                  office === 'evening' 
                    ? 'bg-white dark:bg-slate-800 text-[var(--text-color)] shadow-xs font-semibold' 
                    : 'opacity-65 hover:opacity-100'
                }`}
                title="Evening Prayer"
              >
                Evening
              </button>
            </div>

            {/* Dark / Light Mode Switcher */}
            <button 
              type="button"
              onClick={toggleTheme} 
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors opacity-85 hover:opacity-100"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Audio Service Trigger with Spoken & Music options */}
            {onToggleAudio && (
              <div className="relative">
                <div className={`h-8 rounded-full flex items-center p-0.5 transition-all text-[11px] sm:text-xs font-medium tracking-wide border ${
                  isAudioPlaying || isAudioOpen
                    ? 'bg-amber-600/15 dark:bg-amber-400/20 text-amber-800 dark:text-amber-200 border-amber-600/30'
                    : 'bg-black/5 dark:bg-white/10 border-transparent hover:bg-black/10 dark:hover:bg-white/20'
                }`}>
                  {/* Main Listen / Play-Pause Trigger */}
                  <button
                    type="button"
                    onClick={onToggleAudio}
                    aria-label={isAudioPlaying ? "Pause reading" : `Listen to ${audioMode === 'music' ? 'Music' : 'Spoken'} Office`}
                    title={isAudioPlaying ? "Pause reading" : `Listen to ${audioMode === 'music' ? 'Music' : 'Spoken'} Office`}
                    className="h-7 px-2 sm:px-2.5 rounded-full flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Volume2 size={13} className={isAudioPlaying ? 'animate-pulse text-amber-600 dark:text-amber-400' : ''} />
                    <span className="hidden sm:inline">{isAudioPlaying ? 'Playing' : 'Listen'}</span>
                  </button>

                  {/* Options Menu Trigger */}
                  <button
                    type="button"
                    onClick={() => setListenMenuOpen(!listenMenuOpen)}
                    aria-label="Select audio options: Spoken or Music"
                    title="Audio options: Spoken or Music"
                    className="h-7 px-1.5 sm:px-2 rounded-full flex items-center gap-0.5 sm:gap-1 opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/15 transition-colors border-l border-black/10 dark:border-white/10 cursor-pointer"
                  >
                    <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase opacity-90">
                      {audioMode === 'music' ? 'Music' : 'Spoken'}
                    </span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${listenMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Menu for Spoken vs Music */}
                <AnimatePresence>
                  {listenMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setListenMenuOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 z-50 w-64 p-1.5 rounded-2xl bg-[var(--bg-color)]/95 backdrop-blur-md border border-black/15 dark:border-white/15 shadow-2xl select-none"
                      >
                        <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                          Listen Options
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (onPlaySpoken) onPlaySpoken();
                            setListenMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            audioMode === 'spoken'
                              ? 'bg-amber-500/15 dark:bg-amber-400/20 font-semibold text-amber-900 dark:text-amber-200'
                              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                              <Mic size={13} className={audioMode === 'spoken' ? 'text-amber-600 dark:text-amber-400' : 'opacity-70'} />
                            </div>
                            <div>
                              <div className="font-medium">Spoken</div>
                              <div className="text-[10px] opacity-60 font-normal">Full service without hymns</div>
                            </div>
                          </div>
                          {audioMode === 'spoken' && <Check size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onPlayMusic) onPlayMusic();
                            setListenMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors mt-1 cursor-pointer ${
                            audioMode === 'music'
                              ? 'bg-amber-500/15 dark:bg-amber-400/20 font-semibold text-amber-900 dark:text-amber-200'
                              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                              <Music size={13} className={audioMode === 'music' ? 'text-amber-600 dark:text-amber-400' : 'opacity-70'} />
                            </div>
                            <div>
                              <div className="font-medium">Music</div>
                              <div className="text-[10px] opacity-60 font-normal">Full service with hymn versions</div>
                            </div>
                          </div>
                          {audioMode === 'music' && <Check size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <AnimatePresence>
        {calendarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setCalendarOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
