import { collects } from '../data/collects';
import { get1922LessonEntry } from './lectionaryData';

// 1662 Psalm assignments by Day of the Month
const psalmsByDay = [
    { m: "1-5", e: "6-8" },         // 1
    { m: "9-11", e: "12-14" },      // 2
    { m: "15-17", e: "18" },        // 3
    { m: "19-21", e: "22-23" },     // 4
    { m: "24-26", e: "27-29" },     // 5
    { m: "30-31", e: "32-34" },     // 6
    { m: "35-36", e: "37" },        // 7
    { m: "38-40", e: "41-43" },     // 8
    { m: "44-46", e: "47-49" },     // 9
    { m: "50-52", e: "53-55" },     // 10
    { m: "56-58", e: "59-61" },     // 11
    { m: "62-64", e: "65-67" },     // 12
    { m: "68", e: "69-70" },        // 13
    { m: "71-72", e: "73-74" },     // 14
    { m: "75-77", e: "78" },        // 15
    { m: "79-81", e: "82-85" },     // 16
    { m: "86-88", e: "89" },        // 17
    { m: "90-92", e: "93-94" },     // 18
    { m: "95-97", e: "98-101" },    // 19
    { m: "102-103", e: "104" },     // 20
    { m: "105", e: "106" },         // 21
    { m: "107", e: "108-109" },     // 22
    { m: "110-113", e: "114-115" }, // 23
    { m: "116-118", e: "119:1-32" },// 24
    { m: "119:33-72", e: "119:73-104" }, // 25
    { m: "119:105-144", e: "119:145-176" },// 26
    { m: "120-125", e: "126-131" }, // 27
    { m: "132-135", e: "136-138" }, // 28
    { m: "139-141", e: "142-143" }, // 29
    { m: "144-146", e: "147-150" }  // 30
];

export function getEaster(year: number): Date {
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

export function getLiturgicalWeek(date: Date): { week: string, feast?: string } {
    const year = date.getFullYear();
    const easter = getEaster(year);

    // Find Advent Sunday (Sunday closest to Nov 30, between Nov 27 and Dec 3)
    let advent = new Date(year, 10, 27);
    for (let d = 27; d <= 33; d++) {
        let test = d > 30 ? new Date(year, 11, d - 30) : new Date(year, 10, d);
        if (test.getDay() === 0) { advent = test; break; }
    }

    const getSundayBefore = (d: Date) => {
        const res = new Date(d);
        res.setDate(res.getDate() - res.getDay());
        return res;
    };

    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceEaster = Math.floor((date.getTime() - easter.getTime()) / msPerDay);
    const sundayDaysSinceEaster = daysSinceEaster - date.getDay();

    let weekName = "Trinity-Sunday";
    let feastName: string | undefined = undefined;

    // Check fixed feasts
    if (date.getMonth() === 0 && date.getDate() === 1) feastName = "The Circumcision of Christ";
    if (date.getMonth() === 0 && date.getDate() === 6) feastName = "The Epiphany";
    if (date.getMonth() === 0 && date.getDate() === 25) feastName = "The Conversion of Saint Paul";
    if (date.getMonth() === 1 && date.getDate() === 2) feastName = "The Purification of Saint Mary the Virgin";
    if (date.getMonth() === 1 && date.getDate() === 24) feastName = "Saint Matthias's Day";
    if (date.getMonth() === 2 && date.getDate() === 25) feastName = "The Annunciation of the Blessed Virgin Mary";
    if (date.getMonth() === 3 && date.getDate() === 25) feastName = "Saint Mark's Day";
    if (date.getMonth() === 4 && date.getDate() === 1) feastName = "Saint Philip and Saint James's Day";
    if (date.getMonth() === 5 && date.getDate() === 11) feastName = "Saint Barnabas the Apostle";
    if (date.getMonth() === 5 && date.getDate() === 24) feastName = "Saint John Baptist's Day";
    if (date.getMonth() === 5 && date.getDate() === 29) feastName = "Saint Peter's Day";
    if (date.getMonth() === 6 && date.getDate() === 22) feastName = "Saint Mary Magdalen";
    if (date.getMonth() === 6 && date.getDate() === 25) feastName = "Saint James the Apostle";
    if (date.getMonth() === 7 && date.getDate() === 6) feastName = "The Transfiguration";
    if (date.getMonth() === 7 && date.getDate() === 24) feastName = "Saint Bartholomew the Apostle";
    if (date.getMonth() === 8 && date.getDate() === 21) feastName = "Saint Matthew the Apostle";
    if (date.getMonth() === 8 && date.getDate() === 29) feastName = "Saint Michael and All Angels";
    if (date.getMonth() === 9 && date.getDate() === 18) feastName = "Saint Luke the Evangelist";
    if (date.getMonth() === 9 && date.getDate() === 28) feastName = "Saint Simon and Saint Jude";
    if (date.getMonth() === 10 && date.getDate() === 1) feastName = "All Saints' Day";
    if (date.getMonth() === 10 && date.getDate() === 30) feastName = "Saint Andrew's Day";
    if (date.getMonth() === 11 && date.getDate() === 21) feastName = "Saint Thomas the Apostle";
    if (date.getMonth() === 11 && date.getDate() === 25) feastName = "Christmas-Day";
    if (date.getMonth() === 11 && date.getDate() === 26) feastName = "Saint Stephen's Day";
    if (date.getMonth() === 11 && date.getDate() === 27) feastName = "Saint John the Evangelist's Day";
    if (date.getMonth() === 11 && date.getDate() === 28) feastName = "The Innocents' Day";

    // Check movable feasts
    if (daysSinceEaster === -46) feastName = "Ash Wednesday";
    if (daysSinceEaster === -2) feastName = "Good Friday";
    if (daysSinceEaster === -1) feastName = "Easter Even";
    if (daysSinceEaster === 0) feastName = "Easter-Day";
    if (daysSinceEaster === 1) feastName = "Monday in Easter-Week";
    if (daysSinceEaster === 2) feastName = "Tuesday in Easter-Week";
    if (daysSinceEaster === 39) feastName = "Ascension-Day";
    if (daysSinceEaster === 49) feastName = "Whitsun-Day";
    if (daysSinceEaster === 50) feastName = "Monday in Whitsun-Week";
    if (daysSinceEaster === 51) feastName = "Tuesday in Whitsun-Week";

    // Preceding Sunday determines week name
    const precedingSunday = getSundayBefore(date);

    if (precedingSunday >= advent && precedingSunday < new Date(year, 11, 25)) {
        const weeksSinceAdvent = Math.floor((precedingSunday.getTime() - advent.getTime()) / (7 * msPerDay));
        const num = weeksSinceAdvent + 1;
        const sfx = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
        weekName = `The ${num}${sfx} Sunday in Advent`;
    } else if ((precedingSunday.getMonth() === 11 && precedingSunday.getDate() >= 25) || (precedingSunday.getMonth() === 0 && precedingSunday.getDate() < 6)) {
        weekName = "The Sunday after Christmas-Day";
        if (precedingSunday.getMonth() === 11 && precedingSunday.getDate() === 25) {
            weekName = "Christmas-Day";
        }
    } else if (precedingSunday.getMonth() === 0 && precedingSunday.getDate() >= 6 && sundayDaysSinceEaster < -63) {
        const epiphany = new Date(year, 0, 6);
        let epSun = new Date(epiphany);
        if (epSun.getDay() !== 0) {
            epSun.setDate(epSun.getDate() + (7 - epSun.getDay()));
        }
        const weeksSinceEpiphany = Math.floor((precedingSunday.getTime() - epSun.getTime()) / (7 * msPerDay)) + 1;
        const sfx = weeksSinceEpiphany === 1 ? 'st' : weeksSinceEpiphany === 2 ? 'nd' : weeksSinceEpiphany === 3 ? 'rd' : 'th';
        weekName = `The ${weeksSinceEpiphany}${sfx} Sunday after the Epiphany`;
    } else if (sundayDaysSinceEaster >= -63 && sundayDaysSinceEaster < -46) {
        if (sundayDaysSinceEaster === -63) weekName = "Septuagesima";
        else if (sundayDaysSinceEaster === -56) weekName = "Sexagesima";
        else if (sundayDaysSinceEaster === -49) weekName = "Quinquagesima";
    } else if (sundayDaysSinceEaster >= -46 && sundayDaysSinceEaster < 0) {
        const weeksInLent = Math.floor((sundayDaysSinceEaster + 42) / 7) + 1;
        if (weeksInLent === 6) weekName = "Sunday next before Easter";
        else {
            const sfx = weeksInLent === 1 ? 'st' : weeksInLent === 2 ? 'nd' : weeksInLent === 3 ? 'rd' : 'th';
            weekName = `The ${weeksInLent}${sfx} Sunday in Lent`;
        }
    } else if (sundayDaysSinceEaster >= 0 && sundayDaysSinceEaster < 49) {
        const weeksSinceEaster = Math.floor(sundayDaysSinceEaster / 7);
        if (weeksSinceEaster === 0) weekName = "Easter-Day";
        else {
            const sfx = weeksSinceEaster === 1 ? 'st' : weeksSinceEaster === 2 ? 'nd' : weeksSinceEaster === 3 ? 'rd' : 'th';
            weekName = `The ${weeksSinceEaster}${sfx} Sunday after Easter`;
        }
    } else if (sundayDaysSinceEaster >= 49 && sundayDaysSinceEaster < 56) {
        weekName = "Whitsun-Day";
    } else if (sundayDaysSinceEaster >= 56 && precedingSunday < advent) {
        const weeksSinceTrinity = Math.floor((sundayDaysSinceEaster - 56) / 7) + 1;
        if (weeksSinceTrinity === 1) weekName = "Trinity-Sunday";
        else {
            const num = weeksSinceTrinity - 1;
            const sfx = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
            // Check if this is Sunday next before Advent
            const sunNextAdv = new Date(advent);
            sunNextAdv.setDate(sunNextAdv.getDate() - 7);
            if (precedingSunday.getTime() >= sunNextAdv.getTime()) {
                weekName = "The Sunday next before Advent";
            } else {
                weekName = `The ${num}${sfx} Sunday after Trinity`;
            }
        }
    }

    if (sundayDaysSinceEaster === 35 && daysSinceEaster >= 39) {
        weekName = "Ascension-Day";
    }
    if (sundayDaysSinceEaster === 42) {
        weekName = "Sunday after Ascension-Day";
    }

    return { week: weekName, feast: feastName };
}

function findCollect(feast?: string, week?: string): string {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const collectsMap = collects as Record<string, string>;

    if (feast) {
        if (collectsMap[feast]) return collectsMap[feast];
        const normFeast = normalize(feast);
        for (const [k, v] of Object.entries(collectsMap)) {
            if (normalize(k) === normFeast || normalize(k).includes(normFeast) || normFeast.includes(normalize(k))) {
                return v;
            }
        }
    }

    if (week) {
        if (collectsMap[week]) return collectsMap[week];
        const normWeek = normalize(week);
        for (const [k, v] of Object.entries(collectsMap)) {
            if (normalize(k) === normWeek) return v;
        }
        for (const [k, v] of Object.entries(collectsMap)) {
            if (normalize(k).includes(normWeek) || normWeek.includes(normalize(k))) {
                return v;
            }
        }
    }

    return collectsMap["The 1st Sunday in Advent"] || "";
}

export interface DailyReadings {
    psalms: string;
    firstLesson: string;
    firstLessonAlt?: string;
    secondLesson: string;
    secondLessonAlt?: string;
    collect: string;
    liturgicalWeek: string;
    feastName?: string;
    dayTitle?: string;
    commemoration?: string;
}

export function getReadingsForDate(date: Date, office: 'morning' | 'evening'): DailyReadings {
    let day = date.getDate();
    // 1662 rules: if 31st, read day 30 again
    if (day === 31) day = 30;

    const psalmDay = day === 31 ? 30 : day;
    const psalms = office === 'morning' ? psalmsByDay[psalmDay - 1].m : psalmsByDay[psalmDay - 1].e;

    // Retrieve from 1922 Revised Tables of Lessons
    const entry = get1922LessonEntry(date);
    const officeLessons = entry[office] || { first: '', firstAlt: '', second: '', secondAlt: '' };

    const lit = getLiturgicalWeek(date);
    const commemoration = entry.commemoration || (entry.source === 'holyDay' ? lit.feast : undefined);
    const feast = commemoration || lit.feast;
    const collectText = findCollect(feast, lit.week);

    return {
        psalms: `${psalms.includes("-") || psalms.includes(",") ? "Psalms" : "Psalm"} ${psalms}`,
        firstLesson: officeLessons.first,
        firstLessonAlt: officeLessons.firstAlt || undefined,
        secondLesson: officeLessons.second,
        secondLessonAlt: officeLessons.secondAlt || undefined,
        collect: collectText,
        liturgicalWeek: lit.week,
        feastName: feast,
        dayTitle: entry.dayTitle,
        commemoration: commemoration && commemoration !== entry.dayTitle ? commemoration : undefined
    };
}
