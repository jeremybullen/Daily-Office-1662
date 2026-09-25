import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Liturgy } from './components/Liturgy';
import { AboutModal } from './components/AboutModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getCurrentOfficeType } from './utils/liturgyHelpers';
import { AppSettings, OfficeType, CompletedData, Theme } from './types';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export default function App() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('bcp-settings', {
    useShortForm: false,
    shortLessonPreference: 'OT'
  });
  
  const [theme, setTheme] = useLocalStorage<Theme>('bcp-theme', getInitialTheme());
  const [currentOffice, setCurrentOffice] = useState<OfficeType>(getCurrentOfficeType());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completedData, setCompletedData] = useLocalStorage<CompletedData>('bcp-completed', {});
  const [aboutOpen, setAboutOpen] = useState(false);
  const [audioState, setAudioState] = useState<{ isPlaying: boolean; isOpen: boolean; toggle: () => void }>({
    isPlaying: false,
    isOpen: false,
    toggle: () => {}
  });

  // Apply theme class to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleCompleted = () => {
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setCompletedData(prev => {
      const dayData = prev[dateKey] || {};
      return {
        ...prev,
        [dateKey]: {
          ...dayData,
          [currentOffice]: !dayData[currentOffice]
        }
      };
    });
  };

  return (
    <div className="min-h-screen text-base leading-normal">
      <Header 
        office={currentOffice}
        setOffice={setCurrentOffice}
        settings={settings}
        updateSettings={updateSettings}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        completedData={completedData}
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleAudio={audioState.toggle}
        isAudioPlaying={audioState.isPlaying}
        isAudioOpen={audioState.isOpen}
      />
      
      <Liturgy 
        office={currentOffice} 
        translation="ESV" 
        selectedDate={selectedDate}
        completedData={completedData}
        onToggleCompleted={toggleCompleted}
        settings={settings}
        updateSettings={updateSettings}
        onOpenAbout={() => setAboutOpen(true)}
        onAudioStateChange={setAudioState}
      />

      <AboutModal 
        isOpen={aboutOpen} 
        onClose={() => setAboutOpen(false)} 
      />
    </div>
  );
}


