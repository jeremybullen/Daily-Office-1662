export interface Hymn {
    imageUrl: string | string[];
    extraVerses?: string[][];
}

export const hymns: Record<string, Hymn> = {
    lordsPrayer: {
        imageUrl: ['/hymns/Lord\'s Prayer 1.jpg', '/hymns/Lord\'s Prayer 2.JPG'],
        extraVerses: []
    },
    venite: {
        imageUrl: '',
        extraVerses: [
            ["2. The depths of earth are in his hand,", "Her secret wealth at his command;", "The strength of hills that reach the sky,", "Subjected to his empire lie."],
            ["3. The rolling ocean's vast abyss", "By the same sovereign right is his;", "'Tis moved by his almighty hand,", "That formed and fixed the solid land."],
            ["4. O let us to his courts repair,", "And bow with adoration there;", "Down on our knees devoutly all", "Before the Lord our Maker fall."]
        ]
    },
    teDeum: {
        imageUrl: '/hymns/Te Deum.png',
        extraVerses: []
    },
    benedicite: {
        imageUrl: '/hymns/Benedicte.JPG',
        extraVerses: []
    },
    jubilate: {
        imageUrl: '/hymns/Psalm 100.png',
        extraVerses: []
    },
    benedictus: {
        imageUrl: '/hymns/Benedictus.jpg',
        extraVerses: []
    },
    magnificat: {
        imageUrl: '/hymns/Song of Mary.png',
        extraVerses: []
    },
    cantate: {
        imageUrl: '/hymns/Psalm 98.png',
        extraVerses: []
    },
    nuncDimittis: {
        imageUrl: '/hymns/Nunc Dimittis.png',
        extraVerses: []
    },
    deusMisereatur: {
        imageUrl: '/hymns/Psalm 67.jpg',
        extraVerses: []
    }
};
