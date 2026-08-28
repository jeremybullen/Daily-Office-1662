import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Liturgy } from './components/Liturgy';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getCurrentOfficeType } from './utils/liturgyHelpers';
import { AppSettings, OfficeType, CompletedData } from './types';

export default function App() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('bcp-settings', {
    theme: 'light',
    fontSize: 'text-lg',
    translation: 'KJV'
  });
  
  const [currentOffice, setCurrentOffice] = useState<OfficeType>(getCurrentOfficeType());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completedData, setCompletedData] = useLocalStorage<CompletedData>('bcp-completed', {});

  // Apply Theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

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
    <div className={`min-h-screen ${settings.fontSize} leading-loose`}>
      <Header 
        office={currentOffice}
        setOffice={setCurrentOffice}
        settings={settings}
        updateSettings={updateSettings}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        completedData={completedData}
      />
      
      <Liturgy 
        office={currentOffice} 
        translation={settings.translation} 
        selectedDate={selectedDate}
        completedData={completedData}
        onToggleCompleted={toggleCompleted}
      />
    </div>
  );
}


