import { useState } from 'react';
import { Sun, Moon, Type, ChevronDown } from 'lucide-react';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { getLiturgicalWeek } from '../utils/lectionary';
import { OfficeType, AppSettings, FontSize } from '../types';
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
}

export function Header({ office, setOffice, settings, updateSettings, selectedDate, onSelectDate, completedData }: HeaderProps) {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const isHidden = scrollDirection === 'down' && !isAtTop && !calendarOpen;
  

  const displayDate = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const litWeek = getLiturgicalWeek(selectedDate);


  const cycleTheme = () => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  const cycleTranslation = () => updateSettings({ translation: settings.translation === 'KJV' ? 'ESV' : 'KJV' });
  const cycleFontSize = () => {
    const sizes: FontSize[] = ['text-base', 'text-lg', 'text-xl', 'text-2xl'];
    const idx = sizes.indexOf(settings.fontSize);
    const nextSize = sizes[(idx + 1) % sizes.length];
    updateSettings({ fontSize: nextSize });
  };
  const cycleOffice = () => {
    setOffice(office === 'morning' ? 'evening' : 'morning');
  };

  const displayOffice = office === 'morning' ? 'AM' : 'PM';

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-40 transition-transform duration-500 ease-in-out glass-header ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            className="truncate pr-2 cursor-pointer flex items-center gap-2 select-none group"
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            <div>
              <p className="font-semibold text-base sm:text-lg leading-tight truncate group-hover:opacity-80 transition-opacity">Daily Office</p>
              <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] sm:text-xs truncate">{displayDate}</p>
                <ChevronDown size={12} className={`transition-transform duration-300 ${calendarOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button onClick={cycleOffice} className="px-2.5 h-8 text-[11px] font-semibold tracking-wide rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              {displayOffice}
            </button>
            <button onClick={cycleTranslation} className="px-2.5 h-8 text-[11px] font-semibold tracking-wide rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              {settings.translation}
            </button>
            <button onClick={cycleFontSize} aria-label="Toggle Font Size" className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              <Type size={14} />
            </button>
            <button onClick={cycleTheme} aria-label="Toggle Theme" className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              {settings.theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            
          </div>
        </div>
        
        {/* Calendar Dropdown */}
        <AnimatePresence>
          {calendarOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
