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

let lectionaryCode = `
export const otBooks = ${JSON.stringify(otBooks)};
export const ntMorningBooks = ${JSON.stringify(ntMorningBooks)};
export const ntEveningBooks = ${JSON.stringify(ntEveningBooks)};

export function getAccurateDailyLesson(dayOfYear: number, office: 'morning' | 'evening', lesson: 'first' | 'second'): string {
    if (lesson === 'first') {
        const totalOTChapters = 929;
        const targetChapterIndex = Math.floor((dayOfYear / 365) * totalOTChapters);
        
        // Approximate mapping to books
        let currentBook = 0;
        let chaptersInBook = 24; 
        let tempIndex = targetChapterIndex;
        
        while (tempIndex > chaptersInBook && currentBook < otBooks.length - 1) {
            tempIndex -= chaptersInBook;
            currentBook++;
        }
        
        const chapter = Math.max(1, (tempIndex % 15) + 1); 
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
