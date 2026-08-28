const fs = require('fs');

const otBooks = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah',
  'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
];

const ntMorningBooks = ['Matthew', 'Mark', 'Luke', 'John', 'Acts'];
const ntEveningBooks = ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'];

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// This script will output an approximation of the 1662 daily lectionary
// The 1662 BCP read the OT sequentially at Mattins and Evensong
// It read the NT sequentially: Mattins (Gospels + Acts), Evensong (Epistles)

let lectionaryCode = `
export interface DailyReadings {
    psalms: string;
    firstLesson: string;
    secondLesson: string;
    collect: string;
    liturgicalWeek: string;
}

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

const otBooks = ${JSON.stringify(otBooks)};
const ntMorningBooks = ${JSON.stringify(ntMorningBooks)};
const ntEveningBooks = ${JSON.stringify(ntEveningBooks)};

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getAccurateDailyLesson(dayOfYear: number, office: 'morning' | 'evening', lesson: 'first' | 'second'): string {
    // 1662 Daily Lectionary Mapping (simplified algorithm)
    // The 1662 read through the OT sequentially over the year, ~2 chapters a day (1 morning, 1 evening)
    if (lesson === 'first') {
        const totalOTChapters = 929;
        const targetChapterIndex = Math.floor((dayOfYear / 365) * totalOTChapters);
        
        // Approximate mapping to books
        let currentBook = 0;
        let chaptersInBook = 24; // very rough average
        let tempIndex = targetChapterIndex;
        
        while (tempIndex > chaptersInBook && currentBook < otBooks.length - 1) {
            tempIndex -= chaptersInBook;
            currentBook++;
        }
        
        const chapter = Math.max(1, (tempIndex % 15) + 1); // Mock chapter
        return otBooks[currentBook] + " " + chapter;
        
    } else {
        if (office === 'morning') {
            const bookIndex = Math.floor((dayOfYear / 365) * ntMorningBooks.length);
            const chapter = (dayOfYear % 20) + 1; 
            return ntMorningBooks[bookIndex] + " " + chapter;
        } else {
            const bookIndex = Math.floor((dayOfYear / 365) * ntEveningBooks.length);
            const chapter = (dayOfYear % 6) + 1; 
            return ntEveningBooks[bookIndex] + " " + chapter;
        }
    }
}
`;

fs.writeFileSync('src/utils/lectionaryData.ts', lectionaryCode);
console.log('Done');
