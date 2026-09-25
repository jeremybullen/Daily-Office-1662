import { useState } from 'react';
import { ChevronDown, Sun, Moon, Volume2 } from 'lucide-react';
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
  isAudioPlaying,
  isAudioOpen
}: HeaderProps) {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const isHidden = scrollDirection === 'down' && !isAtTop && !calendarOpen;

  const displayDate = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const litWeek = getLiturgicalWeek(selectedDate);

  const cycleForm = () => updateSettings({ useShortForm: !settings.useShortForm });

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

            {/* Short / Full Form Toggle */}
            <button 
              type="button"
              onClick={cycleForm} 
              title={settings.useShortForm ? "Switch to Full Office" : "Switch to Short Form"}
              className="px-2.5 sm:px-3 h-7 text-[11px] sm:text-xs font-medium tracking-wide rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              {settings.useShortForm ? 'Short' : 'Full'}
            </button>

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

            {/* Audio Speech Player Trigger */}
            {onToggleAudio && (
              <button
                type="button"
                onClick={onToggleAudio}
                aria-label={isAudioPlaying ? "Pause reading" : "Listen to Office"}
                title={isAudioPlaying ? "Pause reading" : "Listen to Office"}
                className={`h-8 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 transition-all text-[11px] sm:text-xs font-medium tracking-wide ${
                  isAudioPlaying || isAudioOpen
                    ? 'bg-amber-600/15 dark:bg-amber-400/20 text-amber-800 dark:text-amber-200 border border-amber-600/30'
                    : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 opacity-85 hover:opacity-100'
                }`}
              >
                <Volume2 size={14} className={isAudioPlaying ? 'animate-pulse text-amber-600 dark:text-amber-400' : ''} />
                <span className="hidden sm:inline">{isAudioPlaying ? 'Playing' : 'Listen'}</span>
              </button>
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
