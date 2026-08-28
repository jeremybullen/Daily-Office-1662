import lectionary from '../data/lectionary.json';

export function getAccurateDailyLesson(date: Date, office: 'morning' | 'evening', lesson: 'first' | 'second'): string {
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate();
    
    // Feb 29th logic for 1662: usually reads the same as the 28th unless otherwise specified, 
    // but looking at the JSON, Feb has 29 entries!
    let dayIndex = day - 1;
    
    const monthData = (lectionary as any)[month];
    
    if (dayIndex >= monthData.length) {
        dayIndex = monthData.length - 1;
    }
    
    const dayReadings = monthData[dayIndex];
    if (!dayReadings) return "";
    
    const officeReadings = dayReadings[office];
    if (!officeReadings) return "";
    
    let reading = officeReadings[lesson];
    
    // Replace "+" with spaces
    if (reading) {
        reading = reading.replace(/\+/g, ' ');
    }
    
    return reading || "";
}
