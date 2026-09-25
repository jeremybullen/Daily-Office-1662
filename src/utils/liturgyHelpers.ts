import { getEaster } from './lectionary';

export function isAshWednesdayOrGoodFriday(date: Date): boolean {
  // Mock logic for 2026 as per requirements
  // Ash Wednesday: Feb 18, 2026
  // Good Friday: April 3, 2026
  
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();
  const year = date.getFullYear();

  if (year === 2026) {
    if (month === 1 && day === 18) return true; // Feb 18
    if (month === 3 && day === 3) return true; // Apr 3
  }

  return false;
}

export function isAthanasianCreedDay(date: Date): boolean {
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  // Fixed Feasts:
  // Christmas Day (Dec 25)
  if (month === 11 && day === 25) return true;
  // The Epiphany (Jan 6)
  if (month === 0 && day === 6) return true;
  // Saint Matthias (Feb 24)
  if (month === 1 && day === 24) return true;
  // Saint John Baptist (June 24)
  if (month === 5 && day === 24) return true;
  // Saint James (July 25)
  if (month === 6 && day === 25) return true;
  // Saint Bartholomew (August 24)
  if (month === 7 && day === 24) return true;
  // Saint Matthew (September 21)
  if (month === 8 && day === 21) return true;
  // Saint Simon and Saint Jude (October 28)
  if (month === 9 && day === 28) return true;
  // Saint Andrew (November 30)
  if (month === 10 && day === 30) return true;

  // Movable Feasts:
  // Easter Day, Ascension Day, Whitsunday, Trinity Sunday
  const easter = getEaster(date.getFullYear());
  const dMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const eMidnight = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate()).getTime();
  const daysSinceEaster = Math.round((dMidnight - eMidnight) / (24 * 60 * 60 * 1000));

  if (daysSinceEaster === 0) return true;  // Easter Day
  if (daysSinceEaster === 39) return true; // Ascension Day
  if (daysSinceEaster === 49) return true; // Whitsunday
  if (daysSinceEaster === 56) return true; // Trinity Sunday

  return false;
}

export function getCurrentOfficeType(): 'morning' | 'evening' {
  const hour = new Date().getHours();
  // Before 16:00 (4:00 PM) -> morning
  return hour < 16 ? 'morning' : 'evening';
}
