const fs = require('fs');
const path = require('path');
const lectionary = require('../src/data/revised1922Lectionary.json');

function getEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getAdventSunday(year) {
  for (let d = 27; d <= 33; d++) {
    const test = d > 30 ? new Date(year, 11, d - 30) : new Date(year, 10, d);
    if (test.getDay() === 0) return test;
  }
}

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function get1922LessonEntry(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ...
  const dayName = dayNames[dayOfWeek];
  const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // 1. Check Fixed Red-Letter Holy Days (Part X)
  // Note: If Holy Day falls on a Sunday, Holy Day readings take precedence or proper Sunday
  if (lectionary.holyDays[dateKey]) {
    const hd = lectionary.holyDays[dateKey];
    return {
      source: 'holyDay',
      dayTitle: hd.title,
      morning: {
        first: hd.mattins.first,
        firstAlt: '',
        second: hd.mattins.second,
        secondAlt: ''
      },
      evening: {
        first: hd.secondEve.first,
        firstAlt: '',
        second: hd.secondEve.second,
        secondAlt: ''
      }
    };
  }
  
  // 2. Check Christmas / Circumcision / Epiphany fixed period (Dec 24 - Jan 6)
  if (month === 12 && day >= 24) {
    if (day === 24) {
      // Christmas Eve: Morning is Advent 4 weekday; Evening is Christmas Eve proper
      const adv4 = lectionary.advent.advent4[dayName] || lectionary.advent.advent4.saturday;
      const eve = lectionary.xmas.fixed['12-24'];
      return {
        source: 'christmasEve',
        dayTitle: 'Christmas Eve',
        morning: adv4 ? adv4.morning : eve.morning,
        evening: eve.evening
      };
    }
    
    // Check if Dec 29, 30, or 31 is Sunday
    if (dayOfWeek === 0 && (day === 29 || day === 30 || day === 31)) {
      const sunAfterXmas = lectionary.xmas.sundayAfterChristmas;
      if (day === 31) {
        // If Dec 31 is Sunday, morning lessons only from Sunday after Xmas, evening from Dec 31
        return {
          source: 'sundayAfterChristmas',
          dayTitle: 'The Sunday after Christmas Day',
          morning: sunAfterXmas.morning,
          evening: lectionary.xmas.fixed['12-31'].evening
        };
      }
      return {
        source: 'sundayAfterChristmas',
        dayTitle: 'The Sunday after Christmas Day',
        morning: sunAfterXmas.morning,
        evening: sunAfterXmas.evening
      };
    }
    
    const fixedEntry = lectionary.xmas.fixed[dateKey];
    if (fixedEntry) {
      return {
        source: 'xmasFixed',
        dayTitle: fixedEntry.dayName,
        morning: fixedEntry.morning,
        evening: fixedEntry.evening
      };
    }
  }
  
  if (month === 1 && day <= 5) {
    if (day === 1) {
      const circ = lectionary.xmas.fixed['01-01'];
      return {
        source: 'circumcision',
        dayTitle: 'The Circumcision of Christ',
        morning: circ.morning,
        evening: circ.evening
      };
    }
    // Check if Jan 2, 3, 4, or 5 is Sunday
    if (dayOfWeek === 0 && (day >= 2 && day <= 5)) {
      const secSun = lectionary.xmas.secondSundayAfterChristmas;
      if (day === 5) {
        // If Jan 5 is Sunday, Morning from 2nd Sun after Xmas, Evening from Jan 5 (Eve of Epiphany)
        return {
          source: 'secondSundayAfterChristmas',
          dayTitle: 'The Second Sunday after Christmas',
          morning: secSun.morning,
          evening: lectionary.xmas.fixed['01-05'].evening
        };
      }
      return {
        source: 'secondSundayAfterChristmas',
        dayTitle: 'The Second Sunday after Christmas',
        morning: secSun.morning,
        evening: secSun.evening
      };
    }
    const fixedEntry = lectionary.xmas.fixed[dateKey];
    if (fixedEntry) {
      return {
        source: 'xmasFixed',
        dayTitle: fixedEntry.dayName,
        morning: fixedEntry.morning,
        evening: fixedEntry.evening
      };
    }
  }
  
  if (month === 1 && day === 6) {
    const epi = lectionary.epiphany.fixedEpiphany;
    return {
      source: 'epiphanyDay',
      dayTitle: 'The Epiphany',
      morning: epi.morning,
      evening: epi.evening
    };
  }
  
  // 3. Check Movable Feasts relative to Easter
  const easter = getEaster(year);
  const msPerDay = 24 * 60 * 60 * 1000;
  // Normalize date and easter to midnight
  const curMid = new Date(year, date.getMonth(), date.getDate()).getTime();
  const easMid = new Date(year, easter.getMonth(), easter.getDate()).getTime();
  const d = Math.round((curMid - easMid) / msPerDay);
  
  // Septuagesima (-63 to -57)
  if (d >= -63 && d <= -57) {
    const entry = lectionary.lent.septuagesima[dayName];
    return { source: 'septuagesima', dayTitle: dayOfWeek === 0 ? 'Septuagesima Sunday' : `Septuagesima ${dayName}`, ...entry };
  }
  
  // Sexagesima (-56 to -50)
  if (d >= -56 && d <= -50) {
    const entry = lectionary.lent.sexagesima[dayName];
    return { source: 'sexagesima', dayTitle: dayOfWeek === 0 ? 'Sexagesima Sunday' : `Sexagesima ${dayName}`, ...entry };
  }
  
  // Quinquagesima (-49 to -47)
  if (d >= -49 && d <= -47) {
    const entry = lectionary.lent.quinquagesima[dayName];
    return { source: 'quinquagesima', dayTitle: dayOfWeek === 0 ? 'Quinquagesima Sunday' : `Quinquagesima ${dayName}`, ...entry };
  }
  
  // Ash Wednesday and days following (-46 to -43)
  if (d >= -46 && d <= -43) {
    const entry = lectionary.lent.ashWednesday[dayName];
    return { source: 'ashWednesday', dayTitle: d === -46 ? 'Ash Wednesday' : `${dayName} after Ash Wednesday`, ...entry };
  }
  
  // Lent Weeks 1 - 5 (-42 to -8)
  if (d >= -42 && d <= -8) {
    const lentWeekNum = Math.floor((d + 42) / 7) + 1;
    const entry = lectionary.lent[`lent${lentWeekNum}`][dayName];
    const sundayTitle = lentWeekNum === 5 ? 'The 5th Sunday in Lent (Passion Sunday)' : `The ${lentWeekNum}th Sunday in Lent`;
    return {
      source: `lent${lentWeekNum}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${dayName} in Lent ${lentWeekNum}`,
      ...entry
    };
  }
  
  // Holy Week (-7 to -1)
  if (d >= -7 && d <= -1) {
    const entry = lectionary.easter.holyWeek[dayName];
    const titles = {
      sunday: 'Palm Sunday (The Sunday next before Easter)',
      monday: 'Monday before Easter',
      tuesday: 'Tuesday before Easter',
      wednesday: 'Wednesday before Easter',
      thursday: 'Thursday before Easter (Maundy Thursday)',
      friday: 'Good Friday',
      saturday: 'Easter Even'
    };
    return { source: 'holyWeek', dayTitle: titles[dayName], ...entry };
  }
  
  // Easter Week (0 to 6)
  if (d >= 0 && d <= 6) {
    const entry = lectionary.easter.easterWeek[dayName];
    const titles = {
      sunday: 'Easter Day',
      monday: 'Monday in Easter Week',
      tuesday: 'Tuesday in Easter Week',
      wednesday: 'Wednesday in Easter Week',
      thursday: 'Thursday in Easter Week',
      friday: 'Friday in Easter Week',
      saturday: 'Saturday in Easter Week'
    };
    return { source: 'easterWeek', dayTitle: titles[dayName], ...entry };
  }
  
  // Easter Weeks 1 - 4 (7 to 34)
  if (d >= 7 && d <= 34) {
    const easterWeekNum = Math.floor((d - 7) / 7) + 1;
    const entry = lectionary.easter[`easter${easterWeekNum}`][dayName];
    const suffix = easterWeekNum === 1 ? 'st' : easterWeekNum === 2 ? 'nd' : easterWeekNum === 3 ? 'rd' : 'th';
    const sundayTitle = `The ${easterWeekNum}${suffix} Sunday after Easter`;
    return {
      source: `easter${easterWeekNum}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${dayName} after Easter ${easterWeekNum}`,
      ...entry
    };
  }
  
  // Rogation Week (35 to 38)
  if (d >= 35 && d <= 38) {
    const entry = lectionary.easter.rogation[dayName];
    return {
      source: 'rogation',
      dayTitle: dayOfWeek === 0 ? 'The 5th Sunday after Easter (Rogation Sunday)' : `Rogation ${dayName}`,
      ...entry
    };
  }
  
  // Ascension Day (39) & Fri, Sat (40, 41)
  if (d >= 39 && d <= 41) {
    const entry = lectionary.easter.ascension[dayName];
    return {
      source: 'ascension',
      dayTitle: d === 39 ? 'Ascension Day' : `${dayName} after Ascension Day`,
      ...entry
    };
  }
  
  // Sunday after Ascension (42 to 48)
  if (d >= 42 && d <= 48) {
    const entry = lectionary.easter.sundayAfterAscension[dayName];
    return {
      source: 'sundayAfterAscension',
      dayTitle: dayOfWeek === 0 ? 'The Sunday after Ascension Day' : `${dayName} after Ascension`,
      ...entry
    };
  }
  
  // Whitsun Week (49 to 55)
  if (d >= 49 && d <= 55) {
    const entry = lectionary.easter.whitsunWeek[dayName];
    const titles = {
      sunday: 'Whitsun-Day (Pentecost)',
      monday: 'Monday in Whitsun-Week',
      tuesday: 'Tuesday in Whitsun-Week',
      wednesday: 'Ember Day in Whitsun-Week',
      thursday: 'Thursday in Whitsun-Week',
      friday: 'Ember Day in Whitsun-Week',
      saturday: 'Ember Day in Whitsun-Week'
    };
    return { source: 'whitsunWeek', dayTitle: titles[dayName], ...entry };
  }
  
  // Trinity Sunday (56 to 62)
  if (d >= 56 && d <= 62) {
    const entry = lectionary.trinity.trinitySunday[dayName];
    return {
      source: 'trinitySunday',
      dayTitle: dayOfWeek === 0 ? 'Trinity Sunday' : `${dayName} after Trinity Sunday`,
      ...entry
    };
  }
  
  // 4. Advent Season
  const advent1 = getAdventSunday(year);
  const adv1Mid = new Date(year, advent1.getMonth(), advent1.getDate()).getTime();
  
  if (curMid >= adv1Mid) {
    // We are in Advent!
    const daysSinceAdv1 = Math.round((curMid - adv1Mid) / msPerDay);
    const advWeekNum = Math.min(4, Math.floor(daysSinceAdv1 / 7) + 1);
    const entry = lectionary.advent[`advent${advWeekNum}`][dayName];
    const sundayTitle = advWeekNum === 1 ? 'Advent Sunday' : `The ${advWeekNum}${advWeekNum === 2 ? 'nd' : advWeekNum === 3 ? 'rd' : 'th'} Sunday in Advent`;
    return {
      source: `advent${advWeekNum}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${dayName} in Advent ${advWeekNum}`,
      ...entry
    };
  }
  
  // 5. Epiphany Season (after Jan 6, before Septuagesima)
  if (d < -63 && curMid > new Date(year, 0, 6).getTime()) {
    // Find First Sunday after Epiphany
    let firstSunEpi = new Date(year, 0, 7);
    while (firstSunEpi.getDay() !== 0) {
      firstSunEpi.setDate(firstSunEpi.getDate() + 1);
    }
    const firstSunEpiMid = firstSunEpi.getTime();
    
    if (curMid < firstSunEpiMid) {
      // Days between Jan 6 and 1st Sunday after Epiphany
      const entry = lectionary.epiphany.weekOfEpiphany[dayName];
      return {
        source: 'epiphanyWeekdays',
        dayTitle: `${dayName} after Epiphany`,
        ...entry
      };
    }
    
    // Weeks after Epiphany
    const weeksSinceEpi1 = Math.floor(Math.round((curMid - firstSunEpiMid) / msPerDay) / 7) + 1;
    const clampedWeek = Math.min(6, Math.max(1, weeksSinceEpi1));
    const entry = lectionary.epiphany[`epiphany${clampedWeek}`][dayName];
    const sundayTitle = `The ${clampedWeek}${clampedWeek === 1 ? 'st' : clampedWeek === 2 ? 'nd' : clampedWeek === 3 ? 'rd' : 'th'} Sunday after Epiphany`;
    return {
      source: `epiphany${clampedWeek}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${dayName} after Epiphany ${clampedWeek}`,
      ...entry
    };
  }
  
  // 6. Trinity Season (after Trinity Sunday week, before Advent Sunday)
  if (d >= 63 && curMid < adv1Mid) {
    // Sunday Next Before Advent is the Sunday immediately preceding Advent 1
    const sundayNextBeforeAdvent = new Date(year, advent1.getMonth(), advent1.getDate() - 7);
    const sunNextAdvMid = sundayNextBeforeAdvent.getTime();
    
    if (curMid >= sunNextAdvMid) {
      const entry = lectionary.trinity.sundayNextBeforeAdvent[dayName];
      return {
        source: 'sundayNextBeforeAdvent',
        dayTitle: dayOfWeek === 0 ? 'The Sunday next before Advent' : `${dayName} before Advent`,
        ...entry
      };
    }
    
    // Trinity 1 to 26
    const trinityWeekNum = Math.floor((d - 56) / 7);
    const clampedTrinity = Math.min(26, Math.max(1, trinityWeekNum));
    const entry = lectionary.trinity[`trinity${clampedTrinity}`][dayName];
    const sundayTitle = `The ${clampedTrinity}${clampedTrinity === 1 ? 'st' : clampedTrinity === 2 ? 'nd' : clampedTrinity === 3 ? 'rd' : 'th'} Sunday after Trinity`;
    return {
      source: `trinity${clampedTrinity}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${dayName} after Trinity ${clampedTrinity}`,
      ...entry
    };
  }
  
  return null;
}

// Test every single day of 2026
let missing = 0;
let total = 0;
const startDate = new Date(2026, 0, 1);
for (let i = 0; i < 365; i++) {
  const cur = new Date(2026, 0, 1 + i);
  const lesson = get1922LessonEntry(cur);
  total++;
  if (!lesson || !lesson.morning || !lesson.evening || !lesson.morning.first || !lesson.evening.first) {
    missing++;
    console.log('MISSING on', cur.toDateString(), 'result:', lesson);
  }
}
console.log(`Test 2026: ${total} days tested, ${missing} missing.`);

// Test today
const today = new Date(2026, 8, 25); // Sep 25, 2026
console.log('Today (Sep 25, 2026):', get1922LessonEntry(today));

module.exports = { get1922LessonEntry, getEaster, getAdventSunday };
