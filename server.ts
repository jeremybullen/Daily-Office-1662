import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch"; // we'll just use global fetch in Node 20+

const bookMap: Record<string, number> = {
  "genesis": 1, "exodus": 2, "leviticus": 3, "numbers": 4, "deuteronomy": 5, "joshua": 6, "judges": 7, "ruth": 8, "1 samuel": 9, "2 samuel": 10, "1 kings": 11, "2 kings": 12, "1 chronicles": 13, "2 chronicles": 14, "ezra": 15, "nehemiah": 16, "esther": 17, "job": 18, "psalm": 19, "psalms": 19, "proverbs": 20, "ecclesiastes": 21, "song of solomon": 22, "isaiah": 23, "jeremiah": 24, "lamentations": 25, "ezekiel": 26, "daniel": 27, "hosea": 28, "joel": 29, "amos": 30, "obadiah": 31, "jonah": 32, "micah": 33, "nahum": 34, "habakkuk": 35, "zephaniah": 36, "haggai": 37, "zechariah": 38, "malachi": 39, "matthew": 40, "mark": 41, "luke": 42, "john": 43, "acts": 44, "romans": 45, "1 corinthians": 46, "2 corinthians": 47, "galatians": 48, "ephesians": 49, "philippians": 50, "colossians": 51, "1 thessalonians": 52, "2 thessalonians": 53, "1 timothy": 54, "2 timothy": 55, "titus": 56, "philemon": 57, "hebrews": 58, "james": 59, "1 peter": 60, "2 peter": 61, "1 john": 62, "2 john": 63, "3 john": 64, "jude": 65, "revelation": 66
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // Helper to fetch a single query from bible-api.com
  async function fetchFromBibleApi(query: string, trans: string) {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=${trans}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as any;
      throw new Error(err.error || `Bible API responded with ${response.status}`);
    }
    const data = await response.json() as any;
    if (data.verses) {
      return data.verses.map((v: any) => `<sup>${v.verse}</sup> ${v.text.replace(/\n+/g, " ").trim()}`).join(" ");
    }
    return data.text.replace(/\n+/g, " ").trim();
  }

  // Helper to fetch a single query from bolls.life
    async function fetchFromBollsApi(query: string, trans: string) {
    // Check chapter span: Book 1:20-2:4
    const spanMatch = query.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+):(\d+)-(\d+):(\d+)$/);
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
          const data = await res.json() as any;
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
    const match = query.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    if (!match) throw new Error(`Could not parse passage for Bolls API: ${query}`);
    
    const bookName = match[1].trim().toLowerCase();
    const bookId = bookMap[bookName];
    if (!bookId) throw new Error(`Unknown book: ${bookName}`);
    
    const chapter = parseInt(match[2]);
    const startVerse = match[3] ? parseInt(match[3]) : null;
    const endVerse = match[4] ? parseInt(match[4]) : (startVerse !== null ? startVerse : null);
    
    const response = await fetch(`https://bolls.life/get-text/${trans.toUpperCase()}/${bookId}/${chapter}/`);
    if (!response.ok) throw new Error(`Bolls API responded with ${response.status}`);
    const data = await response.json() as any;
    
    let filtered = data;
    if (startVerse !== null && endVerse !== null) {
      filtered = data.filter((v: any) => v.verse >= startVerse && v.verse <= endVerse);
    }
    
    return filtered.map((v: any) => `<sup>${v.verse}</sup> ${v.text.replace(/<[^>]+>/g, '').trim()}`).join(" ");
  }

  // API Route for Bible Readings
  app.get("/api/bible", async (req, res) => {
    try {
      const { passage, translation = "KJV" } = req.query;
      
      if (!passage || typeof passage !== "string") {
        return res.status(400).json({ error: "Missing passage query parameter." });
      }

      const trans = translation.toString().toLowerCase();

      // Parse passage for multiple chapters (e.g., "Psalm 1-5")
      // bible-api.com only allows fetching one whole chapter at a time.

      // Process '&' split
      const subPassagesRaw = passage.split(/\s*&\s*/);
      let subPassages: string[] = [];
      let currentBook = "";
      for (let sub of subPassagesRaw) {
          const matchBook = sub.match(/^(\d?\s*[a-zA-Z\s]+?)\s+\d+/);
          if (matchBook) {
              currentBook = matchBook[1];
              subPassages.push(sub);
          } else {
              // It's just a chapter number or chapter:verse, prepend book
              subPassages.push(currentBook + " " + sub);
          }
      }

      // Then for each subPassage, we can still have things like "Psalm 1-5" which need splitting
      let finalSubPassages: string[] = [];
      for (const sub of subPassages) {
          const match = sub.match(/^(.+?)\s+(\d+)-(\d+)$/);
          if (match && !sub.includes(':')) {
            const book = match[1];
            const start = parseInt(match[2]);
            const end = parseInt(match[3]);
            if (end > start && end - start <= 150) {
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

      // Fetch all sub-passages sequentially to avoid rate limiting
      let passages: { reference: string, text: string }[] = [];
      for (const sub of finalSubPassages) {
        let text = "";
        if (trans === 'esv') {
          text = await fetchFromBollsApi(sub, trans);
        } else {
          text = await fetchFromBibleApi(sub, trans);
        }
        passages.push({ reference: sub, text });
      }

      return res.json({ passages });

    } catch (error: any) {
      console.error("Bible Fetch Error:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch passage." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving of static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
