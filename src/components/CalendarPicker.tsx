import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getLiturgicalWeek } from '../utils/lectionary';

interface CalendarPickerProps {
    selectedDate: Date;
    onSelectDate: (d: Date) => void;
    completedData: Record<string, { morning?: boolean, evening?: boolean }>;
    onClose: () => void;
}

export function CalendarPicker({ selectedDate, onSelectDate, completedData, onClose }: CalendarPickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Generate days of month
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = currentMonth.getDay();

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="w-80 bg-[var(--bg-color)] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <div className="font-semibold">{monthName}</div>
                <button onClick={nextMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-xs opacity-50 font-semibold py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                    if (!d) return <div key={i} />;
                    
                    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;


                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const isToday = d.toDateString() === new Date().toDateString();
                    const completed = completedData[dateKey];
                    const lit = getLiturgicalWeek(d);
                    const isFeast = !!lit.feast;
                    
                    return (
                        <button 
                            key={i} 
                            onClick={() => { onSelectDate(d); onClose(); }}
                            title={isFeast ? lit.feast : ''}
                            className={`
                                relative h-10 w-full flex flex-col items-center justify-center rounded-lg text-sm transition-colors
                                ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black font-semibold' : 'hover:bg-black/5 dark:hover:bg-white/10'}
                                ${isToday && !isSelected ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}
                                ${isFeast && !isSelected ? 'text-red-700 dark:text-red-400 font-bold' : ''}
                            `}
                        >
                            <span className="relative">
                              {d.getDate()}
                              {isFeast && (
                                <span className="absolute -top-1 -right-2 text-[8px] text-red-500 opacity-80 leading-none">✦</span>
                              )}
                            </span>
                            
                            {/* Indicators */}
                            <div className="absolute bottom-1 flex gap-0.5">

                                <div className={`w-1 h-1 rounded-full ${completed?.morning ? (isSelected ? 'bg-white dark:bg-black' : 'bg-[var(--text-color)]') : 'bg-transparent'}`} />
                                <div className={`w-1 h-1 rounded-full ${completed?.evening ? (isSelected ? 'bg-white dark:bg-black' : 'bg-[var(--text-color)]') : 'bg-transparent'}`} />
                            </div>
                        </button>
                    );
                })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs opacity-70">
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--text-color)]"/><div className="w-1.5 h-1.5 rounded-full bg-transparent"/></div>
                    <span>Morning</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-transparent"/><div className="w-1.5 h-1.5 rounded-full bg-[var(--text-color)]"/></div>
                    <span>Evening</span>
                </div>
                <button onClick={() => { onSelectDate(new Date()); onClose(); }} className="font-semibold hover:opacity-100 transition-opacity">
                    Today
                </button>
            </div>
        </div>
    );
}
