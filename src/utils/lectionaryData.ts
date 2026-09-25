import lectionary from '../data/revised1922Lectionary.json';

export interface LessonDetail {
  first: string;
  firstAlt: string;
  second: string;
  secondAlt: string;
}

export interface DayLessonEntry {
  source: string;
  dayTitle: string;
  commemoration?: string;
  dayName?: string;
  morning: LessonDetail;
  evening: LessonDetail;
}

export const commemorations1662: Record<string, string> = {
  // January
  '01-01': 'The Circumcision of Christ',
  '01-06': 'The Epiphany',
  '01-08': 'Lucian, Priest and Martyr',
  '01-13': 'Hilary, Bishop and Confessor',
  '01-18': 'Prisca, Roman Virgin and Martyr',
  '01-20': 'Fabian, Bishop of Rome and Martyr',
  '01-21': 'Agnes, Roman Virgin and Martyr',
  '01-22': 'Vincent, Spanish Deacon and Martyr',
  '01-25': 'The Conversion of Saint Paul',
  
  // February
  '02-02': 'The Purification of Saint Mary the Virgin',
  '02-03': 'Blasius, Armenian Bishop and Martyr',
  '02-05': 'Agatha, Sicilian Virgin and Martyr',
  '02-14': 'Valentine, Bishop and Martyr',
  '02-24': "Saint Matthias's Day",

  // March
  '03-01': 'David, Archbishop of Menevia',
  '03-02': 'Chad, Bishop of Lichfield',
  '03-07': 'Perpetua, Mauritanian Martyr',
  '03-12': 'Gregory the Great, Bishop of Rome',
  '03-18': 'Edward, King of the West Saxons',
  '03-21': 'Benedict, Abbot',
  '03-25': 'The Annunciation of the Blessed Virgin Mary',

  // April
  '04-03': 'Richard, Bishop of Chichester',
  '04-04': 'Ambrose, Bishop of Milan',
  '04-19': 'Alphege, Archbishop of Canterbury',
  '04-23': "Saint George's Day",
  '04-25': "Saint Mark's Day",

  // May
  '05-01': 'Saint Philip and Saint James',
  '05-03': 'Invention of the Cross',
  '05-06': 'Saint John Evangelist ante Portam Latinam',
  '05-19': 'Dunstan, Archbishop of Canterbury',
  '05-26': 'Augustine, First Archbishop of Canterbury',
  '05-27': 'Venerable Bede, Priest',

  // June
  '06-01': 'Nicomede, Roman Priest and Martyr',
  '06-05': 'Boniface, Bishop of Mainz and Martyr',
  '06-11': 'Saint Barnabas the Apostle',
  '06-17': 'Saint Alban, Martyr',
  '06-20': 'Translation of Edward, King of the West Saxons',
  '06-24': "Saint John Baptist's Day",
  '06-29': "Saint Peter's Day",

  // July
  '07-02': 'Visitation of the Blessed Virgin Mary',
  '07-04': 'Translation of Saint Martin, Bishop',
  '07-15': 'Swithun, Bishop of Winchester, translated',
  '07-20': 'Margaret, Virgin and Martyr at Antioch',
  '07-22': 'Saint Mary Magdalen',
  '07-25': 'Saint James the Apostle',
  '07-26': 'Saint Anne, Mother to the Blessed Virgin Mary',

  // August
  '08-01': 'Lammas Day',
  '08-06': 'The Transfiguration',
  '08-07': 'Name of Jesus',
  '08-10': 'Saint Laurence, Archdeacon of Rome and Martyr',
  '08-24': 'Saint Bartholomew the Apostle',
  '08-28': 'Saint Augustine, Bishop of Hippo',
  '08-29': 'Beheading of Saint John Baptist',

  // September
  '09-01': 'Giles, Abbot and Confessor',
  '09-07': 'Enurchus, Bishop of Orleans',
  '09-08': 'Nativity of the Blessed Virgin Mary',
  '09-14': 'Holy Cross Day',
  '09-17': 'Lambert, Bishop and Martyr',
  '09-21': 'Saint Matthew the Apostle',
  '09-26': 'Saint Cyprian, Archbishop of Carthage and Martyr',
  '09-29': 'Saint Michael and All Angels',
  '09-30': 'Saint Jerome, Priest and Doctor',

  // October
  '10-01': 'Remigius, Bishop of Rheims',
  '10-06': 'Faith, Virgin and Martyr',
  '10-09': 'Saint Denys, Areopagite, Bishop and Martyr',
  '10-13': 'Translation of Edward the Confessor, King',
  '10-17': 'Etheldreda, Virgin',
  '10-18': 'Saint Luke the Evangelist',
  '10-25': 'Crispin, Martyr',
  '10-28': 'Saint Simon and Saint Jude',

  // November
  '11-01': "All Saints' Day",
  '11-06': 'Leonard, Confessor',
  '11-11': 'Saint Martin, Bishop and Confessor',
  '11-13': 'Britius, Bishop',
  '11-15': 'Machutus, Bishop',
  '11-17': 'Hugh, Bishop of Lincoln',
  '11-20': 'Edmund, King and Martyr',
  '11-22': 'Cecilia, Virgin and Martyr',
  '11-23': 'Clement, Bishop of Rome and Martyr',
  '11-25': 'Catherine, Virgin and Martyr',
  '11-30': "Saint Andrew's Day",

  // December
  '12-06': 'Nicholas, Bishop of Myra',
  '12-08': 'Conception of the Blessed Virgin Mary',
  '12-13': 'Lucy, Virgin and Martyr',
  '12-16': 'O Sapientia',
  '12-21': "Saint Thomas the Apostle",
  '12-25': "Christmas Day",
  '12-26': "Saint Stephen's Day",
  '12-27': "Saint John the Evangelist's Day",
  '12-28': "The Innocents' Day",
  '12-31': 'Sylvester, Bishop of Rome'
};

function getEaster(year: number): Date {
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

function getAdventSunday(year: number): Date {
  for (let d = 27; d <= 33; d++) {
    const test = d > 30 ? new Date(year, 11, d - 30) : new Date(year, 10, d);
    if (test.getDay() === 0) return test;
  }
  return new Date(year, 10, 30);
}

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
type DayKey = typeof dayKeys[number];

/**
 * Returns the seasonal / temporal entry (date title and regular appointed lessons)
 */
function getSeasonalEntry(date: Date): { source: string; dayTitle: string; morning: LessonDetail; evening: LessonDetail } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0 = Sun
  const dayName: DayKey = dayKeys[dayOfWeek];
  const capDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // 1. Christmas / Circumcision / Epiphany fixed period (Dec 24 - Jan 6)
  if (month === 12 && day >= 24) {
    if (day === 24) {
      const adv4 = (lectionary.advent.advent4 as any)[dayName] || lectionary.advent.advent4.saturday;
      const eve = lectionary.xmas.fixed['12-24'];
      return {
        source: 'christmasEve',
        dayTitle: 'Christmas Eve',
        morning: adv4 ? adv4.morning : eve.morning,
        evening: eve.evening
      };
    }

    if (dayOfWeek === 0 && (day === 29 || day === 30 || day === 31)) {
      const sunAfterXmas = lectionary.xmas.sundayAfterChristmas;
      return {
        source: 'sundayAfterChristmas',
        dayTitle: 'The Sunday after Christmas Day',
        morning: sunAfterXmas.morning,
        evening: day === 31 ? lectionary.xmas.fixed['12-31'].evening : sunAfterXmas.evening
      };
    }

    const fixedEntry = (lectionary.xmas.fixed as Record<string, any>)[dateKey];
    if (fixedEntry) {
      return {
        source: 'xmasFixed',
        dayTitle: fixedEntry.dayName || `${capDay} after Christmas`,
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

    if (dayOfWeek === 0 && (day >= 2 && day <= 5)) {
      const secSun = lectionary.xmas.secondSundayAfterChristmas;
      return {
        source: 'secondSundayAfterChristmas',
        dayTitle: 'The Second Sunday after Christmas',
        morning: secSun.morning,
        evening: day === 5 ? lectionary.xmas.fixed['01-05'].evening : secSun.evening
      };
    }

    const fixedEntry = (lectionary.xmas.fixed as Record<string, any>)[dateKey];
    if (fixedEntry) {
      return {
        source: 'xmasFixed',
        dayTitle: fixedEntry.dayName || `${capDay} after Christmas`,
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

  // 2. Movable seasons relative to Easter
  const easter = getEaster(year);
  const msPerDay = 24 * 60 * 60 * 1000;
  const curMid = new Date(year, date.getMonth(), date.getDate()).getTime();
  const easMid = new Date(year, easter.getMonth(), easter.getDate()).getTime();
  const d = Math.round((curMid - easMid) / msPerDay);

  // Septuagesima (-63 to -57)
  if (d >= -63 && d <= -57) {
    const entry = (lectionary.lent.septuagesima as any)[dayName];
    return {
      source: 'septuagesima',
      dayTitle: dayOfWeek === 0 ? 'Septuagesima Sunday' : `Septuagesima ${capDay}`,
      ...entry
    };
  }

  // Sexagesima (-56 to -50)
  if (d >= -56 && d <= -50) {
    const entry = (lectionary.lent.sexagesima as any)[dayName];
    return {
      source: 'sexagesima',
      dayTitle: dayOfWeek === 0 ? 'Sexagesima Sunday' : `Sexagesima ${capDay}`,
      ...entry
    };
  }

  // Quinquagesima (-49 to -47)
  if (d >= -49 && d <= -47) {
    const entry = (lectionary.lent.quinquagesima as any)[dayName];
    return {
      source: 'quinquagesima',
      dayTitle: dayOfWeek === 0 ? 'Quinquagesima Sunday' : `Quinquagesima ${capDay}`,
      ...entry
    };
  }

  // Ash Wednesday and days following (-46 to -43)
  if (d >= -46 && d <= -43) {
    const entry = (lectionary.lent.ashWednesday as any)[dayName];
    return {
      source: 'ashWednesday',
      dayTitle: d === -46 ? 'Ash Wednesday' : `${capDay} after Ash Wednesday`,
      ...entry
    };
  }

  // Lent Weeks 1 - 5 (-42 to -8)
  if (d >= -42 && d <= -8) {
    const lentWeekNum = Math.floor((d + 42) / 7) + 1;
    const entry = (lectionary.lent as any)[`lent${lentWeekNum}`][dayName];
    const sundayTitle = lentWeekNum === 5
      ? 'The 5th Sunday in Lent (Passion Sunday)'
      : `The ${lentWeekNum}${lentWeekNum === 1 ? 'st' : lentWeekNum === 2 ? 'nd' : lentWeekNum === 3 ? 'rd' : 'th'} Sunday in Lent`;
    return {
      source: `lent${lentWeekNum}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${capDay} in Lent ${lentWeekNum}`,
      ...entry
    };
  }

  // Holy Week (-7 to -1)
  if (d >= -7 && d <= -1) {
    const entry = (lectionary.easter.holyWeek as any)[dayName];
    const titles: Record<string, string> = {
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
    const entry = (lectionary.easter.easterWeek as any)[dayName];
    const titles: Record<string, string> = {
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
    const entry = (lectionary.easter as any)[`easter${easterWeekNum}`][dayName];
    const suffix = easterWeekNum === 1 ? 'st' : easterWeekNum === 2 ? 'nd' : easterWeekNum === 3 ? 'rd' : 'th';
    const sundayTitle = `The ${easterWeekNum}${suffix} Sunday after Easter`;
    return {
      source: `easter${easterWeekNum}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${capDay} after Easter ${easterWeekNum}`,
      ...entry
    };
  }

  // Easter Week 5 (Rogation & Ascension) (35 to 41)
  if (d >= 35 && d <= 41) {
    const entry = d >= 39
      ? (lectionary.easter.ascension as any)[dayName]
      : (lectionary.easter.rogation as any)[dayName];
    const titles: Record<string, string> = {
      sunday: 'The 5th Sunday after Easter (Rogation Sunday)',
      monday: 'Rogation Monday',
      tuesday: 'Rogation Tuesday',
      wednesday: 'Rogation Wednesday',
      thursday: 'Ascension Day',
      friday: 'Friday after Ascension Day',
      saturday: 'Saturday after Ascension Day'
    };
    return { source: d >= 39 ? 'ascension' : 'rogation', dayTitle: titles[dayName], ...entry };
  }

  // Sunday after Ascension / Ascensiontide (42 to 48)
  if (d >= 42 && d <= 48) {
    const entry = (lectionary.easter.sundayAfterAscension as any)[dayName];
    return {
      source: 'sundayAfterAscension',
      dayTitle: dayOfWeek === 0 ? 'The Sunday after Ascension Day' : `${capDay} after Ascension`,
      ...entry
    };
  }

  // Whitsun Week (49 to 55)
  if (d >= 49 && d <= 55) {
    const entry = (lectionary.easter.whitsunWeek as any)[dayName];
    const titles: Record<string, string> = {
      sunday: 'Whitsun-Day (Pentecost)',
      monday: 'Monday in Whitsun-Week',
      tuesday: 'Tuesday in Whitsun-Week',
      wednesday: 'Wednesday in Whitsun-Week',
      thursday: 'Thursday in Whitsun-Week',
      friday: 'Friday in Whitsun-Week',
      saturday: 'Saturday in Whitsun-Week'
    };
    return { source: 'whitsunWeek', dayTitle: titles[dayName], ...entry };
  }

  // Trinity Sunday (56 to 62)
  if (d >= 56 && d <= 62) {
    const entry = (lectionary.trinity.trinitySunday as any)[dayName];
    return {
      source: 'trinitySunday',
      dayTitle: dayOfWeek === 0 ? 'Trinity Sunday' : `${capDay} after Trinity Sunday`,
      ...entry
    };
  }

  // 3. Advent Season
  const advent1 = getAdventSunday(year);
  const adv1Mid = new Date(year, advent1.getMonth(), advent1.getDate()).getTime();

  if (curMid >= adv1Mid) {
    const daysSinceAdv1 = Math.round((curMid - adv1Mid) / msPerDay);
    const advWeekNum = Math.min(4, Math.floor(daysSinceAdv1 / 7) + 1);
    const entry = (lectionary.advent as any)[`advent${advWeekNum}`][dayName];
    const sundayTitle = advWeekNum === 1 ? 'Advent Sunday' : `The ${advWeekNum}${advWeekNum === 2 ? 'nd' : advWeekNum === 3 ? 'rd' : 'th'} Sunday in Advent`;
    return {
      source: `advent${advWeekNum}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${capDay} in Advent ${advWeekNum}`,
      ...entry
    };
  }

  // 4. Epiphany Season (after Jan 6, before Septuagesima)
  if (d < -63 && curMid > new Date(year, 0, 6).getTime()) {
    let firstSunEpi = new Date(year, 0, 7);
    while (firstSunEpi.getDay() !== 0) {
      firstSunEpi.setDate(firstSunEpi.getDate() + 1);
    }
    const firstSunEpiMid = firstSunEpi.getTime();

    if (curMid < firstSunEpiMid) {
      const entry = (lectionary.epiphany.weekOfEpiphany as any)[dayName];
      return {
        source: 'epiphanyWeekdays',
        dayTitle: `${capDay} after Epiphany`,
        ...entry
      };
    }

    const weeksSinceEpi1 = Math.floor(Math.round((curMid - firstSunEpiMid) / msPerDay) / 7) + 1;
    const clampedWeek = Math.min(6, Math.max(1, weeksSinceEpi1));
    const entry = (lectionary.epiphany as any)[`epiphany${clampedWeek}`][dayName];
    const sundayTitle = `The ${clampedWeek}${clampedWeek === 1 ? 'st' : clampedWeek === 2 ? 'nd' : clampedWeek === 3 ? 'rd' : 'th'} Sunday after Epiphany`;
    return {
      source: `epiphany${clampedWeek}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${capDay} after Epiphany ${clampedWeek}`,
      ...entry
    };
  }

  // 5. Trinity Season (after Trinity Sunday week, before Advent Sunday)
  if (d >= 63 && curMid < adv1Mid) {
    const sundayNextBeforeAdvent = new Date(year, advent1.getMonth(), advent1.getDate() - 7);
    const sunNextAdvMid = sundayNextBeforeAdvent.getTime();

    if (curMid >= sunNextAdvMid) {
      const entry = (lectionary.trinity.sundayNextBeforeAdvent as any)[dayName];
      return {
        source: 'sundayNextBeforeAdvent',
        dayTitle: dayOfWeek === 0 ? 'The Sunday next before Advent' : `${capDay} before Advent`,
        ...entry
      };
    }

    const trinityWeekNum = Math.floor((d - 56) / 7);
    const clampedTrinity = Math.min(26, Math.max(1, trinityWeekNum));
    const entry = (lectionary.trinity as any)[`trinity${clampedTrinity}`][dayName];
    const sundayTitle = `The ${clampedTrinity}${clampedTrinity === 1 ? 'st' : clampedTrinity === 2 ? 'nd' : clampedTrinity === 3 ? 'rd' : 'th'} Sunday after Trinity`;
    return {
      source: `trinity${clampedTrinity}`,
      dayTitle: dayOfWeek === 0 ? sundayTitle : `${capDay} after Trinity ${clampedTrinity}`,
      ...entry
    };
  }

  // Fallback
  return {
    source: 'generic',
    dayTitle: 'Daily Office',
    morning: { first: 'Genesis 1', firstAlt: '', second: 'Matthew 1', secondAlt: '' },
    evening: { first: 'Genesis 2', firstAlt: '', second: 'Romans 1', secondAlt: '' }
  };
}

export function get1922LessonEntry(date: Date): DayLessonEntry {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Always compute the seasonal / temporal day title (e.g. "Friday after Trinity 16")
  const seasonal = getSeasonalEntry(date);

  // Check 1662 commemoration or holiday
  const commemoration = commemorations1662[dateKey];

  // 1. Check Fixed Red-Letter Holy Days (Part X)
  const holyDay = (lectionary.holyDays as Record<string, any>)[dateKey];
  if (holyDay) {
    return {
      source: 'holyDay',
      dayTitle: seasonal.dayTitle,
      commemoration: commemoration || holyDay.title,
      morning: {
        first: holyDay.mattins.first,
        firstAlt: '',
        second: holyDay.mattins.second,
        secondAlt: ''
      },
      evening: {
        first: holyDay.secondEve.first,
        firstAlt: '',
        second: holyDay.secondEve.second,
        secondAlt: ''
      }
    };
  }

  // Regular seasonal day with potential black-letter commemoration
  return {
    ...seasonal,
    commemoration: commemoration && commemoration !== seasonal.dayTitle ? commemoration : undefined
  };
}

export function getAccurateDailyLesson(
  date: Date,
  office: 'morning' | 'evening',
  lesson: 'first' | 'second'
): string {
  const entry = get1922LessonEntry(date);
  const officeLessons = entry[office];
  if (!officeLessons) return '';
  return officeLessons[lesson] || '';
}
