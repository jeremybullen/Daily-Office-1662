const fs = require('fs');
const path = require('path');

function cleanText(t) {
  if (!t) return '';
  return t.replace(/<[^>]+>/g, ' ').replace(/&#160;/g, ' ').replace(/\s+/g, ' ').trim();
}

const canonBooks = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah',
  'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation',
  // Apocrypha
  'Sirach', 'Wisdom', 'Baruch', 'Tobit', 'Judith', '1 Maccabees', '2 Maccabees',
  'Prayer of Manasses', '1 Esdras', '2 Esdras'
];

function getBookFromPassage(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  for (const b of canonBooks) {
    if (s.startsWith(b.toLowerCase() + ' ') || s === b.toLowerCase()) return b;
  }
  return null;
}

const abbreviationMap = [
  [/^1\s*thess(\.|\b)\s*/i, '1 Thessalonians '],
  [/^2\s*thess(\.|\b)\s*/i, '2 Thessalonians '],
  [/^1\s*cor(\.|\b)\s*/i, '1 Corinthians '],
  [/^2\s*cor(\.|\b)\s*/i, '2 Corinthians '],
  [/^1\s*tim(\.|\b)\s*/i, '1 Timothy '],
  [/^2\s*tim(\.|\b)\s*/i, '2 Timothy '],
  [/^1\s*pet(\.|\b)\s*/i, '1 Peter '],
  [/^2\s*pet(\.|\b)\s*/i, '2 Peter '],
  [/^1\s*jn(\.|\b)\s*/i, '1 John '],
  [/^2\s*jn(\.|\b)\s*/i, '2 John '],
  [/^3\s*jn(\.|\b)\s*/i, '3 John '],
  [/^1\s*macc(\.|\b)\s*/i, '1 Maccabees '],
  [/^2\s*macc(\.|\b)\s*/i, '2 Maccabees '],
  [/^1\s*sam(\.|\b)\s*/i, '1 Samuel '],
  [/^2\s*sam(\.|\b)\s*/i, '2 Samuel '],
  [/^1\s*chron(\.|\b)\s*/i, '1 Chronicles '],
  [/^2\s*chron(\.|\b)\s*/i, '2 Chronicles '],
  [/^gen(\.|\b)\s*/i, 'Genesis '],
  [/^exod?(\.|\b)\s*/i, 'Exodus '],
  [/^lev(\.|\b)\s*/i, 'Leviticus '],
  [/^num(\.|\b)\s*/i, 'Numbers '],
  [/^deut(\.|\b)\s*/i, 'Deuteronomy '],
  [/^josh(\.|\b)\s*/i, 'Joshua '],
  [/^judg(\.|\b)\s*/i, 'Judges '],
  [/^neh(\.|\b)\s*/i, 'Nehemiah '],
  [/^esth(\.|\b)\s*/i, 'Esther '],
  [/^prov(\.|\b)\s*/i, 'Proverbs '],
  [/^eccles(\.|\b)\s*/i, 'Ecclesiastes '],
  [/^ecclus(\.|\b)\s*/i, 'Sirach '],
  [/^wisd(\.|\b)\s*/i, 'Wisdom '],
  [/^isa(\.|\b)\s*/i, 'Isaiah '],
  [/^jer(\.|\b)\s*/i, 'Jeremiah '],
  [/^lam(\.|\b)\s*/i, 'Lamentations '],
  [/^ezek(\.|\b)\s*/i, 'Ezekiel '],
  [/^dan(\.|\b)\s*/i, 'Daniel '],
  [/^hos(\.|\b)\s*/i, 'Hosea '],
  [/^hab(\.|\b)\s*/i, 'Habakkuk '],
  [/^zeph(\.|\b)\s*/i, 'Zephaniah '],
  [/^hag(\.|\b)\s*/i, 'Haggai '],
  [/^zech(\.|\b)\s*/i, 'Zechariah '],
  [/^mal(\.|\b)\s*/i, 'Malachi '],
  [/^matt?(\.|\b)\s*/i, 'Matthew '],
  [/^mk(\.|\b)\s*/i, 'Mark '],
  [/^lk(\.|\b)\s*/i, 'Luke '],
  [/^jn(\.|\b)\s*/i, 'John '],
  [/^rom(\.|\b)\s*/i, 'Romans '],
  [/^gal(\.|\b)\s*/i, 'Galatians '],
  [/^eph(\.|\b)\s*/i, 'Ephesians '],
  [/^phil(\.|\b)\s*/i, 'Philippians '],
  [/^col(\.|\b)\s*/i, 'Colossians '],
  [/^heb(\.|\b)\s*/i, 'Hebrews '],
  [/^rev(\.|\b)\s*/i, 'Revelation ']
];

function normalizePassage(p) {
  if (!p) return '';
  let str = p.trim();
  str = str.replace(/:999/g, '-end');
  str = str.replace(/-999/g, '-end');
  str = str.replace(/;\s*/g, ' & ');
  
  // If already starts with a recognized canon book, don't apply abbreviation replacement
  const existingBook = getBookFromPassage(str);
  if (!existingBook) {
    for (const [pattern, repl] of abbreviationMap) {
      if (pattern.test(str)) {
        str = str.replace(pattern, repl);
        break;
      }
    }
  }
  
  // Clean dots like 14.20 -> 14:20
  str = str.replace(/(\d+)\.(\d+)/g, '$1:$2');
  return str.trim();
}

function parseCell(td, lastBook) {
  if (!td) return { passage: '', alt: '', activeBook: lastBook };
  
  const links = [];
  const linkRegex = /href\s*=\s*\"[^\"]*search=([^\"]+)\"/gi;
  let m;
  while ((m = linkRegex.exec(td)) !== null) {
    let p = decodeURIComponent(m[1].replace(/\+/g, ' '));
    links.push(normalizePassage(p));
  }
  
  const apoRegex = /href\s*=\s*\"[^\"]*apocrypha\/[^\"]*\">([^<]+)<\/A>/gi;
  let am;
  while ((am = apoRegex.exec(td)) !== null) {
    links.push(normalizePassage(am[1]));
  }
  
  let rawText = normalizePassage(cleanText(td));
  let passage = links[0] || rawText;
  let alt = links.slice(1).join(' or ');
  
  if (!links[0] && rawText.includes(' or ')) {
    const parts = rawText.split(' or ');
    passage = parts[0].trim();
    alt = parts.slice(1).join(' or ').trim();
  }
  
  let book = getBookFromPassage(passage);
  if (book) {
    lastBook = book;
  } else if (lastBook && /^\d/.test(passage)) {
    passage = `${lastBook} ${passage}`;
  }
  
  if (alt && /^\d/.test(alt) && lastBook) {
    alt = `${lastBook} ${alt}`;
  }
  
  return {
    passage,
    alt,
    activeBook: lastBook
  };
}

function parseStandardTable(filename) {
  const content = fs.readFileSync(path.join(__dirname, '../cal_1922', filename), 'utf8');
  const rows = content.split(/<TR[^>]*VALIGN\s*=\s*TOP[^>]*>/i);
  const list = [];
  
  let m1Book = null;
  let m2Book = null;
  let e1Book = null;
  let e2Book = null;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(/<\/TR>/i)[0];
    const tdList = row.split(/<\/TD>/i);
    if (tdList.length < 5) continue;
    
    const dayName = cleanText(tdList[0]);
    const m1 = parseCell(tdList[1], m1Book);
    const m2 = parseCell(tdList[2], m2Book);
    const e1 = parseCell(tdList[3], e1Book);
    const e2 = parseCell(tdList[4], e2Book);
    
    m1Book = m1.activeBook;
    m2Book = m2.activeBook;
    e1Book = e1.activeBook;
    e2Book = e2.activeBook;
    
    list.push({
      dayName,
      morning: { first: m1.passage, firstAlt: m1.alt, second: m2.passage, secondAlt: m2.alt },
      evening: { first: e1.passage, firstAlt: e1.alt, second: e2.passage, secondAlt: e2.alt }
    });
  }
  return list;
}

// 1. Advent
const adventRows = parseStandardTable('advent.html');
const advent = {
  advent1: {
    sunday: adventRows[0], monday: adventRows[1], tuesday: adventRows[2],
    wednesday: adventRows[3], thursday: adventRows[4], friday: adventRows[5], saturday: adventRows[6]
  },
  advent2: {
    sunday: adventRows[7], monday: adventRows[8], tuesday: adventRows[9],
    wednesday: adventRows[10], thursday: adventRows[11], friday: adventRows[12], saturday: adventRows[13]
  },
  advent3: {
    sunday: adventRows[14], monday: adventRows[15], tuesday: adventRows[16],
    wednesday: adventRows[17], thursday: adventRows[18], friday: adventRows[19], saturday: adventRows[20]
  },
  advent4: {
    sunday: adventRows[21], monday: adventRows[22], tuesday: adventRows[23],
    wednesday: adventRows[24], thursday: adventRows[25], friday: adventRows[26], saturday: adventRows[27]
  }
};

// 2. Christmas
const xmasRows = parseStandardTable('xmas.html');
const xmas = {
  fixed: {
    '12-24': xmasRows[0],
    '12-25': xmasRows[1],
    '12-26': xmasRows[2],
    '12-27': xmasRows[3],
    '12-28': xmasRows[4],
    '12-29': xmasRows[6],
    '12-30': xmasRows[7],
    '12-31': xmasRows[8],
    '01-01': xmasRows[9],
    '01-02': xmasRows[11],
    '01-03': xmasRows[12],
    '01-04': xmasRows[13],
    '01-05': xmasRows[14],
  },
  sundayAfterChristmas: xmasRows[5],
  secondSundayAfterChristmas: xmasRows[10]
};

// 3. Epiphany
const epiphanyRows = parseStandardTable('epiphany.html');
const epiphany = {
  fixedEpiphany: epiphanyRows[0],
  weekOfEpiphany: {
    monday: epiphanyRows[1], tuesday: epiphanyRows[2], wednesday: epiphanyRows[3],
    thursday: epiphanyRows[4], friday: epiphanyRows[5], saturday: epiphanyRows[6]
  }
};
for (let w = 1; w <= 6; w++) {
  const base = 7 + (w - 1) * 7;
  epiphany[`epiphany${w}`] = {
    sunday: epiphanyRows[base], monday: epiphanyRows[base + 1], tuesday: epiphanyRows[base + 2],
    wednesday: epiphanyRows[base + 3], thursday: epiphanyRows[base + 4], friday: epiphanyRows[base + 5], saturday: epiphanyRows[base + 6]
  };
}

// 4. Lent
const lentRows = parseStandardTable('lent.html');
const lent = {
  septuagesima: {
    sunday: lentRows[0], monday: lentRows[1], tuesday: lentRows[2],
    wednesday: lentRows[3], thursday: lentRows[4], friday: lentRows[5], saturday: lentRows[6]
  },
  sexagesima: {
    sunday: lentRows[7], monday: lentRows[8], tuesday: lentRows[9],
    wednesday: lentRows[10], thursday: lentRows[11], friday: lentRows[12], saturday: lentRows[13]
  },
  quinquagesima: {
    sunday: lentRows[14], monday: lentRows[15], tuesday: lentRows[16]
  },
  ashWednesday: {
    wednesday: lentRows[17], thursday: lentRows[18], friday: lentRows[19], saturday: lentRows[20]
  }
};
for (let w = 1; w <= 5; w++) {
  const base = 21 + (w - 1) * 7;
  lent[`lent${w}`] = {
    sunday: lentRows[base], monday: lentRows[base + 1], tuesday: lentRows[base + 2],
    wednesday: lentRows[base + 3], thursday: lentRows[base + 4], friday: lentRows[base + 5], saturday: lentRows[base + 6]
  };
}

// 5. Easter
const easterRows = parseStandardTable('easter.html');
const easter = {
  holyWeek: {
    sunday: easterRows[0], monday: easterRows[1], tuesday: easterRows[2],
    wednesday: easterRows[3], thursday: easterRows[4], friday: easterRows[5], saturday: easterRows[6]
  },
  easterWeek: {
    sunday: easterRows[7], monday: easterRows[8], tuesday: easterRows[9],
    wednesday: easterRows[10], thursday: easterRows[11], friday: easterRows[12], saturday: easterRows[13]
  },
  easter1: {
    sunday: easterRows[14], monday: easterRows[15], tuesday: easterRows[16],
    wednesday: easterRows[17], thursday: easterRows[18], friday: easterRows[19], saturday: easterRows[20]
  },
  easter2: {
    sunday: easterRows[21], monday: easterRows[22], tuesday: easterRows[23],
    wednesday: easterRows[24], thursday: easterRows[25], friday: easterRows[26], saturday: easterRows[27]
  },
  easter3: {
    sunday: easterRows[28], monday: easterRows[29], tuesday: easterRows[30],
    wednesday: easterRows[31], thursday: easterRows[32], friday: easterRows[33], saturday: easterRows[34]
  },
  easter4: {
    sunday: easterRows[35], monday: easterRows[36], tuesday: easterRows[37],
    wednesday: easterRows[38], thursday: easterRows[39], friday: easterRows[40], saturday: easterRows[41]
  },
  rogation: {
    sunday: easterRows[42], monday: easterRows[43], tuesday: easterRows[44], wednesday: easterRows[45]
  },
  ascension: {
    thursday: easterRows[46], friday: easterRows[47], saturday: easterRows[48]
  },
  sundayAfterAscension: {
    sunday: easterRows[49], monday: easterRows[50], tuesday: easterRows[51],
    wednesday: easterRows[52], thursday: easterRows[53], friday: easterRows[54], saturday: easterRows[55]
  },
  whitsunWeek: {
    sunday: easterRows[56], monday: easterRows[57], tuesday: easterRows[58],
    wednesday: easterRows[59], thursday: easterRows[60], friday: easterRows[61], saturday: easterRows[62]
  }
};

// 6. Trinity
const t1Rows = parseStandardTable('trinity1.html');
const t2Rows = parseStandardTable('trinity2.html');
const t3Rows = parseStandardTable('trinity3.html');
const t4Rows = parseStandardTable('trinity4.html');

const trinity = {
  trinitySunday: {
    sunday: t1Rows[0], monday: t1Rows[1], tuesday: t1Rows[2],
    wednesday: t1Rows[3], thursday: t1Rows[4], friday: t1Rows[5], saturday: t1Rows[6]
  }
};

for (let w = 1; w <= 6; w++) {
  const base = 7 + (w - 1) * 7;
  trinity[`trinity${w}`] = {
    sunday: t1Rows[base], monday: t1Rows[base + 1], tuesday: t1Rows[base + 2],
    wednesday: t1Rows[base + 3], thursday: t1Rows[base + 4], friday: t1Rows[base + 5], saturday: t1Rows[base + 6]
  };
}

for (let w = 7; w <= 13; w++) {
  const base = (w - 7) * 7;
  trinity[`trinity${w}`] = {
    sunday: t2Rows[base], monday: t2Rows[base + 1], tuesday: t2Rows[base + 2],
    wednesday: t2Rows[base + 3], thursday: t2Rows[base + 4], friday: t2Rows[base + 5], saturday: t2Rows[base + 6]
  };
}

for (let w = 14; w <= 20; w++) {
  const base = (w - 14) * 7;
  trinity[`trinity${w}`] = {
    sunday: t3Rows[base], monday: t3Rows[base + 1], tuesday: t3Rows[base + 2],
    wednesday: t3Rows[base + 3], thursday: t3Rows[base + 4], friday: t3Rows[base + 5], saturday: t3Rows[base + 6]
  };
}

for (let w = 21; w <= 26; w++) {
  const base = (w - 21) * 7;
  trinity[`trinity${w}`] = {
    sunday: t4Rows[base], monday: t4Rows[base + 1], tuesday: t4Rows[base + 2],
    wednesday: t4Rows[base + 3], thursday: t4Rows[base + 4], friday: t4Rows[base + 5], saturday: t4Rows[base + 6]
  };
}

trinity.sundayNextBeforeAdvent = {
  sunday: t4Rows[42], monday: t4Rows[43], tuesday: t4Rows[44],
  wednesday: t4Rows[45], thursday: t4Rows[46], friday: t4Rows[47], saturday: t4Rows[48]
};

// 7. Fixed Holy Days
const fixedContent = fs.readFileSync(path.join(__dirname, '../cal_1922/fixed.html'), 'utf8');
const fixedRows = fixedContent.split('<TR VALIGN = TOP>');
const holyDays = {};

const monthMap = {
  'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
  'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
};

function parseFixedCol(td) {
  if (!td) return { first: '', second: '' };
  const lines = td.split(/<BR\s*\/?>/i);
  let l1 = '', l2 = '';
  for (const line of lines) {
    const text = cleanText(line);
    const links = [];
    const linkRegex = /href\s*=\s*\"[^\"]*search=([^\"]+)\"/gi;
    let m;
    while ((m = linkRegex.exec(line)) !== null) {
      links.push(normalizePassage(decodeURIComponent(m[1].replace(/\+/g, ' '))));
    }
    const apoRegex = /href\s*=\s*\"[^\"]*apocrypha\/[^\"]*\">([^<]+)<\/A>/gi;
    let am;
    while ((am = apoRegex.exec(line)) !== null) {
      links.push(normalizePassage(am[1]));
    }
    const val = links[0] || normalizePassage(text.replace(/^[12]\)\s*/, ''));
    if (text.startsWith('1)')) l1 = val;
    else if (text.startsWith('2)')) l2 = val;
    else if (!l1) l1 = val;
    else l2 = val;
  }
  return { first: l1, second: l2 };
}

for (let i = 1; i < fixedRows.length; i++) {
  const row = fixedRows[i].split(/<\/TR>/i)[0];
  const tdList = row.split(/<\/TD>/i);
  if (tdList.length >= 4) {
    const nameStr = cleanText(tdList[0]);
    const m = nameStr.match(/([a-zA-Z]+)\s+(\d+)$/);
    if (m) {
      const mon = monthMap[m[1].toLowerCase()];
      const day = m[2].padStart(2, '0');
      const dateKey = `${mon}-${day}`;
      const title = nameStr.replace(/([a-zA-Z]+)\s+(\d+)$/, '').trim();
      const firstEve = parseFixedCol(tdList[1]);
      const mattins = parseFixedCol(tdList[2]);
      const secondEve = parseFixedCol(tdList[3]);
      holyDays[dateKey] = {
        title,
        firstEve,
        mattins,
        secondEve
      };
    }
  }
}

const lectionary1922 = {
  advent,
  xmas,
  epiphany,
  lent,
  easter,
  trinity,
  holyDays
};

fs.writeFileSync(path.join(__dirname, '../src/data/revised1922Lectionary.json'), JSON.stringify(lectionary1922, null, 2));
console.log('Saved src/data/revised1922Lectionary.json successfully!');
