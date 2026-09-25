const bookMap: Record<string, number> = {
  "genesis": 1, "exodus": 2, "leviticus": 3, "numbers": 4, "deuteronomy": 5, "joshua": 6, "judges": 7, "ruth": 8,
  "1 samuel": 9, "2 samuel": 10, "1 kings": 11, "2 kings": 12, "1 chronicles": 13, "2 chronicles": 14,
  "ezra": 15, "nehemiah": 16, "esther": 17, "job": 18, "psalm": 19, "psalms": 19, "proverbs": 20,
  "ecclesiastes": 21, "song of solomon": 22, "isaiah": 23, "jeremiah": 24, "lamentations": 25, "ezekiel": 26,
  "daniel": 27, "hosea": 28, "joel": 29, "amos": 30, "obadiah": 31, "jonah": 32, "micah": 33, "nahum": 34,
  "habakkuk": 35, "zephaniah": 36, "haggai": 37, "zechariah": 38, "malachi": 39, "matthew": 40, "mark": 41,
  "luke": 42, "john": 43, "acts": 44, "romans": 45, "1 corinthians": 46, "2 corinthians": 47, "galatians": 48,
  "ephesians": 49, "philippians": 50, "colossians": 51, "1 thessalonians": 52, "2 thessalonians": 53,
  "1 timothy": 54, "2 timothy": 55, "titus": 56, "philemon": 57, "hebrews": 58, "james": 59, "1 peter": 60,
  "2 peter": 61, "1 john": 62, "2 john": 63, "3 john": 64, "jude": 65, "revelation": 66,
  // Apocrypha books (available on Bolls KJV)
  "1 esdras": 67, "tobit": 68, "judith": 69, "wisdom": 70, "wisdom of solomon": 70,
  "sirach": 71, "ecclesiasticus": 71, "baruch": 73, "1 maccabees": 74, "2 maccabees": 75,
  "prayer of manasseh": 76, "prayer of manasses": 76, "2 esdras": 77
};

// Helper to fetch a single query from bible-api.com
async function fetchFromBibleApi(query: string, trans: string) {
  let apiQuery = query.replace(/-end$/i, '');
  let startVerse: number | null = null;
  
  // If the query specifies a starting verse but no ending verse (e.g., "Ezekiel 3:15" or "1 John 4:7"), 
  // fetch the whole chapter and filter to the end.
  const singleVerseMatch = query.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+):(\d+)(?:-end)?$/i);
  if (singleVerseMatch) {
     apiQuery = `${singleVerseMatch[1]} ${singleVerseMatch[2]}`;
     startVerse = parseInt(singleVerseMatch[3]);
  }

  const response = await fetch(`https://bible-api.com/${encodeURIComponent(apiQuery)}?translation=${trans}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as any;
    throw new Error(err.error || `Bible API responded with ${response.status}`);
  }
  
  let data; try { data = await response.json() as any; } catch(e) { throw new Error("Invalid JSON from Bible API"); }
  
  if (data.verses) {
    let verses = data.verses;
    if (startVerse !== null) {
      verses = verses.filter((v: any) => v.verse >= startVerse);
    }
    return verses.map((v: any) => `<sup>${v.verse}</sup> ${v.text.replace(/\n+/g, " ").trim()}`).join(" ");
  }

  return data.text.replace(/\n+/g, " ").trim();
}

// Helper to fetch a single query from bolls.life
async function fetchFromBollsApi(query: string, trans: string) {
  let cleanQuery = query.replace(/-end$/i, '');
  
  // Check chapter span: Book 1:20-2:4
  const spanMatch = cleanQuery.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+):(\d+)-(\d+):(\d+)$/);
  if (spanMatch) {
    const bookName = spanMatch[1].trim().toLowerCase();
    const bookId = bookMap[bookName];
    if (!bookId) throw new Error(`Unknown book: ${bookName}`);
    
    const startChap = parseInt(spanMatch[2]);
    const startVerse = parseInt(spanMatch[3]);
    const endChap = parseInt(spanMatch[4]);
    const endVerse = parseInt(spanMatch[5]);
    
    let allText = [];
    for (let c = startChap; c <= endChap; c++) {
        const res = await fetch(`https://bolls.life/get-text/${trans.toUpperCase()}/${bookId}/${c}/`);
        if (!res.ok) throw new Error(`Bolls API responded with ${res.status}`);
        let data; try { data = await res.json() as any; } catch(e) { throw new Error("Invalid JSON from Bolls API"); }
        
        let filtered = data;
        if (c === startChap) {
            filtered = filtered.filter((v: any) => v.verse >= startVerse);
        }
        if (c === endChap) {
            filtered = filtered.filter((v: any) => v.verse <= endVerse);
        }
        allText.push(filtered.map((v: any) => `<sup>${v.verse}</sup> ${v.text.replace(/<[^>]+>/g, '').trim()}`).join(" "));
    }
    return allText.join(" ");
  }
  
  // Normal single chapter match
  const match = cleanQuery.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) throw new Error(`Could not parse passage for Bolls API: ${cleanQuery}`);
  
  const bookName = match[1].trim().toLowerCase();
  const bookId = bookMap[bookName];
  if (!bookId) throw new Error(`Unknown book: ${bookName}`);
  
  const chapter = parseInt(match[2]);
  const startVerse = match[3] ? parseInt(match[3]) : null;
  const endVerse = match[4] ? parseInt(match[4]) : null;
  
  const response = await fetch(`https://bolls.life/get-text/${trans.toUpperCase()}/${bookId}/${chapter}/`);
  if (!response.ok) throw new Error(`Bolls API responded with ${response.status}`);
  let data; try { data = await response.json() as any; } catch(e) { throw new Error("Invalid JSON from Bolls API"); }
  
  let filtered = data;
  if (startVerse !== null) {
    filtered = data.filter((v: any) => v.verse >= startVerse && (endVerse !== null ? v.verse <= endVerse : true));
  }
  
  return filtered.map((v: any) => `<sup>${v.verse}</sup> ${v.text.replace(/<[^>]+>/g, '').trim()}`).join(" ");
}

export async function fetchPassages(passage: string, translation: string = "ESV"): Promise<{ reference: string, text: string }[]> {
  if (!passage || typeof passage !== "string") {
    throw new Error("Missing passage.");
  }

  // Pre-normalize passage
  let cleanPassage = passage.trim();

  // If cross-chapter end like "Isaiah 52:13-53-end", expand to "Isaiah 52:13-end & Isaiah 53"
  const crossChapterEnd = cleanPassage.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+):(\d+)-(\d+)-end$/i);
  if (crossChapterEnd) {
    cleanPassage = `${crossChapterEnd[1]} ${crossChapterEnd[2]}:${crossChapterEnd[3]}-end & ${crossChapterEnd[1]} ${crossChapterEnd[4]}`;
  }

  // Process '&' split
  const subPassagesRaw = cleanPassage.split(/\s*&\s*/);
  let subPassages: string[] = [];
  let currentBook = "";
  for (let sub of subPassagesRaw) {
      const matchBook = sub.match(/^(\d?\s*[a-zA-Z\s]+?)\s+\d+/);
      if (matchBook) {
          currentBook = matchBook[1].trim();
          subPassages.push(sub.trim());
      } else {
          // Prepend current book
          subPassages.push(`${currentBook} ${sub.trim()}`);
      }
  }

  // Process Psalm ranges like "Psalm 1-5" into individual psalms
  let finalSubPassages: string[] = [];
  for (const sub of subPassages) {
      const match = sub.match(/^(.+?)\s+(\d+)-(\d+)$/);
      if (match && !sub.includes(':')) {
        const book = match[1].trim();
        const start = parseInt(match[2]);
        const end = parseInt(match[3]);
        if (book.toLowerCase().startsWith('psalm') && end > start && end - start <= 150) {
          for (let i = start; i <= end; i++) {
            finalSubPassages.push(`${book} ${i}`);
          }
        } else {
          finalSubPassages.push(sub);
        }
      } else {
        finalSubPassages.push(sub);
      }
  }

  // Fetch sub-passages
  let passages: { reference: string, text: string }[] = [];
  for (const sub of finalSubPassages) {
    let text = "";
    
    // Check if book is Apocrypha (bookId >= 67)
    const bookNameMatch = sub.match(/^(\d?\s*[a-zA-Z\s]+?)\s+\d+/);
    const bookName = bookNameMatch ? bookNameMatch[1].trim().toLowerCase() : "";
    const bookId = bookMap[bookName];
    const isApocrypha = bookId && bookId >= 67;

    const trans = translation.toString().toLowerCase();

    if (isApocrypha || trans === 'esv') {
      try {
        text = await fetchFromBollsApi(sub, isApocrypha ? 'kjv' : trans);
      } catch (err: any) {
        // Fallback
        text = await fetchFromBibleApi(sub, 'kjv');
      }
    } else {
      try {
        text = await fetchFromBibleApi(sub, trans);
      } catch (err: any) {
        // Fallback to Bolls KJV
        text = await fetchFromBollsApi(sub, 'kjv');
      }
    }
    passages.push({ reference: sub, text });
  }

  return passages;
}
